export default function Footer() {
  return (
    <footer style={{ background: '#1C1612', padding: '80px 64px 48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '64px', marginBottom: '72px' }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: '#fafaf8', marginBottom: '16px' }}>订阅我们的 Newsletter</h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.8', marginBottom: '28px' }}>每月一封 — 一组当季搭配、一篇专栏、一段穿衣的私想。</p>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
              <input placeholder="you@email.com" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#fafaf8', padding: '10px 0' }} />
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', color: '#B8973A', padding: '10px 0', flexShrink: 0 }}>订阅</button>
            </div>
          </div>
          {[
            { title: '产品', items: ['系列', '试衣间', '衣橱', '搭配方案'] },
            { title: '关于', items: ['品牌故事', '专栏', '合作', '招聘'] },
            { title: '支持', items: ['帮助中心', '联系我们', '尺码指引', '隐私'] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>{col.title}</p>
              {col.items.map(t => (
                <p key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '16px', cursor: 'pointer' }}>{t}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>© 2026 智搭 · AIFFD</p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>北京</p>
        </div>
      </div>
    </footer>
  )
}
