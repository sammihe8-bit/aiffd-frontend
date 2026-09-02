import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { userAPI } from '../utils/api'
import { userScopedKey } from '../utils/userStorage'
import { getStylePortraitSrc } from '../utils/styleImages'

const C = {
  gold: '#B8973A', border: '#e8e8e4', muted: '#999999',
  body: '#666666', h1: '#111111', bg: '#faf9f7',
}

interface StyleProfile {
  ageRange: string
  bodyType: string
  styleDirections: string[]
  budget: string
  concerns: string[]
  skinTone: string
  scenes: string[]
}

// aiffd_style_result 存的形状（StyleTestPage.tsx 里 JSON.stringify 的对象）
interface StyleResultData {
  family: string
  variant: string
  styleInfo: { cn: string; en: string; family: string; familyEn: string; element: string }
}

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#6B8A4A', '火': '#C0392B', '土': '#8B7355', '金': '#B8973A', '水': '#2C5F8A',
}

const WARMCOOL_LABELS: Record<string, string> = {
  warm: '暖调', cool: '冷调',
  neutral_warm: '中性偏暖', neutral_cool: '中性偏冷', olive: '橄榄灰黄',
}

function SectionTitle({ label }: { label: string }) {
  return (
    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, textTransform: 'uppercase' as const, marginBottom: '16px' }}>
      {label}
    </p>
  )
}

function EmptyBadge({ label, to }: { label: string; to: string }) {
  return (
    <Link to={to} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted,
      border: `1px dashed ${C.border}`, padding: '6px 14px', borderRadius: '4px',
      textDecoration: 'none',
    }}>
      <span style={{ fontSize: '14px' }}>+</span> {label}
    </Link>
  )
}

// 邮箱首字母头像（没选预设头像时的兜底显示）
function AvatarInitial({ text }: { text: string }) {
  const letter = (text || '?').trim().charAt(0).toUpperCase()
  return (
    <div style={{
      width: '64px', height: '64px', borderRadius: '50%', background: C.gold,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: '#fff' }}>{letter}</span>
    </div>
  )
}

// 预设头像方案：颜色 + 符号组合，不需要真实上传图片文件
const AVATAR_PRESETS: { id: string; color: string; symbol: string }[] = [
  { id: 'gold-star', color: '#B8973A', symbol: '✦' },
  { id: 'rose', color: '#B85C6E', symbol: '◈' },
  { id: 'sage', color: '#6B8A6A', symbol: '◇' },
  { id: 'plum', color: '#7A5C8A', symbol: '●' },
  { id: 'ink', color: '#3A3A3A', symbol: '▲' },
  { id: 'teal', color: '#4A7A7A', symbol: '◆' },
]

