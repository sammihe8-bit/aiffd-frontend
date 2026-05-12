import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

// ─── 结果类型 ───────────────────────────────────────────────
type ColorResult =
  | '暖黄皮' | '冷黄皮' | '中性黄皮' | '橄榄黄皮'
  | '冷白皮' | '暖白皮' | '需人工复核'

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
    season12: '冷冬、深冬、明亮冬、冷夏、柔夏',
    goodColors: [
      { name: '藏蓝', hex: '#1B3A6B' }, { name: '冷灰', hex: '#8A9099' },
      { name: '蓝红', hex: '#B22222' }, { name: '酒红', hex: '#722F37' },
      { name: '冷白', hex: '#F0F4F8' }, { name: '深紫', hex: '#4B0082' },
      { name: '宝蓝', hex: '#1A56DB' }, { name: '玫瑰粉', hex: '#E8A0B0' },
    ],
    avoidColors: [
      { name: '橘色', hex: '#E8734A' }, { name: '南瓜色', hex: '#C8601A' },
      { name: '焦糖', hex: '#C68642' }, { name: '暖驼', hex: '#C4A882' },
    ],
    shopping: [
      { category: '上衣', advice: '藏蓝、冷白、宝蓝显干净清透' },
      { category: '外套', advice: '深灰、冷黑、酒红是高级选择' },
      { category: '连衣裙', advice: '玫瑰粉、蓝红、深紫最衬肤色' },
      { category: '围巾', advice: '冷灰、藏蓝提升整体清透感' },
      { category: '口红', advice: '玫红、蔷薇色、冷裸粉最显肤色' },
      { category: '首饰', advice: '银色、白金比金色更贴肤' },
    ],
  },
  '中性黄皮': {
    desc: '你的冷暖倾向不极端，关键在于明度和灰度的把控。中性色、柔和色系是你的安全区。',
    season: '春/夏/秋/冬之间进一步判断',
    season12: '需结合明暗、清浊、对比度综合判断',
    goodColors: [
      { name: '米白', hex: '#F5F0E0' }, { name: '灰咖', hex: '#9E8E7E' },
      { name: '深蓝', hex: '#1B3A6B' }, { name: '柔绿', hex: '#7A9E7E' },
      { name: '裸粉', hex: '#E8C8B8' }, { name: '烟灰', hex: '#A0A0A8' },
      { name: '暗红', hex: '#8B2020' }, { name: '雾霾蓝', hex: '#7A9EB8' },
    ],
    avoidColors: [
      { name: '过冷荧光', hex: '#B0E0FF' }, { name: '过暖亮橘', hex: '#FF8C00' },
      { name: '甜粉', hex: '#FFB6C1' }, { name: '亮柠檬', hex: '#F0E040' },
    ],
    shopping: [
      { category: '上衣', advice: '米白、裸粉、雾霾蓝最安全' },
      { category: '外套', advice: '灰咖、烟灰、深蓝百搭不出错' },
      { category: '连衣裙', advice: '避免过饱和色，选柔和中性色调' },
      { category: '围巾', advice: '柔绿、裸粉增添气色' },
      { category: '口红', advice: '豆沙、裸粉、玫瑰裸色最安全' },
      { category: '首饰', advice: '玫瑰金是中性肤色的最佳选择' },
    ],
  },
  '橄榄黄皮': {
    desc: '你的皮肤有灰绿感，粉色和橘色容易显脏。低饱和度、有深度的颜色是你的最强武器。',
    season: '夏/秋/冬之间较常见',
    season12: '柔秋、深秋、柔夏、深冬都可能',
    goodColors: [
      { name: '墨绿', hex: '#2D5A3D' }, { name: '灰蓝', hex: '#6A7E8A' },
      { name: '炭灰', hex: '#4A4A4A' }, { name: '深咖', hex: '#5A3E2B' },
      { name: '酒红', hex: '#722F37' }, { name: '低饱和橄榄', hex: '#7A7A4A' },
      { name: '烟紫', hex: '#7A6A8A' }, { name: '裸棕', hex: '#9A7A6A' },
    ],
    avoidColors: [
      { name: '甜粉', hex: '#FFB6C1' }, { name: '亮橘', hex: '#FF8C00' },
      { name: '土黄', hex: '#C8A820' }, { name: '过白', hex: '#FFFFFF' },
    ],
    shopping: [
      { category: '上衣', advice: '墨绿、炭灰、灰蓝最显气色' },
      { category: '外套', advice: '深咖、酒红、烟紫是高级选择' },
      { category: '连衣裙', advice: '低饱和色调，避免糖果色' },
      { category: '围巾', advice: '橄榄绿、深灰增添高级感' },
      { category: '口红', advice: '裸棕、深玫瑰、豆沙红显气色' },
      { category: '首饰', advice: '黄金、玫瑰金比冷银更适合' },
    ],
  },
  '冷白皮': {
    desc: '你的皮肤偏粉、蓝、玫瑰感，是冷调白皮。冷色系让你更干净透亮，暖土色系容易显暗黄。',
    season: '冬季 / 夏季',
    season12: '冷冬、明亮冬、冷夏',
    goodColors: [
      { name: '冰白', hex: '#F0F4F8' }, { name: '黑色', hex: '#111111' },
      { name: '冷红', hex: '#C2185B' }, { name: '宝蓝', hex: '#1A56DB' },
      { name: '银色', hex: '#C0C0C8' }, { name: '薰衣草', hex: '#9B89B8' },
      { name: '深紫', hex: '#4B0082' }, { name: '玫瑰粉', hex: '#E8A0B0' },
    ],
    avoidColors: [
      { name: '土黄', hex: '#C8A820' }, { name: '焦糖', hex: '#C68642' },
      { name: '橘棕', hex: '#C0784A' }, { name: '暖驼', hex: '#C4A882' },
    ],
    shopping: [
      { category: '上衣', advice: '冰白、冷红、宝蓝最显肤色' },
      { category: '外套', advice: '黑色、深紫、冷灰极显高级' },
      { category: '连衣裙', advice: '薰衣草、玫瑰粉、冷白最衬肤' },
      { category: '围巾', advice: '银灰、冷粉让肤色更透亮' },
      { category: '口红', advice: '玫红、正红、冷裸粉最显气色' },
      { category: '首饰', advice: '银色、白金是最佳选择' },
    ],
  },
  '暖白皮': {
    desc: '你的皮肤白皙但带蜜桃、奶油感，是暖调白皮。象牙白、金色系让你更发光，冷色系容易显白无血色。',
    season: '春季',
    season12: '浅春、暖春、明亮春',
    goodColors: [
      { name: '象牙白', hex: '#FFFFF0' }, { name: '杏色', hex: '#F5CBA7' },
      { name: '珊瑚粉', hex: '#F08080' }, { name: '浅驼', hex: '#D4B896' },
      { name: '金色', hex: '#DAA520' }, { name: '蜜桃', hex: '#FFDAB9' },
      { name: '暖米', hex: '#F5E6D0' }, { name: '草莓红', hex: '#E8454A' },
    ],
    avoidColors: [
      { name: '冰蓝', hex: '#B0D8F0' }, { name: '冷紫', hex: '#9B89B8' },
      { name: '冷灰', hex: '#8A9099' }, { name: '冰白', hex: '#F0F4F8' },
    ],
    shopping: [
      { category: '上衣', advice: '象牙白、蜜桃、杏色最衬肤色' },
      { category: '外套', advice: '浅驼、暖米、草莓红显气色' },
      { category: '连衣裙', advice: '珊瑚粉、金黄、奶油白最好看' },
      { category: '围巾', advice: '蜜桃色、暖金色让肤色更发光' },
      { category: '口红', advice: '蜜桃橘、珊瑚粉、暖裸色最佳' },
      { category: '首饰', advice: '黄金是绝配，避免冷银' },
    ],
  },
  '需人工复核': {
    desc: '你的答案存在一些矛盾，可能受到光线、化妆或暗沉影响。建议上传自然光免妆照片，或预约造型师人工判断。',
    season: '暂未确定',
    season12: '需进一步判断',
    goodColors: [
      { name: '黑色', hex: '#111111' }, { name: '白色', hex: '#F5F5F5' },
      { name: '深藏蓝', hex: '#1B3A6B' }, { name: '中性灰', hex: '#808080' },
    ],
    avoidColors: [
      { name: '高饱和荧光色', hex: '#FF4500' },
    ],
    shopping: [
      { category: '建议', advice: '先从黑白灰、深藏蓝等安全色入手，待确认肤色底色后再扩展色彩范围' },
    ],
  },
}

