import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { userScopedKey } from '../utils/userStorage'
import ThreeStageProgress from '../components/ThreeStageProgress'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#faf9f7', dark: '#0f0f0d',
}

type WarmCoolResult = 'warm' | 'cool' | 'neutral_warm' | 'neutral_cool' | 'olive'
type StepKey = 'intro' | 'ai_result' | 'booking' | 'q0' | 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'report'

interface Answers {
  q0: string; q1: string; q2: string; q3: string; q4: string; q5: string
}

// ── 冷暖判断逻辑（保持不变）──────────────────────────────────
function computeWarmCool(a: Answers): WarmCoolResult {
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
    title: '暖调倾向', subtitle: '你的肤色底色偏暖，金色、蜜桃、奶油感的颜色最衬你',
    desc: '你更适合带金色感、蜜桃感、焦糖感的颜色靠近脸部。暖色系能让你的气色更饱满，冷色调容易让你显灰或显土。',
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
    title: '冷调倾向', subtitle: '你的肤色底色偏冷，玫瑰、蓝调、银灰感的颜色最衬你',
    desc: '你更适合带蓝调、玫瑰感、冷白、银灰感的颜色。冷色调能让你的肤色更干净透亮，暖色调容易让你显黄或显老。',
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
    title: '中性偏暖', subtitle: '你的冷暖不极端，但略偏暖调，色彩选择空间较宽',
    desc: '你的肤色冷暖信号不强烈，偏暖但不明显。可以驾驭冷暖两侧的颜色，但暖调略占优势。',
    next: '进入四季测试（春 / 秋 / 夏 交叉判断）',
    goodColors: [
      { name: '白色', hex: '#F8F8F8' }, { name: '米色', hex: '#E8DCC8' },
      { name: '裸粉', hex: '#D4A5A0' }, { name: '暖橘', hex: '#E8834A' },
      { name: '绿灰', hex: '#8AA89A' }, { name: '浅紫', hex: '#B09EC8' },
      { name: '墨绿', hex: '#2D5A3D' }, { name: '浅蓝', hex: '#7AA8C4' },
    ],
    avoidColors: [{ name: '荧光色', hex: '#FFFF00' }, { name: '高饱和橘', hex: '#FF5500' }],
    tip: '中性肤色的优势是灵活，缺点是容易买错——后续测试会帮你锁定最安全的色彩范围。',
  },
  neutral_cool: {
    title: '中性偏冷', subtitle: '你的冷暖不极端，但略偏冷调，色彩选择空间较宽',
    desc: '你的肤色冷暖信号不强烈，偏冷但不明显。冷调颜色略占优势，但不至于完全排斥暖色。',
    next: '进入四季测试（夏 / 冬 / 秋 交叉判断）',
    goodColors: [
      { name: '白色', hex: '#F8F8F8' }, { name: '冷灰', hex: '#B0B8C4' },
      { name: '裸粉', hex: '#D4A5A0' }, { name: '浅蓝', hex: '#7AA8C4' },
      { name: '绿灰', hex: '#8AA89A' }, { name: '浅紫', hex: '#B09EC8' },
      { name: '墨绿', hex: '#2D5A3D' }, { name: '米色', hex: '#E8DCC8' },
    ],
    avoidColors: [{ name: '荧光色', hex: '#FFFF00' }, { name: '高饱和橘', hex: '#FF5500' }],
    tip: '中性偏冷的人往往比较百搭，但最出彩的颜色在冷调一侧——后续测试会帮你找到它。',
  },
  olive: {
    title: '橄榄 / 灰黄倾向', subtitle: '你可能不是普通黄皮，而是带灰绿感或灰冷感的橄榄肤色',
    desc: '你的肤色信号指向橄榄或灰黄倾向。墨绿、灰蓝、炭灰、酒红、深咖这类颜色反而让你显高级。',
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
    tip: '橄榄肤色是亚洲女性中最容易被误判的类型，有自己独特的色彩逻辑。',
  },
}

