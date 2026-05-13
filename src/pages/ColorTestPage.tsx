import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

// ─── 结果类型 ───────────────────────────────────────────────
type ColorResult = '暖黄皮' | '冷黄皮' | '中性黄皮' | '橄榄黄皮' | '冷白皮' | '暖白皮' | '需人工复核'

type StepKey = 'intro' | 'q1' | 'q1b' | 'q1c' | 'q1d' | 'q2' | 'q3' | 'q3b' | 'q4' | 'q5' | 'report'

type ContrastLevel = 'high' | 'mid' | 'low' | 'olive_check'

interface Answers {
  q1: string; q1b: string; q1c: string; q1d: string
  q2: string; q3: string; q3b: string
  q4: string; q5: string
}

function computeContrast(a: Answers): ContrastLevel | undefined {
  if (a.q1c === 'D' && a.q1d === 'C') return 'olive_check'
  let score = 0
  if (a.q1b === 'A') score += 2
  else if (a.q1b === 'B') score += 1
  else if (a.q1b === 'C') score -= 1
  if (a.q1c === 'A') score += 2
  else if (a.q1c === 'B') score += 1
  else if (a.q1c === 'C') score -= 1
  if (a.q1d === 'A') score += 2
  else if (a.q1d === 'B') score += 1
  else if (a.q1d === 'C') score -= 1
  if (score >= 4) return 'high'
  if (score >= 1) return 'mid'
  if (score <= -1) return 'low'
  return undefined
}

