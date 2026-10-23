// 2026-10-23 新增：体型测试答案 → 面部测试打分引擎读取的体型结果（aiffd_body_result 的形状）。
// 原来写在 BodyTestPage 里；抽出来是为了换设备时，面部测试页能用云端的体型测试存档
// （test_progress 表里的完整答题快照）重建同样的结果，不用让用户重做体型测试。

// 腰型答案派生出的体格倾向提示（X/V/H/O），只在后台数据里出现，界面从不展示
export const WAIST_BODYSHAPE_HINT: Record<string, string> = { 细: 'X', 匀: 'V', 直: 'H', 宽: 'O' }

export interface BodyAnswersForResult {
  heightRange?: string; boneScale?: string; boneRoundness?: string; boneWidth?: string
  shoulderShape?: string[]; waistType?: string[]; waistLength?: string; limbLength?: string; handFootSize?: string
  bodyShape?: string[]; fleshTexture?: string[]; hipProtrude?: string[]; chestProtrude?: string[]
}

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [])
const s = (v: unknown): string => (typeof v === 'string' ? v : '')

export function buildBodyResult(a: BodyAnswersForResult) {
  const waistType = arr(a.waistType)
  const waistLength = s(a.waistLength)
  const bodyShapeHint = waistType.map(w => WAIST_BODYSHAPE_HINT[w]).filter(Boolean)
  // Q6(横向轮廓) + Q7(纵向比例) 合并成最终喂给引擎的腰型组合词，"适中"不贡献任何词
  const waistCombined = waistLength === '适中' ? waistType : [...waistType, ...(waistLength ? [waistLength] : [])]
  // 骨点明显程度 + 肩部横向展开感，与尺寸(S/M/L)合并成 boneScale 数组
  const boneShape = [s(a.boneRoundness), s(a.boneWidth)].filter(Boolean)
  return {
    boneScale: [s(a.boneScale), ...boneShape], height: s(a.heightRange), shoulder: arr(a.shoulderShape),
    waist: waistCombined,
    limb: s(a.limbLength), handFoot: s(a.handFootSize), bodyShape: [...arr(a.bodyShape), ...bodyShapeHint.map(h => `${h}型`)],
    fleshTexture: arr(a.fleshTexture), hip: arr(a.hipProtrude), chest: arr(a.chestProtrude),
    waist_ui_label: waistCombined, body_shape_hint: bodyShapeHint, // 额外保留两层数据，供后台/分析使用
  }
}
