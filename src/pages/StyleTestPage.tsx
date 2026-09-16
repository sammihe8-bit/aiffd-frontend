import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { computeStyleScore, type StyleAnswers } from '../utils/styleScoring'
import { useAuth } from '../hooks/useAuth'
import { userScopedKey } from '../utils/userStorage'
import { getStylePortraitSrc } from '../utils/styleImages'
import { humanProfileAPI } from '../utils/api'
import ThreeStageProgress from '../components/ThreeStageProgress'

// ─── 设计系统（与 BodyTestPage 保持一致）─────────────────────
const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
}

const btnGold: React.CSSProperties = {
  background: C.gold, color: '#fff', border: 'none', borderRadius: '4px',
  padding: '14px 32px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
  letterSpacing: '1px', cursor: 'pointer',
}
const btnOutline: React.CSSProperties = {
  background: 'transparent', color: C.body, border: `1px solid ${C.border}`,
  borderRadius: '4px', padding: '14px 24px', fontFamily: 'Inter, sans-serif',
  fontSize: '12px', cursor: 'pointer',
}

// 选项字母标注：A/B/C/D/E，跟 BodyTestPage 里的同名工具函数保持一致，用于"整体风格复核"的选项
function letterOf(i: number): string {
  return String.fromCharCode(65 + i)
}

