import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'
import { Eye, EyeOff } from 'lucide-react'

const F = {
  serif: 'Georgia, serif',
  sans: 'Inter, sans-serif',
  gold: '#B8973A',
  dark: '#1a1a1a',
  muted: '#888',
  border: '#e8e8e4',
  bg: '#faf9f7',
}

// 统一 label 样式
const labelStyle: React.CSSProperties = {
  fontFamily: F.serif,
  fontSize: '14px',
  color: F.dark,
  letterSpacing: '0.5px',
  display: 'block',
  marginBottom: '8px',
}

// 统一 input 样式
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: `1px solid ${F.border}`,
  background: '#fff',
  fontFamily: F.serif,
  fontSize: '14px',
  color: F.dark,
  outline: 'none',
  boxSizing: 'border-box' as const,
  borderRadius: '0',
  WebkitAppearance: 'none' as any,
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.email) return '请输入邮箱'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return '邮箱格式不正确'
    if (!formData.password) return '请输入密码'
    if (formData.password.length < 6) return '密码至少 6 位'
    if (!isLogin) {
      if (!formData.name) return '请输入姓名'
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
      const response = isLogin
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register({ name: formData.name, email: formData.email, password: formData.password })

      const { token, user } = response.data
      login(token, user)
      navigate('/profile')
    } catch (err: any) {
      const status = err.response?.status
      const msg = err.response?.data?.error || err.response?.data?.message

      // 调试信息，帮助定位问题
      setDebugInfo(`状态码: ${status || '无响应'} | ${JSON.stringify(err.response?.data || err.message)}`)

      if (status === 401) setError('邮箱或密码错误')
      else if (status === 409) setError('该邮箱已注册，请直接登录')
      else if (status === 400) setError(msg || '填写内容有误，请检查')
      else if (!status) setError('网络错误，请检查网络连接')
      else setError(msg || `${isLogin ? '登录' : '注册'}失败，请稍后重试`)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode)
    setError('')
    setDebugInfo('')
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div style={{ minHeight: '100vh', background: F.bg, display: 'flex', flexDirection: 'column' }}>

      {/* 顶部导航 */}
      <div style={{ borderBottom: `1px solid ${F.border}`, padding: '20px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#555', fontFamily: F.sans, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            ← 返回首页
          </Link>
          <span style={{ fontFamily: F.sans, fontSize: '13px', fontWeight: 600, letterSpacing: '4px', color: F.dark }}>AIFFD</span>
        </div>
      </div>

      {/* 主体 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>

          {/* 标题 */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontFamily: F.sans, fontSize: '10px', letterSpacing: '3px', color: F.gold, marginBottom: '12px', textTransform: 'uppercase' }}>
              {isLogin ? 'WELCOME BACK' : 'GET STARTED'}
            </p>
            <h1 style={{ fontFamily: F.serif, fontSize: '28px', fontWeight: 400, color: F.dark, marginBottom: '8px' }}>
              {isLogin ? '登录账户' : '创建风格档案'}
            </h1>
            <p style={{ fontFamily: F.sans, fontSize: '13px', color: F.muted, lineHeight: 1.8, margin: 0 }}>
              {isLogin ? '继续你的风格决策之旅' : '5 分钟建立你的专属穿衣系统'}
            </p>
          </div>

          {/* 注册 / 登录 Tab */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${F.border}`, marginBottom: '32px' }}>
            {[{ label: '注册', m: false }, { label: '登录', m: true }].map(({ label, m }) => (
              <button key={label} onClick={() => switchMode(m)} style={{
                flex: 1, paddingBottom: '12px', background: 'none', border: 'none',
                borderBottom: isLogin === m ? `2px solid ${F.dark}` : '2px solid transparent',
                marginBottom: '-1px', cursor: 'pointer',
                fontFamily: F.serif,
                fontSize: '15px',
                letterSpacing: '1px',
                color: isLogin === m ? F.dark : '#bbb',
                transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          {/* 错误提示 */}
          {error && (
            <div style={{
              marginBottom: '24px', padding: '12px 16px',
              border: '1px solid #fca5a5', background: '#fef2f2',
              fontFamily: F.serif, fontSize: '13px', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          {/* 调试信息（仅开发用，上线后可删） */}
          {debugInfo && (
            <div style={{
              marginBottom: '16px', padding: '10px 14px',
              border: '1px solid #e8e8e4', background: '#f5f5f5',
              fontFamily: F.sans, fontSize: '11px', color: '#666',
              wordBreak: 'break-all' as const,
            }}>
              {debugInfo}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {!isLogin && (
              <div>
                <label style={labelStyle}>姓名</label>
                <input
                  type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="请输入姓名"
                  style={inputStyle}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>邮箱</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="your@email.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password}
                  onChange={handleChange} placeholder="至少 6 位"
                  style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: '4px', display: 'flex' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label style={labelStyle}>确认密码</label>
                <input
                  type="password" name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange} placeholder="再次输入密码"
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ paddingTop: '8px' }}>
              <button
                type="submit" disabled={loading}
                style={{
                  display: 'block', width: '100%', padding: '14px',
                  background: loading ? '#ccc' : F.dark,
                  color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: F.serif, fontSize: '15px', letterSpacing: '1px',
                  textAlign: 'center' as const,
                  transition: 'background 0.2s',
                }}
              >
                {loading ? '处理中...' : (isLogin ? '登录' : '注册并建立档案')}
              </button>
            </div>
          </form>

          {/* 切换注册/登录 */}
          <p style={{ textAlign: 'center', fontFamily: F.serif, fontSize: '13px', color: '#999', marginTop: '32px' }}>
            {isLogin ? '还没有账户？' : '已有账户？'}
            <button onClick={() => switchMode(!isLogin)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: F.dark,
              textDecoration: 'underline', textUnderlineOffset: '2px',
              marginLeft: '4px', fontSize: '13px', fontFamily: F.serif,
            }}>
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>

          {!isLogin && (
            <p style={{ textAlign: 'center', fontFamily: F.sans, fontSize: '11px', color: '#bbb', marginTop: '16px', lineHeight: 1.7 }}>
              注册即表示同意 AIFFD 服务条款与隐私政策
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
