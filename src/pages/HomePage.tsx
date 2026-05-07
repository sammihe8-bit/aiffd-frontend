import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useRef, useState } from 'react'

const problems = [
  { num: '01', title: '买了很多，但真正常穿的不多', desc: '衣橱越来越满，却总觉得没有合适的衣服。' },
  { num: '02', title: '试穿时还可以，回家就不对了', desc: '单品本身好看，但和身材、肤色、场景不匹配。' },
  { num: '03', title: '风格不稳定，容易被流行带走', desc: '每次购物都像重新开始，没有自己的长期判断系统。' },
  { num: '04', title: '高价单品更怕买错', desc: '不是买不起，而是不想再为错误选择付费。' },
]

const dimensions = [
  { num: '01', en: 'BODY',  title: '体型适配', tags: ['肩线','腰线','比例','松紧度','廓形'],   desc: '从结构出发判断剪裁与身形的匹配关系。', defaultDark: true },
  { num: '02', en: 'COLOR', title: '色彩适配', tags: ['肤色','发色','常穿色','明度','饱和度'], desc: '基于个人色彩系统判断色调与肤色的协调度。', defaultDark: false },
  { num: '03', en: 'STYLE', title: '风格适配', tags: ['优雅','自然','戏剧','浪漫','经典'],     desc: '匹配个人风格倾向，避免单品与气质违和。', defaultDark: false },
  { num: '04', en: 'SCENE', title: '场景适配', tags: ['通勤','聚会','旅行','正式','日常'],     desc: '判断单品在目标场景中的实际穿着可行性。', defaultDark: true },
]

const steps = [
  { step: 'STEP 01', title: '问卷初评', desc: '5步建立你的初始风格档案' },
  { step: 'STEP 02', title: 'AI 建档', desc: '生成 Style Profile 1.0' },
  { step: 'STEP 03', title: '持续反馈', desc: '上传穿搭与商品，系统不断学习' },
  { step: 'STEP 04', title: '定期更新', desc: '每季度档案升级，风格越来越准' },
]

const services = [
  { tag: 'AI',  title: 'AI 造型师',  desc: '即时回复，商品分析，每日穿搭建议', price: '免费起' },
  { tag: 'S1',  title: '专业造型师', desc: '人工审核，月度报告，场景造型方案', price: '会员专享' },
  { tag: 'S2+', title: '高级造型师', desc: '专属顾问，季度档案升级，高价值购买支持', price: '高级会员' },
]

const C = {
  h1: '#111111', h3: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

function DimCard({ d }: { d: typeof dimensions[0] }) {
  const [hovered, setHovered] = useState(false)
  const isDark = d.defaultDark || hovered

  const bg    = hovered && d.defaultDark ? '#111111'
              : d.defaultDark            ? '#2a2a2a'
              : hovered                  ? '#111111'
              :                            '#fafaf8'

  const titleColor = isDark ? '#f0ece0' : C.h3
  const descColor  = isDark ? '#999999' : C.body
  const barColor   = isDark ? C.gold    : '#1a1a1a'
  const tagColor   = isDark ? C.gold    : '#555'
  const tagBorder  = isDark ? C.gold    : '#ccc'
  const bgNumColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        padding: '32px 28px 40px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'background 0.25s',
      }}
    >
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>
        {d.num} · {d.en}
      </p>
      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: titleColor, marginBottom: '16px', transition: 'color 0.25s' }}>
        {d.title}
      </h3>
      <div style={{ width: '32px', height: '1px', background: barColor, marginBottom: '16px', transition: 'background 0.25s' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
        {d.tags.map((tag, j) => (
          <span key={j} style={{
            fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1.5px',
            color: tagColor, border: `0.5px solid ${tagBorder}`, padding: '4px 10px',
            transition: 'color 0.25s, border-color 0.25s',
          }}>
            {tag}
          </span>
        ))}
      </div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: descColor, lineHeight: '1.7', transition: 'color 0.25s' }}>
        {d.desc}
      </p>
      <span style={{
        position: 'absolute', bottom: '16px', right: '20px',
        fontFamily: 'Georgia, serif', fontSize: '48px', fontWeight: 400,
        color: bgNumColor, lineHeight: 1, pointerEvents: 'none',
        transition: 'color 0.25s',
      }}>
        {d.num}
      </span>
    </div>
  )
}

