import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { userScopedKey } from '../utils/userStorage'
import ThreeStageProgress from '../components/ThreeStageProgress'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

type WarmCoolInput = 'warm' | 'cool' | 'neutral_warm' | 'neutral_cool' | 'olive'
type SeasonResult = 'spring' | 'summer' | 'changxia' | 'autumn' | 'winter'
  | 'changxia_deep' | 'changxia_light' | 'changxia_standard'
type PathType = 'A' | 'B' | 'C' | 'D'

interface AnswersA { hairColor: string; irisColor: string; a1: string; a2: string; a3: string; a4: string }
interface AnswersB { hairColor: string; irisColor: string; b1: string; b2: string; b3: string }
interface AnswersC { hairColor: string; irisColor: string; c1: string; c2: string; c3: string; c4: string }
interface AnswersD { hairColor: string; irisColor: string; d1: string; d2: string }

function getPath(warmCool: WarmCoolInput): PathType {
  if (warmCool === 'warm') return 'A'
  if (warmCool === 'cool') return 'B'
  if (warmCool === 'neutral_warm' || warmCool === 'neutral_cool') return 'C'
  return 'D'
}

function computeA(a: AnswersA): SeasonResult {
  let spring = 0; let summer = 0; let autumn = 0
  if (a.hairColor === 'A') summer += 1
  else if (a.hairColor === 'C') autumn += 1
  else if (a.hairColor === 'D') autumn += 1
  else if (a.hairColor === 'E') autumn += 2
  if (a.irisColor === 'A') summer += 1
  else if (a.irisColor === 'B') autumn += 1
  else if (a.irisColor === 'C') autumn += 1
  else if (a.irisColor === 'D') spring += 1
  else if (a.irisColor === 'E') spring += 1
  if (a.hairColor === 'E' && a.irisColor === 'E') spring += 1
  if (a.hairColor === 'A' && a.irisColor === 'A') summer += 1
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
  if (b.hairColor === 'A') winter += 1
  else if (b.hairColor === 'B') winter += 1
  else if (b.hairColor === 'C') winter += 1
  if (b.irisColor === 'A') winter += 1
  else if (b.irisColor === 'B') winter += 1
  else if (b.irisColor === 'E') summer += 1
  else if (b.irisColor === 'F') winter += 1
  if (b.hairColor === 'A' && b.irisColor === 'A') winter += 1
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
  if (c.hairColor === 'A') autumn += 1
  else if (c.hairColor === 'B') changxia += 1
  else if (c.hairColor === 'C') autumn += 1
  else if (c.hairColor === 'D') autumn += 1
  else if (c.hairColor === 'E') autumn += 1
  else if (c.hairColor === 'F') changxia += 2
  if (c.irisColor === 'A') autumn += 1
  else if (c.irisColor === 'B') autumn += 1
  else if (c.irisColor === 'C') autumn += 1
  else if (c.irisColor === 'D') spring += 1
  else if (c.irisColor === 'E') spring += 1
  else if (c.irisColor === 'F') changxia += 1
  if ((c.hairColor === 'B' || c.hairColor === 'F') && c.irisColor === 'F') changxia += 2
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
  if (warmCool === 'neutral_warm') {
    if (spring >= autumn) return 'spring'
    return 'autumn'
  } else {
    if (autumn >= spring) return 'autumn'
    return 'spring'
  }
}

function computeD(d: AnswersD): SeasonResult {
  let deep = 0; let light = 0
  if (d.hairColor === 'A' || d.hairColor === 'B' || d.hairColor === 'C') deep += 1
  else if (d.hairColor === 'F' || d.hairColor === 'E') light += 1
  if (d.irisColor === 'A' || d.irisColor === 'B') deep += 1
  else if (d.irisColor === 'E' || d.irisColor === 'F') light += 1
  if (d.d1 === 'A') deep += 2
  else if (d.d1 === 'B') light += 2
  if (d.d2 === 'A') deep += 2
  else if (d.d2 === 'B') light += 2
  if (deep > light) return 'changxia_deep'
  if (light > deep) return 'changxia_light'
  return 'changxia_standard'
}