// 图文单选卡片：嘴部宽度/嘴唇厚度这两组用，配图 + 标题 + 说明，单选（同组内选中一个自动取消其他）
function ImageRadioCard({ img, label, sub, active, onClick, imgHeight = 140, imgFit = 'cover' }: {
  img: string; label: string; sub?: string; active: boolean; onClick: () => void; imgHeight?: number; imgFit?: 'cover' | 'contain'
}) {
  return (
    <button onClick={onClick} style={{
      border: 'none', boxShadow: active ? `0 0 0 2px ${C.gold}` : `0 0 0 1px ${C.border}`,
      borderRadius: '8px', padding: 0, cursor: 'pointer', overflow: 'hidden',
      background: active ? '#fdf8ee' : '#fff', transition: 'all 0.2s', textAlign: 'left' as const,
    }}>
      <div style={{ width: '100%', height: `${imgHeight}px`, background: '#f5f3ef', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src={img} alt={label} style={{ width: '100%', height: '100%', objectFit: imgFit, objectPosition: 'center', display: 'block' }} />
      </div>
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: active ? C.gold : C.h2, margin: sub ? '0 0 3px' : 0 }}>{label}</p>
        {sub && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: 0, lineHeight: 1.5 }}>{sub}</p>}
      </div>
    </button>
  )
}

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.gold, margin: 0 }}>{label}</p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, margin: 0 }}>{current} / {total}</p>
      </div>
      <div style={{ height: '1px', background: C.border }}>
        <div style={{ height: '1px', background: C.gold, width: `${(current / total) * 100}%`, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

// ─── 面部测试题目配置 ──────────────────────────────────────────
// 6 个维度，对应 styleMatrix.ts 里 id 为 lip/cheek/cheekbone/chin/eyes/nose 的定义
// 嘴唇、面颊是 imageCombo（两组各自单选，图文选项，组合成一个数组存档）；
// 其余 3 项暂时还是 combo（两个子分类可多选，文字标签，标签合并存成一个数组）
const LIP_WIDTH_OPTIONS = [
  { id: 'narrow', label: '偏窄', sub: '嘴角间距相对脸宽较小', img: '/mouth-width-narrow.png' },
  { id: 'balanced', label: '适中', sub: '嘴宽与整体五官比例均衡', img: '/mouth-width-balanced.png' },
  { id: 'wide', label: '偏宽', sub: '嘴角横向延伸明显', img: '/mouth-width-wide.png' },
]
const LIP_FULLNESS_OPTIONS = [
  { id: 'thin', label: '偏薄', sub: '上下唇高度较小，轮廓偏平', img: '/lip-fullness-thin.png' },
  { id: 'medium', label: '适中', sub: '有自然弧度和适度饱满感', img: '/lip-fullness-medium.png' },
  { id: 'full', label: '丰满', sub: '上下唇高度明显，轮廓圆润', img: '/lip-fullness-full.png' },
]
const CHEEK_CONTOUR_OPTIONS = [
  { id: 'round', label: '圆弧型', img: '/cheek-contour-round.png' },
  { id: 'balanced', label: '均衡型', img: '/cheek-contour-balanced.png' },
  { id: 'angular', label: '棱角型', img: '/cheek-contour-angular.png' },
]
const CHEEK_FULLNESS_OPTIONS = [
  { id: 'full', label: '饱满', img: '/cheek-fullness-full.png' },
  { id: 'medium', label: '适中', img: '/cheek-fullness-medium.png' },
  { id: 'thin', label: '偏薄', img: '/cheek-fullness-thin.png' },
]
const CHEEKBONE_PROMINENCE_OPTIONS = [
  { id: 'low', label: '不明显', sub: '颧骨高点不突出，太阳穴到面颊过渡平缓', img: '/cheekbone-prominence-low.png' },
  { id: 'medium', label: '适中', sub: '能看到自然高点，但不会特别抢眼', img: '/cheekbone-prominence-medium.png' },
  { id: 'high', label: '明显', sub: '颧骨高点清楚，向前或向两侧的存在感较强', img: '/cheekbone-prominence-high.png' },
]
const CHEEKBONE_CONTOUR_OPTIONS = [
  { id: 'round', label: '圆润型', sub: '颧骨区域呈柔和圆弧，没有明显折角', img: '/cheekbone-contour-round.png' },
  { id: 'balanced', label: '均衡型', sub: '有一定轮廓变化，但不过分圆润或锐利', img: '/cheekbone-contour-balanced.png' },
  { id: 'angular', label: '棱角型', sub: '颧骨转折清楚，局部线条较直、有折角感', img: '/cheekbone-contour-angular.png' },
]
const CHIN_LENGTH_OPTIONS = [
  { id: 'short', label: '偏短', sub: '下唇至下巴底部的距离较短', img: '/chin-length-short.png' },
  { id: 'medium', label: '适中', sub: '下巴长度与整体面部比例协调', img: '/chin-length-medium.png' },
  { id: 'long', label: '偏长', sub: '下唇至下巴底部的距离较长', img: '/chin-length-long.png' },
]
const CHIN_TIP_OPTIONS = [
  { id: 'round', label: '圆润型', sub: '底部呈柔和圆弧', img: '/chin-tip-round.png' },
  { id: 'pointed', label: '尖窄型', sub: '向下逐渐收窄，形成较尖的轮廓', img: '/chin-tip-pointed.png' },
  { id: 'square', label: '方阔型', sub: '底部较平，左右转角比较清楚', img: '/chin-tip-square.png' },
]
const EYE_SIZE_OPTIONS = [
  { id: 'small', label: '偏小', sub: '眼睛在面部中的视觉占比较小', img: '/eye-size-small.png' },
  { id: 'medium', label: '适中', sub: '眼睛大小与整体五官比例均衡', img: '/eye-size-medium.png' },
  { id: 'large', label: '偏大', sub: '眼睛在面部中的视觉占比较大', img: '/eye-size-large.png' },
]
const EYE_SHAPE_OPTIONS = [
  { id: 'round', label: '圆润型', sub: '上下展开明显，眼睛纵向高度较大', img: '/eye-shape-round.png' },
  { id: 'almond', label: '杏仁型', sub: '中部较宽，内外眼角自然收窄', img: '/eye-shape-almond.png' },
  { id: 'long', label: '细长型', sub: '横向延伸明显，纵向高度较小', img: '/eye-shape-long.png' },
]
const EYE_SPACING_OPTIONS = [
  { id: 'close', label: '偏近', sub: '小于一只眼睛的宽度', img: '/eye-spacing-close.png' },
  { id: 'medium', label: '适中', sub: '约等于一只眼睛的宽度', img: '/eye-spacing-medium.png' },
  { id: 'far', label: '偏远', sub: '大于一只眼睛的宽度', img: '/eye-spacing-far.png' },
]
const NOSE_SIZE_OPTIONS = [
  { id: 'small', label: '偏小', sub: '鼻子长度和鼻翼宽度在面部中的视觉占比较小', img: '/nose-size-small.png' },
  { id: 'medium', label: '适中', sub: '鼻子大小与其他五官比例较均衡', img: '/nose-size-medium.png' },
  { id: 'large', label: '偏大', sub: '鼻子长度、宽度或整体存在感较强', img: '/nose-size-large.png' },
]
const NOSE_TIP_OPTIONS = [
  { id: 'round', label: '圆润型', sub: '鼻尖偏圆，鼻翼线条柔和', img: '/nose-tip-round.png' },
  { id: 'balanced', label: '均衡型', sub: '鼻尖有一定轮廓，但不过分圆钝或锐利', img: '/nose-tip-balanced.png' },
  { id: 'angular', label: '棱角型', sub: '鼻尖较清晰，鼻翼或鼻孔边缘转折明显', img: '/nose-tip-angular.png' },
]
const NOSE_PROJECTION_OPTIONS = [
  { id: 'flat', label: '偏平', sub: '鼻梁起伏较小，鼻尖突出度较弱', img: '/nose-projection-flat.png' },
  { id: 'medium', label: '适中', sub: '鼻梁和鼻尖具有自然的立体起伏', img: '/nose-projection-medium.png' },
  { id: 'prominent', label: '突出', sub: '鼻梁较高或鼻尖向前突出明显', img: '/nose-projection-prominent.png' },
]

const FACE_QUESTIONS = [
  {
    id: 'lip', title: '你的嘴部宽度和嘴唇厚度更接近哪一种？', type: 'imageCombo' as const,
    hint: '请保持嘴唇自然闭合，分别判断横向宽度和上下唇的纵向厚度。',
    imageGroups: [
      { key: 'width', label: '嘴部宽度', imgHeight: 260, imgFit: 'contain' as const, options: LIP_WIDTH_OPTIONS },
      { key: 'fullness', label: '嘴唇厚度', imgHeight: 140, options: LIP_FULLNESS_OPTIONS },
    ],
  },
  {
    id: 'cheek', title: '你的面颊外轮廓和丰满度更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '面颊轮廓：请观察脸部两侧的线条形状。',
      '面颊丰满度：请观察金色区域是否饱满或略有凹陷。',
    ],
    imageGroups: [
      { key: 'contour', label: '面颊外轮廓', imgHeight: 260, imgFit: 'contain' as const, options: CHEEK_CONTOUR_OPTIONS },
      { key: 'fullness', label: '面颊丰满度', imgHeight: 260, imgFit: 'contain' as const, options: CHEEK_FULLNESS_OPTIONS },
    ],
  },
  {
    id: 'cheekbone', title: '你的颧骨明显程度和轮廓形态更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '颧骨明显程度：从斜前方观察，你的颧骨突出程度更接近哪一种。',
      '颧骨轮廓形态：从正面观察，你的颧骨轮廓更接近哪一种。',
    ],
    imageGroups: [
      { key: 'prominence', label: '颧骨明显程度', imgHeight: 260, imgFit: 'contain' as const, options: CHEEKBONE_PROMINENCE_OPTIONS },
      { key: 'contour', label: '颧骨轮廓形态', imgHeight: 260, imgFit: 'contain' as const, options: CHEEKBONE_CONTOUR_OPTIONS },
    ],
  },
  {
    id: 'chin', title: '你的下巴纵向比例和尖端轮廓更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '下巴纵向比例：从正面观察，你的下巴长度更接近哪一种。',
      '下巴尖端轮廓：你的下巴最下端更接近哪一种。',
    ],
    imageGroups: [
      { key: 'length', label: '下巴纵向比例', imgHeight: 260, imgFit: 'contain' as const, options: CHIN_LENGTH_OPTIONS },
      { key: 'tip', label: '下巴尖端轮廓', imgHeight: 260, imgFit: 'contain' as const, options: CHIN_TIP_OPTIONS },
    ],
  },
  {
    id: 'eyes', title: '你的眼睛大小、轮廓形状和两眼间距更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '眼睛相对大小：与整张脸相比，你的眼睛大小更接近哪一种。',
      '眼睛轮廓形状：不考虑眼睛大小，你的眼裂轮廓更接近哪一种。',
      '两眼间距：两只眼睛内眼角之间的距离更接近哪一种。',
    ],
    imageGroups: [
      { key: 'size', label: '眼睛相对大小', imgHeight: 260, imgFit: 'contain' as const, options: EYE_SIZE_OPTIONS },
      { key: 'shape', label: '眼睛轮廓形状', imgHeight: 260, imgFit: 'contain' as const, options: EYE_SHAPE_OPTIONS },
      { key: 'spacing', label: '两眼间距', imgHeight: 260, imgFit: 'contain' as const, options: EYE_SPACING_OPTIONS },
    ],
  },
  {
    id: 'nose', title: '你的鼻子相对量感、鼻尖轮廓和立体度更接近哪一种？', type: 'imageCombo' as const,
    hints: [
      '鼻子相对量感：与整张脸相比，你的鼻子整体大小更接近哪一种。',
      '鼻尖轮廓：从正面观察，你的鼻尖和鼻翼轮廓更接近哪一种。',
      '鼻部立体度：从斜侧面观察，你的鼻梁和鼻尖突出程度更接近哪一种。',
    ],
    imageGroups: [
      { key: 'size', label: '鼻子相对量感', imgHeight: 260, imgFit: 'contain' as const, options: NOSE_SIZE_OPTIONS },
      { key: 'tip', label: '鼻尖轮廓', imgHeight: 260, imgFit: 'contain' as const, options: NOSE_TIP_OPTIONS },
      { key: 'projection', label: '鼻部立体度', imgHeight: 260, imgFit: 'contain' as const, options: NOSE_PROJECTION_OPTIONS },
    ],
  },
]

