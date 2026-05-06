import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function ProfilePage() {
  const { user } = useAuth()

  const username = (user?.username ?? user?.email ?? '用户') as string
  const email    = (user?.email ?? '') as string

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      {/* 头像 + 基本信息 */}
      <div className="card text-center space-y-3">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 mx-auto flex items-center justify-center text-3xl text-white font-bold shadow">
          {String(username).charAt(0).toUpperCase()}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{username}</h2>
        {email && <p className="text-gray-400 text-sm">{email}</p>}
        <span className="inline-block bg-pink-100 text-pink-600 text-xs px-3 py-1 rounded-full">
          🌸 普通会员
        </span>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/diagnosis" className="card hover:shadow-md transition-shadow text-center space-y-2 cursor-pointer">
          <div className="text-3xl">🎨</div>
          <p className="font-medium text-gray-700">开始诊断</p>
          <p className="text-xs text-gray-400">发现你的色彩季型</p>
        </Link>
        <Link to="/tasks" className="card hover:shadow-md transition-shadow text-center space-y-2 cursor-pointer">
          <div className="text-3xl">🎯</div>
          <p className="font-medium text-gray-700">任务中心</p>
          <p className="text-xs text-gray-400">完成任务解锁权益</p>
        </Link>
      </div>

      {/* 诊断记录占位 */}
      <div className="card space-y-3">
        <h3 className="font-semibold text-gray-700">我的诊断记录</h3>
        <div className="text-center py-8 text-gray-300">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-sm">暂无诊断记录，去完成第一次色彩诊断吧～</p>
        </div>
      </div>
    </div>
  )
}
