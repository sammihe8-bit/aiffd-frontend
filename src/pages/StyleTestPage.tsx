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

// 图文单选卡片：嘴部宽度/嘴唇厚度这两组用，配图 + 标题 + 说明，单选（同组内选中一个自动取消其他）
function ImageRadioCard({ img, label, sub, active, onClick, imgHeight = 140, imgFit = 'cover' }: {
  img: string; label: string; sub?: string; active: boolean; onClick: () => void; imgHeight?: number; imgFit?: 'cover' | 'contain'
}) {
  return (
    <button onClick={onClick} style={{
      border: 'none', boxShadow: active ? `0 0 0 2px ${C.gold}` : `0 0 0 1px ${C.border}`,
      borderRadius: '8px', padding: 0, cursor: 'pointer', overflow: 'hidden',
      background: active ? '#fdf8ee' : '#fff', transition: 'all 0.2s', textAlign: 'left' as const,
    }}>
      <div style={{ width: '100%', height: `${imgHeight}px`, background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: imgFit, objectPosition: 'center', display: 'block' }} />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: active ? C.gold : C.h2, margin: sub ? '0 0 3px' : 0 }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: 0, lineHeight: 1.5 }}>{sub}</p>}
      </div>
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
// 嘴唇、面颊是 imageCombo（两组各自单选，图文选项，组合成一个数组存档）；
// 其余 3 项暂时还是 combo（两个子分类可多选，文字标签，标签合并存成一个数组）
const LIP_WIDTH_OPTIONS = [
  { id: 'narrow', label: '偏窄', sub: '嘴角间距相对脸宽较小', img: '/mouth-width-narrow.png' },
  { id: 'balanced', label: '适中', sub: '嘴宽与整体五官比例均衡', img: '/mouth-width-balanced.png' },
  { id: 'wide', label: '偏宽', sub: '嘴角横向延伸明显', img: '/mouth-width-wide.png' },
]
const LIP_FULLNESS_OPTIONS = [
  { id: 'thin', label: '偏薄', sub: '上下唇高度较小，轮廓偏平', img: '/lip-fullness-thin.png' },
  { id: 'medium', label: '适中', sub: '有自然弧度和适度饱满感', img: '/lip-fullness-medium.png' },
  { id: 'full', label: '丰满', sub: '上下唇高度明显，轮廓圆润', img: '/lip-fullness-full.png' },
]
const CHEEK_CONTOUR_OPTIONS = [
  { id: 'round', label: '圆弧型', img: '/cheek-contour-round.png' },
  { id: 'balanced', label: '均衡型', img: '/cheek-contour-balanced.png' },
  { id: 'angular', label: '棱角型', img: '/cheek-contour-angular.png' },
]
const CHEEK_FULLNESS_OPTIONS = [
  { id: 'full', label: '饱满', img: '/cheek-fullness-full.png' },
  { id: 'medium', label: '适中', img: '/cheek-fullness-medium.png' },
  { id: 'thin', label: '偏薄', img: '/cheek-fullness-thin.png' },
]
const CHEEKBONE_PROMINENCE_OPTIONS = [
  { id: 'low', label: '不明显', sub: '颧骨高点不突出，太阳穴到面颊过渡平缓', img: '/cheekbone-prominence-low.png' },
  { id: 'medium', label: '适中', sub: '能看到自然高点，但不会特别抢眼', img: '/cheekbone-prominence-medium.png' },
  { id: 'high', label: '明显', sub: '颧骨高点清楚，向前或向两侧的存在感较强', img: '/cheekbone-prominence-high.png' },
]
const CHEEKBONE_CONTOUR_OPTIONS = [
  { id: 'round', label: '圆润型', sub: '颧骨区域呈柔和圆弧，没有明显折角', img: '/cheekbone-contour-round.png' },
  { id: 'balanced', label: '均衡型', sub: '有一定轮廓变化，但不过分圆润或锐利', img: '/cheekbone-contour-balanced.png' },
  { id: 'angular', label: '棱角型', sub: '颧骨转折清楚，局部线条较直、有折角感', img: '/cheekbone-contour-angular.png' },
]
const CHIN_LENGTH_OPTIONS = [
  { id: 'short', label: '偏短', sub: '下唇至下巴底部的距离较短', img: '/chin-length-short.png' },
  { id: 'medium', label: '适中', sub: '下巴长度与整体面部比例协调', img: '/chin-length-medium.png' },
  { id: 'long', label: '偏长', sub: '下唇至下巴底部的距离较长', img: '/chin-length-long.png' },
]
const CHIN_TIP_OPTIONS = [
  { id: 'round', label: '圆润型', sub: '底部呈柔和圆弧', img: '/chin-tip-round.png' },
  { id: 'pointed', label: '尖窄型', sub: '向下逐渐收窄，形成较尖的轮廓', img: '/chin-tip-pointed.png' },
  { id: 'square', label: '方阔型', sub: '底部较平，左右转角比较清楚', img: '/chin-tip-square.png' },
]
const EYE_SIZE_OPTIONS = [
  { id: 'small', label: '偏小', sub: '眼睛在面部中的视觉占比较小', img: '/eye-size-small.png' },
  { id: 'medium', label: '适中', sub: '眼睛大小与整体五官比例均衡', img: '/eye-size-medium.png' },
  { id: 'large', label: '偏大', sub: '眼睛在面部中的视觉占比较大', img: '/eye-size-large.png' },
]
const EYE_SHAPE_OPTIONS = [
  { id: 'round', label: '圆润型', sub: '上下展开明显，眼睛纵向高度较大', img: '/eye-shape-round.png' },
  { id: 'almond', label: '杏仁型', sub: '中部较宽，内外眼角自然收窄', img: '/eye-shape-almond.png' },
  { id: 'long', label: '细长型', sub: '横向延伸明显，纵向高度较小', img: '/eye-shape-long.png' },
]
const EYE_SPACING_OPTIONS = [
  { id: 'close', label: '偏近', sub: '小于一只眼睛的宽度', img: '/eye-spacing-close.png' },
  { id: 'medium', label: '适中', sub: '约等于一只眼睛的宽度', img: '/eye-spacing-medium.png' },
  { id: 'far', label: '偏远', sub: '大于一只眼睛的宽度', img: '/eye-spacing-far.png' },
]
const NOSE_SIZE_OPTIONS = [
  { id: 'small', label: '偏小', sub: '鼻子长度和鼻翼宽度在面部中的视觉占比较小', img: '/nose-size-small.png' },
  { id: 'medium', label: '适中', sub: '鼻子大小与其他五官比例较均衡', img: '/nose-size-medium.png' },
  { id: 'large', label: '偏大', sub: '鼻子长度、宽度或整体存在感较强', img: '/nose-size-large.png' },
]
const NOSE_TIP_OPTIONS = [
  { id: 'round', label: '圆润型', sub: '鼻尖偏圆，鼻翼线条柔和', img: '/nose-tip-round.png' },
  { id: 'balanced', label: '均衡型', sub: '鼻尖有一定轮廓，但不过分圆钝或锐利', img: '/nose-tip-balanced.png' },
  { id: 'angular', label: '棱角型', sub: '鼻尖较清晰，鼻翼或鼻孔边缘转折明显', img: '/nose-tip-angular.png' },
]
const NOSE_PROJECTION_OPTIONS = [
  { id: 'flat', label: '偏平', sub: '鼻梁起伏较小，鼻尖突出度较弱', img: '/nose-projection-flat.png' },
  { id: 'medium', label: '适中', sub: '鼻梁和鼻尖具有自然的立体起伏', img: '/nose-projection-medium.png' },
  { id: 'prominent', label: '突出', sub: '鼻梁较高或鼻尖向前突出明显', img: '/nose-projection-prominent.png' },
]

