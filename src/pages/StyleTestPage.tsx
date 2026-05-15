import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ─── 设计系统 ────────────────────────────────────────────────
const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#faf9f7', card: '#ffffff', accent: '#fdf8ee',
}

// ─── 类型定义 ────────────────────────────────────────────────
type Phase =
  | 'intro'
  | 'basic'       // A 基础建档
  | 'body'        // B 体型快判
  | 'color'       // C 色彩快判
  | 'style'       // D 风格主测试
  | 'scenario'    // E 场景需求
  | 'report'      // 初始报告

interface BasicProfile {
  age: string
  height: string
  weight: string
  occupation: string
  painPoints: string[]
  aspirations: string[]
}

interface BodyQuick {
  bodyShape: string
  bodyLine: string
  boneScale: string
}

interface ColorQuick {
  experience: string[]
  colorGroup: string
}

interface StyleProfile {
  impression: string
  taboo: string
  attracted: string[]
  ideal: string
  silhouette: string
  fabric: string[]
  pattern: string
}

interface ScenarioProfile {
  scenes: string[]
  functions: string[]
  budget: string
  forbidden: string[]
}

// ─── 13风格判断逻辑 ──────────────────────────────────────────
type StyleType =
  | 'Romantic' | 'TheatricalRomantic'
  | 'SoftGamine' | 'Gamine' | 'FlamboyantGamine'
  | 'SoftClassic' | 'Classic' | 'DramaticClassic'
  | 'SoftNatural' | 'Natural' | 'FlamboyantNatural'
  | 'SoftDramatic' | 'Dramatic'

const STYLE_PROFILES: Record<StyleType, {
  name: string; nameEn: string; element: string
  keywords: string[]; desc: string
  bodyHint: string; colorHint: string
}> = {
  Romantic: {
    name: '浪漫型', nameEn: 'Romantic', element: '阴·水',
    keywords: ['柔软', '女人味', '圆润', '感官', '浪漫'],
    desc: '你天生拥有柔软、圆润的气质，贴身的曲线剪裁、柔软的面料、精致的细节是你最好的武器。过于硬朗或宽大的廓形会掩盖你的气质。',
    bodyHint: '适合收腰设计、柔软面料、曲线剪裁，避免直线型大廓形',
    colorHint: '适合柔和暖调、粉彩、蜜桃、玫瑰，避免过于强烈的高对比色',
  },
  TheatricalRomantic: {
    name: '戏剧浪漫型', nameEn: 'Theatrical Romantic', element: '阴·火',
    keywords: ['华丽', '戏剧感', '浪漫', '冲突', '精致'],
    desc: '你兼具浪漫的柔美与戏剧的冲击力，华丽、精致、有存在感的搭配最适合你。可以驾驭比纯浪漫型更强烈的颜色和更夸张的设计细节。',
    bodyHint: '适合戏剧性细节+柔软廓形，夸张的袖型、领口、华丽装饰',
    colorHint: '适合深宝石色、浓郁暖色、华丽印花，可驾驭高饱和',
  },
  SoftGamine: {
    name: '柔软少女型', nameEn: 'Soft Gamine', element: '阴阳·木',
    keywords: ['甜美', '小巧', '轻盈', '活泼', '可爱'],
    desc: '你拥有小巧轻盈的骨架，散发自然的甜美活泼气息。短款、轻盈面料、对比色搭配、甜美印花都是你的加分项。',
    bodyHint: '适合短款、紧凑比例、轻盈面料，避免过长款式',
    colorHint: '适合清亮暖色、粉彩、对比撞色，可尝试活泼印花',
  },
  Gamine: {
    name: '少年型', nameEn: 'Gamine', element: '阴阳·木',
    keywords: ['对比', '活力', '少年气', '个性', '跳跃'],
    desc: '你拥有独特的对比感——骨架纤细但气质有力量，精致却不柔弱。对比色、结构感细节、干净利落的剪裁是你的最佳选择。',
    bodyHint: '适合结构清晰的短款，上下对比穿法，避免柔软飘逸',
    colorHint: '适合高对比配色、活泼印花、清亮色，避免模糊柔和色',
  },
  FlamboyantGamine: {
    name: '戏剧少女型', nameEn: 'Flamboyant Gamine', element: '阴阳·火木',
    keywords: ['戏剧', '活力', '对比', '混搭', '张扬'],
    desc: '你是少女型中最有爆发力的类型，可以驾驭更夸张的对比、更戏剧的图案、更大胆的配色。混搭是你的天赋，不要委屈自己穿保守款。',
    bodyHint: '适合大胆混搭、夸张比例、戏剧性图案',
    colorHint: '适合高饱和、高对比、大印花，可尝试极端色彩组合',
  },
  SoftClassic: {
    name: '柔软经典型', nameEn: 'Soft Classic', element: '中性·土',
    keywords: ['柔和', '优雅', '平衡', '温润', '精致'],
    desc: '你天生拥有优雅平衡的气质，不需要极端就能显高级。柔和的色调、精致的做工、流畅的线条——这些让你最出彩。',
    bodyHint: '适合流畅剪裁、精致做工、中等收腰，避免夸张廓形',
    colorHint: '适合柔和中饱和色、粉彩、米色系，避免过于强烈的对比',
  },
  Classic: {
    name: '经典型·优雅', nameEn: 'Classic', element: '中性·金',
    keywords: ['经典', '对称', '精致', '永恒', '品位'],
    desc: '你是所有风格类型中最能驾驭经典款式的类型。对称设计、精良品质、不过时的基础款——这些让你散发真正的高级感。',
    bodyHint: '适合对称剪裁、经典廓形、精良品质，无需过多设计细节',
    colorHint: '适合经典色（黑白藏蓝米色）及中饱和稳定色',
  },
  DramaticClassic: {
    name: '戏剧经典型', nameEn: 'Dramatic Classic', element: '中性偏阳·金',
    keywords: ['力量', '清晰', '经典', '权威', '精准'],
    desc: '你兼具经典的优雅与戏剧的力量感，清晰的线条、有力量的廓形、精准的搭配——你不需要花哨，本身就有震慑力。',
    bodyHint: '适合清晰线条、挺括廓形、有力量感的结构设计',
    colorHint: '适合高对比经典色、深色主导配色，避免柔和模糊色调',
  },
  SoftNatural: {
    name: '柔软自然型', nameEn: 'Soft Natural', element: '中性偏阴·木',
    keywords: ['放松', '有机', '柔和', '舒适', '自在'],
    desc: '你的气质自然放松，不需要刻意就能显得亲切有味道。宽松舒适的款式、天然质感的面料、柔和的色调最适合你。',
    bodyHint: '适合宽松舒适、有机线条、天然面料，避免过于结构化',
    colorHint: '适合柔和大地色、低饱和暖色，避免高对比强色',
  },
  Natural: {
    name: '自然型·休闲', nameEn: 'Natural', element: '中性·木',
    keywords: ['随性', '质感', '不刻意', '松弛', '态度'],
    desc: '你最迷人的地方是不刻意——随性但有态度，简单但有质感。棉麻、格纹、工装、宽松廓形都是你的基本语言。',
    bodyHint: '适合宽松廓形、自然垂感、实用细节，避免过度精致',
    colorHint: '适合大地色、中性色、牛仔蓝，可驾驭部分暖色系',
  },
  FlamboyantNatural: {
    name: '戏剧自然型', nameEn: 'Flamboyant Natural', element: '中性偏阳·木火',
    keywords: ['大气', '松弛', '有力量', '自然', '戏剧'],
    desc: '你是自然型中存在感最强的类型，大气、松弛又有力量。大廓形、OVERSIZE、有结构的宽松款——你能撑起别人驾驭不了的体量。',
    bodyHint: '适合大廓形、OVERSIZE、有结构宽松款，避免过小或过精致',
    colorHint: '适合大地色、暖调中深色，可尝试对比色块拼接',
  },
  SoftDramatic: {
    name: '柔软戏剧型', nameEn: 'Soft Dramatic', element: '阳·水火',
    keywords: ['力量感', '柔化', '大气', '性感', '深邃'],
    desc: '你拥有戏剧型的强骨架，但身体线条带有柔和的曲线感，使你的气质兼具力量与魅力。长款、垂坠面料、深色系最能展现你的气场。',
    bodyHint: '适合长款垂坠、强廓形加柔化细节，避免短小或过于甜美',
    colorHint: '适合深宝石色、暖调深色、中低饱和沉稳色',
  },
  Dramatic: {
    name: '戏剧型·强气场', nameEn: 'Dramatic', element: '阳·金水',
    keywords: ['极强结构', '高对比', '锐利', '气场', '力量'],
    desc: '你是13种风格中气场最强的类型，骨架高大、线条清晰、存在感强。你能驾驭其他人hold不住的廓形，越有力量越适合你。',
    bodyHint: '适合高度结构化廓形、极简有力量的大廓形，避免柔软堆叠',
    colorHint: '适合高对比色（黑白）、冷调深色、极简大色块',
  },
}