export default function HomePage() {
  const { token } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = canvasRef.current?.parentElement as HTMLElement
    const canvas = canvasRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')!
    const GOLD = ['#B8973A','#C9A84C','#D4B86A','#E8D49A','#F0E4B8']
    const N = 140
    let W = 0, H = 0, t = 0, rafId = 0
    let mouse = { x: -999, y: -999 }, active = false
    let particles: any[] = []

    const rand = (a: number, b: number) => a + Math.random() * (b - a)

    const mkParticle = (i: number) => ({
      x: rand(0, W), y: rand(0, H),
      r: rand(i < 36 ? 1.2 : 0.6, i < 36 ? 2.2 : 1.8),
      alpha: rand(0.25, 0.75),
      color: GOLD[Math.floor(Math.random() * GOLD.length)],
      vx: rand(-0.18, 0.18), vy: rand(-0.22, -0.08),
      phase: rand(0, Math.PI * 2), freq: rand(0.008, 0.02),
      isMouse: i < 36,
    })

    const resize = () => {
      W = canvas.width = wrap.offsetWidth
      H = canvas.height = wrap.offsetHeight
      particles = Array.from({ length: N }, (_, i) => mkParticle(i))
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      t++
      particles.forEach((p, i) => {
        if (p.isMouse && active) {
          p.x += (mouse.x + Math.sin(p.phase + t * p.freq * 2) * 40 - p.x) * 0.04
          p.y += (mouse.y + Math.cos(p.phase + t * p.freq * 2) * 24 - p.y) * 0.04
          p.alpha = 0.55 + 0.25 * Math.sin(t * 0.06 + p.phase)
        } else {
          p.x += p.vx + Math.sin(p.phase + t * p.freq) * 0.25
          p.y += p.vy * 0.5 + Math.cos(p.phase + t * p.freq * 0.7) * 0.18
          p.alpha = 0.3 + 0.3 * Math.sin(t * 0.025 + p.phase)
          if (p.y < -6) p.y = H + 4
          if (p.x < -6) p.x = W + 4
          if (p.x > W + 6) p.x = -4
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha))
        ctx.fill()
        ctx.globalAlpha = 1

        if (i % 7 === 0 && i + 1 < particles.length) {
          const q = particles[i + 1]
          const dx = q.x - p.x, dy = q.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 90) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = '#B8973A'
            ctx.globalAlpha = (1 - dist / 90) * 0.12
            ctx.lineWidth = 0.4
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      })
      rafId = requestAnimationFrame(draw)
    }

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
      active = true
    }
    const onLeave = () => { active = false }

    resize()
    draw()
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(rafId)
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="bg-cream">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: '#fafaf8', minHeight: '520px' }}>
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="max-w-2xl mx-auto">
            <p className="mb-8" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>
              购买前风格决策系统
            </p>
            <h1 className="font-normal mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: '42px', lineHeight: '1.2', color: C.h1 }}>
              40+ 女性的<em style={{ color: C.gold, fontStyle: 'normal' }}>风格档案</em>系统
            </h1>
            <p className="mb-10 max-w-lg mx-auto" style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.9' }}>
              从体型、色彩、风格与场景出发，减少无效购买，建立长期审美判断。
            </p>
            <div className="flex gap-4 flex-wrap items-center justify-center mb-5">
              <Link to="/onboarding" className="btn-primary">开始风格测试</Link>
              <Link to="/diagnosis" className="btn-outline">上传商品做分析</Link>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px' }}>
              5 分钟完成 · 获得初步风格判断 · 适合 40+ 女性
            </p>
          </div>
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── PROBLEMS ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>
            我们解决的问题
          </p>
          <h2 className="font-normal mb-4" style={{ fontFamily: 'Georgia, serif', fontSize: '32px', lineHeight: '1.3', color: C.h1 }}>
            40+ 女性买衣服，真正难的不是选择少，<br />
            而是<em style={{ color: C.gold, fontStyle: 'normal' }}>判断成本太高</em>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.85' }}>
            每一次购买决策背后，都是时间、精力与金钱的消耗。
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#e8e8e4]">
          {problems.map((p, i) => (
            <div key={i} className={['p-8', i % 2 === 0 ? 'border-r border-[#e8e8e4]' : '', i < 2 ? 'border-b border-[#e8e8e4]' : ''].join(' ')}>
              <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>{p.num}</p>
              <h3 className="font-normal mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '20px', lineHeight: '1.4', color: C.h3 }}>{p.title}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: C.body, lineHeight: '1.75' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── DIMENSIONS ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>
            AIFFD 如何判断一件衣服适不适合你
          </p>
          <h2 className="font-normal mb-4" style={{ fontFamily: 'Georgia, serif', fontSize: '32px', lineHeight: '1.3', color: C.h1 }}>
            我们不是推荐流行款，<br />
            而是判断<em style={{ color: C.gold, fontStyle: 'normal' }}>「适合度」</em>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.85' }}>
            AIFFD 不是让用户看更多衣服，而是帮助她少买错衣服。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-0" style={{ background: '#1a1a1a' }}>
          {dimensions.map((d, i) => <DimCard key={i} d={d} />)}
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>
            系统如何运作
          </p>
          <h2 className="font-normal" style={{ fontFamily: 'Georgia, serif', fontSize: '32px', lineHeight: '1.3', color: C.h1 }}>
            四步建立你的<em style={{ color: C.gold, fontStyle: 'normal' }}>专属档案</em>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[#e8e8e4]">
          {steps.map((s, i) => (
            <div key={i} className={`p-8 ${i < 3 ? 'border-r border-[#e8e8e4]' : ''}`}>
              <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>{s.step}</p>
              <h3 className="font-normal mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: C.h3 }}>{s.title}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: '1.7' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── SERVICES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="mb-4" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>
            服务分层
          </p>
          <h2 className="font-normal" style={{ fontFamily: 'Georgia, serif', fontSize: '32px', lineHeight: '1.3', color: C.h1 }}>
            AI 判断日常，<em style={{ color: C.gold, fontStyle: 'normal' }}>造型师</em>处理复杂
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className={`card-lux ${i === 1 ? 'border-[#B8973A]' : ''}`}>
              <div className="flex items-start justify-between mb-6">
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '3px', color: C.gold, border: `1px solid ${C.gold}`, padding: '3px 10px' }}>{s.tag}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>{s.price}</span>
              </div>
              <h3 className="font-normal mb-3" style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h3 }}>{s.title}</h3>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: C.body, lineHeight: '1.8' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── CTA ── */}
      {!token && (
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="mb-6" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold }}>
            立即开始
          </p>
          <h2 className="font-normal mb-6" style={{ fontFamily: 'Georgia, serif', fontSize: '32px', lineHeight: '1.3', color: C.h1 }}>
            建立你的专属<em style={{ color: C.gold, fontStyle: 'normal' }}>风格档案</em>
          </h2>
          <p className="mb-10 max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.8' }}>
            5 分钟完成初评，立即获得 Style Profile 1.0
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/onboarding" className="btn-primary">免费建立风格档案</Link>
            <Link to="/auth" className="btn-outline">查看会员方案</Link>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#e8e8e4] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.muted }}>AIFFD © 2026</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.muted }}>智搭 · 购买前风格决策系统</span>
        </div>
      </footer>

    </div>
  )
}
