import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { userScopedKey } from '../utils/userStorage'
import ThreeStageProgress from '../components/ThreeStageProgress'

const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#faf9f7',
}

type SeasonResult = 'spring' | 'summer' | 'changxia' | 'autumn' | 'winter'
  | 'changxia_deep' | 'changxia_light' | 'changxia_standard'
type ElementResult = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

const ELEMENT_META: Record<ElementResult, { name: string; zh: string; color: string; desc: string }> = {
  wood:  { name: '木', zh: 'Wood',  color: '#6B8A4A', desc: '生发、自然、清新、绿色生命力' },
  fire:  { name: '火', zh: 'Fire',  color: '#C0392B', desc: '气色、明艳、红感、光泽感强' },
  earth: { name: '土', zh: 'Earth', color: '#8B7355', desc: '稳定、米灰、柔和、低饱和高级感' },
  metal: { name: '金', zh: 'Metal', color: '#B8973A', desc: '清洁、利落、冷光、结构感强' },
  water: { name: '水', zh: 'Water', color: '#2C5F8A', desc: '深邃、冷深、暗色、收敛沉静' },
}

const SEASON_ELEMENT_PROFILES: Record<string, Record<ElementResult, {
  finalType: string
  goodColors: { name: string; hex: string }[]
  avoidColors: { name: string; hex: string }[]
  desc: string
}>> = {
  spring: {
    wood:  { finalType: '春木', desc: '嫩绿、浅杏、奶油白，清透自然，绿色生机感最能提亮肤色。', goodColors: [{ name: '嫩绿', hex: '#A8D8A8' }, { name: '浅杏', hex: '#F5DDB0' }, { name: '奶油白', hex: '#F5F0E8' }, { name: '浅橄榄', hex: '#C8D870' }], avoidColors: [{ name: '深咖', hex: '#5A3A20' }, { name: '冷灰', hex: '#8A9099' }] },
    fire:  { finalType: '春火', desc: '蜜桃、珊瑚、浅橙红，暖亮有气色，红感提亮不显土。', goodColors: [{ name: '蜜桃', hex: '#FFBB99' }, { name: '浅珊瑚', hex: '#F4A57A' }, { name: '浅橙红', hex: '#F5A87A' }, { name: '暖粉', hex: '#F5C4B0' }], avoidColors: [{ name: '深紫', hex: '#4A2060' }, { name: '炭灰', hex: '#4A4A4A' }] },
    earth: { finalType: '春土', desc: '奶茶、浅米、暖燕麦，柔和稳定，暖调大地色里最轻盈。', goodColors: [{ name: '奶茶', hex: '#E8D5B0' }, { name: '浅米', hex: '#F0E8D0' }, { name: '暖燕麦', hex: '#E8DCCC' }, { name: '杏仁', hex: '#F5E8CC' }], avoidColors: [{ name: '冷蓝', hex: '#5A7A9A' }, { name: '深紫', hex: '#4A2060' }] },
    metal: { finalType: '春金', desc: '浅金、香槟、清亮米白，干净精致，金属光感提亮春季肤色。', goodColors: [{ name: '香槟', hex: '#F5E8CC' }, { name: '浅金', hex: '#E8D088' }, { name: '米白', hex: '#F2ECD8' }, { name: '暖象牙', hex: '#F5F0E0' }], avoidColors: [{ name: '冷银', hex: '#C0C8D8' }, { name: '深黑', hex: '#1A1A1A' }] },
    water: { finalType: '春水', desc: '浅蓝绿、清水蓝、浅薄荷，清透偏冷，为春季带来清凉感。', goodColors: [{ name: '浅蓝绿', hex: '#A8D8D0' }, { name: '清水蓝', hex: '#B0CCE0' }, { name: '浅薄荷', hex: '#C0E8D8' }, { name: '冰绿', hex: '#D0E8E0' }], avoidColors: [{ name: '深咖', hex: '#5A3A20' }, { name: '橘色', hex: '#E8734A' }] },
  },
  summer: {
    wood:  { finalType: '夏木', desc: '明亮绿、清新蓝绿，自然鲜活，高饱和的绿系最有生命力。', goodColors: [{ name: '明亮绿', hex: '#2ECC71' }, { name: '蓝绿', hex: '#1ABC9C' }, { name: '草绿', hex: '#58D68D' }, { name: '清翠', hex: '#76D7C4' }], avoidColors: [{ name: '暗驼', hex: '#A08060' }, { name: '灰棕', hex: '#8A7A6A' }] },
    fire:  { finalType: '夏火', desc: '亮红、玫红、珊瑚红，明艳气色强，火感色彩是夏季的强项。', goodColors: [{ name: '正红', hex: '#CC0000' }, { name: '玫红', hex: '#C2185B' }, { name: '珊瑚红', hex: '#FF6B6B' }, { name: '亮橘红', hex: '#FF6600' }], avoidColors: [{ name: '灰粉', hex: '#C8A8A8' }, { name: '低饱和', hex: '#8A9A7A' }] },
    earth: { finalType: '夏土', desc: '明亮暖米、柔橙、浅驼，光感中带稳定，使高饱和夏季更耐看。', goodColors: [{ name: '明亮暖米', hex: '#F5E8CC' }, { name: '柔橙', hex: '#F5A878' }, { name: '浅驼', hex: '#D4B896' }, { name: '金棕', hex: '#D4A017' }], avoidColors: [{ name: '冷灰蓝', hex: '#7A8A9A' }, { name: '薰衣草', hex: '#B09EC8' }] },
    metal: { finalType: '夏金', desc: '明亮白、浅银、光感灰，清洁明亮，金属光感使夏季更精致。', goodColors: [{ name: '明亮白', hex: '#FFFFFF' }, { name: '浅银', hex: '#C8D0D8' }, { name: '光感灰', hex: '#B0B8C0' }, { name: '冷白', hex: '#F0F4F8' }], avoidColors: [{ name: '暗棕', hex: '#6B3A2A' }, { name: '土橘', hex: '#D2691E' }] },
    water: { finalType: '夏水', desc: '明蓝、宝蓝、冷红，明亮深邃，冷色调的深邃感是夏季的亮点。', goodColors: [{ name: '明蓝', hex: '#2980B9' }, { name: '宝蓝', hex: '#1A3A6B' }, { name: '深玫', hex: '#8E44AD' }, { name: '冷红', hex: '#C0392B' }], avoidColors: [{ name: '焦糖', hex: '#C68642' }, { name: '暖驼', hex: '#C4A882' }] },
  },
  changxia: {
    wood:  { finalType: '长夏木', desc: '灰绿、苔藓、橄榄、鼠尾草，稳定黄气，绿系中的低饱和方向是长夏的天赋色。', goodColors: [{ name: '灰绿', hex: '#8AA88A' }, { name: '苔藓绿', hex: '#6B7A3E' }, { name: '橄榄', hex: '#7A8A3A' }, { name: '鼠尾草', hex: '#9AAA8A' }], avoidColors: [{ name: '亮橘', hex: '#FF6600' }, { name: '甜粉', hex: '#FF80C0' }] },
    fire:  { finalType: '长夏火', desc: '酒红、灰玫瑰、暗红棕，低饱和提气色，火感色在长夏里需要降低饱和才稳定。', goodColors: [{ name: '酒红', hex: '#7B1A2A' }, { name: '灰玫瑰', hex: '#A87878' }, { name: '暗红棕', hex: '#8B3A3A' }, { name: '深砖红', hex: '#9A3A2A' }], avoidColors: [{ name: '亮粉', hex: '#FF80C0' }, { name: '明黄', hex: '#FFCC00' }] },
    earth: { finalType: '长夏土', desc: '燕麦、蘑菇、米灰、灰黄棕，稳定高级，土性副气与长夏主气高度契合。', goodColors: [{ name: '燕麦', hex: '#D4C4A8' }, { name: '蘑菇色', hex: '#B0A090' }, { name: '米灰', hex: '#C8C0B0' }, { name: '灰黄棕', hex: '#B8A888' }], avoidColors: [{ name: '亮橘', hex: '#FF6600' }, { name: '冰蓝', hex: '#AED6F1' }] },
    metal: { finalType: '长夏金', desc: '冷棕、石灰、灰驼、雾银灰，利落干净，金属清洁感使长夏更有轮廓。', goodColors: [{ name: '冷棕', hex: '#7A6A5A' }, { name: '石灰', hex: '#C0C0B0' }, { name: '灰驼', hex: '#B8AA98' }, { name: '雾银', hex: '#B8C0C8' }], avoidColors: [{ name: '暖橘', hex: '#E8734A' }, { name: '甜粉', hex: '#FF80C0' }] },
    water: { finalType: '长夏水', desc: '灰蓝、炭灰、墨绿、深咖，沉静有力量，水性副气赋予长夏深邃感。', goodColors: [{ name: '灰蓝', hex: '#5A7A9A' }, { name: '炭灰', hex: '#4A4A4A' }, { name: '墨绿', hex: '#2D5A3D' }, { name: '深咖', hex: '#5A3A20' }], avoidColors: [{ name: '亮橘', hex: '#FF6600' }, { name: '明黄', hex: '#FFCC00' }] },
  },
  autumn: {
    wood:  { finalType: '秋木', desc: '橄榄绿、深苔藓、暖军绿，自然厚重，暖调绿系最能衬托秋季气质。', goodColors: [{ name: '橄榄绿', hex: '#8A8A3A' }, { name: '深苔藓', hex: '#5A6A2A' }, { name: '暖军绿', hex: '#6A7A3A' }, { name: '暗草绿', hex: '#7A8A4A' }], avoidColors: [{ name: '冷粉', hex: '#F4A0B8' }, { name: '冷灰', hex: '#8A9099' }] },
    fire:  { finalType: '秋火', desc: '铁锈红、砖红、南瓜、橙棕，暖感强，火性色彩是秋季最自然的方向。', goodColors: [{ name: '铁锈红', hex: '#B7410E' }, { name: '砖红', hex: '#9A3A2A' }, { name: '南瓜橘', hex: '#D2691E' }, { name: '橙棕', hex: '#C87A3A' }], avoidColors: [{ name: '冰白', hex: '#F0F4F8' }, { name: '冷蓝', hex: '#5A7A9A' }] },
    earth: { finalType: '秋土', desc: '焦糖、暖驼、咖啡、土棕，成熟厚重，土性副气与秋季暖调完美融合。', goodColors: [{ name: '焦糖', hex: '#C68642' }, { name: '暖驼', hex: '#C4A882' }, { name: '咖啡棕', hex: '#7A5A3A' }, { name: '土棕', hex: '#8B6347' }], avoidColors: [{ name: '冷灰', hex: '#8A9099' }, { name: '冰粉', hex: '#F4A0B8' }] },
    metal: { finalType: '秋金', desc: '铜金、古金、暖金棕，贵气金属感，暖调金属色使秋季更有质感。', goodColors: [{ name: '铜金', hex: '#C68642' }, { name: '古金', hex: '#B8860B' }, { name: '暖金棕', hex: '#B8973A' }, { name: '琥珀金', hex: '#D4A017' }], avoidColors: [{ name: '冷银', hex: '#C0C8D8' }, { name: '冷白', hex: '#F0F4F8' }] },
    water: { finalType: '秋水', desc: '深咖、黑棕、深橄榄、暖墨色，沉稳深厚，暗色系使秋季更有气场。', goodColors: [{ name: '深咖', hex: '#5A3A20' }, { name: '黑棕', hex: '#4A2A1A' }, { name: '深橄榄', hex: '#4A5A2A' }, { name: '暖墨色', hex: '#3A2A1A' }], avoidColors: [{ name: '冷粉', hex: '#F4A0B8' }, { name: '冷蓝', hex: '#5A7A9A' }] },
  },
  winter: {
    wood:  { finalType: '冬木', desc: '冷绿、孔雀绿、松石绿，冷感生命力，冷调绿系是冬季的清新方向。', goodColors: [{ name: '孔雀绿', hex: '#1ABC9C' }, { name: '松石绿', hex: '#48C9B0' }, { name: '冷绿', hex: '#2ECC71' }, { name: '祖母绿', hex: '#0E6655' }], avoidColors: [{ name: '暖驼', hex: '#C4A882' }, { name: '焦糖', hex: '#C68642' }] },
    fire:  { finalType: '冬火', desc: '蓝红、品红、冷玫红，冷艳强烈，火性色彩在冬季呈现出最锋利的一面。', goodColors: [{ name: '品红', hex: '#E91E63' }, { name: '蓝红', hex: '#C62828' }, { name: '冷玫红', hex: '#C2185B' }, { name: '深玫', hex: '#880E4F' }], avoidColors: [{ name: '暖橘', hex: '#E8734A' }, { name: '焦糖', hex: '#C68642' }] },
    earth: { finalType: '冬土', desc: '冷咖、深灰棕、冷米灰，降低黑白硬度，土性副气柔化冬季的强对比。', goodColors: [{ name: '冷咖', hex: '#6A5A5A' }, { name: '深灰棕', hex: '#5A5050' }, { name: '冷米灰', hex: '#D0CCC8' }, { name: '灰棕', hex: '#8A7A7A' }], avoidColors: [{ name: '暖橘', hex: '#E8734A' }, { name: '焦糖', hex: '#C68642' }] },
    metal: { finalType: '冬金', desc: '黑白、银灰、冰灰、冷白，高对比利落，金属色彩是冬季最标志性的方向。', goodColors: [{ name: '纯黑', hex: '#1A1A1A' }, { name: '冷白', hex: '#F0F4F8' }, { name: '银灰', hex: '#B0B8C4' }, { name: '冰灰', hex: '#C8D0D8' }], avoidColors: [{ name: '暖驼', hex: '#C4A882' }, { name: '芥末黄', hex: '#C8A83A' }] },
    water: { finalType: '冬水', desc: '藏蓝、蓝黑、墨色、深紫，冷深有力量，水性副气是冬季最深邃的归宿。', goodColors: [{ name: '藏蓝', hex: '#1C2E5A' }, { name: '蓝黑', hex: '#1A1A2A' }, { name: '墨色', hex: '#2A2A3A' }, { name: '深紫', hex: '#4A2060' }], avoidColors: [{ name: '暖橘', hex: '#E8734A' }, { name: '焦糖', hex: '#C68642' }] },
  },
}

