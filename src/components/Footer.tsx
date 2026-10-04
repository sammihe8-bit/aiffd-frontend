import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const C = {
  black: '#111111',
  white: '#FFFFFF',
  text: '#CCCCCC',
  muted: '#AAAAAA',
  border: '#444444',
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubscribe = () => {
    if (!email) return
    navigate(`/subscribe?email=${encodeURIComponent(email)}&subscribed=true`)
  }

  return (
    <footer
      style={{
        background: C.black,
        padding: '80px 64px 48px',
      }}
    >
      <style>{`
        .footer-input::placeholder {
          color: ${C.muted};
          opacity: 1;
        }

        .footer-input:-webkit-autofill,
        .footer-input:-webkit-autofill:hover,
        .footer-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${C.black} inset !important;
          -webkit-text-fill-color: ${C.white} !important;
          caret-color: ${C.white};
        }

        .aiffd-footer-link:hover {
          text-decoration: underline !important;
          text-underline-offset: 4px;
        }

        .aiffd-footer-subscribe:focus-visible,
        .aiffd-footer-link:focus-visible,
        .footer-input:focus-visible {
          outline: 1px solid ${C.white};
          outline-offset: 4px;
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
            gap: '64px',
            marginBottom: '72px',
          }}
        >
          {/* Newsletter */}
          <div>
            <h3
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '20px',
                fontWeight: 400,
                color: C.white,
                marginBottom: '16px',
              }}
            >
              订阅我们的 Newsletter
            </h3>

            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '13px',
                color: C.muted,
                lineHeight: '1.8',
                marginBottom: '28px',
              }}
            >
              每月一封 — 一组当季搭配、一篇专栏、一段穿衣的私想。
            </p>

            <div
              style={{
                display: 'flex',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <input
                className="footer-input"
                type="email"
                aria-label="订阅邮箱"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  color: C.white,
                  padding: '10px 0',
                }}
              />

              <button
                className="aiffd-footer-subscribe"
                type="button"
                onClick={handleSubscribe}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  letterSpacing: '2px',
                  color: C.white,
                  padding: '10px 0 10px 16px',
                  flexShrink: 0,
                }}
              >
                订阅
              </button>
            </div>
          </div>

          {/* 链接列 */}
          {[
            {
              title: '产品',
              items: [
                { label: '系列', to: '/' },
                { label: '虚拟试衣', to: '/virtual-fit' },
                { label: '风格测试', to: '/onboarding' },
                { label: '我的档案', to: '/profile' },
              ],
            },
            {
              title: '关于',
              items: [
                { label: '品牌故事', to: '/' },
                { label: '专栏', to: '/column' },
                { label: '订阅方案', to: '/subscribe' },
              ],
            },
            {
              title: '支持',
              items: [
                { label: '帮助中心', to: '/' },
                { label: '联系我们', to: '/' },
                { label: '尺码指引', to: '/' },
                { label: '隐私政策', to: '/privacy' },
              ],
            },
          ].map(col => (
            <div key={col.title}>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '12px',
                  letterSpacing: '3px',
                  color: C.white,
                  marginBottom: '24px',
                }}
              >
                {col.title}
              </p>

              {col.items.map(item => (
                <Link
                  className="aiffd-footer-link"
                  key={item.label}
                  to={item.to}
                  style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: C.text,
                    marginBottom: '16px',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* 底栏 */}
        <div
          style={{
            borderTop: `1px solid ${C.border}`,
            paddingTop: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: C.muted,
              letterSpacing: '1px',
            }}
          >
            © 2026 AIFFD 智搭 · contact@aiffd.com
          </p>

          <p
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '12px',
              fontStyle: 'italic',
              color: C.muted,
            }}
          >
            Los Angeles · Shanghai · Online
          </p>
        </div>
      </div>
    </footer>
  )
}
