// 2026-10-16 新增：测试结果同步到 Human Profile DB 的统一入口。
//
// 之前各测试页写后端时都是 .catch(() => {})：失败了用户看不到，数据也就永远缺在后端
// （见数据中台文档审阅第 5 节）。现在统一走这里：
//   1. syncProfile：写入失败先自动重试一次；仍失败就把这次要写的内容放进本机待同步队列，
//      并广播 'profile-sync-failed' 事件，由 ProfileSyncNotice 提示用户。
//   2. backfillProfile：每次打开网站（每个浏览器会话一次）先补发待同步队列，
//      再把后端仍为空、但本机或后端测试存档里已有的历史结果补写进去（只填空字段，不覆盖）。
//   3. clearLegacyUnscopedKeys：删除不带用户 ID 的旧版本机存档（现有代码已不再读写这些 key）。

import { humanProfileAPI, testProgressAPI, consentAPI, type ChangeSource, type ConsentPayload } from './api'
import { SCOPED_STORAGE_KEYS, userScopedKey } from './userStorage'
import { warmCoolIsFromQuestionnaire } from './colorProfile'
import { buildBodyPatch, buildQixuePatch, buildFashionPatch, buildColorPatch, type ProfilePatch, type BodyAnswers } from './profilePatches'
import type { AuthUser } from '../hooks/useAuth'

export type StyleScoreRow = { styleCode: string; probability: number; isPrimary?: boolean; isSecondary?: boolean }

export type SyncOp =
  | { kind: 'patch'; patch: ProfilePatch; source: ChangeSource; reason?: string }
  | { kind: 'styleScores'; scores: StyleScoreRow[]; engineVersion?: string }
  | { kind: 'consent'; consent: ConsentPayload }

interface QueuedSync { label: string; op: SyncOp; failedAt: string }

export const PROFILE_SYNC_FAILED_EVENT = 'profile-sync-failed'

const queueKey = (user: AuthUser | null) => userScopedKey('aiffd_pending_profile_sync', user)
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

function run(op: SyncOp): Promise<unknown> {
  if (op.kind === 'patch') return humanProfileAPI.patchMe(op.patch, op.source, op.reason)
  if (op.kind === 'consent') return consentAPI.save(op.consent)
  return humanProfileAPI.saveStyleScores(op.scores, op.engineVersion)
}

// 4xx（除 408/429）是数据本身不合法，重试也不会成功；其余（断网、超时、5xx）值得重试
function isRetryable(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status
  if (status === undefined) return true
  return status >= 500 || status === 408 || status === 429
}

function readQueue(user: AuthUser | null): QueuedSync[] {
  try {
    const raw = localStorage.getItem(queueKey(user))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(user: AuthUser | null, queue: QueuedSync[]) {
  try {
    if (queue.length === 0) localStorage.removeItem(queueKey(user))
    else localStorage.setItem(queueKey(user), JSON.stringify(queue))
  } catch {
    // 本机存储写不进去（空间满等）就算了，不影响用户继续测试
  }
}

// 同一个 label 只保留最新一次，避免旧结果在补发时覆盖新结果
function enqueue(user: AuthUser | null, label: string, op: SyncOp) {
  const rest = readQueue(user).filter(q => q.label !== label)
  writeQueue(user, [...rest, { label, op, failedAt: new Date().toISOString() }])
}

function dequeue(user: AuthUser | null, label: string) {
  const queue = readQueue(user)
  if (queue.some(q => q.label === label)) writeQueue(user, queue.filter(q => q.label !== label))
}

// label 是给用户看的测试名称（如"体型测试"），同时用作待同步队列里的去重键
export async function syncProfile(user: AuthUser | null, label: string, op: SyncOp): Promise<boolean> {
  if (!user?.id) return false
  try {
    await run(op)
    dequeue(user, label)
    return true
  } catch (first) {
    let err = first
    if (isRetryable(first)) {
      await sleep(1500)
      try {
        await run(op)
        dequeue(user, label)
        return true
      } catch (second) {
        err = second
      }
    }
    console.error(`[profile-sync] ${label} 同步到云端档案失败`, err)
    // 数据本身不合法（4xx）时补发也不会成功，不进队列，只提示
    if (isRetryable(err)) enqueue(user, label, op)
    window.dispatchEvent(new CustomEvent(PROFILE_SYNC_FAILED_EVENT, {
      detail: { label, willRetry: isRetryable(err) },
    }))
    return false
  }
}

const BODY_FIELDS = ['heightRange', 'boneScale', 'boneRoundness', 'shoulderLineDirection', 'shoulderShape', 'waistType',
  'waistLength', 'limbLength', 'handFootSize', 'bodyShape', 'fleshTexture', 'hipProtrude', 'chestProtrude']

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : null
  } catch {
    return null
  }
}

