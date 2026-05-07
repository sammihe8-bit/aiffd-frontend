{/* ── PATHS ── */}
<section className="max-w-6xl mx-auto px-6 py-20">
  <div className="text-center mb-12">
    <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>两条核心功能路径</p>
    <h2 className="font-normal" style={{ fontFamily: 'Georgia, serif', fontSize: '32px', lineHeight: '1.3', color: C.h1 }}>
      从<em style={{ color: C.gold, fontStyle: 'normal' }}>个人档案</em>，到<em style={{ color: C.gold, fontStyle: 'normal' }}>商品判断</em>
    </h2>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
    {paths.map((p, i) => (
      <div key={i} style={{ border: '1px solid #e0e0d8', borderRight: i === 0 ? 'none' : '1px solid #e0e0d8' }}>
        <div style={{ height: '3px', background: C.gold }} />
        {/* 插图区 */}
        <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', background: '#f0ece4' }}>
  {i === 0 ? (
    <img
      src="/stylereport.png"
      alt="AIFFD 风格报告"
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
    />
  ) : (
    <img
      src="/shangpin.png"
      alt="商品判断示例"
      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', background: '#f8f5f0', padding: '24px' }}
    />
  )}
</div>
        <div style={{ padding: '40px 40px 48px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '4px', color: C.gold, marginBottom: '18px' }}>{p.tag}</p>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 400, color: C.h3, marginBottom: '28px' }}>{p.title}</h3>
          <div>
            {p.items.map((item, j) => (
              <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'baseline', padding: '10px 0', borderBottom: '0.5px solid #ebebeb', borderTop: j === 0 ? '0.5px solid #ebebeb' : 'none' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.gold, flexShrink: 0 }}>—</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: '1.75' }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '36px' }}>
            <Link to={p.to} className={p.primary ? 'btn-primary' : 'btn-outline'}>{p.btn}</Link>
          </div>
        </div>
      </div>
    ))}
  </div>
</section>
