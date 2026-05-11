import { useState } from 'react'
import { Link } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

// ── 流程说明 ──
// AI 路径:    0(方式选择) → 4AI(拍照) → 1(谢尔顿确认) → 2(骨骼确认) → 3(脂肪) → 5(气血态) → 6(报告)
// 手动路径:   0(方式选择) → 4M(三围输入) → 1(谢尔顿) → 2(骨骼) → 3(脂肪) → 5(气血态) → 6(报告)

const PHASES = ['method', 'data', 'sheldon', 'bone', 'fat', 'qi', 'report'] as const
type Phase = typeof PHASES[number]

const COMPOSITE_CODES: Record<string, { name: string; sheldon: string; yin_yang: string }> = {
  'H':   { name: '纯H型',    sheldon: 'Mesomorph',  yin_yang: '少阳' },
  'H-O': { name: '苹果H型',  sheldon: 'Endomorph',  yin_yang: '太阴' },
  'H-S': { name: '曲线H型',  sheldon: 'Mesomorph',  yin_yang: '阴阳和平' },
  'X':   { name: '纯X型',    sheldon: 'Mesomorph',  yin_yang: '阴阳和平' },
  'X-O': { name: '苹果X型',  sheldon: 'Endomorph',  yin_yang: '太阴' },
  'X-S': { name: '沙漏型',   sheldon: 'Mesomorph',  yin_yang: '阴阳和平' },
  'A':   { name: '纯A型',    sheldon: 'Mesomorph',  yin_yang: '少阴' },
  'A-O': { name: '胖梨型',   sheldon: 'Endomorph',  yin_yang: '太阴' },
  'V':   { name: '纯V型',    sheldon: 'Mesomorph',  yin_yang: '太阳' },
  'V-O': { name: '壮苹果型', sheldon: 'Endomorph',  yin_yang: '太阳' },
}

const YIN_YANG_DESC: Record<string, { label: string; desc: string; style: string }> = {
  '太阳':     { label: '太阳型',     desc: '精力充沛，气场强，偏向外显风格',       style: '建议选择有力量感、结构清晰的廓形，避免过于柔软散漫的款式' },
  '少阳':     { label: '少阳型',     desc: '灵动活跃，适应力强，风格多变',         style: '建议选择轻盈有细节的设计，可尝试有趣的印花与层叠' },
  '太阴':     { label: '太阴型',     desc: '内敛柔和，气质温婉，偏向内敛风格',     style: '建议选择柔软面料和温和色调，避免强对比与过于张扬的设计' },
  '少阴':     { label: '少阴型',     desc: '细腻敏感，气质精致，偏向柔美风格',     style: '建议选择精致剪裁和优雅配色，细节和品质感是核心' },
  '阴阳和平': { label: '阴阳和平型', desc: '平衡稳定，气质中正，风格包容性强',     style: '经典款式和百搭配色是最佳选择，可随场合灵活切换风格' },
}

// AI 模拟给出的谢尔顿预判（实际接入后由模型返回）
const AI_SHELDON_SUGGESTION = 'Mesomorph'
const AI_BONE_SUGGESTION = 'H'

function calcFatCode(whr: number, bustWaistDiff: number, visual: string, boneCode: string): string {
  let oScore = 0, sScore = 0, noneScore = 0
  if (whr >= 0.85) oScore += 50
  else if (whr <= 0.75) sScore += 50
  else noneScore += 50
  if (bustWaistDiff >= 25) sScore += 30
  else if (bustWaistDiff <= 15) noneScore += 30
  else { oScore += 15; noneScore += 15 }
  if (visual === 'O') oScore += 20
  else if (visual === 'S') sScore += 20
  else noneScore += 20
  if (sScore > oScore && sScore > noneScore) {
    if (boneCode === 'V' || bustWaistDiff < 20) return '无'
    return 'S'
  }
  if (oScore > noneScore) return 'O'
  return '无'
}

