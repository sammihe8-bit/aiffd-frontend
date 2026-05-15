import { useState } from 'react'
import { Link } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

const TESTS = [
  {
    num: '01', tag: 'BODY TEST', title: '体型测试',
    desc: '从谢尔顿三型、骨骼轮廓到脂肪分布，建立你的三层体型档案，生成复合体型代码。',
    steps: ['体质底层识别', '骨骼轮廓判断', '脂肪分布自评', '三围数据输入', '气血态测试'],
    duration: '约 8 分钟', to: '/test/body', available: true,
  },
  {
    num: '02', tag: 'COLOR TEST', title: '色彩测试',
    desc: '基于肤色、发色与眼色判断你的色彩季型，建立个人配色系统，减少买错颜色的概率。',
    steps: ['肤色基调判断', '发色与眼色记录', '色彩季型匹配', '个人配色方案'],
    duration: '约 6 分钟', to: '/test/color', available: true,
  },
  {
    num: '03', tag: 'STYLE TEST', title: '风格测试',
    desc: '结合体型与色彩底色，判断你的风格适合度。如已完成前两项测试，结论将更精准。',
    steps: ['风格倾向问卷', '场景适配分析', '风格关键词生成', '穿搭方向建议'],
    duration: '约 10 分钟', to: '/test/style', available: true,
  },
  {
    num: '04', tag: 'FASHION TEST', title: '时尚个性测试',
    desc: '通过生活方式、消费态度与审美向往，挖掘你的后天风格基因，生成专属个性标签。',
    steps: ['生活方式问卷', '消费态度判断', '审美向往分析', '个性标签生成'],
    duration: '约 8 分钟', to: '/test/fashion', available: false,
  },
]
function ConsentScreen({ onAgree }: { onAgree: () => void }) {
  const [consent, setConsent] = useState({ basic: false, photo: false, stylist: false, ai: false })
  const canProceed = consent.basic && consent.photo && consent.stylist

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>AIFFD 智搭</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>数据使用授权</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '40px' }}>风格测试将收集您的个人偏好与图像信息，请阅读并确认以下授权</p>

        <div style={{ background: '#f7f4ef', padding: '20px 24px', borderLeft: `3px solid ${C.gold}`, marginBottom: '32px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, lineHeight: '1.9', marginBottom: '12px' }}>
            本平台依据《个人信息保护法》收集您的风格档案数据，用于生成专属 Style Profile、AI 商品分析，以及在您授权后共享给第三方造型师提供服务。数据存储于境外服务器，采用加密保护。
          </p>
          <Link to="/privacy" target="_blank" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px' }}>
            查看完整隐私政策 →
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
          {[
            { id: 'basic', label: '必选', text: '我已阅读并同意《AIFFD 用户隐私政策与数据使用协议》，同意 AIFFD 按协议约定收集和使用我的个人信息（含风格档案数据）。', key: 'basic' as const },
            { id: 'photo', label: '必选', text: '我同意 AIFFD 收集我上传的照片（包括个人照片及服装图片），用于生成风格档案和 AI 商品分析。', key: 'photo' as const },
            { id: 'stylist', label: '必选', text: '我同意在我选择造型师服务时，将我的风格档案及相关照片共享给为我提供服务的第三方造型师。', key: 'stylist' as const },
            { id: 'ai', label: '可选', text: '我同意将我的风格数据（去标识化处理后）用于改进 AIFFD AI 模型。可随时在账户设置中撤回。', key: 'ai' as const },
          ].map(item => (
            <label key={item.id} htmlFor={item.id} style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer',
              padding: '14px 16px',
              border: `0.5px solid ${consent[item.key] ? C.gold : C.border}`,
              background: consent[item.key] ? '#fdf8ee' : '#fff',
              transition: 'all 0.2s',
            }}>
              <input id={item.id} type="checkbox" checked={consent[item.key]}
                onChange={() => setConsent(c => ({ ...c, [item.key]: !c[item.key] }))}
                style={{ marginTop: '3px', accentColor: C.gold, flexShrink: 0, width: '14px', height: '14px' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.7' }}>
                <strong>【{item.label}】</strong>{item.text}
              </span>
            </label>
          ))}
        </div>

        {!canProceed && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, textAlign: 'center', marginBottom: '16px' }}>
            请勾选所有必选项后继续
          </p>
        )}

        <button onClick={() => canProceed && onAgree()} style={{
          width: '100%', padding: '16px',
          background: canProceed ? C.h1 : '#ccc',
          color: '#fff', border: 'none',
          cursor: canProceed ? 'pointer' : 'not-allowed',
          fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
          transition: 'background 0.2s',
        }}>
          同意并进入测试中心
        </button>
      </div>
    </div>
  )
}

