import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'
import { Eye, EyeOff, UserPlus, LogIn, Sparkles } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
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
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.phone) return '请输入手机号'
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) return '手机号格式不正确'
    if (!formData.password) return '请输入密码'
    if (formData.password.length < 6) return '密码至少6位'
    
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
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const response = await authAPI.login({
          phone: formData.phone,
          password: formData.password,
        })
        const { token, user } = response.data
        login(token, user)
        navigate('/profile')
      } else {
        const response = await authAPI.register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
        })
        const { token, user } = response.data
        login(token, user)
        navigate('/profile')
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.response?.data?.message || '操作失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? '欢迎回来' : '加入 AIFFD'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? '登录你的账户继续探索' : '创建账户开启色彩之旅'}
          </p>
        </div>

        <div className="card">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              注册
            </button>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              登录
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="请输入你的姓名" className="input-field" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
              <input type="tel" name="
