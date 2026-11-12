// 2026-10-23 新增：读取用户的数据使用同意记录。本机优先，本机没有时查云端 user_consents。
// 退出登录会清掉本机存档，重新登录后本机没有同意记录，但云端有——此时不应让用户再同意一遍，
// 也不能把用户当初拒绝的拍照授权当成“默认允许”。
// 2026-11-12：
//   · 增加 'error' 状态（云端读取失败）：页面守卫遇到它放行，不因为一次网络问题把用户赶去同意页；
//   · 返回两项可选授权的当前值，供「我的档案」显示与修改；
//   · 云端结果按账号在本次打开网站期间缓存，切换页面不重复请求；修改后用 rememberConsent 更新。
import { useEffect, useState } from 'react'
import { consentAPI } from '../utils/api'
import { userScopedKey } from '../utils/userStorage'
import type { AuthUser } from './useAuth'

export type ConsentRecordState =
  | { status: 'loading' }
  | { status: 'none' }
  | { status: 'error' }
  | { status: 'found'; photoConsent: boolean; researchDataConsent: boolean }

const serverCache = new Map<string, ConsentRecordState>()
const listeners = new Set<() => void>()

function readLocal(user: AuthUser | null): ConsentRecordState | null {
  try {
    const raw = localStorage.getItem(userScopedKey('aiffd_consent', user))
    if (!raw) return null
    const c = JSON.parse(raw)
    return { status: 'found', photoConsent: c?.photoConsent !== false, researchDataConsent: c?.researchDataConsent === true }
  } catch {
    return null
  }
}

// 用户在本页面改了授权后调用：更新本机存档和缓存，并通知其他正在使用这个 hook 的组件
export function rememberConsent(user: AuthUser | null, record: Record<string, unknown>) {
  try { localStorage.setItem(userScopedKey('aiffd_consent', user), JSON.stringify(record)) } catch { /* 忽略 */ }
  if (user?.id) serverCache.delete(String(user.id))
  listeners.forEach(fn => fn())
}

export function useConsentRecord(user: AuthUser | null): ConsentRecordState {
  const initial = (): ConsentRecordState =>
    readLocal(user) ?? (user?.id ? serverCache.get(String(user.id)) ?? { status: 'loading' } : { status: 'none' })
  const [state, setState] = useState<ConsentRecordState>(initial)
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const fn = () => setTick(t => t + 1)
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  }, [])
  useEffect(() => {
    const local = readLocal(user)
    if (local) { setState(local); return }
    if (!user?.id) { setState({ status: 'none' }); return }
    const key = String(user.id)
    const cached = serverCache.get(key)
    if (cached) { setState(cached); return }
    setState({ status: 'loading' })
    let cancelled = false
    consentAPI.getMe()
      .then(res => {
        const c = res.data?.consent
        const next: ConsentRecordState = c
          ? { status: 'found', photoConsent: c.photoConsent !== false, researchDataConsent: c.researchDataConsent === true }
          : { status: 'none' }
        serverCache.set(key, next)
        if (!cancelled) setState(next)
      })
      .catch(err => { console.error('[consent] 读取云端同意记录失败', err); if (!cancelled) setState({ status: 'error' }) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, tick])
  return state
}