function AvatarDisplay({ presetId, fallbackText, size = 64 }: { presetId: string | null; fallbackText: string; size?: number }) {
  const preset = presetId ? AVATAR_PRESETS.find(p => p.id === presetId) : null
  if (preset) {
    return (
      <div style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: preset.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: `${Math.round(size * 0.4)}px`, color: '#fff' }}>{preset.symbol}</span>
      </div>
    )
  }
  return <AvatarInitial text={fallbackText} />
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const u = user as Record<string, unknown> | null
  // 后端返回的字段是 name，不是 username——这里统一用 name，没有的话退回邮箱前缀
  const displayName = (u?.name as string) || (u?.email as string)?.split('@')[0] || '用户'
  const email = (u?.email ?? '') as string

  // 从 OnboardingPage 主入口跳过来的：说明用户已经全部测完了，还点了"开始测试"，
  // 这里弹窗问一下是要调整某一项还是全部重测，而不是默默地什么都不做
  const [showRetestPrompt, setShowRetestPrompt] = useState(!!(location.state as { showRetestPrompt?: boolean } | null)?.showRetestPrompt)

  // ── 头像：预设图案方案，选择结果存本地（带用户前缀），不经过后端 ──
  const avatarKey = userScopedKey('aiffd_avatar_choice', user)
  const [avatarId, setAvatarId] = useState<string | null>(() => localStorage.getItem(avatarKey))
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const pickAvatar = (id: string) => {
    localStorage.setItem(avatarKey, id)
    setAvatarId(id)
    setAvatarPickerOpen(false)
  }

  // ── 用户名编辑：真实调用后端 PATCH /user/me ──
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(displayName)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')

  useEffect(() => { setNameInput(displayName) }, [displayName])

  const saveName = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed) { setNameError('用户名不能为空'); return }
    setSavingName(true)
    setNameError('')
    try {
      await userAPI.updateMe({ name: trimmed })
      updateUser({ name: trimmed })
      setEditingName(false)
    } catch (err: any) {
      setNameError(err?.response?.data?.error || '保存失败，请重试')
    } finally {
      setSavingName(false)
    }
  }

  // ── 档案数据读取 ──────────────────────────────────
  const raw = localStorage.getItem(userScopedKey('aiffd_profile', user))
  const profile: StyleProfile | null = raw ? JSON.parse(raw) : null

  const warmCool = localStorage.getItem(userScopedKey('aiffd_warmcool', user)) || ''
  const seasonName = localStorage.getItem(userScopedKey('aiffd_season_name', user)) || ''
  const seasonElement = localStorage.getItem(userScopedKey('aiffd_season_element', user)) || ''
  const elementName = localStorage.getItem(userScopedKey('aiffd_element_name', user)) || ''
  const finalSeason25 = localStorage.getItem(userScopedKey('aiffd_25season', user)) || ''

  const bodyRaw = localStorage.getItem(userScopedKey('aiffd_body_result', user))
  const bodyResult = bodyRaw ? (() => { try { return JSON.parse(bodyRaw) } catch { return null } })() : null

  const styleRaw = localStorage.getItem(userScopedKey('aiffd_style_result', user))
  const styleResult: StyleResultData | null = styleRaw
    ? (() => { try { return JSON.parse(styleRaw) as StyleResultData } catch { return null } })()
    : null

  // 五官详情（StyleTestPage 存的 { [维度id]: { label, value } } 结构）
  const faceRaw = localStorage.getItem(userScopedKey('aiffd_face_result', user))
  const faceResult: Record<string, { label: string; value: string }> | null = faceRaw
    ? (() => { try { return JSON.parse(faceRaw) } catch { return null } })()
    : null
  const styleDisplayName = styleResult?.styleInfo?.cn || styleResult?.variant || ''
  const portraitSrc = getStylePortraitSrc(styleDisplayName)

  // 完整度计算：按 AIFFD 产品架构文档 3.2 节的比例（形45% + 色30% + 意20% + 合5%），
  // 不再是"5个字段各占20%"的平均分配——三大模块权重不同，"形"和"色"本身各自也是分层递进的。
  // "意"（个人爱好测试）还没上线，永远是 0；这也符合文档 10.1 的验收要求：
  // "未完成个人需求模块时，结果页不得显示100%完整"——按这个公式最多只能到 80%，天然满足这条要求。
  const formPct = styleResult ? 45 : bodyResult ? 22 : 0 // 形·风格基础：体型测试算一半，风格测试（含面部）才算完整
  const colorPct = (warmCool ? 10 : 0) + (seasonName ? 10 : 0) + (finalSeason25 ? 10 : 0) // 色·天生色彩：三层各占10%
  const preferencePct = 0 // 意·个人选择：个人爱好测试尚未上线
  const generationPct = (styleResult && finalSeason25) ? 5 : 0 // 合·生成图谱：形+色都完整后，系统才算"生成了图谱"
  const completionPct = formPct + colorPct + preferencePct + generationPct

  // "全部重新测试"：清空体型/风格/五官/色彩三层的存档，回到体型测试第一步重新开始
  const restartAllTests = () => {
    const keysToClear = [
      'aiffd_body_result', 'aiffd_qixue_result', 'aiffd_style_result', 'aiffd_face_result',
      'aiffd_warmcool', 'aiffd_color_result', 'aiffd_season_result', 'aiffd_season_name',
      'aiffd_season_element', 'aiffd_element_result', 'aiffd_element_name', 'aiffd_25season',
    ]
    keysToClear.forEach(k => localStorage.removeItem(userScopedKey(k, user)))
    setShowRetestPrompt(false)
    navigate('/test/body')
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>

      {/* 全部测完后重新点"开始测试"跳过来的确认弹窗 */}
      {showRetestPrompt && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,15,13,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '32px', maxWidth: '420px', width: '100%' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '10px' }}>你已经完成过全部测试</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h1, fontWeight: 400, margin: '0 0 12px' }}>要调整哪一项，还是全部重测？</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, marginBottom: '24px' }}>
              这是你完整的风格档案。如果某一项测得不准，可以单独重做那一项；也可以全部推倒重来。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/test/body" onClick={() => setShowRetestPrompt(false)} style={{
                background: C.gold, color: '#fff', border: 'none', borderRadius: '4px', textAlign: 'center' as const,
                padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '13px', textDecoration: 'none',
              }}>重新做体型 / 风格测试</Link>
              <Link to="/test/color" onClick={() => setShowRetestPrompt(false)} style={{
                background: '#f5f0e8', color: C.h1, border: 'none', borderRadius: '4px', textAlign: 'center' as const,
                padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '13px', textDecoration: 'none',
              }}>重新做色彩测试</Link>
              <button onClick={restartAllTests} style={{
                background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '4px',
                padding: '12px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, cursor: 'pointer',
              }}>全部重新测试</button>
              <button onClick={() => setShowRetestPrompt(false)} style={{
                background: 'none', border: 'none', padding: '8px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, cursor: 'pointer',
              }}>不用了，档案就这样挺好</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, letterSpacing: '1px' }}>
              当前档案完成度
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '120px', height: '3px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${completionPct}%`, background: C.gold, transition: 'width .4s ease' }} />
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.gold, fontWeight: 600 }}>{completionPct}%</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: `1px solid ${C.border}`, paddingBottom: '32px', marginBottom: '40px', position: 'relative' }}>
          {/* 头像：点击打开预设图案选择器 */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAvatarPickerOpen(o => !o)}
              style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }}
              aria-label="更换头像"
            >
              <AvatarDisplay presetId={avatarId} fallbackText={email} />
            </button>
            {avatarPickerOpen && (
              <div style={{
                position: 'absolute', top: '72px', left: 0, zIndex: 10,
                background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px',
                padding: '14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '180px',
              }}>
                {AVATAR_PRESETS.map(p => (
                  <button key={p.id} onClick={() => pickAvatar(p.id)} style={{
                    border: avatarId === p.id ? `2px solid ${C.gold}` : '2px solid transparent',
                    background: 'none', padding: '2px', cursor: 'pointer', borderRadius: '50%',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', background: p.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '16px', color: '#fff' }}>{p.symbol}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, marginBottom: '8px' }}>个人风格档案</p>
            {editingName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' as const }}>
                <input
                  value={nameInput}
                  onChange={e => { setNameInput(e.target.value); setNameError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') saveName() }}
                  style={{
                    fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h1,
                    border: `1px solid ${nameError ? '#dc2626' : C.gold}`, borderRadius: '4px',
                    padding: '4px 10px', outline: 'none', maxWidth: '240px',
                  }}
                  autoFocus
                />
                <button onClick={saveName} disabled={savingName} style={{
                  background: C.gold, color: '#fff', border: 'none', borderRadius: '4px',
                  padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: '12px', cursor: savingName ? 'not-allowed' : 'pointer',
                }}>{savingName ? '保存中…' : '保存'}</button>
                <button onClick={() => { setEditingName(false); setNameInput(displayName); setNameError('') }} style={{
                  background: 'none', border: `1px solid ${C.border}`, borderRadius: '4px',
                  padding: '8px 16px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, cursor: 'pointer',
                }}>取消</button>
                {nameError && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#dc2626', width: '100%' }}>{nameError}</span>}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, margin: 0 }}>{displayName}</h1>
                <button onClick={() => setEditingName(true)} style={{
                  background: 'none', border: `1px dashed ${C.border}`, borderRadius: '4px',
                  padding: '4px 10px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, cursor: 'pointer',
                }}>编辑用户名</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <SectionTitle label="我的风格" />

          {styleResult || bodyResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {styleResult ? (
                <div style={{ display: 'grid', gridTemplateColumns: portraitSrc ? '140px 1fr' : '1fr', gap: '20px', alignItems: 'center' }}>
                  {portraitSrc && (
                    <img src={portraitSrc} alt={styleDisplayName} style={{ width: '100%', borderRadius: '8px', border: `1px solid ${C.border}`, objectFit: 'cover' }} />
                  )}
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '6px' }}>风格定位</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.gold, margin: '0 0 6px' }}>{styleDisplayName}</p>
                    {styleResult.styleInfo?.family && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>
                        {styleResult.styleInfo.family}（{styleResult.styleInfo.familyEn}）家族 · 五行属{styleResult.styleInfo.element}
                      </p>
                    )}
                    {!portraitSrc && (
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '8px' }}>模特图片素材准备中</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '12px' }}>体型测试已完成，继续完成面部测试即可得出完整风格结论</p>
                  <Link to="/test/style" style={{ display: 'inline-block', background: C.gold, color: '#fff', padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', textDecoration: 'none', borderRadius: '4px' }}>
                    继续面部测试
                  </Link>
                </div>
              )}

              {bodyResult && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '20px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.gold, marginBottom: '14px' }}>体型详细信息</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: C.border }}>
                    {[
                      { label: '身高区间', value: bodyResult.height },
                      { label: '骨架', value: Array.isArray(bodyResult.boneScale) ? bodyResult.boneScale.join(' · ') : bodyResult.boneScale },
                      { label: '肩形', value: Array.isArray(bodyResult.shoulder) ? bodyResult.shoulder.join(' + ') : null },
                      { label: '腰型', value: Array.isArray(bodyResult.waist) ? bodyResult.waist.join(' + ') : null },
                      { label: '体型', value: Array.isArray(bodyResult.bodyShape) ? bodyResult.bodyShape.join(' + ') : null },
                      { label: '皮肉质', value: Array.isArray(bodyResult.fleshTexture) ? bodyResult.fleshTexture.join(' + ') : null },
                    ].filter(item => item.value).map((item, i) => (
                      <div key={i} style={{ background: '#fff', padding: '16px' }}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 4px' }}>{item.label}</p>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: C.h1, margin: 0 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {styleResult && (
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '20px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.gold, marginBottom: '14px' }}>五官详细信息</p>
                  {faceResult ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: C.border }}>
                      {Object.values(faceResult).map((item, i) => (
                        <div key={i} style={{ background: '#fff', padding: '16px' }}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 4px' }}>{item.label}</p>
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: C.h1, margin: 0 }}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0, lineHeight: 1.8 }}>
                      这份风格结论是改版前测出来的，当时还没存五官原始答案，重新做一次面部测试即可补上这部分详情。
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '16px' }}>还没有开始风格测试</p>
              <Link to="/test/body" style={{ display: 'inline-block', background: C.gold, color: '#fff', padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', textDecoration: 'none', borderRadius: '4px' }}>
                开始体型测试
              </Link>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <SectionTitle label="色彩档案" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: C.border, marginBottom: '16px' }}>
            {[
              { label: '冷暖底调', value: WARMCOOL_LABELS[warmCool] || null, to: '/test/color', tag: '第一层' },
              { label: '五季主型', value: seasonName ? `${seasonName}（季节自带·${seasonElement}）` : null, to: '/test/color/season', tag: '第二层' },
              { label: '东方 25 季', value: finalSeason25 || null, to: '/test/color/element', tag: '第三层' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: '20px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '8px' }}>{item.tag} · {item.label}</p>
                {item.value ? (
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: C.gold, margin: 0 }}>{item.value}</p>
                ) : (
                  <EmptyBadge label={`完成${item.tag}测试`} to={item.to} />
                )}
              </div>
            ))}
          </div>

          {(seasonName || elementName) && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, lineHeight: 1.8, marginBottom: '20px', background: '#faf8f4', padding: '10px 14px', borderRadius: '6px' }}>
              💡 "季节自带"的五行是季节本身固有的属性（比如秋天固有属性是金），跟你个人测出的"副气"是两回事——两者组合在一起，才是你的东方 25 季分类（比如"秋水"＝秋季 + 你个人的水副气）。
            </p>
          )}

          {(elementName || seasonName) && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {elementName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: ELEMENT_COLORS[elementName] || C.gold,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#fff' }}>{elementName}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 2px' }}>个人五行副气</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: C.h1, margin: 0 }}>{elementName}副气</p>
                  </div>
                </div>
              )}
              {!elementName && seasonName && (
                <EmptyBadge label="进入副气测试 → 25季" to="/test/color/element" />
              )}
            </div>
          )}

          {!warmCool && !seasonName && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '16px' }}>色彩档案尚未建立</p>
              <Link to="/test/color" style={{ display: 'inline-block', background: C.gold, color: '#fff', padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', textDecoration: 'none', borderRadius: '4px' }}>
                开始色彩测试
              </Link>
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <SectionTitle label="个人爱好" />
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>个人爱好测试即将上线</p>
          </div>
        </div>

        {profile && (
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
            <SectionTitle label="补充信息" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: C.border }}>
              {[
                { label: '年龄段', value: profile?.ageRange },
                { label: '预算区间', value: profile?.budget },
                { label: '肤色倾向', value: profile?.skinTone },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', padding: '20px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '8px' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: C.h1, margin: 0 }}>{item.value || '未填写'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { to: '/test/body', label: '风格测试', desc: '体型 + 五官 · 13型判定', done: !!styleResult },
            { to: '/test/color', label: '色彩测试', desc: '冷暖 → 五季 → 25季', done: !!finalSeason25 },
            { to: '/test/fashion', label: '个人爱好测试', desc: '即将上线', done: false },
            { to: '/profile', label: '风格档案图谱', desc: '完整档案总览（本页）', done: false },
          ].map(item => (
            <Link key={item.label} to={item.to} style={{
              display: 'block', padding: '20px',
              background: '#fff', border: `1px solid ${item.done ? C.gold : C.border}`,
              borderRadius: '8px', textDecoration: 'none',
              transition: 'border-color .2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: C.h1, margin: 0 }}>{item.label}</p>
                {item.done && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: C.gold, border: `1px solid ${C.gold}`, padding: '2px 6px', letterSpacing: '1px' }}>✓ 已完成</span>}
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: 0 }}>{item.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
