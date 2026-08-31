import axios from 'axios'
const API_BASE_URL = 'https://eloquent-enthusiasm-production.up.railway.app/api'
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
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
export const authAPI = {
  register: (data: { name?: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  getMe: () =>
    api.get('/user/me'),
}

// 用户资料相关 API（2026-08-31 新增）—— 目前只支持改用户名，头像走前端本地预设方案不经过后端
export const userAPI = {
  updateMe: (data: { name: string }) =>
    api.patch('/user/me', data),
}

export const testProgressAPI = {
  save: (testType: string, status: 'in_progress' | 'completed', data: object) =>
    api.post('/test-progress', { testType, status, data }),
  get: (testType: string) =>
    api.get(`/test-progress/${testType}`),
  clear: (testType: string) =>
    api.delete(`/test-progress/${testType}`),
}
export default api
