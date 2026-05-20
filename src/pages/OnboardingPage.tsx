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
  const [agreed, setAgreed] = useState(false)

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

        <label htmlFor="agree-all" style={{
          display: 'flex', gap: '16px', alignItems: 'flex-start', cursor: 'pointer',
          padding: '20px 24px',
          border: `1.5px solid ${agreed ? C.gold : C.border}`,
          background: agreed ? '#fdf8ee' : '#fff',
          borderRadius: '4px',
          transition: 'all 0.2s',
          marginBottom: '32px',
        }}>
          <input
            id="agree-all"
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(a => !a)}
            style={{ marginTop: '4px', accentColor: C.gold, flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: '1.9' }}>
            我已阅读并同意{' '}
            <strong style={{ color: C.gold }}>《AIFFD 用户隐私政策与数据使用协议》</strong>
            ，同意 AIFFD 收集和使用我的
            <strong style={{ color: C.h1 }}>个人信息、上传照片及风格档案数据</strong>
            ，用于生成专属 Style Profile 和 AI 商品分析；在我选择造型师服务时，可将相关数据共享给
            <strong style={{ color: C.h1 }}>第三方造型师</strong>
            。去标识化数据可用于改进 AIFFD AI 模型，可随时在账户设置中撤回。
          </span>
        </label>

        <button onClick={() => agreed && onAgree()} style={{
          width: '100%', padding: '16px',
          background: agreed ? C.h1 : '#ccc',
          color: '#fff', border: 'none',
          cursor: agreed ? 'pointer' : 'not-allowed',
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
