import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'
import { Eye, EyeOff } from 'lucide-react'

function extractAuthData(data: any): { token: string; user: any } | null {
  if (data?.token && data?.user) return { token: data.token, user: data.user }
  if (data?.data?.token) return { token: data.data.token, user: data.data.user || data.data }
  if (data?.accessToken) return { token: data.accessToken, user: data.user || data }
  if (data?.token) return { token: data.token, user: { id: data.id, name: data.name } }
  return null
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rawResponse, setRawResponse] = useState<string>('')

  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
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
    setRawResponse('')

    try {
      const response = isLogin
        ? await authAPI.login({ phone: formData.phone, password: formData.password })
        : await authAPI.register({ name: formData.name, phone: formData.phone, email: formData.email, password: formData.password })

      const raw = response.data
      // 暂时记录响应，方便调试
      setRawResponse(JSON.stringify(raw, null, 2))

      const authData = extractAuthData(raw)
      if (authData) {
        login(authData.token, authData.user)
        navigate('/profile')
      } else {
        setError('登录成功但响应格式异常，请查看下方接口响应')
      }
    } catch (err: any) {
      const status = err.response?.status
      const body = err.response?.data

      // 记录完整错误响应
      setRawResponse(JSON.stringify({ status, body }, null, 2))

      const msg =
        body?.message || body?.error || body?.msg || body?.detail ||
        (typeof body === 'string' ? body : null)

      if (status === 401) setError('手机号或密码错误')
      else if (status === 409 || msg?.includes('已存在') || msg?.includes('exist')) setError('该手机号已注册，请直接登录')
      else if (status === 422) setError(`字段格式错误：${msg || '请检查填写内容'}`)
      else if (status === 404) setError('接口不存在，请联系开发者')
      else setError(msg || `${isLogin ? '登录' : '注册'}失败（${status || '网络错误'}），请查看下方详情`)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode)
    setError('')
    setRawResponse('')
    setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Top bar */}
      <div className="border-b border-[#e8e8e4] py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="label-lux text-[#555] hover:text-[#1a1a1a] transition-colors" style={{ textDecoration: 'none' }}>
            ← 返回首页
          </Link>
          <span className="label-lux">AIFFD</span>
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
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#888', lineHeight: 1.8 }}>
              {isLogin ? '继续你的风格决策之旅' : '5 分钟建立你的专属穿衣系统'}
            </p>
          </div>

          {/* Tab switch */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e4', marginBottom: '32px' }}>
            {[{ label: '注册', loginMode: false }, { label: '登录', loginMode: true }].map(({ label, loginMode }) => {
              const active = isLogin === loginMode
              return (
                <button key={label} onClick={() => switchMode(loginMode)}
                  style={{
                    flex: 1, paddingBottom: '12px', background: 'none', border: 'none',
                    borderBottom: active ? '2px solid #1a1a1a' : '2px solid transparent',
                    marginBottom: '-1px', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1.5px',
                    textTransform: 'uppercase', color: active ? '#1a1a1a' : '#bbb',
                    transition: 'all 0.2s',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '24px', padding: '12px 16px',
              border: '1px solid #fca5a5', background: '#fef2f2',
              fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          {/* Raw response debug — 开发期显示，接口调通后可删 */}
          {rawResponse && (
            <details style={{ marginBottom: '16px' }}>
              <summary style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px',
                color: '#999', cursor: 'pointer', marginBottom: '8px',
              }}>
                接口原始响应（调试用）
              </summary>
              <pre style={{
                fontFamily: 'monospace', fontSize: '10px', color: '#555',
                background: '#f5f5f3', padding: '12px', overflowX: 'auto',
                maxHeight: '140px', lineHeight: 1.6,
              }}>{rawResponse}</pre>
            </details>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {!isLogin && (
              <div>
                <p className="label-lux" style={{ marginBottom: '8px' }}>姓名</p>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="请输入姓名" className="input-lux"
                  style={{ fontSize: '14px' }} />
              </div>
            )}

            <div>
              <p className="label-lux" style={{ marginBottom: '8px' }}>手机号</p>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="1xx xxxx xxxx" className="input-lux"
                style={{ fontSize: '14px' }} />
            </div>

            {!isLogin && (
              <div>
                <p className="label-lux" style={{ marginBottom: '8px' }}>邮箱</p>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="your@email.com" className="input-lux"
                  style={{ fontSize: '14px' }} />
              </div>
            )}

            <div>
              <p className="label-lux" style={{ marginBottom: '8px' }}>密码</p>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="至少 6 位" className="input-lux pr-8"
                  style={{ fontSize: '14px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#aaa', padding: '4px',
                  }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <p className="label-lux" style={{ marginBottom: '8px' }}>确认密码</p>
                <input type="password" name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="再次输入密码" className="input-lux"
                  style={{ fontSize: '14px' }} />
              </div>
            )}

            <div style={{ paddingTop: '8px' }}>
              <button type="submit" disabled={loading}
                className="btn-primary"
                style={{ display: 'block', width: '100%', textAlign: 'center', opacity: loading ? 0.4 : 1 }}>
                {loading ? '处理中...' : (isLogin ? '登录' : '注册并建立档案')}
              </button>
            </div>
          </form>

          {/* Switch link */}
          <p style={{
            textAlign: 'center', fontFamily: 'Inter, sans-serif',
            fontSize: '12px', color: '#999', marginTop: '32px',
          }}>
            {isLogin ? '还没有账户？' : '已有账户？'}
            <button onClick={() => switchMode(!isLogin)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#1a1a1a', textDecoration: 'underline', textUnderlineOffset: '2px',
              marginLeft: '4px', fontSize: '12px', fontFamily: 'Inter, sans-serif',
            }}>
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>

          {!isLogin && (
            <p style={{
              textAlign: 'center', fontFamily: 'Inter, sans-serif',
              fontSize: '11px', color: '#bbb', marginTop: '16px', lineHeight: 1.7,
            }}>
              注册即表示同意 AIFFD 服务条款与隐私政策
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