function TestCenter() {
  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px 96px' }}>

        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '16px' }}>AIFFD 测试中心</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, marginBottom: '12px', lineHeight: '1.3' }}>
            建立你的<em style={{ color: C.gold, fontStyle: 'normal' }}>完整风格档案</em>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.sub, lineHeight: '1.8', maxWidth: '540px', margin: '0 auto' }}>
            四项测试，从先天底色到后天个性，构建专属于你的风格判断系统。可按顺序完成，也可单独参加任意一项。
          </p>
        </div>

        {/* 推荐顺序 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '48px', flexWrap: 'wrap' }}>
          {[
            { label: '体型测试', active: true },
            { label: '色彩测试', active: false },
            { label: '风格测试', active: false },
            { label: '时尚个性', active: false },
          ].map((t, i) => (
            <div key={t.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1px',
                color: t.active ? C.gold : C.muted,
                padding: '4px 12px',
                border: `0.5px solid ${t.active ? C.gold : C.border}`,
              }}>{t.label}</span>
              {i < 3 && <span style={{ color: C.border, fontSize: '12px' }}>→</span>}
            </div>
          ))}
        </div>

        {/* 测试卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: `1px solid ${C.border}` }}>
          {TESTS.map((test, i) => (
            <div key={test.num} style={{
              borderRight: i % 2 === 0 ? `1px solid ${C.border}` : 'none',
              borderBottom: i < 2 ? `1px solid ${C.border}` : 'none',
              padding: '40px 36px',
              background: test.available ? '#fff' : '#fafaf8',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '4px', color: C.gold }}>{test.tag}</p>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px',
                  color: test.available ? '#4a8c4a' : C.muted,
                  border: `0.5px solid ${test.available ? '#4a8c4a' : C.border}`,
                  padding: '3px 8px',
                }}>
                  {test.available ? '可开始' : '即将上线'}
                </span>
              </div>

              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: test.available ? C.h1 : C.muted, marginBottom: '10px' }}>
                {test.title}
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8', marginBottom: '20px' }}>
                {test.desc}
              </p>

              <div style={{ marginBottom: '24px' }}>
                {test.steps.map((s, j) => (
                  <div key={j} style={{
                    display: 'flex', gap: '10px', alignItems: 'baseline',
                    padding: '6px 0',
                    borderBottom: j < test.steps.length - 1 ? `0.5px solid ${C.border}` : 'none',
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.gold, flexShrink: 0 }}>0{j + 1}</span>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>{s}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>{test.duration}</p>
                {test.available ? (
                  <Link to={test.to} style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px',
                    color: '#fff', background: C.h1, padding: '10px 20px', textDecoration: 'none',
                  }}>
                    开始测试 →
                  </Link>
                ) : (
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>敬请期待</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 底部说明 */}
        <div style={{ marginTop: '48px', padding: '28px 32px', background: '#f7f4ef', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
          {[
            { label: '先天底色', desc: '体型 + 色彩测试构成你不会轻易改变的客观条件' },
            { label: '后天个性', desc: '风格 + 时尚个性测试反映你真实的自我表达方式' },
            { label: '完整档案', desc: '四项全部完成后，生成你的专属 Style Profile 完整版' },
          ].map(item => (
            <div key={item.label}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '8px' }}>{item.label}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.body, lineHeight: '1.7' }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const [agreed, setAgreed] = useState(false)
  if (!agreed) return <ConsentScreen onAgree={() => setAgreed(true)} />
  return <TestCenter />
}
