import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { userScopedKey } from '../utils/userStorage'
import ThreeStageProgress from '../components/ThreeStageProgress'
import { STYLE_OPTIONS, NO_FIXED_STYLE, NO_REJECTED_STYLE, styleLabelOf } from '../utils/fashionStyleOptions'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

const btnGold: React.CSSProperties = {
  background: C.gold, color: '#fff', border: 'none', borderRadius: '4px',
  padding: '14px 32px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
  letterSpacing: '1px', cursor: 'pointer',
}
const btnOutline: React.CSSProperties = {
  background: 'transparent', color: C.body, border: `1px solid ${C.border}`,
  borderRadius: '4px', padding: '14px 24px', fontFamily: 'Inter, sans-serif',
  fontSize: '12px', cursor: 'pointer',
}

type Phase = 'intro' | 'q1' | 'q2' | 'q3' | 'report'

function StyleTagCard({ label, desc, active, disabled, onClick }: {
  label: string; desc: string; active: boolean; disabled?: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} disabled={disabled && !active} style={{
      border: `1.5px solid ${active ? C.gold : C.border}`,
      background: active ? '#fdf8ee' : disabled ? '#f5f5f3' : '#fff',
      padding: '16px 18px', textAlign: 'left', cursor: (disabled && !active) ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s', borderRadius: '8px', width: '100%',
      opacity: (disabled && !active) ? 0.5 : 1,
    }}>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: active ? C.gold : C.h2, margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{desc}</p>
    </button>
  )
}

// Q1 专用的图文卡片：配图 + 标题 + 说明，右上角可以点星标记"最喜欢"
// 12 张图尺寸完全一致（1024×1536），不需要裁切，直接完整显示
function StyleImageCard({ label, desc, img, active, disabled, onClick }: {
  label: string; desc: string; img: string; active: boolean; disabled?: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} disabled={disabled && !active} style={{
      border: `1.5px solid ${active ? C.gold : C.border}`,
      background: active ? '#fdf8ee' : '#fff',
      padding: 0, textAlign: 'left', cursor: (disabled && !active) ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s', borderRadius: '8px', width: '100%', overflow: 'hidden',
      opacity: (disabled && !active) ? 0.5 : 1,
    }}>
      <img src={img} alt={label} style={{ width: '100%', height: 'auto', display: 'block' }} />
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: active ? C.gold : C.h2, margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{desc}</p>
      </div>
    </button>
  )
}