const isEmpty = (v: unknown) => v === null || v === undefined || v === ''

// 只保留后端当前为空的字段：补传绝不覆盖后端已有的数据
function onlyEmptyFields(patch: ProfilePatch, profile: Record<string, unknown>): ProfilePatch {
  return Object.fromEntries(Object.entries(patch).filter(([k]) => isEmpty(profile[k])))
}

const sessionFlag = (user: AuthUser | null) => `aiffd_profile_backfill_done_${user?.id ?? 'guest'}`

export async function backfillProfile(user: AuthUser | null): Promise<void> {
  if (!user?.id) return
  try {
    if (sessionStorage.getItem(sessionFlag(user))) return
  } catch {
    // sessionStorage 不可用时照常执行，补传只填空字段，重复执行也安全
  }

  // 1. 先补发之前失败的写入
  for (const item of readQueue(user)) {
    try {
      await run(item.op)
      dequeue(user, item.label)
    } catch (err) {
      if (!isRetryable(err)) dequeue(user, item.label) // 数据不合法，留着也没用
      console.error(`[profile-sync] 补发 ${item.label} 失败`, err)
    }
  }

  // 2. 同意记录：服务端还没有任何记录、本机有完整的旧记录时，补传一次（标记为 local_backfill）
  await backfillConsent(user)

  // 3. 再补写历史结果（后端为空、本机或后端测试存档里有值）
  let profile: Record<string, unknown>
  try {
    const res = await humanProfileAPI.getMe()
    profile = res.data?.profile ?? {}
  } catch (err) {
    console.error('[profile-sync] 读取云端档案失败，本次跳过补传', err)
    return
  }

  const jobs: { label: string; source: ChangeSource; patch: ProfilePatch }[] = []

  // 体型：后端 test-progress 里有完整答题快照（体型测试每次完成都会存）
  if (BODY_FIELDS.every(f => isEmpty(profile[f]))) {
    try {
      const res = await testProgressAPI.get('body')
      const progress = res.data?.progress
      if (progress?.status === 'completed' && progress.data) {
        jobs.push({ label: '体型测试', source: 'body_test', patch: buildBodyPatch(progress.data as BodyAnswers) })
      }
    } catch {
      // 读不到存档就跳过体型，下次打开网站再试
    }
  }

  // 气血
  const qixue = readJson<{ qiXueState?: string; q1?: string; q2?: string; q3?: string; q4?: string }>(
    userScopedKey('aiffd_qixue_result', user))
  if (qixue) {
    const patch = buildQixuePatch(qixue.qiXueState ?? '', qixue.q1 ?? '', qixue.q2 ?? '', qixue.q3 ?? '', qixue.q4 ?? '')
    if (patch) jobs.push({ label: '整体风格复核', source: 'face_test', patch })
  }

  // 色彩：只有冷暖来自真实问卷时才写（AI 模拟结果不进数据库，规则同各色彩测试页）
  const warmCool = localStorage.getItem(userScopedKey('aiffd_warmcool', user))
  if (warmCoolIsFromQuestionnaire(localStorage.getItem(userScopedKey('aiffd_color_result', user)), warmCool)) {
    const patch = buildColorPatch(
      warmCool,
      localStorage.getItem(userScopedKey('aiffd_season_result', user)),
      localStorage.getItem(userScopedKey('aiffd_element_name', user)),
      localStorage.getItem(userScopedKey('aiffd_25season', user)),
    )
    // 后端已有不同的季型（比如在别的设备上重测过）时，本机的副气和 25 型属于另一次测试，不能拼进去
    if (!isEmpty(profile.seasonName) && profile.seasonName !== patch.seasonName) {
      delete patch.elementName
      delete patch.finalSeason25
    }
    jobs.push({ label: '色彩测试', source: 'color_test', patch })
  }

  // 个人时尚选择
  const fashion = readJson<{
    aspired_style_primary?: string; style_image_ids?: unknown; current_style?: unknown
    rejected_style_codes?: unknown; current_aspired_style_gap?: string
  }>(userScopedKey('aiffd_fashion_style', user))
  if (fashion && isEmpty(profile.aspiredImageTags)
      && Array.isArray(fashion.style_image_ids) && Array.isArray(fashion.current_style) && Array.isArray(fashion.rejected_style_codes)
      && ['stable', 'gap', 'no_fixed_style'].includes(fashion.current_aspired_style_gap ?? '')) {
    jobs.push({
      label: '个人时尚选择', source: 'fashion_preference_test',
      patch: buildFashionPatch(
        fashion.style_image_ids as string[], fashion.aspired_style_primary ?? '',
        fashion.current_style as string[], fashion.rejected_style_codes as string[],
        fashion.current_aspired_style_gap as 'stable' | 'gap' | 'no_fixed_style',
      ),
    })
  }

  let allDone = true
  for (const job of jobs) {
    const patch = onlyEmptyFields(job.patch, profile)
    if (Object.keys(patch).length === 0) continue
    try {
      await humanProfileAPI.patchMe(patch, job.source, '从本机补传历史测试结果')
    } catch (err) {
      if (isRetryable(err)) allDone = false
      console.error(`[profile-sync] 补传 ${job.label} 失败`, err)
    }
  }

  if (allDone) {
    try { sessionStorage.setItem(sessionFlag(user), '1') } catch { /* 忽略 */ }
  }
}

