import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'

const C = {
  gold: '#B8973A', goldLight: '#fdf8ee', border: '#e8e8e4',
  dark: '#0f0f0d', muted: '#999999', body: '#666666', h1: '#111111',
  bg: '#faf9f7',
}

const PLANS = [
  {
    id: 'newsletter',
    name: 'Newsletter',
    price: '免费',
    priceNote: '永久免费',
    tag: '',
    color: C.muted,
    desc: '每月一封，了解 AIFFD 的风格世界',
    features: [
      '每月精选搭配灵感',
      '专栏文章摘要',
      '当季色彩趋势简报',
      '新功能抢先预告',
    ],
    cta: '立即订阅',
    ctaStyle: 'outline',
  },
  {
    id: 'pro',
    name: 'Pro 会员',
    price: '¥99',
    priceNote: '/ 月',
    tag: '',
    color: C.gold,
    desc: '解锁 AI 风格分析，开始了解自己',
    features: [
      '体型代码测试 · 无限次',
      '色彩季型测试 · 无限次',
      '专栏全文阅读权限',
      '个人风格档案建立',
      '每月搭配方案推荐 × 3',
      '邮件优先客服支持',
    ],
    cta: '开始 Pro',
    ctaStyle: 'gold',
  },
  {
    id: 'premium',
    name: 'Premium 会员',
    price: '¥199',
    priceNote: '/ 月',
    tag: '最受欢迎',
    color: C.h1,
    desc: '完整 AI 试衣体验，一对一风格顾问',
    features: [
      'Pro 所有权益',
      '虚拟试衣 · 无限次',
      '专属 3D 体型形象生成',
      '每月搭配方案推荐 × 10',
      'AI 购物清单智能生成',
      '优先体验新功能 Beta',
    ],
    cta: '开始 Premium',
    ctaStyle: 'dark',
  },
  {
    id: 'annual',
    name: '年度私人顾问',
    price: '¥980',
    priceNote: '/ 年',
    tag: '限量名额',
    color: C.gold,
    desc: '深度定制，专属于你的一整年风格旅程',
    features: [
      'Premium 所有权益',
      '年度风格报告（4次/年）',
      '人工造型师 1v1 咨询 × 2',
      '线下活动优先邀请资格',
      '专属微信服务群',
      '定制胶囊衣橱规划',
    ],
    cta: '预约咨询',
    ctaStyle: 'gold-fill',
  },
]

const TESTIMONIALS = [
  { name: 'Vivian L.', role: '品牌总监 · 上海', text: '体型测试之后我才意识到自己一直在买错版型。现在买衣服像开了天眼。' },
  { name: 'Rachel M.', role: '自由撰稿人 · 洛杉矶', text: '虚拟试衣帮我退掉了三件本来要买的裙子，也让我果断入了两件犹豫很久的。值。' },
  { name: '陈小姐', role: '企业主 · 北京', text: '年度顾问服务是我送给自己 45 岁生日的礼物。比买包更值得。' },
]

