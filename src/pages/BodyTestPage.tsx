import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

// ── 流程
// AI 路径:    method → data(AI拍照) → skeleton(AI预填) → flesh → qixue → report
// 手动路径:   method → data(三围输入) → skeleton → flesh → qixue → report
type Phase = 'method' | 'data' | 'skeleton' | 'flesh' | 'qixue' | 'report'

// ── 13型家族数据库（气血态 5 态 → 13 型家族 → 细分型）
// 参考：AIFFD 架构文档 2026-08-25 第二章
const FAMILY_INFO: Record<string, {
  element: string        // 对应五行
  familyName: string     // 家族中文名
  familyEn: string       // 家族英文名
  variants: { soft?: string; base: string; intense: string } // 细分型（部分家族无 soft 档）
}> = {
  '阴': { element: '水', familyName: '浪漫型', familyEn: 'Romantic', variants: { base: '浪漫型', intense: '戏剧浪漫型' } },
  '阴多阳少': { element: '金', familyName: '少年型', familyEn: 'Gamine', variants: { soft: '柔软少年型', base: '少年型', intense: '戏剧少年型' } },
  '阴阳和谐': { element: '土', familyName: '经典型', familyEn: 'Classic', variants: { soft: '柔软经典型', base: '经典型', intense: '戏剧经典型' } },
  '阳少阴多': { element: '木', familyName: '自然型', familyEn: 'Natural', variants: { soft: '浪漫自然型', base: '自然型', intense: '戏剧自然型' } },
  '阳': { element: '火', familyName: '戏剧型', familyEn: 'Dramatic', variants: { base: '浪漫戏剧型', intense: '戏剧型' } },
}

const BODY_IMAGES: Record<string, string> = {
  'H': '/BodyH.png', 'X': '/BodyX.png', 'A': '/BodyA.png', 'V': '/BodyV.png',
}

// ── 计算函数

// 骨骼线条感（棱角 vs 柔和）：由肩形推出
function calcBoneQuality(shoulderShape: string): 'sharp' | 'soft' {
  return shoulderShape === '圆肩溜肩' ? 'soft' : 'sharp'
}

// 身体线条 bodyLine：由骨骼线条感 × 皮肉质 × 臀/胸突出 × 腰型 综合计算
// 替换原来"二选一"的缺陷算法，四态（straight/curve/soft/mixed）都可达
function calcBodyLine(
  shoulderShape: string, fleshTexture: string,
  hipProtrude: string, chestProtrude: string, waistType: string
): 'straight' | 'curve' | 'soft' | 'mixed' {
  const boneQuality = calcBoneQuality(shoulderShape)
  let curveScore = 0
  if (hipProtrude === '突出') curveScore += 1
  if (chestProtrude === '突出') curveScore += 1
  if (waistType === '细腰明显收') curveScore += 1
  if (fleshTexture === '松软有肉感') curveScore += 1
  if (fleshTexture === '健壮') curveScore -= 1

  if (boneQuality === 'sharp') {
    return curveScore >= 2 ? 'mixed' : 'straight'
  } else {
    return curveScore >= 2 ? 'curve' : 'soft'
  }
}

// 气血态：5 态直选计票，取最高票；打平判定为"阴阳和谐"（居中态）
function calcQiXue(q1: string, q2: string, q3: string, q4: string): string {
  const scores: Record<string, number> = { '阴': 0, '阴多阳少': 0, '阴阳和谐': 0, '阳少阴多': 0, '阳': 0 }
  ;[q1, q2, q3, q4].forEach(v => { if (v && scores[v] !== undefined) scores[v]++ })
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const top = sorted[0][1]
  const tied = sorted.filter(([, v]) => v === top)
  if (tied.length > 1) return '阴阳和谐'
  return sorted[0][0]
}

