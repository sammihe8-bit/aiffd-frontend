// 13 型风格判定打分引擎（第二版，2026-08-26）
// 架构参考：AIFFD 架构设计文档 2026-08-26 第 2.3 节「两层匹配逻辑」
//
// 第一层 · 家族层（5 选 1，粗匹配）：
//   每个维度按其 matchType 判断是否命中，命中则拿满该维度权重
//   16 个维度权重累加 → 13 个风格各自得一个"粗匹配总分" → 按风格所属家族汇总 → 分最高的家族获胜
//   2026-09-04 新增：家族层现在还会叠加"整体风格复核"4 题（原气血态）的校验加成，见下方
//
// 第二层 · 变体层（家族内 2-3 选 1，精匹配）：
//   锁定家族后，只在家族内的 2-3 个变体之间比较，用更严格的精匹配规则重新打分
//   "整体风格复核"不参与这一层——它只用来校验"五大家族选哪个"，不影响"家族内具体哪个变体"

import { STYLES, DIMENSIONS, type StyleDimension } from '../data/styleMatrix'

// 用户答案：combo 类型是 string[]（多选），其余类型是 string（单选）
export type StyleAnswers = Partial<Record<string, string | string[]>>

// combo 维度组合词拆分：'+' '、' '/' 均视为 AND 分隔符
function splitComboWords(cell: string): string[] {
  return cell.split(/[+、/]/).map(w => w.trim()).filter(Boolean)
}

// combo 家族层粗匹配：用户选的词，任意一个出现在格子的词集合里即命中
function comboLooseMatch(userWords: string[], cell: string): boolean {
  if (!userWords || userWords.length === 0) return false
  const cellWords = splitComboWords(cell)
  return userWords.some(w => cellWords.includes(w))
}

// combo 变体层精匹配：格子的词集合必须被用户选择完整覆盖
function comboStrictMatch(userWords: string[], cell: string): boolean {
  if (!userWords || userWords.length === 0) return false
  const cellWords = splitComboWords(cell)
  if (cellWords.length === 0) return false
  return cellWords.every(w => userWords.includes(w))
}

// orSingle 维度：单选，格子内出现多个候选词时任意一个命中即可（如嘴唇"中厚/小厚"二选一都算）
function orSingleMatch(userValue: string, cell: string): boolean {
  if (!userValue) return false
  return cell.split('/').map(w => w.trim()).includes(userValue)
}

// alias 维度（四肢、手脚——这两项表格仍是旧的自由文本格式）：用别名表做子串匹配
const KEYWORD_ALIASES: Record<string, Record<string, string[]>> = {
  handFoot: { 娇小: ['小', '偏小'], 适中: ['适中'], 偏大: ['偏大', '大'] },
}
function aliasMatch(dimId: string, userValue: string, cell: string): boolean {
  if (!userValue) return false
  const aliasMap = KEYWORD_ALIASES[dimId]
  const keywords = aliasMap?.[userValue] ?? [userValue]
  return keywords.some(k => cell.includes(k))
}

function isCellFilled(cell: string | undefined): cell is string {
  return !!cell && cell.trim().length > 0
}

// 统一入口：家族层粗匹配（loose = true）与变体层精匹配（loose = false）共用，
// 只有 combo 类型在两层的判定规则不同，其余类型两层判定规则一致
function matchDimension(dim: StyleDimension, userValue: string | string[] | undefined, cell: string, loose: boolean): boolean {
  if (userValue === undefined || userValue === null) return false
  if (!isCellFilled(cell)) return false

  switch (dim.matchType) {
    case 'exact':
      return typeof userValue === 'string' && userValue === cell
    case 'alias':
      return typeof userValue === 'string' && aliasMatch(dim.id, userValue, cell)
    case 'orSingle':
      return typeof userValue === 'string' && orSingleMatch(userValue, cell)
    case 'combo': {
      const words = Array.isArray(userValue) ? userValue : [userValue]
      return loose ? comboLooseMatch(words, cell) : comboStrictMatch(words, cell)
    }
    default:
      return false
  }
}

// ── 整体风格复核（原"气血态"）→ 五大家族映射 ─────────────────────────────
// 2026-09-04 新增：这 4 题不再直接决定家族，只作为辅助校验信号，按下面 VERIFY_WEIGHT_RATIO
// 换算成一个加成分数，叠加到对应家族的粗匹配总分上。5 态与家族的对应关系来自产品文档：
//   阴（柔软、丰盈、圆润）       → 浪漫型
//   阴多阳少（小巧、灵动、曲直对比）→ 少年型
//   阴阳和谐（均衡、克制、适中）   → 经典型
//   阴少阳多（宽缓、自然、舒展）   → 自然型
//   阳（锐利、强烈、长直线）      → 戏剧型
const QIXUE_FAMILY_MAP: Record<string, string> = {
  '阴': '浪漫型',
  '阴多阳少': '少年型',
  '阴阳和谐': '经典型',
  '阴少阳多': '自然型',
  '阳': '戏剧型',
}

