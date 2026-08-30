import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

// ── 流程
// AI 路径:    method → data(AI拍照) → sheldon(AI预填) → bone → fat → qi → report
// 手动路径:   method → data(三围输入) → sheldon → bone → fat → qi → report
type Phase = 'method' | 'data' | 'sheldon' | 'boneScale' | 'bone' | 'shoulder' | 'fat' | 'qi' | 'report'

// ── 体型数据库
const YIN_YANG_DESC: Record<string, { label: string; desc: string; style: string }> = {
  '少阳': { label: '轻盈活力型', desc: '气血流动活跃，皮肤较薄，体型偏线条感，代谢较快。', style: '适合轻盈、流动、有活力的穿搭风格，避免过于厚重的廓形。' },
  '太阳': { label: '饱满热情型', desc: '气血充盈，皮肤饱满，体型圆润有弧度，存在感强。', style: '适合结构感强、有支撑力的廓形，能承托饱满气场。' },
  '少阴': { label: '细腻内敛型', desc: '气血偏内收，皮肤细腻，体型偏瘦削，气质内敛。', style: '适合柔软、贴身、有质感的面料，强调精致细节。' },
  '太阴': { label: '沉稳厚重型', desc: '气血偏沉，皮肤较厚，体型偏实，稳重有分量感。', style: '适合有结构的廓形和沉稳色调，避免过于飘逸的面料。' },
}

const BODY_IMAGES: Record<string, string> = {
  'H': '/BodyH.png', 'X': '/BodX.png', 'A': '/BodyA.png', 'V': '/BodyV.png',
  'H-O': '/BodyO.png', 'X-O': '/BodyO.png', 'A-O': '/BodyO.png', 'V-O': '/BodyO.png',
  'H-S': '/BodS.png', 'X-S': '/BodS.png',
}

// ── 计算函数
function calcFatCode(whr: number, bustWaistDiff: number, visual: string, boneCode: string): string {
  if (visual === 'O' || whr > 0.85) return 'O'
  if (visual === 'S' || (bustWaistDiff > 25 && (boneCode === 'H' || boneCode === 'A'))) return 'S'
  return '无'
}

