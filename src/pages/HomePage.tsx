import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#faf9f7', card: '#ffffff', accent: '#fdf8ee', dark: '#0f0f0d',
}

// 五行色系 — 首屏色块动态展示
const ELEMENTS = [
  { name: '木', en: 'Wood', color: '#6B8A4A', desc: '生发·清新' },
  { name: '火', en: 'Fire', color: '#C0392B', desc: '明艳·光感' },
  { name: '土', en: 'Earth', color: '#8B7355', desc: '稳定·高级' },
  { name: '金', en: 'Metal', color: '#B8973A', desc: '清洁·利落' },
  { name: '水', en: 'Water', color: '#2C5F8A', desc: '深邃·沉静' },
]

// 核心功能
const FEATURES = [
  {
    tag: '色彩系统',
    title: '三层色彩测试',
    desc: '冷暖底调 → 东方五季 → 25季精准分类。基于中国五行色彩理论，比西方四季体系更适合亚洲女性真实肤色分布。',
    link: '/test/color',
    cta: '开始色彩测试',
  },
  {
    tag: '风格系统',
    title: '13 风格主型',
    desc: '整合体型、气韵、骨架与场景需求，判断你的风格主型——不是「甜美」或「帅气」这种模糊标签，而是可执行的穿搭系统。',
    link: '/test/style',
    cta: '开始风格测试',
  },
  {
    tag: '个人档案',
    title: '专属风格档案',
    desc: '每一次测试都会沉淀进你的档案。色彩季型、风格主型、体型数据、场景需求——档案越完整，建议越精准。',
    link: '/profile',
    cta: '查看我的档案',
  },
]

// 方法论步骤
const STEPS = [
  { num: '01', title: '找到你的色彩', desc: '通过三层测试确认你的东方25季分类，知道哪些颜色让你气色饱满，哪些让你显灰显土。' },
  { num: '02', title: '找到你的风格', desc: '13种风格主型结合体型与气韵，给你一个可理解、可落地的穿搭系统，而不是泛泛的「建议穿A字裙」。' },
  { num: '03', title: '建立衣橱逻辑', desc: '知道适合什么之后，下一步是建立属于你的衣橱策略——什么该有，什么该淘汰，什么值得投资。' },
  { num: '04', title: '造型师落地（即将）', desc: '与专业造型师合作，将你的色彩和风格档案转化为真实的衣橱计划和购物清单。' },
]

// 内容占位卡
const CONTENT_PLACEHOLDERS = [
  { tag: '色彩趋势', title: '2025 秋冬主打色系解析', desc: '今季最值得投资的6个颜色方向，以及它们在五季体系中的对应位置。', date: '即将上线' },
  { tag: '穿搭案例', title: '长夏型女性的高级感衣橱', desc: '大地色系不等于土气——这里有 8 套证明「长夏型」有多难被替代的搭配。', date: '即将上线' },
  { tag: 'AIFFD 方法论', title: '为什么黄皮不等于暖皮', desc: '亚洲女性最常见的色彩误判，以及它如何让你一直买错衣服。', date: '即将上线' },
]