function calcYinYang(q1: string, q2: string, q3: string, q4: string): string {
  const scores: Record<string, number> = { '太阳': 0, '少阳': 0, '太阴': 0, '少阴': 0, '阴阳和平': 0 }
  const map1: Record<string, string> = { A: '阴阳和平', B: '太阳', C: '太阴', D: '少阴' }
  const map2: Record<string, string> = { A: '阴阳和平', B: '太阳', C: '太阴', D: '少阴' }
  const map3: Record<string, string> = { A: '阴阳和平', B: '太阳', C: '少阴', D: '少阳' }
  const map4: Record<string, string> = { A: '太阳', B: '少阳', C: '太阴', D: '少阴' }
  if (map1[q1]) scores[map1[q1]] += 10
  if (map2[q2]) scores[map2[q2]] += 7.5
  if (map3[q3]) scores[map3[q3]] += 7.5
  if (q4 && map4[q4]) scores[map4[q4]] += 3
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
}

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold }}>{label}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>{current} / {total}</p>
      </div>
      <div style={{ height: '1px', background: C.border }}>
        <div style={{ height: '1px', background: C.gold, width: `${(current / total) * 100}%`, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: `1px solid ${C.border}`, background: '#fff', padding: '12px 24px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.body }}>
      上一步
    </button>
  )
}

