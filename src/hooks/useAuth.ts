import { useState, useEffect, useCallback } from 'react'

interface User {
  id: number
  name: string | null
  phone: string
  email: string | null
  memberLevel: string
  avatar: string | null
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('aiffd_token')
      const userData = localStorage.getItem('aiffd_user')
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          setAuth({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch {
          localStorage.removeItem('aiffd_token')
          localStorage.removeItem('aiffd_user')
          setAuth({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } else {
        setAuth(prev => ({ ...prev, isLoading: false }))
      }
    }

    checkAuth()
  }, [])

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('aiffd_token', token)
    localStorage.setItem('aiffd_user', JSON.stringify(user))
    setAuth({
      user,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('aiffd_token')
    localStorage.removeItem('aiffd_user')
    setAuth({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }, [])

  const updateUser = useCallback((user: User) => {
    localStorage.setItem('aiffd_user', JSON.stringify(user))
    setAuth(prev => ({
      ...prev,
      user,
    }))
  }, [])

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    login,
    logout,
    updateUser,
  }
}