// ─── 色彩结果数据库 ──────────────────────────────────────────
const COLOR_PROFILES: Record<ColorResult, {
  desc: string
  season: string
  season12: string
  goodColors: { name: string; hex: string }[]
  avoidColors: { name: string; hex: string }[]
  shopping: { category: string; advice: string }[]
}> = {
  '暖黄皮': {
    desc: '你的皮肤底色带有金黄、蜜桃、阳光感，是典型的暖调肤色。穿暖色系时气色最佳，冷色系容易显灰。',
    season: '春季 / 秋季',
    season12: '浅春、暖春、明亮春、暖秋、深秋',
    goodColors: [
      { name: '奶油白', hex: '#F5F0E8' }, { name: '焦糖', hex: '#C68642' },
      { name: '番茄红', hex: '#C0392B' }, { name: '橄榄绿', hex: '#6B7A3E' },
      { name: '暖咖', hex: '#8B6347' }, { name: '芥末黄', hex: '#C8A83A' },
      { name: '珊瑚橘', hex: '#E8734A' }, { name: '驼色', hex: '#C4A882' },
    ],
    avoidColors: [
      { name: '冷灰', hex: '#8A9099' }, { name: '冰白', hex: '#F0F4F8' },
      { name: '蓝紫', hex: '#6A5ACD' }, { name: '玫红', hex: '#C2185B' },
    ],
    shopping: [
      { category: '上衣', advice: '选奶油白、焦糖、珊瑚橘，避开冷灰和冰白' },
      { category: '外套', advice: '驼色、暖咖、橄榄绿是百搭首选' },
      { category: '连衣裙', advice: '番茄红、暖黄、杏色显气色' },
      { category: '围巾', advice: '芥末黄、焦糖色提亮肤色' },
      { category: '口红', advice: '豆沙红、砖红、裸橘最显气色' },
      { category: '首饰', advice: '金色首饰比银色更贴肤' },
    ],
  },
  '冷黄皮': {
    desc: '你的皮肤表层偏黄，但冷色调反而让你更干净清透。不要被表层肤色误导——你是冷调底色。',
    season: '冬季 / 夏季',
    season12: '深冬、冷冬、冷夏、柔夏',
    goodColors: [
      { name: '纯白', hex: '#FFFFFF' }, { name: '冷灰', hex: '#8A9099' },
      { name: '宝蓝', hex: '#1A3A6B' }, { name: '玫红', hex: '#C2185B' },
      { name: '紫色', hex: '#7B3FA0' }, { name: '酒红', hex: '#7B1A2A' },
      { name: '藏蓝', hex: '#1C2E5A' }, { name: '银灰', hex: '#B0B8C4' },
    ],
    avoidColors: [
      { name: '暖橘', hex: '#E8734A' }, { name: '焦糖', hex: '#C68642' },
      { name: '芥末黄', hex: '#C8A83A' }, { name: '驼色', hex: '#C4A882' },
    ],
    shopping: [
      { category: '上衣', advice: '纯白、冷灰、宝蓝最显肤色干净' },
      { category: '外套', advice: '藏蓝、深灰、黑色是安全首选' },
      { category: '连衣裙', advice: '玫红、紫色、酒红有高级感' },
      { category: '围巾', advice: '冷调格纹、纯白或银灰提亮' },
      { category: '口红', advice: '玫瑰红、莓果色、冷调裸色' },
      { category: '首饰', advice: '银色、白金比黄金更衬肤' },
    ],
  },
  '中性黄皮': {
    desc: '你的肤色冷暖平衡，是难得的万能肤色。冷暖色系都能驾驭，重点在于饱和度和明度的搭配。',
    season: '春夏秋冬均可',
    season12: '中性春、中性秋，跨季型',
    goodColors: [
      { name: '白色', hex: '#F8F8F8' }, { name: '米色', hex: '#E8DCC8' },
      { name: '裸粉', hex: '#D4A5A0' }, { name: '浅蓝', hex: '#7AA8C4' },
      { name: '绿灰', hex: '#8AA89A' }, { name: '浅紫', hex: '#B09EC8' },
      { name: '暖橘', hex: '#E8834A' }, { name: '墨绿', hex: '#2D5A3D' },
    ],
    avoidColors: [
      { name: '荧光色', hex: '#FFFF00' }, { name: '高饱和橘', hex: '#FF5500' },
    ],
    shopping: [
      { category: '上衣', advice: '冷暖都可，建议选中饱和度颜色' },
      { category: '外套', advice: '驼色、墨绿、藏蓝都安全' },
      { category: '连衣裙', advice: '裸粉、浅蓝、绿灰都显高级' },
      { category: '口红', advice: '暖裸色或玫瑰色均可' },
      { category: '首饰', advice: '金银均可，混搭也不出错' },
    ],
  },
  '橄榄黄皮': {
    desc: '你的皮肤含有绿灰调底色，是橄榄肤色。大多数粉色和亮色容易让你显脏，但对比色和大地色系会让你极具高级感。',
    season: '秋季为主',
    season12: '深秋、暖秋、浊秋',
    goodColors: [
      { name: '卡其绿', hex: '#7A8A5A' }, { name: '锈橘', hex: '#B85C38' },
      { name: '深棕', hex: '#5A3A20' }, { name: '墨绿', hex: '#2D5A3D' },
      { name: '暖咖', hex: '#8B6347' }, { name: '芥末黄', hex: '#C8A83A' },
      { name: '焦糖', hex: '#C68642' }, { name: '象牙白', hex: '#F5F0E0' },
    ],
    avoidColors: [
      { name: '冷粉', hex: '#F4A0B8' }, { name: '甜粉', hex: '#FF80C0' },
      { name: '冷紫', hex: '#9B59B6' }, { name: '冰蓝', hex: '#AED6F1' },
    ],
    shopping: [
      { category: '上衣', advice: '卡其绿、锈橘、芥末黄最显高级' },
      { category: '外套', advice: '深棕、墨绿、暖咖是核心色' },
      { category: '连衣裙', advice: '大地色系或焦糖色，避开粉色' },
      { category: '口红', advice: '砖红、豆沙、焦糖色，避开粉调' },
      { category: '首饰', advice: '黄金、古铜色最配橄榄肤色' },
    ],
  },
  '冷白皮': {
    desc: '你的皮肤白皙且带有冷调，是典型的冷白皮。冷色系和高对比色能让你更有气场，暖调容易让你显黄。',
    season: '冬季 / 夏季',
    season12: '深冬、冷冬、冷夏',
    goodColors: [
      { name: '纯白', hex: '#FFFFFF' }, { name: '宝蓝', hex: '#1A3A6B' },
      { name: '正红', hex: '#CC0000' }, { name: '黑色', hex: '#1A1A1A' },
      { name: '紫罗兰', hex: '#8B5CF6' }, { name: '冰粉', hex: '#F0C0D0' },
      { name: '银灰', hex: '#B0B8C4' }, { name: '藏蓝', hex: '#1C2E5A' },
    ],
    avoidColors: [
      { name: '芥末黄', hex: '#C8A83A' }, { name: '暖橘', hex: '#E8734A' },
      { name: '驼色', hex: '#C4A882' }, { name: '暖咖', hex: '#8B6347' },
    ],
    shopping: [
      { category: '上衣', advice: '纯白、宝蓝、正红最显气场' },
      { category: '外套', advice: '黑色、藏蓝、深紫是经典首选' },
      { category: '连衣裙', advice: '高对比色或冷调单色最出彩' },
      { category: '口红', advice: '正红、玫瑰红、冷调莓果色' },
      { category: '首饰', advice: '银色、铂金、钻石感强的款式' },
    ],
  },
  '暖白皮': {
    desc: '你的皮肤白皙且带有暖调，是暖白皮。暖色系能让你更加光彩动人，过冷的颜色容易让你显白过头或偏灰。',
    season: '春季',
    season12: '浅春、明亮春、暖春',
    goodColors: [
      { name: '奶油白', hex: '#F5F0E8' }, { name: '蜜桃', hex: '#FFBB99' },
      { name: '珊瑚', hex: '#E8734A' }, { name: '杏色', hex: '#E8C4A0' },
      { name: '金黄', hex: '#D4A017' }, { name: '浅暖绿', hex: '#A8C490' },
      { name: '裸粉', hex: '#D4A5A0' }, { name: '浅橘', hex: '#F5A87A' },
    ],
    avoidColors: [
      { name: '冷灰', hex: '#8A9099' }, { name: '冰白', hex: '#F0F4F8' },
      { name: '藏蓝', hex: '#1C2E5A' }, { name: '黑色', hex: '#1A1A1A' },
    ],
    shopping: [
      { category: '上衣', advice: '奶油白、蜜桃、珊瑚最衬肤' },
      { category: '外套', advice: '杏色、驼色、暖米是核心' },
      { category: '连衣裙', advice: '浅橘、裸粉、金黄提亮气色' },
      { category: '口红', advice: '裸橘、珊瑚色、浅豆沙' },
      { category: '首饰', advice: '黄金、玫瑰金最搭暖白皮' },
    ],
  },
  '需人工复核': {
    desc: '你的肤色信号较复杂，冷暖特征不够明显，建议进行专业色彩顾问的线下诊断，以获得最精准的结果。',
    season: '待诊断',
    season12: '待诊断',
    goodColors: [
      { name: '白色', hex: '#F8F8F8' }, { name: '米色', hex: '#E8DCC8' },
      { name: '浅灰', hex: '#C8C8C8' }, { name: '裸粉', hex: '#D4A5A0' },
    ],
    avoidColors: [
      { name: '荧光色', hex: '#FFFF00' },
    ],
    shopping: [
      { category: '建议', advice: '暂时选择中性色调，等待专业诊断后再进行色彩投资' },
    ],
  },
}