const FACE_QUESTIONS = [
  {
    id: 'lip', title: '你的嘴部宽度和嘴唇厚度更接近哪一种？', type: 'imageCombo' as const,
    hint: '请保持嘴唇自然闭合，分别判断横向宽度和上下唇的纵向厚度。',
    imageGroups: [
      { key: 'width', label: '嘴部宽度', imgHeight: 260, imgFit: 'contain' as const, options: LIP_WIDTH_OPTIONS },
      { key: 'fullness', label: '嘴唇厚度', imgHeight: 140, options: LIP_FULLNESS_OPTIONS },
    ],
  },
  {
    id: 'cheek', title: '你的面颊外轮廓和丰满度更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '面颊轮廓：请观察脸部两侧的线条形状。',
      '面颊丰满度：请观察金色区域是否饱满或略有凹陷。',
    ],
    imageGroups: [
      { key: 'contour', label: '面颊外轮廓', imgHeight: 260, imgFit: 'contain' as const, options: CHEEK_CONTOUR_OPTIONS },
      { key: 'fullness', label: '面颊丰满度', imgHeight: 260, imgFit: 'contain' as const, options: CHEEK_FULLNESS_OPTIONS },
    ],
  },
  {
    id: 'cheekbone', title: '你的颧骨明显程度和轮廓形态更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '颧骨明显程度：从斜前方观察，你的颧骨突出程度更接近哪一种。',
      '颧骨轮廓形态：从正面观察，你的颧骨轮廓更接近哪一种。',
    ],
    imageGroups: [
      { key: 'prominence', label: '颧骨明显程度', imgHeight: 260, imgFit: 'contain' as const, options: CHEEKBONE_PROMINENCE_OPTIONS },
      { key: 'contour', label: '颧骨轮廓形态', imgHeight: 260, imgFit: 'contain' as const, options: CHEEKBONE_CONTOUR_OPTIONS },
    ],
  },
  {
    id: 'chin', title: '你的下巴纵向比例和尖端轮廓更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '下巴纵向比例：从正面观察，你的下巴长度更接近哪一种。',
      '下巴尖端轮廓：你的下巴最下端更接近哪一种。',
    ],
    imageGroups: [
      { key: 'length', label: '下巴纵向比例', imgHeight: 260, imgFit: 'contain' as const, options: CHIN_LENGTH_OPTIONS },
      { key: 'tip', label: '下巴尖端轮廓', imgHeight: 260, imgFit: 'contain' as const, options: CHIN_TIP_OPTIONS },
    ],
  },
  {
    id: 'eyes', title: '你的眼睛大小、轮廓形状和两眼间距更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '眼睛相对大小：与整张脸相比，你的眼睛大小更接近哪一种。',
      '眼睛轮廓形状：不考虑眼睛大小，你的眼裂轮廓更接近哪一种。',
      '两眼间距：两只眼睛内眼角之间的距离更接近哪一种。',
    ],
    imageGroups: [
      { key: 'size', label: '眼睛相对大小', imgHeight: 260, imgFit: 'contain' as const, options: EYE_SIZE_OPTIONS },
      { key: 'shape', label: '眼睛轮廓形状', imgHeight: 260, imgFit: 'contain' as const, options: EYE_SHAPE_OPTIONS },
      { key: 'spacing', label: '两眼间距', imgHeight: 260, imgFit: 'contain' as const, options: EYE_SPACING_OPTIONS },
    ],
  },
  {
    id: 'nose', title: '你的鼻子相对量感、鼻尖轮廓和立体度更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '鼻子相对量感：与整张脸相比，你的鼻子整体大小更接近哪一种。',
      '鼻尖轮廓：从正面观察，你的鼻尖和鼻翼轮廓更接近哪一种。',
      '鼻部立体度：从斜侧面观察，你的鼻梁和鼻尖突出程度更接近哪一种。',
    ],
    imageGroups: [
      { key: 'size', label: '鼻子相对量感', imgHeight: 260, imgFit: 'contain' as const, options: NOSE_SIZE_OPTIONS },
      { key: 'tip', label: '鼻尖轮廓', imgHeight: 260, imgFit: 'contain' as const, options: NOSE_TIP_OPTIONS },
      { key: 'projection', label: '鼻部立体度', imgHeight: 260, imgFit: 'contain' as const, options: NOSE_PROJECTION_OPTIONS },
    ],
  },
]