export default function SubscribePage() {
  const [searchParams] = useSearchParams()
  const fromFooter = searchParams.get('subscribed') === 'true'
  const footerEmail = searchParams.get('email') || ''

  const [email, setEmail] = useState(footerEmail)
  const [subscribed, setSubscribed] = useState(fromFooter)
  const [billingAnnual, setBillingAnnual] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>

      {/* ── Hero ── */}
      <div style={{ background: C.dark, padding: '100px 24px 80px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '20px' }}>
          AIFFD · 订阅
        </p>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(36px,5vw,64px)', fontWeight: 400, color: '#fff', lineHeight: 1.1, margin: '0 auto 24px', maxWidth: '760px' }}>
          穿对衣服，<br/>
          <em style={{ color: C.gold, fontStyle: 'normal' }}>是一种值得投资的能力</em>
        </h1>
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.9, maxWidth: '480px', margin: '0 auto' }}>
          从免费 Newsletter 开始，到专属年度顾问——选择适合你现在阶段的方式，和 AIFFD 一起建立真正属于你的风格系统。
        </p>
      </div>

      {/* ── Newsletter 免费订阅 ── */}
      <div style={{ background: C.goldLight, borderBottom: `1px solid ${C.border}`, padding: '64px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '64px', alignItems: 'center', flexWrap: 'wrap' as const }}>

          {/* 左侧插画 */}
          <div style={{ flex: '0 0 auto' }}>
            <img
              src="/stylereport.png"
              alt="AIFFD 风格报告"
              style={{ width: '280px', display: 'block', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.12))' }}
            />
          </div>

          {/* 右侧文字+表单 */}
          <div style={{ flex: '1 1 300px', minWidth: '260px' }}>
          <p style={{ fontFamily: 'Georgia,serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>FREE · 永久免费</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '32px', fontWeight: 400, color: C.h1, marginBottom: '12px' }}>
            先从 Newsletter 开始
          </h2>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.8, marginBottom: '28px' }}>
            每月一封。一组当季搭配、一篇专栏、一段穿衣的私想。无推销，随时退订。
          </p>
          {subscribed ? (
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              <div style={{ padding: '24px 32px', border: `1px solid ${C.gold}`, background: '#fff', marginBottom: '24px' }}>
                <p style={{ fontFamily: 'Georgia,serif', fontSize: '18px', color: C.gold, marginBottom: '8px' }}>✦ 免费订阅成功</p>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
                  {footerEmail && <><strong style={{ color: C.h1 }}>{footerEmail}</strong> 已加入 Newsletter，</>}
                  我们每月初会发送到你的邮箱。
                </p>
              </div>
              <p style={{ fontFamily: 'Georgia,serif', fontSize: '14px', color: C.h1, marginBottom: '16px' }}>
                想解锁更多？升级会员，体验 AI 风格系统的完整功能。
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
                <a href="#membership" style={{
                  display: 'inline-block', padding: '12px 28px',
                  background: C.gold, color: '#fff', textDecoration: 'none',
                  fontFamily: 'Inter,sans-serif', fontSize: '12px', letterSpacing: '2px',
                }}>查看会员方案 ↓</a>
                <Link to="/" style={{
                  display: 'inline-block', padding: '12px 28px',
                  border: `1px solid ${C.border}`, color: C.muted, textDecoration: 'none',
                  fontFamily: 'Inter,sans-serif', fontSize: '12px', letterSpacing: '1px',
                }}>先逛逛</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', maxWidth: '420px', margin: '0 auto', border: `1px solid ${C.border}`, background: '#fff' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  flex: 1, padding: '14px 18px', border: 'none', outline: 'none',
                  fontFamily: 'Inter,sans-serif', fontSize: '14px', background: 'transparent',
                }}
              />
              <button
                onClick={() => { if (email) setSubscribed(true) }}
                style={{
                  padding: '14px 24px', background: C.gold, color: '#fff', border: 'none',
                  fontFamily: 'Inter,sans-serif', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                订阅
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* ── 付费方案 ── */}
      <div id="membership" style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>MEMBERSHIP</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,3vw,42px)', fontWeight: 400, color: C.h1, marginBottom: '32px' }}>
            选择你的会员方案
          </h2>
          {/* 月付/年付切换 */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '6px 6px', border: `1px solid ${C.border}`, background: '#fff' }}>
            <button onClick={() => setBillingAnnual(false)} style={{
              padding: '8px 20px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter,sans-serif', fontSize: '12px', letterSpacing: '1px',
              background: !billingAnnual ? C.gold : 'transparent',
              color: !billingAnnual ? '#fff' : C.muted,
              transition: 'all .2s',
            }}>月付</button>
            <button onClick={() => setBillingAnnual(true)} style={{
              padding: '8px 20px', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter,sans-serif', fontSize: '12px', letterSpacing: '1px',
              background: billingAnnual ? C.gold : 'transparent',
              color: billingAnnual ? '#fff' : C.muted,
              transition: 'all .2s',
            }}>年付 <span style={{ fontSize: '10px', color: billingAnnual ? 'rgba(255,255,255,.7)' : C.gold }}>省 2 个月</span></button>
          </div>
        </div>

        {/* 方案卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1px', background: C.border }}>
          {PLANS.map(plan => {
            const isHovered = hoveredPlan === plan.id
            const isPro = plan.id === 'premium'
            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  background: isPro ? C.dark : (isHovered ? C.goldLight : '#fff'),
                  padding: '40px 32px',
                  display: 'flex', flexDirection: 'column', gap: '0',
                  transition: 'background .2s',
                  position: 'relative',
                }}
              >
                {/* 角标 */}
                {plan.tag && (
                  <div style={{
                    position: 'absolute', top: '20px', right: '20px',
                    fontFamily: 'Inter,sans-serif', fontSize: '10px', letterSpacing: '2px',
                    color: isPro ? C.dark : C.gold,
                    background: isPro ? C.gold : C.goldLight,
                    padding: '3px 10px', borderRadius: '2px',
                  }}>{plan.tag}</div>
                )}

                <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '10px', letterSpacing: '3px', color: isPro ? 'rgba(255,255,255,.4)' : C.muted, marginBottom: '12px' }}>
                  {plan.name}
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: '38px', color: isPro ? '#fff' : C.h1 }}>
                    {plan.id === 'newsletter' ? '免费' :
                      plan.id === 'annual' ? '¥980' :
                      billingAnnual
                        ? `¥${Math.round(parseInt(plan.price.replace('¥','')) * 10)}`
                        : plan.price}
                  </span>
                  {plan.id !== 'newsletter' && (
                    <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: isPro ? 'rgba(255,255,255,.4)' : C.muted, marginLeft: '4px' }}>
                      {plan.id === 'annual' ? '/ 年' : billingAnnual ? '/ 年' : '/ 月'}
                    </span>
                  )}
                </div>

                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: isPro ? 'rgba(255,255,255,.55)' : C.muted, lineHeight: 1.7, marginBottom: '28px' }}>
                  {plan.desc}
                </p>

                <div style={{ flex: 1, marginBottom: '32px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ color: C.gold, flexShrink: 0, marginTop: '1px' }}>✦</span>
                      <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: isPro ? 'rgba(255,255,255,.7)' : C.body, lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button style={{
                  width: '100%', padding: '14px',
                  fontFamily: 'Inter,sans-serif', fontSize: '12px', letterSpacing: '2px',
                  cursor: 'pointer', border: 'none',
                  background: plan.ctaStyle === 'gold' || plan.ctaStyle === 'gold-fill'
                    ? C.gold
                    : plan.ctaStyle === 'dark'
                    ? C.h1
                    : 'transparent',
                  color: plan.ctaStyle === 'outline'
                    ? (isPro ? '#fff' : C.h1)
                    : '#fff',
                  outline: plan.ctaStyle === 'outline' ? `1px solid ${isPro ? 'rgba(255,255,255,.3)' : C.border}` : 'none',
                  transition: 'opacity .2s',
                }}>
                  {plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'Inter,sans-serif', fontSize: '12px', color: C.muted, marginTop: '24px' }}>
          所有付费方案均支持 7 天无理由退款 · 随时取消 · 无隐藏费用
        </p>
      </div>

      {/* ── 方案对比说明 ── */}
      <div style={{ background: '#fff', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '64px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px', textAlign: 'center' }}>WHY UPGRADE</p>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, color: C.h1, marginBottom: '48px', textAlign: 'center' }}>
            为什么值得升级
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px' }}>
            {[
              { num: '01', title: '不再买错', body: '基于你的真实体型和色彩季型，每一件推荐都经过 AI 筛选，买回来就能穿。' },
              { num: '02', title: '节省决策时间', body: '每次购物不再无从下手。风格档案帮你建立清晰的选衣标准，10 分钟完成造型。' },
              { num: '03', title: '越用越懂你', body: '每次反馈都让系统更了解你的偏好，推荐精准度持续提升。' },
              { num: '04', title: '真实上身预览', body: '虚拟试衣基于你的体型档案渲染，不是模特身上的效果，是你身上的效果。' },
            ].map(item => (
              <div key={item.num}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', marginBottom: '12px' }}>{item.num}</div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '18px', fontWeight: 400, color: C.h1, marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '13px', color: C.muted, lineHeight: 1.8 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 用户评价 ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px', textAlign: 'center' }}>TESTIMONIALS</p>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 400, color: C.h1, marginBottom: '48px', textAlign: 'center' }}>
          她们怎么说
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', background: C.border }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: '#fff', padding: '36px 28px' }}>
              <p style={{ fontFamily: 'Georgia,serif', fontSize: '16px', color: C.h1, lineHeight: 1.8, marginBottom: '24px', fontStyle: 'italic' }}>
                「{t.text}」
              </p>
              <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '12px', color: C.muted }}>
                <div style={{ color: C.h1, marginBottom: '2px' }}>{t.name}</div>
                {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 底部 CTA ── */}
      <div style={{ background: C.dark, padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(28px,3vw,44px)', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>
          还在犹豫？先从免费开始。
        </h2>
        <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '15px', color: 'rgba(255,255,255,.5)', marginBottom: '36px' }}>
          Newsletter 永久免费，随时升级，随时退订。
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <a href="#newsletter" style={{
            display: 'inline-block', padding: '14px 36px',
            border: `1px solid rgba(255,255,255,.25)`, color: '#fff',
            fontFamily: 'Inter,sans-serif', fontSize: '13px', letterSpacing: '2px', textDecoration: 'none',
          }}>免费订阅 Newsletter</a>
          <Link to="/auth" style={{
            display: 'inline-block', padding: '14px 36px',
            background: C.gold, color: '#fff',
            fontFamily: 'Inter,sans-serif', fontSize: '13px', letterSpacing: '2px', textDecoration: 'none',
          }}>立即开始 Premium →</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