export default function FashionTestPage() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('intro')

  // 是否已经存在这个模块的测试结果。已完成的用户重新进入这个页面时，
  // 不应该直接看到 Q1 从头开始，而是先看到"已完成"提示屏；
  // 只有明确点"重新测试"并在二次确认后，才真正清空重来。
  const fashionKey = userScopedKey('aiffd_fashion_style', user)
  const [retestState, setRetestState] = useState<'none' | 'confirming'>('none')
  const [confirmedRetest, setConfirmedRetest] = useState(false)
  const existingFashionResult = !confirmedRetest && !!localStorage.getItem(fashionKey)

  const confirmRestart = () => {
    localStorage.removeItem(fashionKey)
    setConfirmedRetest(true)
    setRetestState('none')
    setPhase('intro')
  }

  // Q1：理想形象，最少3最多5，其中可以标1个"最喜欢"
  const [q1Selected, setQ1Selected] = useState<string[]>([])
  const [q1Primary, setQ1Primary] = useState<string | null>(null)

  // Q2：实际最常穿，最多3，"没有固定风格"是互斥选项
  const [q2Selected, setQ2Selected] = useState<string[]>([])

  // Q3：明确不喜欢，不限数量，"没有特别排斥的风格"是互斥选项
  const [q3Selected, setQ3Selected] = useState<string[]>([])

  const toggleQ1 = (id: string) => {
    setQ1Selected(prev => {
      if (prev.includes(id)) {
        if (q1Primary === id) setQ1Primary(null)
        return prev.filter(v => v !== id)
      }
      if (prev.length >= 5) return prev
      return [...prev, id]
    })
  }

  const toggleQ2 = (id: string) => {
    setQ2Selected(prev => {
      if (id === NO_FIXED_STYLE) return prev.includes(id) ? [] : [NO_FIXED_STYLE]
      const withoutExclusive = prev.filter(v => v !== NO_FIXED_STYLE)
      if (withoutExclusive.includes(id)) return withoutExclusive.filter(v => v !== id)
      if (withoutExclusive.length >= 3) return withoutExclusive
      return [...withoutExclusive, id]
    })
  }

  const toggleQ3 = (id: string) => {
    setQ3Selected(prev => {
      if (id === NO_REJECTED_STYLE) return prev.includes(id) ? [] : [NO_REJECTED_STYLE]
      const withoutExclusive = prev.filter(v => v !== NO_REJECTED_STYLE)
      return withoutExclusive.includes(id) ? withoutExclusive.filter(v => v !== id) : [...withoutExclusive, id]
    })
  }

  // 完成 Q3：按文档逻辑存档，Q1/Q2 重合度判断"风格稳定 / 存在形象升级需求 / 没有固定风格"
  const finishFashionStyle = () => {
    const secondary = q1Selected.filter(id => id !== q1Primary)
    let gap: 'stable' | 'gap' | 'no_fixed_style' = 'gap'
    if (q2Selected.includes(NO_FIXED_STYLE)) {
      gap = 'no_fixed_style'
    } else if (q2Selected.length > 0) {
      const overlap = q2Selected.filter(id => q1Selected.includes(id)).length
      gap = overlap / q2Selected.length >= 0.5 ? 'stable' : 'gap'
    }

    localStorage.setItem(fashionKey, JSON.stringify({
      aspired_style_primary: q1Primary,
      aspired_style_secondary: secondary,
      style_image_ids: q1Selected,
      current_style: q2Selected,
      current_aspired_style_gap: gap,
      rejected_style_codes: q3Selected,
    }))
    setPhase('report')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <ThreeStageProgress
        activeStage="preference"
        formDone={!!localStorage.getItem(userScopedKey('aiffd_style_result', user))}
        colorDone={!!localStorage.getItem(userScopedKey('aiffd_25season', user))}
        preferenceDone={!!localStorage.getItem(fashionKey)}
        currentLabel={phase === 'q1' ? '理想形象 · 你想成为的样子' : phase === 'q2' ? '理想形象 · 实际最常穿' : phase === 'q3' ? '理想形象 · 明确不喜欢' : undefined}
        currentNum={phase === 'q1' ? 1 : phase === 'q2' ? 2 : phase === 'q3' ? 3 : undefined}
        currentTotal={(phase === 'q1' || phase === 'q2' || phase === 'q3') ? 3 : undefined}
      />

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {existingFashionResult && retestState === 'none' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>个人时尚选择 · 理想形象</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.h1, fontWeight: 400, lineHeight: 1.3, margin: '0 0 16px' }}>你已经完成过这项测试</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.9, margin: 0 }}>
                可以直接去档案页查看已经记录的结果，也可以重新测试一遍——但重新测试会清空并替换这部分之前的答案。
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/profile" style={{ ...btnGold, textDecoration: 'none', textAlign: 'center' as const, display: 'block' }}>查看我的档案结果</Link>
              <button onClick={() => setRetestState('confirming')} style={btnOutline}>重新测试</button>
              <Link to="/onboarding" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, textDecoration: 'none', textAlign: 'center' as const }}>返回测试中心</Link>
            </div>
          </div>
        )}

        {existingFashionResult && retestState === 'confirming' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#c0392b', letterSpacing: '2px', marginBottom: '10px' }}>⚠ 请确认</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>重新测试会清空之前的结果</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, marginTop: '12px' }}>
                你之前在"理想形象"里选择的最喜欢形象、实际最常穿和明确不喜欢的类型都会被删除，替换成这次重新测试的新结果，且无法恢复。档案里其他测试模块不受影响。
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setRetestState('none')} style={btnOutline}>取消，返回</button>
              <button onClick={confirmRestart} style={{ ...btnGold, flex: 1, background: '#c0392b' }}>确认清空并重新测试</button>
            </div>
          </div>
        )}

        {!existingFashionResult && (
          <>
            {phase === 'intro' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>个人时尚选择 · 第一部分</p>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: C.h1, fontWeight: 400, lineHeight: 1.3, margin: '0 0 16px' }}>理想形象</h1>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.9, margin: 0 }}>
                    这一部分想了解你"想呈现的感觉"、"实际的穿着习惯"，以及"明确不喜欢的方向"——这些是你的主观偏好，不会覆盖体型和风格测试算出的客观结论，而是跟它们放在一起，让推荐更贴近你的真实想法。
                  </p>
                </div>
                <div style={{ background: '#fdf8ee', borderRadius: '8px', padding: '16px 20px', borderLeft: `3px solid ${C.gold}` }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>
                    💡 共 3 道题，约 2 分钟。个人时尚选择完整版还包含商品款式、色彩选择等 5 个模块，会陆续上线。
                  </p>
                </div>
                <button onClick={() => setPhase('q1')} style={btnGold}>开始 →</button>
              </div>
            )}

            {phase === 'q1' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '10px' }}>Q1 · {q1Selected.length} / 5</p>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>
                    不考虑年龄、身材和现在的衣橱，以下哪些形象最接近你想成为的样子？
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>请选择最喜欢的 3 项，最多选择 5 项。选中后可以再点一次星标，标记其中最喜欢的 1 项。</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {STYLE_OPTIONS.map(o => {
                    const active = q1Selected.includes(o.id)
                    return (
                      <div key={o.id} style={{ position: 'relative' }}>
                        <StyleImageCard label={o.label} desc={o.desc} img={o.img} active={active} disabled={q1Selected.length >= 5} onClick={() => toggleQ1(o.id)} />
                        {active && (
                          <button
                            onClick={() => setQ1Primary(q1Primary === o.id ? null : o.id)}
                            style={{
                              position: 'absolute', top: '8px', right: '8px', border: 'none', cursor: 'pointer',
                              background: 'rgba(255,255,255,0.85)', borderRadius: '50%', width: '30px', height: '30px',
                              fontSize: '16px', color: q1Primary === o.id ? C.gold : '#bbb',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                            }}
                            aria-label="设为最喜欢"
                          >★</button>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setPhase('intro')} style={btnOutline}>← 返回</button>
                  <button
                    onClick={() => setPhase('q2')}
                    disabled={q1Selected.length < 3}
                    style={q1Selected.length >= 3 ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                    继续
                  </button>
                </div>
              </div>
            )}

            {phase === 'q2' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '10px' }}>Q2 · {q2Selected.includes(NO_FIXED_STYLE) ? '—' : `${q2Selected.length} / 3`}</p>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>
                    回想最近一个月，你实际穿得最多的是哪些类型？
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>最多选择 3 项。</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {STYLE_OPTIONS.map(o => (
                      <StyleImageCard key={o.id} label={o.label} desc={o.desc} img={o.img}
                        active={q2Selected.includes(o.id)}
                        disabled={q2Selected.length >= 3 || q2Selected.includes(NO_FIXED_STYLE)}
                        onClick={() => toggleQ2(o.id)} />
                    ))}
                  </div>
                  <StyleTagCard label="没有固定风格" desc="穿搭比较随机，没有明显偏好方向"
                    active={q2Selected.includes(NO_FIXED_STYLE)} onClick={() => toggleQ2(NO_FIXED_STYLE)} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setPhase('q1')} style={btnOutline}>← 返回</button>
                  <button
                    onClick={() => setPhase('q3')}
                    disabled={q2Selected.length === 0}
                    style={q2Selected.length > 0 ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                    继续
                  </button>
                </div>
              </div>
            )}

            {phase === 'q3' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '10px' }}>Q3</p>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>
                    以下哪些形象是你明确不喜欢的？
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>请选择所有不喜欢的类型，不限数量。</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {STYLE_OPTIONS.map(o => (
                    <StyleTagCard key={o.id} label={o.label} desc={o.desc}
                      active={q3Selected.includes(o.id)}
                      disabled={q3Selected.includes(NO_REJECTED_STYLE)}
                      onClick={() => toggleQ3(o.id)} />
                  ))}
                  <StyleTagCard label="没有特别排斥的风格" desc="以上类型都还能接受"
                    active={q3Selected.includes(NO_REJECTED_STYLE)} onClick={() => toggleQ3(NO_REJECTED_STYLE)} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => setPhase('q2')} style={btnOutline}>← 返回</button>
                  <button
                    onClick={finishFashionStyle}
                    disabled={q3Selected.length === 0}
                    style={q3Selected.length > 0 ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                    完成
                  </button>
                </div>
              </div>
            )}

            {phase === 'report' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: `1px solid ${C.border}` }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '8px' }}>✓ 理想形象已记录</p>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.h1, fontWeight: 400, margin: 0 }}>你的风格向往</h1>
                </div>

                <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px 24px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.gold, marginBottom: '12px' }}>最想成为的样子</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {q1Primary && (
                      <span style={{ border: `1.5px solid ${C.gold}`, background: '#fdf8ee', color: C.gold, padding: '6px 14px', borderRadius: '20px', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                        ★ {styleLabelOf(q1Primary)}
                      </span>
                    )}
                    {q1Selected.filter(id => id !== q1Primary).map(id => (
                      <span key={id} style={{ border: `1px solid ${C.border}`, color: C.body, padding: '6px 14px', borderRadius: '20px', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                        {styleLabelOf(id)}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px 24px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.gold, marginBottom: '12px' }}>实际最常穿</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {q2Selected.includes(NO_FIXED_STYLE) ? (
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>没有固定风格</span>
                    ) : q2Selected.map(id => (
                      <span key={id} style={{ border: `1px solid ${C.border}`, color: C.body, padding: '6px 14px', borderRadius: '20px', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                        {styleLabelOf(id)}
                      </span>
                    ))}
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginTop: '14px', marginBottom: 0, lineHeight: 1.7 }}>
                    {q2Selected.includes(NO_FIXED_STYLE)
                      ? '目前还没有稳定的风格方向，后续会优先给你基础衣橱和风格建立方案。'
                      : q2Selected.filter(id => q1Selected.includes(id)).length / q2Selected.length >= 0.5
                        ? '你实际的穿着习惯跟你向往的形象比较接近，风格已经比较稳定了。'
                        : '你实际穿的和你向往的形象有一些差距——这正是可以帮你逐步过渡的地方。'}
                  </p>
                </div>

                {!q3Selected.includes(NO_REJECTED_STYLE) && q3Selected.length > 0 && (
                  <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px 24px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '12px' }}>明确不喜欢</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {q3Selected.map(id => (
                        <span key={id} style={{ background: '#f5f5f3', color: C.body, padding: '6px 14px', borderRadius: '20px', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                          {styleLabelOf(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: '#f7f4ef', borderRadius: '8px', padding: '20px 24px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, margin: 0 }}>
                    个人时尚选择接下来还有商品款式、色彩选择、图案与材质、场景与边界、表达目标共 5 个模块，会陆续上线。
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
                  <Link to="/onboarding" style={{ ...btnOutline, textDecoration: 'none', textAlign: 'center' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>返回测试中心</Link>
                  <Link to="/profile" style={{ ...btnGold, textDecoration: 'none', textAlign: 'center' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>进入我的档案</Link>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