// 2026-10-18：同意记录此前只存在浏览器本机。补传时保留本机记录里的原始同意时间，
// 后端会把它标记为 local_backfill（浏览器自报，证据力弱于 Onboarding 直接写入），
// 且只在服务端还没有任何记录时接受，所以重复执行是安全的。
async function backfillConsent(user: AuthUser) {
  const local = readJson<{
    ageAndResearchAck?: unknown; privacyAck?: unknown; photoConsent?: unknown
    researchDataConsent?: unknown; policyVersion?: unknown; timestamp?: unknown
  }>(userScopedKey('aiffd_consent', user))
  if (!local) return
  const consentedAt = typeof local.timestamp === 'string' && !Number.isNaN(Date.parse(local.timestamp))
    ? new Date(local.timestamp).toISOString() : null
  // 本机记录不完整（缺必选授权或时间）就不补传，避免写入无法证明的同意
  if (local.ageAndResearchAck !== true || local.privacyAck !== true || !consentedAt
      || typeof local.policyVersion !== 'string' || !local.policyVersion) return
  try {
    const res = await consentAPI.getMe()
    if (res.data?.consent) return
    await consentAPI.save({
      ageAndResearchAck: true,
      privacyAck: true,
      photoConsent: local.photoConsent === true,
      researchDataConsent: local.researchDataConsent === true,
      policyVersion: local.policyVersion,
      source: 'local_backfill',
      consentedAt,
    })
  } catch (err) {
    console.error('[profile-sync] 补传同意记录失败', err)
  }
}

// 不带用户 ID 的旧版存档（如 aiffd_season_name）：现有代码已不再读写，留着只会和当前结果互相矛盾
export function clearLegacyUnscopedKeys(): void {
  try {
    SCOPED_STORAGE_KEYS.forEach(base => localStorage.removeItem(base))
  } catch {
    // 本机存储不可用时忽略
  }
}
