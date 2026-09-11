import { Link } from 'react-router-dom'

// AIFFD Research Landing Page —— 5 屏。
// 2026-09 视觉修订版：按设计反馈锁定了色值系统、字号层级、三类按钮规范，
// 把"What We Study"改成真正的 data pipeline 观感，升级了黑色 Profile 模块，
// 统一了 Research Framework 三卡等高，重新平衡了 Product × Research 左右比例，
// 并把版本号那一行改成了真正的 timeline。
//
// 三处需要你确认/替换的地方（已在对应位置加注释）：
// 1. RESEARCH_JOURNAL_URL —— Founder Research Journal 外链
// 2. AIFFD_ENTRY_PATH —— 内部 CTA 跳转路由，暂按 '/onboarding' 假设
// 3. Research Framework 卡片里 "Color" 那张的圆点颜色——设计稿里两处描述互相矛盾
//    （色值表给了专门的"Color 辅助紫 #88739A"，但卡片小节的文字又写"Color: 金"）。
//    考虑到"金色只负责强调/连接/CTA，不要大面积使用"这条总原则，这里选了色值表里
//    专门指定的紫色，把金色留给按钮和连接符。如果你确认当时就是想要金色，
//    改 FRAMEWORK_CARDS 里 Color Intelligence 那条的 dot 值就行。

const RESEARCH_JOURNAL_URL = 'https://en.ohsammi.com'
const AIFFD_ENTRY_PATH = '/onboarding'

// ── 锁定的色值系统（不要在下面各个模块里再新起灰色/金色） ──────────────
const P = {
  bg: '#FBFAF7',           // 页面背景
  card: '#FFFFFF',         // 卡片背景
  ink: '#171717',          // 主标题黑
  body: '#67645F',         // 二级正文
  muted: '#A4A09A',        // 辅助文字
  gold: '#C5A03A',         // AIFFD 主金 —— 只用于强调 / 连接符 / CTA
  goldLight: '#F5EFE1',    // 浅金背景（system tag 用）
  border: '#E8E4DC',       // 通用边框
  dark: '#151412',         // 暖黑模块（Profile 卡 / OhSammi 卡）
  aiffdPanel: '#F7F2E7',   // Product×Research 左侧 AIFFD 卡专用的浅暖金背景
  accentBrown: '#987B55',  // Body / Style 辅助色
  accentGreen: '#6F7E5E',  // Preference 辅助色
  accentPurple: '#88739A', // Color 辅助色
  // 暖黑模块内部用到的次级色阶（原稿没给具体值，按暖黑基调派生）
  darkBorder: 'rgba(255,255,255,0.14)',
  darkMuted: '#9C968C',
}

// ── 固定字号层级（对照设计反馈第 3 节） ────────────────────────────
const TYPE = {
  heroTitle: '56px', heroTitleMobile: '38px',
  sectionTitle: '40px', sectionTitleMobile: '30px',
  cardTitle: '24px',
  body: '17px',
  bodySmall: '15px',
  eyebrow: '12px',
  button: '15px',
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: TYPE.eyebrow, letterSpacing: '0.28em',
  color: P.gold, textTransform: 'uppercase' as const, margin: '0 0 16px', fontWeight: 500,
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Georgia, serif', fontWeight: 400, color: P.ink, lineHeight: 1.25, margin: '0 0 20px',
}

const bodyText: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: TYPE.bodySmall, color: P.body, lineHeight: 1.9, maxWidth: '800px',
}

// ── 三类按钮：以后整站只允许这三种，不要再长出第四种样式 ───────────────
const btnGoldFilled: React.CSSProperties = {
  display: 'inline-block', background: P.gold, color: '#fff', border: 'none', borderRadius: '4px',
  padding: '14px 32px', fontFamily: 'Inter, sans-serif', fontSize: TYPE.button,
  letterSpacing: '0.5px', cursor: 'pointer', textDecoration: 'none',
}

const btnWhiteOutline: React.CSSProperties = {
  display: 'inline-block', background: 'transparent', color: P.ink, border: `1px solid ${P.border}`,
  borderRadius: '4px', padding: '14px 26px', fontFamily: 'Inter, sans-serif', fontSize: TYPE.button,
  letterSpacing: '0.5px', cursor: 'pointer', textDecoration: 'none',
}