// ─── 评分逻辑 ────────────────────────────────────────────────
function computeResult(a: Answers): ColorResult {
  let warm = 0
  let cold = 0
  let olive = 0
  let bright = 0 // 明度：白=+1，黄=-1

  // Q1 明度（决定白皮/黄皮方向）
  if (a.q1 === 'A') bright += 3      // 偏白
  else if (a.q1 === 'B') bright -= 3 // 偏黄

  // Q2 冷暖色卡（权重最高）
  if (a.q2 === 'A') warm += 5
  else if (a.q2 === 'B') cold += 5
  else if (a.q2 === 'C') { warm += 1; cold += 1 }
  else if (a.q2 === 'D') olive += 3

  // Q3 粉色反应
  if (a.q3 === 'A') warm += 2        // 蜜桃粉好看 → 暖
  else if (a.q3 === 'B') cold += 2   // 玫瑰粉好看 → 冷
  else if (a.q3 === 'C') {
    // 进入 Q3b 橄榄确认
    if (a.q3b === 'B') olive += 8    // 品红更好看 → 强橄榄信号
    else if (a.q3b === 'A') warm += 1 // 橘色更好看 → 暖黄皮，非橄榄
  } else if (a.q3 === 'D') { warm += 1; cold += 1 }

  // Q4 粉底问题
  if (a.q4 === 'A') cold += 1        // 太粉→偏冷
  else if (a.q4 === 'B') warm += 1   // 太黄→偏暖
  else if (a.q4 === 'C') olive += 3  // 太灰→橄榄信号
  else if (a.q4 === 'D') olive += 2  // 氧化暗沉→橄榄信号

  // Q5 金银首饰
  if (a.q5 === 'A') warm += 2        // 金色衬→暖
  else if (a.q5 === 'B') cold += 2   // 银色衬→冷
  else if (a.q5 === 'D') olive += 2  // 都不衬→橄榄

  // q1c=D + q1d=C → 橄榄/灰黄肤色复核信号
  if (a.q1c === 'D' && a.q1d === 'C') olive += 3

  // ── 判断橄榄 ──
  if (olive >= 8) return '橄榄黄皮'

  const diff = Math.abs(warm - cold)
  const total = warm + cold

  // ── 需人工复核 ──
  if (diff <= 2 && total < 8) return '需人工复核'

  // ── 白/黄 方向 ──
  const isLight = bright > 0

  if (warm > cold) {
    return isLight ? '暖白皮' : '暖黄皮'
  } else {
    return isLight ? '冷白皮' : '冷黄皮'
  }
}