// 整体风格复核占最终家族判定权重的目标比例，产品要求是 15%~20%，这里取中间值 17.5%。
// 换算方式：加成分数 = 体型+面部维度权重总和 × (比例 / (1 - 比例))
// 这样当体型+面部维度全部命中且校验家族与其一致时，加成分数占"维度总分+加成"总和的比例
// 正好等于 VERIFY_WEIGHT_RATIO；如果体型+面部数据没填满，校验这 4 题占比会相应变大——
// 这属于"数据越不完整，越依赖复核校验"的合理兜底，不是 bug。
// 如需调整占比，改这一个常量即可。
const VERIFY_WEIGHT_RATIO = 0.175

export interface StyleScoreResult {
  looseScoreByStyle: Record<string, number>
  looseScoreByFamily: Record<string, number>
  winningFamily: string
  strictScoreByVariant: Record<string, number>
  winningVariant: string
  winningStyleInfo: (typeof STYLES)[number]
  matchedDimensions: { id: string; label: string; weight: number; hit: boolean }[]
  // 本次计算是否真的用上了复核加成（家族层最终结果是否受它影响，供调试/展示用）
  verifyFamilyApplied?: string
}

// 复核加成的绝对值（与维度权重同一量纲），computeStyleScore 和 computeStyleProbabilities 共用
function verifyBonusWeight(): number {
  const totalDimWeight = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0)
  return totalDimWeight * (VERIFY_WEIGHT_RATIO / (1 - VERIFY_WEIGHT_RATIO))
}

// 变体层精匹配分：该风格所有已填格子里，用户精匹配命中的权重占比（0~1）
function strictScoreOf(style: (typeof STYLES)[number], answers: StyleAnswers): number {
  let matchedWeight = 0
  let totalWeight = 0
  for (const dim of DIMENSIONS) {
    const cell = dim.valuesByStyle[style.cn]
    if (!isCellFilled(cell)) continue
    totalWeight += dim.weight
    if (matchDimension(dim, answers[dim.id], cell, false)) matchedWeight += dim.weight
  }
  return totalWeight > 0 ? matchedWeight / totalWeight : 0
}

// qiXueState：整体风格复核 4 题算出的五态之一（阴/阴多阳少/阴阳和谐/阴少阳多/阳），可选参数。
// 不传的话行为跟改造前完全一样，只由体型+面部两层引擎决定家族——用于兼容还没做完整体风格复核就要看结果的场景。
export function computeStyleScore(answers: StyleAnswers, qiXueState?: string): StyleScoreResult {
  const looseScoreByStyle: Record<string, number> = {}
  STYLES.forEach(s => { looseScoreByStyle[s.cn] = 0 })

  // ── 第一层：家族粗匹配
  for (const dim of DIMENSIONS) {
    const userValue = answers[dim.id]
    if (userValue === undefined || userValue === null) continue
    for (const style of STYLES) {
      const cell = dim.valuesByStyle[style.cn]
      if (matchDimension(dim, userValue, cell, true)) {
        looseScoreByStyle[style.cn] += dim.weight
      }
    }
  }

  const looseScoreByFamily: Record<string, number> = {}
  for (const style of STYLES) {
    looseScoreByFamily[style.family] = Math.max(looseScoreByFamily[style.family] ?? 0, looseScoreByStyle[style.cn])
  }

  // ── 整体风格复核加成：把气血态映射到的家族加分，让这 4 题占最终家族判定权重的 15%-20%
  let verifyFamilyApplied: string | undefined
  if (qiXueState) {
    const verifyFamily = QIXUE_FAMILY_MAP[qiXueState]
    if (verifyFamily && looseScoreByFamily[verifyFamily] !== undefined) {
      looseScoreByFamily[verifyFamily] += verifyBonusWeight()
      verifyFamilyApplied = verifyFamily
    }
  }

  const winningFamily = Object.entries(looseScoreByFamily).sort((a, b) => b[1] - a[1])[0][0]

  // ── 第二层：锁定家族后，家族内变体精匹配（整体风格复核不参与这一层）
  const familyStyles = STYLES.filter(s => s.family === winningFamily)
  const strictScoreByVariant: Record<string, number> = {}
  for (const style of familyStyles) {
    strictScoreByVariant[style.cn] = strictScoreOf(style, answers)
  }
  const winningVariant = Object.entries(strictScoreByVariant).sort((a, b) => b[1] - a[1])[0][0]
  const winningStyleInfo = STYLES.find(s => s.cn === winningVariant)!

  const matchedDimensions = DIMENSIONS.map(dim => {
    const userValue = answers[dim.id]
    const cell = dim.valuesByStyle[winningVariant]
    return { id: dim.id, label: dim.label, weight: dim.weight, hit: matchDimension(dim, userValue, cell, true) }
  })

  return {
    looseScoreByStyle, looseScoreByFamily, winningFamily,
    strictScoreByVariant, winningVariant, winningStyleInfo, matchedDimensions,
    verifyFamilyApplied,
  }
}

