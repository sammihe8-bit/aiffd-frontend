import { Link } from 'react-router-dom'

// 色彩系统 — 保留原始规范
const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#fafaf8', cream: '#fafaf8', dark: '#1C1612',
  accent: '#7A4A3C',
}

const ITEMS = [
  { no: '02', name: '米色风衣',   en: 'Camel Trench' },
  { no: '05', name: '真丝衬衫',   en: 'Silk Shirt' },
  { no: '08', name: '羊绒针织',   en: 'Cashmere Knit' },
  { no: '11', name: '直筒西裤',   en: 'Tailored Trousers' },
  { no: '14', name: '亚麻外套',   en: 'Linen Coat' },
  { no: '17', name: '真皮手袋',   en: 'Leather Tote' },
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

function HeroPlaceholder() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', background: '#EAE4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '80px', left: '10%', right: '10%', height: '1px', background: '#C4B8A8' }} />
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} style={{ position: 'absolute', top: '81px', left: `${14 + i * 11}%`, width: '1px', height: `${180 + Math.sin(i) * 30}px`, background: '#B4A898' }} />
      ))}
      <div style={{ position: 'absolute', bottom: '48px', right: '24px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8A7A6A', letterSpacing: '1px' }}>春日 SS26</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#AAA09A', letterSpacing: '2px', marginTop: '2px' }}>NO. 14</p>
      </div>
    </div>
  )
}