const resolveProfile = (season: SeasonResult, element: ElementResult) => {
  const baseKey = season.startsWith('changxia') ? 'changxia' : season
  return SEASON_ELEMENT_PROFILES[baseKey]?.[element] || SEASON_ELEMENT_PROFILES.changxia[element]
}

const ELEMENT_QUESTIONS: Record<ElementResult, { label: string; sub: string; colors: [string, string][] }> = {
  wood:  { label: '绿色系靠近脸时，你的感觉是？', sub: '嫩绿、苔藓绿、灰绿、橄榄绿等', colors: [['嫩绿','#A8D8A8'],['苔藓','#6B7A3E'],['灰绿','#8AA88A'],['橄榄','#7A8A3A']] },
  fire:  { label: '红色、玫红、酒红靠近脸时，你的感觉是？', sub: '正红、玫红、珊瑚、砖红、酒红等', colors: [['正红','#CC0000'],['玫红','#C2185B'],['酒红','#7B1A2A'],['砖红','#9A3A2A']] },
  earth: { label: '米色、燕麦、蘑菇色靠近脸，感觉是？', sub: '奶茶、燕麦、蘑菇、米灰、暖驼等中性大地色', colors: [['燕麦','#D4C4A8'],['蘑菇','#B0A090'],['米灰','#C8C0B0'],['奶茶','#E8D5B0']] },
  metal: { label: '灰色系、金属光泽靠近脸，感觉是？', sub: '银灰、冷棕、石灰色、金色、铜金等', colors: [['银灰','#B0B8C4'],['冷棕','#7A6A5A'],['金色','#D4A017'],['铜金','#C68642']] },
  water: { label: '深蓝、炭灰、墨色靠近脸，感觉是？', sub: '藏蓝、炭灰、墨绿、深咖、深紫等深邃色', colors: [['藏蓝','#1C2E5A'],['炭灰','#4A4A4A'],['墨绿','#2D5A3D'],['深咖','#5A3A20']] },
}