// ─── 评分计算 ────────────────────────────────────────────────
interface Answers {
  q1: string; q2: string; q3: string; q4: string; q5: string; q6: string
  q7: string; q8: string; q9: string; q10: string; q11: string; q12: string
  q13: string; q14: string
}

function calcColorResult(a: Answers): ColorResult {
  const scores: Record<string, number> = {
    '暖黄皮': 0, '冷黄皮': 0, '中性黄皮': 0, '橄榄黄皮': 0,
    '冷白皮': 0, '暖白皮': 0,
  }

  // Q1 基础肤色
  if (a.q1 === 'A') { scores['冷白皮'] += 3; scores['暖白皮'] += 2 }
  if (a.q1 === 'B') { scores['暖白皮'] += 3; scores['暖黄皮'] += 1 }
  if (a.q1 === 'C') { scores['暖黄皮'] += 2; scores['中性黄皮'] += 2 }
  if (a.q1 === 'D') { scores['橄榄黄皮'] += 2; scores['冷黄皮'] += 1 }
  if (a.q1 === 'E') { scores['橄榄黄皮'] += 3; scores['冷黄皮'] += 2 }

  // Q2 肤色底色
  if (a.q2 === 'A') { scores['暖黄皮'] += 3; scores['暖白皮'] += 2 }
  if (a.q2 === 'B') { scores['冷白皮'] += 3; scores['冷黄皮'] += 2 }
  if (a.q2 === 'C') { scores['中性黄皮'] += 3 }
  if (a.q2 === 'D') { scores['橄榄黄皮'] += 4 }
  if (a.q2 === 'E') { scores['橄榄黄皮'] += 2; scores['冷黄皮'] += 2 }

  // Q4 暖色反应
  if (a.q4 === 'A') { scores['暖黄皮'] += 3; scores['暖白皮'] += 2 }
  if (a.q4 === 'B') { scores['冷黄皮'] += 3; scores['橄榄黄皮'] += 2 }
  if (a.q4 === 'C') { scores['冷黄皮'] += 2; scores['橄榄黄皮'] += 2 }

  // Q5 冷色反应
  if (a.q5 === 'A') { scores['冷黄皮'] += 3; scores['冷白皮'] += 2 }
  if (a.q5 === 'B') { scores['暖黄皮'] += 2; scores['暖白皮'] += 2 }
  if (a.q5 === 'D') { scores['中性黄皮'] += 2; scores['橄榄黄皮'] += 1 }

  // Q6 白色反应
  if (a.q6 === 'A') { scores['暖黄皮'] += 2; scores['暖白皮'] += 3 }
  if (a.q6 === 'B') { scores['冷黄皮'] += 2; scores['冷白皮'] += 3 }
  if (a.q6 === 'C') { scores['中性黄皮'] += 2 }
  if (a.q6 === 'D') { scores['橄榄黄皮'] += 2 }

  // Q7 粉色反应
  if (a.q7 === 'A') { scores['暖黄皮'] += 2; scores['暖白皮'] += 2 }
  if (a.q7 === 'B') { scores['冷黄皮'] += 2; scores['冷白皮'] += 2 }
  if (a.q7 === 'C') { scores['橄榄黄皮'] += 4 }

  // Q8 金银首饰
  if (a.q8 === 'A') { scores['暖黄皮'] += 2; scores['暖白皮'] += 2 }
  if (a.q8 === 'B') { scores['冷黄皮'] += 2; scores['冷白皮'] += 2 }
  if (a.q8 === 'C') { scores['中性黄皮'] += 2 }

  // Q9 粉底问题
  if (a.q9 === 'A') { scores['暖黄皮'] += 1 }
  if (a.q9 === 'B') { scores['冷黄皮'] += 2; scores['橄榄黄皮'] += 1 }
  if (a.q9 === 'C') { scores['橄榄黄皮'] += 3 }
  if (a.q9 === 'D') { scores['橄榄黄皮'] += 2; scores['冷黄皮'] += 1 }

  // 排序取最高分
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const top = sorted[0]
  const second = sorted[1]

  // 差距太小 → 需人工复核
  if (top[1] - second[1] <= 2 && top[1] < 8) return '需人工复核'
  return top[0] as ColorResult
}