// AI 占位结果（上传照片后模拟返回）
const AI_MOCK_RESULT = {
  warmCool: 'neutral_warm' as WarmCoolResult,
  confidence: 82,
  season: '春 / 长夏交界',
  skinTone: '中性偏暖，带轻微橄榄底调',
  bestColors: [
    { name: '燕麦', hex: '#D4C4A8' }, { name: '暖米', hex: '#E8DCC8' },
    { name: '浅橄榄', hex: '#B8C4A0' }, { name: '玫瑰金', hex: '#C4A882' },
    { name: '浅杏', hex: '#F5DDB0' }, { name: '灰绿', hex: '#9AAA8A' },
  ],
  avoidColors: [
    { name: '纯黑', hex: '#1A1A1A' }, { name: '冷粉', hex: '#F4A0B8' },
    { name: '荧光橘', hex: '#FF6600' },
  ],
  analysis: '根据照片分析，你的肤色底调为中性偏暖，带有轻微的橄榄绿底色。适合明度中等、饱和度偏低的暖调色系，避免高对比或高饱和的冷色靠近脸部。',
}

// 城市数据
const CITIES: Record<string, string[]> = {
  '华北': ['北京', '天津', '石家庄', '太原', '呼和浩特'],
  '华东': ['上海', '南京', '杭州', '苏州', '宁波', '合肥', '福州', '厦门'],
  '华南': ['广州', '深圳', '珠海', '佛山', '成都'],
  '华中': ['武汉', '长沙', '郑州', '南昌'],
  '西南': ['成都', '重庆', '昆明', '贵阳'],
  '港澳台': ['香港', '澳门', '台北'],
  '海外': ['新加坡', '洛杉矶', '纽约', '伦敦', '悉尼'],
}

const btnGold: React.CSSProperties = {
  flex: 1, padding: '14px 0', background: C.gold, color: '#fff',
  border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif',
  fontSize: '14px', letterSpacing: '1px', cursor: 'pointer',
}
const btnDisabled: React.CSSProperties = {
  ...btnGold, background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed',
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

// ── 问卷结果报告组件 ──────────────────────────────────────────
function ColorReport({ result, onReset }: { result: WarmCoolResult; onReset: () => void }) {
  const profile = RESULT_PROFILES[result]
  const navigate = useNavigate()
  const { user } = useAuth() // 存档时给 key 加用户前缀，避免不同账号互相覆盖/看到彼此的色彩测试结果
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
          冷暖方向已确认。第二层将进一步判断你适合浅色还是深色、清亮色还是柔和色，锁定你的五季类型。
        </p>
        <button onClick={() => {
          localStorage.setItem(userScopedKey('aiffd_warmcool', user), result)
          localStorage.setItem(userScopedKey('aiffd_color_result', user), JSON.stringify({ experience: ['done'], colorGroup: result }))
          navigate('/test/color/season')
        }} style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: '6px', padding: '13px 28px', fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '1px', cursor: 'pointer' }}>
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

