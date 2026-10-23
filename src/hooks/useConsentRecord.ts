// 2026-10-23 新增：读取用户的数据使用同意记录。本机优先，本机没有时查云端 user_consents。
// 退出登录会清掉本机存档，重新登录后本机没有同意记录，但云端有——此时不应让用户再同意一遍，
// 也不能把用户当初拒绝的拍照授权当成“默认允许”。
import { useEffect, useState } from 'react'
import { consentAPI } from '../utils/api'
import { userScopedKey } from '../utils/userStorage'
import type { AuthUser } from './useAuth'

export type ConsentRecordState =
  | { status: 'loading' }
  | { status: 'none' }
  | { status: 'found'; photoConsent: boolean }

function readLocal(user: AuthUser | null): ConsentRecordState | null {
  try {
    const raw = localStorage.getItem(userScopedKey('aiffd_consent', user))
    if (!raw) return null
    const c = JSON.parse(raw)
    return { status: 'found', photoConsent: c?.photoConsent !== false }
  } catch {
    return null
  }
}

export function useConsentRecord(user: AuthUser | null): ConsentRecordState {
  const [state, setState] = useState<ConsentRecordState>(() => readLocal(user) ?? { status: user?.id ? 'loading' : 'none' })
  useEffect(() => {
    const local = readLocal(user)
    if (local) { setState(local); return }
    if (!user?.id) { setState({ status: 'none' }); return }
    setState({ status: 'loading' })
    let cancelled = false
    consentAPI.getMe()
      .then(res => {
        if (cancelled) return
        const c = res.data?.consent
        setState(c ? { status: 'found', photoConsent: c.photoConsent !== false } : { status: 'none' })
      })
      // 读不到云端时按“没有记录”处理：同意页会再出现一次，宁可多问一次，也不跳过同意
      .catch(err => { console.error('[consent] 读取云端同意记录失败', err); if (!cancelled) setState({ status: 'none' }) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])
  return state
}