// ─── 子组件 ──────────────────────────────────────────────────
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

interface QProps {
  step: number
  total: number
  tag: string
  title: string
  subtitle?: string
  options: { id: string; label: string; sub?: string }[]
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
  nextDisabled?: boolean
}

function QuestionStep({ step, total, tag, title, subtitle, options, value, onChange, onNext, onBack, nextDisabled }: QProps) {
  const btnPrimary = { flex: 1, padding: '16px', background: C.h1, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px' }
  const btnDisabled = { ...btnPrimary, background: '#ccc', cursor: 'not-allowed' as const }
  return (
    <div>
      <ProgressBar current={step} total={total} label={`COLOR TEST · STEP ${String(step).padStart(2, '0')}`} />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>{tag}</p>
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', fontWeight: 400, color: C.h1, marginBottom: '8px', lineHeight: 1.4 }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '32px', lineHeight: '1.7' }}>{subtitle}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '36px' }}>
        {options.map(o => (
          <button key={o.id} onClick={() => onChange(o.id)} style={{
            border: `1px solid ${value === o.id ? C.gold : C.border}`,
            background: value === o.id ? '#fdf8ee' : '#fff',
            padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
            transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'flex-start',
          }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: value === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0, marginTop: '2px' }}>{o.id}</span>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: value === o.id ? C.h2 : C.body, lineHeight: 1.5 }}>{o.label}</p>
              {o.sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px' }}>{o.sub}</p>}
            </div>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <BackBtn onClick={onBack} />
        <button onClick={onNext} disabled={nextDisabled ?? !value} style={{ ...(!value || nextDisabled ? btnDisabled : btnPrimary) }}>
          继续
        </button>
      </div>
    </div>
  )
}

// ─── 色盘组件 ────────────────────────────────────────────────
function ColorSwatch({ color, size = 40 }: { color: { name: string; hex: string }; size?: number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: color.hex, border: '1px solid rgba(0,0,0,0.08)', margin: '0 auto 6px' }} />
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, lineHeight: 1.3 }}>{color.name}</p>
    </div>
  )
}

