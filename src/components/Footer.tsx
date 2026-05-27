import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#1C1612', padding: '80px 64px 48px' }}>
      <style>{`
        .footer-input:-webkit-autofill,
        .footer-input:-webkit-autofill:hover,
        .footer-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #1C1612 inset !important;
          -webkit-text-fill-color: #fafaf8 !important;
          caret-color: #fafaf8;
        }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '64px', marginBottom: '72px' }}>

          {/* Newsletter */}
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: '#fafaf8', marginBottom: '16px' }}>
              订阅我们的 Newsletter
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.8', marginBottom: '28px' }}>
              每月一封 — 一组当季搭配、一篇专栏、一段穿衣的私想。
            </p>
            <Link to="/subscribe" style={{
              display: 'inline-block', marginTop: '4px',
              fontFamily: 'Inter, sans-serif', fontSize: '12px',
              letterSpacing: '2px', color: '#B8973A',
              textDecoration: 'none', borderBottom: '1px solid rgba(184,151,58,0.4)',
              paddingBottom: '2px',
            }}>
              查看订阅方案 →
            </Link>
          </div>

          {/* 链接列 */}
          {[
            { title: '产品', items: [
              { label: '系列', to: '/' },
              { label: '虚拟试衣', to: '/virtual-fit' },
              { label: '衣橱', to: '/' },
              { label: '搭配方案', to: '/' },
            ]},
            { title: '关于', items: [
              { label: '品牌故事', to: '/' },
              { label: '专栏', to: '/column' },
              { label: '合作', to: '/' },
              { label: '招聘', to: '/' },
            ]},
            { title: '支持', items: [
              { label: '帮助中心', to: '/' },
              { label: '联系我们', to: '/' },
              { label: '尺码指引', to: '/' },
              { label: '隐私', to: '/privacy' },
            ]},
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>
                {col.title}
              </p>
              {col.items.map(item => (
                <Link key={item.label} to={item.to} style={{
                  display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '14px',
                  color: 'rgba(255,255,255,0.55)', marginBottom: '16px',
                  textDecoration: 'none',
                }}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* 底栏 */}
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
            © 2026 AIFFD 智搭 · contact@aiffd.com
          </p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>
            Los Angeles · Shanghai · Online
          </p>
        </div>
      </div>
    </footer>
  )
}
