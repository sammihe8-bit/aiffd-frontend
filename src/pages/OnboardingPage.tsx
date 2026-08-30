import { useState } from 'react'
import { Link } from 'react-router-dom'

const MODULES = [
  {
    id: 'style', num: '01', tag: 'STYLE TEST', title: '风格测试',
    subtitle: '了解你的先天底色',
    desc: '风格测试是整个档案的基础。通过体型测试和面部五官测试，判断你的骨骼结构、身体线条和面部气质，确定你的13风格主型。',
    time: '约 15 分钟', to: '/test/style', available: true, color: '#2D5A3D',
    subTests: [
      {
        num: '01-A', title: '体型测试',
        desc: '骨骼轮廓、脂肪分布、气血态——建立你的三层体型档案',
        time: '约 8 分钟', to: '/test/body',
        steps: ['体质底层识别', '骨骼轮廓判断', '脂肪分布自评', '气血态测试'],
      },
      {
        num: '01-B', title: '面部五官测试',
        desc: '面部对比度、发色虹膜、骨骼感知——判断你的气质底色',
        time: '约 7 分钟', to: '/test/style',
        steps: ['面部明度判断', '五官对比度', '发色与虹膜', '整体气质感知'],
      },
    ],
  },
  {
    id: 'color', num: '02', tag: 'COLOR TEST', title: '色彩测试',
    subtitle: '找到属于你的色彩语言',
    desc: '基于肤色、发色与眼色，判断你的冷暖底调和五季归属，建立个人配色系统，减少买错颜色的概率。',
    time: '约 10 分钟', to: '/test/color', available: true, color: '#7B1A2A',
    subTests: [
      {
        num: '02-A', title: '冷暖底调测试',
        desc: '判断你的肤色是暖调、冷调还是橄榄倾向',
        time: '约 4 分钟', to: '/test/color',
        steps: ['金银首饰测试', '冷暖色卡对比', '橘色驼色反应', '粉色反应'],
      },
      {
        num: '02-B', title: '五季色彩测试',
        desc: '在春夏长夏秋冬五季中，找到你的专属色彩季型',
        time: '约 6 分钟', to: '/test/color/season',
        steps: ['发色虹膜判断', '色彩承受力', '深浅感知', '五季归属确认'],
      },
    ],
  },
  {
    id: 'lifestyle', num: '03', tag: 'LIFESTYLE TEST', title: '个人爱好测试',
    subtitle: '发现你的后天个性',
    desc: '通过生活方式、消费态度与审美向往，挖掘你的后天风格基因，生成专属个性标签，让档案从底色走向你真实的自我表达。',
    time: '约 8 分钟', to: '/test/fashion', available: false, color: '#1C2E5A',
    subTests: [],
  },
]

const ARCHIVE_NOTES = [
  {
    icon: '◎', title: '档案不是一次成型',
    desc: '第一次测试会给你一个可理解、可执行的初始档案。随着你的使用和反馈，档案会持续学习和修正，越用越准。',
  },
  {
    icon: '◈', title: '每一次交互都在更新',
    desc: '你的每次穿搭选择、购买反馈、造型师沟通，都会成为数据沉淀进你的档案，让建议越来越个人化。',
  },
  {
    icon: '◇', title: '最终匹配一对一服务',
    desc: '档案完整度达到一定程度后，系统将为你匹配最适合的造型师，提供真正基于你的数据的一对一服务。',
  },
]