// ══════════════════════════════════════════════════════════════════
// 13 型概率分布（2026-10-02，Style 数据缺口修复）
// 写入后端 profile_style_scores 子表，对齐 01B 第四节：
//   每型 0~1；主型 = 概率最高项；次型 = 概率第二高项（可为空）；13 项不要求合计为 1。
//
// 计算方式（门控式）：
//   家族分 F = 家族粗匹配分（含复核加成）÷ 理论满分（16 维权重和 + 本次实际施加的复核加成）
//   变体系数 = 该型精匹配分 ÷ 本家族内最高精匹配分（本家族全为 0 时取 1）
//   概率 = F × 变体系数，保留 3 位小数（与数据库 decimal(4,3) 一致）
// 这样每个家族里最好的变体概率恰好等于家族分，获胜家族的家族分最高，
// 所以概率最高的一定是 computeStyleScore 判定的 winningVariant，主型与报告页结论永远一致。
// 并列时：winningVariant 优先，其余按 STYLES 顺序（与 computeStyleScore 的并列处理一致）。
// ══════════════════════════════════════════════════════════════════

// 本概率算法的版本号，写入 profile_style_scores.engine_version；算法或权重改动时一起改
export const STYLE_ENGINE_VERSION = 'style_engine_v2.1'

// 13 型中文名 → 风格代码（与后端 STYLE_CODES、商品侧 primary_style 同一套）
export const STYLE_CODE_BY_CN: Record<string, string> = {
  '浪漫型风格': 'R', '戏剧浪漫型': 'TR',
  '柔软少年型': 'SG', '少年型': 'G', '戏剧少年型': 'FG',
  '柔软经典型': 'SC', '经典型': 'C', '戏剧经典型': 'DC',
  '浪漫自然型': 'SN', '自然型': 'N', '戏剧自然型': 'FN',
  '浪漫戏剧型': 'SD', '戏剧型': 'D',
}

export interface StyleProbability {
  styleCode: string
  probability: number
  isPrimary: boolean
  isSecondary: boolean
}

export interface StyleProbabilityResult {
  scores: StyleProbability[]   // 固定 13 项，按 STYLES 顺序
  primaryCode: string
  secondaryCode: string | null
}

const round3 = (n: number) => Math.round(n * 1000) / 1000

// result 必须是同一份 answers / qiXueState 调用 computeStyleScore 的返回值
export function computeStyleProbabilities(answers: StyleAnswers, result: StyleScoreResult): StyleProbabilityResult {
  const totalDimWeight = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0)
  const denom = totalDimWeight + (result.verifyFamilyApplied ? verifyBonusWeight() : 0)

  const strict: Record<string, number> = {}
  for (const style of STYLES) strict[style.cn] = strictScoreOf(style, answers)

  const maxStrictByFamily: Record<string, number> = {}
  for (const style of STYLES) {
    maxStrictByFamily[style.family] = Math.max(maxStrictByFamily[style.family] ?? 0, strict[style.cn])
  }

  const raw = STYLES.map((style, index) => {
    const familyScore = denom > 0 ? (result.looseScoreByFamily[style.family] ?? 0) / denom : 0
    const maxV = maxStrictByFamily[style.family]
    const ratio = maxV > 0 ? strict[style.cn] / maxV : 1
    const p = Math.min(1, Math.max(0, round3(familyScore * ratio)))
    return { cn: style.cn, index, p }
  })

  const primaryCn = result.winningVariant
  const primary = raw.find(r => r.cn === primaryCn)!
  // 理论上不会发生；一旦发生说明公式或 computeStyleScore 被改动过，直接报错而不是写入自相矛盾的数据
  if (raw.some(r => r.p > primary.p)) throw new Error('STYLE_PROBABILITY_INCONSISTENT')

  const others = raw.filter(r => r.cn !== primaryCn && r.p > 0)
    .sort((a, b) => b.p - a.p || a.index - b.index)
  const secondaryCn = others.length > 0 ? others[0].cn : null

  const scores = raw.map(r => ({
    styleCode: STYLE_CODE_BY_CN[r.cn],
    probability: r.p,
    isPrimary: r.cn === primaryCn,
    isSecondary: r.cn === secondaryCn,
  }))
  return {
    scores,
    primaryCode: STYLE_CODE_BY_CN[primaryCn],
    secondaryCode: secondaryCn ? STYLE_CODE_BY_CN[secondaryCn] : null,
  }
}