// 外部研究链接统一是"纯文字 + ↗"，不带边框/背景——整站的外链都应该长这样
const linkExternal: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: TYPE.button, color: P.body,
  textDecoration: 'none', cursor: 'pointer',
}
const linkExternalOnDark: React.CSSProperties = {
  ...linkExternal, color: '#E4D9B8',
}

// 跟 Navbar.tsx 里 Logo 的 "AIFFD" 用同一套字体处理：Inter + 600 字重，
// 页面里所有标题级别出现的 "AIFFD" 都套用这个，不要各处各写一套
const aiffdWordmark: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '1px',
}

function Aiffd() {
  return <span style={aiffdWordmark}>AIFFD</span>
}

function ExternalLink({ href, children, style }: { href: string; children: React.ReactNode; style: React.CSSProperties }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{children}</a>
}

// system tag：浅金背景的小型标签，Research Framework 卡片的方法论行专用
function SystemTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', background: P.goldLight, color: '#8a6d24',
      fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '0.02em',
      padding: '6px 14px', borderRadius: '999px', width: 'fit-content',
    }}>{children}</span>
  )
}

// Research Framework 三张卡片
const FRAMEWORK_CARDS = [
  {
    dot: P.accentBrown,
    title: '视觉风格系统',
    titleEn: 'Visual Style System',
    body: '通过身体结构与面部特征建立结构化视觉数据，并用于支持 AIFFD 13 型风格原型的综合判断。',
    caption: 'Body + Face → 13 Style Archetypes',
    linkLabel: '了解相关研究 ↗',
  },
  {
    dot: P.accentPurple,
    title: '个人色彩系统',
    titleEn: 'Color Intelligence',
    body: '通过肤色、发色、虹膜、唇色以及冷暖、明度、饱和度等视觉信号，探索东方色彩分类语言与个性化推荐之间的关系。',
    caption: 'Color Signals → Five Elements → 25 Color Identities',
    linkLabel: '了解相关研究 ↗',
  },
  {
    dot: P.accentGreen,
    title: '偏好与真实反馈',
    titleEn: 'Preference & Feedback',
    body: 'AIFFD 将"结构上适合什么"与"用户真正喜欢什么"分开记录，并通过真实穿搭、购买选择和持续反馈不断更新用户档案。',
    caption: 'Preference + Behavior → Evolving Profile',
    linkLabel: '阅读研究日志 ↗',
  },
]

// What We Study 数据管道的五个输入维度
const STUDY_INPUTS = [
  { en: 'Body', cn: '身体', desc: '体型、骨架、比例、身体线条' },
  { en: 'Face', cn: '面部', desc: '五官、轮廓、锐钝与视觉量感' },
  { en: 'Color', cn: '色彩', desc: '肤色、发色、虹膜、唇色与个人色彩关系' },
  { en: 'Preference', cn: '偏好', desc: '生活方式、场景、审美与消费选择' },
  { en: 'Feedback', cn: '真实反馈', desc: '穿搭照片、购买选择与持续使用反馈' },
]

// 版本演化 timeline：V1.0 是当前档案（金色实心点 + 黑字），后面都是未来版本（灰色空心点）
const VERSION_STEPS = [
  { label: 'Style Profile V1.0', current: true },
  { label: 'V1.1', current: false },
  { label: 'V1.2', current: false },
  { label: 'V2.0…', current: false },
]

