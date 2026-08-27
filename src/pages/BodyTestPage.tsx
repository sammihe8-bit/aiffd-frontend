import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { testProgressAPI } from '../utils/api'

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
  '阴少阳多': { element: '木', familyName: '自然型', familyEn: 'Natural', variants: { soft: '浪漫自然型', base: '自然型', intense: '戏剧自然型' } },
  '阳': { element: '火', familyName: '戏剧型', familyEn: 'Dramatic', variants: { base: '浪漫戏剧型', intense: '戏剧型' } },
}

const BODY_IMAGES: Record<string, string> = {
  'H': '/BodyH.png', 'X': '/BodyX.png', 'A': '/BodyA.png', 'V': '/BodyV.png',
}

// ── 计算函数
//
// 2026-08-26 架构调整：13 型判定不再由本页计算。
// 骨架/皮肉 10 个维度的原始答案会连同风格测试新增的面部 6 个维度，
// 一起交给 `src/utils/styleScoring.ts` 的两层匹配引擎统一打分（详见架构文档第 2.3 节）。
// 本页只负责采集原始答案并存入 localStorage，calcBoneQuality / calcBodyLine / calcStyleVariant
// 三个旧函数（基于已废弃的"气血 4 态投票直接决定家族"架构）已删除。

// 气血态：5 态直选计票，取最高票；打平判定为"阴阳和谐"（居中态）
// 注意：此结果不再用于风格测试的 13 型判定，只作为色彩测试计算五行的输入（见架构文档第四章）
function calcQiXue(q1: string, q2: string, q3: string, q4: string): string {
  const scores: Record<string, number> = { '阴': 0, '阴多阳少': 0, '阴阳和谐': 0, '阴少阳多': 0, '阳': 0 }
  ;[q1, q2, q3, q4].forEach(v => { if (v && scores[v] !== undefined) scores[v]++ })
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const top = sorted[0][1]
  const tied = sorted.filter(([, v]) => v === top)
  if (tied.length > 1) return '阴阳和谐'
  return sorted[0][0]
}

// 进度快照的形状（存进 localStorage 或后端 test_progress 表的 data_json，两边格式统一）
interface BodySnapshot {
  phase: Phase; method: string; bust: string; waist: string; hip: string
  heightRange: string; boneScale: string; boneRoundness: string; boneWidth: string
  shoulderShape: string[]; waistType: string[]; limbLength: string; handFootSize: string
  bodyShape: string[]; hipProtrude: string[]; chestProtrude: string[]; fleshTexture: string[]
  q1: string; q2: string; q3: string; q4: string
  skeletonIdx: number; fleshIdx: number; qixueIdx: number
}

