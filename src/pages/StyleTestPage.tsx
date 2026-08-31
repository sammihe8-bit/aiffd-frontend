import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { computeStyleScore, type StyleAnswers } from '../utils/styleScoring'
import { useAuth } from '../hooks/useAuth'
import { userScopedKey } from '../utils/userStorage'

// ─── 设计系统（与 BodyTestPage 保持一致）─────────────────────
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

function OptionCard({ label, sub, active, onClick }: {
  label: string; sub?: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      border: `1px solid ${active ? C.gold : C.border}`,
      background: active ? '#fdf8ee' : '#fff',
      padding: '16px 20px', textAlign: 'left', cursor: 'pointer',
      transition: 'all 0.2s', width: '100%', borderRadius: '6px',
    }}>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: active ? C.gold : C.h2, marginBottom: sub ? '4px' : 0 }}>{label}</p>
      {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{sub}</p>}
    </button>
  )
}

function MultiOptionCard({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      border: `1px solid ${active ? C.gold : C.border}`,
      background: active ? '#fdf8ee' : '#fff',
      padding: '12px 18px', textAlign: 'left', cursor: 'pointer',
      transition: 'all 0.2s', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <span style={{
        width: '16px', height: '16px', borderRadius: '4px', flexShrink: 0,
        border: `1.5px solid ${active ? C.gold : C.border}`,
        background: active ? C.gold : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <span style={{ color: '#fff', fontSize: '11px', lineHeight: 1 }}>✓</span>}
      </span>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: active ? C.gold : C.h2 }}>{label}</span>
    </button>
  )
}

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, margin: 0 }}>{label}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: 0 }}>{current} / {total}</p>
      </div>
      <div style={{ height: '1px', background: C.border }}>
        <div style={{ height: '1px', background: C.gold, width: `${(current / total) * 100}%`, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

// ─── 面部测试题目配置 ──────────────────────────────────────────
// 6 个维度，对应 styleMatrix.ts 里 id 为 lip/cheek/cheekbone/chin/eyes/nose 的定义
// 嘴唇是 orSingle（单选，6 选 1）；其余 5 项是 combo（两个子分类各选一个，标签合并存成一个数组）
const LIP_OPTIONS = ['大厚', '中厚', '小厚', '大薄', '中薄', '小薄']

const FACE_QUESTIONS = [
  {
    id: 'lip', title: '你的嘴唇更接近哪种？', type: 'single' as const,
    options: LIP_OPTIONS,
  },
  {
    id: 'cheek', title: '你的两颊质地和丰满度更接近？', type: 'combo' as const,
    groups: [
      { label: '质地', options: ['肉', '角', '中'] },
      { label: '丰满度', options: ['丰满', '适中', '紧实'] },
    ],
  },
  {
    id: 'cheekbone', title: '你的颧骨大小和形状更接近？', type: 'combo' as const,
    groups: [
      { label: '大小', options: ['大', '适中', '小'] },
      { label: '形状', options: ['圆', '尖', '凸', '角', '匀'] },
    ],
  },
  {
    id: 'chin', title: '你的下巴形状和大小更接近？', type: 'combo' as const,
    groups: [
      { label: '形状', options: ['圆', '尖', '匀', '凸', '方'] },
      { label: '大小', options: ['大', '小', '适中'] },
    ],
  },
  {
    id: 'eyes', title: '你的眼睛大小和形状更接近？', type: 'combo' as const,
    groups: [
      { label: '大小', options: ['细小', '小', '中', '大', '超大'] },
      { label: '形状', options: ['圆', '直', '眼距近', '眼距远'] },
    ],
  },
  {
    id: 'nose', title: '你的鼻子大小和形状更接近？', type: 'combo' as const,
    groups: [
      { label: '大小', options: ['大', '中', '小'] },
      { label: '形状', options: ['圆', '棱', '凸', '匀'] },
    ],
  },
]

type Phase = 'intro' | 'face' | 'report'

export default function StyleTestPage() {
  const { user } = useAuth() // 用来给读取的 key 加用户前缀，避免读到别的账号存的体型数据
  const [phase, setPhase] = useState<Phase>('intro')
  const [bodyResult, setBodyResult] = useState<Record<string, unknown> | null>(null)
  const [faceIdx, setFaceIdx] = useState(0)
  const [faceAnswers, setFaceAnswers] = useState<Record<string, string | string[]>>({})
  const AUTO_ADVANCE_DELAY = 260

  useEffect(() => {
    const raw = localStorage.getItem(userScopedKey('aiffd_body_result', user))
    if (raw) {
      try { setBodyResult(JSON.parse(raw)) } catch { setBodyResult(null) }
    } else {
      setBodyResult(null) // 显式清空：避免切换账号后仍然沿用上一个账号读到的 bodyResult 残留在 state 里
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const goNextFace = () => {
    if (faceIdx < FACE_QUESTIONS.length - 1) setFaceIdx(faceIdx + 1)
    else setPhase('report')
  }
  const goBackFace = () => {
    if (faceIdx > 0) setFaceIdx(faceIdx - 1)
    else setPhase('intro')
  }

  const selectSingle = (qId: string, val: string) => {
    setFaceAnswers(prev => ({ ...prev, [qId]: val }))
    setTimeout(goNextFace, AUTO_ADVANCE_DELAY)
  }
  const toggleCombo = (qId: string, val: string) => {
    setFaceAnswers(prev => {
      const current = Array.isArray(prev[qId]) ? (prev[qId] as string[]) : []
      const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val]
      return { ...prev, [qId]: next }
    })
  }

  // 组合体型测试的原始数据 + 面部测试答案，交给两层匹配引擎统一打分
  const finalAnswers: StyleAnswers = { ...(bodyResult ?? {}), ...faceAnswers } as StyleAnswers
  const scoreResult = phase === 'report' ? computeStyleScore(finalAnswers) : null

  useEffect(() => {
    if (scoreResult) {
      localStorage.setItem(userScopedKey('aiffd_style_result', user), JSON.stringify({
        family: scoreResult.winningFamily,
        variant: scoreResult.winningVariant,
        styleInfo: scoreResult.winningStyleInfo,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const reset = () => {
    setPhase('intro'); setFaceIdx(0); setFaceAnswers({})
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', padding: '60px 24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* ── 入口：检查体型测试是否已完成 ── */}
        {phase === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>
                风格测试 · 13 型判定
              </p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>
                {bodyResult ? '体型数据已就绪，开始面部测试' : '需要先完成体型测试'}
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, marginTop: '14px' }}>
                {bodyResult
                  ? '风格测试的 13 型结论 = 体型测试的骨架+皮肉数据 + 接下来 6 道面部测试题，两者一起计算。'
                  : '风格测试需要用到体型测试（骨架+皮肉）的数据才能计算最终结论，请先完成体型测试。'}
              </p>
            </div>

            {bodyResult ? (
              <button onClick={() => setPhase('face')} style={btnGold}>开始面部测试 →</button>
            ) : (
              <Link to="/test/body" style={{
                display: 'inline-block', background: C.gold, color: '#fff', padding: '14px 32px',
                fontFamily: 'Inter, sans-serif', fontSize: '13px', textDecoration: 'none', borderRadius: '4px',
                textAlign: 'center' as const, width: 'fit-content',
              }}>前往体型测试 →</Link>
            )}
          </div>
        )}

        {/* ── 面部测试：6 题 ── */}
        {phase === 'face' && (() => {
          const q = FACE_QUESTIONS[faceIdx]
          const comboValue = Array.isArray(faceAnswers[q.id]) ? (faceAnswers[q.id] as string[]) : []
          const hasAnswer = q.type === 'single' ? !!faceAnswers[q.id] : comboValue.length > 0

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <ProgressBar current={faceIdx + 1} total={FACE_QUESTIONS.length} label="FACE TEST" />
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>
                  面部测试 · {faceIdx + 1} / {FACE_QUESTIONS.length}
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>
                  {q.title}
                </h2>
              </div>

              {q.type === 'single' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options!.map(o => (
                    <OptionCard key={o} label={o} active={faceAnswers[q.id] === o}
                      onClick={() => selectSingle(q.id, o)} />
                  ))}
                </div>
              )}

              {q.type === 'combo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {q.groups!.map(g => (
                    <div key={g.label}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, letterSpacing: '1px', marginBottom: '10px' }}>{g.label}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {g.options.map(o => (
                          <MultiOptionCard key={o} label={o} active={comboValue.includes(o)}
                            onClick={() => toggleCombo(q.id, o)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={goBackFace} style={btnOutline}>← 返回</button>
                {q.type === 'combo' && (
                  <button
                    onClick={goNextFace}
                    disabled={!hasAnswer}
                    style={hasAnswer ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                    继续
                  </button>
                )}
              </div>
            </div>
          )
        })()}

        {/* ── 报告：两层匹配引擎算出的最终 13 型结果 ── */}
        {phase === 'report' && scoreResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '8px' }}>你的风格结论</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: C.h1, fontWeight: 400, margin: '0 0 4px' }}>
                {scoreResult.winningVariant}
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
                {scoreResult.winningStyleInfo.family}（{scoreResult.winningStyleInfo.familyEn}）家族 · 五行属{scoreResult.winningStyleInfo.element}
              </p>
            </div>

            <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px 24px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '14px' }}>家族匹配度</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(scoreResult.looseScoreByFamily).sort((a, b) => b[1] - a[1]).map(([family, score]) => (
                  <div key={family}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: family === scoreResult.winningFamily ? C.gold : C.body, margin: 0 }}>{family}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{Math.round(score * 100)}%</p>
                    </div>
                    <div style={{ height: '4px', background: '#f0f0ec', borderRadius: '2px' }}>
                      <div style={{ height: '4px', borderRadius: '2px', background: family === scoreResult.winningFamily ? C.gold : C.border, width: `${score * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px 24px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '14px' }}>
                {scoreResult.winningFamily} 家族内变体精匹配度
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(scoreResult.strictScoreByVariant).sort((a, b) => b[1] - a[1]).map(([variant, score]) => (
                  <div key={variant}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: variant === scoreResult.winningVariant ? C.gold : C.body, margin: 0 }}>{variant}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{Math.round(score * 100)}%</p>
                    </div>
                    <div style={{ height: '4px', background: '#f0f0ec', borderRadius: '2px' }}>
                      <div style={{ height: '4px', borderRadius: '2px', background: variant === scoreResult.winningVariant ? C.gold : C.border, width: `${score * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              <button onClick={reset} style={btnOutline}>重新测试</button>
              <Link to="/onboarding" style={{ ...btnOutline, textDecoration: 'none', textAlign: 'center' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>返回测试中心</Link>
              <Link to="/profile" style={{ ...btnGold, textDecoration: 'none', textAlign: 'center' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>进入我的档案</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
