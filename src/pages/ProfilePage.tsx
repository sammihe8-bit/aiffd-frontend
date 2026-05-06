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
                <span className={`inline-flex items