// ─── 公共样式 ─────────────────────────────────────────────────
const btnPrimaryStyle: React.CSSProperties = {
  flex: 1, padding: '14px 0', background: C.gold, color: '#fff',
  border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif',
  fontSize: '14px', letterSpacing: '1px', cursor: 'pointer',
}
const btnDisabledStyle: React.CSSProperties = {
  ...btnPrimaryStyle, background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed',
}
const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} style={{
    padding: '14px 20px', background: 'transparent', border: `1px solid ${C.border}`,
    borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
    color: C.muted, cursor: 'pointer',
  }}>← 返回</button>
)

// ─── QuestionStep 通用组件 ────────────────────────────────────
function QuestionStep({ tag, title, subtitle, options, value, onChange, onNext, onBack }: {
  tag: string; title: string; subtitle?: string
  options: { id: string; label: string; sub?: string }[]
  value: string; onChange: (v: string) => void
  onNext: () => void; onBack: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>{tag}</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>{title}</h2>
        {subtitle && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            border: `1.5px solid ${value === o.id ? C.gold : C.border}`,
            borderRadius: '8px',
            background: value === o.id ? '#fdf8ee' : '#fff',
            padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'flex-start',
          }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: value === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0, marginTop: '2px' }}>{o.id}</span>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: value === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
              {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px', marginBottom: 0 }}>{o.sub}</p>}
            </div>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <BackBtn onClick={onBack} />
        <button onClick={onNext} disabled={!value} style={!value ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
      </div>
    </div>
  )
}

