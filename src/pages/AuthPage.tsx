import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'
import { Eye, EyeOff } from 'lucide-react'

// 后端接口字段确认（来自 api/routes/auth.ts）：
// 注册: POST /api/auth/register  { email, password, name? }
// 登录: POST /api/auth/login     { email, password }
// 响应: { token, user: { id, email, name, role, membershipTier } }

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      if (status === 401) setError('邮箱或密码错误')
      else if (status === 409) setError('该邮箱已注册，请直接登录')
      else if (status === 400) setError(msg || '填写内容有误，请检查')
      else setError(msg || `${isLogin ? '登录' : '注册'}失败，请稍后重试`)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode)
    setError('')
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      <div className="border-b border-[#e8e8e4] py-5 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" style={{ textDecoration: 'none', color: '#555', fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            ← 返回首页
          </Link>
          <span className="label-lux">AIFFD</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          <div style={{ marginBottom: '40px' }}>
            <p className="label-lux mb-3" style={{ color: '#B8973A' }}>
              {isLogin ? 'WELCOME BACK' : 'GET STARTED'}
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, marginBottom: '8px' }}>
              {isLogin ? '登录账户' : '创建风格档案'}
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#888', lineHeight: 1.8 }}>
              {isLogin ? '继续你的风格决策之旅' : '5 分钟建立你的专属穿衣系统'}
            </p>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e4', marginBottom: '32px' }}>
            {[{ label: '注册', m: false }, { label: '登录', m: true }].map(({ label, m }) => (
              <button key={label} onClick={() => switchMode(m)} style={{
                flex: 1, paddingBottom: '12px', background: 'none', border: 'none',
                borderBottom: isLogin === m ? '2px solid #1a1a1a' : '2px solid transparent',
                marginBottom: '-1px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                color: isLogin === m ? '#1a1a1a' : '#bbb', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>

          {error && (
            <div style={{
              marginBottom: '24px', padding: '12px 16px',
              border: '1px solid #fca5a5', background: '#fef2f2',
              fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {!isLogin && (
              <div>
                <p className="label-lux" style={{ marginBottom: '8px' }}>姓名</p>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="请输入姓名" className="input-lux" />
              </div>
            )}

            <div>
              <p className="label-lux" style={{ marginBottom: '8px' }}>邮箱</p>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="your@email.com" className="input-lux" />
            </div>

            <div>
              <p className="label-lux" style={{ marginBottom: '8px' }}>密码</p>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="至少 6 位" className="input-lux" style={{ paddingRight: '32px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: '4px' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <p className="label-lux" style={{ marginBottom: '8px' }}>确认密码</p>
                <input type="password" name="confirmPassword" value={formData.confirmPassword}
                  onChange={handleChange} placeholder="再次输入密码" className="input-lux" />
              </div>
            )}

            <div style={{ paddingTop: '8px' }}>
              <button type="submit" disabled={loading} className="btn-primary"
                style={{ display: 'block', width: '100%', textAlign: 'center', opacity: loading ? 0.4 : 1 }}>
                {loading ? '处理中...' : (isLogin ? '登录' : '注册并建立档案')}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999', marginTop: '32px' }}>
            {isLogin ? '还没有账户？' : '已有账户？'}
            <button onClick={() => switchMode(!isLogin)} style={{
              background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a',
              textDecoration: 'underline', textUnderlineOffset: '2px',
              marginLeft: '4px', fontSize: '12px', fontFamily: 'Inter, sans-serif',
            }}>
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </p>

          {!isLogin && (
            <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#bbb', marginTop: '16px', lineHeight: 1.7 }}>
              注册即表示同意 AIFFD 服务条款与隐私政策
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