// Hero 背景装饰图：Body/Face/Color/Preference/Feedback → Personal Style Profile 的线描结构图。
// 图片本身是白底，用 mix-blend-mode: multiply 让白色部分融进页面的米白背景，只留下线条和节点，
// 不需要额外裁图或做透明底。
// 素材路径 /research-hero-bg.png 需要放进 public/ 目录（随这次交付一起给了这个文件）。
function HeroStructureBackdrop() {
  // 蒙版：中间圆形区域（大致对应图里 "PERSONAL STYLE PROFILE" 那个圆环）显示度压到 30%，
  // 圆形以外维持 50%——用 mask-image 做一个圆形渐变蒙版叠在图片上，而不是简单调一个全局透明度。
  // 圆心位置和半径是按这张素材的构图目测估的，如果以后换素材，这两个百分比可能要跟着微调。
  const maskGradient =
    'radial-gradient(circle at 62% 45%, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.3) 16%, rgba(0,0,0,0.5) 26%, rgba(0,0,0,0.5) 100%)'
  return (
    <img
      src="/research-hero-bg.png"
      alt=""
      aria-hidden="true"
      style={{
        position: 'absolute', left: '50%', bottom: '-30px', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '1400px', height: 'auto',
        mixBlendMode: 'multiply' as const, pointerEvents: 'none',
        WebkitMaskImage: maskGradient,
        maskImage: maskGradient,
      }}
    />
  )
}

