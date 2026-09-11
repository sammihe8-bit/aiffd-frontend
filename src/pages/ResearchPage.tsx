import { Link } from 'react-router-dom'

// AIFFD Research Landing Page —— 5 屏，按你给的文案稿实现。
// 复用了 ProfilePage / BodyTestPage 里同一套设计 token（金色 + 米白背景 + Georgia/Inter），
// 保持跟站内其他页面视觉上是同一个产品，而不是另起一套风格。
//
// 两处需要你确认/替换的地方（已在对应位置加注释）：
// 1. RESEARCH_JOURNAL_URL —— Founder Research Journal 外链，文案里给的是 https://en.ohsammi.com
// 2. AIFFD_ENTRY_PATH —— "开始建立我的 Style Profile" / "体验 AIFFD" 按钮跳转的路由，
//    暂时按 BodyTestPage.tsx 里 skipToOtherTests() 用的 '/onboarding' 假设，如果实际测试入口路由不同，改这一个常量就行。

const RESEARCH_JOURNAL_URL = 'https://en.ohsammi.com'
const AIFFD_ENTRY_PATH = '/onboarding'

const C = {
  gold: '#B8973A', border: '#e8e8e4', muted: '#999999',
  body: '#666666', h1: '#111111', bg: '#faf9f7',
  // 第四屏用来做"产品 vs 研究"对比的深色一侧，选了偏暖的墨色而不是纯黑，跟米白背景呼应
  dark: '#1c1a16', darkBorder: '#3a3630', darkMuted: '#9a9488',
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px',
  color: C.gold, textTransform: 'uppercase' as const, margin: '0 0 16px',
}

const h2Style: React.CSSProperties = {
  fontFamily: 'Georgia, serif', fontSize: '34px', fontWeight: 400, color: C.h1,
  lineHeight: 1.25, margin: '0 0 20px',
}

const bodyStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.body, lineHeight: 1.9, maxWidth: '640px',
}

const btnGold: React.CSSProperties = {
  display: 'inline-block', background: C.gold, color: '#fff', border: 'none', borderRadius: '4px',
  padding: '14px 28px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
  letterSpacing: '1px', cursor: 'pointer', textDecoration: 'none',
}

const btnGhost: React.CSSProperties = {
  display: 'inline-block', background: 'transparent', color: C.body, border: `1px solid ${C.border}`,
  borderRadius: '4px', padding: '14px 24px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
  letterSpacing: '1px', cursor: 'pointer', textDecoration: 'none',
}

const btnGhostDark: React.CSSProperties = {
  display: 'inline-block', background: 'transparent', color: '#fff', border: `1px solid ${C.darkBorder}`,
  borderRadius: '4px', padding: '14px 24px', fontFamily: 'Inter, sans-serif', fontSize: '13px',
  letterSpacing: '1px', cursor: 'pointer', textDecoration: 'none',
}

// 研究框架三张卡片的数据——刻意不做成一模一样的圆角卡片堆叠，
// 每张卡片左上角用不同的小圆点色块区分主题（视觉+身体、色彩、偏好三条线互不相同）
const FRAMEWORK_CARDS = [
  {
    dot: '#8B7355',
    title: '视觉风格系统',
    titleEn: 'Visual Style System',
    body: '通过身体结构与面部特征建立结构化视觉数据，并用于支持 AIFFD 13 型风格原型的综合判断。',
    caption: 'Body + Face → 13 Style Archetypes',
  },
  {
    dot: '#B8973A',
    title: '个人色彩系统',
    titleEn: 'Color Intelligence',
    body: '通过肤色、发色、虹膜、唇色以及冷暖、明度、饱和度等视觉信号，探索东方色彩分类语言与个性化推荐之间的关系。',
    caption: 'Color Signals → Five Elements → 25 Color Identities',
  },
  {
    dot: '#6B7A5A',
    title: '偏好与真实反馈',
    titleEn: 'Preference & Feedback',
    body: 'AIFFD 将"结构上适合什么"与"用户真正喜欢什么"分开记录，并通过真实穿搭、购买选择和持续反馈不断更新用户档案。',
    caption: 'Preference + Behavior → Evolving Profile',
  },
]

