import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

// ─── 类型 ────────────────────────────────────────────────────
type WarmCoolInput = 'warm' | 'cool' | 'neutral_warm' | 'neutral_cool' | 'olive'
type SeasonResult = 'spring' | 'summer' | 'changxia' | 'autumn' | 'winter'
  | 'changxia_deep' | 'changxia_light' | 'changxia_standard'

// 路径类型
type PathType = 'A' | 'B' | 'C' | 'D'

interface AnswersA { a1: string; a2: string; a3: string; a4: string }
interface AnswersB { b1: string; b2: string; b3: string }
interface AnswersC { c1: string; c2: string; c3: string; c4: string }
interface AnswersD { d1: string; d2: string }

// ─── 路径判断 ─────────────────────────────────────────────────
function getPath(warmCool: WarmCoolInput): PathType {
  if (warmCool === 'warm') return 'A'
  if (warmCool === 'cool') return 'B'
  if (warmCool === 'neutral_warm' || warmCool === 'neutral_cool') return 'C'
  return 'D' // olive
}

// ─── 评分逻辑 ─────────────────────────────────────────────────
function computeA(a: AnswersA): SeasonResult {
  let spring = 0; let summer = 0; let autumn = 0
  if (a.a1 === 'A') spring += 2
  else if (a.a1 === 'B') autumn += 2
  if (a.a2 === 'A') summer += 3
  else if (a.a2 === 'B') { spring += 1; autumn += 1 }
  else if (a.a2 === 'C') autumn += 1
  if (a.a3 === 'A') spring += 2
  else if (a.a3 === 'B') autumn += 2
  else if (a.a3 === 'C') summer += 2
  if (a.a4 === 'A') { spring += 1 }
  else if (a.a4 === 'B') autumn += 1
  else if (a.a4 === 'C') summer += 2
  if (summer >= 4) return 'summer'
  if (spring >= autumn) return 'spring'
  return 'autumn'
}

function computeB(b: AnswersB): SeasonResult {
  let winter = 0; let summer = 0
  if (b.b1 === 'A') summer += 2
  else if (b.b1 === 'B') winter += 2
  else if (b.b1 === 'C') return 'changxia'
  if (b.b2 === 'A') winter += 2
  else if (b.b2 === 'B') summer += 2
  if (b.b3 === 'A') winter += 2
  else if (b.b3 === 'B') summer += 2
  if (winter >= summer) return 'winter'
  return 'summer'
}

function computeC(c: AnswersC, warmCool: WarmCoolInput): SeasonResult {
  let changxia = 0; let spring = 0; let autumn = 0
  if (c.c1 === 'A') { spring += 1; autumn += 1 }
  else if (c.c1 === 'B') changxia += 2
  else if (c.c1 === 'C') changxia += 1
  if (c.c2 === 'A') changxia += 2
  else if (c.c2 === 'B') spring += 2
  else if (c.c2 === 'C') autumn += 1
  if (c.c3 === 'A') changxia += 2
  else if (c.c3 === 'B') spring += 2
  else if (c.c3 === 'C') autumn += 2
  if (c.c4 === 'A') changxia += 2
  else if (c.c4 === 'B') spring += 2
  else if (c.c4 === 'C') autumn += 2
  if (changxia >= 4) return 'changxia'
  // 中性偏暖倾向春，中性偏冷倾向秋
  if (warmCool === 'neutral_warm') {
    if (spring >= autumn) return 'spring'
    return 'autumn'
  } else {
    if (autumn >= spring) return 'autumn'
    return 'spring'
  }
}

function computeD(d: AnswersD): SeasonResult {
  if (d.d1 === 'A' && d.d2 === 'A') return 'changxia_deep'
  if (d.d1 === 'B' && d.d2 === 'B') return 'changxia_light'
  return 'changxia_standard'
}