// 不依赖当前组件 state，直接从一份存档快照算出报告页需要的 result 对象
// 供"继续测试后直接看已完成结果"和"查看历史完成结果"两种场景共用
function buildResultFromSnapshot(s: BodySnapshot) {
  const qiXueState = calcQiXue(s.q1, s.q2, s.q3, s.q4)
  const qiXueInfo = FAMILY_INFO[qiXueState] || FAMILY_INFO['阴阳和谐']
  return {
    heightRange: s.heightRange, boneScale: s.boneScale,
    boneShape: [s.boneRoundness, s.boneWidth].filter(Boolean),
    shoulderShape: s.shoulderShape, waistType: s.waistType,
    limbLength: s.limbLength, handFootSize: s.handFootSize, bodyShape: s.bodyShape,
    hipProtrude: s.hipProtrude, chestProtrude: s.chestProtrude, fleshTexture: s.fleshTexture,
    qiXueState, qiXueFamily: qiXueInfo.familyName, qiXueElement: qiXueInfo.element,
  }
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

// 选项字母标注：A/B/C/D...，帮助用户明确区分选项（2026-08-27 新增）
function letterOf(i: number): string {
  return String.fromCharCode(65 + i)
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

// 多选卡片（用于肩型/腰型/体格等会出现组合词的维度）：勾选态用左侧圆点+描边区分，样式与 OptionCard 保持一致
function MultiOptionCard({ label, sub, active, onClick }: {
  label: string; sub?: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      border: `1px solid ${active ? C.gold : C.border}`,
      background: active ? '#fdf8ee' : '#fff',
      padding: '16px 20px', textAlign: 'left', cursor: 'pointer',
      transition: 'all 0.2s', width: '100%', borderRadius: '6px',
      display: 'flex', alignItems: 'center', gap: '14px',
    }}>
      <span style={{
        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
        border: `1.5px solid ${active ? C.gold : C.border}`,
        background: active ? C.gold : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && <span style={{ color: '#fff', fontSize: '12px', lineHeight: 1 }}>✓</span>}
      </span>
      <span>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: active ? C.gold : C.h2, margin: 0 }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: '4px 0 0' }}>{sub}</p>}
      </span>
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
    heightRange: string; boneScale: string; boneShape: string[]; shoulderShape: string[]; waistType: string[]
    limbLength: string; handFootSize: string; bodyShape: string[]
    hipProtrude: string[]; chestProtrude: string[]; fleshTexture: string[]
    qiXueState: string; qiXueFamily: string; qiXueElement: string
  }
  onReset: () => void
  onReturnToStyle?: () => void
}) {
  const primaryBodyShape = result.bodyShape[0]?.replace('型', '') ?? ''
  const imgSrc = BODY_IMAGES[primaryBodyShape]
  const boneScaleLabel: Record<string, string> = { S: '小骨架', M: '中等骨架', L: '大骨架' }
  const heightLabel: Record<string, string> = {
    '<155': '155cm 以下', '155-160': '155-160cm', '160-165': '160-165cm', '165-170': '165-170cm', '>170': '170cm 以上',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 标题：体型档案已采集，尚未给出最终风格结论 */}
      <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '8px' }}>体型档案</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', color: C.h1, fontWeight: 400, margin: '0 0 4px' }}>骨架 + 皮肉数据已采集</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
          完成风格测试中的面部测试后，系统将结合本次数据给出最终 13 型结论
        </p>
      </div>

      {/* 左图右档案 */}
      <div style={{ display: 'grid', gridTemplateColumns: imgSrc ? '180px 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>
        {imgSrc && <img src={imgSrc} alt={primaryBodyShape} style={{ width: '100%', objectFit: 'contain' }} />}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', overflow: 'hidden' }}>
          {/* 骨架档案 */}
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '14px' }}>骨架档案</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px 16px' }}>
              {[
                ['身高', heightLabel[result.heightRange] ?? result.heightRange], ['骨架大小', `${boneScaleLabel[result.boneScale]}${result.boneShape.length ? ' · ' + result.boneShape.join('+') : ''}`], ['肩形', result.shoulderShape.join(' + ') || '—'],
                ['腰型', result.waistType.join(' + ') || '—'], ['四肢长度', result.limbLength], ['手脚大小', result.handFootSize],
                ['体型', result.bodyShape.join(' + ') || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 2px' }}>{k}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, margin: 0, fontWeight: 500 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 皮肉档案 */}
          <div style={{ padding: '20px 24px', background: '#fafaf8' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '14px' }}>皮肉档案</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px 16px' }}>
              {[['臀', result.hipProtrude.join(' + ') || '—'], ['胸', result.chestProtrude.join(' + ') || '—'], ['皮肉质', result.fleshTexture.join(' + ') || '—']].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, margin: '0 0 2px' }}>{k}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, margin: 0, fontWeight: 500 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 气血态：不再直接决定风格家族，只作为色彩测试的输入展示 */}
      <div style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px 24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '10px' }}>气血态（用于色彩测试计算五行，不影响风格测试结果）</p>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.h1, margin: '0 0 4px' }}>{result.qiXueState}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: 0 }}>
          对应五行属{result.qiXueElement}（{result.qiXueFamily} 方向）
        </p>
      </div>

      {/* 推荐下一步 */}
      <div style={{ background: '#f7f4ef', padding: '24px', borderRadius: '8px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>推荐下一步</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, marginBottom: '16px' }}>
          体型档案已建立。前往风格测试完成面部测试，系统将结合骨架、皮肉与面部特征，给出最终 13 型结论。
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
  const { token } = useAuth() // 登录用户走数据库存档；token 为空则是访客，走 localStorage
  const [phase, setPhase] = useState<Phase>('method')
  const fromStyle = typeof window !== 'undefined' && localStorage.getItem('aiffd_return_to') === 'style_body'
  const [method, setMethod] = useState<'manual' | 'ai' | ''>('')

  // 2026-08-27 新增：进度存档与续测提醒。
  // 已登录用户：初始不弹窗，等下面的 useEffect 真正查到数据库结果后再决定弹不弹（避免被本机残留的旧 localStorage 记录误导）
  // 访客（没有 token）：直接用 localStorage 判断，本来就没有"查数据库"这一步可等
  const [resumeChoice, setResumeChoice] = useState<'none' | 'completed' | 'inprogress'>(() => {
    if (typeof window === 'undefined') return 'none'
    if (token) return 'none'
    if (localStorage.getItem('aiffd_body_progress')) return 'inprogress'
    if (localStorage.getItem('aiffd_body_result')) return 'completed'
    return 'none'
  })
  // 已登录用户的存档内容从数据库读回来后放这里；restoreProgress / loadCompletedResult 会优先用这个，而不是 localStorage
  const [remoteSnapshot, setRemoteSnapshot] = useState<BodySnapshot | null>(null)

  // 本机 localStorage 里是否有残留记录（可能是登录前、以访客身份测过一半留下的），供数据库查询失败时兜底用
  const checkLocalFallback = () => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('aiffd_body_progress')) setResumeChoice('inprogress')
    else if (localStorage.getItem('aiffd_body_result')) setResumeChoice('completed')
    else setResumeChoice('none')
  }

  useEffect(() => {
    if (!token) return // 访客：沿用上面 localStorage 算出的初始值，不用查数据库
    let cancelled = false
    testProgressAPI.get('body')
      .then(res => {
        if (cancelled) return
        const progress = res.data?.progress
        if (progress && progress.data) {
          setRemoteSnapshot(progress.data as BodySnapshot)
          setResumeChoice(progress.status === 'completed' ? 'completed' : 'inprogress')
        } else {
          checkLocalFallback() // 数据库里没有这个用户的存档，退回看看本机有没有登录前留下的记录
        }
      })
      .catch(() => { if (!cancelled) checkLocalFallback() /* 查询失败就退回本机记录，而不是什么都不做 */ })
    return () => { cancelled = true }
  }, [token])

  // 测量数据（AI / 手动 共用，用于辅助预填）
  const [bust, setBust] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [conflict, setConflict] = useState('')
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'done'>('idle')
  const [previewUrl, setPreviewUrl] = useState('')

  // 骨架测试 7 维度
  // 肩型 / 腰型 / 体格 三项在表格里会出现组合词（如"圆+溜"），改为多选，存成数组
  const [heightRange, setHeightRange] = useState('')
  const [boneScale, setBoneScale] = useState('')
  // 骨架形状原本是一道多选题（圆/角/匀/宽/窄），2026-08-27 改为两道单选子题：
  // 骨点明显程度（圆润↔有棱角）+ 肩部横向展开感（偏窄↔偏宽），两个答案合并成 boneShape 数组
  const [boneRoundness, setBoneRoundness] = useState('') // 骨点较弱→圆 / 骨点适中→匀 / 骨点明显→角
  const [boneWidth, setBoneWidth] = useState('') // 偏窄→窄 / 适中→匀 / 偏宽→宽
  const boneShape = [boneRoundness, boneWidth].filter(Boolean)
  const [shoulderShape, setShoulderShape] = useState<string[]>([])
  const [waistType, setWaistType] = useState<string[]>([])
  const [limbLength, setLimbLength] = useState('')
  const [handFootSize, setHandFootSize] = useState('')
  const [bodyShape, setBodyShape] = useState<string[]>([]) // 多选：H型/X型/A型/V型（与打分矩阵词汇一致，带"型"字）
  const [showXTrap, setShowXTrap] = useState(false)

  // 皮肉测试 3 维度
  const [hipProtrude, setHipProtrude] = useState<string[]>([])
  const [chestProtrude, setChestProtrude] = useState<string[]>([])
  const [fleshTexture, setFleshTexture] = useState<string[]>([])

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
    heightRange: string; boneScale: string; boneShape: string[]; shoulderShape: string[]; waistType: string[]
    limbLength: string; handFootSize: string; bodyShape: string[]
    hipProtrude: string[]; chestProtrude: string[]; fleshTexture: string[]
    qiXueState: string; qiXueFamily: string; qiXueElement: string
  } | null>(null)

  const checkConflict = (b: string, w: string, h: string) => {
    const bN = parseFloat(b), wN = parseFloat(w), hN = parseFloat(h)
    if (!bN || !wN || !hN) return
    if ((wN / hN) > 0.9 && (bN - wN) > 25)
      setConflict('腰臀比偏高但胸腰差较大，数据存在轻微冲突，建议重新测量腰围确认。')
    else setConflict('')
  }

  // 2026-08-26 架构调整：本页不再计算最终 13 型结果（需要面部测试的数据才能算完整）。
  // 这里只做两件事：① 把气血 4 题的结果单独存起来，供色彩测试计算五行用；
  // ② 把体型测试 11 个原始维度存入 aiffd_body_result，供 StyleTestPage 的两层匹配引擎读取。
  const computeResult = () => {
    const qiXueState = calcQiXue(q1, q2, q3, q4)
    const qiXueInfo = FAMILY_INFO[qiXueState] || FAMILY_INFO['阴阳和谐']

    const resultData = {
      heightRange, boneScale, boneShape, shoulderShape, waistType, limbLength, handFootSize, bodyShape,
      hipProtrude, chestProtrude, fleshTexture,
      qiXueState, qiXueFamily: qiXueInfo.familyName, qiXueElement: qiXueInfo.element,
    }
    setResult(resultData)

    // 供打分引擎使用的原始维度（键名对应 src/data/styleMatrix.ts 里的 DIMENSIONS[].id）
    // 骨架大小是 combo 类型，把"尺寸(S/M/L)"和"形状(圆/角/匀/宽/窄)"两屏答案合并成一个数组
    // 这两个 key 是给 StyleTestPage 用的引擎输入，不管有没有登录都固定存本机 localStorage
    localStorage.setItem('aiffd_body_result', JSON.stringify({
      boneScale: [boneScale, ...boneShape], height: heightRange, shoulder: shoulderShape, waist: waistType,
      limb: limbLength, handFoot: handFootSize, bodyShape,
      fleshTexture, hip: hipProtrude, chest: chestProtrude,
    }))
    // 气血 4 题结果单独存放，供色彩测试计算五行主辅百分比使用，不参与风格测试打分
    localStorage.setItem('aiffd_qixue_result', JSON.stringify({ qiXueState, q1, q2, q3, q4 }))

    // 续测存档：标记为已完成
    const snapshot: BodySnapshot = {
      phase: 'report', method, bust, waist, hip,
      heightRange, boneScale, boneRoundness, boneWidth, shoulderShape, waistType,
      limbLength, handFootSize, bodyShape, hipProtrude, chestProtrude, fleshTexture,
      q1, q2, q3, q4, skeletonIdx, fleshIdx, qixueIdx,
    }
    if (token) {
      testProgressAPI.save('body', 'completed', snapshot).catch(() => {})
    } else {
      localStorage.removeItem('aiffd_body_progress') // 测试已完整做完，清掉中途存档
    }
    setPhase('report')
  }

  const reset = () => {
    setPhase('method'); setMethod(''); setResult(null)
    setBust(''); setWaist(''); setHip(''); setConflict('')
    setAiStatus('idle'); setPreviewUrl('')
    setHeightRange(''); setBoneScale(''); setBoneRoundness(''); setBoneWidth(''); setShoulderShape([]); setWaistType([])
    setLimbLength(''); setHandFootSize(''); setBodyShape([]); setShowXTrap(false)
    setHipProtrude([]); setChestProtrude([]); setFleshTexture([])
    setQ1(''); setQ2(''); setQ3(''); setQ4('')
    setSkeletonIdx(0); setFleshIdx(0); setQixueIdx(0)
  }

  // 骨架(8) + 皮肉(3) + 气血态(4) = 15 题，跨环节统一计数，方便一屏一题的进度展示
  const TOTAL_QUESTIONS = 16
  const currentQuestionNumber =
    phase === 'skeleton' ? skeletonIdx + 1 :
    phase === 'flesh' ? 9 + fleshIdx + 1 :
    phase === 'qixue' ? 9 + 3 + qixueIdx + 1 : 0

  // 选完一题后延迟自动跳下一题，让用户先看到选中态再切换
  const AUTO_ADVANCE_DELAY = 260
  const goNextSkeleton = () => {
    if (skeletonIdx < 8) setSkeletonIdx(skeletonIdx + 1)
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

  // ── 进度自动存档：只要用户已经开始答题（不在 method / report），且已经处理完续测提示，
  // 每次答案或页面位置变化就把完整快照写进去，方便中途退出后能真正"继续测试"
  // 已登录 → 存进数据库（跨设备都能续）；访客 → 存 localStorage（仅本机本浏览器有效）
  useEffect(() => {
    if (resumeChoice !== 'none') return
    if (phase === 'method' || phase === 'report') return
    const snapshot: BodySnapshot = {
      phase, method, bust, waist, hip,
      heightRange, boneScale, boneRoundness, boneWidth, shoulderShape, waistType,
      limbLength, handFootSize, bodyShape, hipProtrude, chestProtrude, fleshTexture,
      q1, q2, q3, q4, skeletonIdx, fleshIdx, qixueIdx,
    }
    if (token) {
      testProgressAPI.save('body', 'in_progress', snapshot).catch(() => { /* 网络失败就先不管，下次答题会再存一次 */ })
    } else {
      localStorage.setItem('aiffd_body_progress', JSON.stringify(snapshot))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, skeletonIdx, fleshIdx, qixueIdx, method, bust, waist, hip, heightRange, boneScale,
      boneRoundness, boneWidth, shoulderShape, waistType, limbLength, handFootSize, bodyShape,
      hipProtrude, chestProtrude, fleshTexture, q1, q2, q3, q4, resumeChoice, token])

  // 把存档快照里的所有字段恢复回各自的 state
  const applySnapshot = (s: BodySnapshot) => {
    setMethod((s.method as 'manual' | 'ai' | '') ?? ''); setBust(s.bust ?? ''); setWaist(s.waist ?? ''); setHip(s.hip ?? '')
    setHeightRange(s.heightRange ?? ''); setBoneScale(s.boneScale ?? '')
    setBoneRoundness(s.boneRoundness ?? ''); setBoneWidth(s.boneWidth ?? '')
    setShoulderShape(s.shoulderShape ?? []); setWaistType(s.waistType ?? [])
    setLimbLength(s.limbLength ?? ''); setHandFootSize(s.handFootSize ?? '')
    setBodyShape(s.bodyShape ?? [])
    setHipProtrude(s.hipProtrude ?? []); setChestProtrude(s.chestProtrude ?? []); setFleshTexture(s.fleshTexture ?? [])
    setQ1(s.q1 ?? ''); setQ2(s.q2 ?? ''); setQ3(s.q3 ?? ''); setQ4(s.q4 ?? '')
    setSkeletonIdx(s.skeletonIdx ?? 0); setFleshIdx(s.fleshIdx ?? 0); setQixueIdx(s.qixueIdx ?? 0)
  }

  // "继续测试"：从存档里把所有答案和当前所在题目位置恢复回来
  const restoreProgress = () => {
    try {
      // 优先用数据库存档；只有查不到（remoteSnapshot 为空，包括查询失败退回本机的情况）才读本机 localStorage
      if (remoteSnapshot) {
        applySnapshot(remoteSnapshot); setPhase(remoteSnapshot.phase ?? 'skeleton')
      } else {
        const raw = localStorage.getItem('aiffd_body_progress')
        if (raw) { const s = JSON.parse(raw); applySnapshot(s); setPhase(s.phase ?? 'skeleton') }
      }
    } catch { /* 存档损坏就当没有，走重新测试 */ }
    setResumeChoice('none')
  }

  // "重新测试"：清空存档和已完成结果，从头开始
  const discardAndRestart = () => {
    if (token) {
      testProgressAPI.clear('body').catch(() => { /* 清不掉也不阻塞，反正下次答题会用新数据覆盖 */ })
    } else {
      localStorage.removeItem('aiffd_body_progress')
      localStorage.removeItem('aiffd_body_result')
      localStorage.removeItem('aiffd_qixue_result')
    }
    setResumeChoice('none')
  }

  // "查看结果"（已完成过测试时）：把存好的答案重新组装成报告页需要的形状，直接跳到报告页
  const loadCompletedResult = () => {
    try {
      // 同样优先用数据库存档，查不到再退回本机 localStorage
      if (remoteSnapshot) {
        setResult(buildResultFromSnapshot(remoteSnapshot)); setPhase('report')
      } else {
        const bodyRaw = localStorage.getItem('aiffd_body_result')
        if (bodyRaw) {
          const b = JSON.parse(bodyRaw)
          const qixueRaw = localStorage.getItem('aiffd_qixue_result')
          const q = qixueRaw ? JSON.parse(qixueRaw) : null
          const qiXueState = q?.qiXueState ?? '阴阳和谐'
          const qiXueInfo = FAMILY_INFO[qiXueState] || FAMILY_INFO['阴阳和谐']
          const boneArr: string[] = Array.isArray(b.boneScale) ? b.boneScale : []
          setResult({
            heightRange: b.height ?? '', boneScale: boneArr[0] ?? '', boneShape: boneArr.slice(1),
            shoulderShape: b.shoulder ?? [], waistType: b.waist ?? [],
            limbLength: b.limb ?? '', handFootSize: b.handFoot ?? '', bodyShape: b.bodyShape ?? [],
            hipProtrude: b.hip ?? [], chestProtrude: b.chest ?? [], fleshTexture: b.fleshTexture ?? [],
            qiXueState, qiXueFamily: qiXueInfo.familyName, qiXueElement: qiXueInfo.element,
          })
          setPhase('report')
        }
      }
    } catch { /* 存档损坏就当没有 */ }
    setResumeChoice('none')
  }

  // "跳过"：不处理这份存档/结果，直接离开去测试中心选别的测试
  const skipToOtherTests = () => {
    navigate('/onboarding')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      {/* 续测提醒弹窗：检测到本机存过体型测试的存档时显示 */}
      {resumeChoice !== 'none' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,15,13,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }}>
          <div style={{ background: '#faf9f7', borderRadius: '10px', padding: '32px', maxWidth: '420px', width: '100%' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '10px' }}>
              {resumeChoice === 'inprogress' ? '发现未完成的体型测试' : '你已经完成过体型测试'}
            </p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h1, fontWeight: 400, margin: '0 0 12px' }}>
              {resumeChoice === 'inprogress' ? '要继续上次的进度吗？' : '要重新测一次吗？'}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, marginBottom: '24px' }}>
              {resumeChoice === 'inprogress'
                ? '本设备上保存了一份还没做完的记录，可以选择继续、重新开始，或者先去做别的测试。'
                : '本设备上已经保存了一份完整的体型测试结果，可以直接查看，也可以重新测一次覆盖它。'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resumeChoice === 'inprogress' ? (
                <button onClick={restoreProgress} style={btnGold}>继续测试</button>
              ) : (
                <button onClick={loadCompletedResult} style={btnGold}>查看上次结果</button>
              )}
              <button onClick={discardAndRestart} style={btnOutline}>重新测试</button>
              <button onClick={skipToOtherTests} style={{ ...btnOutline, border: 'none', color: C.muted }}>跳过，去做别的测试 →</button>
            </div>
          </div>
        </div>
      )}

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
                  setHeightRange('165-170'); setBoneScale('M'); setBoneRoundness('匀'); setBoneWidth('匀'); setShoulderShape(['圆', '溜'])
                  setWaistType(['匀']); setLimbLength('适中'); setHandFootSize('适中'); setBodyShape(['H型'])
                  setHipProtrude(['适中']); setChestProtrude(['适中']); setFleshTexture(['适中'])
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
                    if (bodyShape.length === 0) setBodyShape([whr > 0.88 ? 'H型' : bustN - hipN > 3 ? 'V型' : hipN - bustN > 5 ? 'A型' : 'X型'])
                    if (hipProtrude.length === 0) setHipProtrude([hipN - bustN > 5 ? '凸' : '扁平'])
                    if (chestProtrude.length === 0) setChestProtrude([bustN - hipN > 3 ? '凸' : '扁平'])
                    if (fleshTexture.length === 0) setFleshTexture([bustWaistDiff > 20 ? '软肉' : '紧实'])
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

        {/* ── Step 2: 骨架测试（9题）── */}
        {phase === 'skeleton' && (() => {
          // 索引映射：0身高 1骨架大小(图片) 2骨点明显程度 3肩部横向展开感 4肩形(多选) 5腰型(多选) 6四肢长度 7手脚大小 8体型(多选，特殊)
          // 2026-08-27：原"骨架形状多选(圆/角/匀/宽/窄)"拆成 2 和 3 这两道单选子题，分别对应圆润↔有棱角、偏窄↔偏宽两条轴
          const textQuestions: Record<number, { title: string; value: string; set: (v: string) => void; options: { id: string; label: string; sub?: string }[] }> = {
            0: { title: '你的身高区间？', value: heightRange, set: setHeightRange, options: [
              { id: '<155', label: '155cm 以下' },
              { id: '155-160', label: '155cm - 160cm' },
              { id: '160-165', label: '160cm - 165cm' },
              { id: '165-170', label: '165cm - 170cm' },
              { id: '>170', label: '170cm 以上' },
            ]},
            2: { title: '你的手腕和关节骨感更接近哪一种？', value: boneRoundness, set: setBoneRoundness, options: [
              { id: '圆', label: '骨点较弱', sub: '手腕和关节轮廓柔和，骨点不明显' },
              { id: '匀', label: '骨点适中', sub: '能看到一定骨骼轮廓，但不会特别突出' },
              { id: '角', label: '骨点明显', sub: '手腕、脚踝或关节骨点清楚，结构感较强' },
            ]},
            3: { title: '你的肩部横向展开感更接近哪一种？', value: boneWidth, set: setBoneWidth, options: [
              { id: '窄', label: '偏窄', sub: '肩部收窄，横向存在感较弱' },
              { id: '匀', label: '适中', sub: '肩宽与整体比例协调，不宽不窄' },
              { id: '宽', label: '偏宽', sub: '肩部明显展开，横向存在感较强' },
            ]},
            6: { title: '你的四肢长度？', value: limbLength, set: setLimbLength, options: [
              { id: '偏短', label: '偏短' }, { id: '适中', label: '适中' }, { id: '偏长', label: '偏长' },
            ]},
            7: { title: '你的手脚大小？', value: handFootSize, set: setHandFootSize, options: [
              { id: '娇小', label: '娇小' }, { id: '适中', label: '适中' }, { id: '偏大', label: '偏大' },
            ]},
          }

          // 肩型 / 腰型 表格里会出现组合词（如"圆+溜"），做成多选：可以勾多个描述词
          const shoulderOptions = [
            { id: '圆', label: '圆', sub: '肩线圆润' },
            { id: '直', label: '直', sub: '肩线平直' },
            { id: '宽', label: '宽', sub: '肩宽度较宽' },
            { id: '匀', label: '匀', sub: '肩线匀称对称' },
            { id: '溜', label: '溜', sub: '肩部略向下斜（溜肩）' },
            { id: '方', label: '方', sub: '肩型方正，棱角分明' },
            { id: '尖', label: '尖', sub: '肩峰尖锐突出' },
          ]
          const waistOptions = [
            { id: '细', label: '细', sub: '腰部明显收细' },
            { id: '直', label: '直', sub: '腰线平直，收细不明显' },
            { id: '匀', label: '匀', sub: '腰身匀称适中' },
            { id: '宽', label: '宽', sub: '腰部偏宽' },
            { id: '长', label: '长', sub: '腰线偏长' },
            { id: '短', label: '短', sub: '腰线偏短' },
          ]
          const bodyShapeOptions = [
            { id: 'H型', label: 'H 型', sub: '肩宽≈髋宽，腰部不明显，整体较方正' },
            { id: 'X型', label: 'X 型', sub: '肩宽≈髋宽，腰部明显收细，沙漏型轮廓' },
            { id: 'A型', label: 'A 型', sub: '肩窄髋宽，重心偏下，梨形轮廓' },
            { id: 'V型', label: 'V 型', sub: '肩宽髋窄，倒三角轮廓，上半身较壮' },
          ]

          const isBoneScaleQ = skeletonIdx === 1
          const isBoneRoundnessQ = skeletonIdx === 2
          const isShoulderQ = skeletonIdx === 4
          const isWaistQ = skeletonIdx === 5
          const isBodyShapeQ = skeletonIdx === 8
          const isComboQ = isShoulderQ || isWaistQ || isBodyShapeQ
          const isTextQ = skeletonIdx in textQuestions

          const selectAndAdvance = (set: (v: string) => void, val: string) => {
            set(val)
            setTimeout(goNextSkeleton, AUTO_ADVANCE_DELAY)
          }

          // 多选题的勾选切换（肩型/腰型/体格通用）
          const toggle = (arr: string[], set: (v: string[]) => void, val: string) => {
            set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
          }

          const boneScaleOptions = [
            { id: 'S', img: '/bone-small-2.png' },
            { id: 'M', img: '/bone-medium-2.png' },
            { id: 'L', img: '/bone-large-2.png' },
          ]

          const comboTitle = isShoulderQ ? '你的肩形接近哪些描述？（可多选）'
            : isWaistQ ? '你的腰型接近哪些描述？（可多选）'
            : '你的体型（骨骼轮廓）接近哪些？（可多选）'

          // 当前多选题对应的选项列表 + 已选值 + 更新函数（合并渲染逻辑，避免 3 段重复 JSX）
          const comboConfig = isShoulderQ ? { options: shoulderOptions, value: shoulderShape, set: setShoulderShape }
            : isWaistQ ? { options: waistOptions, value: waistType, set: setWaistType }
            : { options: bodyShapeOptions, value: bodyShape, set: setBodyShape }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>
                  STEP 01 · 骨架测试 · {skeletonIdx + 1} / 9
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>
                  Q{currentQuestionNumber} · {isComboQ ? comboTitle : isBoneScaleQ ? '你的骨架大小更接近哪种？' : textQuestions[skeletonIdx].title}
                </h2>
                {isBoneRoundnessQ && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '10px', lineHeight: 1.7 }}>
                    观察手腕、脚踝、肩峰、膝盖等位置的骨点是否明显
                  </p>
                )}
              </div>

              {isBoneRoundnessQ && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <img
                    src="/joint-prominence.png"
                    alt="骨点观察示意图：肩峰、手腕、膝盖、脚踝"
                    style={{ height: '400px', width: 'auto', maxWidth: '320px', flexShrink: 0, objectFit: 'contain', display: 'block', borderRadius: '8px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    {textQuestions[skeletonIdx].options.map((o, i) => (
                      <OptionCard key={o.id} label={`${letterOf(i)} · ${o.label}`} sub={o.sub}
                        active={textQuestions[skeletonIdx].value === o.id}
                        onClick={() => selectAndAdvance(textQuestions[skeletonIdx].set, o.id)} />
                    ))}
                  </div>
                </div>
              )}

              {isBoneScaleQ && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {boneScaleOptions.map((o, i) => (
                    <button key={o.id} onClick={() => selectAndAdvance(setBoneScale, o.id)} style={{
                      border: `2px solid ${boneScale === o.id ? C.gold : C.border}`,
                      borderRadius: '8px', padding: 0, cursor: 'pointer', overflow: 'hidden',
                      background: boneScale === o.id ? '#fdf8ee' : '#fff', transition: 'all 0.2s',
                      position: 'relative',
                    }}>
                      <span style={{
                        position: 'absolute', top: '8px', left: '8px', width: '22px', height: '22px', borderRadius: '50%',
                        background: boneScale === o.id ? C.gold : 'rgba(0,0,0,0.5)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Inter, sans-serif', fontSize: '12px',
                      }}>{letterOf(i)}</span>
                      <img src={o.img} alt={o.id} style={{ width: '100%', height: 'auto', display: 'block' }} />
                    </button>
                  ))}
                </div>
              )}

              {!isBoneScaleQ && !isBoneRoundnessQ && isTextQ && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {textQuestions[skeletonIdx].options.map((o, i) => (
                    <OptionCard key={o.id} label={`${letterOf(i)} · ${o.label}`} sub={o.sub}
                      active={textQuestions[skeletonIdx].value === o.id}
                      onClick={() => selectAndAdvance(textQuestions[skeletonIdx].set, o.id)} />
                  ))}
                </div>
              )}

              {isComboQ && !isBodyShapeQ && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {comboConfig.options.map((o, i) => (
                    <MultiOptionCard key={o.id} label={`${letterOf(i)} · ${o.label}`} sub={o.sub}
                      active={comboConfig.value.includes(o.id)}
                      onClick={() => toggle(comboConfig.value, comboConfig.set, o.id)} />
                  ))}
                </div>
              )}

              {isBodyShapeQ && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bodyShapeOptions.map((o, i) => (
                      <MultiOptionCard key={o.id} label={`${letterOf(i)} · ${o.label}`} sub={o.sub}
                        active={bodyShape.includes(o.id)}
                        onClick={() => {
                          toggle(bodyShape, setBodyShape, o.id)
                          setShowXTrap(!bodyShape.includes(o.id) && o.id === 'X型' ? true : bodyShape.filter(v => v !== o.id).includes('X型'))
                        }} />
                    ))}
                  </div>
                  {showXTrap && (
                    <div style={{ background: '#fdf8ee', border: `1px solid ${C.gold}`, borderRadius: '8px', padding: '16px 20px', marginTop: '16px' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px', marginBottom: '8px' }}>X 型陷阱检测</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, margin: 0 }}>
                        很多「X型」其实是H型骨骼+内衣塑型/脂肪转移的假象。<br />
                        <strong>验证方法：</strong>用手摸肋骨最下端角度——<br />
                        · 角度 &gt; 90°（向外张开）→ H型骨架<br />
                        · 角度 &lt; 90°（向内收）→ 真X型
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={goBackSkeleton} style={btnOutline}>← 返回</button>
                {isComboQ && (
                  <button
                    onClick={goNextSkeleton}
                    disabled={comboConfig.value.length === 0}
                    style={comboConfig.value.length > 0
                      ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                    继续
                  </button>
                )}
              </div>
            </div>
          )
        })()}

        {/* ── Step 3: 皮肉测试（3题，均为多选组合词）── */}
        {phase === 'flesh' && (() => {
          const questions = [
            { title: '你的臀部接近哪些描述？（可多选）', value: hipProtrude, set: setHipProtrude, options: [
              { id: '凸', label: '凸', sub: '臀部突出，有明显弧度' },
              { id: '扁平', label: '扁平', sub: '臀部平坦，弧度不明显' },
              { id: '适中', label: '适中', sub: '不凸不平，适中' },
              { id: '有肉', label: '有肉', sub: '带肉感' },
            ]},
            { title: '你的胸部接近哪些描述？（可多选）', value: chestProtrude, set: setChestProtrude, options: [
              { id: '凸', label: '凸', sub: '胸部突出，有明显弧度' },
              { id: '扁平', label: '扁平', sub: '胸部平坦，弧度不明显' },
              { id: '适中', label: '适中', sub: '不凸不平，适中' },
              { id: '大胸', label: '大胸', sub: '胸围偏大' },
              { id: '小胸', label: '小胸', sub: '胸围偏小' },
            ]},
            { title: '你的皮肉质地接近哪些描述？（可多选）', value: fleshTexture, set: setFleshTexture, options: [
              { id: '软肉', label: '软肉', sub: '触感柔软，有肉感' },
              { id: '紧实', label: '紧实', sub: '触感紧致，线条清楚' },
              { id: '健壮', label: '健壮', sub: '骨肉结实，力量感强' },
              { id: '松肉', label: '松肉', sub: '皮肉松弛' },
              { id: '适中', label: '适中', sub: '不紧不松' },
              { id: '肌肉', label: '肌肉', sub: '肌肉线条明显' },
            ]},
          ]
          const current = questions[fleshIdx]

          const toggle = (arr: string[], set: (v: string[]) => void, val: string) => {
            set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val])
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>
                  STEP 02 · 皮肉测试 · {fleshIdx + 1} / 3
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>
                  Q{currentQuestionNumber} · {current.title}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {current.options.map((o, i) => (
                  <MultiOptionCard key={o.id} label={`${letterOf(i)} · ${o.label}`} sub={o.sub} active={current.value.includes(o.id)}
                    onClick={() => toggle(current.value, current.set, o.id)} />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={goBackFlesh} style={btnOutline}>← 返回</button>
                <button
                  onClick={goNextFlesh}
                  disabled={current.value.length === 0}
                  style={current.value.length > 0
                    ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                  继续
                </button>
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
            { id: '阴少阳多', text: idx === 0 ? '自然松弛，随性洒脱' : idx === 1 ? '自然松弛，不刻意雕琢' : idx === 2 ? '舒展自然，不做作' : '随性、休闲' },
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
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>
                  Q{currentQuestionNumber} · {titles[idx]}
                </h2>
                {idx === 0 && (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginTop: '8px' }}>
                    气血态决定你的 13 型所属大类家族（浪漫 / 少年 / 经典 / 自然 / 戏剧）
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {options.map((o, i) => (
                  <button key={o.id} onClick={() => selectAndAdvance(o.id)} style={{
                    border: `1px solid ${values[idx] === o.id ? C.gold : C.border}`,
                    background: values[idx] === o.id ? '#fdf8ee' : '#fff',
                    padding: '14px 18px', textAlign: 'left', cursor: 'pointer', borderRadius: '6px',
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: values[idx] === o.id ? C.h2 : C.body }}>{letterOf(i)} · {o.text}</span>
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
