import { useState, useEffect } from 'react'
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
