import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

type WarmCoolResult = 'warm' | 'cool' | 'neutral_warm' | 'neutral_cool' | 'olive'
type StepKey = 'intro' | 'q0' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'report'

interface Answers {
  q0: string; q1: string; q2: string; q3: string; q4: string; q5: string
}

function computeWarmCool(a: Answers): WarmCoolResult {
  // q0 明度方向：A=偏白 B=偏黄，影响后续四季层，本层暂记录不计分
  let warm = 0; let cool = 0; let olive = 0
  if (a.q1 === 'A') warm += 1
  else if (a.q1 === 'B') cool += 1
  else if (a.q1 === 'D') olive += 1
  if (a.q2 === 'A') warm += 2
  else if (a.q2 === 'B') cool += 2
  else if (a.q2 === 'D') olive += 2
  if (a.q3 === 'A') warm += 2
  else if (a.q3 === 'B') { cool += 1; olive += 1 }
  else if (a.q3 === 'C') olive += 1
  if (a.q4 === 'A') warm += 1
  else if (a.q4 === 'B') cool += 1
  else if (a.q4 === 'C') olive += 2
  if (a.q5 === 'A') warm += 1
  else if (a.q5 === 'B') cool += 1
  else if (a.q5 === 'C') olive += 2
  if (olive >= 4) return 'olive'
  const diff = warm - cool
  const total = warm + cool
  if (total < 3 || Math.abs(diff) <= 1) return warm >= cool ? 'neutral_warm' : 'neutral_cool'
  if (diff >= 2) return 'warm'
  if (diff <= -2) return 'cool'
  return warm >= cool ? 'neutral_warm' : 'neutral_cool'
}

