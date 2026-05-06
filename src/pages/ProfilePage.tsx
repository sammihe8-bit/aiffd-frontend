import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { 
  User, Crown, Star, Gem, Award, 
  Phone, Mail, Calendar, ArrowRight,
  Sparkles, Palette, Heart
} from 'lucide-react'

interface UserProfile {
  id: number
  name: string | null
  phone: string
  email: string | null
  memberLevel: string
  avatar: string | null
  createdAt: string
}

const memberLevels = [
  { 
    key: 'normal', 
    label: '普通用户', 
    icon: <User className="w-5 h-5" />,
    color: 'bg-gray-100 text-gray-600',
    desc: '基础色彩诊断服务'
  },
  { 
    key: 'vip', 
    label: 'VIP用户', 
    icon: <Star className="w-5 h-5" />,
    color: 'bg-yellow-100 text-yellow-700',
    desc: '高级诊断 + 专属报告'
  },
  { 
    key: 'stylist', 
    label: '造型师', 
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-primary-100 text-primary-700',
    desc: '专业造型咨询服务'
  },
  { 
    key: 'master', 
    label: '大咖造型师', 
    icon: <Crown className="w-5 h-5" />,
    color: 'bg-purple-100 text-purple-700',
    desc: '顶级专家一对一服务'
  },
]

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth')
    }
  }, [isLoading, isAuthenticated, navigate])

  useEffect(() => {
    if (isAuthenticated) {
      authAPI.getMe()
        .then(res => setProfile(res.data))
        .catch(err => {
          console.error('Failed to fetch profile:', err)
          if (user) setProfile(user as UserProfile)
        })
        .finally(() => setFetching(false))
    }
  }, [isAuthenticated, user])

  if (isLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const currentUser = profile || user
  if (!currentUser) return null

  const currentLevel = memberLevels.find(l => l.key === currentUser.memberLevel) || memberLevels[0]
  const joinDate = currentUser.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString('zh-CN')
    : '未知'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {currentUser.name ? currentUser.name[0].toUpperCase() : <User className="w-10 h-10" />}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${currentLevel.color} rounded-full flex items-center justify-center border-2 border-white shadow-sm`}>
                {currentLevel.icon}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentUser.name || '未设置姓名'}
                </h1>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${currentLevel.color}`}>
                  {currentLevel.icon}
                  {currentLevel.label}
                </span>
              </div>
              <p className="text-gray-500 text-sm">{currentLevel.desc}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/diagnosis')} className="btn-primary inline-flex items-center gap-2">
                <Palette className="w-4 h-4" />
                开始诊断
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                基本信息
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">手机号</p>
                    <p className="font-medium text-gray-900">{currentUser.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">邮箱</p>
                    <p className="font-medium text-gray-900">{currentUser.email || '未设置'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">加入时间</p>
                    <p className="font-medium text-gray-900">{joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                最近活动
              </h2>
              <div className="text-center py-8 text-gray-400">
                <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无诊断记录</p>
                <button onClick={() => navigate('/diagnosis')} className="mt-4 text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1">
                  立即开始第一次诊断
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary-500" />
                会员等级
              </h2>
              <div className="space-y-3">
                {memberLevels.map((level) => (
                  <div key={level.key} className={`p-3 rounded-lg border-2 transition-all ${
                    currentUser.memberLevel === level.key
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-transparent bg-gray-50 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${level.color} rounded-lg flex items-center justify-center`}>
                        {level.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{level.label}</span>
                          {currentUser.memberLevel === level.key && (
                            <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">当前</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{level.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {currentUser.memberLevel === 'normal' && (
              <div className="card bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
                <div className="text-center">
                  <Gem className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                  <h3 className="font-bold text-gray-900 mb-2">升级 VIP</h3>
                  <p className="text-sm text-gray-600 mb-4">解锁高级诊断功能，获取专属色彩报告</p>
                  <button className="w-full btn-primary">立即升级</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
