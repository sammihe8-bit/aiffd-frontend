import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'
import { Eye, EyeOff } from 'lucide-react'

// 从不同的响应格式中提取 token 和 user
function extractAuthData(data: any): { token: string; user: any } | null {
  // 格式1: { token, user }
  if (data?.token && data?.user) return { token: data.token, user: data.user }
  // 格式2: { token, user: { ... } } 通过 data.data
  if (data?.data?.token) return { token: data.data.token, user: data.data.user || data.data }
  // 格式3: { accessToken, user }
  if (data?.accessToken) return { token: data.accessToken, user: data.user || data }
  // 格式4: { token } 只有 token
  if (data?.token) return { token: data.token, user: data }
  return null
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')  // 开发调试用

  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.phone) return '请输入手机号'
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) return '手机号格式不正确'
    if (!formData.password) return '请输入密码'
    if (formData.password.length < 6) return '密码至少 6 位'
    if (!isLogin) {
      if (!formData.name) return '请输入姓名'
      if (!formData.email) return '请输入邮箱'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return '邮箱格式不正确'
      if (formData.password !== formData.confirmPassword) return '两次密码不一致'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) { setError(validationError); return }

    setLoading(true)
    setError('')
    setDebugInfo('')

    try {
      let response: any
      if (isLogin) {
        response = await authAPI.login({
          phone: formData.phone,
          password: formData.password,
        })
      } else {
        response = await authAPI.register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        })
      }

      const raw = response.data
      const authData = extractAuthData(raw)

      if (authData) {
        login(authData.token, authData.user)
        navigate('/profile')
      } else {
        // 接口返回了 200 但没有期望的字段，展示原始响应帮助调试
        setDebugInfo(JSON.stringify(raw, null, 2))
        setError('登录成功但响应格式异常，请联系开发者')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      // 尽量显示后端返回的具体错误
      const backendMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.msg ||
        (typeof err.response?.data === 'string' ? err.response.data : null)
      const statusCode = err.response?.status
      
      if (statusCode === 401) {
        setError('手机号或密码错误')
      } else if (statusCode === 409 || backendMsg?.includes('已存在') || backendMsg?.includes('already')) {
        setError('该手机号已注册，请直接登录')
      } else if (statusCode === 404) {
        setError('接口地址不存在，请联系开发者')
      } else {
        setError(backendMsg || `操作失败（${statusCode || '网络错误'}）`)
      }
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode)
    setError('')
    setDebugInfo('')
    setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Top bar */}
      <div className="border-b border-[#e8e8e4] py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="label-lux text-[#555] no-underline hover:text-[#1a1a1a] transition-colors">← 返回首页</Link>
          <span className="label-lux text-[#1a1a1a]">AIFFD</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-10">
            <p className="label-lux mb-3" style={{ color: '#B8973A' }}>
              {isLogin ? 'WELCOME BACK' : 'GET STARTED'}
            </p>
            <h1 className="text-[28px] font-normal mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              {isLogin ? '登录账户' : '创建风格档案'}
            </h1>
            <p className="text-[13px] text-[#888] leading-[1.8]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {isLogin ? '继续你的风格决策之旅' : '5 分钟建立你的专属穿衣系统'}
            </p>
          </div>

          {/* Mode switch — 下划线 tab 风格 */}
          <div className="flex border-b border-[#e8e8e4] mb-8">
            <button
              onClick={() => switchMode(false)}
              className={`flex-1 pb-3 transition-all ${!isLogin ? 'text-[#1a1a1a]' : 'text-[#bbb]'}`}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1.5px',
                textTransform: 'uppercase', background: 'none', border: 'none',
                borderBottom: !isLogin ? '2px solid #1a1a1a' : '2px solid transparent',
                marginBottom: '-1px', cursor: 'pointer',
              }}
            >注册</button>
            <button
              onClick={() => switchMode(true)}
              className={`flex-1 pb-3 transition-all ${isLogin ? 'text-[#1a1a1a]' : 'text-[#bbb]'}`}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1.5px',
                textTransform: 'uppercase', background: 'none', border: 'none',
                borderBottom: isLogin ? '2px solid #1a1a1a' : '2px solid transparent',
                marginBottom: '-1px', cursor: 'pointer',
              }}
            >登录</button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-[12px] text-red-600"
              style={{ fontFamily: 'Inter, sans-serif' }}>
              {error}
            </div>
          )}

          {/* Debug info — 仅在有调试信息时显示 */}
          {debugInfo && (
            <details className="mb-4">
              <summary className="text-[11px] text-[#999] cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                查看接口响应（开发调试）
              </summary>
              <pre className="text-[10px] text-[#666] bg-[#f5f5f3] p-3 mt-2 overflow-auto max-h-32">{debugInfo}</pre>
            </details>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="label-lux block mb-2">姓名</label>
                <input type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="请输入姓名" className="input-lux" />
              </div>
            )}

            <div>
              <label className="label-lux block mb-2">手机号</label>
              <input type="tel" name="phone" value={formData.phone}
                onChange={handleChange} placeholder="1xx xxxx xxxx" className="input-lux" />
            </div>

            {!isLogin && (
              <div>
                <label className="label-lux block mb-2">邮箱</label>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="your@email.com" className="input-lux" />
              </div>
            )}

            <div>
              <label className="label-lux block mb-2">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="至少 6 位" className="input-lux pr-8"
                />
                <button type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#aaa] hover:text-[#555] transition-colors p-1">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="label-lux block mb-2">确认密码</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="再次输入密码" className="input-lux" />
              </div>
            )}

            <div className="pt-4">
              <button type="submit" disabled={loading}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ display: 'block', width: '100%', textAlign: 'center' }}>
                {loading ? '处理中...' : (isLogin ? '登录' : '注册并建立档案')}
              </button>
            </div>
          </form>

          {/* Bottom switch */}
          <p className="text-center text-[12px] text-[#999] mt-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            {isLogin ? '还没有账户？' : '已有账户？'}
            <button onClick={() => switchMode(!isLogin)}
              className="text-[#1a1a1a] underline underline-offset-2 ml-1 hover:text-[#B8973A] transition-colors">
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>

          {!isLogin && (
            <p className="text-center text-[11px] text-[#bbb] mt-4 leading-[1.7]" style={{ fontFamily: 'Inter, sans-serif' }}>
              注册即表示同意 AIFFD 服务条款与隐私政策
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