const btnGold: React.CSSProperties = {
  flex: 1, padding: '14px 0', background: C.gold, color: '#fff',
  border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif',
  fontSize: '14px', letterSpacing: '1px', cursor: 'pointer',
}
const btnDisabled: React.CSSProperties = { ...btnGold, background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed' }

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '14px 20px', background: 'transparent', border: `1px solid ${C.border}`,
      borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
      color: C.muted, cursor: 'pointer', whiteSpace: 'nowrap' as const,
    }}>← 返回</button>
  )
}

function FinalReport({ season, seasonName, element }: {
  season: SeasonResult; seasonName: string; element: ElementResult
}) {
  const elMeta = ELEMENT_META[element]
  const profile = resolveProfile(season, element)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ textAlign: 'center', padding: '32px 0 24px', borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>第三层 · 东方 25 季结果</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: elMeta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff' }}>{elMeta.name}</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '48px', color: C.h1, fontWeight: 400, margin: 0 }}>{profile.finalType}</h1>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: '0 0 8px' }}>主季：{seasonName} · 副气：{elMeta.name}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px' }}>AIFFD 东方 25 季 · {profile.finalType}</p>
      </div>
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '24px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '12px' }}>AIFFD 25季解读</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.9, margin: '0 0 16px' }}>{profile.desc}</p>
        <div style={{ background: '#fdf8ee', borderRadius: '6px', padding: '12px 16px', borderLeft: `3px solid ${C.gold}` }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>💡 {elMeta.name}副气特质：{elMeta.desc}</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '16px' }}>精准推荐色</p>
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
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, letterSpacing: '2px', marginBottom: '16px' }}>需避开色</p>
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
      <div style={{ background: '#f0f9f0', border: '1px solid #a8d8a8', borderRadius: '10px', padding: '20px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#4A8A4A', letterSpacing: '2px', marginBottom: '8px' }}>✓ 已保存到档案</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.8, margin: 0 }}>
          你的色彩档案已完整建立：<br />
          <strong>五季主型</strong>：{seasonName} · <strong>副气</strong>：{elMeta.name} · <strong>25季分类</strong>：{profile.finalType}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/profile" style={{ flex: 1, padding: '14px', background: C.gold, border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '1px' }}>
          查看我的完整档案 →
        </Link>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/onboarding" style={{ flex: 1, padding: '14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>返回测试中心</Link>
        <Link to="/test/style" style={{ flex: 1, padding: '14px', background: '#f5f0e8', border: 'none', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h2, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>去做风格测试 →</Link>
      </div>
    </div>
  )
}