// ─── 13风格判断函数 ──────────────────────────────────────────
function computeStyle(body: BodyQuick, style: StyleProfile): StyleType {
  let scores: Partial<Record<StyleType, number>> = {}
  const add = (type: StyleType, n: number) => { scores[type] = (scores[type] || 0) + n }

  // 骨架信号
  if (body.boneScale === 'small') {
    add('Romantic', 3); add('TheatricalRomantic', 2)
    add('SoftGamine', 3); add('Gamine', 2); add('FlamboyantGamine', 1)
    add('SoftClassic', 1)
  } else if (body.boneScale === 'medium') {
    add('SoftClassic', 3); add('Classic', 3); add('DramaticClassic', 2)
    add('SoftNatural', 2); add('Natural', 2)
  } else if (body.boneScale === 'large') {
    add('FlamboyantNatural', 3); add('SoftDramatic', 3); add('Dramatic', 3)
    add('DramaticClassic', 1); add('FlamboyantGamine', 1)
  }

  // 身体线条信号
  if (body.bodyLine === 'curve') {
    add('Romantic', 3); add('TheatricalRomantic', 2); add('SoftDramatic', 2)
    add('SoftClassic', 1); add('SoftNatural', 1)
  } else if (body.bodyLine === 'straight') {
    add('Dramatic', 3); add('Classic', 2); add('Natural', 2)
    add('Gamine', 2); add('FlamboyantNatural', 1)
  } else if (body.bodyLine === 'soft') {
    add('SoftGamine', 2); add('SoftClassic', 2); add('SoftNatural', 2)
    add('Romantic', 1)
  } else if (body.bodyLine === 'mixed') {
    add('DramaticClassic', 2); add('FlamboyantGamine', 2); add('FlamboyantNatural', 2)
  }

  // 风格感知信号
  const impressionMap: Partial<Record<string, [StyleType, number][]>> = {
    A: [['Romantic', 3], ['SoftGamine', 2], ['SoftClassic', 1]],
    B: [['Natural', 3], ['SoftNatural', 2], ['FlamboyantNatural', 1]],
    C: [['Classic', 3], ['SoftClassic', 2], ['DramaticClassic', 1]],
    D: [['Dramatic', 3], ['DramaticClassic', 2], ['FlamboyantGamine', 1]],
    E: [['Gamine', 3], ['FlamboyantGamine', 2], ['SoftGamine', 1]],
    F: [['SoftDramatic', 3], ['Dramatic', 2], ['FlamboyantNatural', 1]],
    G: [['Natural', 3], ['FlamboyantNatural', 2], ['SoftNatural', 2]],
  }
  const impressionSignals = impressionMap[style.impression] || []
  impressionSignals.forEach(([t, n]) => add(t, n))

  // 廓形偏好信号
  const silhouetteMap: Partial<Record<string, [StyleType, number][]>> = {
    A: [['Romantic', 3], ['SoftDramatic', 2], ['TheatricalRomantic', 1]],
    B: [['Natural', 3], ['FlamboyantNatural', 2], ['Dramatic', 1]],
    C: [['Dramatic', 3], ['DramaticClassic', 2], ['SoftDramatic', 1]],
    D: [['TheatricalRomantic', 2], ['SoftDramatic', 2], ['Romantic', 1]],
    E: [['Gamine', 3], ['FlamboyantGamine', 2]],
  }
  const silhouetteSignals = silhouetteMap[style.silhouette] || []
  silhouetteSignals.forEach(([t, n]) => add(t, n))

  // 面料偏好信号
  style.fabric.forEach(f => {
    const fabricMap: Partial<Record<string, [StyleType, number][]>> = {
      A: [['Romantic', 2], ['TheatricalRomantic', 1], ['SoftDramatic', 1]],
      B: [['TheatricalRomantic', 2], ['Romantic', 1]],
      C: [['Dramatic', 2], ['DramaticClassic', 2], ['Classic', 1]],
      D: [['Natural', 2], ['SoftNatural', 2], ['FlamboyantNatural', 1]],
      E: [['TheatricalRomantic', 2], ['SoftDramatic', 1], ['Dramatic', 1]],
    }
    ;(fabricMap[f] || []).forEach(([t, n]) => add(t, n))
  })

  // 理想造型信号
  const idealMap: Partial<Record<string, [StyleType, number][]>> = {
    A: [['TheatricalRomantic', 3], ['Romantic', 2], ['SoftClassic', 1]],
    B: [['Classic', 3], ['DramaticClassic', 2], ['SoftClassic', 1]],
    C: [['Natural', 3], ['SoftNatural', 2], ['FlamboyantNatural', 1]],
    D: [['Dramatic', 3], ['FlamboyantGamine', 2], ['TheatricalRomantic', 1]],
    E: [['Romantic', 3], ['SoftDramatic', 2], ['TheatricalRomantic', 1]],
    F: [['SoftDramatic', 3], ['Dramatic', 2], ['DramaticClassic', 1]],
  }
  const idealSignals = idealMap[style.ideal] || []
  idealSignals.forEach(([t, n]) => add(t, n))

  // 找最高分
  let topType: StyleType = 'Classic'
  let topScore = 0
  ;(Object.entries(scores) as [StyleType, number][]).forEach(([t, s]) => {
    if (s > topScore) { topScore = s; topType = t }
  })
  return topType
}

