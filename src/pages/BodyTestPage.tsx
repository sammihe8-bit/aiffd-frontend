import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { testProgressAPI } from '../utils/api'
import { userScopedKey } from '../utils/userStorage'
import ThreeStageProgress from '../components/ThreeStageProgress'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

// ── 流程
// AI 路径:    method → data(AI拍照) → skeleton(AI预填) → flesh → qixue → 完成后直接跳风格测试面部测试
// 手动路径:   method → data(三围输入) → skeleton → flesh → qixue → 完成后直接跳风格测试面部测试
// 2026-08-31 调整：不再单独展示体型档案报告页，测完直接进风格测试；所有结果统一在 ProfilePage 展示，也不再用体型轮廓图。
type Phase = 'method' | 'data' | 'skeleton' | 'flesh' | 'qixue'


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
  shoulderShape: string[]; waistType: string[]; waistLength: string; limbLength: string; handFootSize: string
  bodyShape: string[]; hipProtrude: string[]; chestProtrude: string[]; fleshTexture: string[]
  q1: string; q2: string; q3: string; q4: string
  skeletonIdx: number; fleshIdx: number; qixueIdx: number
  waist_ui_label?: string[]; body_shape_hint?: string[] // 2026-08-28 新增，见 WAIST_BODYSHAPE_HINT 注释
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

// 腰型选项 → 体格倾向提示码（2026-08-28 新增，2026-08-28 再调整：短已挪到 Q7 纵向比例，这里只留 Q6 的 4 个词）
// 用户界面只显示"细/匀/直/宽"，这套 X/V/H/O 编码完全不对用户展示，
// 只在后台数据里额外附加一份 body_shape_hint，作为体格(H/X/A/V)判定的辅助信号，
// 和用户在 Q9 体格题里的直接选择一起合并进打分引擎的 bodyShape 维度
const WAIST_BODYSHAPE_HINT: Record<string, string> = { 细: 'X', 匀: 'V', 直: 'H', 宽: 'O' }

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