// ─── 报告组件 ─────────────────────────────────────────────────
function ColorReport({ result, contrast, onReset }: { result: ColorResult; contrast: ContrastLevel | undefined; onReset: () => void }) {
  const [tab, setTab] = useState<'judge' | 'good' | 'risk' | 'palette' | 'shopping' | 'season'>('judge')
  const profile = COLOR_PROFILES[result]
  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'judge', label: '肤色判断' },
    { key: 'good', label: '色彩优势' },
    { key: 'risk', label: '色彩风险' },
    { key: 'palette', label: '推荐色盘' },
    { key: 'shopping', label: '购物建议' },
    { key: 'season', label: '四季参考' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 结果标题 */}
      <div style={{ textAlign: 'center', padding: '24px 0 16px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>您的色彩类型</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: C.h1, fontWeight: 400, margin: '0 0 12px' }}>{result}</h1>
        {contrast && (
          <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '20px', background: '#f5f0e8', border: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold }}>
              {contrast === 'high' ? '高对比型 · 适合深色、清晰色、高对比配色'
                : contrast === 'mid' ? '中对比型 · 适合中等深浅、中等饱和度，选择空间较大'
                : contrast === 'low' ? '低对比型 · 适合柔和、浅中明度、低饱和色'
                : '需后续验证 · 结合方巾、金银测试、肤色反应继续判断'}
            </span>
          </div>
        )}
      </div>
      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 14px', border: `1px solid ${tab === t.key ? C.gold : C.border}`,
            borderRadius: '20px', background: tab === t.key ? C.gold : '#fff',
            color: tab === t.key ? '#fff' : C.muted,
            fontFamily: 'Inter, sans-serif', fontSize: '12px', cursor: 'pointer',
            whiteSpace: 'nowrap', transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>
      {/* Tab 内容 */}
      {tab === 'judge' && (
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.8 }}>
          <p>{profile.desc}</p>
        </div>
      )}
      {tab === 'good' && (
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '16px' }}>这些颜色最能提亮你的气色</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {profile.goodColors.map(c => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: c.hex, border: `1px solid ${C.border}` }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'risk' && (
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '16px' }}>这些颜色容易让你显黄、显暗或显脏</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {profile.avoidColors.map(c => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', position: 'relative' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: c.hex, border: `1px solid ${C.border}`, position: 'relative' }}>
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'rgba(255,255,255,0.9)' }}>✕</span>
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'palette' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px', marginBottom: '10px' }}>主色调</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {profile.goodColors.slice(0, 4).map(c => (
                <div key={c.name} style={{ flex: 1, height: '40px', background: c.hex, borderRadius: '4px' }} title={c.name} />
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px', marginBottom: '10px' }}>辅助色</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {profile.goodColors.slice(4).map(c => (
                <div key={c.name} style={{ flex: 1, height: '40px', background: c.hex, borderRadius: '4px' }} title={c.name} />
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === 'shopping' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {profile.shopping.map(s => (
            <div key={s.category} style={{ padding: '14px 16px', border: `1px solid ${C.border}`, borderRadius: '8px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px', marginBottom: '4px' }}>{s.category}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, margin: 0 }}>{s.advice}</p>
            </div>
          ))}
        </div>
      )}
      {tab === 'season' && (
        <div style={{ fontFamily: 'Inter, sans-serif', color: C.body, lineHeight: 1.8 }}>
          <p style={{ fontSize: '14px' }}><strong style={{ color: C.h2 }}>四季类型：</strong>{profile.season}</p>
          <p style={{ fontSize: '14px' }}><strong style={{ color: C.h2 }}>12季参考：</strong>{profile.season12}</p>
          <p style={{ fontSize: '12px', color: C.muted, marginTop: '12px' }}>* 四季/12季色彩体系仅供参考，实际结果因个体差异有所不同。</p>
        </div>
      )}
      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
        <button onClick={onReset} style={{ flex: 1, padding: '14px 0', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, cursor: 'pointer' }}>重新测试</button>
        <Link to="/test/body" style={{ flex: 1, padding: '14px 0', background: '#f5f0e8', border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>体型测试 →</Link>
      </div>
    </div>
  )
}

