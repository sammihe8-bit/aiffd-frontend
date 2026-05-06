import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-[#1a1a1a] border-b border-[#1a1a1a] pb-0.5'
      : 'text-[#888] hover:text-[#1a1a1a] transition-colors'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fafaf8]/95 backdrop-blur-sm border-b border-[#e8e8e4]">
      <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', letterSpacing: '5px', fontWeight: 600, color: '#1a1a1a' }}>
            AIFFD
          </span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px', letterSpacing: '2px', color: '#B8973A' }}>
            智搭
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px' }}>
          <Link to="/" className={isActive('/')}>首页</Link>
          {token && (
            <>
              <Link to="/onboarding" className={isActive('/onboarding')}>风格测试</Link>
              <Link to="/diagnosis" className={isActive('/diagnosis')}>商品分析</Link>
              <Link to="/profile" className={isActive('/profile')}>我的档案</Link>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-4">
          {token ? (
            <button
              onClick={() => { logout(); navigate('/') }}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1px', border: '1px solid #1a1a1a', padding: '6px 18px', background: 'transparent', cursor: 'pointer' }}
            >
              退出
            </button>
          ) : (
            <>
              <Link to="/auth"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1px', color: '#888' }}>
                登录
              </Link>
              <Link to="/onboarding"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1px', background: '#1a1a1a', color: '#fff', padding: '8px 20px', display: 'inline-block' }}>
                开始测试
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
