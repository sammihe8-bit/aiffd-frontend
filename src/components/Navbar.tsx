import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const C = {
  black: '#111111',
  white: '#FFFFFF',
  text: '#444444',
  muted: '#737373',
  surface: '#F5F5F5',
  border: '#E5E5E5',
}

export default function Navbar() {
  const { token, logout } = useAuth()
  const location = useLocation()

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      {/* 内测提示：浅灰背景、深灰文字 */}
      <div
        style={{
          minHeight: '34px',
          boxSizing: 'border-box',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: C.surface,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            lineHeight: 1.5,
            color: C.text,
            margin: 0,
            textAlign: 'center',
          }}
        >
          AIFFD 目前处于内测开发阶段，部分功能仍在完善中 —— 页面内的
          “订阅”仅用于预约测试名额，暂不会产生实际扣费
        </p>
      </div>

      <header
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${C.border}`,
          height: '60px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 32px',
            boxSizing: 'border-box',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* 使用用户提供的黑色图片 LOGO */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src="/aiffd-logo-black.png"
              alt="AIFFD 智搭"
              style={{
                width: '132px',
                height: '40px',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          </Link>

          <nav
            aria-label="主导航"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {navLinks.map(link => {
              const isActive =
                !link.external && location.pathname === link.to

              const linkStyle = link.highlight
                ? {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    letterSpacing: '1.5px',
                    whiteSpace: 'nowrap' as const,
                    color: isActive ? C.white : C.black,
                    background: isActive ? C.black : 'transparent',
                    border: `1px solid ${C.black}`,
                    padding: '5px 12px',
                    textDecoration: 'none',
                    transition: 'color 0.2s, background-color 0.2s',
                  }
                : {
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    letterSpacing: '1.5px',
                    whiteSpace: 'nowrap' as const,
                    color: isActive ? C.black : C.muted,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    borderBottom: isActive
                      ? `1px solid ${C.black}`
                      : '1px solid transparent',
                    paddingBottom: '2px',
                  }

              if (link.external) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={linkStyle}
                  >
                    {link.label}
                  </a>
                )
              }

              return (
                <Link
                  key={link.to}
                  to={link.to!}
                  aria-current={isActive ? 'page' : undefined}
                  style={linkStyle}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexShrink: 0,
            }}
          >
            {token ? (
              <>
                <Link
                  to="/profile"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    color: C.text,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  我的档案
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    color: C.muted,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  退出
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    color: C.text,
                    textDecoration: 'none',
                  }}
                >
                  登录
                </Link>

                <Link
                  to="/onboarding"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    letterSpacing: '1.5px',
                    color: C.white,
                    background: C.black,
                    padding: '8px 18px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  开始测试
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}
