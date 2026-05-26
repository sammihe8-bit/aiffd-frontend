import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#faf9f7', dark: '#0f0f0d',
}

// public/shiyitu1.png  → 用户紧身衣照片
// public/shiyitu2.png  → 用户选款中间态
// public/shiyitu3.png  → 上身效果最终态

const STEPS = [
  {
    label: '上传照片',
    sub: '上传紧身衣照片，AI 建立你的体型档案',
    img: '/shiyitu1.png',
    scan: true, meas: true, card: false, shimmer: false, badge: false, pulse: false,
  },
  {
    label: '选择款式',
    sub: '浏览推荐款式或上传截图，一键选择试穿',
    img: '/shiyitu2.png',
    scan: false, meas: false, card: true, shimmer: false, badge: false, pulse: false,
  },
  {
    label: '上身效果',
    sub: '实时渲染，360° 全方位查看穿着效果',
    img: '/shiyitu3.png',
    scan: false, meas: false, card: false, shimmer: true, badge: true, pulse: true,
  },
]
const DURATION = 3200

function VirtualFitAnimation() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const stepRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCycle = (i: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (progRef.current) clearInterval(progRef.current)
    stepRef.current = i
    setStep(i)
    setProgress(0)

    let p = 0
    progRef.current = setInterval(() => {
      p = Math.min(p + (40 / DURATION) * 100, 100)
      setProgress(p)
    }, 40)

    timerRef.current = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % STEPS.length
      setStep(stepRef.current)
      setProgress(0)
      p = 0
    }, DURATION)
  }

  useEffect(() => {
    startCycle(0)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (progRef.current) clearInterval(progRef.current)
    }
  }, [])

  const s = STEPS[step]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '280px' }}>
      <style>{`
        @keyframes vfScan {
          0%   { top: 0;    opacity: .85 }
          85%  { top: 100%; opacity: .4  }
          100% { top: 100%; opacity: 0   }
        }
        @keyframes vfShimmer { 0%,100%{opacity:0} 40%,60%{opacity:.2} }
        @keyframes vfBorderPulse {
          0%,100%{ box-shadow: 0 0 0 0 rgba(184,151,58,0) }
          50%    { box-shadow: 0 0 0 4px rgba(184,151,58,.4) }
        }
        .vf-scan-active {
          animation: vfScan 1.8s cubic-bezier(.4,0,.6,1) infinite !important;
        }
        .vf-shimmer-active {
          animation: vfShimmer 2.4s ease-in-out infinite !important;
        }
        .vf-pulse-active {
          animation: vfBorderPulse 2.2s ease-in-out infinite !important;
        }
        .vf-meas {
          opacity: 0; transition: opacity .35s ease;
        }
        .vf-meas.show { opacity: 1; }
        .vf-card {
          opacity: 0; transition: opacity .4s ease; pointer-events: none;
        }
        .vf-card.show { opacity: 1; }
        .vf-badge {
          opacity: 0; transition: opacity .35s ease;
        }
        .vf-badge.show { opacity: 1; }
        .vf-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: contain; object-position: top center;
          transition: opacity .55s ease;
        }
        .vf-dot {
          width: 6px; height: 6px; border-radius: 3px;
          background: rgba(184,151,58,.25);
          transition: all .3s ease; cursor: pointer; border: none; padding: 0;
        }
        .vf-dot.active {
          width: 22px; background: #B8973A;
        }
      `}</style>

      {/* ── 照片框：无背景色，透明 ── */}
      <div
        style={{
          position: 'relative', width: '280px', height: '430px',
          overflow: 'hidden', borderRadius: '8px',
        }}
        className={s.pulse ? 'vf-pulse-active' : ''}
      >
        {STEPS.map((st, i) => (
          <img key={i} src={st.img} alt={st.label} className="vf-img"
            style={{ opacity: step === i ? 1 : 0, zIndex: step === i ? 3 : 0 }}/>
        ))}

        {/* 扫描线 — 仅 Step 1 时渲染 */}
        {s.scan && (
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: '2px',
            background: 'linear-gradient(to right, transparent, #B8973A 35%, #fff 50%, #B8973A 65%, transparent)',
            pointerEvents: 'none', zIndex: 2,
          }} className="vf-scan-active" />
        )}

        {/* 四角框 — 仅 Step 1 扫描时显示 */}
        {s.scan && [
          { top: '6px', left: '6px', d: 'M0 16V0H16' },
          { top: '6px', right: '6px', d: 'M16 16V0H0' },
          { bottom: '6px', left: '6px', d: 'M0 0V16H16' },
          { bottom: '6px', right: '6px', d: 'M16 0V16H0' },
        ].map((p, i) => {
          const { d, ...pos } = p
          return (
            <div key={i} style={{ position: 'absolute', width: '16px', height: '16px', ...pos, zIndex: 7, transition: 'opacity .3s ease' }}>
              <svg width="16" height="16" viewBox="0 0 16 16">
                <path d={d} fill="none" stroke="#B8973A" strokeWidth="1.3" opacity="0.45"/>
              </svg>
            </div>
          )
        })}

        {/* 体型标注 */}
        {[
          { top: '18%', label: 'B 86' },
          { top: '38%', label: 'W 66' },
          { top: '55%', label: 'H 90' },
        ].map(({ top, label }) => (
          <span key={label} className={`vf-meas${s.meas ? ' show' : ''}`} style={{
            position: 'absolute', right: '8px', top,
            fontSize: '11px', fontFamily: 'Georgia,serif', color: C.gold,
            background: 'rgba(253,248,238,.92)', padding: '2px 7px',
            border: `0.5px solid ${C.gold}`, borderRadius: '2px', zIndex: 7,
          }}>{label}</span>
        ))}

        {/* 选款浮动卡片 — 右下角，不遮脸 */}
        <div className={`vf-card${s.card ? ' show' : ''}`} style={{
          position: 'absolute', right: '12px', bottom: '56px',
          width: '80px', background: 'rgba(255,255,255,.96)',
          borderRadius: '8px', padding: '6px', zIndex: 9,
          border: `1px solid rgba(184,151,58,.5)`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          <img src="/dress.png" alt="选中款式" style={{ width: '100%', borderRadius: '4px', display: 'block' }}/>
          {s.card && (
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 0, height: '1.5px',
              background: 'linear-gradient(to right, transparent, #B8973A 35%, #fff 50%, #B8973A 65%, transparent)',
              pointerEvents: 'none', zIndex: 10,
              animation: 'vfScan 1.4s cubic-bezier(.4,0,.6,1) infinite',
            }} />
          )}
          <div style={{
            position: 'absolute', top: '-9px', right: '-9px',
            width: '20px', height: '20px', background: C.gold, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 11,
          }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 金光扫射 */}
        <div className={s.shimmer ? 'vf-shimmer-active' : ''} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6,
          background: 'linear-gradient(130deg, transparent 20%, rgba(184,151,58,.5) 50%, transparent 80%)',
          opacity: 0,
        }}/>

        {/* 360° 标签 */}
        <div className={`vf-badge${s.badge ? ' show' : ''}`} style={{
          position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'Georgia,serif', fontSize: '11px', letterSpacing: '2px', color: C.gold,
          background: 'rgba(255,255,255,.93)', padding: '4px 12px',
          border: `1px solid ${C.gold}`, borderRadius: '2px',
          whiteSpace: 'nowrap' as const, zIndex: 9,
        }}>360° 预览</div>
      </div>

      {/* ── 进度条 ── */}
      <div style={{ width: '280px', height: '2px', background: 'rgba(184,151,58,.15)', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: C.gold, borderRadius: '1px', transition: 'width .04s linear' }}/>
      </div>

      {/* ── 步骤点 ── */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {STEPS.map((_, i) => (
          <button key={i} className={`vf-dot${step === i ? ' active' : ''}`}
            onClick={() => startCycle(i)} aria-label={`步骤 ${i + 1}`}/>
        ))}
      </div>

      {/* ── 步骤文字 ── */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: '12px', letterSpacing: '2.5px', color: C.gold, textTransform: 'uppercase' as const, marginBottom: '6px' }}>
          {s.label}
        </div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: '12px', color: C.muted, lineHeight: 1.7 }}>
          {s.sub}
        </div>
      </div>
    </div>
  )
}

