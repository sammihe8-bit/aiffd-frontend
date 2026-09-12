import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isFullProfileComplete, userScopedKey } from '../utils/userStorage'
import Footer from '../components/Footer'

const MODULES = [
  {
    id: 'style', num: '01', tag: 'STYLE TEST', title: '风格测试',
    subtitle: '了解你的先天底色',
    desc: '风格测试是整个档案的基础。通过体型测试和面部五官测试，判断你的骨骼结构、身体线条和面部气质，确定你的13风格主型。',
    time: '约 15 分钟', to: '/test/style', available: true,
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
    time: '约 10 分钟', to: '/test/color', available: true,
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
    id: 'lifestyle', num: '03', tag: 'PERSONAL FASHION CHOICES', title: '个人时尚选择',
    subtitle: '发现你的后天个性',
    desc: '了解你喜欢什么、实际会穿什么、现在需要什么、不接受什么，把风格向往和真实生活习惯一起纳入你的档案。目前已上线"理想形象"部分，其余模块陆续开放。',
    time: '约 2 分钟（第一部分）', to: '/test/fashion', available: true,
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

// 隐私政策/知情同意书的版本号——以后协议文案有实质性修改，就把这个版本号往上加一位，
// 这样每条同意记录里存的 policyVersion 才能对应到当时用户实际看到、同意的是哪一版文案
const CONSENT_POLICY_VERSION = 'v1.0-2026-09'

// 单个同意勾选项，抽成一个小组件方便必选/可选两组复用同一套样式，
// accent 控制勾选后的强调色（必选用金色，可选也用金色，视觉上不刻意区分，靠分组标题和"可选："前缀区分）
function ConsentCheckbox({ id, checked, onChange, children }: {
  id: string; checked: boolean; onChange: () => void; children: React.ReactNode
}) {
  return (
    <label htmlFor={id} style={{
      display: 'flex', gap: '16px', alignItems: 'flex-start', cursor: 'pointer',
      padding: '20px 24px', border: `1.5px solid ${checked ? '#B8973A' : '#e8e8e4'}`,
      background: checked ? '#fdf8ee' : '#fff', borderRadius: '4px', transition: 'all 0.2s',
    }}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange}
        style={{ marginTop: '4px', accentColor: '#B8973A', flexShrink: 0, width: '16px', height: '16px', cursor: 'pointer' }} />
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#666', lineHeight: '1.9' }}>
        {children}
      </span>
    </label>
  )
}

function ConsentScreen({ onAgree }: { onAgree: () => void }) {
  const { user } = useAuth()
  // 四个选项默认全部不勾选，这是硬性要求，不能有任何一个默认 true
  const [ageAndResearchAck, setAgeAndResearchAck] = useState(false)
  const [privacyAck, setPrivacyAck] = useState(false)
  const [photoConsent, setPhotoConsent] = useState(false)
  const [researchDataConsent, setResearchDataConsent] = useState(false)

  const requiredChecked = ageAndResearchAck && privacyAck

  const handleSubmit = () => {
    if (!requiredChecked) return
    // 分别记录四个选项的选择结果、时间戳、当时生效的协议版本——
    // 之后不管是排查纠纷还是协议改版都需要能查到"用户当时同意的到底是哪一版、选了什么"
    const record = {
      ageAndResearchAck, privacyAck, photoConsent, researchDataConsent,
      timestamp: new Date().toISOString(),
      policyVersion: CONSENT_POLICY_VERSION,
    }
    try {
      localStorage.setItem(userScopedKey('aiffd_consent', user), JSON.stringify(record))
    } catch { /* 存储失败也不阻塞用户往下走，只是这条同意记录没留档 */ }
    onAgree()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#B8973A', marginBottom: '12px' }}>AIFFD 智搭</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#111', marginBottom: '8px' }}>数据使用授权</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#999', marginBottom: '40px' }}>开始建立你的风格档案前，请确认以下授权</p>

        <div style={{ background: '#f7f4ef', padding: '20px 24px', borderLeft: '3px solid #B8973A', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444', lineHeight: '1.9', marginBottom: '12px' }}>
            AIFFD 目前处于研究原型测试阶段，本轮测试不收取费用，仅面向 18 岁以上参与者。
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444', lineHeight: '1.9', marginBottom: '16px' }}>
            为生成测试结果和个人风格档案，AIFFD 需要处理你的基本账号信息、问卷答案及系统生成的测试结果。照片分析和研究用途由你自主选择，平台不会自动将你的数据分享给第三方。
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' as const }}>
            <Link to="/privacy" target="_blank" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#B8973A', letterSpacing: '1px' }}>查看完整隐私政策 →</Link>
            <Link to="/about" target="_blank" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#B8973A', letterSpacing: '1px' }}>查看在线测试说明 →</Link>
          </div>
        </div>

        {/* 必选：这两项不勾选就没法开始测试 */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px', color: '#B8973A', marginBottom: '14px' }}>完成测试所必需</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <ConsentCheckbox id="consent-age" checked={ageAndResearchAck} onChange={() => setAgeAndResearchAck(v => !v)}>
            我确认自己已满 18 岁，并了解 AIFFD 目前处于研究原型测试阶段。
          </ConsentCheckbox>
          <ConsentCheckbox id="consent-privacy" checked={privacyAck} onChange={() => setPrivacyAck(v => !v)}>
            我已阅读并同意{' '}
            <strong style={{ color: '#B8973A' }}>《AIFFD隐私政策与研究测试数据说明》</strong>
            。我同意 AIFFD 收集和使用我的
            <strong style={{ color: '#111' }}>账号基本信息、问卷答案及系统生成的风格档案</strong>
            ，用于完成测试、生成结果并保存我的个人档案。
          </ConsentCheckbox>
        </div>

        {/* 可选：不勾选也能正常完成测试，只是拿不到对应的增值体验 */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px', color: '#999', marginBottom: '14px' }}>自主选择</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <ConsentCheckbox id="consent-photo" checked={photoConsent} onChange={() => setPhotoConsent(v => !v)}>
            <strong style={{ color: '#111' }}>可选：允许上传和分析我的照片。</strong>
            {' '}用于辅助分析身体结构、面部特征和个人色彩。照片分析不是完成基础问卷测试的必要条件；不选择时，仍可通过文字和图片选项完成测试。
          </ConsentCheckbox>
          <ConsentCheckbox id="consent-research" checked={researchDataConsent} onChange={() => setResearchDataConsent(v => !v)}>
            <strong style={{ color: '#111' }}>可选：允许将去标识化数据用于研究和系统改进。</strong>
            {' '}我同意 AIFFD 将我的问卷答案、反馈及测试结果进行去标识化处理后，用于研究分析、测试方法验证和系统改进。不选择不会影响测试结果或基本功能，并且以后可以撤回授权。
          </ConsentCheckbox>
        </div>

        <button onClick={handleSubmit} disabled={!requiredChecked} style={{
          width: '100%', padding: '16px', background: requiredChecked ? '#1a1a1a' : '#ccc',
          color: '#fff', border: 'none', cursor: requiredChecked ? 'pointer' : 'not-allowed',
          fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
        }}>
          {requiredChecked ? '同意必选项并开始测试' : '请先确认必选授权'}
        </button>
      </div>
    </div>
  )
}

function ArchivePage() {
  const [expandedModule, setExpandedModule] = useState<string | null>('style')
  const navigate = useNavigate()
  const { user } = useAuth()

  // 统一的"开始测试"入口逻辑：已经把体型+风格+色彩三层全部测完的用户，
  // 点这个按钮不应该再从头问一遍，而是直接进个人风格结果页，并弹窗询问要不要调整某项/重新测试。
  // 只针对这个主入口按钮；下面模块卡片里"开始 →"链接到具体某一项测试，保持原样直接跳转，不受这个判断影响。
  const handleStartClick = () => {
    if (isFullProfileComplete(user)) {
      navigate('/profile', { state: { showRetestPrompt: true } })
    } else {
      navigate('/test/style')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>

      {/* Hero — 浅色风格，左文右图 */}
      <div style={{ background: '#f5f0ea', borderBottom: '0.5px solid #e8e2d8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', minHeight: '480px', alignItems: 'stretch' }}>
          {/* 左侧文字 */}
          <div style={{ padding: '80px 40px 64px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#B8973A', marginBottom: '24px' }}>
              AIFFD · 个人风格档案
            </p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 400, color: '#1a1a1a', lineHeight: 1.2, margin: '0 0 24px' }}>
              建立你的<br />
              <em style={{ color: '#B8973A', fontStyle: 'normal' }}>完整风格档案</em>
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#888', lineHeight: 1.9, margin: '0 0 40px', maxWidth: '420px' }}>
              三项测试，从先天底色到后天个性。档案不是一次成型——它会在每一次交互中持续完善，最终为你匹配一对一的造型师服务。
            </p>
            {/* 流程概览 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap' }}>
              {MODULES.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    padding: '8px 16px',
                    border: `0.5px solid ${m.available ? '#B8973A' : '#e8e2d8'}`,
                    background: m.available ? '#fdf8ee' : 'transparent',
                  }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#B8973A', letterSpacing: '2px', margin: '0 0 2px' }}>{m.num}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: m.available ? '#1a1a1a' : '#bbb', margin: 0 }}>{m.title}</p>
                  </div>
                  {i < MODULES.length - 1 && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#ddd', padding: '0 10px' }}>→</span>}
                </div>
              ))}
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#ddd', padding: '0 10px' }}>→</span>
              <div style={{ padding: '8px 16px', border: '0.5px solid #B8973A', background: '#fdf8ee' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#B8973A', letterSpacing: '2px', margin: '0 0 2px' }}>完成</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#B8973A', margin: 0 }}>风格档案</p>
              </div>
            </div>
          </div>
          {/* 右侧配图 */}
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: '480px' }}>
            <img
              src="/hero-profile.jpg"
              alt="AIFFD 风格档案"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #f5f0ea 0%, transparent 25%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, #f5f0ea 0%, transparent 25%)' }} />
          </div>
        </div>
      </div>

      {/* 从风格测试开始提示 */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid #e8e2d8', padding: '20px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1px', color: '#B8973A' }}>建议从这里开始 →</span>
          <button onClick={handleStartClick} style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px',
            color: '#fff', background: '#1a1a1a', padding: '10px 24px', textDecoration: 'none',
            border: 'none', cursor: 'pointer',
          }}>
            开始风格测试
          </button>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#bbb' }}>
            风格测试包含体型 + 面部五官，是整个档案的基础
          </span>
        </div>
      </div>

      {/* 三大模块 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 32px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#B8973A', marginBottom: '12px' }}>测 试 模 块</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: '#1a1a1a', marginBottom: '8px' }}>按顺序完成，档案最完整</h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#999', marginBottom: '48px', lineHeight: 1.8 }}>
          也可以单独完成任意一项，随时回来继续。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '0.5px solid #e8e2d8' }}>
          {MODULES.map((module, idx) => {
            const isExpanded = expandedModule === module.id
            return (
              <div key={module.id} style={{ borderBottom: idx < MODULES.length - 1 ? '0.5px solid #e8e2d8' : 'none' }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '32px 40px', cursor: module.available ? 'pointer' : 'default',
                    background: isExpanded ? '#fff' : '#faf9f7', transition: 'background 0.2s',
                  }}
                  onClick={() => module.available && setExpandedModule(isExpanded ? null : module.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: isExpanded ? '#B8973A' : '#ddd', margin: 0, fontWeight: 400, lineHeight: 1 }}>{module.num}</p>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: '#B8973A', margin: 0 }}>{module.tag}</p>
                        {!module.available && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#ccc', border: '0.5px solid #e8e2d8', padding: '2px 8px' }}>即将上线</span>}
                      </div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: module.available ? '#1a1a1a' : '#ccc', fontWeight: 400, margin: '0 0 4px' }}>{module.title}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#bbb', margin: 0, letterSpacing: '0.5px' }}>{module.subtitle} · {module.time}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {module.available && (
                      <Link
                        to={module.to}
                        onClick={e => e.stopPropagation()}
                        style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px',
                          color: '#1a1a1a', border: '0.5px solid #1a1a1a',
                          padding: '10px 20px', textDecoration: 'none', transition: 'all 0.2s',
                        }}
                      >
                        开始 →
                      </Link>
                    )}
                    {module.available && (
                      <span style={{ fontSize: '16px', color: '#ccc', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>∨</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ background: '#fff', borderTop: '0.5px solid #e8e2d8', padding: '0 40px 40px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#666', lineHeight: 1.9, padding: '28px 0', borderBottom: '0.5px solid #e8e2d8', margin: 0 }}>{module.desc}</p>
                    {module.subTests.length > 0 && (
                      <div style={{ paddingTop: '32px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#B8973A', letterSpacing: '3px', marginBottom: '24px' }}>包含两项子测试</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          {module.subTests.map((sub, si) => (
                            <div key={sub.num} style={{ border: '0.5px solid #e8e2d8', padding: '28px' }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#B8973A', letterSpacing: '2px' }}>{sub.num}</span>
                                <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1a1a1a', fontWeight: 400, margin: 0 }}>{sub.title}</p>
                              </div>
                              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#888', lineHeight: 1.8, marginBottom: '20px' }}>{sub.desc}</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                                {sub.steps.map((s, j) => (
                                  <div key={j} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#B8973A', flexShrink: 0 }}>0{j + 1}</span>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#bbb', letterSpacing: '0.5px' }}>{s}</span>
                                  </div>
                                ))}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '0.5px solid #e8e2d8' }}>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#ccc' }}>{sub.time}</span>
                                <Link to={sub.to} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#B8973A', textDecoration: 'none', letterSpacing: '1px' }}>
                                  {si === 0 ? '先做这项 →' : '完成后做这项 →'}
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: '24px', padding: '16px 20px', background: '#fdf8ee', borderLeft: '3px solid #B8973A' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#666' }}>
                            💡 建议先完成 <strong style={{ color: '#1a1a1a' }}>{module.subTests[0].title}</strong>，再进行 <strong style={{ color: '#1a1a1a' }}>{module.subTests[1].title}</strong>，两项完成后风格测试结论最准确。
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

      {/* 档案说明 — 浅色风格 */}
      <div style={{ background: '#f7f4ef', borderTop: '0.5px solid #e8e2d8', borderBottom: '0.5px solid #e8e2d8', padding: '72px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#B8973A', marginBottom: '16px' }}>关 于 你 的 档 案</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: '#1a1a1a', marginBottom: '48px' }}>
            档案是一段持续的关系，不是一次性的测试
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '48px' }}>
            {ARCHIVE_NOTES.map(note => (
              <div key={note.title}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#B8973A', marginBottom: '16px' }}>{note.icon}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '17px', color: '#1a1a1a', fontWeight: 400, marginBottom: '12px', lineHeight: 1.4 }}>{note.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#888', lineHeight: 1.9, margin: 0 }}>{note.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部 CTA */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 32px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#1a1a1a', fontWeight: 400, marginBottom: '12px' }}>准备好了吗？</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#999', marginBottom: '36px', lineHeight: 1.8 }}>
          从风格测试开始，约 15 分钟，建立你的初始档案。
        </p>
        <button onClick={handleStartClick} style={{
          display: 'inline-block', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px',
          color: '#fff', background: '#1a1a1a', padding: '16px 56px', textDecoration: 'none',
          border: 'none', cursor: 'pointer',
        }}>
          开始风格测试 →
        </button>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#bbb', marginTop: '20px' }}>
          也可以直接进入{' '}
          <Link to="/test/body" style={{ color: '#B8973A', textDecoration: 'none' }}>体型测试</Link>
          {' '}或{' '}
          <Link to="/test/color" style={{ color: '#B8973A', textDecoration: 'none' }}>色彩测试</Link>
        </p>
      </div>

      <Footer />

    </div>
  )
}

// 2026-09-12 修复：之前 agreed 恒定初始化为 false，导致哪怕 localStorage 里已经存过完整的
// aiffd_consent 同意记录，用户只要刷新页面或重新进入 /onboarding，同意页依然会重新弹出。
// 现在改成惰性初始化：先查一次本机是否已经有这个用户（或访客 'guest' 桶）的同意记录，
// 有就直接跳过同意页，直接展示 ArchivePage。
export default function OnboardingPage() {
  const { user } = useAuth()
  const [agreed, setAgreed] = useState(() => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(userScopedKey('aiffd_consent', user))
  })
  if (!agreed) return <ConsentScreen onAgree={() => setAgreed(true)} />
  return <ArchivePage />
}