function ConsentScreen({ onAgree }: { onAgree: () => void }) {
  const [agreed, setAgreed] = useState(false)
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#B8973A', marginBottom: '12px' }}>AIFFD 智搭</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#111', marginBottom: '8px' }}>数据使用授权</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#999', marginBottom: '40px' }}>开始建立你的风格档案前，请确认以下授权</p>
        <div style={{ background: '#f7f4ef', padding: '20px 24px', borderLeft: '3px solid #B8973A', marginBottom: '32px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444', lineHeight: '1.9', marginBottom: '12px' }}>
            本平台依据《个人信息保护法》收集你的风格档案数据，用于生成专属 Style Profile、AI 商品分析，以及在你授权后共享给第三方造型师提供服务。数据存储于境外服务器，采用加密保护。
          </p>
          <Link to="/privacy" target="_blank" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#B8973A', letterSpacing: '1px' }}>查看完整隐私政策 →</Link>
        </div>
        <label htmlFor="agree-all" style={{
          display: 'flex', gap: '16px', alignItems: 'flex-start', cursor: 'pointer',
          padding: '20px 24px', border: `1.5px solid ${agreed ? '#B8973A' : '#e8e8e4'}`,
          background: agreed ? '#fdf8ee' : '#fff', borderRadius: '4px', transition: 'all 0.2s', marginBottom: '32px',
        }}>
          <input id="agree-all" type="checkbox" checked={agreed} onChange={() => setAgreed(a => !a)}
            style={{ marginTop: '4px', accentColor: '#B8973A', flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#666', lineHeight: '1.9' }}>
            我已阅读并同意{' '}
            <strong style={{ color: '#B8973A' }}>《AIFFD 用户隐私政策与数据使用协议》</strong>
            ，同意 AIFFD 收集和使用我的
            <strong style={{ color: '#111' }}>个人信息、上传照片及风格档案数据</strong>
            ，用于生成专属 Style Profile 和 AI 商品分析；在我选择造型师服务时，可将相关数据共享给
            <strong style={{ color: '#111' }}>第三方造型师</strong>。
          </span>
        </label>
        <button onClick={() => agreed && onAgree()} style={{
          width: '100%', padding: '16px', background: agreed ? '#0f0f0d' : '#ccc',
          color: '#fff', border: 'none', cursor: agreed ? 'pointer' : 'not-allowed',
          fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', transition: 'background 0.2s',
        }}>同意并开始建立档案</button>
      </div>
    </div>
  )
}

function ArchivePage() {
  const [expandedModule, setExpandedModule] = useState<string | null>('style')

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>

      {/* Hero */}
      <div style={{ background: '#0f0f0d', padding: '0 0 0 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '520px' }}>
          {/* 左侧文字 */}
          <div style={{ padding: '72px 48px 56px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#B8973A', marginBottom: '20px' }}>AIFFD · 个人风格档案</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 400, color: '#fff', lineHeight: 1.2, margin: '0 0 20px' }}>
            建立你的<br /><em style={{ color: '#B8973A', fontStyle: 'normal' }}>完整风格档案</em>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.9, margin: '0 0 40px' }}>
            三项测试，从先天底色到后天个性，构建专属于你的风格判断系统。档案不是一次成型——它会在每一次交互中持续完善，最终为你匹配一对一的造型师服务。
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap' }}>
            {MODULES.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ padding: '10px 20px', border: `1px solid ${m.available ? '#B8973A' : 'rgba(255,255,255,0.2)'}`, background: m.available ? 'rgba(184,151,58,0.15)' : 'transparent' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#B8973A', letterSpacing: '2px', margin: '0 0 2px' }}>{m.num}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: m.available ? '#fff' : 'rgba(255,255,255,0.4)', margin: 0 }}>{m.title}</p>
                </div>
                {i < MODULES.length - 1 && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.2)', padding: '0 12px' }}>→</span>}
              </div>
            ))}
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.2)', padding: '0 12px' }}>→</span>
            <div style={{ padding: '10px 20px', border: '1px solid rgba(184,151,58,0.5)', background: 'rgba(184,151,58,0.1)' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#B8973A', letterSpacing: '2px', margin: '0 0 2px' }}>完成</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#B8973A', margin: 0 }}>风格档案</p>
            </div>
          </div>
          </div>
          {/* 右侧配图 */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src="/hero-profile.jpg"
              alt="AIFFD 风格档案"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0f0f0d 0%, transparent 35%)' }} />
          </div>
        </div>
      </div>

      {/* 从风格测试开始提示 */}
      <div style={{ background: '#f7f4ef', borderBottom: '1px solid #e8e8e4', padding: '20px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#B8973A' }}>建议从这里开始 →</span>
          <Link to="/test/style" style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#fff', background: '#B8973A', padding: '10px 24px', textDecoration: 'none', letterSpacing: '1px' }}>
            开始风格测试
          </Link>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999' }}>风格测试包含体型 + 面部五官，是整个档案的基础</span>
        </div>
      </div>

      {/* 三大模块 */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#B8973A', marginBottom: '12px' }}>测试模块</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#111', marginBottom: '8px' }}>按顺序完成，档案最完整</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#999', marginBottom: '40px', lineHeight: 1.8 }}>也可以单独完成任意一项，随时回来继续。</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid #e8e8e4' }}>
          {MODULES.map((module, idx) => {
            const isExpanded = expandedModule === module.id
            return (
              <div key={module.id} style={{ borderBottom: idx < MODULES.length - 1 ? '1px solid #e8e8e4' : 'none' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 32px', cursor: module.available ? 'pointer' : 'default', background: isExpanded ? '#fff' : '#faf9f7', transition: 'background 0.2s' }}
                  onClick={() => module.available && setExpandedModule(isExpanded ? null : module.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0, background: module.available ? module.color : '#e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#fff', letterSpacing: '1px' }}>{module.num}</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: module.available ? '#111' : '#999', fontWeight: 400, margin: 0 }}>{module.title}</p>
                        {!module.available && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#999', border: '0.5px solid #e8e8e4', padding: '2px 8px', letterSpacing: '1px' }}>即将上线</span>}
                      </div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#999', margin: 0 }}>{module.subtitle} · {module.time}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {module.available && (
                      <Link to={module.to} onClick={e => e.stopPropagation()} style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1.5px', color: '#fff', background: '#0f0f0d', padding: '10px 20px', textDecoration: 'none' }}>
                        开始 →
                      </Link>
                    )}
                    {module.available && (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: '#999', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>∨</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ background: '#fff', borderTop: '1px solid #e8e8e4', padding: '0 32px 32px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#666', lineHeight: 1.9, padding: '24px 0 28px', borderBottom: '1px solid #e8e8e4', margin: 0 }}>{module.desc}</p>
                    {module.subTests.length > 0 && (
                      <div style={{ paddingTop: '28px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#B8973A', letterSpacing: '3px', marginBottom: '20px' }}>包含两项子测试</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          {module.subTests.map((sub, si) => (
                            <div key={sub.num} style={{ border: '1px solid #e8e8e4', padding: '24px' }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#B8973A', letterSpacing: '2px' }}>{sub.num}</span>
                                <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#222', fontWeight: 400, margin: 0 }}>{sub.title}</p>
                              </div>
                              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#666', lineHeight: 1.8, marginBottom: '16px' }}>{sub.desc}</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                                {sub.steps.map((s, j) => (
                                  <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#B8973A', flexShrink: 0 }}>0{j + 1}</span>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999' }}>{s}</span>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#999' }}>{sub.time}</span>
                                <Link to={sub.to} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#B8973A', textDecoration: 'none', letterSpacing: '1px' }}>
                                  {si === 0 ? '先做这项 →' : '完成后做这项 →'}
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '20px', padding: '14px 20px', background: '#f7f4ef', borderLeft: '3px solid #B8973A' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#666' }}>
                            💡 建议先完成 <strong style={{ color: '#222' }}>{module.subTests[0].title}</strong>，再进行 <strong style={{ color: '#222' }}>{module.subTests[1].title}</strong>，两项完成后风格测试结论最准确。
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 档案说明 */}
      <div style={{ background: '#0f0f0d', padding: '60px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#B8973A', marginBottom: '16px' }}>关于你的档案</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#fff', marginBottom: '40px' }}>档案是一段持续的关系，不是一次性的测试</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {ARCHIVE_NOTES.map(note => (
              <div key={note.title}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#B8973A', marginBottom: '16px' }}>{note.icon}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#fff', fontWeight: 400, marginBottom: '10px' }}>{note.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: 0 }}>{note.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部 CTA */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#111', fontWeight: 400, marginBottom: '12px' }}>准备好了吗？</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#999', marginBottom: '32px', lineHeight: 1.8 }}>从风格测试开始，约15分钟，建立你的初始档案。</p>
        <Link to="/test/style" style={{ display: 'inline-block', fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: '#fff', background: '#0f0f0d', padding: '16px 48px', textDecoration: 'none' }}>
          开始风格测试 →
        </Link>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999', marginTop: '16px' }}>
          也可以直接进入{' '}
          <Link to="/test/body" style={{ color: '#B8973A', textDecoration: 'none' }}>体型测试</Link>
          {' '}或{' '}
          <Link to="/test/color" style={{ color: '#B8973A', textDecoration: 'none' }}>色彩测试</Link>
        </p>
      </div>

    </div>
  )
}

export default function OnboardingPage() {
  const [agreed, setAgreed] = useState(false)
  if (!agreed) return <ConsentScreen onAgree={() => setAgreed(true)} />
  return <ArchivePage />
}