/* ── 主页面 ── */
export default function VirtualFitPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      num: '01', title: '基于你的真实档案',
      desc: '不是随机模特，不是标准身材。虚拟试衣建立在你的体型代码、色彩季型和风格主型之上——你看到的就是衣服穿在你身上真实的样子。',
      detail: '系统读取你的体型数据（骨架结构、腰臀比、身体线条）和色彩档案，实时渲染颜色在你肤色上的真实呈现，而非色块叠加。',
    },
    {
      num: '02', title: '两种试穿入口',
      desc: 'AIFFD 推荐的商品直接一键试穿；你自己拍摄或截图的任何产品图、模特图，上传后选择穿在自己身上。',
      detail: '从购物 App 截图、小红书种草图、品牌官网产品页，任何图片来源均可。系统自动识别服装轮廓，适配到你的身形。',
    },
    {
      num: '03', title: '360° 全方位预览',
      desc: '前面好看不够，侧面、背面、走动时的状态才是购买决策的关键。旋转查看每一个角度，告别收到货才后悔的窘境。',
      detail: '基于你的 3D 形象（高级用户），可实时旋转前后左右 360° 预览穿搭效果。普通用户提供前/侧/背三视图对比。',
    },
    {
      num: '04', title: '高级用户：专属 3D 形象',
      desc: '上传正面、侧面照片，系统自动生成你的专属 3D 数字形象。这是你在 AIFFD 的永久资产，越用越精准。',
      detail: '3D 形象会随着你每次反馈持续优化——你告诉我们哪件穿着不合适，系统记录并修正，下一次预览更接近真实。',
    },
  ]

  const timeline = [
    { year: '2019', event: '开始研究生成式 AI 在时尚领域的应用，探索服装与真实人体的适配算法' },
    { year: '2021', event: '完成第一代虚拟试衣原型，实现基于 2D 照片的服装叠加渲染' },
    { year: '2023', event: '引入体型代码系统，实现服装在不同骨架和软组织分布下的差异化渲染' },
    { year: '2025', event: 'AIFFD 平台上线，虚拟试衣作为高级会员核心功能正式开放内测' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>

      {/* ── Hero ── */}
      <div style={{ background: C.dark, color: '#fff', padding: '96px 24px 80px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', gap: '64px', alignItems: 'center',
          flexWrap: 'wrap' as const,
        }}>
          {/* 左文字 */}
          <div style={{ flex: '1 1 360px', minWidth: '280px' }}>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '24px' }}>
              AIFFD · 虚拟试衣
            </p>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(32px,4vw,56px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 28px', maxWidth: '640px' }}>
              在买之前，<br />
              先穿在<em style={{ color: C.gold, fontStyle: 'normal' }}>你自己</em>身上看看
            </h1>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, maxWidth: '480px', marginBottom: '48px' }}>
              不是标准模特，不是色块叠加。AIFFD 虚拟试衣基于你的真实体型档案和色彩季型，让你在购买前看到衣服穿在你身上的真实效果。
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' as const, alignItems: 'center' }}>
              <a href="#waitlist" style={{
                display: 'inline-block', background: C.gold, color: '#fff',
                padding: '14px 32px', textDecoration: 'none',
                fontFamily: 'Inter,sans-serif', fontSize: '13px', letterSpacing: '2px',
              }}>
                加入候补名单
              </a>
              <Link to="/auth" style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', letterSpacing: '1px' }}>
                已有账户 →
              </Link>
            </div>
          </div>

          {/* 右侧单图动画 */}
          <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
            <VirtualFitAnimation />
          </div>
        </div>
      </div>

      {/* ── 功能模块 ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>HOW IT WORKS</p>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(26px,3vw,40px)', fontWeight: 400, color: C.h1, marginBottom: '48px' }}>
          四个维度，真正还原穿着体验
        </h2>
        <div style={{ display: 'flex', gap: '0', border: `1px solid ${C.border}` }}>
          <div style={{ width: '220px', flexShrink: 0, borderRight: `1px solid ${C.border}` }}>
            {features.map((f, i) => (
              <div key={f.num} onClick={() => setActiveFeature(i)} style={{
                padding: '24px 20px',
                borderBottom: i < features.length - 1 ? `1px solid ${C.border}` : 'none',
                cursor: 'pointer',
                background: activeFeature === i ? '#fdf8ee' : 'transparent',
                transition: 'background 0.2s',
              }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '11px', color: activeFeature === i ? C.gold : C.muted, marginBottom: '6px' }}>{f.num}</div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '14px', color: activeFeature === i ? C.h1 : C.body, lineHeight: 1.5 }}>{f.title}</div>
                {activeFeature === i && <div style={{ width: '24px', height: '1px', background: C.gold, marginTop: '10px' }}/>}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: '40px 36px' }}>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', marginBottom: '16px' }}>
              {features[activeFeature].num}
            </div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '26px', fontWeight: 400, color: C.h1, marginBottom: '20px' }}>
              {features[activeFeature].title}
            </h3>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.9, marginBottom: '20px' }}>
              {features[activeFeature].desc}
            </p>
            <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: C.muted, lineHeight: 1.9, borderLeft: `2px solid ${C.gold}`, paddingLeft: '16px' }}>
              {features[activeFeature].detail}
            </p>
          </div>
        </div>
      </div>

      {/* ── 技术时间线 ── */}
      <div style={{ background: C.dark, padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>TECHNOLOGY</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, color: '#fff', marginBottom: '48px' }}>
            2019 年起，我们就在做这件事
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {timeline.map((item, i) => (
              <div key={item.year} style={{
                display: 'flex', gap: '40px', alignItems: 'flex-start',
                padding: '28px 0', borderBottom: i < timeline.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '20px', color: C.gold, minWidth: '56px', flexShrink: 0 }}>{item.year}</div>
                <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>{item.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 候补注册 ── */}
      <div id="waitlist" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Georgia,serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>EARLY ACCESS</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, color: C.h1, marginBottom: '16px' }}>
            成为第一批体验用户
          </h2>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.9, marginBottom: '36px' }}>
            虚拟试衣功能正在对高级会员开放内测。留下你的邮箱，我们会在你的名额到来时第一时间通知你。
          </p>
          {submitted ? (
            <div style={{ background: '#f7f4ef', border: `1px solid ${C.gold}`, padding: '28px 32px' }}>
              <p style={{ fontFamily: 'Georgia,serif', fontSize: '20px', color: C.gold, marginBottom: '8px' }}>已收到，谢谢</p>
              <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
                我们会在虚拟试衣开放时第一时间联系你。
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0', border: `1px solid ${C.border}` }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="你的邮箱地址"
                style={{
                  flex: 1, padding: '16px 20px', border: 'none', outline: 'none',
                  fontFamily: 'Inter,sans-serif', fontSize: '14px', background: '#fff',
                }}
              />
              <button
                onClick={() => { if (email) setSubmitted(true) }}
                style={{
                  padding: '16px 28px', background: C.gold, color: '#fff', border: 'none',
                  fontFamily: 'Inter,sans-serif', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                加入候补
              </button>
            </div>
          )}
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', color: C.muted, marginTop: '16px' }}>
            已有 AIFFD 账户？
            <Link to="/auth" style={{ color: C.gold, marginLeft: '6px', textDecoration: 'none' }}>登录后直接预约 →</Link>
          </p>
        </div>
      </div>

    </div>
  )
}