// ─── 整体风格复核（原"气血态"）──────────────────────────────────
// 2026-09-04 架构调整：这 4 题原本放在体型测试里，现在独立成一个模块，插在面部测试完成之后、
// 出最终结果之前。作用也从"直接决定 13 型所属大类家族"改成"辅助校验前面体型+面部测出的结果"——
// 体型+面部两层匹配引擎的得分占最终家族判定权重的 80%-85%，这 4 题占 15%-20%，加权逻辑在
// styleScoring.ts 的 computeStyleScore 第二个参数（qiXueState）里实现，见该文件 VERIFY_WEIGHT_RATIO。
// 5 态直选计票机制不变：阴/阴多阳少/阴阳和谐/阴少阳多/阳，4 票选最高票，打平判定为"阴阳和谐"（居中态）。
// 这个结果也不只用于风格判定——色彩测试那边依赖它计算五行，所以存档的 key（aiffd_qixue_result）
// 和数据结构（qiXueState + q1~q4）必须保持不变。
const VERIFY_QUESTIONS = [
  {
    title: '你的气质第一印象更接近哪一种？',
    hint: '观察自己在不刻意造型时给人的第一感觉。',
    optionText: {
      '阴': '温婉柔美，让人想亲近', '阴多阳少': '清新灵动，元气感强', '阴阳和谐': '优雅得体，落落大方',
      '阴少阳多': '自然松弛，随性洒脱', '阳': '干练飒爽，气场强烈',
    },
  },
  {
    title: '你的身体整体线条给人的感觉更接近哪一种？',
    hint: '综合看上臂、腰腹、大腿这些部位给人的整体印象，不用纠结胖瘦或触感。',
    optionText: {
      '阴': '柔软丰盈，曲线感强', '阴多阳少': '紧致小巧，灵巧轻盈', '阴阳和谐': '匀称适中，不软不硬',
      '阴少阳多': '自然松弛，不刻意雕琢', '阳': '紧实健硕，线条分明',
    },
  },
  {
    title: '你的面部整体线条更接近哪一种？',
    hint: '请综合观察脸部轮廓和五官线条给人的整体感觉，跟性格无关。',
    optionText: {
      '阴': '圆润饱满，五官柔和', '阴多阳少': '小巧精致，略带俏皮', '阴阳和谐': '端正对称，比例均衡',
      '阴少阳多': '舒展自然，不做作', '阳': '棱角分明，五官立体锐利',
    },
  },
  {
    title: '熟悉你的人通常怎样评价你的整体气场？',
    hint: '想一想家人、朋友这些真正了解你的人的评价，而不是陌生人第一眼因为穿着、职业或场合产生的印象。',
    optionText: {
      '阴': '性感、有女人味', '阴多阳少': '可爱、少女感', '阴阳和谐': '优雅、精致',
      '阴少阳多': '随性、休闲', '阳': '帅气、有力量感',
    },
  },
]

