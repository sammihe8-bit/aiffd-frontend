// 2026-10-04 新增：把前端色彩测试的结果换算成 Human Profile DB 的字段值（Color Fit 依赖）。
//
// 库里的枚举：season_name 只有 春 / 夏 / 长夏 / 秋 / 冬，season_element 和 element_name 只有 木 / 火 / 土 / 金 / 水，
// final_season_25 是"季名 + 五行"（如 秋木），与商品侧 fashion_variant_color_identity 同一套写法。
//
// 长夏的三个子型（深 / 浅 / 标准）V1 统一写成"长夏"，深浅只留在本机 localStorage。
// 前端显示用的名字（"长夏·深"）不在库的枚举里，直接写会被 TiDB 拒绝，所以一律经过这里换算。

const PROFILE_SEASON: Record<string, { seasonName: string; seasonElement: string }> = {
  spring:            { seasonName: '春',   seasonElement: '木' },
  summer:            { seasonName: '夏',   seasonElement: '火' },
  changxia:          { seasonName: '长夏', seasonElement: '土' },
  changxia_deep:     { seasonName: '长夏', seasonElement: '土' },
  changxia_light:    { seasonName: '长夏', seasonElement: '土' },
  changxia_standard: { seasonName: '长夏', seasonElement: '土' },
  autumn:            { seasonName: '秋',   seasonElement: '金' },
  winter:            { seasonName: '冬',   seasonElement: '水' },
}

// 五季结果代码（spring、changxia_deep 等）→ 库字段值；不认识的代码返回 null，调用方不写库。
export function toProfileSeason(seasonResult: string | null | undefined): { seasonName: string; seasonElement: string } | null {
  if (!seasonResult || !Object.prototype.hasOwnProperty.call(PROFILE_SEASON, seasonResult)) return null
  return PROFILE_SEASON[seasonResult]
}

const FINAL_SEASON_25 = /^(春|夏|长夏|秋|冬)(木|火|土|金|水)$/

export function isValidFinalSeason25(value: string | null | undefined): boolean {
  return typeof value === 'string' && FINAL_SEASON_25.test(value)
}

// 五季、五行两层的结果只有在冷暖来自真实问卷时才写库。
// AI 识别路径用的是写死的 AI_MOCK_RESULT（数据字典 Color 模块 E 小节：不写入 Human Profile DB），
// 后面五季测试走哪条题目路径又取决于冷暖，所以那条路径算出的季型也不写。
// 判断依据：问卷完成时会写 aiffd_color_result = { colorGroup: 冷暖结果 }，AI 路径不写这个 key。
export function warmCoolIsFromQuestionnaire(colorResultRaw: string | null, warmCool: string | null): boolean {
  if (!colorResultRaw || !warmCool) return false
  try {
    const parsed = JSON.parse(colorResultRaw) as { colorGroup?: unknown }
    return parsed?.colorGroup === warmCool
  } catch {
    return false
  }
}
