// 13 型风格判定打分引擎（第二版，2026-08-26）
// 架构参考：AIFFD 架构设计文档 2026-08-26 第 2.3 节「两层匹配逻辑」
//
// 第一层 · 家族层（5 选 1，粗匹配）：
//   每个维度按其 matchType 判断是否命中，命中则拿满该维度权重
//   16 个维度权重累加 → 13 个风格各自得一个"粗匹配总分" → 按风格所属家族汇总 → 分最高的家族获胜
//
// 第二层 · 变体层（家族内 2-3 选 1，精匹配）：
//   锁定家族后，只在家族内的 2-3 个变体之间比较，用更严格的精匹配规则重新打分

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

export interface StyleScoreResult {
  looseScoreByStyle: Record<string, number>
  looseScoreByFamily: Record<string, number>
  winningFamily: string
  strictScoreByVariant: Record<string, number>
  winningVariant: string
  winningStyleInfo: (typeof STYLES)[number]
  matchedDimensions: { id: string; label: string; weight: number; hit: boolean }[]
}

export function computeStyleScore(answers: StyleAnswers): StyleScoreResult {
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
  const winningFamily = Object.entries(looseScoreByFamily).sort((a, b) => b[1] - a[1])[0][0]

  // ── 第二层：锁定家族后，家族内变体精匹配
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
  }
}