// 气血态：5 态直选计票，取最高票；打平判定为"阴阳和谐"（居中态）
function calcQiXue(q1: string, q2: string, q3: string, q4: string): string {
  const scores: Record<string, number> = { '阴': 0, '阴多阳少': 0, '阴阳和谐': 0, '阴少阳多': 0, '阳': 0 }
  ;[q1, q2, q3, q4].forEach(v => { if (v && scores[v] !== undefined) scores[v]++ })
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const top = sorted[0][1]
  const tied = sorted.filter(([, v]) => v === top)
  if (tied.length > 1) return '阴阳和谐'
  return sorted[0][0]
}

type Phase = 'intro' | 'face' | 'verify' | 'report'

// 结果页用的一句话气质文案，按家族给（同一家族内的档位共用一句），后续想按 13 型精细区分可以再拆
const FAMILY_TAGLINE: Record<string, string> = {
  '经典型': '线条干净、比例均衡，你的气质自带一种从容的高级感。',
  '少年型': '利落有个性，你的气质轻盈鲜活，充满少年感的张力。',
  '自然型': '松弛自然，不刻意雕琢，你的气质舒展随性又真实。',
  '戏剧型': '轮廓分明、气场强烈，你天生自带舞台感。',
  '浪漫型': '曲线柔美，细节精致，你的气质温柔又有女人味。',
}

// 面部6个维度的中文标签，存档时一起写进去，Profile 页展示时不用再重复维护这份映射
const FACE_DIMENSION_LABELS: Record<string, string> = {
  lip: '嘴唇', cheek: '两颊', cheekbone: '颧骨', chin: '下巴', eyes: '眼睛', nose: '鼻子',
}

// 报告页要展示的最终结果形状（跟 aiffd_style_result 存档结构一致）
interface StyleReportResult {
  variant: string
  styleInfo: { cn: string; en: string; family: string; familyEn: string; element: string }
}

// 2026-09-16 新增：面部几个维度的前端选项 id 和 Human Profile DB schema 的枚举值不完全一致，
// 双写进后端之前需要做一次映射，映射不到的（不在表里的 key）原样透传。
const CHEEK_FULLNESS_TO_SCHEMA: Record<string, string> = { full: 'full', medium: 'moderate', thin: 'lean' }
const CHEEKBONE_PROMINENCE_TO_SCHEMA:
