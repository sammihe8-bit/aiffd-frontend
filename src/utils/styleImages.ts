// 13 型风格 → 模特图文件名 slug 的映射，ProfilePage 和 StyleTestPage 的结果页共用。
// 图片放在 public/ 根目录下，命名规则：家族英文-档位（soft/base/dramatic）
// 以后如果新增/修改风格图片命名，只用改这一个文件。
const VARIANT_IMAGE_SLUG: Record<string, string> = {
  '浪漫型': 'romantic-base',
  '戏剧浪漫型': 'romantic-dramatic',
  '柔软少年型': 'gamine-soft',
  '少年型': 'gamine-base',
  '戏剧少年型': 'gamine-dramatic',
  '柔软经典型': 'classic-soft',
  '经典型': 'classic-base',
  '戏剧经典型': 'classic-dramatic',
  '浪漫自然型': 'natural-soft',
  '自然型': 'natural-base',
  '戏剧自然型': 'natural-dramatic',
  '浪漫戏剧型': 'dramatic-soft',
  '戏剧型': 'dramatic-base',
}

// 根据风格中文名（比如"经典型"）算出模特图的访问路径；没有对应素材时返回 undefined，
// 调用方应该显示"模特图片素材准备中"之类的占位文案，而不是渲染一个会 404 的 <img>
export function getStylePortraitSrc(variantName: string | undefined | null): string | undefined {
  if (!variantName) return undefined
  const slug = VARIANT_IMAGE_SLUG[variantName]
  return slug ? `/${slug}.png` : undefined
}
