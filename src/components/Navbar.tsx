import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { token, logout } = useAuth()
  const location = useLocation()

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/onboarding', label: '我的风格系统' },
    { to: '/about', label: '关于' },
    { to: '/column', label: '专栏' },
    { to: '/subscribe', label: '订阅' },
  ]

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(250,249,247,0.96)', backdropFilter: 'blur(8px)',
      borderBottom: '0.5px solid #e8e2d8',
      height: '60px', display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 32px',
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600, letterSpacing: '4px', color: '#1a1a1a' }}>AIFFD</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px', color: '#B8973A', letterSpacing: '2px' }}>智搭</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1.5px',
              color: location.pathname === link.to ? '#1a1a1a' : '#888',
              textDecoration: 'none', transition: 'color 0.2s',
              borderBottom: location.pathname === link.to ? '1px solid #1a1a1a' : 'none',
              paddingBottom: '2px',
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {token ? (
            <>
              <Link to="/profile" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1px', color: '#666', textDecoration: 'none' }}>我的档案</Link>
              <button onClick={logout} style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1px', color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>退出</button>
            </>
          ) : (
            <>
              <Link to="/auth" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1px', color: '#666', textDecoration: 'none' }}>登录</Link>
              <Link to="/onboarding" style={{
                fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1.5px',
                color: '#fff', background: '#1a1a1a', padding: '8px 18px', textDecoration: 'none',
              }}>
                开始测试
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