const RESULT_PROFILES: Record<WarmCoolResult, {
  title: string; subtitle: string; desc: string; next: string
  goodColors: { name: string; hex: string }[]
  avoidColors: { name: string; hex: string }[]
  tip: string
}> = {
  warm: {
    title: '暖调倾向',
    subtitle: '你的肤色底色偏暖，金色、蜜桃、奶油感的颜色最衬你',
    desc: '你更适合带金色感、蜜桃感、焦糖感的颜色靠近脸部。暖色系能让你的气色更饱满，冷色调（尤其是蓝调粉、纯白、冷灰）容易让你显灰或显土。后续将进入春季 / 秋季细分测试。',
    next: '进入四季测试（春 / 秋方向）',
    goodColors: [
      { name: '奶油白', hex: '#F5F0E8' }, { name: '蜜桃', hex: '#FFBB99' },
      { name: '杏色', hex: '#E8C4A0' }, { name: '焦糖', hex: '#C68642' },
      { name: '番茄红', hex: '#C0392B' }, { name: '芥末黄', hex: '#C8A83A' },
      { name: '橄榄绿', hex: '#6B7A3E' }, { name: '暖咖', hex: '#8B6347' },
    ],
    avoidColors: [
      { name: '冰白', hex: '#F0F4F8' }, { name: '冷灰', hex: '#8A9099' },
      { name: '玫红', hex: '#C2185B' }, { name: '蓝紫', hex: '#6A5ACD' },
    ],
    tip: '黄皮不等于暖皮，但你的测试结果确认了暖调倾向。',
  },
  cool: {
    title: '冷调倾向',
    subtitle: '你的肤色底色偏冷，玫瑰、蓝调、银灰感的颜色最衬你',
    desc: '你更适合带蓝调、玫瑰感、冷白、银灰感的颜色。冷色调能让你的肤色更干净透亮，暖色调（尤其是橘色、驼色、焦糖色）容易让你显黄或显老。后续将进入夏季 / 冬季细分测试。',
    next: '进入四季测试（夏 / 冬方向）',
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
    tip: '很多亚洲女性表层偏黄，但底色其实是冷调，冷调黄皮是真实存在的类型。',
  },
  neutral_warm: {
    title: '中性偏暖',
    subtitle: '你的冷暖不极端，但略偏暖调，色彩选择空间较宽',
    desc: '你的肤色冷暖信号不强烈，偏暖但不明显。这意味着你可以驾驭冷暖两侧的颜色，但暖调略占优势。后续测试将重点看你的明度、对比度和清浊感，来细化方向。',
    next: '进入四季测试（春 / 秋 / 夏 交叉判断）',
    goodColors: [
      { name: '白色', hex: '#F8F8F8' }, { name: '米色', hex: '#E8DCC8' },
      { name: '裸粉', hex: '#D4A5A0' }, { name: '暖橘', hex: '#E8834A' },
      { name: '绿灰', hex: '#8AA89A' }, { name: '浅紫', hex: '#B09EC8' },
      { name: '墨绿', hex: '#2D5A3D' }, { name: '浅蓝', hex: '#7AA8C4' },
    ],
    avoidColors: [
      { name: '荧光色', hex: '#FFFF00' }, { name: '高饱和橘', hex: '#FF5500' },
    ],
    tip: '中性肤色的优势是灵活，缺点是容易买错——后续测试会帮你锁定最安全的色彩范围。',
  },
  neutral_cool: {
    title: '中性偏冷',
    subtitle: '你的冷暖不极端，但略偏冷调，色彩选择空间较宽',
    desc: '你的肤色冷暖信号不强烈，偏冷但不明显。冷调颜色略占优势，但不至于完全排斥暖色。后续测试将重点看明度、对比度和清浊感，来细化你的四季方向。',
    next: '进入四季测试（夏 / 冬 / 秋 交叉判断）',
    goodColors: [
      { name: '白色', hex: '#F8F8F8' }, { name: '冷灰', hex: '#B0B8C4' },
      { name: '裸粉', hex: '#D4A5A0' }, { name: '浅蓝', hex: '#7AA8C4' },
      { name: '绿灰', hex: '#8AA89A' }, { name: '浅紫', hex: '#B09EC8' },
      { name: '墨绿', hex: '#2D5A3D' }, { name: '米色', hex: '#E8DCC8' },
    ],
    avoidColors: [
      { name: '荧光色', hex: '#FFFF00' }, { name: '高饱和橘', hex: '#FF5500' },
    ],
    tip: '中性偏冷的人往往比较百搭，但最出彩的颜色在冷调一侧——后续测试会帮你找到它。',
  },
  olive: {
    title: '橄榄 / 灰黄倾向',
    subtitle: '你可能不是普通黄皮，而是带灰绿感或灰冷感的橄榄肤色',
    desc: '你的肤色信号指向橄榄或灰黄倾向。这类肤色的特点是：大多数粉色显脏、橘色驼色显土、黑色有时显憔悴，但墨绿、灰蓝、炭灰、酒红、深咖这类颜色反而显高级。后续将进入橄榄肤色专属复核路径。',
    next: '进入橄榄肤色复核测试',
    goodColors: [
      { name: '墨绿', hex: '#2D5A3D' }, { name: '灰蓝', hex: '#5A7A9A' },
      { name: '炭灰', hex: '#4A4A4A' }, { name: '酒红', hex: '#7B1A2A' },
      { name: '深咖', hex: '#5A3A20' }, { name: '卡其绿', hex: '#7A8A5A' },
      { name: '冷棕', hex: '#7A6A5A' }, { name: '象牙白', hex: '#F5F0E0' },
    ],
    avoidColors: [
      { name: '甜粉', hex: '#FF80C0' }, { name: '暖橘', hex: '#E8734A' },
      { name: '驼色', hex: '#C4A882' }, { name: '冰蓝', hex: '#AED6F1' },
    ],
    tip: '橄榄肤色是亚洲女性中最容易被误判的类型，既不是暖皮也不是冷皮，有自己独特的色彩逻辑。',
  },
}

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