// 五季对应的中文名和五行主气
const SEASON_META: Record<SeasonResult, { name: string; element: string; label: string }> = {
  spring:            { name: '春', element: '木', label: '春季型' },
  summer:            { name: '夏', element: '火', label: '夏季型' },
  changxia:          { name: '长夏', element: '土', label: '长夏型' },
  changxia_deep:     { name: '长夏·深', element: '土', label: '长夏深型' },
  changxia_light:    { name: '长夏·浅', element: '土', label: '长夏浅型' },
  changxia_standard: { name: '长夏·标准', element: '土', label: '长夏标准型' },
  autumn:            { name: '秋', element: '金', label: '秋季型' },
  winter:            { name: '冬', element: '水', label: '冬季型' },
}

const SEASON_PROFILES: Record<SeasonResult, {
  name: string; element: string; subtitle: string; desc: string
  keywords: string[]
  goodColors: { name: string; hex: string }[]
  avoidColors: { name: string; hex: string }[]
  tip: string
}> = {
  spring: {
    name: '春', element: '木', subtitle: '清新 · 生发 · 明亮 · 轻盈',
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
    name: '夏', element: '火', subtitle: '明艳 · 热烈 · 光感 · 鲜活',
    desc: '你的肤色能承受高明度、高饱和的颜色，并且气色很强。夏季型的色彩气质是光感、鲜活、存在感强。',
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
    tip: '夏季型是五季中最能"撑住"颜色的类型——颜色越鲜，你越好看。',
  },
  changxia: {
    name: '长夏', element: '土', subtitle: '稳定 · 柔和 · 大地 · 低饱和',
    desc: '你不属于典型的暖皮或冷皮，而是带有土性底调的长夏型。低饱和大地色反而让你显高级。',
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
    tip: '长夏型最大的误区是追求"显白"——你的优势是高级感和稳定感。',
  },
  changxia_deep: {
    name: '长夏·深型', element: '土', subtitle: '沉稳 · 深邃 · 高对比承受力强',
    desc: '你是长夏型中对比度承受力较强的类型，深色系靠近脸时五官更清楚，不显憔悴。',
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
    tip: '深型长夏是五季中最耐看、最有气场的类型之一。',
  },
  changxia_light: {
    name: '长夏·浅型', element: '土', subtitle: '柔和 · 雾感 · 低调高级',
    desc: '你是长夏型中明度偏轻的类型，浅中性色的轻盈感最适合你的气质。',
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
    tip: '浅型长夏的气质是"低调中的高级"。',
  },
  changxia_standard: {
    name: '长夏·标准型', element: '土', subtitle: '稳定 · 均衡 · 大地色全域',
    desc: '你是标准长夏型，深浅大地色系均衡适合，整个长夏色域都在你的舒适区内。',
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
    tip: '标准长夏是亚洲女性中最被低估的类型——你需要显高级，而大地色正是你的底牌。',
  },
  autumn: {
    name: '秋', element: '金', subtitle: '成熟 · 浓郁 · 焦糖 · 铜棕 · 深暖',
    desc: '你的肤色底调偏暖且适合深浓郁的颜色。焦糖、铜棕、铁锈红、暖驼能让你的气色更饱满有质感。',
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
    tip: '秋季型和长夏型最大的区别是：你穿焦糖橘色是加分的，而长夏型穿这些会显土。',
  },
  winter: {
    name: '冬', element: '水', subtitle: '冷净 · 深邃 · 高对比 · 黑白蓝红',
    desc: '你的肤色底调偏冷，且能承受深色和高对比。纯黑、冷白、藏蓝、正红靠近脸时五官最清楚。',
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
    tip: '冬季型最怕"委屈自己穿中间色"——你需要清晰、对比、力量感。',
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
    color: C.muted, cursor: 'pointer', whiteSpace: 'nowrap'
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
  const navigate = useNavigate()
  const { user } = useAuth() // 存档时加用户前缀，避免不同账号互相覆盖/看到彼此的五季结果
  const profile = SEASON_PROFILES[result]
  const meta = SEASON_META[result]

  const elementColors: Record<string, string> = {
    '木': '#6B8A4A', '火': '#C0392B', '土': '#8B7355', '金': '#B8973A', '水': '#2C5F8A',
  }
  const elemColor = elementColors[profile.element] || C.gold

  // 保存到 localStorage
  const saveAndNext = () => {
    localStorage.setItem(userScopedKey('aiffd_season_result', user), result)
    localStorage.setItem(userScopedKey('aiffd_season_name', user), meta.name)
    localStorage.setItem(userScopedKey('aiffd_season_element', user), meta.element)
    // 如果是从风格测试跳来的，返回风格测试
    if (localStorage.getItem('aiffd_return_to') === 'style_color') {
      localStorage.removeItem('aiffd_return_to')
      window.location.href = '/test/style'
      return
    }
    // 否则进入25季副气测试
    navigate('/test/color/element', { state: { season: result, seasonName: meta.name } })
  }

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

      {/* 关键词 */}
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

      {/* ── 下一步：进入25季副气测试 ── */}
      <div style={{ background: '#0f0f0d', borderRadius: '10px', padding: '28px 24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>下一步 · 第三层</p>
        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#fff', fontWeight: 400, marginBottom: '12px' }}>
          进入 25 季副气测试
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '20px' }}>
          五季方向已确认为<strong style={{ color: C.gold }}>「{meta.name}」</strong>。
          下一步将在此基础上判断你的五行副气方向——木、火、土、金、水，锁定你在东方 25 季中的精准分类。
        </p>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['木', '火', '土', '金', '水'].map((el, i) => {
            const colors = ['#6B8A4A', '#C0392B', '#8B7355', '#B8973A', '#2C5F8A']
            return (
              <div key={el} style={{
                width: '44px', height: '44px', borderRadius: '50%', background: colors[i],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: el === meta.element ? '2px solid #fff' : 'none',
              }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#fff' }}>{el}</span>
              </div>
            )
          })}
        </div>
        <button onClick={saveAndNext} style={{
          background: C.gold, color: '#fff', border: 'none', borderRadius: '6px',
          padding: '14px 28px', fontFamily: 'Inter, sans-serif',
          fontSize: '14px', letterSpacing: '1px', cursor: 'pointer', width: '100%',
        }}>
          进入 25 季副气测试 →
        </button>
      </div>

      {/* 操作区 */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={onReset} style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, cursor: 'pointer' }}>重新测试</button>
        <Link to="/onboarding" style={{ flex: 1, padding: '14px', background: '#f5f0e8', border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>返回测试中心</Link>
      </div>

      {/* 从风格测试跳来的返回按钮 */}
      {typeof window !== 'undefined' && localStorage.getItem('aiffd_return_to') === 'style_color' && (
        <button onClick={() => {
          localStorage.setItem(userScopedKey('aiffd_season_result', user), result)
          localStorage.setItem(userScopedKey('aiffd_season_name', user), meta.name)
          localStorage.setItem(userScopedKey('aiffd_season_element', user), meta.element)
          localStorage.removeItem('aiffd_return_to')
          window.location.href = '/test/style'
        }} style={{
          width: '100%', padding: '14px', background: C.gold, color: '#fff', border: 'none',
          borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '14px', letterSpacing: '1px', cursor: 'pointer',
        }}>
          ← 返回风格测试（色彩结果已保存）
        </button>
      )}
    </div>
  )
}

// ─── 主页面 ───────────────────────────────────────────────────
export default function ColorSeasonPage() {
  const location = useLocation()
  const { user } = useAuth() // 读取 warmCool 兜底值、以及答完题后立即存档时，都要用同一个用户前缀
  const warmCool: WarmCoolInput = (
    (location.state?.warmCool as WarmCoolInput) ||
    (localStorage.getItem(userScopedKey('aiffd_warmcool', user)) as WarmCoolInput) ||
    'warm'
  )
  const path = getPath(warmCool)

  const [aAnswers, setAAnswers] = useState<AnswersA>({ hairColor: '', irisColor: '', a1: '', a2: '', a3: '', a4: '' })
  const [bAnswers, setBAnswers] = useState<AnswersB>({ hairColor: '', irisColor: '', b1: '', b2: '', b3: '' })
  const [cAnswers, setCAnswers] = useState<AnswersC>({ hairColor: '', irisColor: '', c1: '', c2: '', c3: '', c4: '' })
  const [dAnswers, setDAnswers] = useState<AnswersD>({ hairColor: '', irisColor: '', d1: '', d2: '' })

  const setA = (k: keyof AnswersA) => (v: string) => setAAnswers(p => ({ ...p, [k]: v }))
  const setB = (k: keyof AnswersB) => (v: string) => setBAnswers(p => ({ ...p, [k]: v }))
  const setC = (k: keyof AnswersC) => (v: string) => setCAnswers(p => ({ ...p, [k]: v }))
  const setD = (k: keyof AnswersD) => (v: string) => setDAnswers(p => ({ ...p, [k]: v }))

  type AnyStep = 'intro' | 'hairColor' | 'irisColor'
    | 'a1' | 'a2' | 'a3' | 'a4'
    | 'b1' | 'b2' | 'b3'
    | 'c1' | 'c2' | 'c3' | 'c4'
    | 'd1' | 'd2'
    | 'report'

  const [step, setStep] = useState<AnyStep>('intro')
  const [result, setResult] = useState<SeasonResult | null>(null)

  const pathSteps: Record<PathType, AnyStep[]> = {
    A: ['intro', 'hairColor', 'irisColor', 'a1', 'a2', 'a3', 'a4', 'report'],
    B: ['intro', 'hairColor', 'irisColor', 'b1', 'b2', 'b3', 'report'],
    C: ['intro', 'hairColor', 'irisColor', 'c1', 'c2', 'c3', 'c4', 'report'],
    D: ['intro', 'hairColor', 'irisColor', 'd1', 'd2', 'report'],
  }

  const steps = pathSteps[path]
  const currentIndex = steps.indexOf(step)
  const totalSteps = steps.length - 2
  const progress = step === 'intro' ? 0 : step === 'report' ? 100 : (currentIndex / totalSteps) * 100

  const next = () => {
    const nextStep = steps[currentIndex + 1]
    if (nextStep === 'report') {
      let r: SeasonResult
      if (path === 'A') r = computeA(aAnswers)
      else if (path === 'B') r = computeB(bAnswers)
      else if (path === 'C') r = computeC(cAnswers, warmCool)
      else r = computeD(dAnswers)
      setResult(r)
      // 立即存入 localStorage
      const meta = SEASON_META[r]
      localStorage.setItem(userScopedKey('aiffd_season_result', user), r)
      localStorage.setItem(userScopedKey('aiffd_season_name', user), meta.name)
      localStorage.setItem(userScopedKey('aiffd_season_element', user), meta.element)
    }
    setStep(nextStep)
  }

  const back = () => { if (currentIndex > 0) setStep(steps[currentIndex - 1]) }
  const reset = () => {
    setStep('intro'); setResult(null)
    setAAnswers({ hairColor: '', irisColor: '', a1: '', a2: '', a3: '', a4: '' })
    setBAnswers({ hairColor: '', irisColor: '', b1: '', b2: '', b3: '' })
    setCAnswers({ hairColor: '', irisColor: '', c1: '', c2: '', c3: '', c4: '' })
    setDAnswers({ hairColor: '', irisColor: '', d1: '', d2: '' })
  }

  const canNext: Record<AnyStep, boolean> = {
    intro: true, report: true,
    hairColor: !!(aAnswers.hairColor || bAnswers.hairColor || cAnswers.hairColor || dAnswers.hairColor),
    irisColor: !!(aAnswers.irisColor || bAnswers.irisColor || cAnswers.irisColor || dAnswers.irisColor),
    a1: !!aAnswers.a1, a2: !!aAnswers.a2, a3: !!aAnswers.a3, a4: !!aAnswers.a4,
    b1: !!bAnswers.b1, b2: !!bAnswers.b2, b3: !!bAnswers.b3,
    c1: !!cAnswers.c1, c2: !!cAnswers.c2, c3: !!cAnswers.c3, c4: !!cAnswers.c4,
    d1: !!dAnswers.d1, d2: !!dAnswers.d2,
  }

  const pathLabel: Record<PathType, string> = {
    A: '暖调 → 春 / 夏 / 秋',
    B: '冷调 → 夏 / 冬',
    C: '中性 → 长夏 / 春 / 秋',
    D: '橄榄灰黄 → 长夏',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f7', paddingBottom: '60px' }}>
      <ThreeStageProgress
        activeStage="color"
        formDone={!!localStorage.getItem(userScopedKey('aiffd_style_result', user))}
        colorDone={!!localStorage.getItem(userScopedKey('aiffd_25season', user))}
        preferenceDone={false}
        currentLabel={step !== 'intro' && step !== 'report' ? '五季测试' : undefined}
        currentNum={step !== 'intro' && step !== 'report' ? currentIndex : undefined}
        currentTotal={step !== 'intro' && step !== 'report' ? totalSteps : undefined}
      />
      {step !== 'intro' && step !== 'report' && (
        <div style={{ height: '3px', background: C.border }}>
          <div style={{ height: '100%', width: `${progress}%`, background: C.gold, transition: 'width 0.3s ease' }} />
        </div>
      )}
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '40px 32px' }}>

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
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginTop: '12px', marginBottom: 0 }}>共 {totalSteps} 题，约2分钟</p>
            </div>
            <div style={{ background: '#fdf8ee', borderRadius: '8px', padding: '16px 20px', borderLeft: `3px solid ${C.gold}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>
                💡 亚洲橄榄色肤色多为长夏家族成员。五季测试完成后将进入五行副气判断，共同确定你的东方 25 季精准分类。
              </p>
            </div>
            <button onClick={next} style={btnPrimaryStyle}>开始五季测试</button>
          </div>
        )}

        {step === 'hairColor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 01 · 自然发色</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你的自然发色最接近哪一组？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>如果经常染发，请回忆你的自然发色或发根颜色</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'A', label: '纯黑 · 蓝黑 · 乌黑', imgs: ['/hair_raven_black.png', '/hair_blue_black.png', '/hair_soft_black.png'] },
                { id: 'B', label: '灰黑 · 烟熏黑 · 冷黑', imgs: ['/hair_ash_black.png', '/hair_smoky_black.png', '/hair_ash_brown_black.png'] },
                { id: 'C', label: '深棕 · 巧克力棕 · 冷深棕', imgs: ['/hair_deep_brown.png', '/hair_chocolate_brown.png', '/hair_cool_deep_brown.png'] },
                { id: 'D', label: '中棕 · 栗棕 · 红棕', imgs: ['/hair_chestnut_brown.png', '/hair_light_brown.png', '/hair_red_brown.png'] },
                { id: 'E', label: '金棕 · 黄棕 · 暖茶棕', imgs: ['/hair_golden_brown.png', '/hair_yellow_brown.png', '/hair_warm_tea_brown.png'] },
                { id: 'F', label: '灰棕 · 雾棕 · 橄榄灰棕', imgs: ['/hair_mushroom_brown.png', '/hair_mist_brown.png', '/hair_olive_ash_brown.png'] },
              ].map(o => {
                const currentVal = path === 'A' ? aAnswers.hairColor : path === 'B' ? bAnswers.hairColor : path === 'C' ? cAnswers.hairColor : dAnswers.hairColor
                const isActive = currentVal === o.id
                return (
                  <button key={o.id} onClick={() => {
                    if (path === 'A') setA('hairColor')(o.id)
                    else if (path === 'B') setB('hairColor')(o.id)
                    else if (path === 'C') setC('hairColor')(o.id)
                    else setD('hairColor')(o.id)
                  }} style={{ border: `1.5px solid ${isActive ? C.gold : C.border}`, borderRadius: '10px', background: isActive ? '#fdf8ee' : '#fff', padding: '14px 16px', cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: isActive ? C.gold : C.muted, letterSpacing: '1px', flexShrink: 0 }}>{o.id}</span>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: isActive ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', paddingLeft: '24px' }}>
                      {o.imgs.map((img, i) => <img key={i} src={img} alt="" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '6px', border: `1px solid ${C.border}` }} />)}
                    </div>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.hairColor} style={!canNext.hairColor ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {step === 'irisColor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 02 · 虹膜颜色</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你的虹膜（眼珠）颜色更接近哪一种？</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>在自然光下，观察眼珠中虹膜部分的颜色</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { id: 'A', label: '近黑瞳，几乎看不到边界', img: '/iris_near_black.png' },
                { id: 'B', label: '深棕瞳，棕色感明显', img: '/iris_dark_brown.png' },
                { id: 'C', label: '暖深棕瞳，带红棕感', img: '/iris_warm_deep_brown.png' },
                { id: 'D', label: '琥珀棕瞳，颜色偏亮偏暖', img: '/iris_amber_brown.png' },
                { id: 'E', label: '茶色瞳，颜色较浅', img: '/iris_tea_brown.png' },
                { id: 'F', label: '灰棕瞳，偏冷偏暗', img: '/iris_gray_brown.png' },
              ].map(o => {
                const currentVal = path === 'A' ? aAnswers.irisColor : path === 'B' ? bAnswers.irisColor : path === 'C' ? cAnswers.irisColor : dAnswers.irisColor
                const isActive = currentVal === o.id
                return (
                  <button key={o.id} onClick={() => {
                    if (path === 'A') setA('irisColor')(o.id)
                    else if (path === 'B') setB('irisColor')(o.id)
                    else if (path === 'C') setC('irisColor')(o.id)
                    else setD('irisColor')(o.id)
                  }} style={{ border: `2px solid ${isActive ? C.gold : C.border}`, borderRadius: '8px', background: isActive ? '#fdf8ee' : '#fff', padding: 0, cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s', textAlign: 'left' as const }}>
                    <img src={o.img} alt={o.label} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: isActive ? C.gold : C.body, padding: '10px 12px', margin: 0 }}>
                      <span style={{ fontSize: '11px', color: C.muted, marginRight: '6px' }}>{o.id}</span>{o.label}
                    </p>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} disabled={!canNext.irisColor} style={!canNext.irisColor ? btnDisabledStyle : btnPrimaryStyle}>继续</button>
            </div>
          </div>
        )}

        {/* 路径A */}
        {step === 'a1' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 明度感知</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿浅色和深色，哪种更有精神？</h2><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>浅色如米白、裸粉、浅杏；深色如深咖、铁锈红、暗棕</p></div><ColorSwatches colors={[['米白','#F5F0E8'],['裸粉','#E8C4A0'],['浅杏','#F5DDB0'],['深咖','#5A3A20'],['铁锈红','#B7410E'],['暗棕','#6B3A2A']]} /><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'浅色更提气，深色感觉压我'},{id:'B',label:'深色更有气场，浅色感觉平淡'},{id:'C',label:'都可以，没有明显差别'}].map(o=><OptionBtn key={o.id} {...o} active={aAnswers.a1===o.id} onClick={()=>setA('a1')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.a1} style={!canNext.a1?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'a2' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 04 · 饱和度承受力</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿高饱和颜色时，脸的反应是？</h2><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>正红、亮橘、明黄、鲜蓝等高饱和色</p></div><ColorSwatches colors={[['正红','#CC0000'],['亮橘','#FF6600'],['明黄','#FFCC00'],['鲜蓝','#0066CC']]} /><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'很好看，更有精神，气色更强'},{id:'B',label:'颜色太抢，反而显脸暗'},{id:'C',label:'能穿但需要淡妆或配饰配合'}].map(o=><OptionBtn key={o.id} {...o} active={aAnswers.a2===o.id} onClick={()=>setA('a2')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.a2} style={!canNext.a2?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'a3' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 05 · 清亮 vs 柔和</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>清亮的暖色和柔和浓郁的暖色，哪种更衬你？</h2></div><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}><div style={{ border:`1px solid ${C.border}`,borderRadius:'10px',padding:'14px',background:'#fff' }}><p style={{ fontFamily:'Inter,sans-serif',fontSize:'11px',color:C.muted,marginBottom:'10px' }}>清亮暖色</p><ColorSwatches colors={[['亮珊瑚','#F4A57A'],['明杏','#F5DDB0'],['浅橘','#F5A87A']]} /></div><div style={{ border:`1px solid ${C.border}`,borderRadius:'10px',padding:'14px',background:'#fff' }}><p style={{ fontFamily:'Inter,sans-serif',fontSize:'11px',color:C.muted,marginBottom:'10px' }}>柔和浓郁暖色</p><ColorSwatches colors={[['焦糖','#C68642'],['铜棕','#8B6347'],['暖驼','#C4A882']]} /></div></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'清亮暖色更显年轻透亮'},{id:'B',label:'柔和浓郁暖色更显成熟高级'},{id:'C',label:'高饱和鲜艳的反而更好看'}].map(o=><OptionBtn key={o.id} {...o} active={aAnswers.a3===o.id} onClick={()=>setA('a3')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.a3} style={!canNext.a3?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'a4' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 06 · 黑色反应</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>素颜穿黑色上衣，脸的感觉是？</h2></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'显老显暗，换浅色或暖色好很多'},{id:'B',label:'还可以，但不是最好的选择'},{id:'C',label:'很有气场，五官更清楚精神'}].map(o=><OptionBtn key={o.id} {...o} active={aAnswers.a4===o.id} onClick={()=>setA('a4')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.a4} style={!canNext.a4?btnDisabledStyle:btnPrimaryStyle}>查看结果</button></div></div>)}

        {/* 路径B */}
        {step === 'b1' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 白色 vs 黑色</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>素颜穿纯白和纯黑，哪种更好看？</h2></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'纯白更显气色、清透、干净'},{id:'B',label:'纯黑更有气场、深邃、有力量'},{id:'C',label:'都不太好，柔和灰色或冷色更好'}].map(o=><OptionBtn key={o.id} {...o} active={bAnswers.b1===o.id} onClick={()=>setB('b1')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.b1} style={!canNext.b1?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'b2' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 04 · 对比度承受力</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>高对比配色和低对比配色，哪种更出彩？</h2></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'高对比更有存在感，更精神'},{id:'B',label:'低对比更柔和高级，更舒服'}].map(o=><OptionBtn key={o.id} {...o} active={bAnswers.b2===o.id} onClick={()=>setB('b2')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.b2} style={!canNext.b2?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'b3' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 05 · 深色承受力</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>藏蓝、深紫、墨黑靠近脸时，感觉是？</h2></div><ColorSwatches colors={[['藏蓝','#1C2E5A'],['深紫','#4A2060'],['墨黑','#1A1A1A']]} /><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'很好，五官更清楚，更有气场'},{id:'B',label:'有点沉重，偏浅的冷色更好看'},{id:'C',label:'都还行，深浅均可'}].map(o=><OptionBtn key={o.id} {...o} active={bAnswers.b3===o.id} onClick={()=>setB('b3')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.b3} style={!canNext.b3?btnDisabledStyle:btnPrimaryStyle}>查看结果</button></div></div>)}

        {/* 路径C */}
        {step === 'c1' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 暖色耐受</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿焦糖、橘色、南瓜色时，脸通常会？</h2></div><ColorSwatches colors={[['焦糖','#C68642'],['橘色','#E8734A'],['南瓜','#D2691E'],['驼色','#C4A882']]} /><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'有气色，温暖感，挺好看'},{id:'B',label:'显土显黄，不舒服，感觉更老'},{id:'C',label:'有时可以，有时不稳定'}].map(o=><OptionBtn key={o.id} {...o} active={cAnswers.c1===o.id} onClick={()=>setC('c1')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.c1} style={!canNext.c1?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'c2' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 04 · 灰调颜色反应</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>这些低饱和大地色靠近脸时，感觉是？</h2></div><ColorSwatches colors={[['墨绿','#2D5A3D'],['苔藓绿','#6B7A3E'],['蘑菇色','#B0A090'],['炭灰','#4A4A4A'],['燕麦','#D4C4A8'],['酒红','#7B1A2A']]} /><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'很高级，很稳，很舒服，感觉对了'},{id:'B',label:'显脏显暗，不好看，感觉更差'},{id:'C',label:'还可以，但不是最好的颜色'}].map(o=><OptionBtn key={o.id} {...o} active={cAnswers.c2===o.id} onClick={()=>setC('c2')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.c2} style={!canNext.c2?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'c3' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 05 · 饱和度偏好</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你买衣服时，自然会倾向选择哪类颜色？</h2></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'低饱和、雾感、大地色、哑光质感'},{id:'B',label:'中等饱和、清爽自然、看起来干净的颜色'},{id:'C',label:'浓郁、有分量感、成熟、厚重的颜色'}].map(o=><OptionBtn key={o.id} {...o} active={cAnswers.c3===o.id} onClick={()=>setC('c3')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.c3} style={!canNext.c3?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'c4' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 06 · 整体气质</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>别人描述你的穿搭气质，通常是？</h2></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'稳重、高级、低调有质感、耐看'},{id:'B',label:'清新、年轻、自然干净、有活力'},{id:'C',label:'成熟、浓郁、有存在感、大气'}].map(o=><OptionBtn key={o.id} {...o} active={cAnswers.c4===o.id} onClick={()=>setC('c4')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.c4} style={!canNext.c4?btnDisabledStyle:btnPrimaryStyle}>查看结果</button></div></div>)}

        {/* 路径D */}
        {step === 'd1' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 03 · 深浅感知</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>长夏色域中，深色组还是浅色组更衬你？</h2></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'深色组更高级，更有气场'},{id:'B',label:'浅色组更干净，更清爽'},{id:'C',label:'都还可以，均衡适合'}].map(o=><OptionBtn key={o.id} {...o} active={dAnswers.d1===o.id} onClick={()=>setD('d1')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.d1} style={!canNext.d1?btnDisabledStyle:btnPrimaryStyle}>继续</button></div></div>)}
        {step === 'd2' && (<div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}><div><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Step 04 · 对比度确认</p><h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>你穿深色时，素颜状态下好不好看？</h2><p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>不需要靠口红或配饰来撑</p></div><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{[{id:'A',label:'素颜穿深色也很好看，五官更清楚'},{id:'B',label:'需要配口红或亮色配饰才出彩'}].map(o=><OptionBtn key={o.id} {...o} active={dAnswers.d2===o.id} onClick={()=>setD('d2')(o.id)} />)}</div><div style={{ display: 'flex', gap: '12px' }}><BackBtn onClick={back} /><button onClick={next} disabled={!canNext.d2} style={!canNext.d2?btnDisabledStyle:btnPrimaryStyle}>查看结果</button></div></div>)}

        {step === 'report' && result && (
          <SeasonReport result={result} onReset={reset} />
        )}
      </div>
    </div>
  )
}
