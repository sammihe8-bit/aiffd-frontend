import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

// 视觉系统与 PrivacyPage / OnboardingPage 保持一致，两个说明类页面共用同一套版式：
// 金色强调 #B8973A，Georgia 衬线做标题，Inter 无衬线做正文，暖白背景。
const C = {
  bg: '#faf9f7', h1: '#171111', h2: '#1a1a1a', body: '#555', muted: '#999',
  gold: '#B8973A', border: '#e8e8e4', goldBg: '#fdf8ee',
}

// 文档来源：《AIFFD在线测试说明》V1.0（2026-09-12），全文照录，未做删减。
type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  // 目前只有"十、退出测试及数据权利"这一节末尾引用隐私政策原文，需要跳转链接，
  // 其余小节都是纯文本段落，没必要为了一处引用把整个 renderBlock 改成支持任意 JSX
  | { type: 'privacy-link' }

interface Section { heading: string; blocks: Block[] }

const DOC_VERSION = '版本：V1.0'
const DOC_DATE = '更新日期：2026年9月12日'

const INTRO = '欢迎参与AIFFD在线测试。开始测试前，请阅读以下说明，了解项目目前所处阶段、测试功能及相关使用规则。'

const SECTIONS: Section[] = [
  {
    heading: '一、项目阶段',
    blocks: [
      { type: 'p', text: 'AIFFD目前处于研究原型与小范围在线测试阶段，部分功能、问卷内容、分析逻辑和结果展示仍在持续完善。' },
      { type: 'p', text: '本轮测试的主要目的，是验证个人风格档案、视觉推荐方法和用户体验流程，并收集参与者主动提供的使用反馈。' },
    ],
  },
  {
    heading: '二、参与条件',
    blocks: [
      { type: 'p', text: '本轮测试仅面向年满18岁的参与者。' },
      { type: 'p', text: '如果你未满18岁，请不要注册账号、提交测试问卷或上传照片。' },
    ],
  },
  {
    heading: '三、测试费用',
    blocks: [
      { type: 'p', text: '本轮在线测试免费，不会产生实际扣费。' },
      { type: 'p', text: '页面中出现的"订阅""预约测试名额"或类似提示，仅用于登记测试资格或接收项目更新，不代表用户已经购买付费服务。' },
      { type: 'p', text: '如果AIFFD未来推出收费功能，将在收费前明确说明服务内容、价格和支付条件，并由用户另行确认，不会自动扣费。' },
    ],
  },
  {
    heading: '四、测试结果及使用范围',
    blocks: [
      { type: 'p', text: 'AIFFD根据用户主动提交的问卷答案、偏好信息，以及用户自愿上传的照片生成个人风格分析结果。' },
      { type: 'p', text: '测试结果可能包括个人风格、身体结构、面部特征、个人色彩、穿搭方向或商品匹配建议。' },
      { type: 'p', text: '这些结果仅供个人形象、风格探索和穿搭参考，不构成医疗、心理、健康或其他专业诊断，也不保证推荐商品一定适合购买、尺码完全合身或达到特定使用效果。' },
    ],
  },
  {
    heading: '五、测试结果可能更新',
    blocks: [
      { type: 'p', text: '由于AIFFD仍处于研究和测试阶段，测试题目、分析方法、分类标准及报告形式可能持续调整。' },
      { type: 'p', text: '用户的测试结果也可能随着问卷完善、个人反馈、资料更新和系统迭代而发生变化。因此，测试结果不应被理解为永久不变的个人分类或身份标签。' },
    ],
  },
  {
    heading: '六、照片上传为自主选择',
    blocks: [
      { type: 'p', text: '上传照片不是完成基础问卷测试的必要条件。' },
      { type: 'p', text: '如果用户主动选择照片分析功能，照片可能用于辅助判断身体结构、面部特征和个人色彩。不上传照片时，用户仍可通过文字说明和图片选项完成基础测试。' },
      { type: 'p', text: '照片的具体收集方式、使用目的、保存期限和删除方式，以下方隐私政策为准：' },
      { type: 'privacy-link' },
    ],
  },
  {
    heading: '七、研究和系统改进为自主选择',
    blocks: [
      { type: 'p', text: '是否允许AIFFD将去标识化后的问卷答案、用户反馈和测试结果用于研究分析、测试方法验证及系统改进，由用户自主选择。' },
      { type: 'p', text: '该选项默认不勾选。不同意不会影响用户完成基础测试或查看测试结果。' },
      { type: 'p', text: '用户可以在完成测试后撤回相关授权。撤回后，AIFFD将停止把相关数据用于未来的研究和系统改进；撤回前已经依法完成的处理不受影响。' },
    ],
  },
  {
    heading: '八、不会自动分享给第三方造型师',
    blocks: [
      { type: 'p', text: 'AIFFD目前不会自动将用户的个人档案、问卷答案或照片分享给第三方造型师。' },
      { type: 'p', text: '如果未来开放造型师咨询或档案共享功能，平台将在分享前说明接收方、分享内容、使用目的和保存方式，并取得用户另行授权。' },
    ],
  },
  {
    heading: '九、测试期间的功能变化',
    blocks: [
      { type: 'p', text: '研究测试期间，部分功能可能出现调整、结果生成延迟、显示异常、临时中断或重新测试等情况。' },
      { type: 'p', text: 'AIFFD可能根据测试反馈更新页面、问卷和分析逻辑。涉及个人信息处理方式的重要变化，将通过网站提示或隐私政策更新进行说明。' },
    ],
  },
  {
    heading: '十、退出测试及数据权利',
    blocks: [
      { type: 'p', text: '用户可以随时停止测试，也可以申请：' },
      { type: 'ul', items: [
        '查询或更正个人资料',
        '删除上传的照片',
        '撤回可选授权',
        '删除测试记录或个人账号',
        '了解个人信息的使用情况',
        '反馈测试问题或提出投诉',
      ] },
      { type: 'p', text: '具体申请方式和处理规则请查看：' },
      { type: 'privacy-link' },
    ],
  },
]

const pStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.9, margin: '0 0 16px',
}
const ulStyle: React.CSSProperties = { margin: '0 0 16px', paddingLeft: '20px' }
const liStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.9, marginBottom: '6px',
}

function renderBlock(b: Block, i: number) {
  if (b.type === 'p') return <p key={i} style={pStyle}>{b.text}</p>
  if (b.type === 'ul') {
    return (
      <ul key={i} style={ulStyle}>
        {b.items.map((it, j) => <li key={j} style={liStyle}>{it}</li>)}
      </ul>
    )
  }
  return (
    <Link key={i} to="/privacy" style={{
      display: 'inline-block', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.gold,
      letterSpacing: '0.5px', marginBottom: '16px',
    }}>
      《AIFFD隐私政策与研究测试数据说明》 →
    </Link>
  )
}

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '64px 24px 96px' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>AIFFD 智搭</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '30px', fontWeight: 400, color: C.h1, margin: '0 0 8px', lineHeight: 1.3 }}>
          AIFFD在线测试说明
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginBottom: '28px' }}>
          {DOC_VERSION} · {DOC_DATE}
        </p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <Link to="/privacy" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px' }}>
            查看《AIFFD隐私政策与研究测试数据说明》 →
          </Link>
          <Link to="/onboarding" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px' }}>
            ← 返回测试授权页
          </Link>
        </div>

        <div style={{ background: C.goldBg, padding: '20px 24px', borderLeft: `3px solid ${C.gold}`, marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444', lineHeight: 1.9, margin: 0 }}>
            {INTRO}
          </p>
        </div>

        {SECTIONS.map((s, i) => (
          <div key={s.heading} style={{ marginBottom: '40px', paddingBottom: i < SECTIONS.length - 1 ? '40px' : 0, borderBottom: i < SECTIONS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: C.h2, margin: '0 0 16px' }}>
              {s.heading}
            </h2>
            {s.blocks.map(renderBlock)}
          </div>
        ))}

        <div style={{ marginTop: '48px', paddingTop: '24px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: 1.9, margin: 0 }}>
            如有问题，请联系：<a href="mailto:hello@aiffd.com" style={{ color: C.gold }}>hello@aiffd.com</a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
