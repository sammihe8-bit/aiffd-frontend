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

export default function ProfilePage() {
  const { user } = useAuth()
  const u = user as Record<string, unknown> | null
  const username = (u?.username ?? u?.email ?? '用户') as string

  // ── 档案数据读取 ──────────────────────────────────
  // 以下所有 key 都加上了用户前缀（userScopedKey），避免同一浏览器不同账号互相看到对方的测试数据。
  // 注意：这只解决了"读"的这一半——aiffd_profile / aiffd_warmcool / aiffd_season_name /
  // aiffd_season_element / aiffd_element_name / aiffd_25season 这几个 key 具体是在哪个测试页写入的
  // （目测是 OnboardingPage 的基础信息表单 + ColorTestPage / ColorSeasonPage / ColorElementPage），
  // 那几个"写"的地方如果还没同步改成 userScopedKey，这里读到的仍然可能是旧的、不分账号的数据。
  const raw = localStorage.getItem(userScopedKey('aiffd_profile', user))
  const profile: StyleProfile | null = raw ? JSON.parse(raw) : null

  // 色彩相关
  const warmCool = localStorage.getItem(userScopedKey('aiffd_warmcool', user)) || ''
  const seasonName = localStorage.getItem(userScopedKey('aiffd_season_name', user)) || ''
  const seasonElement = localStorage.getItem(userScopedKey('aiffd_season_element', user)) || ''
  const elementName = localStorage.getItem(userScopedKey('aiffd_element_name', user)) || ''
  const finalSeason25 = localStorage.getItem(userScopedKey('aiffd_25season', user)) || ''

  // 体型相关
  const bodyRaw = localStorage.getItem(userScopedKey('aiffd_body_result', user))
  const bodyResult = bodyRaw ? (() => { try { return JSON.parse(bodyRaw) } catch { return null } })() : null

  // 风格相关：之前这里直接把 JSON 字符串当成显示文本，现在解析出具体字段
  const styleRaw = localStorage.getItem(userScopedKey('aiffd_style_result', user))
  const styleResult: StyleResultData | null = styleRaw
    ? (() => { try { return JSON.parse(styleRaw) as StyleResultData } catch { return null } })()
    : null
  const styleDisplayName = styleResult?.styleInfo?.cn || styleResult?.variant || ''

  // 完整度计算
  const completedItems = [
    profile?.bodyType,
    warmCool,
    seasonName,
    elementName || finalSeason25,
    styleResult,
  ].filter(Boolean).length
  const totalItems = 5
  const completionPct = Math.round((completedItems / totalItems) * 100)

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 24px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}`, paddingBottom: '32px', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, marginBottom: '10px' }}>个人风格档案</p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, margin: 0 }}>{username}</h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', border: `1px solid ${C.gold}`, color: C.gold, padding: '4px 12px', letterSpacing: '2px' }}>
              STYLE PROFILE {completionPct >= 80 ? '2.0' : completionPct >= 40 ? '1.5' : '1.0'}
            </span>
            {/* 完整度进度条 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '120px', height: '3px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${completionPct}%`, background: C.gold, transition: 'width .4s ease' }} />
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{completionPct}% 完整</span>
            </div>
          </div>
        </div>

        {/* ── 色彩档案 ── */}
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <SectionTitle label="色彩档案" />

          {/* 第一层：冷暖 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: C.border, marginBottom: '16px' }}>
            {[
              {
                label: '冷暖底调',
                value: WARMCOOL_LABELS[warmCool] || null,
                to: '/test/color',
                tag: '第一层',
              },
              {
                label: '五季主型',
                value: seasonName ? `${seasonName}（${seasonElement}）` : null,
                to: '/test/color/season',
                tag: '第二层',
              },
              {
                label: '东方 25 季',
                value: finalSeason25 || null,
                to: '/test/color/element',
                tag: '第三层',
              },
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

          {/* 五行副气 + 色板 */}
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

        {/* ── 体型档案 ── */}
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <SectionTitle label="体型档案" />
          {(profile?.bodyType || bodyResult?.bodyShape) ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1px', background: C.border }}>
              {[
                { label: '体型', value: bodyResult?.bodyShape ? `${bodyResult.bodyShape}型` : (profile?.bodyType || null) },
                { label: '身体线条', value: bodyResult?.bodyLine === 'curve' ? '曲线感' : bodyResult?.bodyLine === 'straight' ? '直线感' : bodyResult?.bodyLine === 'soft' ? '柔和线条' : bodyResult?.bodyLine === 'mixed' ? '混合线条' : null },
                { label: '骨架', value: bodyResult?.boneScale === 'small' ? '小巧纤细' : bodyResult?.boneScale === 'medium' ? '中等骨架' : bodyResult?.boneScale === 'large' ? '宽大骨架' : null },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', padding: '20px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '8px' }}>{item.label}</p>
                  {item.value ? (
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: C.h1, margin: 0 }}>{item.value}</p>
                  ) : (
                    <EmptyBadge label="完善体型数据" to="/test/body" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '16px' }}>体型档案尚未建立</p>
              <Link to="/test/body" style={{ display: 'inline-block', background: C.gold, color: '#fff', padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', textDecoration: 'none', borderRadius: '4px' }}>
                开始体型测试
              </Link>
            </div>
          )}
        </div>

        {/* ── 风格档案 ── */}
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
          <SectionTitle label="风格档案" />
          {((profile?.styleDirections?.length ?? 0) > 0 || styleResult) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {styleResult && (
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '8px' }}>风格主型</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: C.gold, margin: 0 }}>{styleDisplayName}</p>
                  {styleResult.styleInfo?.family && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: '6px 0 0' }}>
                      {styleResult.styleInfo.family}（{styleResult.styleInfo.familyEn}）家族 · 五行属{styleResult.styleInfo.element}
                    </p>
                  )}
                </div>
              )}
              {(profile?.styleDirections?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '12px' }}>风格关键词</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profile?.styleDirections.map(s => (
                      <span key={s} style={{ border: `1px solid ${C.gold}`, color: C.gold, padding: '4px 14px', fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1px' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {(profile?.concerns?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '12px' }}>主要穿衣困扰</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profile?.concerns.map(c => (
                      <span key={c} style={{ background: '#f5f5f3', color: C.body, padding: '4px 14px', fontFamily: 'Inter, sans-serif', fontSize: '11px' }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '16px' }}>风格档案尚未建立</p>
              <Link to="/test/style" style={{ display: 'inline-block', background: C.gold, color: '#fff', padding: '10px 24px', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', textDecoration: 'none', borderRadius: '4px' }}>
                开始风格测试
              </Link>
            </div>
          )}
        </div>

        {/* ── 基础信息 ── */}
        {profile && (
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', marginBottom: '24px' }}>
            <SectionTitle label="基础信息" />
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

        {/* ── 快捷入口 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { to: '/test/color', label: '色彩测试', desc: '冷暖 → 五季 → 25季', done: !!warmCool },
            { to: '/test/body', label: '体型测试', desc: '骨架 · 线条 · 廓形', done: !!(profile?.bodyType || bodyResult) },
            { to: '/test/style', label: '风格测试', desc: '13风格 · 气韵判断', done: !!styleResult },
            { to: '/virtual-fit', label: '虚拟试衣', desc: '上身预览 · 360°', done: false },
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
