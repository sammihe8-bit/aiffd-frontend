import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

// 与首页 HomePage 同一套黑白灰品牌色和版式。
const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#737373', border: '#E5E5E5',
  bg: '#FFFFFF', surface: '#F5F5F5', accent: '#111111',
  primary: '#111111', onPrimary: '#FFFFFF',
  inverseMuted: '#BDBDBD', inverseText: '#F5F5F5',
}

const label: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.accent, marginBottom: '12px',
}
const h2: React.CSSProperties = {
  fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, lineHeight: 1.3, margin: 0,
}
const bodyText: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: 1.9, margin: '0 0 20px',
}

// ── 可编辑内容 ─────────────────────────────────────────────

// 创始人手记：草稿，请按你自己的经历和口吻改写。
const FOUNDER_NOTE = [
  '很多女性的衣橱里都有这样几件衣服：在店里看着很好，买回家却一次也没穿过。问题往往不在衣服，而在于购买之前，我们并不真正了解什么适合自己。',
  '色彩、体型、气质、生活场景，每一项都会影响一件衣服穿在身上的样子。过去，想把这些弄清楚，需要请造型师、反复试错，花费大量时间和金钱。',
  'AIFFD 想做的，是把这套判断变成每个人都能拥有的系统：先了解自己，再决定买什么。',
]
const FOUNDER_SIGN = '— AIFFD 创始人'

const METHODS = [
  { num: '01', title: '体型', en: 'BODY', desc: '从骨架、比例与线条出发，判断什么样的剪裁、长度和廓形最能修饰你的身形。' },
  { num: '02', title: '色彩', en: 'COLOR', desc: '冷暖底调 → 东方五季 → 25 季精准分类。以五行色彩理论为基础，更贴近亚洲女性的真实肤色分布。' },
  { num: '03', title: '风格', en: 'STYLE', desc: '整合体型、气韵与场景需求，得出你的风格主型——不是模糊的标签，而是可以执行的穿搭方向。' },
  { num: '04', title: '时尚个性', en: 'FASHION', desc: '你喜欢什么、想成为什么样的人。让建议不只是"适合"，也是"你想穿的"。' },
]

const BELIEFS = [
  { title: '先了解自己，再购买', desc: '每一次购买都应该是确定的决定，而不是又一次尝试。' },
  { title: '选择越少，越自由', desc: '我们给你三种可能，而不是三十种。好的建议，是帮你排除。' },
  { title: '重新发现已经拥有的', desc: '最好的一件，可能已经挂在你的衣橱里，只是还没被正确地搭配。' },
]

// ── 页面 ───────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      {/* 开篇 */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80vh' }}>
        <div style={{ padding: '80px 32px 80px 160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ ...label, marginBottom: '28px' }}>关于 AIFFD · ABOUT</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 400, lineHeight: 1.25, color: C.h1, margin: '0 0 24px' }}>
            在按下购买之前，<br /><em style={{ fontStyle: 'italic' }}>先看见自己。</em>
          </h1>
          <p style={{ ...bodyText, maxWidth: '400px', marginBottom: 0 }}>
            AIFFD 智搭是一个购买前的风格决策系统。我们把色彩、体型、风格与个性整合成一份属于你的风格档案，让每一次穿衣与购买都更确定。
          </p>
        </div>
        <div
          role='img'
          aria-label='衣橱'
          style={{
            minHeight: '520px', backgroundColor: C.surface,
            backgroundImage: 'url(/hero-wardrobe.jpeg)',
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          }}
        />
      </section>

      {/* 创始人手记 */}
      <section style={{ background: C.primary, padding: '96px 64px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <p style={{ ...label, color: C.inverseMuted, letterSpacing: '3px', marginBottom: '40px' }}>— 我们为什么做 AIFFD</p>
          {FOUNDER_NOTE.map((para, i) => (
            <p key={i} style={{
              fontFamily: 'Georgia, serif', fontStyle: i === FOUNDER_NOTE.length - 1 ? 'italic' : 'normal',
              fontSize: i === FOUNDER_NOTE.length - 1 ? '26px' : '19px',
              lineHeight: 1.8, color: C.inverseText, margin: '0 0 28px',
            }}>{para}</p>
          ))}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: C.inverseMuted, marginTop: '40px' }}>{FOUNDER_SIGN}</p>
        </div>
      </section>

      {/* 方法 */}
      <section style={{ padding: '96px 64px', background: C.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <p style={label}>方法 · METHOD</p>
            <h2 style={h2}>四个维度，<em style={{ fontStyle: 'italic' }}>一份档案。</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '1px solid ' + C.border }}>
            {METHODS.map((m, i) => (
              <div key={m.num} style={{ padding: '40px 28px', borderRight: i < METHODS.length - 1 ? '1px solid ' + C.border : 'none' }}>
                <p style={{ ...label, marginBottom: '16px' }}>{m.num}</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: C.h2, margin: '0 0 4px' }}>{m.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', color: C.muted, margin: '0 0 16px' }}>{m.en}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.8, margin: 0 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: C.border }} />

      {/* 我们相信 */}
      <section style={{ padding: '96px 64px', background: C.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <p style={label}>我们相信 · BELIEFS</p>
            <h2 style={h2}>三件我们坚持的事。</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '48px' }}>
            {BELIEFS.map((b, i) => (
              <div key={b.title} style={{ borderTop: '1px solid ' + C.h1, paddingTop: '24px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '3px', color: C.muted, margin: '0 0 16px' }}>0{i + 1}</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: C.h2, margin: '0 0 12px' }}>{b.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.8, margin: 0 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 项目阶段 */}
      <section style={{ padding: '96px 64px', background: C.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>
          <div>
            <p style={label}>项目阶段 · STATUS</p>
            <h2 style={h2}>我们正在内测中。</h2>
          </div>
          <div>
            <p style={bodyText}>
              AIFFD 目前处于研究原型与小范围在线测试阶段。本轮测试免费，部分功能、问卷与分析逻辑仍在持续完善。你的每一条反馈，都会帮助这套系统变得更准确。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid ' + C.border }}>
              {[
                { to: '/test-guide', text: '阅读《AIFFD在线测试说明》' },
                { to: '/privacy', text: '阅读《AIFFD隐私政策与研究测试数据说明》' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '18px 0',
                  borderBottom: '1px solid ' + C.border, textDecoration: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.h2,
                }}>
                  <span>{l.text}</span><span>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 联系 */}
      <section style={{ padding: '80px 64px', background: C.surface, borderTop: '1px solid ' + C.border }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '48px' }}>
          <div>
            <p style={{ ...label, color: C.muted }}>联系 · CONTACT</p>
            <a href='mailto:hello@aiffd.com' style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h1, textDecoration: 'none' }}>hello@aiffd.com</a>
          </div>
          <div>
            <p style={{ ...label, color: C.muted }}>城市 · CITIES</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h1, margin: 0 }}>Los Angeles · Shanghai · Online</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: C.onPrimary, background: C.primary, padding: '14px 28px', textDecoration: 'none' }}>建立我的风格档案</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