// 第二屏结构图的五个输入维度
const STUDY_INPUTS = [
  { en: 'Body', cn: '身体', desc: '体型、骨架、比例、身体线条' },
  { en: 'Face', cn: '面部', desc: '五官、轮廓、锐钝与视觉量感' },
  { en: 'Color', cn: '色彩', desc: '肤色、发色、虹膜、唇色与个人色彩关系' },
  { en: 'Preference', cn: '偏好', desc: '生活方式、场景、审美与消费选择' },
  { en: 'Feedback', cn: '真实反馈', desc: '穿搭照片、购买选择与持续使用反馈' },
]

function ExternalLink({ href, children, style }: { href: string; children: React.ReactNode; style: React.CSSProperties }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" style={style}>{children}</a>
}

export default function ResearchPage() {
  return (
    <div style={{ background: C.bg }}>

      {/* ── 第一屏 · Hero ── */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' as const }}>
          <p style={eyebrow}>Research &amp; Methodology</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '48px', fontWeight: 400, color: C.h1, lineHeight: 1.25, margin: '0 0 28px' }}>
            AIFFD 背后的研究与方法
          </h1>
          <p style={{ ...bodyStyle, margin: '0 auto 12px', textAlign: 'center' as const }}>
            AIFFD 是一个研究驱动的个人风格智能系统。
          </p>
          <p style={{ ...bodyStyle, margin: '0 auto 12px', textAlign: 'center' as const }}>
            我们正在探索如何将身体结构、面部特征、个人色彩、审美偏好与真实穿搭反馈转化为结构化数据，并形成一份可以随着用户持续使用而不断更新的个人风格档案。
          </p>
          <p style={{ ...bodyStyle, margin: '0 auto 40px', textAlign: 'center' as const }}>
            AIFFD 不希望通过一次测试给用户贴上永久标签，而是尝试建立一个能够随着用户变化持续演化的个人风格系统。
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <a href="#framework" style={btnGold}>了解研究框架 ↓</a>
            <ExternalLink href={RESEARCH_JOURNAL_URL} style={btnGhost}>Founder Research Journal ↗</ExternalLink>
          </div>
        </div>
      </section>

      {/* ── 第二屏 · What We Study ── */}
      <section style={{ padding: '100px 32px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={eyebrow}>What We Study</p>
          <h2 style={h2Style}>我们正在研究什么？</h2>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '48px' }}>
            {STUDY_INPUTS.map((item, i) => (
              <div key={item.en} style={{ width: '100%' }}>
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: '14px',
                  border: `1px solid ${C.border}`, borderRadius: '8px', padding: '20px 24px', background: '#fff',
                }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: C.gold, minWidth: '110px' }}>
                    {item.cn} <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted }}>{item.en}</span>
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body }}>{item.desc}</span>
                </div>
                {i < STUDY_INPUTS.length - 1 && (
                  <p style={{ textAlign: 'center' as const, color: C.gold, fontFamily: 'Georgia, serif', fontSize: '18px', margin: '10px 0' }}>+</p>
                )}
              </div>
            ))}

            <p style={{ color: C.gold, fontFamily: 'Georgia, serif', fontSize: '22px', margin: '18px 0' }}>↓</p>

            <div style={{
              width: '100%', textAlign: 'center' as const, background: C.h1, borderRadius: '8px', padding: '32px 24px',
            }}>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#fff', margin: '0 0 8px' }}>
                AIFFD Personal Style Profile
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#c9c4b8', margin: 0 }}>
                持续演化的个人风格档案
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center' as const, marginTop: '48px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '17px', color: C.h1, margin: '0 0 6px' }}>
              从一次性的风格标签，走向持续演化的个人风格档案。
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>
              From fixed style labels to an evolving personal style profile.
            </p>
          </div>
        </div>
      </section>

      {/* ── 第三屏 · Research Framework ── */}
      <section id="framework" style={{ padding: '100px 32px', borderTop: `1px solid ${C.border}`, background: '#fff' }}>
        <div style={{ maxWidth: '1040px', margin: '0 auto' }}>
          <p style={eyebrow}>Research Framework</p>
          <h2 style={h2Style}>AIFFD 的研究框架</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '40px' }}>
            {FRAMEWORK_CARDS.map(card => (
              <div key={card.titleEn} style={{ border: `1px solid ${C.border}`, borderRadius: '8px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: card.dot }} />
                <div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '19px', color: C.h1, margin: '0 0 2px' }}>{card.title}</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, letterSpacing: '1px', margin: 0 }}>{card.titleEn}</p>
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body, lineHeight: 1.8, margin: 0, flex: 1 }}>{card.body}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.gold, margin: 0 }}>{card.caption}</p>
                <ExternalLink href={RESEARCH_JOURNAL_URL} style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.body, textDecoration: 'none', borderTop: `1px solid ${C.border}`, paddingTop: '14px' }}>
                  {card.titleEn === 'Preference & Feedback' ? '阅读研究日志 ↗' : '了解相关研究 ↗'}
                </ExternalLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 第四屏 · AIFFD × OhSammi ── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', borderTop: `1px solid ${C.border}` }}>
        <div style={{ padding: '96px 48px', background: C.bg }}>
          <p style={eyebrow}>Product × Research</p>
          <h2 style={{ ...h2Style, fontSize: '28px' }}>AIFFD</h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, letterSpacing: '1px', margin: '-12px 0 24px' }}>
            正在运行和验证中的产品与研究原型
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['用户测试', 'Style Profile 建立', 'AI 风格判断', '真实使用反馈', '商业与产品验证'].map(t => (
              <li key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: C.gold, display: 'inline-block' }} />
                {t}
              </li>
            ))}
          </ul>
          <Link to={AIFFD_ENTRY_PATH} style={btnGold}>体验 AIFFD →</Link>
        </div>

        <div style={{ padding: '96px 48px', background: C.dark }}>
          <p style={{ ...eyebrow, color: '#d9c68a' }}>Product × Research</p>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#fff', margin: '0 0 20px' }}>
            OhSammi Research
          </h2>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.darkMuted, letterSpacing: '1px', margin: '-12px 0 24px' }}>
            创始人英文研究网站
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {['研究问题', '方法形成过程', 'AIFFD 系统迭代', '设计决策', 'AI 推荐、女性身份、信任与用户自主性相关研究'].map(t => (
              <li key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#d8d3c8', display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d9c68a', display: 'inline-block' }} />
                {t}
              </li>
            ))}
          </ul>
          <ExternalLink href={RESEARCH_JOURNAL_URL} style={btnGhostDark}>进入 Founder Research Journal ↗</ExternalLink>
        </div>

        <div style={{ gridColumn: '1 / -1', padding: '28px 48px', borderTop: `1px solid ${C.border}`, background: C.bg, textAlign: 'center' as const }}>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '15px', color: C.h1, margin: '0 0 4px' }}>
            AIFFD 是正在运行的系统；OhSammi Research 记录这个系统背后的研究过程。
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, margin: 0 }}>
            AIFFD is the working system. OhSammi Research documents the thinking, methodology and ongoing development behind it.
          </p>
        </div>
      </section>

      {/* ── 第五屏 · Closing CTA ── */}
      <section style={{ padding: '110px 32px 60px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' as const }}>
          <p style={eyebrow}>Build Your Profile. Shape The System.</p>
          <h2 style={{ ...h2Style, textAlign: 'center' as const }}>建立你的个人风格档案</h2>
          <p style={{ ...bodyStyle, margin: '0 auto 12px', textAlign: 'center' as const }}>
            AIFFD 不把个人风格视为一个固定答案。
          </p>
          <p style={{ ...bodyStyle, margin: '0 auto 36px', textAlign: 'center' as const }}>
            随着测试结果、个人偏好、穿搭反馈与未来的周期性校准不断增加，你的个人风格档案也可以持续更新。
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' as const, marginBottom: '48px' }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.h1, border: `1px solid ${C.gold}`, borderRadius: '999px', padding: '5px 14px' }}>
              Style Profile V1.0
            </span>
            <span style={{ fontFamily: 'Georgia, serif', color: C.muted }}>→</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>V1.1</span>
            <span style={{ fontFamily: 'Georgia, serif', color: C.muted }}>→</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>V1.2</span>
            <span style={{ fontFamily: 'Georgia, serif', color: C.muted }}>→</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted }}>V2.0…</span>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' as const, marginBottom: '64px' }}>
            <Link to={AIFFD_ENTRY_PATH} style={btnGold}>开始建立我的 Style Profile</Link>
            <ExternalLink href={RESEARCH_JOURNAL_URL} style={btnGhost}>阅读研究日志 ↗</ExternalLink>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '24px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '2px', color: C.muted, margin: '0 0 8px' }}>RESEARCH NOTE</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, lineHeight: 1.8, margin: 0 }}>
              AIFFD 目前处于持续开发与真实产品验证阶段，其方法用于个人风格探索与穿衣决策辅助，并非医疗、心理或临床诊断工具。
              更详细的研究方法与项目迭代记录，请访问 OhSammi Research。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