// ─── 结果数据库 ───────────────────────────────────────────────
const SEASON_PROFILES: Record<SeasonResult, {
  name: string
  element: string
  subtitle: string
  desc: string
  keywords: string[]
  goodColors: { name: string; hex: string }[]
  avoidColors: { name: string; hex: string }[]
  tip: string
}> = {
  spring: {
    name: '春',
    element: '木',
    subtitle: '清新 · 生发 · 明亮 · 轻盈',
    desc: '你的肤色底调偏暖，且适合浅亮清透的颜色。春季型的色彩气质是年轻感、清新感、轻盈感，穿上暖亮色会让你的气色像被光打亮。过深、过浓郁的颜色会压住你的轻盈气质。',
    keywords: ['暖调', '高明度', '清亮', '轻盈', '年轻感'],
    goodColors: [
      { name: '奶油白', hex: '#F5F0E8' }, { name: '蜜桃', hex: '#FFBB99' },
      { name: '杏色', hex: '#E8C4A0' }, { name: '浅珊瑚', hex: '#F4A57A' },
      { name: '暖米', hex: '#E8DCC8' }, { name: '浅橘', hex: '#F5A87A' },
      { name: '黄绿', hex: '#C8D870' }, { name: '暖象牙', hex: '#F2ECD8' },
    ],
    avoidColors: [
      { name: '深咖', hex: '#5A3A20' }, { name: '炭灰', hex: '#4A4A4A' },
      { name: '冷灰', hex: '#8A9099' }, { name: '深紫', hex: '#4A2060' },
    ],
    tip: '春季型不怕颜色鲜，怕颜色深——你的优势是清透感，保持明度就是保持气色。',
  },
  summer: {
    name: '夏',
    element: '火',
    subtitle: '明艳 · 热烈 · 光感 · 鲜活',
    desc: '你的肤色能承受高明度、高饱和的颜色，并且气色很强。夏季型的色彩气质是光感、鲜活、存在感强。正红、亮橘、明黄、鲜蓝这些颜色靠近你的脸，不但不显脏，反而更有精神。',
    keywords: ['高明度', '高饱和', '光感强', '鲜活', '气色强'],
    goodColors: [
      { name: '正红', hex: '#CC0000' }, { name: '亮橘', hex: '#FF6600' },
      { name: '明黄', hex: '#FFCC00' }, { name: '鲜绿', hex: '#00AA44' },
      { name: '宝蓝', hex: '#1A3A6B' }, { name: '玫红', hex: '#C2185B' },
      { name: '亮珊瑚', hex: '#FF6B6B' }, { name: '金黄', hex: '#D4A017' },
    ],
    avoidColors: [
      { name: '雾霾蓝', hex: '#8A9BAA' }, { name: '灰粉', hex: '#C8A8A8' },
      { name: '低饱和绿', hex: '#8A9A7A' }, { name: '暗驼', hex: '#A08060' },
    ],
    tip: '夏季型是五季中最能"撑住"颜色的类型——颜色越鲜，你越好看，不要委屈自己穿低饱和。',
  },
  changxia: {
    name: '长夏',
    element: '土',
    subtitle: '稳定 · 柔和 · 大地 · 低饱和',
    desc: '你不属于典型的暖皮或冷皮，而是带有土性底调的长夏型。橘色驼色显土、粉色显脏，但墨绿、灰蓝、炭灰、酒红、深咖这类低饱和大地色反而让你显高级。你的色彩优势不是"显白"，而是"稳定、高级、不显脏"。',
    keywords: ['中性', '低饱和', '大地色', '稳定感', '高级感'],
    goodColors: [
      { name: '墨绿', hex: '#2D5A3D' }, { name: '苔藓绿', hex: '#6B7A3E' },
      { name: '灰蓝', hex: '#5A7A9A' }, { name: '炭灰', hex: '#4A4A4A' },
      { name: '酒红', hex: '#7B1A2A' }, { name: '深咖', hex: '#5A3A20' },
      { name: '燕麦色', hex: '#D4C4A8' }, { name: '蘑菇色', hex: '#B0A090' },
    ],
    avoidColors: [
      { name: '甜粉', hex: '#FF80C0' }, { name: '亮橘', hex: '#FF6600' },
      { name: '暖驼', hex: '#C4A882' }, { name: '明黄', hex: '#FFCC00' },
    ],
    tip: '长夏型最大的误区是追求"显白"——你的优势是高级感和稳定感，选对颜色比显白更重要。',
  },
  changxia_deep: {
    name: '长夏·深型',
    element: '土',
    subtitle: '沉稳 · 深邃 · 高对比承受力强',
    desc: '你是长夏型中对比度承受力较强的类型。深色系——炭灰、酒红、深墨绿、冷棕——靠近脸时五官更清楚，不显憔悴。你比标准长夏更能驾驭深色，但仍需避开过度饱和的暖色。',
    keywords: ['低饱和深色', '稳定', '高级感', '对比度适中'],
    goodColors: [
      { name: '炭灰', hex: '#4A4A4A' }, { name: '酒红', hex: '#7B1A2A' },
      { name: '深墨绿', hex: '#1A3A2A' }, { name: '冷棕', hex: '#6A5A4A' },
      { name: '深灰蓝', hex: '#3A5A7A' }, { name: '深咖', hex: '#5A3A20' },
      { name: '藏蓝', hex: '#1C2E5A' }, { name: '铁灰', hex: '#5A5A5A' },
    ],
    avoidColors: [
      { name: '甜粉', hex: '#FF80C0' }, { name: '亮橘', hex: '#FF6600' },
      { name: '暖驼', hex: '#C4A882' }, { name: '奶油白', hex: '#F5F0E8' },
    ],
    tip: '深型长夏是五季中最耐看、最有气场的类型之一——颜色越沉稳，你越显高级。',
  },
  changxia_light: {
    name: '长夏·浅型',
    element: '土',
    subtitle: '柔和 · 雾感 · 低调高级',
    desc: '你是长夏型中明度偏轻的类型。燕麦、苔藓绿、蘑菇色、灰蓝这类浅中性色靠近脸时最干净。深色虽然不排斥，但浅中性色的轻盈感更适合你的气质。',
    keywords: ['浅大地色', '雾感', '低饱和', '柔和高级'],
    goodColors: [
      { name: '燕麦色', hex: '#D4C4A8' }, { name: '苔藓绿', hex: '#8A9A6A' },
      { name: '蘑菇色', hex: '#B0A090' }, { name: '灰蓝', hex: '#8AA0B8' },
      { name: '灰绿', hex: '#9AAA8A' }, { name: '冷米', hex: '#E0D8C8' },
      { name: '浅咖', hex: '#A08070' }, { name: '灰紫', hex: '#A898B8' },
    ],
    avoidColors: [
      { name: '正红', hex: '#CC0000' }, { name: '亮橘', hex: '#FF6600' },
      { name: '明黄', hex: '#FFCC00' }, { name: '纯黑', hex: '#000000' },
    ],
    tip: '浅型长夏的气质是"低调中的高级"——不需要用颜色抢镜，质感和版型才是你的武器。',
  },
  changxia_standard: {
    name: '长夏·标准型',
    element: '土',
    subtitle: '稳定 · 均衡 · 大地色全域',
    desc: '你是标准长夏型，深浅大地色系均衡适合。整个长夏色域——从浅燕麦到深炭灰，从苔藓绿到酒红——都在你的舒适区内。核心是低饱和、中性调、有质感。',
    keywords: ['大地色全域', '中性', '低饱和', '均衡', '质感'],
    goodColors: [
      { name: '炭灰', hex: '#4A4A4A' }, { name: '燕麦', hex: '#D4C4A8' },
      { name: '墨绿', hex: '#2D5A3D' }, { name: '酒红', hex: '#7B1A2A' },
      { name: '灰蓝', hex: '#5A7A9A' }, { name: '蘑菇色', hex: '#B0A090' },
      { name: '苔藓绿', hex: '#6B7A3E' }, { name: '深咖', hex: '#5A3A20' },
    ],
    avoidColors: [
      { name: '甜粉', hex: '#FF80C0' }, { name: '亮橘', hex: '#FF6600' },
      { name: '明黄', hex: '#FFCC00' }, { name: '冰蓝', hex: '#AED6F1' },
    ],
    tip: '标准长夏是亚洲女性中最被低估的类型——你不需要显白，你需要显高级，而大地色正是你的底牌。',
  },
  autumn: {
    name: '秋',
    element: '金',
    subtitle: '成熟 · 浓郁 · 焦糖 · 铜棕 · 深暖',
    desc: '你的肤色底调偏暖且适合深浓郁的颜色。秋季型的色彩气质是成熟感、厚重感、存在感，焦糖、铜棕、铁锈红、暖驼这些颜色能让你的气色更饱满有质感。避开过于清亮或冷调的颜色。',
    keywords: ['暖调', '低明度', '浓郁', '成熟感', '厚重感'],
    goodColors: [
      { name: '焦糖', hex: '#C68642' }, { name: '铜棕', hex: '#8B6347' },
      { name: '铁锈红', hex: '#B7410E' }, { name: '暖驼', hex: '#C4A882' },
      { name: '南瓜橘', hex: '#D2691E' }, { name: '金橄榄', hex: '#8A8A3A' },
      { name: '深暖绿', hex: '#4A6A2A' }, { name: '芥末黄', hex: '#C8A83A' },
    ],
    avoidColors: [
      { name: '冰白', hex: '#F0F4F8' }, { name: '冷粉', hex: '#F4A0B8' },
      { name: '冷灰', hex: '#8A9099' }, { name: '薰衣草', hex: '#B09EC8' },
    ],
    tip: '秋季型和长夏型最大的区别是：你穿焦糖橘色是加分的，而长夏型穿这些会显土——这是区分两者的关键。',
  },
  winter: {
    name: '冬',
    element: '水',
    subtitle: '冷净 · 深邃 · 高对比 · 黑白蓝红',
    desc: '你的肤色底调偏冷，且能承受深色和高对比。冬季型的色彩气质是清净感、深邃感、存在感强，纯黑、冷白、藏蓝、宝蓝、正红这些颜色靠近脸时五官最清楚。模糊的中性色反而会让你的气质散掉。',
    keywords: ['冷调', '高对比', '深邃', '清净', '存在感强'],
    goodColors: [
      { name: '纯黑', hex: '#1A1A1A' }, { name: '冷白', hex: '#F0F4F8' },
      { name: '藏蓝', hex: '#1C2E5A' }, { name: '宝蓝', hex: '#1A3A6B' },
      { name: '正红', hex: '#CC0000' }, { name: '玫红', hex: '#C2185B' },
      { name: '深紫', hex: '#4A2060' }, { name: '银灰', hex: '#B0B8C4' },
    ],
    avoidColors: [
      { name: '暖橘', hex: '#E8734A' }, { name: '焦糖', hex: '#C68642' },
      { name: '驼色', hex: '#C4A882' }, { name: '芥末黄', hex: '#C8A83A' },
    ],
    tip: '冬季型最怕"委屈自己穿中间色"——你不是百搭型，你是需要清晰、对比、力量感的类型。',
  },
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

function ColorSwatches({ colors }: { colors: [string, string][] }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {colors.map(([name, hex]) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: hex, border: `1px solid ${C.border}` }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{name}</span>
        </div>
      ))}
    </div>
  )
}