export default function ResearchPage() {
  return (
    <div style={{ background: P.bg }}>
      {/* 只负责响应式断点，颜色/字号仍然全部走上面锁定的 token，避免两套真相 */}
      <style>{`
        .rp-hero-title { font-size: ${TYPE.heroTitle}; }
        .rp-section-title { font-size: ${TYPE.sectionTitle}; }
        .rp-framework-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; }
        .rp-split { display: grid; grid-template-columns: 1fr 1fr; }
        .rp-cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        @media (max-width: 820px) {
          .rp-hero-title { font-size: ${TYPE.heroTitleMobile}; }
          .rp-section-title { font-size: ${TYPE.sectionTitleMobile}; }
          .rp-framework-grid { grid-template-columns: 1fr; }
          .rp-split { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .rp-cta-actions { flex-direction: column; align-items: stretch; }
          .rp-cta-actions > a { text-align: center; }
        }
      `}</style>

      {/* ── 第一屏 · Hero ── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '0 32px', overflow: 'hidden' }}>
        <HeroStructureBackdrop />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', textAlign: 'center' as const }}>
          <p style={eyebrow}>Research &amp; Methodology</p>
          <h1 className="rp-hero-title" style={{ fontFamily: 'Georgia, serif', fontWeight: 400, color: P.ink, lineHeight: 1.25, margin: '0 0 14px' }}>
            <Aiffd /> 背后的研究与方法
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: P.muted, letterSpacing: '0.04em', margin: '0 0 32px' }}>
            Research-driven Personal Style Intelligence
          </p>
          <p style={{ ...bodyText, margin: '0 auto 12px', textAlign: 'center' as const }}>
            AIFFD 是一个研究驱动的个人风格智能系统。
          </p>
          <p style={{ ...bodyText, margin: '0 auto 12px', textAlign: 'center' as const }}>
            我们正在探索如何将身体结构、面部特征、个人色彩、审美偏好与真实穿搭反馈转化为结构化数据，并形成一份可以随着用户持续使用而不断更新的个人风格档案。
          </p>
          <p style={{ ...bodyText, margin: '0 auto 40px', textAlign: 'center' as const }}>
            AIFFD 不希望通过一次测试给用户贴上永久标签，而是尝试建立一个能够随着用户变化持续演化的个人风格系统。
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <a href="#framework" style={btnGoldFilled}>了解研究框架 ↓</a>
            {/* 这里的次按钮虽然是外链，但 Hero 需要更强的视觉分量，按设计反馈用 White Outline 而不是纯文字链接 */}
            <ExternalLink href={RESEARCH_JOURNAL_URL} style={btnWhiteOutline}>Founder Research Journal ↗</ExternalLink>
          </div>
        </div>
      </section>

      {/* ── 第二屏 · What We Study ── */}
      <section style={{ padding: '130px 32px', borderTop: `1px solid ${P.border}` }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={eyebrow}>What We Study</p>
          <h2 className="rp-section-title" style={sectionTitle}>我们正在研究什么？</h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '56px' }}>
            {STUDY_INPUTS.map((item, i) => (
              <div key={item.en} style={{ width: '100%' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '20px', minHeight: '86px',
                  border: `1px solid ${P.border}`, borderRadius: '13px', padding: '18px 30px', background: P.card,
                }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: P.ink, minWidth: '150px', flexShrink: 0 }}>
                    {item.cn} <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: P.muted, letterSpacing: '0.05em' }}>{item.en}</span>
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: P.body }}>{item.desc}</span>
                </div>
                {i < STUDY_INPUTS.length - 1 && (
                  // 细金色垂直线 + 小圆点，替代原来的文字 "+"
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 0' }}>
                    <span style={{ width: '1px', height: '9px', background: 'rgba(197,160,58,0.4)' }} />
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: P.gold }} />
                    <span style={{ width: '1px', height: '9px', background: 'rgba(197,160,58,0.4)' }} />
                  </div>
                )}
              </div>
            ))}

            {/* 汇入 Profile 的连接线：约 60px 细金线 + 小箭头 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
              <span style={{ width: '1px', height: '60px', background: 'rgba(197,160,58,0.5)' }} />
              <span style={{
                width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                borderTop: `7px solid ${P.gold}`,
              }} />
            </div>

            {/* AIFFD Personal Style Profile —— 全站可复用的核心黑色识别组件 */}
            <div style={{
              width: '100%', textAlign: 'center' as const, borderRadius: '16px', minHeight: '170px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '32px 24px',
              background: `radial-gradient(ellipse at 50% 0%, rgba(197,160,58,0.10), transparent 60%), ${P.dark}`,
            }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#fff', margin: 0 }}>
                <Aiffd /> <span style={{ color: '#fff' }}>Personal Style Profile</span>
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#E4D9B8', margin: 0 }}>
                Evolving Personal Style Intelligence
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '0.08em', color: P.darkMuted, margin: '4px 0 0' }}>
                Body × Face × Color × Preference × Feedback
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' as const, marginTop: '56px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: P.ink, margin: '0 0 6px' }}>
              从一次性的风格标签，走向持续演化的个人风格档案。
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: P.muted, margin: 0 }}>
              From fixed style labels to an evolving personal style profile.
            </p>
          </div>
        </div>
      </section>

      {/* ── 第三屏 · Research Framework ── */}
      <section id="framework" style={{ padding: '130px 32px', borderTop: `1px solid ${P.border}`, background: P.card }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={eyebrow}>Research Framework</p>
          <h2 className="rp-section-title" style={sectionTitle}><Aiffd /> 的研究框架</h2>

          <div className="rp-framework-grid" style={{ marginTop: '56px' }}>
            {FRAMEWORK_CARDS.map(card => (
              <div key={card.titleEn} style={{
                border: `1px solid ${P.border}`, borderRadius: '14px', padding: '32px', minHeight: '380px',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: card.dot }} />
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: TYPE.cardTitle, color: P.ink, margin: '0 0 2px' }}>{card.title}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: P.muted, letterSpacing: '0.05em', margin: 0 }}>{card.titleEn}</p>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: P.body, lineHeight: 1.8, margin: 0, flex: 1 }}>{card.body}</p>
                <SystemTag>{card.caption}</SystemTag>
                <ExternalLink href={RESEARCH_JOURNAL_URL} style={{ ...linkExternal, borderTop: `1px solid ${P.border}`, paddingTop: '16px', fontSize: '13px' }}>
                  {card.linkLabel}
                </ExternalLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 第四屏 · AIFFD × OhSammi（重新平衡为 50 / 50） ── */}
      <section className="rp-split" style={{ borderTop: `1px solid ${P.border}` }}>
        <div style={{ padding: '96px 48px', background: P.aiffdPanel, textAlign: 'center' as const }}>
          <p style={eyebrow}>Product × Research</p>
          <h2 style={{ fontSize: '28px', margin: '0 0 8px' }}>
            <span style={{ ...aiffdWordmark, fontSize: '28px', color: P.ink }}>AIFFD</span>
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: P.accentBrown, letterSpacing: '0.04em', margin: '0 0 24px' }}>
            Working Product &amp; Research Prototype
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {['用户测试', 'Style Profile', 'AI 判断', '真实反馈', '产品验证'].map(t => (
              <li key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: P.body, display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: P.gold, display: 'inline-block' }} />
                {t}
              </li>
            ))}
          </ul>
          <Link to={AIFFD_ENTRY_PATH} style={btnGoldFilled}>体验 AIFFD →</Link>
        </div>

        <div style={{ padding: '96px 48px', background: P.dark, textAlign: 'center' as const }}>
          <p style={{ ...eyebrow, color: '#d9c68a' }}>Product × Research</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#fff', margin: '0 0 8px' }}>
            OhSammi Research
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: P.darkMuted, letterSpacing: '0.04em', margin: '0 0 24px' }}>
            Founder Research Journal
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            {['研究问题', '方法形成过程', 'AIFFD 系统迭代', '设计决策', 'AI 推荐、女性身份、信任与用户自主性相关研究'].map(t => (
              <li key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#d8d3c8', display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d9c68a', display: 'inline-block' }} />
                {t}
              </li>
            ))}
          </ul>
          {/* 外链统一用纯文字 + ↗，不再用之前的深色描边按钮——三种按钮之外不该有第四种样式 */}
          <ExternalLink href={RESEARCH_JOURNAL_URL} style={linkExternalOnDark}>进入 Research Journal ↗</ExternalLink>
        </div>

        <div style={{ gridColumn: '1 / -1', padding: '28px 48px', borderTop: `1px solid ${P.border}`, background: P.bg, textAlign: 'center' as const }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: P.ink, margin: '0 0 4px' }}>
            <Aiffd /> 是正在运行的系统；OhSammi Research 记录这个系统背后的研究过程。
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: P.muted, margin: 0 }}>
            AIFFD is the working system. OhSammi Research documents the thinking, methodology and ongoing development behind it.
          </p>
        </div>
      </section>

      {/* ── 第五屏 · Closing CTA ── */}
      <section style={{ padding: '130px 32px 64px', borderTop: `1px solid ${P.border}` }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' as const }}>
          <p style={eyebrow}>Build Your Profile. Shape The System.</p>
          <h2 className="rp-section-title" style={{ ...sectionTitle, textAlign: 'center' as const }}>建立你的个人风格档案</h2>
          <p style={{ ...bodyText, margin: '0 auto 12px', textAlign: 'center' as const }}>
            AIFFD 不把个人风格视为一个固定答案。
          </p>
          <p style={{ ...bodyText, margin: '0 auto 40px', textAlign: 'center' as const }}>
            随着测试结果、个人偏好、穿搭反馈与未来的周期性校准不断增加，你的个人风格档案将持续更新。
          </p>

          {/* Version timeline：V1.0 金色实心点 + 黑字（当前），后续版本灰色空心点 */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '460px', margin: '0 auto 56px' }}>
            {VERSION_STEPS.map((v, i) => (
              <div key={v.label} style={{ display: 'flex', alignItems: 'center', flex: i < VERSION_STEPS.length - 1 ? 1 : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{
                    width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
                    background: v.current ? P.gold : 'transparent',
                    border: v.current ? 'none' : `1px solid ${P.muted}`,
                  }} />
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '13px', whiteSpace: 'nowrap' as const,
                    color: v.current ? P.ink : P.muted, fontWeight: v.current ? 600 : 400,
                  }}>{v.label}</span>
                </div>
                {i < VERSION_STEPS.length - 1 && (
                  <span style={{ flex: 1, height: '1px', background: P.border, margin: '0 10px' }} />
                )}
              </div>
            ))}
          </div>

          <div className="rp-cta-actions" style={{ marginBottom: '64px' }}>
            <Link to={AIFFD_ENTRY_PATH} style={{ ...btnGoldFilled, padding: '16px 44px', minWidth: '280px' }}>开始建立我的 Style Profile →</Link>
            <ExternalLink href={RESEARCH_JOURNAL_URL} style={{ ...linkExternal, alignSelf: 'center', padding: '16px 0' }}>阅读研究日志 ↗</ExternalLink>
          </div>

          <div style={{ borderTop: `1px solid ${P.border}`, paddingTop: '24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.2em', color: P.muted, margin: '0 0 8px' }}>RESEARCH NOTE</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: P.muted, lineHeight: 1.8, margin: 0 }}>
              AIFFD 目前处于持续开发与真实产品验证阶段，其方法用于个人风格探索与穿衣决策辅助，并非医疗、心理或临床诊断工具。
              更详细的研究方法与项目迭代记录，请访问 OhSammi Research。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