// ── 预约造型师组件 ────────────────────────────────────────────
function BookingPage({ onBack }: { onBack: () => void }) {
  const [serviceType, setServiceType] = useState<'offline' | 'online' | ''>('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const cities = selectedRegion ? CITIES[selectedRegion] || [] : []

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontSize: '56px' }}>✦</div>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.gold, fontWeight: 400, marginBottom: '12px' }}>预约申请已提交</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.8, maxWidth: '360px', margin: '0 auto' }}>
            我们会在 24 小时内根据你的城市和需求，为你匹配合适的造型师并联系你确认预约时间。
          </p>
        </div>
        <div style={{ background: '#fdf8ee', borderRadius: '10px', padding: '20px', textAlign: 'left' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>预约摘要</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: '0 0 6px' }}>服务方式：{serviceType === 'offline' ? '线下到店' : '线上视频'}</p>
          {selectedCity && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: '0 0 6px' }}>城市：{selectedCity}</p>}
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, margin: 0 }}>联系方式：{contact}</p>
        </div>
        <Link to="/profile" style={{ display: 'inline-block', padding: '14px 32px', background: C.gold, color: '#fff', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', borderRadius: '6px' }}>
          查看我的档案 →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>人工色彩分析</p>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.h1, fontWeight: 400, lineHeight: 1.3, margin: '0 0 10px' }}>
          预约专业造型师
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.8, margin: 0 }}>
          由专业色彩造型师为你进行一对一分析，结果更精准，适合对色彩有较高要求的用户。
        </p>
      </div>

      {/* 服务方式 */}
      <div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.h2, letterSpacing: '1px', marginBottom: '12px' }}>选择服务方式</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { id: 'offline' as const, icon: '🏠', title: '线下到店', desc: '前往造型师工作室，面对面色彩分析，最精准' },
            { id: 'online' as const, icon: '💻', title: '线上视频', desc: '视频连线造型师，足不出户完成色彩分析' },
          ].map(o => (
            <button key={o.id} onClick={() => setServiceType(o.id)} style={{
              border: `2px solid ${serviceType === o.id ? C.gold : C.border}`,
              borderRadius: '10px', background: serviceType === o.id ? '#fdf8ee' : '#fff',
              padding: '20px 16px', cursor: 'pointer', textAlign: 'left', transition: 'all .2s',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>{o.icon}</div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: serviceType === o.id ? C.gold : C.h2, margin: '0 0 6px' }}>{o.title}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0, lineHeight: 1.6 }}>{o.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 城市选择（线下或线上均显示，用于匹配） */}
      {serviceType && (
        <div>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.h2, letterSpacing: '1px', marginBottom: '12px' }}>
            {serviceType === 'offline' ? '选择你的城市（匹配附近工作室）' : '选择你所在城市（匹配可线上服务的造型师）'}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {Object.keys(CITIES).map(region => (
              <button key={region} onClick={() => { setSelectedRegion(region); setSelectedCity('') }} style={{
                padding: '6px 14px', border: `1px solid ${selectedRegion === region ? C.gold : C.border}`,
                borderRadius: '20px', background: selectedRegion === region ? C.gold : '#fff',
                color: selectedRegion === region ? '#fff' : C.muted,
                fontFamily: 'Inter, sans-serif', fontSize: '12px', cursor: 'pointer', transition: 'all .2s',
              }}>{region}</button>
            ))}
          </div>
          {selectedRegion && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {cities.map(city => (
                <button key={city} onClick={() => setSelectedCity(city)} style={{
                  padding: '8px 18px', border: `1px solid ${selectedCity === city ? C.gold : C.border}`,
                  borderRadius: '6px', background: selectedCity === city ? '#fdf8ee' : '#fff',
                  color: selectedCity === city ? C.gold : C.body,
                  fontFamily: 'Inter, sans-serif', fontSize: '13px', cursor: 'pointer', transition: 'all .2s',
                }}>{city}</button>
              ))}
            </div>
          )}

          {/* 线上服务提示 */}
          {serviceType === 'online' && (
            <div style={{ marginTop: '12px', background: '#fdf8ee', borderRadius: '8px', padding: '12px 16px', borderLeft: `3px solid ${C.gold}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>
                💡 即使选择线上服务，填写城市可帮助我们优先推荐同时区、语言相近的造型师，沟通更顺畅。
              </p>
            </div>
          )}

          {/* 造型师占位卡片 */}
          {selectedCity && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, letterSpacing: '2px', marginBottom: '12px' }}>
                {selectedCity} · {serviceType === 'offline' ? '附近工作室' : '可线上服务造型师'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: '造型师匹配中', studio: `正在为你匹配 ${selectedCity} 的专业造型师`, available: true },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>✦</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: C.h2, margin: '0 0 4px' }}>{s.name}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{s.studio}</p>
                    </div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 联系信息 */}
      {serviceType && selectedCity && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.h2, letterSpacing: '1px', margin: 0 }}>你的联系方式</p>
          <div>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, display: 'block', marginBottom: '6px' }}>姓名</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="你的姓名"
              style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '14px', background: '#fff', boxSizing: 'border-box' as const, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, display: 'block', marginBottom: '6px' }}>联系方式（手机 / 微信 / 邮箱）</label>
            <input
              type="text" value={contact} onChange={e => setContact(e.target.value)}
              placeholder="方便联系你的方式"
              style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '14px', background: '#fff', boxSizing: 'border-box' as const, outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, display: 'block', marginBottom: '6px' }}>备注（选填）</label>
            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="希望分析的重点、时间偏好等..."
              rows={3}
              style={{ width: '100%', padding: '12px 14px', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '14px', background: '#fff', boxSizing: 'border-box' as const, outline: 'none', resize: 'vertical' as const }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <BackBtn onClick={onBack} />
        <button
          onClick={() => { if (serviceType && selectedCity && contact) setSubmitted(true) }}
          disabled={!serviceType || !selectedCity || !contact}
          style={{ ...(!serviceType || !selectedCity || !contact ? btnDisabled : btnGold), flex: 1 }}
        >
          提交预约申请
        </button>
      </div>
    </div>
  )
}

// ── 主页面 ────────────────────────────────────────────────────
export default function ColorTestPage() {
  const navigate = useNavigate()
  const { user } = useAuth() // 存 AI 结果页 warmCool 时也要用同一个用户前缀
  const [step, setStep] = useState<StepKey>('intro')
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [answers, setAnswers] = useState<Answers>({ q0: '', q1: '', q2: '', q3: '', q4: '', q5: '' })

  // 色彩测试跨三个页面（冷暖 → 五季 → 副气），东方25季是最后一层，
  // 只要这个存在就说明三层全走完了，一进这个入口页就该直接给结论摘要，而不是让用户从头重答
  const [completedSummary, setCompletedSummary] = useState<{
    warmCoolTitle: string; seasonName: string; elementName: string; finalSeason25: string
  } | null>(null)

  useEffect(() => {
    const finalSeason25 = localStorage.getItem(userScopedKey('aiffd_25season', user))
    if (finalSeason25) {
      const warmCool = localStorage.getItem(userScopedKey('aiffd_warmcool', user)) as WarmCoolResult | null
      const seasonName = localStorage.getItem(userScopedKey('aiffd_season_name', user)) || ''
      const elementName = localStorage.getItem(userScopedKey('aiffd_element_name', user)) || ''
      setCompletedSummary({
        warmCoolTitle: warmCool ? RESULT_PROFILES[warmCool].title : '',
        seasonName, elementName, finalSeason25,
      })
    } else {
      setCompletedSummary(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // "重新测试"：清空色彩测试三层的所有存档，从冷暖测试第一步重新开始
  const restartColorTest = () => {
    const keysToClear = [
      'aiffd_warmcool', 'aiffd_color_result', 'aiffd_season_result', 'aiffd_season_name',
      'aiffd_season_element', 'aiffd_element_result', 'aiffd_element_name', 'aiffd_25season',
    ]
    keysToClear.forEach(k => localStorage.removeItem(userScopedKey(k, user)))
    setCompletedSummary(null)
    reset()
  }

  const set = (key: keyof Answers) => (val: string) => setAnswers(prev => ({ ...prev, [key]: val }))
  const stepOrder: StepKey[] = ['intro', 'q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'report']
  const next = () => { const i = stepOrder.indexOf(step); if (i < stepOrder.length - 1) setStep(stepOrder[i + 1]) }
  const back = () => {
    const m: Partial<Record<StepKey, StepKey>> = { q0: 'intro', q1: 'q0', q2: 'q1', q3: 'q2', q4: 'q3', q5: 'q4', report: 'q5' }
    const p = m[step]; if (p) setStep(p)
  }
  const reset = () => { setAnswers({ q0: '', q1: '', q2: '', q3: '', q4: '', q5: '' }); setStep('intro'); setPhotoUploaded(false) }
  const result = computeWarmCool(answers)
  const stepIndex: Record<StepKey, number> = { intro: 0, ai_result: 0, booking: 0, q0: 1, q1: 2, q2: 3, q3: 4, q4: 5, q5: 6, report: 7 }
  const progress = ['intro', 'ai_result', 'booking', 'report'].includes(step) ? 0 : (stepIndex[step] / 6) * 100

  const handlePhotoUpload = () => {
    setPhotoUploaded(true)
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzing(false)
      setStep('ai_result')
    }, 2200)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: '60px' }}>
      <ThreeStageProgress
        activeStage="color"
        formDone={!!localStorage.getItem(userScopedKey('aiffd_style_result', user))}
        colorDone={!!localStorage.getItem(userScopedKey('aiffd_25season', user))}
        preferenceDone={false}
        currentLabel={
          step === 'q0' ? '明度判断' : step === 'q1' ? '首饰测试' : step === 'q2' ? '冷暖色卡'
            : step === 'q3' ? '橘色驼色反应' : step === 'q4' ? '粉色反应' : step === 'q5' ? '综合颜色反应' : undefined
        }
        currentNum={['q0','q1','q2','q3','q4','q5'].includes(step) ? stepIndex[step] : undefined}
        currentTotal={['q0','q1','q2','q3','q4','q5'].includes(step) ? 6 : undefined}
      />
      {!['intro', 'ai_result', 'booking', 'report'].includes(step) && (
        <div style={{ height: '3px', background: C.border }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.gold, transition: 'width 0.3s ease' }} />
        </div>
      )}

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 32px' }}>

        {/* ── 已完成过色彩测试三层：直接给结论摘要，不再从头走一遍 ── */}
        {completedSummary && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.gold, marginBottom: '16px' }}>✓ 色彩测试已完成</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '38px', color: C.h1, fontWeight: 400, margin: '0 0 8px' }}>
                {completedSummary.finalSeason25}
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
                {completedSummary.warmCoolTitle} · {completedSummary.seasonName}季 · {completedSummary.elementName}副气
              </p>
            </div>

            <div style={{ background: '#0f0f0d', borderRadius: '10px', padding: '28px 24px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '20px' }}>
                完整的色彩档案、推荐色和避雷色可以在个人档案里查看。
              </p>
              <Link to="/profile" style={{
                display: 'inline-block', background: C.gold, color: '#fff', padding: '14px 32px',
                fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '1px', textDecoration: 'none', borderRadius: '4px',
              }}>
                查看完整档案 →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={restartColorTest} style={{ padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, cursor: 'pointer' }}>
                重新测试
              </button>
              <Link to="/onboarding" style={{ padding: '14px', background: '#f5f0e8', border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                返回测试中心
              </Link>
            </div>
          </div>
        )}

        {/* ── 首页：拍摄技巧 + 上传 ── */}
        {!completedSummary && step === 'intro' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>AIFFD · 色彩分析</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', color: C.h1, fontWeight: 400, lineHeight: 1.3, margin: '0 0 16px' }}>
                找到你的<br />完美色调
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.9, margin: 0 }}>
                上传一张照片，即可立即发现你的色彩季节、底色以及最适合你的颜色。
              </p>
            </div>

            {/* 安全承诺 */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
              {[{ icon: '🔒', text: '100% 安全' }, { icon: '⏱', text: '照片分析后自动删除' }, { icon: '✨', text: '即时出结果' }].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: '20px' }}>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.body }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* 拍摄技巧清单 */}
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', background: C.gold }}>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#fff', margin: 0, letterSpacing: '1px' }}>
                  照片准备清单 · 5个要点
                </p>
              </div>
              {[
                { icon: '☀️', title: '自然光', desc: '靠近窗户，避免强烈的阳光直射' },
                { icon: '💆', title: '素颜', desc: '不化妆，以便进行准确分析' },
                { icon: '🏠', title: '中性背景', desc: '白色、灰色或素色墙面' },
                { icon: '👁', title: '面向前方', desc: '表情放松，双眼睁开' },
                { icon: '💇', title: '头发向后梳', desc: '清晰地露出发际线和耳朵' },
              ].map((item, i, arr) => (
                <div key={item.title} style={{
                  display: 'flex', gap: '14px', alignItems: 'center',
                  padding: '14px 20px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fdf8ee', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '17px' }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: C.h2, margin: '0 0 2px' }}>{item.title}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 上传区域 */}
            {analyzing ? (
              <div style={{ border: `2px solid ${C.gold}`, borderRadius: '12px', padding: '48px 24px', textAlign: 'center', background: '#fdf8ee' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⟳</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: C.gold, marginBottom: '8px' }}>AI 正在分析你的照片…</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>通常需要 2–3 秒</p>
              </div>
            ) : (
              <div
                style={{ border: `2px dashed ${C.gold}`, borderRadius: '12px', padding: '48px 24px', textAlign: 'center', background: '#fdf8ee', cursor: 'pointer', transition: 'background .2s' }}
                onClick={() => document.getElementById('colorPhotoInput')?.click()}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: C.h2, margin: '0 0 8px' }}>点击上传照片</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>支持 JPG、PNG · 建议正面素颜照</p>
                <input
                  id="colorPhotoInput" type="file" accept="image/*" capture="user"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </div>
            )}

            {/* 跳过入口 */}
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setStep('q0')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                没有合适的照片？直接进行问卷测试
              </button>
            </div>
          </div>
        )}

        {/* ── AI 分析结果页 ── */}
        {step === 'ai_result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* 标题 */}
            <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>AI 照片分析结果</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '36px', color: C.h1, fontWeight: 400, margin: '0 0 8px' }}>
                {RESULT_PROFILES[AI_MOCK_RESULT.warmCool].title}
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: '0 0 12px' }}>
                {AI_MOCK_RESULT.skinTone}
              </p>
              {/* 置信度 */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', background: '#fdf8ee', border: `1px solid ${C.gold}`, borderRadius: '20px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold }}>AI 置信度</span>
                <div style={{ width: '80px', height: '4px', background: C.border, borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${AI_MOCK_RESULT.confidence}%`, background: C.gold }} />
                </div>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: C.gold }}>{AI_MOCK_RESULT.confidence}%</span>
              </div>
            </div>

            {/* AI 解读 */}
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '24px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>AIFFD AI 解读</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.9, margin: '0 0 8px' }}>{AI_MOCK_RESULT.analysis}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: 0 }}>
                预测五季方向：<strong style={{ color: C.gold }}>{AI_MOCK_RESULT.season}</strong>
              </p>
            </div>

            {/* 推荐色 + 避开色 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '16px' }}>最适合你的颜色</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {AI_MOCK_RESULT.bestColors.map(c => (
                    <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.hex, border: `1px solid ${C.border}` }} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, textAlign: 'center' }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>建议避开</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {AI_MOCK_RESULT.avoidColors.map(c => (
                    <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: c.hex, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 'bold' }}>✕</span>
                      </div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted, textAlign: 'center' }}>{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 满意 → 下一步 */}
            <div style={{ background: C.dark, borderRadius: '10px', padding: '24px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '10px' }}>对结果满意？</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,.6)', lineHeight: 1.8, marginBottom: '16px' }}>
                继续完成五季测试，进一步锁定你的精准色彩类型。
              </p>
              <button onClick={() => {
                localStorage.setItem(userScopedKey('aiffd_warmcool', user), AI_MOCK_RESULT.warmCool)
                navigate('/test/color/season')
              }} style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: '6px', padding: '13px 28px', fontFamily: 'Inter, sans-serif', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer', width: '100%' }}>
                继续五季测试 →
              </button>
            </div>

            {/* 不满意 → 两个选项 */}
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, textAlign: 'center', marginBottom: '12px' }}>
                结果感觉不太准确？
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button onClick={() => setStep('q0')} style={{
                  padding: '16px', border: `1px solid ${C.border}`, borderRadius: '10px',
                  background: '#fff', cursor: 'pointer', textAlign: 'left',
                }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: C.h2, margin: '0 0 6px' }}>📝 问卷自测</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0, lineHeight: 1.6 }}>通过6道问题进行更细致的色彩判断</p>
                </button>
                <button onClick={() => setStep('booking')} style={{
                  padding: '16px', border: `1px solid ${C.gold}`, borderRadius: '10px',
                  background: '#fdf8ee', cursor: 'pointer', textAlign: 'left',
                }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: C.gold, margin: '0 0 6px' }}>👤 预约人工分析</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0, lineHeight: 1.6 }}>由专业造型师一对一色彩诊断</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 预约造型师页 ── */}
        {step === 'booking' && (
          <BookingPage onBack={() => setStep('ai_result')} />
        )}

        {/* ── 问卷 q0–q5 ── */}
        {step === 'q0' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 01 · 明度判断</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>对比这两张图，你的肤色更接近哪一边？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>在自然光下，素颜观察手腕内侧或脸部</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[{ id: 'A', label: '偏白', img: '/whiteface.png' }, { id: 'B', label: '偏黄', img: '/yellowface.png' }].map(o => (
                <button key={o.id} onClick={() => set('q0')(o.id)} style={{ border: `2px solid ${answers.q0 === o.id ? C.gold : C.border}`, borderRadius: '8px', background: answers.q0 === o.id ? '#fdf8ee' : '#fff', padding: 0, cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s' }}>
                  <img src={o.img} alt={o.label} style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: answers.q0 === o.id ? C.gold : C.body, padding: '10px 0', margin: 0, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: C.muted, marginRight: '6px' }}>{o.id}</span>{o.label}
                  </p>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={() => setStep(photoUploaded ? 'ai_result' : 'intro')} />
              <button onClick={next} disabled={!answers.q0} style={!answers.q0 ? btnDisabled : btnGold}>继续</button>
            </div>
          </div>
        )}

        {step === 'q1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 02 · 首饰测试</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>金色和银色靠近脸，哪种更好？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>用金色和银色首饰分别贴近脸部对比</p>
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
                { id: 'A', label: '金色更显气色、柔和、健康' },
                { id: 'B', label: '银色更显干净、清透、高级' },
                { id: 'C', label: '金银都可以，没有明显差别' },
                { id: 'D', label: '金银都一般，都不太衬我' },
              ].map(o => <OptionBtn key={o.id} {...o} active={answers.q1 === o.id} onClick={() => set('q1')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q1} style={!answers.q1 ? btnDisabled : btnGold}>继续</button>
            </div>
          </div>
        )}

        {step === 'q2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 冷暖色卡</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>哪一组颜色靠近脸时，更让你显得干净、有气色？</h2>
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
                { id: 'A', label: '暖调组更好看，更提气色' },
                { id: 'B', label: '冷调组更好看，更干净清透' },
                { id: 'C', label: '两组都可以，没有明显差别' },
                { id: 'D', label: '两组都一般，放上去都不好看' },
              ].map(o => <OptionBtn key={o.id} {...o} active={answers.q2 === o.id} onClick={() => set('q2')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q2} style={!answers.q2 ? btnDisabled : btnGold}>继续</button>
            </div>
          </div>
        )}

        {step === 'q3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 04 · 橘色 / 驼色反应</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿橘色、南瓜色、焦糖色、驼色时，脸通常会怎样？</h2>
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
                { id: 'A', label: '更有气色、更温暖、更健康' },
                { id: 'B', label: '更黄、更土、更暗沉' },
                { id: 'C', label: '有时可以，有时不稳定' },
                { id: 'D', label: '很少穿，不确定' },
              ].map(o => <OptionBtn key={o.id} {...o} active={answers.q3 === o.id} onClick={() => set('q3')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q3} style={!answers.q3 ? btnDisabled : btnGold}>继续</button>
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
                { id: 'A', label: '蜜桃粉、珊瑚粉更显气色' },
                { id: 'B', label: '玫瑰粉、冷粉更显干净' },
                { id: 'C', label: '大多数粉色都显脏、显灰' },
                { id: 'D', label: '粉色都还可以，没有明显差别' },
                { id: 'E', label: '不确定' },
              ].map(o => <OptionBtn key={o.id} {...o} active={answers.q4 === o.id} onClick={() => set('q4')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!answers.q4} style={!answers.q4 ? btnDisabled : btnGold}>继续</button>
            </div>
          </div>
        )}

        {step === 'q5' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 06 · 综合颜色反应</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>以下哪组颜色更容易让你显高级、稳定、不显黄？</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '焦糖、橘红、暖驼、奶油白', colors: ['#C68642','#E8734A','#C4A882','#F5F0E8'] },
                { id: 'B', label: '玫瑰粉、冰白、浅蓝、银灰', colors: ['#F4A0B8','#F0F4F8','#AED6F1','#B0B8C4'] },
                { id: 'C', label: '墨绿、灰蓝、炭灰、酒红、深咖', colors: ['#2D5A3D','#5A7A9A','#4A4A4A','#7B1A2A','#5A3A20'] },
                { id: 'D', label: '都不明显，没有特别突出的那组', colors: [] },
              ].map(o => (
                <button key={o.id} onClick={() => set('q5')(o.id)} style={{ border: `1.5px solid ${answers.q5 === o.id ? C.gold : C.border}`, borderRadius: '8px', background: answers.q5 === o.id ? '#fdf8ee' : '#fff', padding: '16px 20px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: o.colors.length ? '10px' : 0 }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: answers.q5 === o.id ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0 }}>{o.id}</span>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: answers.q5 === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                  </div>
                  {o.colors.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', paddingLeft: '26px' }}>
                      {o.colors.map((hex, i) => <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', background: hex, border: `1px solid ${C.border}` }} />)}
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={() => setStep('report')} disabled={!answers.q5} style={!answers.q5 ? btnDisabled : btnGold}>查看结果</button>
            </div>
          </div>
        )}

        {step === 'report' && <ColorReport result={result} onReset={reset} />}

      </div>
    </div>
  )
}