// ─── 报告组件 ─────────────────────────────────────────────────
function SeasonReport({ result, onReset }: { result: SeasonResult; onReset: () => void }) {
  const profile = SEASON_PROFILES[result]
  const elementColors: Record<string, string> = {
    '木': '#6B8A4A', '火': '#C0392B', '土': '#8B7355', '金': '#B8973A', '水': '#2C5F8A',
  }
  const elemColor = elementColors[profile.element] || C.gold

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* 结果标题 */}
      <div style={{ textAlign: 'center', padding: '32px 0 24px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
          第二层 · 五季测试结果
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: elemColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#fff' }}>{profile.element}</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', color: C.h1, fontWeight: 400, margin: 0 }}>
            {profile.name}季型
          </h1>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, margin: 0 }}>
          {profile.subtitle}
        </p>
      </div>

      {/* 关键词标签 */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {profile.keywords.map(k => (
          <span key={k} style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px', color: elemColor,
            border: `1px solid ${elemColor}`, borderRadius: '20px', padding: '4px 14px',
          }}>{k}</span>
        ))}
      </div>

      {/* AIFFD 解读 */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>AIFFD 解读</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.9, margin: '0 0 16px' }}>{profile.desc}</p>
        <div style={{ background: '#fdf8ee', borderRadius: '6px', padding: '12px 16px', borderLeft: `3px solid ${C.gold}` }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>💡 {profile.tip}</p>
        </div>
      </div>

      {/* 适合色 + 避开色 */}
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

      {/* 下一步 */}
      <div style={{ background: '#f7f4ef', borderRadius: '10px', padding: '24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>下一步</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.8, marginBottom: '16px' }}>
          五季方向已确认。第三层将在此基础上进一步细分——判断你的主导因子是明度、饱和度还是对比度，锁定你的12季精准类型。
        </p>
        <button style={{ background: C.gold, color: '#fff', border: 'none', borderRadius: '6px', padding: '13px 28px', fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '1px', cursor: 'pointer' }}>
          进入第三层测试 →
        </button>
      </div>

      {/* 操作 */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onReset} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, cursor: 'pointer' }}>重新测试</button>
        <Link to="/onboarding" style={{ flex: 1, padding: '14px', background: '#f5f0e8', border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>返回测试中心</Link>
      </div>
    </div>
  )
}

// ─── 主页面 ───────────────────────────────────────────────────
export default function ColorSeasonPage() {
  // 从路由 state 获取第一层结果（实际部署时从 location.state 取）
  const location = useLocation()
  const warmCool: WarmCoolInput = (location.state?.warmCool as WarmCoolInput) || 'warm'
  const path = getPath(warmCool)

  // 路径A answers
  const [aAnswers, setAAnswers] = useState<AnswersA>({ a1: '', a2: '', a3: '', a4: '' })
  const [bAnswers, setBAnswers] = useState<AnswersB>({ b1: '', b2: '', b3: '' })
  const [cAnswers, setCAnswers] = useState<AnswersC>({ c1: '', c2: '', c3: '', c4: '' })
  const [dAnswers, setDAnswers] = useState<AnswersD>({ d1: '', d2: '' })

  const setA = (k: keyof AnswersA) => (v: string) => setAAnswers(p => ({ ...p, [k]: v }))
  const setB = (k: keyof AnswersB) => (v: string) => setBAnswers(p => ({ ...p, [k]: v }))
  const setC = (k: keyof AnswersC) => (v: string) => setCAnswers(p => ({ ...p, [k]: v }))
  const setD = (k: keyof AnswersD) => (v: string) => setDAnswers(p => ({ ...p, [k]: v }))

  // step 管理（各路径独立）
  type AStep = 'intro' | 'a1' | 'a2' | 'a3' | 'a4' | 'report'
  type BStep = 'intro' | 'b1' | 'b2' | 'b3' | 'report'
  type CStep = 'intro' | 'c1' | 'c2' | 'c3' | 'c4' | 'report'
  type DStep = 'intro' | 'd1' | 'd2' | 'report'
  type AnyStep = AStep | BStep | CStep | DStep

  const [step, setStep] = useState<AnyStep>('intro')
  const [result, setResult] = useState<SeasonResult | null>(null)

  const pathSteps: Record<PathType, AnyStep[]> = {
    A: ['intro', 'a1', 'a2', 'a3', 'a4', 'report'],
    B: ['intro', 'b1', 'b2', 'b3', 'report'],
    C: ['intro', 'c1', 'c2', 'c3', 'c4', 'report'],
    D: ['intro', 'd1', 'd2', 'report'],
  }

  const steps = pathSteps[path]
  const currentIndex = steps.indexOf(step)
  const totalSteps = steps.length - 2 // 去掉 intro 和 report

  const next = () => {
    const nextStep = steps[currentIndex + 1]
    if (nextStep === 'report') {
      // 计算结果
      if (path === 'A') setResult(computeA(aAnswers))
      else if (path === 'B') setResult(computeB(bAnswers))
      else if (path === 'C') setResult(computeC(cAnswers, warmCool))
      else setResult(computeD(dAnswers))
    }
    setStep(nextStep)
  }

  const back = () => {
    if (currentIndex > 0) setStep(steps[currentIndex - 1])
  }

  const reset = () => {
    setStep('intro')
    setResult(null)
    setAAnswers({ a1: '', a2: '', a3: '', a4: '' })
    setBAnswers({ b1: '', b2: '', b3: '' })
    setCAnswers({ c1: '', c2: '', c3: '', c4: '' })
    setDAnswers({ d1: '', d2: '' })
  }

  // 进度
  const progress = step === 'intro' ? 0 : step === 'report' ? 100
    : ((currentIndex) / (totalSteps)) * 100

  // 当前答案是否已选
  const canNext: Record<AnyStep, boolean> = {
    intro: true,
    a1: !!aAnswers.a1, a2: !!aAnswers.a2, a3: !!aAnswers.a3, a4: !!aAnswers.a4,
    b1: !!bAnswers.b1, b2: !!bAnswers.b2, b3: !!bAnswers.b3,
    c1: !!cAnswers.c1, c2: !!cAnswers.c2, c3: !!cAnswers.c3, c4: !!cAnswers.c4,
    d1: !!dAnswers.d1, d2: !!dAnswers.d2,
    report: true,
  }

  // 路径标签
  const pathLabel: Record<PathType, string> = {
    A: '暖调 → 春 / 夏 / 秋',
    B: '冷调 → 夏 / 冬',
    C: '中性 → 长夏 / 春 / 秋',
    D: '橄榄 → 长夏',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', paddingBottom: '60px' }}>
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
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>色彩测试 · 第二层</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', color: C.h1, fontWeight: 400, lineHeight: 1.3, margin: '0 0 16px' }}>
                确定你的<br />五季方向
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.9, margin: 0 }}>
                基于你的冷暖结果，进入专属测试路径。AIFFD 五季体系融合东方五行与色彩科学，比西方四季更适合亚洲女性的真实肤色分布。
              </p>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>你的测试路径</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.gold }} />
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.h2, margin: 0 }}>{pathLabel[path]}</p>
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginTop: '12px', marginBottom: 0 }}>
                共 {totalSteps} 题，约2分钟
              </p>
            </div>
            <div style={{ background: '#fdf8ee', borderRadius: '8px', padding: '16px 20px', borderLeft: `3px solid ${C.gold}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>
                💡 长夏是 AIFFD 专属季型，对应亚洲橄榄肤色——这是西方四季体系里没有的维度。
              </p>
            </div>
            <button onClick={next} style={btnPrimaryStyle}>开始五季测试</button>
          </div>
        )}

        {/* ══════════ 路径 A：暖调 ══════════ */}

        {step === 'a1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 01 · 明度感知</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿浅色和深色，哪种更有精神？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>浅色如米白、裸粉、浅杏；深色如深咖、铁锈红、暗棕</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <ColorSwatches colors={[['米白','#F5F0E8'],['裸粉','#E8C4A0'],['浅杏','#F5DDB0']]} />
              <div style={{ width: '1px', background: C.border, margin: '0 4px' }} />
              <ColorSwatches colors={[['深咖','#5A3A20'],['铁锈红','#B7410E'],['暗棕','#6B3A2A']]} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '浅色更提气，深色感觉压我', sub: '→ 春季方向' },
                { id: 'B', label: '深色更有气场，浅色感觉平淡', sub: '→ 秋季方向' },
                { id: 'C', label: '都可以，没有明显差别', sub: '→ 夏季候选' },
              ].map(o => <OptionBtn key={o.id} {...o} active={aAnswers.a1 === o.id} onClick={() => setA('a1')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.a1} style={!canNext.a1 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'a2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 02 · 饱和度承受力</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿高饱和颜色时，脸的反应是？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>正红、亮橘、明黄、鲜蓝等高饱和色</p>
            </div>
            <ColorSwatches colors={[['正红','#CC0000'],['亮橘','#FF6600'],['明黄','#FFCC00'],['鲜蓝','#0066CC']]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '很好看，更有精神，气色更强', sub: '→ 夏季方向（高饱和承受力强）' },
                { id: 'B', label: '颜色太抢，反而显脸暗', sub: '→ 春 / 秋方向（更适合中低饱和）' },
                { id: 'C', label: '能穿但需要淡妆或配饰配合', sub: '→ 秋季偏向' },
              ].map(o => <OptionBtn key={o.id} {...o} active={aAnswers.a2 === o.id} onClick={() => setA('a2')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.a2} style={!canNext.a2 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'a3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 清亮 vs 柔和</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>清亮的暖色和柔和浓郁的暖色，哪种更衬你？</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', background: '#fff' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginBottom: '10px' }}>清亮暖色</p>
                <ColorSwatches colors={[['亮珊瑚','#F4A57A'],['明杏','#F5DDB0'],['浅橘','#F5A87A']]} />
              </div>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', background: '#fff' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginBottom: '10px' }}>柔和浓郁暖色</p>
                <ColorSwatches colors={[['焦糖','#C68642'],['铜棕','#8B6347'],['暖驼','#C4A882']]} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '清亮暖色更显年轻透亮', sub: '→ 春季方向' },
                { id: 'B', label: '柔和浓郁暖色更显成熟高级', sub: '→ 秋季方向' },
                { id: 'C', label: '高饱和鲜艳的反而更好看', sub: '→ 夏季方向' },
              ].map(o => <OptionBtn key={o.id} {...o} active={aAnswers.a3 === o.id} onClick={() => setA('a3')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.a3} style={!canNext.a3 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'a4' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 04 · 黑色反应</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>素颜穿黑色上衣，脸的感觉是？</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '显老显暗，换浅色或暖色好很多', sub: '→ 春季方向（黑色对比度过高）' },
                { id: 'B', label: '还可以，但不是最好的选择', sub: '→ 秋季方向' },
                { id: 'C', label: '很有气场，五官更清楚精神', sub: '→ 夏季方向（高对比承受力强）' },
              ].map(o => <OptionBtn key={o.id} {...o} active={aAnswers.a4 === o.id} onClick={() => setA('a4')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.a4} style={!canNext.a4 ? btnDisabledStyle : btnPrimaryStyle}>查看结果</button>
            </div>
          </div>
        )}

        {/* ══════════ 路径 B：冷调 ══════════ */}

        {step === 'b1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 01 · 白色 vs 黑色</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>素颜穿纯白和纯黑，哪种更好看？</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '纯白更显气色、清透、干净', sub: '→ 夏季方向（高明度冷调）' },
                { id: 'B', label: '纯黑更有气场、深邃、有力量', sub: '→ 冬季方向（高对比冷调）' },
                { id: 'C', label: '都不太好，柔和灰色或冷色更好', sub: '→ 长夏边界（可能非典型冷调）' },
              ].map(o => <OptionBtn key={o.id} {...o} active={bAnswers.b1 === o.id} onClick={() => setB('b1')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.b1} style={!canNext.b1 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'b2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 02 · 对比度承受力</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>高对比配色和低对比配色，哪种更出彩？</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', background: '#fff' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginBottom: '10px' }}>高对比</p>
                <ColorSwatches colors={[['黑','#1A1A1A'],['白','#FFFFFF'],['藏蓝','#1C2E5A']]} />
              </div>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', background: '#fff' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginBottom: '10px' }}>低对比</p>
                <ColorSwatches colors={[['浅灰','#C8C8C8'],['冷粉','#F4A0B8'],['浅蓝','#AED6F1']]} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '高对比更有存在感，更精神', sub: '→ 冬季方向' },
                { id: 'B', label: '低对比更柔和高级，更舒服', sub: '→ 夏季方向' },
              ].map(o => <OptionBtn key={o.id} {...o} active={bAnswers.b2 === o.id} onClick={() => setB('b2')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.b2} style={!canNext.b2 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'b3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 深色承受力</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>藏蓝、深紫、墨黑靠近脸时，感觉是？</h2>
            </div>
            <ColorSwatches colors={[['藏蓝','#1C2E5A'],['深紫','#4A2060'],['墨黑','#1A1A1A']]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '很好，五官更清楚，更有气场', sub: '→ 冬季方向（深色承受力强）' },
                { id: 'B', label: '有点沉重，偏浅的冷色更好看', sub: '→ 夏季方向（适合浅中明度冷色）' },
                { id: 'C', label: '都还行，深浅均可', sub: '→ 冷夏 / 冷冬边界' },
              ].map(o => <OptionBtn key={o.id} {...o} active={bAnswers.b3 === o.id} onClick={() => setB('b3')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.b3} style={!canNext.b3 ? btnDisabledStyle : btnPrimaryStyle}>查看结果</button>
            </div>
          </div>
        )}

        {/* ══════════ 路径 C：中性 ══════════ */}

        {step === 'c1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 01 · 暖色耐受</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿焦糖、橘色、南瓜色时，脸通常会？</h2>
            </div>
            <ColorSwatches colors={[['焦糖','#C68642'],['橘色','#E8734A'],['南瓜','#D2691E'],['驼色','#C4A882']]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '有气色，温暖感，挺好看', sub: '→ 春 / 秋方向（暖色耐受良好）' },
                { id: 'B', label: '显土显黄，不舒服，感觉更老', sub: '→ 长夏方向（橄榄 / 灰黄信号）' },
                { id: 'C', label: '有时可以，有时不稳定', sub: '→ 长夏边界' },
              ].map(o => <OptionBtn key={o.id} {...o} active={cAnswers.c1 === o.id} onClick={() => setC('c1')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.c1} style={!canNext.c1 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'c2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 02 · 灰调颜色反应</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>这些低饱和大地色靠近脸时，感觉是？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>墨绿 · 苔藓绿 · 蘑菇色 · 炭灰 · 燕麦色 · 灰绿 · 灰蓝 · 深咖 · 冷棕 · 酒红</p>
            </div>
            <ColorSwatches colors={[
              ['墨绿','#2D5A3D'], ['苔藓绿','#6B7A3E'], ['蘑菇色','#B0A090'],
              ['炭灰','#4A4A4A'], ['燕麦','#D4C4A8'], ['灰绿','#8AA88A'],
              ['灰蓝','#5A7A9A'], ['深咖','#5A3A20'], ['冷棕','#7A6A5A'], ['酒红','#7B1A2A'],
            ]} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '很高级，很稳，很舒服，感觉对了', sub: '→ 长夏方向' },
                { id: 'B', label: '显脏显暗，不好看，感觉更差', sub: '→ 春季方向' },
                { id: 'C', label: '还可以，但不是最好的颜色', sub: '→ 秋季方向' },
              ].map(o => <OptionBtn key={o.id} {...o} active={cAnswers.c2 === o.id} onClick={() => setC('c2')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.c2} style={!canNext.c2 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'c3' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 饱和度偏好</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你买衣服时，自然会倾向选择哪类颜色？</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '低饱和、雾感、大地色、哑光质感', sub: '→ 长夏方向' },
                { id: 'B', label: '中等饱和、清爽自然、看起来干净的颜色', sub: '→ 春季方向' },
                { id: 'C', label: '浓郁、有分量感、成熟、厚重的颜色', sub: '→ 秋季方向' },
              ].map(o => <OptionBtn key={o.id} {...o} active={cAnswers.c3 === o.id} onClick={() => setC('c3')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.c3} style={!canNext.c3 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'c4' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 04 · 整体气质</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>别人描述你的穿搭气质，通常是？</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '稳重、高级、低调有质感、耐看', sub: '→ 长夏方向' },
                { id: 'B', label: '清新、年轻、自然干净、有活力', sub: '→ 春季方向' },
                { id: 'C', label: '成熟、浓郁、有存在感、大气', sub: '→ 秋季方向' },
              ].map(o => <OptionBtn key={o.id} {...o} active={cAnswers.c4 === o.id} onClick={() => setC('c4')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.c4} style={!canNext.c4 ? btnDisabledStyle : btnPrimaryStyle}>查看结果</button>
            </div>
          </div>
        )}

        {/* ══════════ 路径 D：橄榄 ══════════ */}

        {step === 'd1' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 01 · 深浅感知</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>长夏色域中，深色组还是浅色组更衬你？</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', background: '#fff' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginBottom: '10px' }}>深色组</p>
                <ColorSwatches colors={[['炭灰','#4A4A4A'],['酒红','#7B1A2A'],['深咖','#5A3A20']]} />
              </div>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px', background: '#fff' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginBottom: '10px' }}>浅色组</p>
                <ColorSwatches colors={[['燕麦','#D4C4A8'],['苔藓','#8A9A6A'],['蘑菇','#B0A090']]} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '深色组更高级，更有气场', sub: '→ 长夏·深型' },
                { id: 'B', label: '浅色组更干净，更清爽', sub: '→ 长夏·浅型' },
                { id: 'C', label: '都还可以，均衡适合', sub: '→ 长夏·标准型' },
              ].map(o => <OptionBtn key={o.id} {...o} active={dAnswers.d1 === o.id} onClick={() => setD('d1')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.d1} style={!canNext.d1 ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'd2' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 02 · 对比度确认</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿深色时，素颜状态下好不好看？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>不需要靠口红或配饰来撑</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'A', label: '素颜穿深色也很好看，五官更清楚', sub: '→ 长夏·深型（对比度承受力强）' },
                { id: 'B', label: '需要配口红或亮色配饰才出彩', sub: '→ 长夏·浅型（需要辅助提亮）' },
              ].map(o => <OptionBtn key={o.id} {...o} active={dAnswers.d2 === o.id} onClick={() => setD('d2')(o.id)} />)}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.d2} style={!canNext.d2 ? btnDisabledStyle : btnPrimaryStyle}>查看结果</button>
            </div>
          </div>
        )}

        {/* ── 报告页 ── */}
        {step === 'report' && result && (
          <SeasonReport result={result} onReset={reset} />
        )}

      </div>
    </div>
  )
}
