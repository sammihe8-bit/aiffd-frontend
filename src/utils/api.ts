import axios from 'axios'

const API_BASE_URL = 'https://eloquent-enthusiasm-production.up.railway.app/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aiffd_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
const isAuthRoute = error.config?.url?.includes('/auth/')
const hasToken = !!localStorage.getItem('aiffd_token')
if (error.response?.status === 401 && hasToken && !isAuthRoute) {
  localStorage.removeItem('aiffd_token')
  localStorage.removeItem('aiffd_user')
  window.location.href = '/auth'
}
    return Promise.reject(error)
  }
)

// 认证相关API — 后端字段确认：email + password（无 phone）
export const authAPI = {
  register: (data: { name?: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () =>
    api.get('/user/me'),
}

// 测试进度存档 API（2026-08-27 新增）——只对已登录用户生效，未登录访客仍用 localStorage 兜底
// testType: 'body' | 'style' | 'color' | 'fashion'
export const testProgressAPI = {
  save: (testType: string, status: 'in_progress' | 'completed', data: object) =>
    api.post('/test-progress', { testType, status, data }),

  get: (testType: string) =>
    api.get(`/test-progress/${testType}`),

  clear: (testType: string) =>
    api.delete(`/test-progress/${testType}`),
}

export default api
