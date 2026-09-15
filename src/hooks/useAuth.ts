import { useState, useEffect } from 'react'
import { migrateGuestDataToUser } from '../utils/userStorage'

const TOKEN_KEY = 'aiffd_token'
const USER_KEY  = 'aiffd_user'
export interface AuthUser {
  id?: string | number
  username?: string
  email?: string
  [key: string]: unknown
}
export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser]   = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  useEffect(() => {
    const handler = () => {
      setToken(localStorage.getItem(TOKEN_KEY))
      const raw = localStorage.getItem(USER_KEY)
      setUser(raw ? JSON.parse(raw) : null)
    }
    window.addEventListener('auth-change', handler)
    return () => window.removeEventListener('auth-change', handler)
  }, [])
  const login = (newToken: string, userData: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(userData))
    // 2026-09-15 新增：这是唯一一个能拿到"刚登录/注册成功、带真实 id 的用户对象"的地方，
    // 所以访客数据迁移必须放在这里触发——而且要放在 dispatchEvent 之前，
    // 这样其余组件的 useAuth() 实例收到 'auth-change' 事件、重新读取各自本地状态时，
    // 访客桶里的数据已经搬运完成，不会出现"事件先广播、迁移后完成"的时序问题。
    migrateGuestDataToUser(userData)
    setToken(newToken)
    setUser(userData)
    window.dispatchEvent(new Event('auth-change'))
  }
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }
  const updateUser = (patch: Partial<AuthUser>) => {
    setUser(prev => {
      const next = { ...(prev ?? {}), ...patch }
      localStorage.setItem(USER_KEY, JSON.stringify(next))
      return next
    })
    window.dispatchEvent(new Event('auth-change'))
  }
  return { token, user, login, logout, updateUser }
}