// 细分型：由骨架大小 + 身体线条的"强度分"决定 soft / base / intense
function calcStyleVariant(qiXueState: string, boneScale: string, bodyLine: string): {
  family: string; familyEn: string; element: string; variant: string
} {
  const info = FAMILY_INFO[qiXueState] || FAMILY_INFO['阴阳和谐']
  const boneScore = boneScale === 'small' ? 0 : boneScale === 'large' ? 2 : 1
  const lineScore = bodyLine === 'soft' ? 0 : bodyLine === 'mixed' ? 2 : 1 // straight/curve = 1
  const total = boneScore + lineScore // 0-4

  let variant: string
  if (info.variants.soft) {
    // 三档家族
    if (total <= 1) variant = info.variants.soft
    else if (total === 2) variant = info.variants.base
    else variant = info.variants.intense
  } else {
    // 两档家族
    variant = total <= 2 ? info.variants.base : info.variants.intense
  }
  return { family: info.familyName, familyEn: info.familyEn, element: info.element, variant }
}

// ── 公共样式
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

// ── 报告组件
function ReportView({ result, onReset, onReturnToStyle }: {
  result: {
    heightRange: string; boneScale: string; shoulderShape: string; waistType: string
    limbLength: string; handFootSize: string; bodyShape: string
    hipProtrude: string; chestProtrude: string; fleshTexture: string
    bodyLine: string; qiXueState: string
    styleFamily: string; styleFamilyEn: string; styleElement: string; styleVariant: string
  }
  onReset: () => void
  onReturnToStyle?: () => void
}) {
  const imgSrc = BODY_IMAGES[result.bodyShape]
  const boneScaleLabel: Record<string, string> = { small: '小骨架', medium: '中等骨架', large: '大骨架' }
  const bodyLineLabel: Record<string, string> = {
    straight: 'Straight · 直线型', curve: 'Curve · 曲线型', soft: 'Soft · 柔和型', mixed: 'Mixed · 混合型',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 标题：13型初步建议 */}
      <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '8px' }}>体型档案 · 13型初步建议</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: C.h1, fontWeight: 400, margin: '0 0 4px' }}>{result.styleVariant}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
          {result.styleFamily} {result.styleFamilyEn} 家族 · 五行属{result.styleElement}
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '10px' }}>
          此结果基于骨架、皮肉与气血态计算，完成面部测试后风格测试将给出最终确认结果
        </p>
      </div>

      {/* 左图右档案 */}
      <div style={{ display: 'grid', gridTemplateColumns: imgSrc ? '180px 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        {imgSrc && <img src={imgSrc} alt={result.bodyShape} style={{ width: '100%', objectFit: 'contain' }} />}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          {/* 骨架档案 */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '14px' }}>骨架档案</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px 16px' }}>
              {[
                ['身高', result.heightRange], ['骨架大小', boneScaleLabel[result.boneScale]], ['肩形', result.shoulderShape],
                ['腰型', result.waistType], ['四肢长度', result.limbLength], ['手脚大小', result.handFootSize],
                ['体型', result.bodyShape],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 2px' }}>{k}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, margin: 0, fontWeight: 500 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 皮肉档案 */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, background: '#fafaf8' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '14px' }}>皮肉档案</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px 16px' }}>
              {[['臀', result.hipProtrude], ['胸', result.chestProtrude], ['皮肉质', result.fleshTexture]].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 2px' }}>{k}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, margin: 0, fontWeight: 500 }}>{v}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `0.5px solid ${C.border}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 2px' }}>身体线条（骨骼线条感 × 皮肉质综合计算）</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: C.gold, margin: 0 }}>{bodyLineLabel[result.bodyLine]}</p>
            </div>
          </div>

          {/* 气血态 */}
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '10px' }}>气血态</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.h1, margin: '0 0 4px' }}>{result.qiXueState}</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: 0 }}>
              对应 {result.styleFamily}（{result.styleFamilyEn}）家族 · 五行属{result.styleElement}
            </p>
          </div>
        </div>
      </div>

      {/* 推荐下一步 */}
      <div style={{ background: '#f7f4ef', padding: '24px', borderRadius: '8px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>推荐下一步</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, marginBottom: '16px' }}>
          体型档案已建立。前往风格测试完成面部测试，系统将结合骨架、皮肉、气血态与面部特征，给出最终 13 型结论。
        </p>
        <Link to="/test/style" style={{
          display: 'inline-block', background: C.gold, color: '#fff', padding: '12px 24px',
          fontFamily: 'Inter, sans-serif', fontSize: '12px', textDecoration: 'none', borderRadius: '4px',
        }}>前往风格测试 →</Link>
      </div>

      {/* 操作按钮 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        <button onClick={onReset} style={btnOutline}>重新测试</button>
        <Link to="/onboarding" style={{ ...btnOutline, textDecoration: 'none', textAlign: 'center' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>返回测试中心</Link>
        <Link to="/profile" style={{ ...btnGold, textDecoration: 'none', textAlign: 'center' as const, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>进入我的档案</Link>
      </div>
      {onReturnToStyle && (
        <button onClick={onReturnToStyle} style={{ ...btnGold, marginTop: '8px' }}>
          ← 返回风格测试（体型结果已保存）
        </button>
      )}
    </div>
  )
}

// ── 主页面
export default function BodyTestPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('method')
  const fromStyle = typeof window !== 'undefined' && localStorage.getItem('aiffd_return_to') === 'style_body'
  const [method, setMethod] = useState<'manual' | 'ai' | ''>('')

  // 测量数据（AI / 手动 共用，用于辅助预填）
  const [bust, setBust] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [conflict, setConflict] = useState('')
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [previewUrl, setPreviewUrl] = useState('')

  // 骨架测试 7 维度
  const [heightRange, setHeightRange] = useState('')
  const [boneScale, setBoneScale] = useState('')
  const [shoulderShape, setShoulderShape] = useState('')
  const [waistType, setWaistType] = useState('')
  const [limbLength, setLimbLength] = useState('')
  const [handFootSize, setHandFootSize] = useState('')
  const [bodyShape, setBodyShape] = useState('') // H/X/A/V
  const [showXTrap, setShowXTrap] = useState(false)

  // 皮肉测试 3 维度
  const [hipProtrude, setHipProtrude] = useState('')
  const [chestProtrude, setChestProtrude] = useState('')
  const [fleshTexture, setFleshTexture] = useState('')

  // 气血态 4 题
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')
  const [q4, setQ4] = useState('')

  // 一屏一题：各环节当前题目索引（骨架 0-6 / 皮肉 0-2 / 气血态 0-3）
  const [skeletonIdx, setSkeletonIdx] = useState(0)
  const [fleshIdx, setFleshIdx] = useState(0)
  const [qixueIdx, setQixueIdx] = useState(0)

  const [result, setResult] = useState<{
    heightRange: string; boneScale: string; shoulderShape: string; waistType: string
    limbLength: string; handFootSize: string; bodyShape: string
    hipProtrude: string; chestProtrude: string; fleshTexture: string
    bodyLine: string; qiXueState: string
    styleFamily: string; styleFamilyEn: string; styleElement: string; styleVariant: string
  } | null>(null)

  const checkConflict = (b: string, w: string, h: string) => {
    const bN = parseFloat(b), wN = parseFloat(w), hN = parseFloat(h)
    if (!bN || !wN || !hN) return
    if ((wN / hN) > 0.9 && (bN - wN) > 25)
      setConflict('腰臀比偏高但胸腰差较大，数据存在轻微冲突，建议重新测量腰围确认。')
    else setConflict('')
  }

  const computeResult = () => {
    const bodyLine = calcBodyLine(shoulderShape, fleshTexture, hipProtrude, chestProtrude, waistType)
    const qiXueState = calcQiXue(q1, q2, q3, q4)
    const styleResult = calcStyleVariant(qiXueState, boneScale, bodyLine)

    const resultData = {
      heightRange, boneScale, shoulderShape, waistType, limbLength, handFootSize, bodyShape,
      hipProtrude, chestProtrude, fleshTexture, bodyLine, qiXueState,
      styleFamily: styleResult.family, styleFamilyEn: styleResult.familyEn,
      styleElement: styleResult.element, styleVariant: styleResult.variant,
    }
    setResult(resultData)

    localStorage.setItem('aiffd_body_result', JSON.stringify({
      heightRange, boneScale, shoulderShape, waistType, limbLength, handFootSize,
      bodyShape, hipProtrude, chestProtrude, fleshTexture, bodyLine, qiXueState,
      styleFamily: styleResult.family, styleVariant: styleResult.variant,
    }))
    setPhase('report')
  }

  const reset = () => {
    setPhase('method'); setMethod(''); setResult(null)
    setBust(''); setWaist(''); setHip(''); setConflict('')
    setAiStatus('idle'); setPreviewUrl('')
    setHeightRange(''); setBoneScale(''); setShoulderShape(''); setWaistType('')
    setLimbLength(''); setHandFootSize(''); setBodyShape(''); setShowXTrap(false)
    setHipProtrude(''); setChestProtrude(''); setFleshTexture('')
    setQ1(''); setQ2(''); setQ3(''); setQ4('')
    setSkeletonIdx(0); setFleshIdx(0); setQixueIdx(0)
  }

  // 骨架(7) + 皮肉(3) + 气血态(4) = 14 题，跨环节统一计数，方便一屏一题的进度展示
  const TOTAL_QUESTIONS = 14
  const currentQuestionNumber =
    phase === 'skeleton' ? skeletonIdx + 1 :
    phase === 'flesh' ? 7 + fleshIdx + 1 :
    phase === 'qixue' ? 7 + 3 + qixueIdx + 1 : 0

  // 选完一题后延迟自动跳下一题，让用户先看到选中态再切换
  const AUTO_ADVANCE_DELAY = 260
  const goNextSkeleton = () => {
    if (skeletonIdx < 6) setSkeletonIdx(skeletonIdx + 1)
    else { setPhase('flesh'); setFleshIdx(0) }
  }
  const goBackSkeleton = () => {
    if (skeletonIdx > 0) setSkeletonIdx(skeletonIdx - 1)
    else setPhase('data')
  }
  const goNextFlesh = () => {
    if (fleshIdx < 2) setFleshIdx(fleshIdx + 1)
    else { setPhase('qixue'); setQixueIdx(0) }
  }
  const goBackFlesh = () => {
    if (fleshIdx > 0) setFleshIdx(fleshIdx - 1)
    else { setPhase('skeleton'); setSkeletonIdx(6) }
  }
  const goNextQixue = () => {
    if (qixueIdx < 3) setQixueIdx(qixueIdx + 1)
    else computeResult()
  }
  const goBackQixue = () => {
    if (qixueIdx > 0) setQixueIdx(qixueIdx - 1)
    else { setPhase('flesh'); setFleshIdx(2) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 32px 80px' }}>

        {phase === 'data' && <ProgressBar current={1} total={4} label="BODY TEST" />}
        {(phase === 'skeleton' || phase === 'flesh' || phase === 'qixue') && (
          <ProgressBar current={currentQuestionNumber} total={TOTAL_QUESTIONS} label="BODY TEST" />
        )}

        {/* ── Step 0: 选择测量方式 ── */}
        {phase === 'method' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>体型测试</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: C.h1, fontWeight: 400, lineHeight: 1.2, margin: '0 0 16px' }}>
                了解你的<br />体型底色
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.8, margin: 0 }}>
                通过骨架、皮肉和气血态三个维度，建立专属体型档案。
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <OptionCard label="AI 拍照识别" sub="上传正面照片，AI 自动预填骨架与皮肉判断，可手动修正" active={method === 'ai'} onClick={() => setMethod('ai')} />
              <OptionCard label="手动填写数据" sub="输入胸围、腰围、臀围，辅助后续骨架与皮肉判断" active={method === 'manual'} onClick={() => setMethod('manual')} />
            </div>
            <button onClick={() => setPhase('data')} disabled={!method}
              style={method ? btnGold : { ...btnGold, background: '#e0e0e0', cursor: 'not-allowed' }}>
              开始测试
            </button>
          </div>
        )}

        {/* ── Step 1: 数据收集（AI）── */}
        {phase === 'data' && method === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>上传正面照片</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, lineHeight: 1.8, margin: 0 }}>
              穿贴身衣物或紧身裤，正面站立，双臂自然垂下。光线均匀效果最佳。
            </p>
            <div style={{ border: `2px dashed ${C.border}`, borderRadius: '8px', padding: '40px', textAlign: 'center', cursor: 'pointer', background: '#fff' }}
              onClick={() => document.getElementById('photo-input')?.click()}>
              {previewUrl ? (
                <img src={previewUrl} alt="预览" style={{ maxHeight: '300px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>点击上传照片</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.border }}>支持 JPG / PNG</p>
                </>
              )}
              <input id="photo-input" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const file = e.target.files?.[0]; if (file) setPreviewUrl(URL.createObjectURL(file)) }} />
            </div>
            {previewUrl && aiStatus === 'idle' && (
              <button onClick={() => {
                setAiStatus('analyzing')
                setTimeout(() => {
                  setAiStatus('done')
                  setHeightRange('160-170cm'); setBoneScale('medium'); setShoulderShape('圆肩溜肩')
                  setWaistType('腰适中'); setLimbLength('适中'); setHandFootSize('适中'); setBodyShape('H')
                  setHipProtrude('扁平'); setChestProtrude('扁平'); setFleshTexture('紧实有肌肉感')
                }, 2000)
              }} style={btnGold}>AI 识别体型</button>
            )}
            {aiStatus === 'analyzing' && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.gold, textAlign: 'center' }}>正在分析中…</p>
            )}
            {aiStatus === 'done' && (
              <div style={{ background: '#fdf8ee', border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '20px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>AI 已预填骨架与皮肉判断</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>接下来的骨架测试、皮肉测试步骤中，你可以确认或手动修正每一项</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPhase('method')} style={btnOutline}>← 返回</button>
              <button onClick={() => setPhase('skeleton')} disabled={aiStatus !== 'done'}
                style={aiStatus === 'done' ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>继续</button>
            </div>
          </div>
        )}

        {/* ── Step 1: 数据收集（手动）── */}
        {phase === 'data' && method === 'manual' && (() => {
          const bustN = parseFloat(bust) || 0
          const waistN = parseFloat(waist) || 0
          const hipN = parseFloat(hip) || 0
          const hasBasic = bustN > 0 && waistN > 0 && hipN > 0

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>体型计算器</p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>输入你的围度数据</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>
                  用软尺紧贴皮肤测量，站立自然呼吸状态，单位：cm。这组数据将用于辅助后续骨架与皮肉判断的默认建议。
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                {[
                  { label: '胸围 *', value: bust, set: setBust, key: '胸围' },
                  { label: '腰围 *', value: waist, set: setWaist, key: '腰围' },
                  { label: '臀围 *', value: hip, set: setHip, key: '臀围' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: f.value ? C.gold : C.h2, fontWeight: f.value ? 500 : 400 }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input type="number" value={f.value} placeholder="0"
                        onChange={e => {
                          f.set(e.target.value)
                          if (f.key === '胸围') checkConflict(e.target.value, waist, hip)
                          if (f.key === '腰围') checkConflict(bust, e.target.value, hip)
                          if (f.key === '臀围') checkConflict(bust, waist, e.target.value)
                        }}
                        style={{
                          width: '100%', padding: '12px 36px 12px 14px',
                          border: `1px solid ${f.value ? C.gold : C.border}`,
                          borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '16px',
                          fontWeight: 500, color: C.h2, background: f.value ? '#fdfbf5' : '#fff',
                          boxSizing: 'border-box' as const, outline: 'none',
                        }} />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>cm</span>
                    </div>
                  </div>
                ))}
              </div>

              {conflict && (
                <div style={{ background: '#fef8f8', border: '1px solid #f5c6c6', borderRadius: '6px', padding: '12px 16px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#c0392b', margin: 0 }}>⚠ {conflict}</p>
                </div>
              )}

              {/* 测量提示 */}
              <details style={{ background: '#f7f4ef', borderRadius: '8px', padding: '14px 16px', cursor: 'pointer' }}>
                <summary style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.gold, listStyle: 'none' }}>
                  不知道怎么测量？点击查看说明
                </summary>
                <div style={{ marginTop: '14px' }}>
                  <img
                    src="/measure-guide.png"
                    alt="身体尺寸测量方法：胸围、腰围、臀围、肩宽测量示意图"
                    style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px', border: `1px solid ${C.border}` }}
                  />
                </div>
              </details>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setPhase('method')} style={btnOutline}>← 返回</button>
                <button onClick={() => {
                  // 用三围数据给骨架/皮肉步骤一个合理的默认建议，用户在下一步仍可修改
                  if (hasBasic) {
                    const whr = waistN / hipN
                    const bustWaistDiff = bustN - waistN
                    if (!bodyShape) setBodyShape(whr > 0.88 ? 'H' : bustN - hipN > 3 ? 'V' : hipN - bustN > 5 ? 'A' : 'X')
                    if (!hipProtrude) setHipProtrude(hipN - bustN > 5 ? '突出' : '扁平')
                    if (!chestProtrude) setChestProtrude(bustN - hipN > 3 ? '突出' : '扁平')
                    if (!fleshTexture) setFleshTexture(bustWaistDiff > 20 ? '松软有肉感' : '紧实有肌肉感')
                  }
                  setPhase('skeleton')
                }}
                  disabled={!bust || !waist || !hip}
                  style={bust && waist && hip ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                  继续
                </button>
              </div>
            </div>
          )
        })()}

        {/* ── Step 2: 骨架测试（7题）── */}
        {phase === 'skeleton' && (() => {
          const questions = [
            { title: '你的身高区间？', value: heightRange, set: setHeightRange, options: [
              { id: '160以下', label: '160cm 以下' },
              { id: '160-165', label: '160cm - 165cm' },
              { id: '165-170', label: '165cm - 170cm' },
              { id: '170以上', label: '170cm 以上' },
            ]},
            { title: '你的骨架大小？', value: boneScale, set: setBoneScale, options: [
              { id: 'small', label: '小骨架', sub: '手腕、脚踝纤细，整体精致小巧' },
              { id: 'medium', label: '中等骨架', sub: '不大不小，比例均衡' },
              { id: 'large', label: '大骨架', sub: '手腕、肩部宽阔，存在感强、气场大' },
            ]},
            { title: '你的肩形更接近哪种？', value: shoulderShape, set: setShoulderShape, options: [
              { id: '圆肩溜肩', label: '圆肩 / 溜肩', sub: '肩线圆润，带一点点溜肩' },
              { id: '方肩平肩', label: '方肩 / 平肩', sub: '肩线平直，棱角分明' },
              { id: '宽厚肩', label: '宽厚肩', sub: '肩宽且厚，结构感强' },
            ]},
            { title: '你的腰型更接近哪种？', value: waistType, set: setWaistType, options: [
              { id: '细腰明显收', label: '细腰，明显收细' },
              { id: '腰适中', label: '腰适中，不明显收细也不宽' },
              { id: '腰宽或偏直筒', label: '腰宽或偏直筒' },
            ]},
            { title: '你的四肢长度？', value: limbLength, set: setLimbLength, options: [
              { id: '偏短', label: '偏短' }, { id: '适中', label: '适中' }, { id: '偏长', label: '偏长' },
            ]},
            { title: '你的手脚大小？', value: handFootSize, set: setHandFootSize, options: [
              { id: '娇小', label: '娇小' }, { id: '适中', label: '适中' }, { id: '偏大', label: '偏大' },
            ]},
          ]

          const isBodyShapeQ = skeletonIdx === 6

          const selectAndAdvance = (set: (v: string) => void, val: string) => {
            set(val)
            setTimeout(goNextSkeleton, AUTO_ADVANCE_DELAY)
          }

          const selectBodyShape = (val: string) => {
            setBodyShape(val)
            if (val === 'X') { setShowXTrap(true) }
            else { setShowXTrap(false); setTimeout(goNextSkeleton, AUTO_ADVANCE_DELAY) }
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>
                  STEP 01 · 骨架测试 · {skeletonIdx + 1} / 7
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>
                  {isBodyShapeQ ? '你的体型（骨骼轮廓）更接近哪种？' : questions[skeletonIdx].title}
                </h2>
              </div>

              {!isBodyShapeQ && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {questions[skeletonIdx].options.map(o => (
                    <OptionCard key={o.id} label={o.label} sub={(o as { sub?: string }).sub}
                      active={questions[skeletonIdx].value === o.id}
                      onClick={() => selectAndAdvance(questions[skeletonIdx].set, o.id)} />
                  ))}
                </div>
              )}

              {isBodyShapeQ && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <OptionCard label="H 型" sub="肩宽≈髋宽，腰部不明显，整体较方正" active={bodyShape === 'H'} onClick={() => selectBodyShape('H')} />
                    <OptionCard label="X 型" sub="肩宽≈髋宽，腰部明显收细，沙漏型轮廓" active={bodyShape === 'X'} onClick={() => selectBodyShape('X')} />
                    <OptionCard label="A 型" sub="肩窄髋宽，重心偏下，梨形轮廓" active={bodyShape === 'A'} onClick={() => selectBodyShape('A')} />
                    <OptionCard label="V 型" sub="肩宽髋窄，倒三角轮廓，上半身较壮" active={bodyShape === 'V'} onClick={() => selectBodyShape('V')} />
                  </div>
                  {showXTrap && (
                    <div style={{ background: '#fdf8ee', border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '16px 20px', marginTop: '16px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px', marginBottom: '8px' }}>X 型陷阱检测</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, margin: '0 0 16px' }}>
                        很多「X型」其实是H型骨骼+内衣塑型/脂肪转移的假象。<br />
                        <strong>验证方法：</strong>用手摸肋骨最下端角度——<br />
                        · 角度 &gt; 90°（向外张开）→ H型骨架<br />
                        · 角度 &lt; 90°（向内收）→ 真X型
                      </p>
                      <button onClick={goNextSkeleton} style={btnGold}>我已确认，继续</button>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={goBackSkeleton} style={btnOutline}>← 返回</button>
              </div>
            </div>
          )
        })()}

        {/* ── Step 3: 皮肉测试（3题）── */}
        {phase === 'flesh' && (() => {
          const questions = [
            { title: '你的臀部更接近哪种？', value: hipProtrude, set: setHipProtrude, options: [
              { id: '突出', label: '突出', sub: '臀部丰满，有明显弧度' },
              { id: '扁平', label: '扁平', sub: '臀部平坦，弧度不明显' },
            ]},
            { title: '你的胸部更接近哪种？', value: chestProtrude, set: setChestProtrude, options: [
              { id: '突出', label: '突出', sub: '胸部丰满，有明显弧度' },
              { id: '扁平', label: '扁平', sub: '胸部平坦，弧度不明显' },
            ]},
            { title: '你的皮肉质地更接近哪种？', value: fleshTexture, set: setFleshTexture, options: [
              { id: '松软有肉感', label: '松软有肉感', sub: '触感柔软，有肉感' },
              { id: '紧实有肌肉感', label: '紧实有肌肉感', sub: '触感紧致，线条清楚' },
              { id: '健壮', label: '健壮', sub: '骨肉结实，力量感强' },
            ]},
          ]
          const current = questions[fleshIdx]

          const selectAndAdvance = (set: (v: string) => void, val: string) => {
            set(val)
            setTimeout(goNextFlesh, AUTO_ADVANCE_DELAY)
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>
                  STEP 02 · 皮肉测试 · {fleshIdx + 1} / 3
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>{current.title}</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {current.options.map(o => (
                  <OptionCard key={o.id} label={o.label} sub={o.sub} active={current.value === o.id}
                    onClick={() => selectAndAdvance(current.set, o.id)} />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={goBackFlesh} style={btnOutline}>← 返回</button>
              </div>
            </div>
          )
        })()}

        {/* ── Step 4: 气血态（4题，5态直选）── */}
        {phase === 'qixue' && (() => {
          const titles = [
            '你的气质第一印象更接近？',
            '你的皮肉 / 身形给人的感觉更接近？',
            '你的面部线条更接近？',
            '别人对你整体气场的评价更接近？',
          ]
          const values = [q1, q2, q3, q4]
          const setters = [setQ1, setQ2, setQ3, setQ4]
          const idx = qixueIdx
          const options = [
            { id: '阴', text: idx === 0 ? '温婉柔美，让人想亲近' : idx === 1 ? '柔软丰盈，曲线感强' : idx === 2 ? '圆润饱满，五官柔和' : '性感、有女人味' },
            { id: '阴多阳少', text: idx === 0 ? '清新灵动，元气感强' : idx === 1 ? '紧致小巧，灵巧轻盈' : idx === 2 ? '小巧精致，略带俏皮' : '可爱、少女感' },
            { id: '阴阳和谐', text: idx === 0 ? '优雅得体，落落大方' : idx === 1 ? '匀称适中，不软不硬' : idx === 2 ? '端正对称，比例均衡' : '优雅、精致' },
            { id: '阳少阴多', text: idx === 0 ? '自然松弛，随性洒脱' : idx === 1 ? '自然松弛，不刻意雕琢' : idx === 2 ? '舒展自然，不做作' : '随性、休闲' },
            { id: '阳', text: idx === 0 ? '干练飒爽，气场强烈' : idx === 1 ? '紧实健硕，线条分明' : idx === 2 ? '棱角分明，五官立体锐利' : '帅气、有力量感' },
          ]

          const selectAndAdvance = (val: string) => {
            setters[idx](val)
            setTimeout(goNextQixue, AUTO_ADVANCE_DELAY)
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>
                  STEP 03 · 气血态 · {idx + 1} / 4
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>{titles[idx]}</h2>
                {idx === 0 && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginTop: '8px' }}>
                    气血态决定你的 13 型所属大类家族（浪漫 / 少年 / 经典 / 自然 / 戏剧）
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {options.map(o => (
                  <button key={o.id} onClick={() => selectAndAdvance(o.id)} style={{
                    border: `1px solid ${values[idx] === o.id ? C.gold : C.border}`,
                    background: values[idx] === o.id ? '#fdf8ee' : '#fff',
                    padding: '14px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: '6px',
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: values[idx] === o.id ? C.h2 : C.body }}>{o.text}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={goBackQixue} style={btnOutline}>← 返回</button>
              </div>
            </div>
          )
        })()}

        {/* ── 报告页 ── */}
        {phase === 'report' && result && (
          <ReportView result={result} onReset={reset} onReturnToStyle={fromStyle ? () => navigate('/test/style') : undefined} />
        )}

      </div>
    </div>
  )
}