function OptionBtn({ id, label, sub, active, onClick }: {
  id: string; label: string; sub?: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      border: `1.5px solid ${active ? C.gold : C.border}`,
      borderRadius: '8px', background: active ? '#fdf8ee' : '#fff',
      padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
      transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'flex-start', width: '100%',
    }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: active ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0, marginTop: '2px' }}>{id}</span>
      <div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: active ? C.h2 : C.body, margin: 0 }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px', marginBottom: 0 }}>{sub}</p>}
      </div>
    </button>
  )
}

function ColorReport({ result, onReset }: { result: WarmCoolResult; onReset: () => void }) {
  const profile = RESULT_PROFILES[result]
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ textAlign: 'center', padding: '28px 0 20px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>第一层 · 冷暖测试结果</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '38px', color: C.h1, fontWeight: 400, margin: '0 0 10px' }}>{profile.title}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, margin: 0 }}>{profile.subtitle}</p>
      </div>
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>AIFFD 解读</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.9, margin: '0 0 16px' }}>{profile.desc}</p>
        <div style={{ background: '#fdf8ee', borderRadius: '6px', padding: '12px 16px', borderLeft: `3px solid ${C.gold}` }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>💡 {profile.tip}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '16px' }}>适合色系</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {profile.goodColors.map(c => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.hex, border: `1px solid ${C.border}` }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, textAlign: 'center' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>避开色系</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {profile.avoidColors.map(c => (
              <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.hex, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', fontWeight: 'bold' }}>✕</span>
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, textAlign: 'center' }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background: '#f7f4ef', borderRadius: '10px', padding: '24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>下一步</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.8, marginBottom: '16px' }}>
          冷暖方向已确认。第二层将进一步判断你适合浅色还是深色、清亮色还是柔和色，锁定你的四季类型。
        </p>
        <button
          onClick={() => {
            localStorage.setItem('aiffd_warmcool', result)
            localStorage.setItem('aiffd_color_result', JSON.stringify({ experience: ['done'], colorGroup: result }))
            // 如果是从风格测试跳过来，色彩测试完成后继续进入五季，五季完成后跳回
            navigate('/test/color/season')
          }}
          style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: '6px', padding: '13px 28px', fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '1px', cursor: 'pointer' }}
        >
          {profile.next} →
        </button>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onReset} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, cursor: 'pointer' }}>重新测试</button>
        <Link to="/onboarding" style={{ flex: 1, padding: '14px', background: '#f5f0e8', border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>返回测试中心</Link>
      </div>
    </div>
  )
}

