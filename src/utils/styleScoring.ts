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
      const totalDimWeight = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0)
      const verifyBonus = totalDimWeight * (VERIFY_WEIGHT_RATIO / (1 - VERIFY_WEIGHT_RATIO))
      looseScoreByFamily[verifyFamily] += verifyBonus
      verifyFamilyApplied = verifyFamily
    }
  }

  const winningFamily = Object.entries(looseScoreByFamily).sort((a, b) => b[1] - a[1])[0][0]

  // ── 第二层：锁定家族后，家族内变体精匹配（整体风格复核不参与这一层）
  const familyStyles = STYLES.filter(s => s.family === winningFamily)
  const strictScoreByVariant: Record<string, number> = {}
  for (const style of familyStyles) {
    let matchedWeight = 0
    let totalWeight = 0
    for (const dim of DIMENSIONS) {
      const cell = dim.valuesByStyle[style.cn]
      if (!isCellFilled(cell)) continue
      totalWeight += dim.weight
      const userValue = answers[dim.id]
      if (matchDimension(dim, userValue, cell, false)) matchedWeight += dim.weight
    }
    strictScoreByVariant[style.cn] = totalWeight > 0 ? matchedWeight / totalWeight : 0
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