// ─── 报告组件 ────────────────────────────────────────────────
function ColorReport({ result, answers, onReset }: {
  result: ColorResult
  answers: Answers
  onReset: () => void
}) {
  const profile = COLOR_PROFILES[result]
  const [activeTab, setActiveTab] = useState(0)
  const tabs = ['肤色判断', '色彩优势', '色彩风险', '推荐色盘', '购物建议', '四季参考']

  return (
    <div>
      {/* 报告头部 */}
      <div style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: '32px', marginBottom: '32px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>COLOR PROFILE · 色彩档案</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', fontWeight: 400, color: C.h1, marginBottom: '8px' }}>{result}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted }}>四季对应：{profile.season}</p>
      </div>

      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '32px', borderBottom: `1px solid ${C.border}`, overflowX: 'auto' }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{
            padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '1px',
            color: activeTab === i ? C.gold : C.muted,
            borderBottom: activeTab === i ? `1px solid ${C.gold}` : '1px solid transparent',
            marginBottom: '-1px', whiteSpace: 'nowrap', transition: 'color 0.2s',
          }}>{t}</button>
        ))}
      </div>

      {/* Tab 内容 */}

      {/* 0: 肤色判断 */}
      {activeTab === 0 && (
        <div>
          <div style={{ border: `1px solid ${C.gold}`, padding: '28px', marginBottom: '24px', background: '#fdf8ee' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '16px' }}>AIFFD 判断结果</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.h1, marginBottom: '16px' }}>{result}</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: '1.9' }}>{profile.desc}</p>
          </div>
          <div style={{ background: '#f7f4ef', padding: '20px 24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>重要说明</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8' }}>
              AIFFD 的色彩判断基于你的主观感受和穿衣反馈，结果比单纯的「黄皮=暖皮」更准确。
              但由于光线、化妆和个体差异，建议将结果作为参考起点，而非唯一标准。
            </p>
          </div>
        </div>
      )}

      {/* 1: 色彩优势 */}
      {activeTab === 1 && (
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8', marginBottom: '28px' }}>
            这些颜色靠近你的脸时，能让肤色更干净、更亮、更有气色：
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {profile.goodColors.map(c => <ColorSwatch key={c.name} color={c} size={48} />)}
          </div>
          <div style={{ background: '#f7f4ef', padding: '20px 24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>使用建议</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8' }}>
              上衣和围巾直接接触脸部，对色彩的要求最高。裤子和鞋子离脸远，对肤色影响较小，可以更灵活选择。
            </p>
          </div>
        </div>
      )}

      {/* 2: 色彩风险 */}
      {activeTab === 2 && (
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8', marginBottom: '28px' }}>
            这些颜色可能让你显黄、显土、显脏或显累，购物时需要格外注意：
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {profile.avoidColors.map(c => (
              <div key={c.name} style={{ textAlign: 'center', opacity: 0.7 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: c.hex, border: '1px solid rgba(0,0,0,0.08)', margin: '0 auto 6px', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'rgba(0,0,0,0.3)' }}>✕</div>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{c.name}</p>
              </div>
            ))}
          </div>
          <div style={{ border: '1px solid #e0a060', background: '#fff8f0', padding: '16px 20px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#a06020', lineHeight: '1.7' }}>
              ⚠ 以上颜色不代表绝对禁忌，远离脸部（如裤子、鞋子）时影响较小。上装和围巾请尽量避免。
            </p>
          </div>
        </div>
      )}

      {/* 3: 推荐色盘 */}
      {activeTab === 3 && (
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8', marginBottom: '24px' }}>
            你的专属色盘由系统根据肤色判断动态生成，分为主色、辅助色、安全色和点缀色：
          </p>
          {[
            { label: '主色', desc: '最显气色，上装首选', colors: profile.goodColors.slice(0, 3) },
            { label: '辅助色', desc: '搭配主色，增加层次', colors: profile.goodColors.slice(3, 6) },
            { label: '安全色', desc: '百搭不出错', colors: profile.goodColors.slice(6, 8) },
            { label: '点缀色', desc: '用于配饰和口红', colors: profile.avoidColors.slice(0, 1).length ? [] : profile.goodColors.slice(0, 2) },
          ].filter(g => g.colors.length > 0).map(group => (
            <div key={group.label} style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold }}>{group.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>{group.desc}</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {group.colors.map(c => <ColorSwatch key={c.name} color={c} size={44} />)}
              </div>
            </div>
          ))}
          <div style={{ background: '#f7f4ef', padding: '16px 20px', marginTop: '8px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, lineHeight: '1.7' }}>
              色盘将在你完成完整风格测试后，由造型顾问进一步定制和调整。
            </p>
          </div>
        </div>
      )}

      {/* 4: 购物建议 */}
      {activeTab === 4 && (
        <div>
          {profile.shopping.map((s, i) => (
            <div key={s.category} style={{ padding: '20px 0', borderBottom: i < profile.shopping.length - 1 ? `1px solid ${C.border}` : 'none', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '20px', alignItems: 'start' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px', color: C.gold }}>{s.category}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: '1.8' }}>{s.advice}</p>
            </div>
          ))}
        </div>
      )}

      {/* 5: 四季参考 */}
      {activeTab === 5 && (
        <div>
          <div style={{ border: `1px solid ${C.gold}`, padding: '24px', marginBottom: '24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '16px' }}>四季色彩对应</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginBottom: '6px' }}>四季系统</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: C.gold }}>{profile.season}</p>
              </div>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginBottom: '6px' }}>12季系统</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: C.h2, lineHeight: 1.5 }}>{profile.season12}</p>
              </div>
            </div>
          </div>
          <div style={{ background: '#f7f4ef', padding: '20px 24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '12px' }}>重要提示</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.8' }}>
              四季色彩是国际流行的色彩系统，但并非最终标签。AIFFD 以亚洲女性肤色为核心，
              四季对应仅供参考。你的实际肤色反应比任何标签都更重要。
            </p>
          </div>
        </div>
      )}

      {/* 底部操作 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginTop: '40px' }}>
        <button onClick={onReset}
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
  )
}

// ─── 主组件 ──────────────────────────────────────────────────
type Step = 'intro' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10' | 'q11' | 'q12' | 'q13' | 'q14' | 'report'
const STEPS: Step[] = ['intro', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13', 'q14', 'report']

export default function ColorTestPage() {
  const [step, setStep] = useState<Step>('intro')
  const [answers, setAnswers] = useState<Answers>({
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '',
    q8: '', q9: '', q10: '', q11: '', q12: '', q13: '', q14: '',
  })

  const set = (q: keyof Answers) => (v: string) => setAnswers(a => ({ ...a, [q]: v }))

  const next = () => {
    const i = STEPS.indexOf(step)
    if (i < STEPS.length - 1) setStep(STEPS[i + 1])
  }
  const back = () => {
    const i = STEPS.indexOf(step)
    if (i > 0) setStep(STEPS[i - 1])
  }

  const result = useMemo(() => calcColorResult(answers), [answers])

  const reset = () => {
    setStep('intro')
    setAnswers({ q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '', q10: '', q11: '', q12: '', q13: '', q14: '' })
  }

  const btnPrimary = { flex: 1, padding: '16px', background: C.h1, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px' }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '64px 24px 96px' }}>

        {/* ── 测试说明页 ── */}
        {step === 'intro' && (
          <div>
            <ProgressBar current={0} total={14} label="COLOR TEST" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>色彩测试</p>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: C.h1, marginBottom: '16px', lineHeight: 1.4 }}>找到属于你的真实肤色底色</h1>
            <div style={{ background: '#fdf8ee', border: `1px solid ${C.gold}`, padding: '20px 24px', marginBottom: '28px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: '1.9' }}>
                很多亚洲女性并不是简单的「黄皮」——你可能是<strong>暖黄皮、冷黄皮、中性黄皮或橄榄黄皮</strong>，
                它们的穿搭逻辑完全不同。<br /><br />
                请根据颜色靠近脸后的真实反应作答，而不是根据你对自己肤色的主观印象。
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '36px' }}>
              {[
                { num: '14', label: '道测试题' },
                { num: '7', label: '种结果分类' },
                { num: '6', label: '个报告模块' },
              ].map(s => (
                <div key={s.label} style={{ border: `1px solid ${C.border}`, padding: '20px', textAlign: 'center', background: '#fff' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.gold, marginBottom: '4px' }}>{s.num}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={next} style={{ ...btnPrimary, width: '100%' }}>开始测试</button>
          </div>
        )}

        {/* ── Q1 基础肤色 ── */}
        {step === 'q1' && (
          <QuestionStep step={1} total={14} tag="Step 01 · 基础肤色"
            title="你觉得自己的肤色更接近哪一种？"
            options={[
              { id: 'A', label: '白皙偏粉', sub: '皮肤白，带粉调或玫瑰感' },
              { id: 'B', label: '白皙偏黄', sub: '皮肤白，但带奶油或蜜桃感' },
              { id: 'C', label: '自然偏黄', sub: '正常黄色调，不深不浅' },
              { id: 'D', label: '小麦色', sub: '肤色较深，健康感' },
              { id: 'E', label: '偏暗沉', sub: '肤色暗沉，偏灰或偏黄' },
              { id: 'F', label: '不确定', sub: '因光线或化妆很难判断' },
            ]}
            value={answers.q1} onChange={set('q1')} onNext={next} onBack={back} />
        )}

        {/* ── Q2 肤色底色 ── */}
        {step === 'q2' && (
          <QuestionStep step={2} total={14} tag="Step 02 · 肤色底色"
            title="在自然光下，你的皮肤更像哪种感觉？"
            subtitle="不化妆、光线自然时观察"
            options={[
              { id: 'A', label: '金黄 / 蜜桃感', sub: '皮肤带暖意，像蜜或阳光' },
              { id: 'B', label: '粉白 / 玫瑰感', sub: '皮肤带粉调，像玫瑰或樱花' },
              { id: 'C', label: '米色 / 中性感', sub: '说不上冷暖，很中性' },
              { id: 'D', label: '灰绿 / 橄榄感', sub: '皮肤带点灰绿，不够透亮' },
              { id: 'E', label: '暗黄 / 灰黄', sub: '偏暗，有时显土气' },
              { id: 'F', label: '不确定', sub: '' },
            ]}
            value={answers.q2} onChange={set('q2')} onNext={next} onBack={back} />
        )}

        {/* ── Q3 黄皮纠偏 ── */}
        {step === 'q3' && (
          <QuestionStep step={3} total={14} tag="Step 03 · 认知纠偏"
            title="你是否一直认为「我黄，所以我是暖皮」？"
            subtitle="这是亚洲女性最常见的误判之一"
            options={[
              { id: 'A', label: '是，我一直这样以为', sub: '并根据这个认知来选颜色' },
              { id: 'B', label: '不是，我知道黄皮也可能是冷调', sub: '' },
              { id: 'C', label: '不确定，从没仔细想过', sub: '' },
            ]}
            value={answers.q3} onChange={set('q3')} onNext={next} onBack={back} />
        )}

        {/* ── Q4 暖色反应 ── */}
        {step === 'q4' && (
          <QuestionStep step={4} total={14} tag="Step 04 · 暖色反应"
            title="你穿驼色、焦糖色、橘色、南瓜色时，脸部通常怎样？"
            subtitle="回想穿着这些颜色时照镜子的感受"
            options={[
              { id: 'A', label: '显气色，脸更亮', sub: '肤色被提亮，有光泽感' },
              { id: 'B', label: '显黄显土', sub: '感觉皮肤更黄，不够干净' },
              { id: 'C', label: '显暗沉', sub: '脸色变差，没精神' },
              { id: 'D', label: '有时可以，要看深浅', sub: '' },
              { id: 'E', label: '不确定 / 很少穿这类颜色', sub: '' },
            ]}
            value={answers.q4} onChange={set('q4')} onNext={next} onBack={back} />
        )}

        {/* ── Q5 冷色反应 ── */}
        {step === 'q5' && (
          <QuestionStep step={5} total={14} tag="Step 05 · 冷色反应"
            title="你穿藏蓝、冷灰、玫红、蓝红时，脸部通常怎样？"
            options={[
              { id: 'A', label: '更干净清透，脸变白了', sub: '冷色系让你更好看' },
              { id: 'B', label: '显没精神，脸色差', sub: '冷色让你看起来疲惫' },
              { id: 'C', label: '显冷淡，感觉太强硬', sub: '' },
              { id: 'D', label: '部分颜色可以，部分不行', sub: '' },
              { id: 'E', label: '不确定', sub: '' },
            ]}
            value={answers.q5} onChange={set('q5')} onNext={next} onBack={back} />
        )}

        {/* ── Q6 白色反应 ── */}
        {step === 'q6' && (
          <QuestionStep step={6} total={14} tag="Step 06 · 白色测试"
            title="哪种白色让你脸更好看？"
            subtitle="白色是最能反映肤色底调的颜色"
            options={[
              { id: 'A', label: '奶油白 / 象牙白', sub: '偏暖的白色' },
              { id: 'B', label: '纯白 / 冰白', sub: '偏冷的白色' },
              { id: 'C', label: '两种都可以', sub: '没有明显差异' },
              { id: 'D', label: '两种都显突兀', sub: '白色系整体都不太适合我' },
              { id: 'E', label: '不确定', sub: '' },
            ]}
            value={answers.q6} onChange={set('q6')} onNext={next} onBack={back} />
        )}

        {/* ── Q7 粉色反应 ── */}
        {step === 'q7' && (
          <QuestionStep step={7} total={14} tag="Step 07 · 粉色测试"
            title="你穿粉色时最常见的情况？"
            options={[
              { id: 'A', label: '蜜桃粉最好看', sub: '暖调粉色提亮气色' },
              { id: 'B', label: '玫瑰粉最好看', sub: '冷调粉色让你更精致' },
              { id: 'C', label: '大多数粉色让我显脏', sub: '粉色容易显不干净' },
              { id: 'D', label: '暖粉冷粉都可以', sub: '' },
              { id: 'E', label: '粉色都不适合我', sub: '' },
            ]}
            value={answers.q7} onChange={set('q7')} onNext={next} onBack={back} />
        )}

        {/* ── Q8 金银首饰 ── */}
        {step === 'q8' && (
          <QuestionStep step={8} total={14} tag="Step 08 · 首饰测试"
            title="金色和银色靠近脸，哪种更好？"
            options={[
              { id: 'A', label: '金色显气色，更贴肤', sub: '黄金、香槟金让肤色更亮' },
              { id: 'B', label: '银色显干净，更精致', sub: '银色、白金让脸更透亮' },
              { id: 'C', label: '两种都可以', sub: '没有明显差异' },
              { id: 'D', label: '两种都一般', sub: '金银首饰都不特别衬我' },
              { id: 'E', label: '不确定', sub: '' },
            ]}
            value={answers.q8} onChange={set('q8')} onNext={next} onBack={back} />
        )}

        {/* ── Q9 粉底问题 ── */}
        {step === 'q9' && (
          <QuestionStep step={9} total={14} tag="Step 09 · 粉底经验"
            title="你买粉底最常遇到什么问题？"
            options={[
              { id: 'A', label: '经常太粉，显得假白', sub: '粉底总是偏粉红' },
              { id: 'B', label: '经常太黄，显土气', sub: '找到合适的肤色号很难' },
              { id: 'C', label: '经常太灰，显没气色', sub: '粉底让脸色更差' },
              { id: 'D', label: '容易氧化发暗', sub: '刚涂好看，过几小时变暗' },
              { id: 'E', label: '很容易匹配，基本都适合', sub: '' },
              { id: 'F', label: '不用粉底', sub: '' },
            ]}
            value={answers.q9} onChange={set('q9')} onNext={next} onBack={back} />
        )}

        {/* ── Q10 发色瞳色 ── */}
        {step === 'q10' && (
          <QuestionStep step={10} total={14} tag="Step 10 · 发色瞳色"
            title="你的自然发色和瞳色更接近？"
            options={[
              { id: 'A', label: '黑发黑瞳', sub: '发色深黑，瞳色深黑' },
              { id: 'B', label: '深棕发深棕瞳', sub: '自然深棕色，阳光下略显棕' },
              { id: 'C', label: '浅棕发浅瞳', sub: '发色和瞳色都偏浅' },
              { id: 'D', label: '发色偏灰黑', sub: '发色带灰调，不是纯黑' },
              { id: 'E', label: '染发较多，不确定自然发色', sub: '' },
            ]}
            value={answers.q10} onChange={set('q10')} onNext={next} onBack={back} />
        )}

        {/* ── Q11 面部对比度 ── */}
        {step === 'q11' && (
          <QuestionStep step={11} total={14} tag="Step 11 · 面部对比度"
            title="素颜时，你的眉眼唇和皮肤对比明显吗？"
            options={[
              { id: 'A', label: '很明显，五官立体', sub: '眉眼唇色深，肤色浅，对比强烈' },
              { id: 'B', label: '中等，不强不弱', sub: '' },
              { id: 'C', label: '很柔和，五官颜色淡', sub: '整体偏柔和，不太有立体感' },
              { id: 'D', label: '眉眼淡，嘴唇偏浅', sub: '' },
              { id: 'E', label: '不确定', sub: '' },
            ]}
            value={answers.q11} onChange={set('q11')} onNext={next} onBack={back} />
        )}

        {/* ── Q12 色彩安全区 ── */}
        {step === 'q12' && (
          <QuestionStep step={12} total={14} tag="Step 12 · 色彩安全区"
            title="你日常最安全、最不出错的颜色是？"
            options={[
              { id: 'A', label: '黑白灰', sub: '无彩色系，百搭万能' },
              { id: 'B', label: '米白、驼色、咖色', sub: '暖中性色系' },
              { id: 'C', label: '藏蓝、深灰', sub: '冷深色系' },
              { id: 'D', label: '墨绿、酒红', sub: '有深度的彩色' },
              { id: 'E', label: '粉色、紫色、蓝色', sub: '柔和彩色系' },
              { id: 'F', label: '不确定', sub: '' },
            ]}
            value={answers.q12} onChange={set('q12')} onNext={next} onBack={back} />
        )}

        {/* ── Q13 色彩风险区 ── */}
        {step === 'q13' && (
          <QuestionStep step={13} total={14} tag="Step 13 · 色彩风险区"
            title="哪些颜色最容易让你显黄、显土、显累？"
            options={[
              { id: 'A', label: '橘色 / 南瓜色', sub: '' },
              { id: 'B', label: '驼色 / 焦糖色', sub: '' },
              { id: 'C', label: '粉色系', sub: '粉色容易让我显脏' },
              { id: 'D', label: '灰色系', sub: '灰色让我显暗沉没气色' },
              { id: 'E', label: '黑色', sub: '黑色让我显憔悴' },
              { id: 'F', label: '纯白', sub: '纯白让我显黄' },
              { id: 'G', label: '不确定', sub: '' },
            ]}
            value={answers.q13} onChange={set('q13')} onNext={next} onBack={back} />
        )}

        {/* ── Q14 场景需求 ── */}
        {step === 'q14' && (
          <QuestionStep step={14} total={14} tag="Step 14 · 场景需求"
            title="你最希望色彩建议解决什么问题？"
            options={[
              { id: 'A', label: '职场高级感', sub: '专业、有分量、不出错' },
              { id: 'B', label: '显年轻', sub: '看起来比实际年龄小5岁' },
              { id: 'C', label: '显白显气色', sub: '脸色更好，皮肤更透亮' },
              { id: 'D', label: '减少购物失误', sub: '不再买回来发现不对' },
              { id: 'E', label: '高端场合', sub: '宴会、重要活动的色彩指导' },
              { id: 'F', label: '日常穿搭', sub: '每天穿衣不费脑' },
            ]}
            value={answers.q14} onChange={set('q14')}
            onNext={() => setStep('report')}
            onBack={back} />
        )}

        {/* ── 报告页 ── */}
        {step === 'report' && (
          <ColorReport result={result} answers={answers} onReset={reset} />
        )}

      </div>
    </div>
  )
}
