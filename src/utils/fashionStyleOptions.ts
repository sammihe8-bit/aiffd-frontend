// "个人时尚选择"里 Q1/Q2/Q3 共用的 12 种风格形象标签，FashionTestPage 和 ProfilePage 共用，
// 避免同一份数据在两个文件里各写一份、以后改一个忘了改另一个。
export const STYLE_OPTIONS: { id: string; label: string; desc: string }[] = [
  { id: 'clean_intellectual', label: '简洁知性', desc: '干净、克制、有条理' },
  { id: 'relaxed_natural', label: '松弛自然', desc: '舒适、随性、不刻意' },
  { id: 'refined_elegant', label: '精致优雅', desc: '讲究、得体、有品质' },
  { id: 'soft_romantic', label: '温柔浪漫', desc: '柔美、细腻、有女性感' },
  { id: 'crisp_professional', label: '利落职业', desc: '专业、清晰、有行动力' },
  { id: 'urban_modern', label: '都市摩登', desc: '现代、时髦、有距离感' },
  { id: 'youthful_energetic', label: '年轻活力', desc: '轻快、有朝气、不沉重' },
  { id: 'artistic_individual', label: '个性艺术', desc: '特别、有创意、有辨识度' },
  { id: 'glamorous_mature', label: '华丽成熟', desc: '浓郁、精致、有存在感' },
  { id: 'androgynous_sharp', label: '中性帅气', desc: '简练、直接、有力量' },
  { id: 'vintage_literary', label: '复古文艺', desc: '怀旧、安静、有文化感' },
  { id: 'oriental_refined', label: '东方雅致', desc: '含蓄、自然、有东方气质' },
]

export const NO_FIXED_STYLE = 'no_fixed_style'
export const NO_REJECTED_STYLE = 'no_rejected_style'

export function styleLabelOf(id: string): string {
  return STYLE_OPTIONS.find(o => o.id === id)?.label ?? id
}