export default function HomePage() {

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
        <div style={{ padding: '120px 64px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: C.bg }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '32px' }}>
            NO. 01 — 春日 SS26
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 400, lineHeight: 1.2, color: C.h1, marginBottom: '24px' }}>
            为今天<br />
            <em style={{ color: C.accent, fontStyle: 'italic' }}>试一件。</em>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.9', maxWidth: '360px', marginBottom: '48px' }}>
            智搭是一个为衣橱而生的 AI 工作室 — 虚拟试穿你已经拥有的、想象你尚未穿过的。
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/onboarding" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: '#fff', background: C.h1, padding: '14px 32px', textDecoration: 'none' }}>
              开始试衣
            </Link>
            <Link to="/onboarding" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.sub, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              了解智搭 →
            </Link>
          </div>
        </div>
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <HeroPlaceholder />
        </div>
      </section>

      <div style={{ height: '1px', background: C.border }} />

      {/* ── 三个工作室 ── */}
      <section style={{ padding: '80px 64px', background: C.cream }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>三件事</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, lineHeight: 1.3, color: C.h1 }}>
              三个工作室，<em style={{ color: C.accent, fontStyle: 'italic' }}>一个衣橱。</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0', borderTop: `1px solid ${C.border}` }}>
            {[
              { num: '01', title: '虚拟试衣', en: 'FITTING ROOM', desc: '上传一张全身照，在屏幕里试穿你尚未拥有的每一件。光感、垂坠、剪裁，都被精准还原。', to: '/onboarding' },
              { num: '02', title: '搭配方案', en: 'DAILY OUTFITS', desc: '为今日的天气、心情、场合提出一组方案。三件可能，而不是三十。我们相信选择越少，越自由。', to: '/onboarding' },
              { num: '03', title: '衣橱', en: 'WARDROBE', desc: '将你的衣物收入数字衣橱。按色温、材质、季节自动归档。重新发现你已经拥有的。', to: '/profile' },
            ].map((item, i) => (
              <div key={item.num} style={{ padding: '40px 36px', borderRight: i < 2 ? `1px solid ${C.border}` : 'none' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>{item.num}</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: C.h2, marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', color: C.muted, marginBottom: '16px' }}>{item.en}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: C.body, lineHeight: '1.8' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: C.border }} />

      {/* ── 本季精选 ── */}
      <section style={{ padding: '80px 64px', background: C.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '10px' }}>本季精选</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, lineHeight: 1.3 }}>当下的二十件</h2>
            </div>
            <Link to="/onboarding" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, textDecoration: 'none' }}>查看全部 →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {ITEMS.map((item, i) => (
              <Link key={item.no} to="/onboarding" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ marginBottom: '12px', overflow: 'hidden' }}>
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

      {/* ── 主编手记 ── */}
      <section style={{ background: '#1C1612', padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '32px' }}>— 智搭 · 主编手记</p>
          <blockquote style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, lineHeight: 1.5, color: '#fafaf8', fontStyle: 'italic', margin: 0, maxWidth: '860px' }}>
            "我们不卖衣服。我们卖的是 — 在你按下购买前，先看见自己穿上它的那一刻。"
          </blockquote>
        </div>
      </section>

      {/* ── 风格系统入口 ── */}
      <section style={{ background: C.cream, padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>我的风格系统</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, lineHeight: 1.3, marginBottom: '16px' }}>
              先了解自己，<br />再购买任何一件。
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.9', marginBottom: '32px' }}>
              体型 · 色彩 · 风格 · 时尚个性，四项测试构成你的专属风格档案，让每一次购买都成为精准决策。
            </p>
            <Link to="/onboarding" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: '#fff', background: C.h1, padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }}>
              建立我的风格档案
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: C.border }}>
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

      {/* ── Footer ── */}
      <footer style={{ background: '#1C1612', padding: '64px 64px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '48px', marginBottom: '56px' }}>
            <div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: '#fafaf8', marginBottom: '12px' }}>智搭信件</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.7', marginBottom: '20px' }}>
                每月一封 — 一组当季搭配、一篇专栏、一段穿衣的私想。
              </p>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <input placeholder="you@email.com" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#fafaf8', padding: '8px 0' }} />
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', padding: '8px 0' }}>订阅</button>
              </div>
            </div>
            {[
              { title: '产品', items: ['系列', '试衣间', '衣橱', '搭配方案'] },
              { title: '关于', items: ['品牌故事', '专栏', '合作', '招聘'] },
              { title: '支持', items: ['帮助中心', '联系我们', '尺码指引', '隐私'] },
            ].map(col => (
              <div key={col.title}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>{col.title}</p>
                {col.items.map(t => (
                  <p key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '12px', cursor: 'pointer' }}>{t}</p>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>© 2026 智搭 · ZHIDA STUDIO</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>上海 — 米兰 — 东京</p>
          </div>
        </div>
      </footer>

    </div>
  )
}

// 色彩系统
const C = {
  bg: '#F5F2ED',
  dark: '#1C1612',
  mid: '#3D3028',
  accent: '#8B4A3C',   // 浅玫瑰棕，对应图1的斜体强调色
  gold: '#B8973A',
  muted: '#9A8F84',
  border: '#DDD6CC',
  cream: '#FAF9F7',
}

// 本季精选商品（占位）
const ITEMS = [
  { no: '02', name: '米色风衣', en: 'Camel Trench', aspect: '4/5' },
  { no: '05', name: '真丝衬衫', en: 'Silk Shirt', aspect: '4/5' },
  { no: '08', name: '羊绒针织', en: 'Cashmere Knit', aspect: '4/5' },
  { no: '11', name: '直筒西裤', en: 'Tailored Trousers', aspect: '4/5' },
  { no: '14', name: '亚麻外套', en: 'Linen Coat', aspect: '4/5' },
  { no: '17', name: '真皮手袋', en: 'Leather Tote', aspect: '4/5' },
]

// 占位图色板
const PLACEHOLDER_COLORS = [
  '#E8E0D5', '#D4C8B8', '#C8B8A8', '#DDD0C0',
  '#E4D8C8', '#D8CCB8',
]

function PlaceholderImg({ color, no, label }: { color: string; no: string; label: string }) {
  return (
    <div style={{
      width: '100%', paddingBottom: '125%', position: 'relative',
      background: color, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: 'rgba(0,0,0,0.3)' }}>NO. {no}</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: 'rgba(0,0,0,0.4)' }}>{label}</span>
      </div>
    </div>
  )
}

// Hero 右侧占位衣架图
function HeroPlaceholder() {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: '600px',
      background: '#EAE4DC',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 挂杆线条 */}
      <div style={{ position: 'absolute', top: '80px', left: '10%', right: '10%', height: '2px', background: '#C4B8A8' }} />
      {/* 衣架占位 */}
      {[0,1,2,3,4,5,6].map(i => (
        <div key={i} style={{
          position: 'absolute', top: '82px',
          left: `${14 + i * 11}%`,
          width: '1px', height: `${180 + Math.sin(i) * 30}px`,
          background: '#B4A898',
        }} />
      ))}
      <div style={{ position: 'absolute', bottom: '60px', right: '24px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '11px', color: '#8A7A6A', letterSpacing: '1px' }}>春日 SS26</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#AAA09A', letterSpacing: '2px', marginTop: '2px' }}>NO. 14</p>
      </div>
    </div>
  )
}

export default function HomePage() {

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
        {/* 左：文字 */}
        <div style={{
          padding: '120px 64px 80px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: C.bg,
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px',
            color: C.muted, marginBottom: '40px',
          }}>
            NO. 01 — 春日 SS26
          </p>
          <h1 style={{
            fontFamily: 'Georgia, serif', fontSize: '72px', fontWeight: 400,
            lineHeight: 1.05, color: C.dark, marginBottom: '32px',
          }}>
            为今天<br />
            <em style={{ color: C.accent, fontStyle: 'italic' }}>试一件。</em>
          </h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.sub,
            lineHeight: '1.9', maxWidth: '360px', marginBottom: '56px',
          }}>
            智搭是一个为衣橱而生的 AI 工作室 — 虚拟试穿你已经拥有的、想象你尚未穿过的。
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to="/onboarding" style={{
              fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
              color: C.cream, background: C.dark, padding: '14px 32px',
              textDecoration: 'none', display: 'inline-block',
            }}>
              开始试衣
            </Link>
            <Link to="/onboarding" style={{
              fontFamily: 'Georgia, serif', fontSize: '14px',
              color: C.sub, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              了解智搭 <span style={{ fontSize: '16px' }}>→</span>
            </Link>
          </div>
        </div>
        {/* 右：图片 */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <HeroPlaceholder />
        </div>
      </section>

      {/* ── 三个工作室 ── */}
      <section style={{ background: C.cream, padding: '96px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '64px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '4px', color: C.muted, marginBottom: '16px' }}>三件事</p>
            <h2 style={{
              fontFamily: 'Georgia, serif', fontSize: '52px', fontWeight: 400,
              lineHeight: 1.1, color: C.dark,
            }}>
              三个工作室，<br />
              <em style={{ color: C.accent, fontStyle: 'italic' }}>一个衣橱。</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
            {[
              {
                num: '01', title: '虚拟试衣', en: 'FITTING ROOM',
                desc: '上传一张全身照，在屏幕里试穿你尚未拥有的每一件。光感、垂坠、剪裁，都被精准还原。',
                to: '/onboarding',
              },
              {
                num: '02', title: '搭配方案', en: 'DAILY OUTFITS',
                desc: '为今日的天气、心情、场合提出一组方案。三件可能，而不是三十。我们相信选择越少，越自由。',
                to: '/onboarding',
              },
              {
                num: '03', title: '衣橱', en: 'WARDROBE',
                desc: '将你的衣物收入数字衣橱。按色温、材质、季节自动归档。重新发现你已经拥有的。',
                to: '/profile',
              },
            ].map((item, i) => (
              <div key={item.num} style={{
                padding: '48px 40px',
                borderTop: `1px solid ${C.border}`,
                borderRight: i < 2 ? `1px solid ${C.border}` : 'none',
              }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '13px', fontStyle: 'italic', color: C.muted, marginBottom: '20px' }}>{item.num}</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.dark, marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.muted, marginBottom: '20px' }}>{item.en}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.sub, lineHeight: '1.85' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 本季精选 ── */}
      <section style={{ padding: '96px 64px', background: C.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '4px', color: C.muted, marginBottom: '10px' }}>本季精选</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '48px', fontWeight: 400, color: C.dark, lineHeight: 1.1 }}>
                当下的二十件
              </h2>
            </div>
            <Link to="/onboarding" style={{
              fontFamily: 'Georgia, serif', fontSize: '14px', fontStyle: 'italic',
              color: C.sub, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              查看全部 →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {ITEMS.map((item, i) => (
              <Link key={item.no} to="/onboarding" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ marginBottom: '14px', overflow: 'hidden' }}>
                  <PlaceholderImg color={PLACEHOLDER_COLORS[i]} no={item.no} label={item.name} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: C.dark }}>{item.name}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px', fontStyle: 'italic', color: C.muted }}>{item.en}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 主编手记 ── */}
      <section style={{ background: C.dark, padding: '96px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '40px' }}>
            — 智搭 · 主编手记
          </p>
          <blockquote style={{
            fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: 400,
            lineHeight: 1.4, color: C.cream, fontStyle: 'italic',
            margin: 0, maxWidth: '900px',
          }}>
            "我们不卖衣服。我们卖的是 — 在你按下购买前，先看见自己穿上它的那一刻。"
          </blockquote>
        </div>
      </section>

      {/* ── 风格系统入口 ── */}
      <section style={{ background: C.cream, padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '4px', color: C.muted, marginBottom: '16px' }}>我的风格系统</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: 400, color: C.dark, lineHeight: 1.2, marginBottom: '20px' }}>
              先了解自己，<br />再购买任何一件。
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.sub, lineHeight: '1.9', marginBottom: '36px' }}>
              体型测试 · 色彩测试 · 风格测试 · 时尚个性测试。四项测试构成你的专属风格档案，让每一次购买都成为精准决策。
            </p>
            <Link to="/onboarding" style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px',
              color: C.cream, background: C.dark, padding: '14px 28px',
              textDecoration: 'none', display: 'inline-block',
            }}>
              建立我的风格档案
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: C.border }}>
            {[
              { num: '01', label: '体型测试', sub: 'BODY' },
              { num: '02', label: '色彩测试', sub: 'COLOR' },
              { num: '03', label: '风格测试', sub: 'STYLE' },
              { num: '04', label: '时尚个性', sub: 'FASHION' },
            ].map(t => (
              <div key={t.num} style={{ background: C.cream, padding: '28px 24px' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'italic', color: C.muted, marginBottom: '10px' }}>{t.num}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: C.dark, marginBottom: '4px' }}>{t.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '3px', color: C.muted }}>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: C.dark, padding: '64px 64px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '48px', marginBottom: '64px' }}>
            {/* 订阅 */}
            <div style={{ gridColumn: '1 / 2' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 400, color: C.cream, marginBottom: '12px' }}>智搭信件</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.7', marginBottom: '24px' }}>
                每月一封 — 一组当季搭配、一篇专栏、一段穿衣的私想。
              </p>
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <input placeholder="you@email.com" style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.cream,
                  padding: '8px 0',
                }} />
                <button style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1px',
                  color: 'rgba(255,255,255,0.5)', padding: '8px 0',
                }}>订阅</button>
              </div>
            </div>

            {/* 产品 */}
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>产品</p>
              {['系列', '试衣间', '衣橱', '搭配方案'].map(t => (
                <p key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', cursor: 'pointer' }}>{t}</p>
              ))}
            </div>

            {/* 关于 */}
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>关于</p>
              {['品牌故事', '专栏', '合作', '招聘'].map(t => (
                <p key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', cursor: 'pointer' }}>{t}</p>
              ))}
            </div>

            {/* 支持 */}
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>支持</p>
              {['帮助中心', '联系我们', '尺码指引', '隐私'].map(t => (
                <p key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', cursor: 'pointer' }}>{t}</p>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>
              © 2026 智搭 · ZHIDA STUDIO
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '11px', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)' }}>
              上海 — 米兰 — 东京
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