export default function BodyTestPage() {
  const [phase, setPhase] = useState<Phase>('method')
  const [method, setMethod] = useState<'manual' | 'ai' | ''>('')

  // 数据层
  const [bust, setBust] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [shoulder, setShoulder] = useState('')
  const [hipBone, setHipBone] = useState('')
  const [conflict, setConflict] = useState('')
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'done'>('idle')

  // 确认层
  const [sheldon, setSheldon] = useState('')
  const [boneShape, setBoneShape] = useState('')
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
    if ((wN / hN) > 0.9 && (bN - wN) > 25) setConflict('腰臀比偏高但胸腰差较大，数据存在轻微冲突，建议重新测量腰围确认。')
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
    const codeData = COMPOSITE_CODES[compositeCode] || COMPOSITE_CODES[boneCode]
    const yinYang = calcYinYang(q1, q2, q3, q4)
    setResult({
      boneCode, fatCode, compositeCode,
      compositeName: codeData?.name || compositeCode,
      sheldonMap: codeData?.sheldon || sheldon,
      yinYang,
    })
    setPhase('report')
  }

  const startAiAnalysis = () => {
    setAiStatus('analyzing')
    setTimeout(() => {
      setAiStatus('done')
    }, 3000)
  }

  const inputStyle = {
    width: '100%', border: `1px solid ${C.border}`, padding: '12px 14px',
    fontFamily: 'Inter, sans-serif', fontSize: '14px', background: '#fff',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const btnPrimary = {
    flex: 1, padding: '16px', background: C.h1, color: '#fff',
    border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    fontSize: '13px', letterSpacing: '2px',
  }

  const btnDisabled = { ...btnPrimary, background: '#ccc', cursor: 'not-allowed' as const }

  const phaseIndex: Record<Phase, number> = { method: 0, data: 1, sheldon: 2, bone: 3, fat: 4, qi: 5, report: 6 }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px 96px' }}>

        {/* ── 方式选择 ── */}
        {phase === 'method' && (
          <div>
            <ProgressBar current={0} total={6} label="BODY TEST" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>体型测试</p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>选择测量方式</h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '40px' }}>两种方式最终得出相同结论，选择你最方便的方式</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { id: 'manual', num: '01', title: '手动输入', desc: '自行测量三围数据，系统实时计算体型代码' },
                { id: 'ai',     num: '02', title: 'AI 拍照识别', desc: '上传正面全身照，AI 自动识别骨骼与脂肪分布' },
              ].map(m => (
                <button key={m.id} onClick={() => { setMethod(m.id as 'manual' | 'ai'); setPhase('data') }} style={{
                  border: `1px solid ${C.border}`, background: '#fff', padding: '32px 24px',
                  cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = C.gold)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>OPTION {m.num}</p>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: C.h1, marginBottom: '8px' }}>{m.title}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, lineHeight: '1.7' }}>{m.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 数据输入：手动三围 ── */}
        {phase === 'data' && method === 'manual' && (
          <div>
            <ProgressBar current={1} total={6} label="BODY TEST · STEP 01" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>Step 01 · 数据输入</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>输入你的三围数据</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '32px' }}>所有数据单位为厘米（cm），系统将实时计算腰臀比与胸腰差</p>

            <div style={{ background: '#f7f4ef', padding: '20px', marginBottom: '28px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
              {[
                { label: '测量胸围', desc: '胸部最宽处周长，穿喜欢的胸罩测量' },
                { label: '测量腰围', desc: '腰部最细处，通常在肚脐和臀部之间' },
                { label: '测量臀围', desc: '臀部最宽处周长，通常是腿部弯曲处' },
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, marginBottom: '4px' }}>{m.label}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, lineHeight: '1.5' }}>{m.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: '胸围 (cm)', val: bust, set: setBust, ph: '例：88' },
                { label: '腰围 (cm)', val: waist, set: setWaist, ph: '例：68' },
                { label: '臀围 (cm)', val: hip, set: setHip, ph: '例：94' },
                { label: '肩宽 (cm)', val: shoulder, set: setShoulder, ph: '例：38' },
                { label: '胯宽 (cm)', val: hipBone, set: setHipBone, ph: '例：36' },
              ].map(f => (
                <div key={f.label}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px', color: C.muted, marginBottom: '8px' }}>{f.label}</p>
                  <input type="number" value={f.val} placeholder={f.ph} style={inputStyle}
                    onChange={e => { f.set(e.target.value); checkConflict(bust, waist, hip) }} />
                </div>
              ))}
            </div>

            {bust && waist && hip && (
              <div style={{ background: '#f7f4ef', padding: '16px', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {[
                  { label: '腰臀比', value: (parseFloat(waist) / parseFloat(hip)).toFixed(2) },
                  { label: '胸腰差', value: `${(parseFloat(bust) - parseFloat(waist)).toFixed(1)} cm` },
                  ...(shoulder && hipBone ? [{ label: '肩胯差', value: `${(parseFloat(shoulder) - parseFloat(hipBone)).toFixed(1)} cm` }] : []),
                ].map(r => (
                  <div key={r.label}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '4px' }}>{r.label}</p>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: C.gold }}>{r.value}</p>
                  </div>
                ))}
              </div>
            )}

            {conflict && (
              <div style={{ border: '1px solid #e0a060', background: '#fff8f0', padding: '12px 16px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#a06020', lineHeight: '1.6' }}>⚠ {conflict}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <BackBtn onClick={() => setPhase('method')} />
              <button onClick={() => setPhase('sheldon')}
                disabled={!bust || !waist || !hip || !shoulder || !hipBone}
                style={{ ...(!bust || !waist || !hip || !shoulder || !hipBone ? btnDisabled : btnPrimary) }}>
                继续
              </button>
            </div>
          </div>
        )}

        {/* ── 数据输入：AI 拍照 ── */}
        {phase === 'data' && method === 'ai' && (
          <div>
            <ProgressBar current={1} total={6} label="BODY TEST · STEP 01" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>Step 01 · AI 识别</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>上传正面全身照</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '40px' }}>建议穿贴身衣物，背景简洁，光线均匀，站直面对镜头</p>

            {aiStatus === 'idle' && (
              <div>
                <div style={{ border: `1px dashed ${C.border}`, padding: '64px 32px', textAlign: 'center', marginBottom: '24px', background: '#f7f4ef' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', color: C.muted, marginBottom: '8px' }}>点击上传或拖拽图片</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>支持 JPG / PNG，建议全身正面照</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setPhase('method')} />
                  <button onClick={startAiAnalysis} style={btnPrimary}>开始 AI 分析</button>
                </div>
              </div>
            )}

            {aiStatus === 'analyzing' && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ width: '40px', height: '40px', border: `1px solid ${C.border}`, borderTop: `1px solid ${C.gold}`, borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: C.h1, marginBottom: '8px' }}>AI 识别中</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>正在分析骨骼轮廓与脂肪分布…</p>
              </div>
            )}

            {aiStatus === 'done' && (
              <div>
                <div style={{ border: `1px solid ${C.gold}`, padding: '24px', marginBottom: '20px', background: '#fdf8ee' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, marginBottom: '16px' }}>AI 初步识别结果</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
                    {[
                      { label: '体质类型推测', value: '中胚型 (Mesomorph)', conf: '79%' },
                      { label: '骨骼轮廓推测', value: 'H 型', conf: '82%' },
                    ].map(r => (
                      <div key={r.label}>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '6px' }}>{r.label}</p>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: C.gold, marginBottom: '2px' }}>{r.value}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>置信度 {r.conf}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginBottom: '16px', lineHeight: '1.7' }}>
                  下一步将展示完整选项供你确认或修改 AI 的判断。
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => { setAiStatus('idle'); setPhase('method') }} />
                  <button onClick={() => {
                    setSheldon(AI_SHELDON_SUGGESTION)
                    setBoneShape(AI_BONE_SUGGESTION)
                    setPhase('sheldon')
                  }} style={btnPrimary}>
                    确认并继续
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 谢尔顿三型确认 ── */}
        {phase === 'sheldon' && (
          <div>
            <ProgressBar current={2} total={6} label="BODY TEST · STEP 02" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>Step 02 · 体质底层</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>
              {method === 'ai' ? 'AI 判断你的体质类型，请确认或修改' : '你的体质类型更接近哪种？'}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '40px' }}>
              {method === 'ai' ? '以下是 AI 的初步判断，你可以直接确认，也可以选择更接近你实际情况的类型' : '选择最接近你天生体质倾向的类型（非当前体重状态）'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '32px' }}>
              {[
                { id: 'Ectomorph', label: '外胚型', en: 'Ectomorph', keywords: ['纤细', '骨骼清晰', '代谢快'], desc: '身体线条垂直纤细，骨骼可见，脂肪极少，新陈代谢快' },
                { id: 'Mesomorph', label: '中胚型', en: 'Mesomorph', keywords: ['匀称', '肌肉感', '易塑形'], desc: '肌肉发达，体型匀称，骨骼适中，增肌减脂相对容易' },
                { id: 'Endomorph', label: '内胚型', en: 'Endomorph', keywords: ['丰满', '曲线', '代谢慢'], desc: '脂肪较多，曲线圆润，代谢较慢，容易积累脂肪' },
              ].map(t => (
                <button key={t.id} onClick={() => setSheldon(t.id)} style={{
                  border: `1px solid ${sheldon === t.id ? C.gold : C.border}`,
                  background: sheldon === t.id ? '#fdf8ee' : '#fff',
                  padding: '20px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  position: 'relative',
                }}>
                  {method === 'ai' && t.id === AI_SHELDON_SUGGESTION && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: C.gold, color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '9px', padding: '2px 6px', letterSpacing: '1px' }}>AI 推荐</div>
                  )}
                  <div style={{ height: '80px', background: '#f5f2ed', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: C.muted, letterSpacing: '2px' }}>{t.en.toUpperCase()}</span>
                  </div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: sheldon === t.id ? C.gold : C.h2, marginBottom: '4px' }}>{t.label}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, letterSpacing: '2px', marginBottom: '10px' }}>{t.en}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
                    {t.keywords.map(k => <span key={k} style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: C.gold, border: `0.5px solid ${C.gold}`, padding: '2px 6px' }}>{k}</span>)}
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, lineHeight: '1.6' }}>{t.desc}</p>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setPhase('data')} />
              <button onClick={() => setPhase('bone')} disabled={!sheldon}
                style={{ ...(!sheldon ? btnDisabled : btnPrimary) }}>
                继续
              </button>
            </div>
          </div>
        )}

        {/* ── 骨骼轮廓确认 ── */}
        {phase === 'bone' && (
          <div>
            <ProgressBar current={3} total={6} label="BODY TEST · STEP 03" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>Step 03 · 骨骼轮廓</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>
              {method === 'ai' ? 'AI 判断你的骨骼轮廓，请确认或修改' : '你的骨骼轮廓更接近哪种？'}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '40px' }}>忽略脂肪，只看骨架结构——肩宽、胯宽与腰节的关系</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {[
                { id: 'H', label: 'H 型', desc: '肩胯等宽，腰节不明显，整体呈直筒状' },
                { id: 'X', label: 'X 型', desc: '肩胯等宽，腰节明显内收，比例平衡' },
                { id: 'A', label: 'A 型', desc: '胯宽大于肩宽，腰节偏高，下半身较宽' },
                { id: 'V', label: 'V 型', desc: '肩宽大于胯宽，腰节较低，上半身较宽' },
              ].map(b => (
                <button key={b.id} onClick={() => {
                  setBoneShape(b.id)
                  if (b.id === 'X') setShowXTrap(true)
                  else setShowXTrap(false)
                }} style={{
                  border: `1px solid ${boneShape === b.id ? C.gold : C.border}`,
                  background: boneShape === b.id ? '#fdf8ee' : '#fff',
                  padding: '20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  position: 'relative',
                }}>
                  {method === 'ai' && b.id === AI_BONE_SUGGESTION && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: C.gold, color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '9px', padding: '2px 6px', letterSpacing: '1px' }}>AI 推荐</div>
                  )}
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: boneShape === b.id ? C.gold : C.h1, marginBottom: '8px' }}>{b.label}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, lineHeight: '1.6' }}>{b.desc}</p>
                </button>
              ))}
            </div>

            {/* X 型腰带验证 */}
            {showXTrap && (
              <div style={{ border: `1px solid ${C.gold}`, background: '#fdf8ee', padding: '24px', marginBottom: '24px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>⚠ X 型验证</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: C.h2, marginBottom: '8px' }}>腰带测试</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8', marginBottom: '20px' }}>
                  把一条腰带或绳子松松围在腰部最细处，放松站立，观察腹部状态：
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: '我的肚子外凸，腰带往外撑', sub: '→ 自动修正为 H 型骨架（X 型是假象）', action: () => { setBoneShape('H'); setShowXTrap(false) } },
                    { label: '我的肚子平坦，腰带自然贴合', sub: '→ 确认为真 X 型', action: () => setShowXTrap(false) },
                    { label: '我不想验证，直接继续', sub: '→ 保留 X 型选择，结论标记为存疑', action: () => setShowXTrap(false) },
                  ].map((o, i) => (
                    <button key={i} onClick={o.action} style={{
                      border: `1px solid ${C.border}`, background: '#fff', padding: '16px 18px',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                      display: 'flex', gap: '14px', alignItems: 'flex-start',
                    }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, flexShrink: 0, marginTop: '2px' }}>{String.fromCharCode(65 + i)}</span>
                      <div>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, marginBottom: '3px' }}>{o.label}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>{o.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setPhase('sheldon')} />
              <button onClick={() => setPhase('fat')} disabled={!boneShape || showXTrap}
                style={{ ...(!boneShape || showXTrap ? btnDisabled : btnPrimary) }}>
                继续
              </button>
            </div>
          </div>
        )}

        {/* ── 脂肪视觉自评 ── */}
        {phase === 'fat' && (
          <div>
            <ProgressBar current={4} total={6} label="BODY TEST · STEP 04" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>Step 04 · 脂肪分布</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>在骨骼地基上，脂肪如何分布？</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '40px' }}>忽略骨架，只看脂肪的分布方式与感觉</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {[
                { id: 'O', label: 'O 型 · 内胚脂肪', desc: '腰腹圆润，四肢相对细；体型丰满，曲线优美；胸部较大或臀部较宽；新陈代谢较慢，肌肉线条不明显' },
                { id: 'S', label: 'S 型 · 中胚脂肪', desc: '胸臀丰满、腰细曲线分明；较为精瘦且肌肉有感；胸部或臀部中等大小；肌肉线条较为明显' },
                { id: 'none', label: '无 · 外胚脂肪', desc: '脂肪堆积极少，新陈代谢快；骨骼纤细清晰可见；身体线条垂直，整体流畅纤细' },
              ].map(v => (
                <button key={v.id} onClick={() => setVisual(v.id)} style={{
                  border: `1px solid ${visual === v.id ? C.gold : C.border}`,
                  background: visual === v.id ? '#fdf8ee' : '#fff',
                  padding: '20px 24px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: visual === v.id ? C.gold : C.h2, marginBottom: '8px' }}>{v.label}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, lineHeight: '1.7' }}>{v.desc}</p>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setPhase('bone')} />
              <button onClick={() => setPhase('qi')} disabled={!visual}
                style={{ ...(!visual ? btnDisabled : btnPrimary) }}>
                继续
              </button>
            </div>
          </div>
        )}

        {/* ── 气血态 ── */}
        {phase === 'qi' && (
          <div>
            <ProgressBar current={5} total={6} label="BODY TEST · STEP 05" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>Step 05 · 气血态</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>气血态测试</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '40px' }}>4 道题，判断你的气质底层倾向，影响穿搭的「精气神」维度</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '40px' }}>
              {[
                { q: 'Q1 · 你的精力模式？', val: q1, set: setQ1, opts: [{ id: 'A', t: '持续稳定，不易累也不易亢奋' }, { id: 'B', t: '爆发力强，但易透支' }, { id: 'C', t: '温和持久，不喜剧烈变动' }, { id: 'D', t: '敏感细腻，易消耗' }] },
                { q: 'Q2 · 面对压力？', val: q2, set: setQ2, opts: [{ id: 'A', t: '从容应对' }, { id: 'B', t: '迎难而上' }, { id: 'C', t: '回避退缩' }, { id: 'D', t: '内心纠结，表面平静' }] },
                { q: 'Q3 · 社交场合？', val: q3, set: setQ3, opts: [{ id: 'A', t: '适度参与' }, { id: 'B', t: '成为焦点' }, { id: 'C', t: '观察为主' }, { id: 'D', t: '选择性深入' }] },
                { q: 'Q4 · 你的面色 / 唇色？（可选）', val: q4, set: setQ4, opts: [{ id: 'A', t: '红润均匀' }, { id: 'B', t: '偏红或偏黑' }, { id: 'C', t: '偏白或偏黄' }, { id: 'D', t: '偏青或偏淡' }] },
              ].map(({ q, val, set, opts }) => (
                <div key={q}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: C.h2, marginBottom: '16px' }}>{q}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {opts.map(o => (
                      <button key={o.id} onClick={() => set(o.id)} style={{
                        border: `1px solid ${val === o.id ? C.gold : C.border}`,
                        background: val === o.id ? '#fdf8ee' : '#fff',
                        padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.2s', display: 'flex', gap: '12px', alignItems: 'center',
                      }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: val === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0 }}>{o.id}</span>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: val === o.id ? C.h2 : C.body }}>{o.t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setPhase('fat')} />
              <button onClick={computeResult} disabled={!q1 || !q2 || !q3}
                style={{ ...(!q1 || !q2 || !q3 ? btnDisabled : btnPrimary) }}>
                生成我的体型档案
              </button>
            </div>
          </div>
        )}

        {/* ── 报告页 ── */}
        {phase === 'report' && result && (
          <div>
            <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '32px', marginBottom: '40px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>BODY PROFILE · 体型档案</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, marginBottom: '6px' }}>{result.compositeName}</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>{result.compositeCode} · {result.sheldonMap} · {result.yinYang}</p>
            </div>

            <div style={{ border: `1px solid ${C.gold}`, marginBottom: '32px' }}>
              <div style={{ padding: '24px 28px', borderBottom: `1px solid ${C.border}` }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '20px' }}>三层档案</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
                  {[
                    { label: '骨骼代码', value: result.boneCode, sub: '骨架结构' },
                    { label: '脂肪代码', value: result.fatCode, sub: '脂肪分布' },
                    { label: '气血态', value: result.yinYang, sub: YIN_YANG_DESC[result.yinYang]?.label },
                  ].map(item => (
                    <div key={item.label}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, marginBottom: '6px' }}>{item.label}</p>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: C.gold, marginBottom: '2px' }}>{item.value}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '24px 28px', borderBottom: `1px solid ${C.border}`, background: '#fafaf8' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>气血态解读</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: '1.8', marginBottom: '8px' }}>{YIN_YANG_DESC[result.yinYang]?.desc}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, lineHeight: '1.8' }}>{YIN_YANG_DESC[result.yinYang]?.style}</p>
              </div>

              <div style={{ padding: '24px 28px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '20px' }}>穿搭策略</p>
                {[
                  { label: '骨骼策略', text: `针对 ${result.boneCode} 型骨架的廓形选择、肩线处理和腰节强调方式将在完整报告中呈现。` },
                  { label: '脂肪策略', text: `针对 ${result.fatCode} 型脂肪分布的面料选择、图案偏好和视觉修饰方向将在完整报告中呈现。` },
                  { label: '气质策略', text: `基于 ${result.yinYang} 气血态的色彩能量、配饰风格和整体气场营造将在完整报告中呈现。` },
                ].map((s, i, arr) => (
                  <div key={s.label} style={{ marginBottom: i < arr.length - 1 ? '16px' : 0, paddingBottom: i < arr.length - 1 ? '16px' : 0, borderBottom: i < arr.length - 1 ? `0.5px solid ${C.border}` : 'none' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px', color: C.muted, marginBottom: '6px' }}>{s.label}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#f7f4ef', padding: '24px', marginBottom: '24px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>推荐下一步</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8', marginBottom: '16px' }}>体型档案已建立。加入色彩测试后，系统将生成「体型 × 色彩」组合分析，结论更精准。</p>
              <Link to="/test/color" style={{ display: 'inline-block', background: C.h1, color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', padding: '14px 28px', textDecoration: 'none' }}>
                继续色彩测试 →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              <button onClick={() => { setPhase('method'); setResult(null); setSheldon(''); setBoneShape(''); setVisual(''); setQ1(''); setQ2(''); setQ3(''); setQ4('') }}
                style={{ border: `1px solid ${C.border}`, background: '#fff', padding: '14px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.body }}>
                重新测试
              </button>
              <Link to="/onboarding" style={{ border: `1px solid ${C.border}`, background: '#fff', padding: '14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.body, textDecoration: 'none', textAlign: 'center' as const }}>
                返回测试中心
              </Link>
              <Link to="/profile" style={{ border: 'none', background: C.h1, padding: '14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#fff', textDecoration: 'none', textAlign: 'center' as const }}>
                进入我的档案
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