// ─── 主页面 ───────────────────────────────────────────────────
export default function ColorTestPage() {
  const [step, setStep] = useState<StepKey>('intro')
  const [answers, setAnswers] = useState<Answers>({ q1: '', q1b: '', q1c: '', q1d: '', q2: '', q3: '', q3b: '', q4: '', q5: '' })

  const set = (key: keyof Answers) => (val: string) => setAnswers(prev => ({ ...prev, [key]: val }))

  const next = () => {
    const order: StepKey[] = ['intro', 'q1', 'q1b', 'q1c', 'q1d', 'q2', 'q3', 'q3b', 'q4', 'q5', 'report']
    const i = order.indexOf(step)
    if (i < order.length - 1) setStep(order[i + 1])
  }

  const back = () => {
    const backMap: Partial<Record<StepKey, StepKey>> = {
      q1: 'intro', q1b: 'q1', q1c: 'q1b', q1d: 'q1c',
      q2: 'q1d', q3: 'q2', q3b: 'q3',
      q4: 'q3', q5: 'q4', report: 'q5',
    }
    const prev = backMap[step]
    if (prev) setStep(prev)
  }

  const reset = () => {
    setAnswers({ q1: '', q1b: '', q1c: '', q1d: '', q2: '', q3: '', q3b: '', q4: '', q5: '' })
    setStep('intro')
  }

  const result = useMemo(() => computeResult(answers), [answers])

  // 进度条（q3b 算在 q3 内，不单独计步）
  const stepIndex: Record<StepKey, number> = {
    intro: 0, q1: 1, q1b: 2, q1c: 2, q1d: 2, q2: 3, q3: 4, q3b: 4, q4: 5, q5: 6, report: 7,
  }
  const totalSteps = 6
  const progress = step === 'intro' ? 0 : step === 'report' ? 100 : (stepIndex[step] / totalSteps) * 100

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', paddingBottom: '60px' }}>
      {/* 顶部进度条 */}
      {step !== 'intro' && step !== 'report' && (
        <div style={{ height: '3px', background: C.border }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.gold, transition: 'width 0.3s ease' }} />
        </div>
      )}

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 32px' }}>

        {/* ── 介绍页 ── */}
        {step === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>色彩测试</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: C.h1, fontWeight: 400, lineHeight: 1.3, margin: 0 }}>找到属于你的色彩答案</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, marginTop: '16px', lineHeight: 1.8 }}>
                9个问题，约5分钟，判断你的肤色底调与对比度——暖黄、冷黄、橄榄、冷白或暖白，给出专属色彩方向。
              </p>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['自然光或室内白光下进行最准确', '准备几块不同颜色的布料或纸张', '素颜或淡妆状态效果更好'].map((tip, i) => (
                <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: 0 }}>
                  <span style={{ color: C.gold, marginRight: '8px' }}>·</span>{tip}
                </p>
              ))}
            </div>
            <button onClick={() => setStep('q1')} style={btnPrimaryStyle}>开始测试</button>
          </div>
        )}

        {/* ── Q1 明度 ── */}
        {step === 'q1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 01 · 明度判断</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>对比这两张图，你的肤色更接近哪一边？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>在自然光下，素颜观察手腕内侧或脸部</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { id: 'A', label: '偏白', img: '/whiteface.png' },
                { id: 'B', label: '偏黄', img: '/yellowface.png' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q1')(o.id)} style={{
                  border: `2px solid ${answers.q1 === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q1 === o.id ? '#fdf8ee' : '#fff',
                  padding: 0, cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                }}>
                  <img src={o.img} alt={o.label} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: answers.q1 === o.id ? C.gold : C.body, padding: '10px 0', margin: 0, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: C.muted, marginRight: '6px' }}>{o.id}</span>{o.label}
                  </p>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setStep('intro')} />
              <button onClick={next} disabled={!answers.q1} style={!answers.q1 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {/* ── Q1b 眉眼对比度 ── */}
        {step === 'q1b' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 02 · 面部对比度</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>素颜时，你的眉眼和皮肤对比明显吗？</h2>
            </div>
            <img src="/facehl.png" alt="面部对比度参考" style={{ width: '100%', borderRadius: '10px', objectFit: 'contain', background: '#f5f3ef' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '很明显，黑发黑眉黑眼，五官存在感强', sub: '→ 高对比，可能适合深色、强色、清晰色' },
                { id: 'B', label: '中等，有一定对比，但不强烈', sub: '→ 中对比，适合范围较宽' },
                { id: 'C', label: '很柔和，眉眼颜色比较淡', sub: '→ 低对比，适合柔和、低饱和、浅中性色' },
                { id: 'D', label: '不确定', sub: '' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q1b')(o.id)} style={{
                  border: `1.5px solid ${answers.q1b === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q1b === o.id ? '#fdf8ee' : '#fff',
                  padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: answers.q1b === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0, marginTop: '2px' }}>{o.id}</span>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: answers.q1b === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                    {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px', marginBottom: 0 }}>{o.sub}</p>}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q1b} style={!answers.q1b ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {/* ── Q1c 发色瞳色 ── */}
        {step === 'q1c' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 发色瞳色</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你的自然发色和瞳色更接近哪一种？</h2>
            </div>
            {/* A/B/C/D 图片选项 2列 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { id: 'A', label: '黑发黑瞳，颜色很深', sub: '→ 高对比、深色承受力强', img: '/Black_Eyes.png' },
                { id: 'B', label: '深棕发 / 深棕瞳', sub: '→ 中对比，适合稳定色', img: '/Dark_brown.png' },
                { id: 'C', label: '浅棕发 / 茶色瞳', sub: '→ 明度偏轻，适合柔和浅色', img: '/Light_brown.png' },
                { id: 'D', label: '发色偏灰黑，瞳色不太亮', sub: '→ 可能偏冷、偏灰、橄榄方向', img: '/gray-black.png' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q1c')(o.id)} style={{
                  border: `2px solid ${answers.q1c === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q1c === o.id ? '#fdf8ee' : '#fff',
                  padding: 0, cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                  textAlign: 'left',
                }}>
                  <img src={o.img} alt={o.label} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                  <div style={{ padding: '10px 12px 12px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: answers.q1c === o.id ? C.h2 : C.body, margin: 0 }}>
                      <span style={{ fontSize: '11px', color: answers.q1c === o.id ? C.gold : C.muted, marginRight: '6px' }}>{o.id}</span>
                      {o.label}
                    </p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: '4px 0 0' }}>{o.sub}</p>
                  </div>
                </button>
              ))}
            </div>
            {/* E 选项纯文字 */}
            <button onClick={() => set('q1c')('E')} style={{
              border: `1.5px solid ${answers.q1c === 'E' ? C.gold : C.border}`,
              borderRadius: '8px', background: answers.q1c === 'E' ? '#fdf8ee' : '#fff',
              padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'center',
            }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: answers.q1c === 'E' ? C.gold : C.muted, letterSpacing: '1px' }}>E</span>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: answers.q1c === 'E' ? C.h2 : C.body, margin: 0 }}>染发较多，不确定</p>
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q1c} style={!answers.q1c ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {/* ── Q1d 黑色上衣 ── */}
        {step === 'q1d' && (
          <QuestionStep tag="Step 04 · 黑色上衣"
            title="素颜时，你穿黑色上衣通常怎样？"
            options={[
              { id: 'A', label: '显得五官更清楚，很有气场', sub: '→ 高对比，可能偏冬季/戏剧感' },
              { id: 'B', label: '可以穿，但有点沉重', sub: '→ 中对比，需要搭配妆容或配饰' },
              { id: 'C', label: '显老、显累、显暗', sub: '→ 低对比，或橄榄/灰黄肤色信号' },
              { id: 'D', label: '不确定', sub: '' },
            ]}
            value={answers.q1d} onChange={set('q1d')} onNext={next} onBack={back} />
        )}

        {/* ── Q2 冷暖色卡 ── */}
        {step === 'q2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 05 · 冷暖色卡</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>哪一组颜色靠近脸时，更让你显得干净、有气色？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>准备几块纯色方巾、衣服或彩色纸，分别放在脸部下方对比</p>
            </div>
            {/* 暖调色卡 */}
            <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px', background: '#fff' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px', marginBottom: '10px' }}>暖调组</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[['奶油白','#F5F0E8'],['杏色','#E8C4A0'],['蜜桃','#FFBB99'],['焦糖','#C68642'],['橘红','#E8734A'],['暖咖','#8B6347']].map(([n,h]) => (
                  <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: h, border: `1px solid ${C.border}` }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* 冷调色卡 */}
            <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px', background: '#fff' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px', marginBottom: '10px' }}>冷调组</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[['纯白','#FFFFFF'],['冷灰','#8A9099'],['玫瑰粉','#F4A0B8'],['藏蓝','#1C2E5A'],['蓝红','#C2185B'],['银灰','#B0B8C4']].map(([n,h]) => (
                  <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: h, border: `1px solid ${C.border}` }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '暖调组更好看，更提气色', sub: '' },
                { id: 'B', label: '冷调组更好看，更干净清透', sub: '' },
                { id: 'C', label: '两组都可以，没有明显差别', sub: '' },
                { id: 'D', label: '两组都一般，放上去都不太好看', sub: '→ 可能是橄榄或暗沉肤色的信号' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q2')(o.id)} style={{
                  border: `1.5px solid ${answers.q2 === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q2 === o.id ? '#fdf8ee' : '#fff',
                  padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: answers.q2 === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0, marginTop: '2px' }}>{o.id}</span>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: answers.q2 === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                    {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px', marginBottom: 0 }}>{o.sub}</p>}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q2} style={!answers.q2 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {/* ── Q3 粉色反应（橄榄筛查）── */}
        {step === 'q3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 06 · 橄榄筛查</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>如果让你自己选择，你会选哪一种颜色？</h2>
            </div>
            {/* 图片选项 A / B */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { id: 'A', label: '蜜桃粉', img: '/mitaofen.png' },
                { id: 'B', label: '玫瑰粉', img: '/rosefen.png' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q3')(o.id)} style={{
                  border: `2px solid ${answers.q3 === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q3 === o.id ? '#fdf8ee' : '#fff',
                  padding: 0, cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                }}>
                  <img src={o.img} alt={o.label} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: answers.q3 === o.id ? C.gold : C.body, padding: '10px 0', margin: 0, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: C.muted, marginRight: '6px' }}>{o.id}</span>{o.label}
                  </p>
                </button>
              ))}
            </div>
            {/* 文字选项 C / D */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'C', label: '大多数粉色让我显脏显土', sub: '→ 这是橄榄肤色的重要信号' },
                { id: 'D', label: '暖粉冷粉都可以，没有明显差别', sub: '' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q3')(o.id)} style={{
                  border: `1.5px solid ${answers.q3 === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q3 === o.id ? '#fdf8ee' : '#fff',
                  padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', display: 'flex', gap: '12px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: answers.q3 === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0, marginTop: '2px' }}>{o.id}</span>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: answers.q3 === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                    {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px', marginBottom: 0 }}>{o.sub}</p>}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button
                onClick={() => { if (answers.q3 === 'C') setStep('q3b'); else next() }}
                disabled={!answers.q3}
                style={!answers.q3 ? btnDisabledStyle : btnPrimaryStyle}
              >继续</button>
            </div>
          </div>
        )}

        {/* ── Q3b 橄榄确认（仅选C时进入）── */}
        {step === 'q3b' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 06 · 橄榄筛查（确认）</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>把这两个颜色分别靠近脸部，哪一个让你看起来更高级、更干净、五官更清楚？</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { id: 'A', label: '橘色', img: '/orange.png' },
                { id: 'B', label: '品红色', img: '/redold.png' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q3b')(o.id)} style={{
                  border: `2px solid ${answers.q3b === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q3b === o.id ? '#fdf8ee' : '#fff',
                  padding: 0, cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                }}>
                  <img src={o.img} alt={o.label} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: answers.q3b === o.id ? C.gold : C.body, padding: '10px 0', margin: 0, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: C.muted, marginRight: '6px' }}>{o.id}</span>{o.label}
                  </p>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setStep('q3')} />
              <button onClick={() => setStep('q4')} disabled={!answers.q3b} style={!answers.q3b ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {/* ── Q4 粉底问题 ── */}
        {step === 'q4' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 07 · 粉底经验</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你买粉底最常遇到什么问题？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>不用粉底也可根据印象或朋友反馈作答</p>
            </div>
            <img src="/foundation.png" alt="粉底色号参考" style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', maxHeight: '200px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '经常太粉，显得假白', sub: '' },
                { id: 'B', label: '经常太黄，找对肤色号很难', sub: '' },
                { id: 'C', label: '经常太灰，涂上去脸色更差', sub: '→ 橄榄/灰调肤色的典型问题' },
                { id: 'D', label: '容易氧化发暗，过几小时变暗', sub: '→ 暗沉或橄榄肤色信号' },
                { id: 'E', label: '很容易匹配，基本都适合', sub: '' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q4')(o.id)} style={{
                  border: `1.5px solid ${answers.q4 === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q4 === o.id ? '#fdf8ee' : '#fff',
                  padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: answers.q4 === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0, marginTop: '2px' }}>{o.id}</span>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: answers.q4 === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                    {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px', marginBottom: 0 }}>{o.sub}</p>}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => answers.q3 === 'C' ? setStep('q3b') : setStep('q3')} />
              <button onClick={next} disabled={!answers.q4} style={!answers.q4 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {/* ── Q5 金银首饰 ── */}
        {step === 'q5' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 08 · 首饰测试</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>金色和银色靠近脸，哪种更好？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>可以用金色和银色首饰分别贴近脸部对比</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <img src="/silver.png" alt="银色首饰" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, textAlign: 'center', margin: 0 }}>银色 · 白金</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <img src="/gold.png" alt="金色首饰" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: '8px' }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, textAlign: 'center', margin: 0 }}>金色 · 黄金</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '金色显气色，更贴肤自然', sub: '黄金、香槟金让肤色更亮' },
                { id: 'B', label: '银色显干净，更精致透亮', sub: '银色、白金让脸更清透' },
                { id: 'C', label: '两种都可以，没有明显差别', sub: '' },
                { id: 'D', label: '两种都一般，金银都不太衬我', sub: '→ 橄榄肤色的常见反馈' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q5')(o.id)} style={{
                  border: `1.5px solid ${answers.q5 === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q5 === o.id ? '#fdf8ee' : '#fff',
                  padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'flex-start',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: answers.q5 === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0, marginTop: '2px' }}>{o.id}</span>
                  <div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: answers.q5 === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                    {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px', marginBottom: 0 }}>{o.sub}</p>}
                  </div>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q5} style={!answers.q5 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}


        {/* ── 报告页 ── */}
        {step === 'report' && (
          <ColorReport result={result} contrast={computeContrast(answers)} onReset={reset} />
        )}

      </div>
    </div>
  )
}