// ─── 公共样式 ─────────────────────────────────────────────────
const btnGold: React.CSSProperties = {
  background: C.gold, color: '#fff', border: 'none', borderRadius: '6px',
  padding: '14px 0', fontFamily: 'Inter, sans-serif', fontSize: '14px',
  letterSpacing: '1px', cursor: 'pointer', width: '100%',
}
const btnDisabled: React.CSSProperties = {
  ...btnGold, background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed',
}
const btnOutline: React.CSSProperties = {
  background: 'transparent', color: C.muted, border: `1px solid ${C.border}`,
  borderRadius: '6px', padding: '14px 20px', fontFamily: 'Inter, sans-serif',
  fontSize: '13px', cursor: 'pointer',
}

const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={btnOutline}>← 返回</button>
)

// 多选按钮组件
function MultiSelect({ options, selected, onChange, max }: {
  options: { id: string; label: string; sub?: string }[]
  selected: string[]; onChange: (v: string[]) => void; max?: number
}) {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id))
    else if (!max || selected.length < max) onChange([...selected, id])
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {options.map(o => {
        const active = selected.includes(o.id)
        const disabled = !active && !!max && selected.length >= max
        return (
          <button key={o.id} onClick={() => !disabled && toggle(o.id)} style={{
            border: `1.5px solid ${active ? C.gold : C.border}`,
            borderRadius: '8px', background: active ? C.accent : C.card,
            padding: '14px 20px', cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left', transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
            display: 'flex', gap: '14px', alignItems: 'flex-start',
          }}>
            <span style={{
              width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
              border: `1.5px solid ${active ? C.gold : C.border}`,
              background: active ? C.gold : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px',
            }}>
              {active && <span style={{ color: '#fff', fontSize: '11px' }}>✓</span>}
            </span>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: active ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
              {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: '3px 0 0' }}>{o.sub}</p>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// 单选按钮组件
function SingleSelect({ options, value, onChange }: {
  options: { id: string; label: string; sub?: string }[]
  value: string; onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {options.map(o => {
        const active = value === o.id
        return (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            border: `1.5px solid ${active ? C.gold : C.border}`,
            borderRadius: '8px', background: active ? C.accent : C.card,
            padding: '14px 20px', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'flex-start',
          }}>
            <span style={{
              width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
              border: `1.5px solid ${active ? C.gold : C.border}`,
              background: active ? C.gold : 'transparent', marginTop: '1px',
            }} />
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: active ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
              {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: '3px 0 0' }}>{o.sub}</p>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// 步骤标题组件
function StepHeader({ tag, title, subtitle }: { tag: string; title: string; subtitle?: string }) {
  return (
    <div>
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>{tag}</p>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px', marginBottom: 0 }}>{subtitle}</p>}
    </div>
  )
}

// ─── 报告组件 ─────────────────────────────────────────────────
function StyleReport({ styleType, body, color, scenario, onReset }: {
  styleType: StyleType
  body: BodyQuick
  color: ColorQuick
  scenario: ScenarioProfile
  onReset: () => void
}) {
  const [tab, setTab] = useState<'style'|'body'|'color'|'scenario'|'next'>('style')
  const profile = STYLE_PROFILES[styleType]
  const tabs = [
    { key: 'style' as const, label: '风格主型' },
    { key: 'body' as const, label: '体型建议' },
    { key: 'color' as const, label: '色彩方向' },
    { key: 'scenario' as const, label: '场景策略' },
    { key: 'next' as const, label: '下一步' },
  ]

  const sceneLabels: Record<string, string> = {
    '1': '日常通勤', '2': '商务会议', '3': '周末休闲',
    '4': '约会/晚餐', '5': '旅行/拍照', '6': '重要活动',
    '7': '购物决策', '8': '整理衣橱',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 标题 */}
      <div style={{ textAlign: 'center', padding: '28px 0 24px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>你的风格主型</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: C.h1, fontWeight: 400, margin: '0 0 8px' }}>
          {profile.name}
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.gold, letterSpacing: '1px', margin: '0 0 16px' }}>
          {profile.nameEn} · {profile.element}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {profile.keywords.map(k => (
            <span key={k} style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, border: `1px solid ${C.gold}`, borderRadius: '20px', padding: '4px 14px' }}>{k}</span>
          ))}
        </div>
      </div>

      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 14px', border: `1px solid ${tab === t.key ? C.gold : C.border}`,
            borderRadius: '20px', background: tab === t.key ? C.gold : C.card,
            color: tab === t.key ? '#fff' : C.muted,
            fontFamily: 'Inter, sans-serif', fontSize: '12px', cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'all 0.2s', flexShrink: 0,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab 内容 */}
      {tab === 'style' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>AIFFD 解读</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.9, margin: 0 }}>{profile.desc}</p>
          </div>
          <div style={{ background: C.accent, borderRadius: '8px', padding: '16px 20px', borderLeft: `3px solid ${C.gold}` }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>
              💡 25季色彩细分正在收集数据中，随着你的使用将逐步稳定。
            </p>
          </div>
        </div>
      )}

      {tab === 'body' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>体型穿搭策略</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.9, margin: '0 0 16px' }}>{profile.bodyHint}</p>
          {body.bodyShape && (
            <div style={{ padding: '12px 16px', background: C.bg, borderRadius: '6px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: '0 0 4px' }}>你的体型</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.h2, margin: 0 }}>
                {body.bodyShape === 'H' ? 'H型 · 肩宽≈臀宽' : body.bodyShape === 'A' ? 'A型 · 臀宽>肩宽' : body.bodyShape === 'V' ? 'V型 · 肩宽>臀宽' : 'X型 · 肩臀相近，腰部明显'}
              </p>
            </div>
          )}
          <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
            <Link to="/test/body" style={{ flex: 1, padding: '12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              进入完整体型测试 →
            </Link>
          </div>
        </div>
      )}

      {tab === 'color' && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>色彩穿搭策略</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.9, margin: '0 0 16px' }}>{profile.colorHint}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/test/color" style={{ flex: 1, padding: '12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              进入冷暖色彩测试 →
            </Link>
            <Link to="/test/color/season" style={{ flex: 1, padding: '12px', background: C.bg, border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              进入五季测试 →
            </Link>
          </div>
        </div>
      )}

      {tab === 'scenario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
            你优先的穿搭场景
          </p>
          {scenario.scenes.map((s, i) => (
            <div key={s} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#fff' }}>{i + 1}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: C.h2, margin: '0 0 4px' }}>{sceneLabels[s] || s}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>
                  {scenario.functions.length > 0 ? scenario.functions.slice(0, 2).join(' · ') : '正在完善建议中'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'next' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: C.accent, borderRadius: '10px', padding: '20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>完善你的档案</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.8, marginBottom: '16px' }}>
              档案越完整，建议越精准。目前已完成基础风格判断，继续完善体型和色彩数据，报告会持续升级。
            </p>
          </div>
          {[
            { label: '完整体型测试', sub: '判断骨骼廓形、身体线条、气血态', path: '/test/body', done: !!body.bodyShape },
            { label: '冷暖色彩测试', sub: '判断肤色底调冷暖', path: '/test/color', done: color.experience.length > 0 },
            { label: '五季色彩测试', sub: '判断五季主类，开启25季校准', path: '/test/color/season', done: false },
          ].map(item => (
            <div key={item.path} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.h2, margin: 0 }}>{item.label}</p>
                  {item.done && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, border: `1px solid ${C.gold}`, borderRadius: '10px', padding: '1px 8px' }}>已完成</span>}
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{item.sub}</p>
              </div>
              <Link to={item.path} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.gold, textDecoration: 'none' }}>
                {item.done ? '重测 →' : '开始 →'}
              </Link>
            </div>
          ))}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.h2, margin: '0 0 4px' }}>25季细分 · 长期校准</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>完成五季测试后解锁，需3次以上数据更新</p>
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>即将开放</span>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
        <button onClick={onReset} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, cursor: 'pointer' }}>重新测试</button>
        <Link to="/profile" style={{ flex: 1, padding: '14px', background: C.gold, border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          进入我的档案 →
        </Link>
      </div>
    </div>
  )
}