export default function ColorElementPage() {
  const location = useLocation()
  const { user } = useAuth() // 读取五季兜底值、以及确认副气结果存档时，都要用同一个用户前缀

  const season: SeasonResult = (location.state?.season || localStorage.getItem(userScopedKey('aiffd_season_result', user)) || 'changxia') as SeasonResult
  const seasonName: string = (location.state?.seasonName || localStorage.getItem(userScopedKey('aiffd_season_name', user)) || '长夏')

  type Step = 'intro' | 'wood' | 'fire' | 'earth' | 'metal' | 'water' | 'confirm' | 'report'
  const STEPS: Step[] = ['intro', 'wood', 'fire', 'earth', 'metal', 'water', 'confirm', 'report']
  const ELEMENTS: ElementResult[] = ['wood', 'fire', 'earth', 'metal', 'water']

  const [step, setStep] = useState<Step>('intro')
  const [scores, setScores] = useState<Record<ElementResult, string>>({ wood: '', fire: '', earth: '', metal: '', water: '' })
  const [finalElement, setFinalElement] = useState<ElementResult | null>(null)

  const currentIndex = STEPS.indexOf(step)
  const progress = step === 'intro' ? 0 : step === 'report' ? 100 : (currentIndex / (STEPS.length - 2)) * 100
  const setScore = (el: ElementResult, val: string) => setScores(p => ({ ...p, [el]: val }))

  const computeElement = (): ElementResult => {
    const pts: Record<ElementResult, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }
    ELEMENTS.forEach(el => {
      if (scores[el] === 'A') pts[el] += 3
      else if (scores[el] === 'B') pts[el] += 1
    })
    let top: ElementResult = 'earth'; let topScore = -1
    ELEMENTS.forEach(el => { if (pts[el] > topScore) { topScore = pts[el]; top = el } })
    return top
  }

  const next = () => {
    if (step === 'water') {
      const el = computeElement(); setFinalElement(el); setStep('confirm')
    } else if (step === 'confirm') {
      if (finalElement) {
        localStorage.setItem(userScopedKey('aiffd_element_result', user), finalElement)
        localStorage.setItem(userScopedKey('aiffd_element_name', user), ELEMENT_META[finalElement].name)
        localStorage.setItem(userScopedKey('aiffd_25season', user), resolveProfile(season, finalElement).finalType)
      }
      setStep('report')
    } else {
      setStep(STEPS[currentIndex + 1])
    }
  }

  const back = () => { if (currentIndex > 0) setStep(STEPS[currentIndex - 1]) }
  const canCurrent = step === 'intro' || step === 'confirm' || step === 'report' ? true : !!scores[step as ElementResult]
  const seasonElementKey = season.startsWith('changxia') ? 'changxia' : season

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: '60px' }}>
      <ThreeStageProgress
        activeStage="color"
        formDone={!!localStorage.getItem(userScopedKey('aiffd_style_result', user))}
        colorDone={!!localStorage.getItem(userScopedKey('aiffd_25season', user))}
        preferenceDone={false}
        currentLabel={step !== 'intro' && step !== 'report' ? '五行副气测试' : undefined}
        currentNum={step !== 'intro' && step !== 'report' ? currentIndex : undefined}
        currentTotal={step !== 'intro' && step !== 'report' ? STEPS.length - 2 : undefined}
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
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>色彩测试 · 第三层</p>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '34px', color: C.h1, fontWeight: 400, lineHeight: 1.3, margin: '0 0 16px' }}>五行副气测试<br />锁定东方 25 季</h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.muted, lineHeight: 1.9, margin: 0 }}>
                你的五季主型已确认为<strong style={{ color: C.gold }}>「{seasonName}」</strong>。现在进入第三层测试，判断你的五行副气方向（木 / 火 / 土 / 金 / 水），完成东方 25 季精准分类。
              </p>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '2px', marginBottom: '16px' }}>你所在季型的 5 个分支</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {ELEMENTS.map(el => {
                  const meta = ELEMENT_META[el]
                  const profile = SEASON_ELEMENT_PROFILES[seasonElementKey]?.[el]
                  return (
                    <div key={el} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', background: C.bg }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#fff' }}>{meta.name}</span>
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: C.h2, margin: 0 }}>{profile?.finalType}</p>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: '2px 0 0' }}>{meta.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ background: '#fdf8ee', borderRadius: '8px', padding: '16px 20px', borderLeft: `3px solid ${C.gold}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, margin: 0, lineHeight: 1.7 }}>💡 共 5 组色卡题，每组判断一个五行副气方向对你肤色的稳定程度，约3分钟。</p>
            </div>
            <button onClick={next} style={{ ...btnGold, width: '100%', padding: '14px' }}>开始副气测试</button>
          </div>
        )}

        {ELEMENTS.map((el, idx) => {
          if (step !== el) return null
          const meta = ELEMENT_META[el]
          const q = ELEMENT_QUESTIONS[el]
          return (
            <div key={el} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: meta.color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Step 0{idx + 1} · {meta.name}副气 · {meta.zh}
                </p>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: C.h2, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>{q.label}</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginTop: '8px' }}>{q.sub}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {q.colors.map(([name, hex]) => (
                  <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: hex, border: `1px solid ${C.border}` }} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: C.muted }}>{name}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'A', label: '很好！更有精神，气色提升，感觉稳定' },
                  { id: 'B', label: '还可以，但不是最佳' },
                  { id: 'C', label: '不太好，显脏 / 显暗 / 显黄 / 压脸' },
                ].map(o => (
                  <button key={o.id} onClick={() => setScore(el, o.id)} style={{
                    border: `1.5px solid ${scores[el] === o.id ? meta.color : C.border}`,
                    borderRadius: '8px', background: scores[el] === o.id ? '#fdf8ee' : '#fff',
                    padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s', display: 'flex', gap: '14px', alignItems: 'center', width: '100%',
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: scores[el] === o.id ? meta.color : C.muted, letterSpacing: '1px', flexShrink: 0 }}>{o.id}</span>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: scores[el] === o.id ? C.h2 : C.body, margin: 0 }}>{o.label}</p>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <BackBtn onClick={back} />
                <button onClick={next} disabled={!canCurrent} style={{ ...(canCurrent ? { ...btnGold } : btnDisabled), flex: 1 }}>
                  {el === 'water' ? '查看副气结果' : '继续'}
                </button>
              </div>
            </div>
          )
        })}

        {step === 'confirm' && finalElement && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ textAlign: 'center', padding: '24px 0', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, letterSpacing: '3px', marginBottom: '12px' }}>副气判断结果</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: ELEMENT_META[finalElement].color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#fff' }}>{ELEMENT_META[finalElement].name}</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: C.h1, margin: 0 }}>{ELEMENT_META[finalElement].name}副气</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, margin: '4px 0 0' }}>{ELEMENT_META[finalElement].desc}</p>
                </div>
              </div>
            </div>
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: '10px', padding: '20px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, marginBottom: '8px' }}>你的东方 25 季分类</p>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: C.gold, margin: 0 }}>{resolveProfile(season, finalElement).finalType}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, marginTop: '12px' }}>{resolveProfile(season, finalElement).desc}</p>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, textAlign: 'center' }}>如感觉结果不准确，可重新选择副气方向</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {ELEMENTS.map(el => {
                const meta = ELEMENT_META[el]
                const isSelected = el === finalElement
                return (
                  <button key={el} onClick={() => setFinalElement(el)} style={{
                    border: `2px solid ${isSelected ? meta.color : C.border}`,
                    borderRadius: '8px', background: isSelected ? '#fdf8ee' : '#fff',
                    padding: '12px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                      <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#fff' }}>{meta.name}</span>
                    </div>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: isSelected ? meta.color : C.muted, margin: 0 }}>{resolveProfile(season, el).finalType}</p>
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <BackBtn onClick={back} />
              <button onClick={next} style={{ ...btnGold, flex: 1 }}>确认，生成完整档案 →</button>
            </div>
          </div>
        )}

        {step === 'report' && finalElement && (
          <FinalReport season={season} seasonName={seasonName} element={finalElement} />
        )}

      </div>
    </div>
  )
}