function calcYinYang(q1: string, q2: string, q3: string, q4: string): string {
  const scores: Record<string, number> = { '少阳': 0, '太阳': 0, '少阴': 0, '太阴': 0 }
  const map: Record<string, Record<string, string>> = {
    q1: { A: '少阳', B: '太阳', C: '少阴', D: '太阴' },
    q2: { A: '少阳', B: '太阳', C: '少阴', D: '太阴' },
    q3: { A: '少阴', B: '少阳', C: '太阴', D: '太阳' },
    q4: { A: '太阳', B: '少阳', C: '少阴', D: '太阴' },
  }
  ;[['q1', q1], ['q2', q2], ['q3', q3], ['q4', q4]].forEach(([k, v]) => {
    const t = map[k]?.[v]; if (t) scores[t]++
  })
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
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
  result: { boneCode: string; fatCode: string; compositeCode: string; compositeName: string; sheldonMap: string; yinYang: string }
  onReset: () => void
  onReturnToStyle?: () => void
}) {
  const imgSrc = BODY_IMAGES[result.compositeCode] || BODY_IMAGES[result.boneCode]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 标题 */}
      <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '8px' }}>体型档案</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: C.h1, fontWeight: 400, margin: '0 0 4px' }}>{result.compositeName}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>{result.compositeCode} · {result.sheldonMap}</p>
      </div>

      {/* 左图右档案 */}
      <div style={{ display: 'grid', gridTemplateColumns: imgSrc ? '180px 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        {imgSrc && (
          <img src={imgSrc} alt={result.compositeName} style={{ width: '100%', objectFit: 'contain' }} />
        )}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '16px' }}>三层档案</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              {[
                { label: '骨骼代码', value: result.boneCode, sub: '骨架结构' },
                { label: '脂肪代码', value: result.fatCode, sub: '脂肪分布' },
                { label: '气血态', value: result.yinYang, sub: YIN_YANG_DESC[result.yinYang]?.label },
              ].map(item => (
                <div key={item.label}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.gold, margin: '0 0 2px' }}>{item.value}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: 0 }}>{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 气血态解读 */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}`, background: '#fafaf8' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '10px' }}>气血态解读</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.8, marginBottom: '6px' }}>
              {YIN_YANG_DESC[result.yinYang]?.desc}
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, lineHeight: 1.8, margin: 0 }}>
              {YIN_YANG_DESC[result.yinYang]?.style}
            </p>
          </div>

          {/* 穿搭策略 */}
          <div style={{ padding: '20px 24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '16px' }}>穿搭策略</p>
            {[
              { label: '骨骼策略', text: `针对 ${result.boneCode} 型骨架的廓形选择、肩线处理和腰节强调方式。` },
              { label: '脂肪策略', text: `针对 ${result.fatCode} 型脂肪分布的面料选择、图案偏好和视觉修饰方向。` },
              { label: '气质策略', text: `基于 ${result.yinYang} 气血态的色彩能量、配饰风格和整体气场营造。` },
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                marginBottom: i < arr.length - 1 ? '14px' : 0,
                paddingBottom: i < arr.length - 1 ? '14px' : 0,
                borderBottom: i < arr.length - 1 ? `0.5px solid ${C.border}` : 'none',
              }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px', color: C.muted, marginBottom: '4px' }}>{s.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 推荐下一步 */}
      <div style={{ background: '#f7f4ef', padding: '24px', borderRadius: '8px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>推荐下一步</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, marginBottom: '16px' }}>
          体型档案已建立。加入色彩测试后，系统将为你生成「体型 × 色彩」组合分析，结论更精准。
        </p>
        <Link to="/test/color" style={{
          display: 'inline-block', background: C.gold, color: '#fff', padding: '12px 24px',
          fontFamily: 'Inter, sans-serif', fontSize: '12px', textDecoration: 'none', borderRadius: '4px',
        }}>开始色彩测试 →</Link>
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

  // 检查是否需要完成后跳回风格测试
  const fromStyle = typeof window !== 'undefined' && localStorage.getItem('aiffd_return_to') === 'style_body'
  const [method, setMethod] = useState<'manual' | 'ai' | ''>('')

  // 测量数据
  const [bust, setBust] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [shoulder, setShoulder] = useState('')
  const [hipBone, setHipBone] = useState('')
  const [conflict, setConflict] = useState('')
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [previewUrl, setPreviewUrl] = useState('')
  const [aiResult, setAiResult] = useState<{ sheldon: string; bone: string; fat: string } | null>(null)

  // 确认层
  const [sheldon, setSheldon] = useState('')
  const [boneShape, setBoneShape] = useState('')
  const [boneScaleVal, setBoneScaleVal] = useState('')
  const [shoulderType, setShoulderType] = useState('')
  const [showXTrap, setShowXTrap] = useState(false)
  const [visual, setVisual] = useState('')

  // 气血态
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')
  const [q4, setQ4] = useState('')

  // 报告
  const [result, setResult] = useState<{
    boneCode: string; fatCode: string; compositeCode: string;
    compositeName: string; sheldonMap: string; yinYang: string;
  } | null>(null)

  const checkConflict = (b: string, w: string, h: string) => {
    const bN = parseFloat(b), wN = parseFloat(w), hN = parseFloat(h)
    if (!bN || !wN || !hN) return
    if ((wN / hN) > 0.9 && (bN - wN) > 25)
      setConflict('腰臀比偏高但胸腰差较大，数据存在轻微冲突，建议重新测量腰围确认。')
    else setConflict('')
  }

  const computeResult = () => {
    const bustN = parseFloat(bust) || 88
    const waistN = parseFloat(waist) || 68
    const hipN = parseFloat(hip) || 94
    const whr = waistN / hipN
    const bustWaistDiff = bustN - waistN
    const boneCode = boneShape
    const fatCode = calcFatCode(whr, bustWaistDiff, visual, boneCode)
    const compositeCode = fatCode === '无' ? boneCode : `${boneCode}-${fatCode}`
    const NAMES: Record<string, string> = {
      'H': 'H型', 'X': 'X型', 'A': 'A型', 'V': 'V型',
      'H-O': '苹果H型', 'X-O': '苹果X型', 'A-O': '梨形A型', 'V-O': '苹果V型',
      'H-S': '沙漏H型', 'X-S': '沙漏X型',
    }
    const SHELDON_MAP: Record<string, string> = {
      '外胚层': 'Ectomorph · 线条感强', '中胚层': 'Mesomorph · 骨骼立体', '内胚层': 'Endomorph · 圆润饱满',
    }
    const yinYang = calcYinYang(q1, q2, q3, q4)
    const resultData = {
      boneCode, fatCode: fatCode === '无' ? '—' : fatCode,
      compositeCode, compositeName: NAMES[compositeCode] || compositeCode,
      sheldonMap: SHELDON_MAP[sheldon] || sheldon, yinYang,
    }
    setResult(resultData)
    // 保存体型结果到 localStorage
    localStorage.setItem('aiffd_body_result', JSON.stringify({
      bodyShape: boneCode,
      bodyLine: fatCode === '—' ? 'straight' : 'curve',
      boneScale: sheldon === '外胚层' ? 'small' : sheldon === '内胚层' ? 'large' : 'medium',
    }))
    setPhase('report')
  }

  const reset = () => {
    setPhase('method'); setMethod(''); setResult(null)
    setBust(''); setWaist(''); setHip(''); setShoulder(''); setHipBone('')
    setConflict(''); setAiStatus('idle'); setPreviewUrl(''); setAiResult(null)
    setSheldon(''); setBoneShape(''); setShowXTrap(false); setVisual('')
    setQ1(''); setQ2(''); setQ3(''); setQ4('')
  }

  const phaseStep: Record<Phase, number> = {
    method: 0, data: 1, sheldon: 2, boneScale: 3, bone: 4, shoulder: 5, fat: 6, qi: 7, report: 8,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 32px 80px' }}>

        {phase !== 'method' && phase !== 'report' && (
          <ProgressBar current={phaseStep[phase]} total={5} label="BODY TEST" />
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
                通过骨骼轮廓、脂肪分布和气血态三个维度，建立专属体型档案。
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <OptionCard
                label="AI 拍照识别"
                sub="上传正面照片，AI 自动判断体型并给出建议，可手动修正"
                active={method === 'ai'}
                onClick={() => setMethod('ai')}
              />
              <OptionCard
                label="手动填写数据"
                sub="输入胸围、腰围、臀围等数据，精准计算体型代码"
                active={method === 'manual'}
                onClick={() => setMethod('manual')}
              />
            </div>
            <button
              onClick={() => setPhase('data')}
              disabled={!method}
              style={method ? btnGold : { ...btnGold, background: '#e0e0e0', cursor: 'not-allowed' }}
            >
              开始测试
            </button>
          </div>
        )}

        {/* ── Step 1: 数据收集 ── */}
        {phase === 'data' && method === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>上传正面照片</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, lineHeight: 1.8, margin: 0 }}>
              穿贴身衣物或紧身裤，正面站立，双臂自然垂下。光线均匀效果最佳。
            </p>
            <div style={{
              border: `2px dashed ${C.border}`, borderRadius: '8px', padding: '40px',
              textAlign: 'center', cursor: 'pointer', background: '#fff',
            }}
              onClick={() => document.getElementById('photo-input')?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="预览" style={{ maxHeight: '300px', maxWidth: '100%', objectFit: 'contain' }} />
              ) : (
                <>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>点击上传照片</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.border }}>支持 JPG / PNG</p>
                </>
              )}
              <input id="photo-input" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) setPreviewUrl(URL.createObjectURL(file))
                }}
              />
            </div>
            {previewUrl && aiStatus === 'idle' && (
              <button onClick={() => {
                setAiStatus('analyzing')
                setTimeout(() => {
                  setAiResult({ sheldon: '中胚层', bone: 'H', fat: '无' })
                  setAiStatus('done')
                  setSheldon('中胚层'); setBoneShape('H'); setVisual('无')
                }, 2000)
              }} style={btnGold}>AI 识别体型</button>
            )}
            {aiStatus === 'analyzing' && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.gold, textAlign: 'center' }}>正在分析中…</p>
            )}
            {aiStatus === 'done' && aiResult && (
              <div style={{ background: '#fdf8ee', border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '20px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>AI 识别结果</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.h2, margin: 0 }}>
                  体质类型：{aiResult.sheldon}　骨骼轮廓：{aiResult.bone} 型　脂肪分布：{aiResult.fat === '无' ? '均匀' : aiResult.fat}
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginTop: '8px', marginBottom: 0 }}>
                  以下步骤中你可以确认或手动修正
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPhase('method')} style={btnOutline}>← 返回</button>
              <button
                onClick={() => setPhase('sheldon')}
                disabled={aiStatus !== 'done'}
                style={aiStatus === 'done' ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}
              >继续</button>
            </div>
          </div>
        )}

        {phase === 'data' && method === 'manual' && (() => {
          // 实时计算体型
          const bustN = parseFloat(bust) || 0
          const waistN = parseFloat(waist) || 0
          const hipN = parseFloat(hip) || 0
          const hasBasic = bustN > 0 && waistN > 0 && hipN > 0

          // 实时推算体型代码
          let liveShape = ''
          if (hasBasic) {
            const bustHipDiff = bustN - hipN
            const waistHipRatio = waistN / hipN
            if (waistHipRatio > 0.88) liveShape = 'H'
            else if (bustHipDiff > 3) liveShape = 'V'
            else if (hipN - bustN > 5) liveShape = 'A'
            else liveShape = 'X'
          }

          const shapeDesc: Record<string, string> = {
            H: 'H型 · 肩臀等宽，腰线不明显，整体方正感',
            X: 'X型 · 肩臀相近，腰部明显收细，沙漏轮廓',
            A: 'A型 · 臀宽大于肩宽，重心偏下，梨形',
            V: 'V型 · 肩宽大于臀宽，倒三角轮廓',
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>体型计算器</p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>输入你的围度数据</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>
                  用软尺紧贴皮肤测量，站立自然呼吸状态，单位：cm
                </p>
              </div>

              {/* 实时结果显示 */}
              <div style={{
                background: hasBasic ? '#fdf8ee' : '#f5f5f3',
                border: `1px solid ${hasBasic ? C.gold : C.border}`,
                borderRadius: '10px', padding: '20px',
                transition: 'all 0.3s',
              }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '10px' }}>
                  实时计算结果
                </p>
                {hasBasic ? (
                  <div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '42px', color: C.gold, margin: '0 0 8px', letterSpacing: '4px' }}>
                      {liveShape}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: 0 }}>
                      {shapeDesc[liveShape]}
                    </p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {[
                        { label: '腰臀比', value: hipN > 0 ? (waistN / hipN).toFixed(2) : '—' },
                        { label: '胸腰差', value: bustN > 0 ? `${(bustN - waistN).toFixed(1)} cm` : '—' },
                        { label: '胸臀差', value: hipN > 0 ? `${(bustN - hipN).toFixed(1)} cm` : '—' },
                      ].map(s => (
                        <div key={s.label}>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, marginBottom: '2px' }}>{s.label}</p>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.h2, margin: 0, fontWeight: 500 }}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
                    输入胸围、腰围、臀围后自动计算
                  </p>
                )}
              </div>

              {/* 输入字段 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: '胸围 *', hint: '胸部最丰满处', value: bust, set: setBust, key: '胸围' },
                  { label: '腰围 *', hint: '腰部最细处', value: waist, set: setWaist, key: '腰围' },
                  { label: '臀围 *', hint: '臀部最丰满处', value: hip, set: setHip, key: '臀围' },
                  { label: '肩宽', hint: '两肩峰距离（选填）', value: shoulder, set: setShoulder, key: '肩宽' },
                  { label: '髋骨宽', hint: '两髋骨最宽处（选填）', value: hipBone, set: setHipBone, key: '髋骨宽' },
                ].map(f => (
                  <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: f.value ? C.gold : C.h2, fontWeight: f.value ? 500 : 400 }}>
                        {f.label}
                      </label>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{f.hint}</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number" value={f.value} placeholder="0"
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
                          fontWeight: 500, color: C.h2,
                          background: f.value ? '#fdfbf5' : '#fff',
                          boxSizing: 'border-box' as const,
                          transition: 'all 0.2s',
                          outline: 'none',
                        }}
                      />
                      <span style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted,
                      }}>cm</span>
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
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    ['胸围', '穿无衬垫内衣，软尺经过胸部最高点水平绕一圈'],
                    ['腰围', '自然站立，软尺在肋骨最下端和髋骨最上端中间绕一圈'],
                    ['臀围', '软尺经过臀部最丰满处水平绕一圈'],
                    ['肩宽', '从左肩峰到右肩峰的直线距离'],
                  ].map(([k, v]) => (
                    <p key={k} style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.body, margin: 0, lineHeight: 1.7 }}>
                      <strong style={{ color: C.gold }}>{k}：</strong>{v}
                    </p>
                  ))}
                </div>
              </details>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setPhase('method')} style={btnOutline}>← 返回</button>
                <button
                  onClick={() => setPhase('sheldon')}
                  disabled={!bust || !waist || !hip}
                  style={bust && waist && hip ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}
                >
                  {hasBasic ? `确认 ${liveShape} 型，继续` : '继续'}
                </button>
              </div>
            </div>
          )
        })()}

        {/* ── Step 2: 谢尔顿三型 ── */}
        {phase === 'sheldon' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>STEP 01 · 体质类型</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>
                你的体质类型更接近哪种？
              </h2>
              {method === 'ai' && aiResult && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, marginTop: '8px' }}>
                  AI 建议：{aiResult.sheldon}（可手动修改）
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <OptionCard label="外胚层 Ectomorph" sub="骨架纤细，四肢偏长，肌肉不易堆积，天生线条感强" active={sheldon === '外胚层'} onClick={() => setSheldon('外胚层')} />
              <OptionCard label="中胚层 Mesomorph" sub="骨架适中，肌肉线条明显，体型匀称，容易塑形" active={sheldon === '中胚层'} onClick={() => setSheldon('中胚层')} />
              <OptionCard label="内胚层 Endomorph" sub="骨架较宽，脂肪容易堆积，体型圆润，曲线丰满" active={sheldon === '内胚层'} onClick={() => setSheldon('内胚层')} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPhase('data')} style={btnOutline}>← 返回</button>
              <button onClick={() => setPhase('boneScale')} disabled={!sheldon}
                style={sheldon ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                继续
              </button>
            </div>
          </div>
        )}


        {/* ── Q2: 骨架大小 ── */}
        {phase === 'boneScale' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>STEP 02 · 骨架大小</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>你的骨架大小更接近哪种？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>观察手腕、脚踝及关节骨量</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { id: 'small', img: '/bone_small.png', label: '小骨架', desc: '手腕、脚踝及关节骨量较小，整体骨架精巧。' },
                { id: 'medium', img: '/bone_medium.png', label: '中等骨架', desc: '手腕、脚踝及关节骨量适中，整体骨架均衡。' },
                { id: 'large', img: '/bone_large.png', label: '大骨架', desc: '手腕、脚踝及关节骨量较明显，整体骨架存在感较强。' },
              ].map((o, i) => {
                const active = boneScaleVal === o.id
                return (
                  <button key={o.id} onClick={() => setBoneScaleVal(o.id)} style={{
                    border: `1.5px solid ${active ? C.gold : C.border}`,
                    borderRadius: '10px', background: active ? '#fdf8ee' : '#fff',
                    padding: 0, cursor: 'pointer', overflow: 'hidden',
                    transition: 'all 0.2s', textAlign: 'left' as const,
                  }}>
                    {/* ABC 标签 + 大标题 */}
                    <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: active ? C.gold : '#e8e8e4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                          {['A','B','C'][i]}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: active ? C.gold : C.h2, fontWeight: 400, margin: 0 }}>{o.label}</p>
                    </div>
                    {/* 描述文字 */}
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, lineHeight: 1.7, padding: '8px 16px 12px', margin: 0 }}>{o.desc}</p>
                    {/* 插图 */}
                    <img src={o.img} alt={o.label} style={{ width: '100%', display: 'block', objectFit: 'contain', background: '#f7f4ef' }} />
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPhase('sheldon')} style={btnOutline}>← 返回</button>
              <button onClick={() => setPhase('bone')} disabled={!boneScaleVal}
                style={boneScaleVal ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                继续
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: 骨骼轮廓 ── */}
        {phase === 'bone' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>STEP 02 · 骨骼轮廓</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>你的骨骼轮廓更接近哪种？</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <OptionCard label="H 型" sub="肩宽≈髋宽，腰部不明显，整体较方正" active={boneShape === 'H'} onClick={() => { setBoneShape('H'); setShowXTrap(false) }} />
              <OptionCard label="X 型" sub="肩宽≈髋宽，腰部明显收细，沙漏型轮廓" active={boneShape === 'X'} onClick={() => { setBoneShape('X'); setShowXTrap(true) }} />
              <OptionCard label="A 型" sub="肩窄髋宽，重心偏下，梨形轮廓" active={boneShape === 'A'} onClick={() => { setBoneShape('A'); setShowXTrap(false) }} />
              <OptionCard label="V 型" sub="肩宽髋窄，倒三角轮廓，上半身较壮" active={boneShape === 'V'} onClick={() => { setBoneShape('V'); setShowXTrap(false) }} />
            </div>
            {showXTrap && (
              <div style={{ background: '#fdf8ee', border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '16px 20px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px', marginBottom: '8px' }}>X 型陷阱检测</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, margin: 0 }}>
                  很多「X型」其实是H型骨骼+内衣塑型/脂肪转移的假象。<br />
                  <strong>验证方法：</strong>用手摸肋骨最下端角度——<br />
                  · 角度 &gt; 90°（向外张开）→ H型骨架<br />
                  · 角度 &lt; 90°（向内收）→ 真X型
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPhase('sheldon')} style={btnOutline}>← 返回</button>
              <button onClick={() => setPhase('shoulder')} disabled={!boneShape}
                style={boneShape ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                继续
              </button>
            </div>
          </div>
        )}


        {/* ── Q4: 肩线走向 ── */}
        {phase === 'shoulder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>STEP 04 · 肩线走向</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>你的肩线走向更接近哪一种？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>观察颈肩连接到肩端的倾斜角度</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { id: 'sloped', img: '/shoulder_sloped.png', label: '溜肩', desc: '从颈部向肩端下降明显。' },
                { id: 'natural', img: '/shoulder_natural.png', label: '自然肩', desc: '下降程度适中。' },
                { id: 'straight', img: '/shoulder_straight.png', label: '平直肩', desc: '肩线较水平。' },
              ].map((o, i) => {
                const active = shoulderType === o.id
                return (
                  <button key={o.id} onClick={() => setShoulderType(o.id)} style={{
                    border: `1.5px solid ${active ? C.gold : C.border}`,
                    borderRadius: '10px', background: active ? '#fdf8ee' : '#fff',
                    padding: 0, cursor: 'pointer', overflow: 'hidden',
                    transition: 'all 0.2s', textAlign: 'left' as const,
                  }}>
                    {/* ABC 标签 + 大标题 */}
                    <div style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: active ? C.gold : '#e8e8e4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                          {['A','B','C'][i]}
                        </span>
                      </div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: active ? C.gold : C.h2, fontWeight: 400, margin: 0 }}>{o.label}</p>
                    </div>
                    {/* 描述文字 */}
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, lineHeight: 1.7, padding: '8px 16px 12px', margin: 0 }}>{o.desc}</p>
                    {/* 插图 */}
                    <img src={o.img} alt={o.label} style={{ width: '100%', display: 'block', objectFit: 'contain', background: '#f7f4ef' }} />
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPhase('bone')} style={btnOutline}>← 返回</button>
              <button onClick={() => setPhase('fat')} disabled={!shoulderType}
                style={shoulderType ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                继续
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: 脂肪视觉自评 ── */}
        {phase === 'fat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>STEP 03 · 脂肪分布</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>你的脂肪分布更接近哪种？</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <OptionCard label="均匀分布" sub="脂肪均匀分布，没有特别突出的部位" active={visual === '无'} onClick={() => setVisual('无')} />
              <OptionCard label="O 型堆积" sub="腹部、腰部脂肪明显，中心肥胖倾向" active={visual === 'O'} onClick={() => setVisual('O')} />
              <OptionCard label="S 型堆积" sub="胸部和臀部脂肪丰满，腰部相对细，曲线感强" active={visual === 'S'} onClick={() => setVisual('S')} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPhase('shoulder')} style={btnOutline}>← 返回</button>
              <button onClick={() => setPhase('qi')} disabled={!visual}
                style={visual ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                继续
              </button>
            </div>
          </div>
        )}

        {/* ── Step 5: 气血态 ── */}
        {phase === 'qi' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>STEP 04 · 气血态</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>4道题判断你的气血态</h2>
            </div>
            {[
              {
                q: q1, set: setQ1, title: '你的皮肤状态通常是？',
                opts: [
                  { id: 'A', text: '偏薄、透、毛孔细' }, { id: 'B', text: '饱满、有弹性、较厚' },
                  { id: 'C', text: '偏干、细腻但缺乏光泽' }, { id: 'D', text: '偏油或混合，皮肤厚' },
                ],
              },
              {
                q: q2, set: setQ2, title: '你的骨骼感和线条感如何？',
                opts: [
                  { id: 'A', text: '骨感明显，线条清晰' }, { id: 'B', text: '肌肉有力，骨骼感强' },
                  { id: 'C', text: '线条柔和，骨骼感弱' }, { id: 'D', text: '整体较厚实，线条不清晰' },
                ],
              },
              {
                q: q3, set: setQ3, title: '你的体重变化规律是？',
                opts: [
                  { id: 'A', text: '不容易胖，吃很多也不长肉' }, { id: 'B', text: '容易塑形，增肌减脂都较快' },
                  { id: 'C', text: '容易胖但主要在特定部位' }, { id: 'D', text: '全身容易长肉，很难瘦下来' },
                ],
              },
              {
                q: q4, set: setQ4, title: '素颜时你的气色通常是？',
                opts: [
                  { id: 'A', text: '红润有光泽，很有气色' }, { id: 'B', text: '健康自然，不苍白不暗沉' },
                  { id: 'C', text: '偏白或偏粉，有时显苍白' }, { id: 'D', text: '偏黄或偏暗，气色较差' },
                ],
              },
            ].map((item, idx) => (
              <div key={idx} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '20px' }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: C.h2, marginBottom: '12px' }}>{idx + 1}. {item.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {item.opts.map(o => (
                    <button key={o.id} onClick={() => item.set(o.id)} style={{
                      border: `1px solid ${item.q === o.id ? C.gold : C.border}`,
                      background: item.q === o.id ? '#fdf8ee' : '#fff',
                      padding: '12px 16px', textAlign: 'left', cursor: 'pointer',
                      borderRadius: '6px', display: 'flex', gap: '12px', alignItems: 'center',
                    }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: item.q === o.id ? C.gold : C.muted }}>{o.id}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: item.q === o.id ? C.h2 : C.body }}>{o.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setPhase('fat')} style={btnOutline}>← 返回</button>
              <button
                onClick={computeResult}
                disabled={!q1 || !q2 || !q3 || !q4}
                style={q1 && q2 && q3 && q4 ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}
              >
                生成体型档案
              </button>
            </div>
          </div>
        )}

        {/* ── 报告页 ── */}
        {phase === 'report' && result && (
          <ReportView
            result={result}
            onReset={reset}
            onReturnToStyle={fromStyle ? () => navigate('/test/style') : undefined}
          />
        )}

      </div>
    </div>
  )
}