// ─── 主页面 ───────────────────────────────────────────────────
export default function StyleTestPage() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('intro')

  // 检查是否从专业测试跳回（用 useEffect 在挂载时执行）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => { checkReturnFromTest() })

  // 各模块 answers
  const [basic, setBasic] = useState<BasicProfile>({ age: '', height: '', weight: '', occupation: '', painPoints: [], aspirations: [] })
  const [body, setBody] = useState<BodyQuick>({ bodyShape: '', bodyLine: '', boneScale: '' })
  const [color, setColor] = useState<ColorQuick>({ experience: [], colorGroup: '' })
  const [style, setStyle] = useState<StyleProfile>({ impression: '', taboo: '', attracted: [], ideal: '', silhouette: '', fabric: [], pattern: '' })
  const [scenario, setScenario] = useState<ScenarioProfile>({ scenes: [], functions: [], budget: '', forbidden: [] })
  const [styleResult, setStyleResult] = useState<StyleType | null>(null)

  // 子步骤管理
  const [basicStep, setBasicStep] = useState(0)
  const [styleStep, setStyleStep] = useState(0)

  // 从 localStorage 读取已完成的专业测试结果（体型/色彩）
  const loadSavedResults = () => {
    const savedBody = localStorage.getItem('aiffd_body_result')
    const savedColor = localStorage.getItem('aiffd_color_result')
    const savedSeason = localStorage.getItem('aiffd_season_result')
    if (savedBody) {
      try {
        const b = JSON.parse(savedBody)
        setBody(prev => ({ ...prev, ...b }))
      } catch {}
    }
    if (savedColor) {
      try {
        const c = JSON.parse(savedColor)
        setColor(prev => ({ ...prev, ...c }))
      } catch {}
    }
    if (savedSeason) {
      localStorage.setItem('aiffd_warmcool', savedSeason)
    }
  }

  // 页面加载时检查是否从专业测试跳回
  const checkReturnFromTest = () => {
    const returnTo = localStorage.getItem('aiffd_return_to')
    if (returnTo === 'style_body') {
      localStorage.removeItem('aiffd_return_to')
      loadSavedResults()
      setPhase('body')
      return true
    }
    if (returnTo === 'style_color') {
      localStorage.removeItem('aiffd_return_to')
      loadSavedResults()
      setPhase('color')
      return true
    }
    return false
  }

  const computeAndFinish = () => {
    const result = computeStyle(body, style)
    setStyleResult(result)
    setPhase('report')
  }

  const reset = () => {
    setPhase('intro'); setBasicStep(0); setStyleStep(0); setStyleResult(null)
    setBasic({ age: '', height: '', weight: '', occupation: '', painPoints: [], aspirations: [] })
    setBody({ bodyShape: '', bodyLine: '', boneScale: '' })
    setColor({ experience: [], colorGroup: '' })
    setStyle({ impression: '', taboo: '', attracted: [], ideal: '', silhouette: '', fabric: [], pattern: '' })
    setScenario({ scenes: [], functions: [], budget: '', forbidden: [] })
  }

  // 进度计算
  const phaseOrder: Phase[] = ['intro', 'basic', 'body', 'color', 'style', 'scenario', 'report']
  const totalProgress = phaseOrder.indexOf(phase)
  const totalPhases = phaseOrder.length - 2
  const progress = phase === 'intro' ? 0 : phase === 'report' ? 100 : (totalProgress / totalPhases) * 100

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: '60px' }}>
      {/* 进度条 */}
      {phase !== 'intro' && phase !== 'report' && (
        <div style={{ height: '3px', background: C.border }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.gold, transition: 'width 0.3s ease' }} />
        </div>
      )}

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 32px' }}>

        {/* ── 介绍页 ── */}
        {phase === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>AIFFD · 风格测试</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '38px', color: C.h1, fontWeight: 400, lineHeight: 1.25, margin: '0 0 20px' }}>
                找到你的<br />风格主型
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.muted, lineHeight: 1.9, margin: 0 }}>
                AIFFD 以个人风格测试为入口，整合体型、色彩、气韵与场景，给你一个可理解、可执行的风格答案。
              </p>
            </div>

            {/* 测试流程说明 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { step: 'A', label: '基础建档', sub: '年龄 / 身高 / 职业 / 风格向往' },
                { step: 'B', label: '体型快判', sub: '骨骼 / 身体线条 / 廓形方向' },
                { step: 'C', label: '色彩快判', sub: '冷暖底调 / 五季方向' },
                { step: 'D', label: '风格主测试', sub: '13风格 · 气韵 · 阴阳属性' },
                { step: 'E', label: '场景需求', sub: '优先场景 / 功能需求' },
              ].map((item, i, arr) => (
                <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: i < arr.length - 1 ? '16px' : 0, borderBottom: i < arr.length - 1 ? `1px dashed ${C.border}` : 'none', marginBottom: i < arr.length - 1 ? '16px' : 0 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: C.accent, border: `1px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold }}>{item.step}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.h2, margin: '0 0 3px' }}>{item.label}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: C.accent, borderRadius: '8px', padding: '16px 20px', borderLeft: `3px solid ${C.gold}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>
                💡 体型测试和色彩测试已有独立入口，可随时在档案页继续深入。本测试约15分钟。
              </p>
            </div>
            <button onClick={() => setPhase('basic')} style={btnGold}>开始风格测试</button>
          </div>
        )}

        {/* ── 模块A：基础建档 ── */}
        {phase === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* A0：年龄 + 身高 */}
            {basicStep === 0 && (
              <>
                <StepHeader tag="模块 A · 基础建档 1/4" title="先告诉我一些基本信息" subtitle="这些信息会直接影响风格判断和穿搭建议" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, display: 'block', marginBottom: '8px' }}>
                      真实年龄（岁）
                      <span style={{ color: C.gold, marginLeft: '6px', fontSize: '11px' }}>* 请填写真实年龄，年龄会影响风格判断</span>
                    </label>
                    <input type="number" value={basic.age} onChange={e => setBasic(p => ({ ...p, age: e.target.value }))} placeholder="例如：38" style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '14px', background: C.card, boxSizing: 'border-box' as const }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, display: 'block', marginBottom: '8px' }}>身高（cm）</label>
                    <input type="number" value={basic.height} onChange={e => setBasic(p => ({ ...p, height: e.target.value }))} placeholder="例如：163" style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '14px', background: C.card, boxSizing: 'border-box' as const }} />
                  </div>
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, display: 'block', marginBottom: '8px' }}>
                      体重（kg）
                      <span style={{ color: C.muted, marginLeft: '6px', fontSize: '11px' }}>选填，仅用于体型分析</span>
                    </label>
                    <input type="number" value={basic.weight} onChange={e => setBasic(p => ({ ...p, weight: e.target.value }))} placeholder="选填" style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '14px', background: C.card, boxSizing: 'border-box' as const }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setPhase('intro')} />
                  <button onClick={() => setBasicStep(1)} disabled={!basic.age || !basic.height} style={!basic.age || !basic.height ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}

            {/* A1：职业场景 */}
            {basicStep === 1 && (
              <>
                <StepHeader tag="模块 A · 基础建档 2/4" title="你的主要职业状态是？" />
                <SingleSelect
                  options={[
                    { id: 'A', label: '职场白领 / 管理层' },
                    { id: 'B', label: '自由职业 / 创业者' },
                    { id: 'C', label: '专业人士（医疗 / 法律 / 教育）' },
                    { id: 'D', label: '创意从业者（设计 / 媒体 / 艺术）' },
                    { id: 'E', label: '全职妈妈 / 居家' },
                    { id: 'F', label: '学生' },
                    { id: 'G', label: '其他' },
                  ]}
                  value={basic.occupation}
                  onChange={v => setBasic(p => ({ ...p, occupation: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setBasicStep(0)} />
                  <button onClick={() => setBasicStep(2)} disabled={!basic.occupation} style={!basic.occupation ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}

            {/* A2：穿搭困扰 */}
            {basicStep === 2 && (
              <>
                <StepHeader tag="模块 A · 基础建档 3/4" title="你最大的穿搭困扰是什么？" subtitle="最多选3个" />
                <MultiSelect
                  max={3}
                  options={[
                    { id: 'A', label: '不知道什么颜色适合我' },
                    { id: 'B', label: '不知道什么版型适合我的身材' },
                    { id: 'C', label: '买了很多衣服但没有什么可穿' },
                    { id: 'D', label: '经常买错，穿几次就不想穿了' },
                    { id: 'E', label: '职场和私下风格很难平衡' },
                    { id: 'F', label: '不知道怎么搭配让整体有高级感' },
                    { id: 'G', label: '年龄增长后不知道该怎么穿' },
                    { id: 'H', label: '不知道如何在有限预算内买到对的东西' },
                  ]}
                  selected={basic.painPoints}
                  onChange={v => setBasic(p => ({ ...p, painPoints: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setBasicStep(1)} />
                  <button onClick={() => setBasicStep(3)} disabled={basic.painPoints.length === 0} style={basic.painPoints.length === 0 ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}

            {/* A3：风格向往 */}
            {basicStep === 3 && (
              <>
                <StepHeader tag="模块 A · 基础建档 4/4" title="以下哪些词最接近你想要的穿搭感觉？" subtitle="最多选5个" />
                <MultiSelect
                  max={5}
                  options={[
                    { id: 'elegant', label: '高级感 · 优雅 · 知性' },
                    { id: 'professional', label: '职业 · 干练 · 专业' },
                    { id: 'feminine', label: '柔美 · 女人味 · 浪漫' },
                    { id: 'natural', label: '自然 · 随性 · 松弛 · 质感' },
                    { id: 'edgy', label: '时髦 · 个性 · 前卫 · 酷' },
                    { id: 'powerful', label: '大气 · 成熟 · 稳重 · 气场' },
                    { id: 'minimal', label: '清爽 · 简洁 · 极简 · 现代' },
                    { id: 'sweet', label: '甜美 · 少女感 · 可爱' },
                  ]}
                  selected={basic.aspirations}
                  onChange={v => setBasic(p => ({ ...p, aspirations: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setBasicStep(2)} />
                  <button onClick={() => { setBasicStep(0); setPhase('body') }} disabled={basic.aspirations.length === 0} style={basic.aspirations.length === 0 ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 模块B：体型快判 ── */}
        {phase === 'body' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <StepHeader tag="模块 B · 体型快判" title="你认为自己的体型更接近哪种？" subtitle="不确定可进入完整体型测试，约10分钟" />
            <SingleSelect
              options={[
                { id: 'H', label: 'H 型', sub: '肩宽≈臀宽，腰部不明显，整体较方正' },
                { id: 'A', label: 'A 型', sub: '臀宽>肩宽，重心偏下，梨形轮廓' },
                { id: 'V', label: 'V 型', sub: '肩宽>臀宽，倒三角轮廓，上半身较宽' },
                { id: 'X', label: 'X 型', sub: '肩臀相近，腰部明显收细，沙漏型轮廓' },
              ]}
              value={body.bodyShape}
              onChange={v => setBody(p => ({ ...p, bodyShape: v }))}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => {
                localStorage.setItem('aiffd_return_to', 'style_body')
                navigate('/test/body')
              }} style={{ ...btnOutline, textAlign: 'center', padding: '14px' }}>
                不确定 → 进入完整体型测试（完成后自动返回）
              </button>
            </div>
            {body.bodyShape && (
              <>
                <StepHeader tag="" title="你的身体线条感觉更接近？" />
                <SingleSelect
                  options={[
                    { id: 'curve', label: '明显的曲线感，腰臀弧度大' },
                    { id: 'straight', label: '较直的线条，整体偏方正' },
                    { id: 'soft', label: '柔和的线条，不突出也不平直' },
                    { id: 'mixed', label: '上下不同，有一定混合感' },
                  ]}
                  value={body.bodyLine}
                  onChange={v => setBody(p => ({ ...p, bodyLine: v }))}
                />
                <StepHeader tag="" title="你的骨骼给人的感觉是？" />
                <SingleSelect
                  options={[
                    { id: 'small', label: '小巧纤细，骨骼感弱' },
                    { id: 'medium', label: '中等，不大不小' },
                    { id: 'large', label: '宽大，有存在感，骨骼感强' },
                  ]}
                  value={body.boneScale}
                  onChange={v => setBody(p => ({ ...p, boneScale: v }))}
                />
              </>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => { setBasicStep(3); setPhase('basic') }} />
              <button onClick={() => setPhase('color')} disabled={!body.bodyShape || !body.bodyLine || !body.boneScale} style={!body.bodyShape || !body.bodyLine || !body.boneScale ? btnDisabled : btnGold}>继续</button>
            </div>
          </div>
        )}

        {/* ── 模块C：色彩快判 ── */}
        {phase === 'color' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <StepHeader tag="模块 C · 色彩快判" title="你是否有过以下穿搭体验？" subtitle="帮助系统快速判断你的色彩方向，不确定可进入完整色彩测试" />
            <MultiSelect
              options={[
                { id: 'A', label: '穿橘色 / 焦糖色时总觉得显黄显土' },
                { id: 'B', label: '穿金色首饰比银色首饰更有气色' },
                { id: 'C', label: '大多数粉色穿上去都显脏' },
                { id: 'D', label: '冷色调（藏蓝 / 玫红 / 冰白）靠近脸更干净' },
                { id: 'E', label: '以上都没有明显感觉' },
                { id: 'F', label: '不确定，需要完整色彩测试' },
              ]}
              selected={color.experience}
              onChange={v => setColor(p => ({ ...p, experience: v }))}
            />
            {!color.experience.includes('F') && color.experience.length > 0 && (
              <>
                <StepHeader tag="" title="以下哪组颜色靠近脸时感觉最高级、最干净？" />
                <SingleSelect
                  options={[
                    { id: 'A', label: '奶油白、蜜桃、杏色、焦糖' },
                    { id: 'B', label: '正红、亮橘、明黄、宝蓝（高饱和）' },
                    { id: 'C', label: '墨绿、炭灰、酒红、灰蓝、深咖' },
                    { id: 'D', label: '铜棕、铁锈红、暖驼、芥末黄' },
                    { id: 'E', label: '纯黑、冷白、藏蓝、玫红' },
                    { id: 'F', label: '需要完整测试才能判断（可进入专业测试后返回）' },
                  ]}
                  value={color.colorGroup}
                  onChange={v => setColor(p => ({ ...p, colorGroup: v }))}
                />
              </>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setPhase('body')} />
              {color.experience.includes('F') ? (
                <button onClick={() => {
                  localStorage.setItem('aiffd_return_to', 'style_color')
                  navigate('/test/color')
                }} style={btnGold}>进入完整色彩测试（完成后自动返回）</button>
              ) : (
                <button onClick={() => setPhase('style')} disabled={color.experience.length === 0} style={color.experience.length === 0 ? btnDisabled : btnGold}>继续</button>
              )}
            </div>
          </div>
        )}

        {/* ── 模块D：风格主测试 ── */}
        {phase === 'style' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {styleStep === 0 && (
              <>
                <StepHeader tag="模块 D · 风格主测试 1/6" title="别人对你的第一印象通常是？" subtitle="选最符合的那个" />
                <SingleSelect
                  options={[
                    { id: 'A', label: '温柔、柔软、有女人味' },
                    { id: 'B', label: '清爽、干净、自然' },
                    { id: 'C', label: '优雅、精致、有品位' },
                    { id: 'D', label: '酷、有个性、不太好接近' },
                    { id: 'E', label: '活泼、有趣、有反差感' },
                    { id: 'F', label: '大气、有气场、成熟' },
                    { id: 'G', label: '随性、松弛、自在' },
                  ]}
                  value={style.impression}
                  onChange={v => setStyle(p => ({ ...p, impression: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setPhase('color')} />
                  <button onClick={() => setStyleStep(1)} disabled={!style.impression} style={!style.impression ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}

            {styleStep === 1 && (
              <>
                <StepHeader tag="模块 D · 风格主测试 2/6" title="你最抗拒哪种穿搭感觉？" />
                <SingleSelect
                  options={[
                    { id: 'A', label: '太甜太可爱，像小女孩' },
                    { id: 'B', label: '太严肃太商务，没有个性' },
                    { id: 'C', label: '太随意太松垮，不够精致' },
                    { id: 'D', label: '太夸张太显眼，不低调' },
                    { id: 'E', label: '太性感太暴露，不自在' },
                    { id: 'F', label: '太刻意太用力，不自然' },
                  ]}
                  value={style.taboo}
                  onChange={v => setStyle(p => ({ ...p, taboo: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setStyleStep(0)} />
                  <button onClick={() => setStyleStep(2)} disabled={!style.taboo} style={!style.taboo ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}

            {styleStep === 2 && (
              <>
                <StepHeader tag="模块 D · 风格主测试 3/6" title="逛街时你的眼神最容易被哪类单品吸引？" subtitle="最多选3个" />
                <MultiSelect
                  max={3}
                  options={[
                    { id: 'A', label: '有质感的基础款（白衬衫 / 精致西装 / 简洁裤子）' },
                    { id: 'B', label: '有设计感的单品（特殊剪裁 / 不对称 / 解构）' },
                    { id: 'C', label: '柔软飘逸的款式（丝绸 / 雪纺 / 蕾丝 / 流苏）' },
                    { id: 'D', label: '帅气硬朗的款式（皮衣 / 工装 / 宽肩）' },
                    { id: 'E', label: '印花 / 图案 / 颜色活泼的款式' },
                    { id: 'F', label: '大廓形 / 结构感强的款式' },
                    { id: 'G', label: '贴身修身的款式' },
                  ]}
                  selected={style.attracted}
                  onChange={v => setStyle(p => ({ ...p, attracted: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setStyleStep(1)} />
                  <button onClick={() => setStyleStep(3)} disabled={style.attracted.length === 0} style={style.attracted.length === 0 ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}

            {styleStep === 3 && (
              <>
                <StepHeader tag="模块 D · 风格主测试 4/6" title="你最希望穿出什么样的感觉？" />
                <SingleSelect
                  options={[
                    { id: 'A', label: '轻盈优雅，有气质，像在电影里' },
                    { id: 'B', label: '干净利落，有品位，不用解释' },
                    { id: 'C', label: '自然松弛，有态度，不刻意' },
                    { id: 'D', label: '有冲击力，有记忆点，让人记住我' },
                    { id: 'E', label: '柔美动人，有女人味，让人想靠近' },
                    { id: 'F', label: '成熟大气，有力量，让人信任' },
                  ]}
                  value={style.ideal}
                  onChange={v => setStyle(p => ({ ...p, ideal: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setStyleStep(2)} />
                  <button onClick={() => setStyleStep(4)} disabled={!style.ideal} style={!style.ideal ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}

            {styleStep === 4 && (
              <>
                <StepHeader tag="模块 D · 风格主测试 5/6" title="你更喜欢哪种廓形？" />
                <SingleSelect
                  options={[
                    { id: 'A', label: '收腰、强调曲线' },
                    { id: 'B', label: '直线型、宽松廓形' },
                    { id: 'C', label: '结构感强、有肩线' },
                    { id: 'D', label: '流动柔软、没有明确廓形' },
                    { id: 'E', label: '对比感强、宽上窄下或反之' },
                  ]}
                  value={style.silhouette}
                  onChange={v => setStyle(p => ({ ...p, silhouette: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setStyleStep(3)} />
                  <button onClick={() => setStyleStep(5)} disabled={!style.silhouette} style={!style.silhouette ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}

            {styleStep === 5 && (
              <>
                <StepHeader tag="模块 D · 风格主测试 6/6" title="你最喜欢哪种面料的感觉？" subtitle="最多选2个" />
                <MultiSelect
                  max={2}
                  options={[
                    { id: 'A', label: '柔软贴身', sub: '丝绸、天鹅绒、莫代尔' },
                    { id: 'B', label: '轻盈飘逸', sub: '雪纺、欧根纱、薄纱' },
                    { id: 'C', label: '挺括有型', sub: '西装面料、硬质棉、皮质' },
                    { id: 'D', label: '自然质朴', sub: '棉麻、灯芯绒、针织' },
                    { id: 'E', label: '有光泽感', sub: '缎面、金属感面料、漆皮' },
                  ]}
                  selected={style.fabric}
                  onChange={v => setStyle(p => ({ ...p, fabric: v }))}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <BackBtn onClick={() => setStyleStep(4)} />
                  <button onClick={() => { setStyleStep(0); setPhase('scenario') }} disabled={style.fabric.length === 0} style={style.fabric.length === 0 ? btnDisabled : btnGold}>继续</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 模块E：场景需求 ── */}
        {phase === 'scenario' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <StepHeader
              tag="模块 E · 场景需求层"
              title="你最希望 AIFFD 帮你解决哪三个穿搭场景？"
              subtitle="选3个，系统将优先为这些场景生成建议"
            />
            <MultiSelect
              max={3}
              options={[
                { id: '1', label: '上班 / 日常通勤', sub: '需要专业感又不失个人风格' },
                { id: '2', label: '商务会议 / 客户见面', sub: '需要权威感、信任感' },
                { id: '3', label: '周末休闲 / 日常出行', sub: '轻松自在但有质感' },
                { id: '4', label: '约会 / 重要晚餐', sub: '显魅力、有女人味' },
                { id: '5', label: '旅行 / 拍照留念', sub: '上镜、有故事感、舒适' },
                { id: '6', label: '重要活动 / 社交聚会', sub: '有存在感、被记住' },
                { id: '7', label: '买衣服前判断是否适合我', sub: '购物决策辅助' },
                { id: '8', label: '整理衣橱 / 淘汰不适合的', sub: '衣橱优化' },
              ]}
              selected={scenario.scenes}
              onChange={v => setScenario(p => ({ ...p, scenes: v }))}
            />

            {scenario.scenes.length === 3 && (
              <>
                <StepHeader tag="" title="在你最重要的场景里，服装最需要帮你完成什么？" subtitle="最多选3个" />
                <MultiSelect
                  max={3}
                  options={[
                    { id: 'A', label: '显专业、有权威感' },
                    { id: 'B', label: '显瘦 / 修饰身材' },
                    { id: 'C', label: '表达我是谁、我的品位' },
                    { id: 'D', label: '让人感觉亲切、有亲和力' },
                    { id: 'E', label: '让自己感觉更好、更自信' },
                    { id: 'F', label: '减少「穿什么」的决策焦虑' },
                  ]}
                  selected={scenario.functions}
                  onChange={v => setScenario(p => ({ ...p, functions: v }))}
                />
              </>
            )}

            {scenario.scenes.length === 3 && scenario.functions.length > 0 && (
              <>
                <StepHeader tag="" title="你的单件服装平均预算是？" />
                <SingleSelect
                  options={[
                    { id: 'A', label: '200元以下' },
                    { id: 'B', label: '200 - 500元' },
                    { id: 'C', label: '500 - 1500元' },
                    { id: 'D', label: '1500 - 3000元' },
                    { id: 'E', label: '3000元以上' },
                    { id: 'F', label: '视情况而定，没有固定预算' },
                  ]}
                  value={scenario.budget}
                  onChange={v => setScenario(p => ({ ...p, budget: v }))}
                />
              </>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => { setStyleStep(5); setPhase('style') }} />
              <button
                onClick={computeAndFinish}
                disabled={scenario.scenes.length < 3 || scenario.functions.length === 0 || !scenario.budget}
                style={scenario.scenes.length < 3 || scenario.functions.length === 0 || !scenario.budget ? btnDisabled : btnGold}
              >
                生成我的风格报告
              </button>
            </div>
          </div>
        )}

        {/* ── 报告页 ── */}
        {phase === 'report' && styleResult && (
          <StyleReport
            styleType={styleResult}
            body={body}
            color={color}
            scenario={scenario}
            onReset={reset}
          />
        )}

      </div>
    </div>
  )
}
