import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { userScopedKey } from '../utils/userStorage'

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

// 13 型风格 → 模特图文件名 slug 的映射。
// 图片放在 public/style-portraits/{slug}.png，命名规则：家族英文-档位（soft/base/dramatic）
// 等 13 张手绘模特图传上来，文件名按下面这个表放就行，代码不用再改。
const VARIANT_IMAGE_SLUG: Record<string, string> = {
  '浪漫型': 'romantic-base',
  '戏剧浪漫型': 'romantic-dramatic',
  '柔软少年型': 'gamine-soft',
  '少年型': 'gamine-base',
  '戏剧少年型': 'gamine-dramatic',
  '柔软经典型': 'classic-soft',
  '经典型': 'classic-base',
  '戏剧经典型': 'classic-dramatic',
  '浪漫自然型': 'natural-soft',
  '自然型': 'natural-base',
  '戏剧自然型': 'natural-dramatic',
  '浪漫戏剧型': 'dramatic-soft',
  '戏剧型': 'dramatic-base',
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

// 邮箱首字母头像（占位方案，后续可换成真实上传）
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

export default function ProfilePage() {
  const { user } = useAuth()
  const u = user as Record<string, unknown> | null
  const username = (u?.username ?? u?.email ?? '用户') as string
  const email = (u?.email ?? '') as string

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
  const styleDisplayName = styleResult?.styleInfo?.cn || styleResult?.variant || ''
  const portraitSlug = styleDisplayName ? VARIANT_IMAGE_SLUG[styleDisplayName] : undefined
  const portraitSrc = portraitSlug ? `/style-portraits/${portraitSlug}.png` : undefined

  const completedItems = [
    bodyResult, styleResult, warmCool, seasonName, elementName || finalSeason25,
  ].filter(Boolean).length
  const totalItems = 5
  const completionPct = Math.round((completedItems / totalItems) * 100)

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', border: `1px solid ${C.gold}`, color: C.gold, padding: '4px 12px', letterSpacing: '2px' }}>
              STYLE PROFILE {completionPct >= 80 ? '2.0' : completionPct >= 40 ? '1.5' : '1.0'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '120px', height: '3px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${completionPct}%`, background: C.gold, transition: 'width .4s ease' }} />
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{completionPct}% 完整</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: `1px solid ${C.border}`, paddingBottom: '32px', marginBottom: '40px' }}>
          <AvatarInitial text={email} />
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, marginBottom: '8px' }}>个人风格档案</p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, margin: 0 }}>{username}</h1>
          </div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, border: `1px dashed ${C.border}`, padding: '6px 14px', borderRadius: '4px' }}>
            编辑资料（即将上线）
          </span>
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
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.gold, marginBottom: '10px' }}>五官详细信息</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0, lineHeight: 1.8 }}>
                    面部测试的嘴唇/两颊/颧骨/下巴/眼睛/鼻子详细答案暂未单独存档，下一轮可以补充展示。
                  </p>
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
              { label: '五季主型', value: seasonName ? `${seasonName}（${seasonElement}）` : null, to: '/test/color/season', tag: '第二层' },
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
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 2px' }}>五行副气</p>
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
