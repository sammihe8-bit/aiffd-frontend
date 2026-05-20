import { useState } from 'react'
import { Link } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#faf9f7', dark: '#0f0f0d',
}

export default function VirtualFitPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      num: '01',
      title: '基于你的真实档案',
      desc: '不是随机模特，不是标准身材。虚拟试衣建立在你的体型代码、色彩季型和风格主型之上——你看到的就是衣服穿在你身上真实的样子。',
      detail: '系统读取你的体型数据（骨架结构、腰臀比、身体线条）和色彩档案，实时渲染颜色在你肤色上的真实呈现，而非色块叠加。',
    },
    {
      num: '02',
      title: '两种试穿入口',
      desc: 'AIFFD 推荐的商品直接一键试穿；你自己拍摄或截图的任何产品图、模特图，上传后选择穿在自己身上。',
      detail: '从购物 App 截图、小红书种草图、品牌官网产品页，任何图片来源均可。系统自动识别服装轮廓，适配到你的身形。',
    },
    {
      num: '03',
      title: '360° 全方位预览',
      desc: '前面好看不够，侧面、背面、走动时的状态才是购买决策的关键。旋转查看每一个角度，告别收到货才后悔的窘境。',
      detail: '基于你的3D形象（高级用户），可实时旋转前后左右360°预览穿搭效果。普通用户提供前/侧/背三视图对比。',
    },
    {
      num: '04',
      title: '高级用户：专属3D形象',
      desc: '上传正面、侧面照片，系统自动生成你的专属3D数字形象。这是你在 AIFFD 的永久资产，越用越精准。',
      detail: '3D形象会随着你每次反馈持续优化——你告诉我们哪件穿着不合适，系统记录并修正，下一次预览更接近真实。',
    },
  ]

  const timeline = [
    { year: '2019', event: '开始研究生成式AI在时尚领域的应用，探索服装与真实人体的适配算法' },
    { year: '2021', event: '完成第一代虚拟试衣原型，实现基于2D照片的服装叠加渲染' },
    { year: '2023', event: '引入体型代码系统，实现服装在不同骨架和软组织分布下的差异化渲染' },
    { year: '2025', event: 'AIFFD 平台上线，虚拟试衣作为高级会员核心功能正式开放内测' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>

      {/* ── Hero ── */}
      <div style={{ background: C.dark, color: '#fff', padding: '96px 24px 80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '24px' }}>
            AIFFD · 虚拟试衣
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 400, lineHeight: 1.15, margin: '0 0 28px', maxWidth: '720px' }}>
            在买之前，<br />
            先穿在<em style={{ color: C.gold, fontStyle: 'normal' }}>你自己</em>身上看看
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.9, maxWidth: '560px', marginBottom: '48px' }}>
            不是标准模特，不是色块叠加。AIFFD 虚拟试衣基于你的真实体型档案和色彩季型，让你在购买前看到衣服穿在你身上的真实效果。
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="#waitlist" style={{
              display: 'inline-block', background: C.gold, color: '#fff',
              padding: '14px 32px', textDecoration: 'none',
              fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
            }}>
              加入候补名单
            </a>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              · 手机 / iPad 均可使用
            </span>
          </div>
        </div>
      </div>

      {/* ── 技术背景条 ── */}
      <div style={{ background: '#f7f4ef', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'flex', gap: '48px', flexWrap: 'wrap', alignItems: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '2px', margin: 0 }}>
            生成式AI研究始于 2019
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: 0 }}>
            AIFFD 的虚拟试衣不是新技术的跟随者，而是这个领域最早的研究者和商业化实践者之一。
          </p>
        </div>
      </div>

      {/* ── 功能详解 ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>核心功能</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, marginBottom: '48px' }}>
          每一个细节都为你设计
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '0', border: `1px solid ${C.border}` }}>
          {/* 左侧选项 */}
          <div style={{ borderRight: `1px solid ${C.border}` }}>
            {features.map((f, i) => (
              <button
                key={f.num}
                onClick={() => setActiveFeature(i)}
                style={{
                  width: '100%', padding: '24px 28px', textAlign: 'left', cursor: 'pointer',
                  background: activeFeature === i ? '#fff' : '#fafaf8',
                  borderBottom: i < features.length - 1 ? `1px solid ${C.border}` : 'none',
                  borderLeft: `3px solid ${activeFeature === i ? C.gold : 'transparent'}`,
                  border: 'none',
                  borderBottom: i < features.length - 1 ? `1px solid ${C.border}` : 'none',
                  borderLeft: `3px solid ${activeFeature === i ? C.gold : 'transparent'}`,
                  transition: 'all 0.2s',
                }}
              >
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.gold, letterSpacing: '2px', marginBottom: '6px' }}>{f.num}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: activeFeature === i ? C.h1 : C.muted, fontWeight: 400, margin: 0, lineHeight: 1.4 }}>{f.title}</p>
              </button>
            ))}
          </div>

          {/* 右侧内容 */}
          <div style={{ padding: '40px 48px', background: '#fff' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.gold, letterSpacing: '3px', marginBottom: '20px' }}>
              {features[activeFeature].num} / 0{features.length}
            </p>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 400, color: C.h1, marginBottom: '20px', lineHeight: 1.3 }}>
              {features[activeFeature].title}
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.9, marginBottom: '24px' }}>
              {features[activeFeature].desc}
            </p>
            <div style={{ background: '#f7f4ef', padding: '20px 24px', borderLeft: `3px solid ${C.gold}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, lineHeight: 1.8, margin: 0 }}>
                {features[activeFeature].detail}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 两种入口图示 ── */}
      <div style={{ background: C.dark, padding: '80px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>试穿入口</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: '#fff', marginBottom: '48px' }}>
            两种方式，一个结果
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {[
              {
                tag: '入口 A',
                title: 'AIFFD 推荐商品',
                desc: '在 AIFFD 为你筛选的商品库中，点击任意一件，直接虚拟试穿。系统已预判这件衣服适合你的色彩季型和体型，试穿只是最后一道确认。',
                steps: ['浏览 AIFFD 推荐', '点击「虚拟试穿」', '实时看到上身效果', '确认购买或继续对比'],
              },
              {
                tag: '入口 B',
                title: '自带图片试穿',
                desc: '从任何地方发现的心仪单品——小红书、购物 App、品牌官网截图——上传图片，选择穿在你的形象上，看真实效果。',
                steps: ['截图或上传产品图', '选择你的数字形象', 'AI 识别服装轮廓', '360° 预览上身效果'],
              },
            ].map((item, i) => (
              <div key={i} style={{ border: `1px solid rgba(255,255,255,0.1)`, padding: '40px 36px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.gold, letterSpacing: '3px', marginBottom: '16px' }}>{item.tag}</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#fff', marginBottom: '16px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, marginBottom: '28px' }}>{item.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {item.steps.map((s, j) => (
                    <div key={j} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.gold, width: '20px', flexShrink: 0 }}>0{j + 1}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 技术时间线 ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>研究历程</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, marginBottom: '48px' }}>
          不是跟随，是先行
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {timeline.map((t, i) => (
            <div key={t.year} style={{
              display: 'grid', gridTemplateColumns: '80px 1fr',
              gap: '32px', alignItems: 'flex-start',
              paddingBottom: i < timeline.length - 1 ? '32px' : 0,
              marginBottom: i < timeline.length - 1 ? '32px' : 0,
              borderBottom: i < timeline.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: C.gold, margin: 0 }}>{t.year}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.8, margin: 0 }}>{t.event}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 会员方案 ── */}
      <div style={{ background: '#f7f4ef', padding: '80px 24px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>会员方案</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, marginBottom: '48px' }}>
            选择适合你的方案
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {[
              {
                tier: '标准会员',
                tag: '',
                features: [
                  '完整风格测试档案',
                  '虚拟试衣（前/侧/背三视图）',
                  '基于2D照片的数字形象',
                  '每月20次试衣额度',
                  'AIFFD 推荐商品库',
                ],
                cta: '加入候补名单',
                highlight: false,
              },
              {
                tier: '高级会员',
                tag: '推荐',
                features: [
                  '标准会员全部权益',
                  '专属3D数字形象建模',
                  '360° 全方位旋转预览',
                  '无限试衣次数',
                  '造型师一对一服务',
                  '新功能优先体验',
                ],
                cta: '优先预约高级会员',
                highlight: true,
              },
            ].map(plan => (
              <div key={plan.tier} style={{
                background: plan.highlight ? C.dark : '#fff',
                border: `1px solid ${plan.highlight ? C.gold : C.border}`,
                padding: '40px 36px',
                position: 'relative' as const,
              }}>
                {plan.tag && (
                  <span style={{
                    position: 'absolute' as const, top: '20px', right: '20px',
                    fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px',
                    color: C.dark, background: C.gold, padding: '4px 10px',
                  }}>{plan.tag}</span>
                )}
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 400, color: plan.highlight ? '#fff' : C.h1, marginBottom: '28px' }}>
                  {plan.tier}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <span style={{ color: C.gold, fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>·</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: plan.highlight ? 'rgba(255,255,255,0.75)' : C.body, lineHeight: 1.6 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="#waitlist" style={{
                  display: 'block', textAlign: 'center', padding: '13px',
                  background: plan.highlight ? C.gold : 'transparent',
                  border: `1px solid ${plan.highlight ? C.gold : C.border}`,
                  color: plan.highlight ? '#fff' : C.h1,
                  fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, textAlign: 'center', marginTop: '24px' }}>
            定价方案将在正式上线前公布。现在加入候补名单享有优先资格。
          </p>
        </div>
      </div>

      {/* ── 候补名单 ── */}
      <div id="waitlist" style={{ maxWidth: '680px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>候补名单</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, color: C.h1, marginBottom: '16px' }}>
          提前预约，优先体验
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.muted, lineHeight: 1.8, marginBottom: '40px' }}>
          虚拟试衣功能正在最后阶段打磨中。留下你的邮箱，第一时间收到开放通知，并享有优先体验资格。
        </p>
        {submitted ? (
          <div style={{ background: '#f7f4ef', border: `1px solid ${C.gold}`, padding: '28px 32px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: C.gold, marginBottom: '8px' }}>已收到，谢谢</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
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
                fontFamily: 'Inter, sans-serif', fontSize: '14px', background: '#fff',
              }}
            />
            <button
              onClick={() => { if (email) setSubmitted(true) }}
              style={{
                padding: '16px 28px', background: C.gold, color: '#fff', border: 'none',
                fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer',
                whiteSpace: 'nowrap' as const,
              }}
            >
              加入候补
            </button>
          </div>
        )}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '16px' }}>
          已有 AIFFD 账户？
          <Link to="/auth" style={{ color: C.gold, marginLeft: '6px', textDecoration: 'none' }}>登录后直接预约 →</Link>
        </p>
      </div>

    </div>
  )
}