type Phase = 'intro' | 'face' | 'report'

// 面部6个维度的中文标签，存档时一起写进去，Profile 页展示时不用再重复维护这份映射
const FACE_DIMENSION_LABELS: Record<string, string> = {
  lip: '嘴唇', cheek: '两颊', cheekbone: '颧骨', chin: '下巴', eyes: '眼睛', nose: '鼻子',
}

export default function StyleTestPage() {
  const { user } = useAuth() // 用来给读取的 key 加用户前缀，避免读到别的账号存的体型数据
  const [phase, setPhase] = useState<Phase>('intro')
  const [bodyResult, setBodyResult] = useState<Record<string, unknown> | null>(null)
  const [faceIdx, setFaceIdx] = useState(0)
  const [faceAnswers, setFaceAnswers] = useState<Record<string, string | string[]>>({})
  // 嘴唇题的两组单选（宽度/厚度）分别记录用户选中的选项 id，供高亮显示；
  // 两组都选完后才把对应的中文标签合并写进 faceAnswers.lip，供后续打分和展示用
  const [imageComboSelections, setImageComboSelections] = useState<Record<string, Record<string, string>>>({})

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

  const toggleCombo = (qId: string, val: string) => {
    setFaceAnswers(prev => {
      const current = Array.isArray(prev[qId]) ? (prev[qId] as string[]) : []
      const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val]
      return { ...prev, [qId]: next }
    })
  }
  // 图文双组单选题（嘴唇、面颊……）：某一组选完就记下来，等这道题的所有组都选完，
  // 把每组选中的中文标签按顺序合并成数组存进 faceAnswers，跟其他 combo 题的存档格式保持一致
  const selectImageComboOption = (qId: string, groupKey: string, optionId: string) => {
    setImageComboSelections(prev => {
      const currentQ = { ...(prev[qId] ?? {}), [groupKey]: optionId }
      const q = FACE_QUESTIONS.find(fq => fq.id === qId)
      if (q && q.type === 'imageCombo') {
        const allFilled = q.imageGroups!.every(g => !!currentQ[g.key])
        if (allFilled) {
          const labels = q.imageGroups!.map(g => g.options.find(o => o.id === currentQ[g.key])?.label ?? '')
          setFaceAnswers(fa => ({ ...fa, [qId]: labels }))
        }
      }
      return { ...prev, [qId]: currentQ }
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
      // 面部测试原始答案单独存档，供 ProfilePage 展示"五官详细信息"用
      // 数组类型的组合答案（比如颧骨的"大小+形状"）用" + "拼成一句话，跟体型详情表格的展示方式保持一致
      const faceDetail: Record<string, { label: string; value: string }> = {}
      Object.entries(faceAnswers).forEach(([id, val]) => {
        faceDetail[id] = {
          label: FACE_DIMENSION_LABELS[id] || id,
          value: Array.isArray(val) ? val.join(' + ') : val,
        }
      })
      localStorage.setItem(userScopedKey('aiffd_face_result', user), JSON.stringify(faceDetail))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const reset = () => {
    setPhase('intro'); setFaceIdx(0); setFaceAnswers({}); setImageComboSelections({})
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
          const hasAnswer = q.type === 'imageCombo'
            ? q.imageGroups!.every(g => !!imageComboSelections[q.id]?.[g.key])
            : comboValue.length > 0

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

              {q.type === 'imageCombo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {'hint' in q && q.hint && (
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0, lineHeight: 1.7 }}>{q.hint}</p>
                  )}
                  {'hints' in q && q.hints && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {q.hints.map((line, i) => (
                        <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0, lineHeight: 1.7 }}>{line}</p>
                      ))}
                    </div>
                  )}
                  {q.imageGroups!.map(g => (
                    <div key={g.key}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, letterSpacing: '1px', marginBottom: '10px' }}>{g.label}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {g.options.map(o => (
                          <ImageRadioCard key={o.id} img={o.img} label={o.label} sub={'sub' in o ? o.sub : undefined}
                            imgHeight={'imgHeight' in g ? g.imgHeight : undefined}
                            imgFit={'imgFit' in g ? g.imgFit : undefined}
                            active={imageComboSelections[q.id]?.[g.key] === o.id}
                            onClick={() => selectImageComboOption(q.id, g.key, o.id)} />
                        ))}
                      </div>
                    </div>
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
                {(q.type === 'combo' || q.type === 'imageCombo') && (
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
