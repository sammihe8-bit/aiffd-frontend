import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
export default function Navbar() {
  const { token, logout } = useAuth()
  const location = useLocation()
  // "风格专栏"现在是外链（托管在 ohsammi.com），跟站内路由分开标记，
  // 需要新窗口打开 + 显示 ↗；其余项都还是站内路由，用 <Link> 正常跳转
  const STYLE_COLUMN_URL = 'https://www.ohsammi.com/'
  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/onboarding', label: '我的风格' },
    { to: '/virtual-fit', label: '虚拟试衣', highlight: true },
    { external: true, href: STYLE_COLUMN_URL, label: '风格专栏 ↗' },
    { to: '/research', label: '研究 Research' },
    { to: '/subscribe', label: '会员' },
    { to: '/about', label: '关于' },
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
        {/* Logo：临时试用新的渐变色 wordmark（跟网站其余部分的金色/米白调性不一致，
            用户明确说了只是先试试导航栏图标，不是要换整站视觉）。
            素材需要放进 public/ 目录，文件名 aiffd-wordmark2-compact.png */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/aiffd-wordmark2-compact.png" alt="AIFFD 智搭" style={{ height: '22px', width: 'auto', display: 'block' }} />
        </Link>
        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {navLinks.map(link => {
            const isActive = !link.external && location.pathname === link.to
            const linkStyle = link.highlight
              ? {
                  fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1.5px',
                  color: isActive ? '#fff' : '#FF8000',
                  background: isActive ? '#FF8000' : 'transparent',
                  border: '0.5px solid #FF8000',
                  padding: '5px 12px',
                  textDecoration: 'none', transition: 'all 0.2s',
                }
              : {
                  fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1.5px',
                  color: isActive ? '#1a1a1a' : '#888',
                  textDecoration: 'none', transition: 'color 0.2s',
                  borderBottom: isActive ? '1px solid #1a1a1a' : 'none',
                  paddingBottom: '2px',
                }
            if (link.external) {
              return (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
                  {link.label}
                </a>
              )
            }
            return (
              <Link key={link.to} to={link.to!} style={linkStyle}>
                {link.label}
              </Link>
            )
          })}
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
