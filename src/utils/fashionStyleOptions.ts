// "个人时尚选择"里 Q1/Q2/Q3 共用的 12 种风格形象标签，FashionTestPage 和 ProfilePage 共用，
// 避免同一份数据在两个文件里各写一份、以后改一个忘了改另一个。
// img 字段目前只有 Q1（理想形象）在用，用图文卡片替代原来的纯文字卡片；
// Q2/Q3 仍然用纯文字卡片，不引用这个字段，互不影响。
export const STYLE_OPTIONS: { id: string; label: string; desc: string; img: string }[] = [
  { id: 'clean_intellectual', label: '简洁知性', desc: '干净、克制、有条理', img: '/fashion-clean_intellectual.png' },
  { id: 'relaxed_natural', label: '松弛自然', desc: '舒适、随性、不刻意', img: '/fashion-relaxed_natural.png' },
  { id: 'refined_elegant', label: '精致优雅', desc: '讲究、得体、有品质', img: '/fashion-refined_elegant.png' },
  { id: 'soft_romantic', label: '温柔浪漫', desc: '柔美、细腻、有女性感', img: '/fashion-soft_romantic.png' },
  { id: 'crisp_professional', label: '利落职业', desc: '专业、清晰、有行动力', img: '/fashion-crisp_professional.png' },
  { id: 'urban_modern', label: '都市摩登', desc: '现代、时髦、有距离感', img: '/fashion-urban_modern.png' },
  { id: 'youthful_energetic', label: '年轻活力', desc: '轻快、有朝气、不沉重', img: '/fashion-youthful_energetic.png' },
  { id: 'artistic_individual', label: '个性艺术', desc: '特别、有创意、有辨识度', img: '/fashion-artistic_individual.png' },
  { id: 'glamorous_mature', label: '华丽成熟', desc: '浓郁、精致、有存在感', img: '/fashion-glamorous_mature.png' },
  { id: 'androgynous_sharp', label: '中性帅气', desc: '简练、直接、有力量', img: '/fashion-androgynous_sharp.png' },
  { id: 'vintage_literary', label: '复古文艺', desc: '怀旧、安静、有文化感', img: '/fashion-vintage_literary.png' },
  { id: 'oriental_refined', label: '东方雅致', desc: '含蓄、自然、有东方气质', img: '/fashion-oriental_refined.png' },
]
export const NO_FIXED_STYLE = 'no_fixed_style'
export const NO_REJECTED_STYLE = 'no_rejected_style'
export function styleLabelOf(id: string): string {
  return STYLE_OPTIONS.find(o => o.id === id)?.label ?? id
}
