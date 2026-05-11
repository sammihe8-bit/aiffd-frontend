import { Link } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#fafaf8', cream: '#fafaf8', accent: '#7A4A3C',
}

const ITEMS = [
  { no: '02', name: '米色风衣', en: 'Camel Trench' },
  { no: '05', name: '真丝衬衫', en: 'Silk Shirt' },
  { no: '08', name: '羊绒针织', en: 'Cashmere Knit' },
  { no: '11', name: '直筒西裤', en: 'Tailored Trousers' },
  { no: '14', name: '亚麦外套', en: 'Linen Coat' },
  { no: '17', name: '真皮手袋', en: 'Leather Tote' },
]

const PLACEHOLDER_COLORS = ['#E8E0D5','#D4C8B8','#C8B8A8','#DDD0C0','#E4D8C8','#D8CCB8']

function PlaceholderImg({ color, no, label }: { color: string; no: string; label: string }) {
  return (
    <div style={{ width: '100%', paddingBottom: '125%', position: 'relative', background: color }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: 'rgba(0,0,0,0.3)' }}>NO. {no}</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: 'rgba(0,0,0,0.4)' }}>{label}</span>
      </div>
    </div>
  )
}

export default function HomePage() {
  const border = C.border
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
        <div style={{ padding: '0 32px 0 100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: C.bg }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '28px' }}>NO. 01 — 春日 SS26</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 400, lineHeight: 1.2, color: C.h1, marginBottom: '20px' }}>
            为今天<br /><em style={{ color: C.accent, fontStyle: 'italic' }}>试一件。</em>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.9', maxWidth: '340px', marginBottom: '44px' }}>
            智携是一个为衣橱而生的 AI 工作室 — 虚拟试穿你已经拥有的、想象你尚未穿过的。
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: '#fff', background: C.h1, padding: '14px 32px', textDecoration: 'none' }}>开始试衣</Link>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.sub, textDecoration: 'none' }}>了解智携 →</Link>
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden', minHeight: '600px' }}>
          <img src='/hero-wardrobe.jpg' alt='春日衣架' style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', bottom: '48px', right: '24px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>春日 SS26</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginTop: '2px' }}>NO. 14</p>
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: border }} />

      <section style={{ padding: '80px 64px', background: C.cream }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>三件事</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, lineHeight: 1.3, color: C.h1 }}>
              拥有你的<em style={{ color: C.accent, fontStyle: 'italic' }}>风格系统。</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid ' + C.border }}>
            {[
              { num: '01', title: '虚拟试衣', en: 'FITTING ROOM', desc: '上传一张全身照，在屏幕里试穿你尚未拥有的每一件。光感、垂坠、剪裁，都被精准还原。' },
              { num: '02', title: '搭配方案', en: 'DAILY OUTFITS', desc: '为今日的天气、心情、场合提出一组方案。三件可能，而不是三十。我们相信选择越少，越自由。' },
              { num: '03', title: '衣橱', en: 'WARDROBE', desc: '将你的衣物收入数字衣橱。按色温、材质、季节自动归档。重新发现你已经拥有的。' },
            ].map((item, i) => (
              <div key={item.num} style={{ padding: '40px 36px', borderRight: i < 2 ? '1px solid ' + border : 'none' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>{item.num}</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: C.h2, marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', color: C.muted, marginBottom: '16px' }}>{item.en}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: C.body, lineHeight: '1.8' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: border }} />

      <section style={{ padding: '80px 64px', background: C.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '10px' }}>本季精选</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, lineHeight: 1.3 }}>当下的二十件</h2>
            </div>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, textDecoration: 'none' }}>查看全部 →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {ITEMS.map((item, i) => (
              <Link key={item.no} to='/onboarding' style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ marginBottom: '12px' }}>
                  <PlaceholderImg color={PLACEHOLDER_COLORS[i]} no={item.no} label={item.name} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: C.h2 }}>{item.name}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px', fontStyle: 'italic', color: C.muted }}>{item.en}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: '#1C1612', padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '32px' }}>— 智携 · 主编手记</p>
          <blockquote style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, lineHeight: 1.5, color: '#fafaf8', fontStyle: 'italic', margin: 0, maxWidth: '860px' }}>
            "我们不卖衣服。我们卖的是 — 在你按下购买前，先看见自己穿上它的那一刻。"
          </blockquote>
        </div>
      </section>

      <section style={{ background: C.cream, padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>我的风格系统</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, lineHeight: 1.3, marginBottom: '16px' }}>先了解自己，<br />再购买任何一件。</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.9', marginBottom: '32px' }}>
              体型 · 色彩 · 风格 · 时尚个性，四项测试构成你的专属风格档案，让每一次购买都成为精准决策。
            </p>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: '#fff', background: C.h1, padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }}>建立我的风格档案</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: border }}>
            {[
              { num: '01', label: '体型测试', sub: 'BODY' },
              { num: '02', label: '色彩测试', sub: 'COLOR' },
              { num: '03', label: '风格测试', sub: 'STYLE' },
              { num: '04', label: '时尚个性', sub: 'FASHION' },
            ].map(t => (
              <div key={t.num} style={{ background: C.cream, padding: '28px 24px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '10px' }}>{t.num}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: C.h2, marginBottom: '4px' }}>{t.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.muted }}>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: '#1C1612', padding: '80px 64px 48px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '64px', marginBottom: '72px' }}>
            <div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: '#fafaf8', marginBottom: '16px' }}>订阅我们的 Newsletter</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.8', marginBottom: '28px' }}>每月一封 — 一组当季搭配、一篇专栏、一段穿衣的私想。</p>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <input placeholder='you@email.com' style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#fafaf8', padding: '10px 0' }} />
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
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>© 2026 智携 · ZHIDA STUDIO</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>上海 — 米兰 — 东京</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
