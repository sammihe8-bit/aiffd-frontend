// 2026-10-16 新增：把各测试的结果换算成 Human Profile DB 的 PATCH 字段。
// 测试页（测完时写入）和 profileSync.ts（登录后补传历史结果）共用这一份换算，
// 避免同一套字段映射在两处各写一份、以后改一处忘了另一处。

import { STYLE_OPTIONS, NO_FIXED_STYLE, NO_REJECTED_STYLE } from './fashionStyleOptions'
import { toProfileSeason, isValidFinalSeason25 } from './colorProfile'

export type ProfilePatch = Record<string, unknown>

// ── 体型 ─────────────────────────────────────────────────────────
// 输入是 BodyTestPage 的答题快照（同一份快照也存在后端 test-progress 的 body 记录里）。
// bodyShape / fleshTexture / hipProtrude / chestProtrude 取用户原始单选值（数组第 0 项），
// 不用 aiffd_body_result 里叠加了体格提示码的增强版本——后端这几个字段是严格枚举。
// 肩线走向用正式字段名 shoulderLineDirection（旧名 boneWidth 已于 2026-09-21 改名）。
export interface BodyAnswers {
  heightRange?: string; boneScale?: string; boneRoundness?: string; boneWidth?: string
  shoulderShape?: string[]; waistType?: string[]; waistLength?: string; limbLength?: string
  handFootSize?: string; bodyShape?: string[]; fleshTexture?: string[]
  hipProtrude?: string[]; chestProtrude?: string[]
}

export function buildBodyPatch(a: BodyAnswers): ProfilePatch {
  const patch: ProfilePatch = {}
  if (a.heightRange) patch.heightRange = a.heightRange
  if (a.boneScale) patch.boneScale = a.boneScale
  if (a.boneRoundness) patch.boneRoundness = a.boneRoundness
  if (a.boneWidth) patch.shoulderLineDirection = a.boneWidth
  if (a.shoulderShape?.[0]) patch.shoulderShape = a.shoulderShape[0]
  if (a.waistType?.length) patch.waistType = a.waistType
  if (a.waistLength) patch.waistLength = a.waistLength
  if (a.limbLength) patch.limbLength = a.limbLength
  if (a.handFootSize) patch.handFootSize = a.handFootSize
  if (a.bodyShape?.[0]) patch.bodyShape = a.bodyShape[0]
  if (a.fleshTexture?.[0]) patch.fleshTexture = a.fleshTexture[0]
  if (a.hipProtrude?.[0]) patch.hipProtrude = a.hipProtrude[0]
  if (a.chestProtrude?.[0]) patch.chestProtrude = a.chestProtrude[0]
  return patch
}

// ── 气血（整体风格复核 4 题）─────────────────────────────────────
// 2026-10-16 产品确认为正式档案维度：五态结果 + 4 题原始答案一起写
const QIXUE_STATES = ['阴', '阴多阳少', '阴阳和谐', '阴少阳多', '阳']

export function buildQixuePatch(state: string, q1: string, q2: string, q3: string, q4: string): ProfilePatch | null {
  const all = [state, q1, q2, q3, q4]
  if (!all.every(v => QIXUE_STATES.includes(v))) return null
  return { qixueState: state, qixueAnswers: { q1, q2, q3, q4 } }
}

// ── 个人时尚选择（Preference Fit）──────────────────────────────────
// "没有固定风格""没有特别排斥的"是前端哨兵值，不写进标签数组
export function buildFashionPatch(
  q1Selected: string[], q1Primary: string | null, q2Selected: string[], q3Selected: string[],
  gap: 'stable' | 'gap' | 'no_fixed_style',
): ProfilePatch {
  const tagIds = new Set<string>(STYLE_OPTIONS.map(o => o.id))
  const onlyTags = (ids: string[]) => ids.filter(id => tagIds.has(id))
  const noFixed = q2Selected.includes(NO_FIXED_STYLE)
  const noRejected = q3Selected.includes(NO_REJECTED_STYLE)
  return {
    aspiredImageTags: onlyTags(q1Selected),
    aspiredImageTagFavorite: q1Primary && q1Selected.includes(q1Primary) ? q1Primary : null,
    currentImageTags: noFixed ? [] : onlyTags(q2Selected),
    currentImageStatus: noFixed ? 'no_fixed_style' : 'selected',
    rejectedImageTags: noRejected ? [] : onlyTags(q3Selected),
    currentAspiredStyleGap: gap,
  }
}

// ── 色彩（冷暖 / 五季 / 五行副气）──────────────────────────────────
// 只用于补传：输入是本机存档的原始值，调用方须先确认冷暖来自问卷（warmCoolIsFromQuestionnaire）
const WARM_COOL = ['warm', 'cool', 'neutral_warm', 'neutral_cool', 'olive', 'uncertain']
const ELEMENTS = ['木', '火', '土', '金', '水']

export function buildColorPatch(warmCool: string | null, seasonResult: string | null,
  elementName: string | null, finalSeason25: string | null): ProfilePatch {
  const patch: ProfilePatch = {}
  if (warmCool && WARM_COOL.includes(warmCool)) patch.warmCool = warmCool
  const season = toProfileSeason(seasonResult)
  if (!season) return patch
  Object.assign(patch, season)
  // 副气与 25 型必须和季型是同一次测试的结果：25 型 = 季名 + 副气
  if (elementName && ELEMENTS.includes(elementName) && isValidFinalSeason25(finalSeason25)
      && finalSeason25 === `${season.seasonName}${elementName}`) {
    patch.elementName = elementName
    patch.finalSeason25 = finalSeason25
  }
  return patch
}