export default function HomePage() {
  const [activeElement, setActiveElement] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveElement(prev => (prev + 1) % ELEMENTS.length)
    }, 2400)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>

        {/* 左：文字 */}
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '24px' }}>
            AIFFD · 东方色彩与风格系统
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '52px', fontWeight: 400, color: C.h1, lineHeight: 1.15, margin: '0 0 24px' }}>
            穿对颜色，<br />活出气场
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: C.muted, lineHeight: 1.9, margin: '0 0 40px', maxWidth: '420px' }}>
            基于中国五行色彩理论，结合现代时尚穿搭体系，帮你找到属于自己的色彩季型与风格主型——不是模糊的建议，而是可执行的穿搭系统。
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/test/color" style={{
              display: 'inline-block', padding: '15px 32px',
              background: C.gold, color: '#fff',
              fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
              textDecoration: 'none', textTransform: 'uppercase',
            }}>
              开始色彩测试
            </Link>
            <Link to="/test/style" style={{
              display: 'inline-block', padding: '15px 32px',
              background: 'transparent', color: C.h1,
              border: `1px solid ${C.border}`,
              fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
              textDecoration: 'none', textTransform: 'uppercase',
            }}>
              开始风格测试
            </Link>
          </div>
        </div>

        {/* 右：五行色块 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ELEMENTS.map((el, i) => (
            <div
              key={el.name}
              onClick={() => setActiveElement(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: '20px',
                padding: '16px 20px',
                background: activeElement === i ? el.color : '#fff',
                border: `1px solid ${activeElement === i ? el.color : C.border}`,
                cursor: 'pointer',
                transition: 'all 0.4s ease',
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: activeElement === i ? 'rgba(255,255,255,0.25)' : el.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#fff' }}>{el.name}</span>
              </div>
              <div>
                <p style={{
                  fontFamily: 'Georgia, serif', fontSize: '16px',
                  color: activeElement === i ? '#fff' : C.h2,
                  margin: '0 0 2px',
                }}>{el.name} · {el.en}</p>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1px',
                  color: activeElement === i ? 'rgba(255,255,255,0.7)' : C.muted,
                  margin: 0,
                }}>{el.desc}</p>
              </div>
              {activeElement === i && (
                <div style={{ marginLeft: 'auto', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>
                  东方25季
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 什么是 AIFFD ─────────────────────────────────────── */}
      <section style={{ background: C.dark, padding: '100px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '24px', textAlign: 'center' }}>
            WHAT IS AIFFD
          </p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '38px', fontWeight: 400, color: '#fff', lineHeight: 1.3, textAlign: 'center', margin: '0 0 32px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
            中国女性的专属<br />色彩与风格系统
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, textAlign: 'center', maxWidth: '620px', margin: '0 auto 60px' }}>
            西方四季色彩理论建立在欧洲人的肤色基础上。亚洲女性的肤色分布更复杂——同样是「暖皮」，春季型和秋季型的穿搭逻辑完全不同；同样是「黄皮」，可能是暖调也可能是冷调。AIFFD 以中国五行理论为底层逻辑，将色彩体系细化为东方 25 季，更适合真实的亚洲肤色。
          </p>

          {/* 三个核心数字 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.1)' }}>
            {[
              { num: '25', unit: '季', desc: '东方色彩精准分类' },
              { num: '13', unit: '型', desc: '风格主型判断' },
              { num: '3', unit: '层', desc: '递进式色彩测试' },
            ].map(item => (
              <div key={item.num} style={{ padding: '40px 32px', background: C.dark, textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '10px' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '56px', color: C.gold, fontWeight: 400 }}>{item.num}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: C.gold }}>{item.unit}</span>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 方法论步骤 ───────────────────────────────────────── */}
      <section style={{ padding: '100px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '16px' }}>
          HOW IT WORKS
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, color: C.h1, margin: '0 0 60px' }}>
          从测试到穿搭，四步建立你的系统
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', background: C.border }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{
              background: C.bg, padding: '48px 40px',
              borderBottom: i < 2 ? `2px solid ${C.border}` : 'none',
            }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, marginBottom: '20px' }}>{s.num}</p>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: C.h1, margin: '0 0 14px' }}>{s.title}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.8, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 核心功能 ─────────────────────────────────────────── */}
      <section style={{ background: C.accent, padding: '100px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '16px' }}>
            TOOLS
          </p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, color: C.h1, margin: '0 0 60px' }}>
            免费使用的核心工具
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {FEATURES.map(f => (
              <div key={f.tag} style={{ background: C.card, padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, textTransform: 'uppercase', marginBottom: '16px' }}>{f.tag}</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: C.h1, margin: '0 0 16px' }}>{f.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.8, margin: '0 0 32px', flex: 1 }}>{f.desc}</p>
                <Link to={f.link} style={{
                  display: 'inline-block', padding: '12px 0',
                  borderTop: `1px solid ${C.border}`,
                  fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px',
                  color: C.gold, textDecoration: 'none', textTransform: 'uppercase',
                }}>
                  {f.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 内容板块占位 ─────────────────────────────────────── */}
      <section style={{ padding: '100px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '12px' }}>EDITORIAL</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, color: C.h1, margin: 0 }}>色彩 · 趋势 · 案例</h2>
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px' }}>内容平台即将上线</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {CONTENT_PLACEHOLDERS.map(c => (
            <div key={c.title} style={{ background: C.card, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
              {/* 占位图区域 */}
              <div style={{ height: '200px', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.border }}>✦</p>
              </div>
              <div style={{ padding: '24px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.gold, textTransform: 'uppercase', marginBottom: '10px' }}>{c.tag}</p>
                <h4 style={{ fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: 400, color: C.h1, margin: '0 0 10px', lineHeight: 1.4 }}>{c.title}</h4>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, lineHeight: 1.7, margin: '0 0 16px' }}>{c.desc}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.border, letterSpacing: '1px' }}>{c.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 底部 CTA ─────────────────────────────────────────── */}
      <section style={{ background: C.dark, padding: '100px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, textTransform: 'uppercase', marginBottom: '24px' }}>
          GET STARTED
        </p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '44px', fontWeight: 400, color: '#fff', lineHeight: 1.2, margin: '0 0 20px' }}>
          找到属于你的颜色<br />从第一次测试开始
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: '0 auto 48px', maxWidth: '480px' }}>
          色彩测试、风格测试永久免费。建立你的专属档案，越用越精准。
        </p>
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/test/color" style={{
            display: 'inline-block', padding: '16px 40px',
            background: C.gold, color: '#fff',
            fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
            textDecoration: 'none', textTransform: 'uppercase',
          }}>
            开始色彩测试
          </Link>
          <Link to="/subscribe" style={{
            display: 'inline-block', padding: '16px 40px',
            background: 'transparent', color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.2)',
            fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
            textDecoration: 'none', textTransform: 'uppercase',
          }}>
            了解付费功能
          </Link>
        </div>
      </section>

    </div>
  )
}