export default function ColorTestPage() {
  const [step, setStep] = useState<StepKey>('intro')
  const [answers, setAnswers] = useState<Answers>({ q0: '', q1: '', q2: '', q3: '', q4: '', q5: '' })
  const set = (key: keyof Answers) => (val: string) => setAnswers(prev => ({ ...prev, [key]: val }))
  const stepOrder: StepKey[] = ['intro', 'q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'report']
  const next = () => { const i = stepOrder.indexOf(step); if (i < stepOrder.length - 1) setStep(stepOrder[i + 1]) }
  const back = () => {
    const m: Partial<Record<StepKey, StepKey>> = { q0: 'intro', q1: 'q0', q2: 'q1', q3: 'q2', q4: 'q3', q5: 'q4', report: 'q5' }
    const p = m[step]; if (p) setStep(p)
  }
  const reset = () => { setAnswers({ q0: '', q1: '', q2: '', q3: '', q4: '', q5: '' }); setStep('intro') }
  const result = computeWarmCool(answers)
  const stepIndex: Record<StepKey, number> = { intro: 0, q0: 1, q1: 2, q2: 3, q3: 4, q4: 5, q5: 6, report: 7 }
  const progress = step === 'intro' ? 0 : step === 'report' ? 100 : (stepIndex[step] / 6) * 100

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', paddingBottom: '60px' }}>
      {step !== 'intro' && step !== 'report' && (
        <div style={{ height: '3px', background: C.border }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.gold, transition: 'width 0.3s ease' }} />
        </div>
      )}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 32px' }}>

        {step === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>色彩测试 · 第一层</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', color: C.h1, fontWeight: 400, lineHeight: 1.3, margin: '0 0 16px' }}>找到你的<br />完美色调！</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.9, margin: 0 }}>很多人跳过冷暖直接测四季，结果越测越乱。AIFFD 的色彩测试从最底层开始——先判断你的肤色底调是暖、冷、中性还是橄榄，再逐层细化。</p>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px', margin: 0 }}>测试说明</p>
              {['6个问题，约4分钟', '准备金色和银色首饰各一件（或找图片）', '准备几块不同颜色的布料或纸张靠近脸部', '素颜或淡妆状态，自然光下效果最佳'].map((tip, i) => (
                <p key={i} style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: 0 }}>
                  <span style={{ color: C.gold, marginRight: '8px' }}>·</span>{tip}
                </p>
              ))}
            </div>
            <div style={{ background: '#fdf8ee', borderRadius: '8px', padding: '16px 20px', borderLeft: `3px solid ${C.gold}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>💡 黄皮 ≠ 暖皮。这是亚洲女性色彩测试最常见的误区，本测试会帮你纠正。</p>
            </div>
            <button onClick={() => setStep('q0')} style={btnPrimaryStyle}>开始冷暖测试</button>
          </div>
        )}


        {step === 'q0' && (
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
                <button key={o.id} onClick={() => set('q0')(o.id)} style={{
                  border: `2px solid ${answers.q0 === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q0 === o.id ? '#fdf8ee' : '#fff',
                  padding: 0, cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                }}>
                  <img src={o.img} alt={o.label} style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: answers.q0 === o.id ? C.gold : C.body, padding: '10px 0', margin: 0, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: C.muted, marginRight: '6px' }}>{o.id}</span>{o.label}
                  </p>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setStep('intro')} />
              <button onClick={next} disabled={!answers.q0} style={!answers.q0 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'q1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 02 · 首饰测试</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>金色和银色靠近脸，哪种更好？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>可以用金色和银色首饰分别贴近脸部对比</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[{ label: '金色 · 黄金', img: '/gold.png' }, { label: '银色 · 白金', img: '/silver.png' }].map(o => (
                <div key={o.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <img src={o.img} alt={o.label} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', borderRadius: '8px', display: 'block', background: '#f5f3ef' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, textAlign: 'center', margin: 0 }}>{o.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '金色更显气色、柔和、健康', sub: '' },
                { id: 'B', label: '银色更显干净、清透、高级', sub: '' },
                { id: 'C', label: '金银都可以，没有明显差别', sub: '' },
                { id: 'D', label: '金银都一般，都不太衬我', sub: '' },
              ].map(o => <OptionBtn key={o.id} {...o} active={answers.q1 === o.id} onClick={() => set('q1')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setStep('intro')} />
              <button onClick={next} disabled={!answers.q1} style={!answers.q1 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'q2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 冷暖色卡</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>哪一组颜色靠近脸时，更让你显得干净、有气色？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>准备几块纯色布料或彩色纸，分别放在脸部下方对比</p>
            </div>
            {[
              { label: '暖调组', colors: [['奶油白','#F5F0E8'],['蜜桃','#FFBB99'],['杏色','#E8C4A0'],['焦糖','#C68642'],['橘红','#E8734A'],['暖咖','#8B6347']] },
              { label: '冷调组', colors: [['纯白','#FFFFFF'],['玫瑰粉','#F4A0B8'],['冷灰','#8A9099'],['藏蓝','#1C2E5A'],['蓝红','#C2185B'],['银灰','#B0B8C4']] },
            ].map(g => (
              <div key={g.label} style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px', background: '#fff' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px', marginBottom: '10px' }}>{g.label}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {g.colors.map(([n, h]) => (
                    <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: h, border: `1px solid ${C.border}` }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '暖调组更好看，更提气色', sub: '' },
                { id: 'B', label: '冷调组更好看，更干净清透', sub: '' },
                { id: 'C', label: '两组都可以，没有明显差别', sub: '' },
                { id: 'D', label: '两组都一般，放上去都不好看', sub: '' },
              ].map(o => <OptionBtn key={o.id} {...o} active={answers.q2 === o.id} onClick={() => set('q2')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q2} style={!answers.q2 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'q3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 04 · 橘色 / 驼色反应</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿橘色、南瓜色、焦糖色、驼色时，脸通常会怎样？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>这一题专门纠正「黄皮 = 暖皮」的误区</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[['焦糖','#C68642'],['橘红','#E8734A'],['南瓜','#D2691E'],['驼色','#C4A882']].map(([n,h]) => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: h, border: `1px solid ${C.border}` }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>{n}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '更有气色、更温暖、更健康', sub: '' },
                { id: 'B', label: '更黄、更土、更暗沉', sub: '' },
                { id: 'C', label: '有时可以，有时不稳定', sub: '' },
                { id: 'D', label: '很少穿，不确定', sub: '' },
              ].map(o => <OptionBtn key={o.id} {...o} active={answers.q3 === o.id} onClick={() => set('q3')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q3} style={!answers.q3 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'q4' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 05 · 粉色反应</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿粉色时，哪一种更适合你？</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[{ label: '蜜桃粉 · 珊瑚粉（暖调）', img: '/mitaofen.png' }, { label: '玫瑰粉 · 冷粉（冷调）', img: '/rosefen.png' }].map(o => (
                <div key={o.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <img src={o.img} alt={o.label} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', borderRadius: '8px', display: 'block', background: '#f5f3ef' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, textAlign: 'center', margin: 0 }}>{o.label}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '蜜桃粉、珊瑚粉更显气色', sub: '' },
                { id: 'B', label: '玫瑰粉、冷粉更显干净', sub: '' },
                { id: 'C', label: '大多数粉色都显脏、显灰', sub: '' },
                { id: 'D', label: '粉色都还可以，没有明显差别', sub: '' },
                { id: 'E', label: '不确定', sub: '' },
              ].map(o => <OptionBtn key={o.id} {...o} active={answers.q4 === o.id} onClick={() => set('q4')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q4} style={!answers.q4 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'q5' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 06 · 综合颜色反应</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>以下哪组颜色更容易让你显高级、稳定、不显黄？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>这一题适合亚洲女性快速自测冷暖倾向</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '焦糖、橘红、暖驼、奶油白', sub: '', colors: ['#C68642','#E8734A','#C4A882','#F5F0E8'] },
                { id: 'B', label: '玫瑰粉、冰白、浅蓝、银灰', sub: '', colors: ['#F4A0B8','#F0F4F8','#AED6F1','#B0B8C4'] },
                { id: 'C', label: '墨绿、灰蓝、炭灰、酒红、深咖', sub: '', colors: ['#2D5A3D','#5A7A9A','#4A4A4A','#7B1A2A','#5A3A20'] },
                { id: 'D', label: '都不明显，没有特别突出的那组', sub: '' },
              ].map(o => (
                <button key={o.id} onClick={() => set('q5')(o.id)} style={{
                  border: `1.5px solid ${answers.q5 === o.id ? C.gold : C.border}`,
                  borderRadius: '8px', background: answers.q5 === o.id ? '#fdf8ee' : '#fff',
                  padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', width: '100%',
                }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: 'colors' in o && o.colors ? '10px' : 0 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: answers.q5 === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0 }}>{o.id}</span>
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: answers.q5 === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginTop: '3px', marginBottom: 0 }}>{o.sub}</p>
                    </div>
                  </div>
                  {'colors' in o && o.colors && (
                    <div style={{ display: 'flex', gap: '8px', paddingLeft: '26px' }}>
                      {o.colors.map((hex, i) => (
                        <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: hex, border: `1px solid ${C.border}` }} />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={() => setStep('report')} disabled={!answers.q5} style={!answers.q5 ? btnDisabledStyle : btnPrimaryStyle}>查看结果</button>
            </div>
          </div>
        )}

        {step === 'report' && (
          <ColorReport result={result} onReset={reset} />
        )}

      </div>
    </div>
  )
}
