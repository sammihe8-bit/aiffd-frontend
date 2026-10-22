// 2026-10-22 新增：把后端 Human Profile（GET /human-profile/me）换算成个人档案页使用的展示数据。
//
// 个人档案页原来只读浏览器本机存档：换设备、清缓存、在别的浏览器登录时，用户会看不到自己的结果。
// 现在的读取顺序是“本机优先、云端补缺”：本机有的照常用（本机数据更细，比如体格提示码、五官中文标签），
// 本机没有的，用这里从云端档案换算出来的数据补上。这里只做展示用的换算，不写回本机存档。

import { STYLES, type StyleInfo } from '../data/styleMatrix'
import { STYLE_CODE_BY_CN } from './styleScoring'
import { NO_FIXED_STYLE } from './fashionStyleOptions'

export type ServerProfile = Record<string, unknown>

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

// 数组字段在库里存成 JSON 字符串（如 '["直"]'），也兼容已经是数组的情况
function list(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string')
  if (typeof v !== 'string' || !v) return []
  try {
    const parsed = JSON.parse(v)
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

// ── 风格：13 型代码 → 与本机 aiffd_style_result 同形状的数据 ─────────────
const CN_BY_CODE: Record<string, string> = Object.fromEntries(Object.entries(STYLE_CODE_BY_CN).map(([cn, code]) => [code, cn]))

export interface StyleResultView { family: string; variant: string; styleInfo: StyleInfo }

export function styleFromServer(p: ServerProfile | null): StyleResultView | null {
  const cn = CN_BY_CODE[str(p?.primaryStyle)]
  const info = cn ? STYLES.find(s => s.cn === cn) : undefined
  return info ? { family: info.family, variant: info.cn, styleInfo: info } : null
}

// ── 色彩 ─────────────────────────────────────────────────────────
export interface ColorView { warmCool: string; seasonName: string; seasonElement: string; elementName: string; finalSeason25: string }

export function colorFromServer(p: ServerProfile | null): ColorView {
  return {
    warmCool: str(p?.warmCool) === 'uncertain' ? '' : str(p?.warmCool),
    seasonName: str(p?.seasonName),
    seasonElement: str(p?.seasonElement),
    elementName: str(p?.elementName),
    finalSeason25: str(p?.finalSeason25),
  }
}

// ── 体型：只换算个人档案页“体型详情”表格用到的字段 ─────────────────────
// 本机版本的骨架、体型里还叠加了体格提示码，云端只有用户原始选择，所以显示会略简略
export interface BodyView { height: string; boneScale: string[]; shoulder: string[]; waist: string[]; bodyShape: string[]; fleshTexture: string[] }

export function bodyFromServer(p: ServerProfile | null): BodyView | null {
  if (!p || !str(p.boneScale)) return null
  const nonEmpty = (...xs: string[]) => xs.filter(Boolean)
  return {
    height: str(p.heightRange),
    boneScale: nonEmpty(str(p.boneScale), str(p.boneRoundness), str(p.shoulderLineDirection)),
    shoulder: nonEmpty(str(p.shoulderShape)),
    waist: [...list(p.waistType), ...(str(p.waistLength) && str(p.waistLength) !== '适中' ? [str(p.waistLength)] : [])],
    bodyShape: nonEmpty(str(p.bodyShape)),
    fleshTexture: nonEmpty(str(p.fleshTexture)),
  }
}

// ── 个人时尚选择：风格形象标签 → 与本机 aiffd_fashion_style 同形状的数据 ────────
export interface FashionView {
  aspired_style_primary: string | null
  aspired_style_secondary: string[]
  current_style: string[]
  current_aspired_style_gap: 'stable' | 'gap' | 'no_fixed_style'
  rejected_style_codes: string[]
}

export function fashionFromServer(p: ServerProfile | null): FashionView | null {
  const aspired = list(p?.aspiredImageTags)
  if (!p || aspired.length === 0) return null
  const favorite = str(p.aspiredImageTagFavorite) || null
  const gapRaw = str(p.currentAspiredStyleGap)
  const gap = (['stable', 'gap', 'no_fixed_style'] as const).find(g => g === gapRaw) ?? 'gap'
  return {
    aspired_style_primary: favorite,
    aspired_style_secondary: aspired.filter(id => id !== favorite),
    current_style: str(p.currentImageStatus) === 'no_fixed_style' ? [NO_FIXED_STYLE] : list(p.currentImageTags),
    current_aspired_style_gap: gap,
    rejected_style_codes: list(p.rejectedImageTags),
  }
}

// 面部是否已在云端有结果（五官中文详情只存在本机，云端只能告诉用户“已测过”）
export function hasFaceOnServer(p: ServerProfile | null): boolean {
  return !!p && ['cheekContour', 'eyeShape', 'noseShape', 'chinShape', 'mouthFullness'].some(k => str(p[k]))
}
