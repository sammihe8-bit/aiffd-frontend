import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path ? 'text-pink-600 font-semibold' : 'text-gray-600 hover:text-pink-500'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="font-bold text-pink-600 text-lg tracking-tight">AIFFD 智搭</span>
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className={isActive('/')}>首页</Link>
          {token && (
            <>
              <Link to="/diagnosis" className={isActive('/diagnosis')}>风格诊断</Link>
              <Link to="/tasks" className={isActive('/tasks')}>任务中心</Link>
              <Link to="/profile" className={isActive('/profile')}>我的</Link>
            </>
          )}
          {token ? (
            <button
              onClick={() => { logout(); navigate('/') }}
              className="btn-secondary text-sm py-1.5 px-4"
            >
              退出
            </button>
          ) : (
            <Link to="/auth" className="btn-primary text-sm py-1.5 px-4">
              登录 / 注册
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
