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

// Human Profile DB 相关 API（2026-09-16 新增）
// 对接后端 api/routes/human-profile.ts 的 8 个路由，采用"双写"策略接入：
// 各测试页面现有的 localStorage 存档逻辑原样保留不动（StyleTestPage 等下游页面
// 目前是同步读 localStorage，牵一发动全身），这里只是在测完之后额外调用一次，
// 把同样的数据也写进后端 Human Profile DB，让数据库真正开始积累数据。
// source 参数对应后端 CHANGE_SOURCES 枚举，标注这次变更是哪个测试模块触发的，
// 用于 profile_field_change_log 的字段级审计记录。
export type ChangeSource =
  | 'body_test' | 'face_test' | 'color_test' | 'fashion_preference_test'
  | 'user_manual_edit' | 'behavior_tracking' | 'feedback_submission'
  | 'stylist_correction' | 'quarterly_retest' | 'ai_reassessment'

export const humanProfileAPI = {
  // 获取当前用户完整档案（活档案 + 各子表聚合），第一次调用会自动创建空档案
  getMe: () =>
    api.get('/human-profile/me'),

  // 更新档案字段，patch 是要改的字段（跟 Human Style Data Dictionary V1.0 的 camelCase 字段名一致），
  // source 标注变更来源，reason 是可选的变更原因说明
  patchMe: (patch: Record<string, unknown>, source: ChangeSource, reason?: string) =>
    api.patch('/human-profile/me', { patch, source, reason }),

  // 查看档案字段级变更历史
  getHistory: () =>
    api.get('/human-profile/me/history'),

  // 整体替换 13 型风格概率分布（风格测试算完一次性提交全部 13 项）
  saveStyleScores: (scores: { styleCode: string; probability: number; isPrimary?: boolean; isSecondary?: boolean }[]) =>
    api.post('/human-profile/me/style-scores', { scores }),

  // 整体替换生活场景权重（Lifestyle Q1+Q2 答完后按字典公式算好权重一次性提交）
  saveLifestyleScenarios: (scenarios: {
    scenarioParent: 'work' | 'social' | 'travel' | 'casual' | 'formal' | 'other'
    scenarioType: 'predefined' | 'custom'
    scenarioName?: string
    isFocus?: boolean
    weight: number
  }[]) =>
    api.post('/human-profile/me/lifestyle-scenarios', { scenarios }),

  // upsert 单条单品偏好（用户一件一件评价，不是整体替换）
  saveItemPreference: (itemType: string, preferenceLevel: 'like' | 'neutral' | 'dislike') =>
    api.post('/human-profile/me/item-preferences', { itemType, preferenceLevel }),

  // upsert 单条视觉风格偏好
  saveVisualStylePreference: (visualStyleTag: string, preferenceLevel: 'like' | 'neutral' | 'dislike') =>
    api.post('/human-profile/me/visual-style-preferences', { visualStyleTag, preferenceLevel }),

  // 新增一条色彩原始信号观测记录（问卷或未来 AI 视觉，不覆盖旧记录，支持双重验证）
  saveColorSignal: (
    signalType: 'skin_tone' | 'hair_color' | 'iris_color',
    value: string,
    sourceMethod: 'questionnaire' | 'ai_vision' | 'stylist_manual',
    confidence?: number,
  ) =>
    api.post('/human-profile/me/color-signals', { signalType, value, sourceMethod, confidence }),
}

export default api