// ── 主页面
export default function BodyTestPage() {
  const navigate = useNavigate()
  const { token, user } = useAuth() // 登录用户走数据库存档；token 为空则是访客，走 localStorage
  const [phase, setPhase] = useState<Phase>('method')
  const [method, setMethod] = useState<'manual' | 'ai' | ''>('')

  // 2026-08-27 新增：进度存档与续测提醒。
  // 已登录用户：初始不弹窗，等下面的 useEffect 真正查到数据库结果后再决定弹不弹（避免被本机残留的旧 localStorage 记录误导）
  // 访客（没有 token）：直接用 localStorage 判断，本来就没有"查数据库"这一步可等
  const [resumeChoice, setResumeChoice] = useState<'none' | 'completed' | 'inprogress'>(() => {
    if (typeof window === 'undefined') return 'none'
    if (token) return 'none'
    if (localStorage.getItem(userScopedKey('aiffd_body_progress', user))) return 'inprogress'
    if (localStorage.getItem(userScopedKey('aiffd_body_result', user))) return 'completed'
    return 'none'
  })
  // 已登录用户的存档内容从数据库读回来后放这里；restoreProgress / loadCompletedResult 会优先用这个，而不是 localStorage
  const [remoteSnapshot, setRemoteSnapshot] = useState<BodySnapshot | null>(null)

  // 本机 localStorage 里是否有残留记录（可能是登录前、以访客身份测过一半留下的），供数据库查询失败时兜底用
  const checkLocalFallback = () => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(userScopedKey('aiffd_body_progress', user))) setResumeChoice('inprogress')
    else if (localStorage.getItem(userScopedKey('aiffd_body_result', user))) setResumeChoice('completed')
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
  // 2026-08-28 腰型拆成两道题：Q6 横向轮廓(细/匀/直/宽，多选) + Q7 纵向比例(短/适中/长，单选)
  // 两边答案最后合并成一个数组喂给打分引擎的 waist 维度，跟原表格"细+匀+长"这类组合完全对应
  const [waistType, setWaistType] = useState<string[]>([])
  const [waistLength, setWaistLength] = useState('') // 短 / 适中(不贡献任何词) / 长
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
    // 腰型答案派生出的体格倾向提示（X/V/H/O），只在后台数据里出现，界面从不展示
    const bodyShapeHint = waistType.map(w => WAIST_BODYSHAPE_HINT[w]).filter(Boolean)
    // Q6(横向轮廓) + Q7(纵向比例) 合并成最终喂给引擎的腰型组合词，"适中"不贡献任何词
    const waistCombined = waistLength === '适中' ? waistType : [...waistType, ...(waistLength ? [waistLength] : [])]

    // 供打分引擎使用的原始维度（键名对应 src/data/styleMatrix.ts 里的 DIMENSIONS[].id）
    // 骨架大小是 combo 类型，把"尺寸(S/M/L)"和"形状(圆/角/匀/宽/窄)"两屏答案合并成一个数组
    // waist 数组是 Q6+Q7 的合并结果；bodyShape 数组额外合并了腰型派生出的体格提示码
    // 这两个 key 现在带用户 ID 前缀，登录用户之间互不干扰；访客统一落在 'guest' 桶里
    localStorage.setItem(userScopedKey('aiffd_body_result', user), JSON.stringify({
      boneScale: [boneScale, ...boneShape], height: heightRange, shoulder: shoulderShape,
      waist: waistCombined,
      limb: limbLength, handFoot: handFootSize, bodyShape: [...bodyShape, ...bodyShapeHint.map(h => `${h}型`)],
      fleshTexture, hip: hipProtrude, chest: chestProtrude,
      waist_ui_label: waistCombined, body_shape_hint: bodyShapeHint, // 额外保留两层数据，供后台/分析使用
    }))
    // 气血 4 题结果单独存放，供色彩测试计算五行主辅百分比使用，不参与风格测试打分
    localStorage.setItem(userScopedKey('aiffd_qixue_result', user), JSON.stringify({ qiXueState, q1, q2, q3, q4 }))

    // 续测存档：标记为已完成（phase 字段这里借用 'qixue' 表示"最后一步已完成"，
    // 完成态不再依赖这个字段做展示，只是满足存档结构需要）
    const snapshot: BodySnapshot = {
      phase: 'qixue', method, bust, waist, hip,
      heightRange, boneScale, boneRoundness, boneWidth, shoulderShape, waistType, waistLength,
      limbLength, handFootSize, bodyShape, hipProtrude, chestProtrude, fleshTexture,
      q1, q2, q3, q4, skeletonIdx, fleshIdx, qixueIdx,
      waist_ui_label: waistType, body_shape_hint: bodyShapeHint,
    }
    if (token) {
      testProgressAPI.save('body', 'completed', snapshot).catch(() => {})
    } else {
      localStorage.removeItem(userScopedKey('aiffd_body_progress', user)) // 测试已完整做完，清掉中途存档
    }
    // 2026-08-31 调整：不再展示单独的体型档案报告页，测完直接进风格测试的面部测试，
    // 结果统一在 ProfilePage 里查看
    navigate('/test/style')
  }

  // 骨架(10) + 皮肉(3) + 气血态(4) = 17 题，跨环节统一计数，方便一屏一题的进度展示
  const TOTAL_QUESTIONS = 17
  const currentQuestionNumber =
    phase === 'skeleton' ? skeletonIdx + 1 :
    phase === 'flesh' ? 10 + fleshIdx + 1 :
    phase === 'qixue' ? 10 + 3 + qixueIdx + 1 : 0

  // 选完一题后延迟自动跳下一题，让用户先看到选中态再切换
  const AUTO_ADVANCE_DELAY = 260
  const goNextSkeleton = () => {
    if (skeletonIdx < 9) setSkeletonIdx(skeletonIdx + 1)
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
    else { setPhase('skeleton'); setSkeletonIdx(9) }
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
    if (phase === 'method') return
    const snapshot: BodySnapshot = {
      phase, method, bust, waist, hip,
      heightRange, boneScale, boneRoundness, boneWidth, shoulderShape, waistType, waistLength,
      limbLength, handFootSize, bodyShape, hipProtrude, chestProtrude, fleshTexture,
      q1, q2, q3, q4, skeletonIdx, fleshIdx, qixueIdx,
    }
    if (token) {
      testProgressAPI.save('body', 'in_progress', snapshot).catch(() => { /* 网络失败就先不管，下次答题会再存一次 */ })
    } else {
      localStorage.setItem(userScopedKey('aiffd_body_progress', user), JSON.stringify(snapshot))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, skeletonIdx, fleshIdx, qixueIdx, method, bust, waist, hip, heightRange, boneScale,
      boneRoundness, boneWidth, shoulderShape, waistType, waistLength, limbLength, handFootSize, bodyShape,
      hipProtrude, chestProtrude, fleshTexture, q1, q2, q3, q4, resumeChoice, token])

  // 把存档快照里的所有字段恢复回各自的 state
  const applySnapshot = (s: BodySnapshot) => {
    setMethod((s.method as 'manual' | 'ai' | '') ?? ''); setBust(s.bust ?? ''); setWaist(s.waist ?? ''); setHip(s.hip ?? '')
    setHeightRange(s.heightRange ?? ''); setBoneScale(s.boneScale ?? '')
    setBoneRoundness(s.boneRoundness ?? ''); setBoneWidth(s.boneWidth ?? '')
    setShoulderShape(s.shoulderShape ?? []); setWaistType(s.waistType ?? []); setWaistLength(s.waistLength ?? '')
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
        const raw = localStorage.getItem(userScopedKey('aiffd_body_progress', user))
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
      localStorage.removeItem(userScopedKey('aiffd_body_progress', user))
      localStorage.removeItem(userScopedKey('aiffd_body_result', user))
      localStorage.removeItem(userScopedKey('aiffd_qixue_result', user))
    }
    setResumeChoice('none')
  }

  // "查看结果"（已完成过测试时）：结果统一在个人档案页看，这里直接跳转过去
  const loadCompletedResult = () => {
    setResumeChoice('none')
    navigate('/profile')
  }

  // "跳过"：不处理这份存档/结果，直接离开去测试中心选别的测试
  const skipToOtherTests = () => {
    navigate('/onboarding')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7' }}>
      <ThreeStageProgress
        activeStage="form"
        formDone={!!localStorage.getItem(userScopedKey('aiffd_style_result', user))}
        colorDone={!!localStorage.getItem(userScopedKey('aiffd_25season', user))}
        preferenceDone={false}
        currentLabel={
          phase === 'skeleton' ? '骨架测试' : phase === 'flesh' ? '皮肉测试' : phase === 'qixue' ? '气血态' : undefined
        }
        currentNum={(phase === 'skeleton' || phase === 'flesh' || phase === 'qixue') ? currentQuestionNumber : undefined}
        currentTotal={(phase === 'skeleton' || phase === 'flesh' || phase === 'qixue') ? TOTAL_QUESTIONS : undefined}
      />
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
            3: { title: '你的肩线走向更接近哪一种？', value: boneWidth, set: setBoneWidth, options: [
              { id: '溜', label: '溜肩', sub: '从颈部向肩端下降明显' },
              { id: '匀', label: '自然肩', sub: '下降程度适中' },
              { id: '直', label: '平直肩', sub: '肩线较水平' },
            ]},
            7: { title: '你的四肢长度？', value: limbLength, set: setLimbLength, options: [
              { id: '偏短', label: '偏短' }, { id: '适中', label: '适中' }, { id: '偏长', label: '偏长' },
            ]},
            8: { title: '你的手脚大小？', value: handFootSize, set: setHandFootSize, options: [
              { id: '娇小', label: '娇小' }, { id: '适中', label: '适中' }, { id: '偏大', label: '偏大' },
            ]},
          }

          // 2026-09-03 换上真实照片素材（人像特写，不是线稿插画）。这三张图原始比例完全不同
          // （1.25 / 1.5 / 1），照片类素材用"裁切铺满"（cover）+ 居中定位，而不是像其他插画题那样
          // "完整显示不裁切"（contain）——这样三张图里锁骨/肩膀的呈现大小才能保持一致
          const shoulderOptions = [
            { id: 'rounded', label: '圆润', sub: '肩线外轮廓柔和，没有明显棱角', img: '/shoulder-rounded.png' },
            { id: 'blunt_angular', label: '方正', sub: '肩型偏方正、钝角，有力量感', img: '/shoulder-square.png' },
            { id: 'sharp_angular', label: '尖锐 / 骨点明显', sub: '肩峰锐角、骨点突出，线条窄削', img: '/shoulder-sharp.png' },
          ]
          const waistOptions: { id: string; label: string; sub: string; img: string }[] = [
            { id: '细', label: '细', sub: '腰最清楚，曲线感明显', img: '/waist-slim2.png' },
            { id: '匀', label: '匀', sub: '有一定腰线，整体过渡均衡', img: '/waist-evenly.png' },
            { id: '直', label: '直', sub: '整体直上直下，腰线不明显', img: '/waist-straight.png' },
            { id: '宽', label: '宽', sub: '中段量感明显，腰线较弱', img: '/waist-wide.png' },
          ]

          const waistLengthOptions: { id: string; label: string; sub: string; img: string }[] = [
            { id: '短', label: '短', sub: '腰段偏短，下半身量感更明显', img: '/waist-short.png' },
            { id: '适中', label: '适中', sub: '腰段长度适中，比例均衡', img: '/waist-medium.png' },
            { id: '长', label: '长', sub: '腰段偏长，上半身占比更明显', img: '/waist-long.png' },
          ]
          const bodyShapeOptions = [
            { id: 'H型', label: 'H 型', sub: '肩宽≈髋宽，腰部不明显，整体较方正' },
            { id: 'X型', label: 'X 型', sub: '肩宽≈髋宽，腰部明显收细，沙漏型轮廓' },
            { id: 'A型', label: 'A 型', sub: '肩窄髋宽，重心偏下，梨形轮廓' },
            { id: 'V型', label: 'V 型', sub: '肩宽髋窄，倒三角轮廓，上半身较壮' },
            { id: 'O型', label: 'O 型', sub: '中段（腰腹）更圆润，肩髋差异不明显，苹果型轮廓' },
            { id: '不确定', label: '不确定', sub: '分不清楚自己更接近以上哪一种' },
          ]

          const isBoneScaleQ = skeletonIdx === 1
          const isBoneRoundnessQ = skeletonIdx === 2
          const isBoneWidthQ = skeletonIdx === 3
          const isShoulderQ = skeletonIdx === 4
          const isWaistQ = skeletonIdx === 5
          const isWaistLengthQ = skeletonIdx === 6
          const isBodyShapeQ = skeletonIdx === 9
          const isTextQ = skeletonIdx in textQuestions

          const selectAndAdvance = (set: (v: string) => void, val: string) => {
            set(val)
            setTimeout(goNextSkeleton, AUTO_ADVANCE_DELAY)
          }

          // 骨架区块目前所有题目都已经改成单选（肩型/腰型/体格都不再是多选），
          // 皮肉测试区块仍然是多选，那边单独定义了自己的 toggle 函数（见下方 flesh 区块）

          const boneScaleOptions = [
            { id: 'S', label: '小骨架', img: '/bone_small.png' },
            { id: 'M', label: '中骨架', img: '/bone_medium.png' },
            { id: 'L', label: '大骨架', img: '/bone_large.png' },
          ]

          // 肩线走向配图：文件名与 public/ 目录下实际上传的文件一致
          // （之前写的 Shoulder_luo.png / Shoulder_ziran.png / shoulder_pingzhi.png 跟实际文件名不匹配，
          // 导致图片一直裂开——2026-09-02 修正为实际文件名，并补上文字标签，不再只靠图片猜）
          const shoulderSlopeOptions = [
            { id: '溜', label: '溜肩', img: '/shoulder_sloped.png' },
            { id: '匀', label: '自然肩', img: '/shoulder_natural.png' },
            { id: '直', label: '平直肩', img: '/shoulder_straight.png' },
          ]

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '8px' }}>
                  STEP 01 · 骨架测试 · {skeletonIdx + 1} / 10
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', color: C.h2, fontWeight: 400, margin: 0 }}>
                  Q{currentQuestionNumber} · {isBoneScaleQ ? '你的骨架大小更接近哪种？' : isShoulderQ ? '你的肩峰形态更接近哪一种？' : isWaistQ ? '你的腰部横向轮廓更接近哪一种？' : isWaistLengthQ ? '你的腰部纵向比例更接近哪一种？' : isBodyShapeQ ? '你的肩、腰、胯整体关系更接近？' : textQuestions[skeletonIdx].title}
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
                    style={{ height: '400px', width: 'auto', maxWidth: '320px', flexShrink: 0, objectFit: 'contain', display: 'block', borderRadius: '8px', border: `1px solid ${C.border}` }}
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
                      border: `1px solid ${boneScale === o.id ? C.gold : C.border}`, outline: 'none',
                      boxShadow: boneScale === o.id ? `0 0 0 2px ${C.gold}` : 'none',
                      borderRadius: '8px', padding: 0, cursor: 'pointer', overflow: 'hidden',
                      background: '#fff', transition: 'all 0.2s',
                    }}>
                      <img src={o.img} alt={o.label} style={{
                        width: '100%', height: '420px', objectFit: 'contain', display: 'block', background: '#f8f4f1',
                      }} />
                      <p style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '13px', margin: 0, padding: '12px 0',
                        textAlign: 'center' as const, color: boneScale === o.id ? C.gold : C.h2,
                      }}>{letterOf(i)} · {o.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {isBoneWidthQ && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {shoulderSlopeOptions.map((o, i) => (
                    <button key={o.id} onClick={() => selectAndAdvance(setBoneWidth, o.id)} style={{
                      border: `1px solid ${boneWidth === o.id ? C.gold : C.border}`, outline: 'none',
                      boxShadow: boneWidth === o.id ? `0 0 0 2px ${C.gold}` : 'none',
                      borderRadius: '8px', padding: 0, cursor: 'pointer', overflow: 'hidden',
                      background: '#fff', transition: 'all 0.2s',
                    }}>
                      <img src={o.img} alt={o.label} style={{
                        width: '100%', height: '420px', objectFit: 'contain', display: 'block', background: '#f8f4f1',
                      }} />
                      <p style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '13px', margin: 0, padding: '12px 0',
                        textAlign: 'center' as const, color: boneWidth === o.id ? C.gold : C.h2,
                      }}>{letterOf(i)} · {o.label}</p>
                    </button>
                  ))}
                </div>
              )}

              {!isBoneScaleQ && !isBoneRoundnessQ && !isBoneWidthQ && isTextQ && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {textQuestions[skeletonIdx].options.map((o, i) => (
                    <OptionCard key={o.id} label={`${letterOf(i)} · ${o.label}`} sub={o.sub}
                      active={textQuestions[skeletonIdx].value === o.id}
                      onClick={() => selectAndAdvance(textQuestions[skeletonIdx].set, o.id)} />
                  ))}
                </div>
              )}

              {isShoulderQ && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {shoulderOptions.map((o, i) => {
                    const active = shoulderShape[0] === o.id
                    return (
                      <button key={o.id} onClick={() => selectAndAdvance((v) => setShoulderShape([v]), o.id)} style={{
                        border: `1px solid ${active ? C.gold : C.border}`, outline: 'none',
                        boxShadow: active ? `0 0 0 2px ${C.gold}` : 'none',
                        borderRadius: '8px', padding: 0, cursor: 'pointer', overflow: 'hidden',
                        background: '#fff', transition: 'all 0.2s',
                      }}>
                        <div style={{ height: '150px', overflow: 'hidden' }}>
                          <img src={o.img} alt={o.label} style={{
                            width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', display: 'block',
                          }} />
                        </div>
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '13px', margin: 0, padding: '10px 12px 2px',
                          textAlign: 'center' as const, color: active ? C.gold : C.h2,
                        }}>{letterOf(i)} · {o.label}</p>
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '12px', margin: 0, padding: '0 12px 12px',
                          textAlign: 'center' as const, color: C.muted, lineHeight: 1.5,
                        }}>{o.sub}</p>
                      </button>
                    )
                  })}
                </div>
              )}

              {isWaistQ && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
                  {waistOptions.map((o, i) => {
                    const active = waistType[0] === o.id
                    return (
                      <button key={o.id} onClick={() => selectAndAdvance((v) => setWaistType([v]), o.id)} style={{
                        border: `1px solid ${active ? C.gold : C.border}`, outline: 'none',
                        boxShadow: active ? `0 0 0 2px ${C.gold}` : 'none',
                        borderRadius: '8px', padding: 0, cursor: 'pointer', overflow: 'hidden',
                        background: '#fff', transition: 'all 0.2s',
                      }}>
                        <div style={{ height: '300px', overflow: 'hidden', background: '#f8f4f1' }}>
                          <img src={o.img} alt={o.label} style={{
                            width: '100%', height: '100%', objectFit: 'contain', display: 'block',
                          }} />
                        </div>
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '13px', margin: 0, padding: '10px 12px 2px',
                          textAlign: 'center' as const, color: active ? C.gold : C.h2,
                        }}>{letterOf(i)} · {o.label}</p>
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '12px', margin: 0, padding: '0 12px 12px',
                          textAlign: 'center' as const, color: C.muted, lineHeight: 1.5,
                        }}>{o.sub}</p>
                      </button>
                    )
                  })}
                </div>
              )}

              {isWaistLengthQ && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {waistLengthOptions.map((o, i) => {
                    const active = waistLength === o.id
                    return (
                      <button key={o.id} onClick={() => selectAndAdvance(setWaistLength, o.id)} style={{
                        border: `1px solid ${active ? C.gold : C.border}`, outline: 'none',
                        boxShadow: active ? `0 0 0 2px ${C.gold}` : 'none',
                        borderRadius: '8px', padding: 0, cursor: 'pointer', overflow: 'hidden',
                        background: '#fff', transition: 'all 0.2s',
                      }}>
                        <div style={{ height: '420px', overflow: 'hidden', background: '#f8f4f1' }}>
                          <img src={o.img} alt={o.label} style={{
                            width: '100%', height: '100%', objectFit: 'contain', display: 'block',
                          }} />
                        </div>
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '13px', margin: 0, padding: '10px 12px 2px',
                          textAlign: 'center' as const, color: active ? C.gold : C.h2,
                        }}>{letterOf(i)} · {o.label}</p>
                        <p style={{
                          fontFamily: 'Inter, sans-serif', fontSize: '12px', margin: 0, padding: '0 12px 12px',
                          textAlign: 'center' as const, color: C.muted, lineHeight: 1.5,
                        }}>{o.sub}</p>
                      </button>
                    )
                  })}
                </div>
              )}

              {isBodyShapeQ && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bodyShapeOptions.map((o, i) => (
                      <OptionCard key={o.id} label={`${letterOf(i)} · ${o.label}`} sub={o.sub}
                        active={bodyShape[0] === o.id}
                        onClick={() => {
                          setBodyShape([o.id])
                          setShowXTrap(o.id === 'X型')
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
                {isBodyShapeQ && (() => {
                  const currentValue = bodyShape
                  return (
                    <button
                      onClick={goNextSkeleton}
                      disabled={currentValue.length === 0}
                      style={currentValue.length > 0
                        ? { ...btnGold, flex: 1 } : { ...btnGold, flex: 1, background: '#e0e0e0', cursor: 'not-allowed' }}>
                      继续
                    </button>
                  )
                })()}
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
      </div>
    </div>
  )
}
