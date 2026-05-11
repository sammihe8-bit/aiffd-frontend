import Footer from '../components/Footer'

const ARTICLES = [
  { tag: '穿衣哲学', title: '断舍离之后，我的衣橱反而变得更贵了', excerpt: '减少才能看见真正想要的。一次清空，让我终于明白自己的风格。', author: 'Sammi', date: '2026.04.08', readTime: '4 分钟', link: 'https://www.ohsammi.com', bg: '#E8E0D5', pattern: 'wardrobe' },
  { tag: '色彩', title: '秋冬色彩指南：找到你的暖棕调', excerpt: '不是每个人都适合黑色。暖棕调可能才是你的本命配色。', author: 'Lin Wei', date: '2026.03.25', readTime: '5 分钟', link: 'https://www.ohsammi.com', bg: '#D4C8B8', pattern: 'color' },
  { tag: '购物决策', title: '买衣服前，我开始问自己这三个问题', excerpt: '这三个问题让我的冲动消费减少了80%，也让每件新衣都物尽其用。', author: 'Mia Zhang', date: '2026.03.10', readTime: '4 分钟', link: 'https://www.ohsammi.com', bg: '#C8B8A8', pattern: 'question' },
  { tag: '40+', title: '职场转型期，我如何重建自己的穿衣语言', excerpt: '身份变了，衣橱也要跟着变。不是招贴，而是重新认识自己。', author: 'Sammi', date: '2026.03.01', readTime: '6 分钟', link: 'https://www.ohsammi.com', bg: '#DDD0C0', pattern: 'style' },
  { tag: '体型', title: 'H型骨架的人，为什么总觉得穿什么都不好看', excerpt: '问题不在身材，在于你还没找到属于H型骨架的建筑逻辑。', author: 'AIFFD', date: '2026.02.20', readTime: '3 分钟', link: 'https://www.ohsammi.com', bg: '#E4D8C8', pattern: 'body' },
  { tag: '极简', title: '一个衣橱里到底需要多少件衣服？', excerpt: '我的答案是：20件。而且这20件里有10件是基础款。', author: 'Mia Zhang', date: '2026.02.10', readTime: '4 分钟', link: 'https://www.ohsammi.com', bg: '#D8CCB8', pattern: 'minimal' },
]

function ImgSVG({ bg, label, width = '100%', height = '100%', minH = '180px', initials = '' }: {
  bg: string; label: string; width?: string; height?: string; minH?: string; initials?: string
}) {
  return (
    <div style={{ background: bg, width, height, minHeight: minH, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {initials ? (
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: 'rgba(0,0,0,0.25)', fontStyle: 'italic' }}>{initials}</span>
      ) : (
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: 'rgba(0,0,0,0.2)', textTransform: 'uppercase' }}>{label}</span>
      )}
    </div>
  )
}

function Tag({ label }: { label: string }) {
  return (
    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', padding: '3px 10px', border: '0.5px solid #e8e8e4', color: '#999999', borderRadius: '20px', display: 'inline-block' }}>
      {label}
    </span>
  )
}

function Avatar({ initials, size = 28, bg = '#DDD6CC' }: { initials: string; size?: number; bg?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: size * 0.38, color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>{initials}</span>
    </div>
  )
}

export default function ColumnPage() {
  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 64px 96px' }}>

        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', marginBottom: '12px' }}>COLUMN</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: '#111111', marginBottom: '12px', lineHeight: 1.3 }}>专栏</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: '#444444', lineHeight: '1.8', maxWidth: '520px' }}>关于穿衣这件事 — 我们邀请真实的她们，写下与衣橱的私人关系。</p>
        </div>

        <div style={{ height: '1px', background: '#e8e8e4', marginBottom: '48px' }} />

        {/* 本期推荐 */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', marginBottom: '24px' }}>本期推荐</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#e8e8e4', marginBottom: '64px' }}>
          {/* 主文章 */}
          <a href="https://www.ohsammi.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', background: '#fafaf8' }}>
            <ImgSVG bg="#E2D8CC" label="Cover" minH="320px" height="320px" />
            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <Tag label="穿衣哲学" /><Tag label="40+" />
              </div>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: '#111111', marginBottom: '12px', lineHeight: 1.4 }}>四十岁以后，我不再为别人的眼光购买衣服</h2>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#444444', lineHeight: '1.85', marginBottom: '20px' }}>当我不再问"这件好看吗"，而开始问"这件是我吗"，我的衣橱才真正属于我自己。</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar initials="S" bg="#C8B8A8" />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#666666' }}>Sammi</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999999', marginLeft: 'auto' }}>2026.05.01 · 6 分钟</span>
              </div>
            </div>
          </a>
          {/* 右侧两篇 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e8e8e4' }}>
            {[
              { bg: '#D4C8B8', tag: '色彩', title: '你以为自己不适合颜色，其实只是不对的颜色', excerpt: '色彩季型不是限制，是找到属于你那个频段的钥匙。', author: 'Lin Wei', initials: 'LW', date: '2026.04.20' },
              { bg: '#C8B8A8', tag: '体型', title: '骨架才是衣橱的地基，其他都是装修', excerpt: '学会看骨骼，你就会明白为什么同一件衣服差别这么大。', author: 'AIFFD', initials: 'AI', date: '2026.04.15' },
            ].map(s => (
              <a key={s.title} href="https://www.ohsammi.com" target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '160px 1fr', background: '#fafaf8', flex: 1 }}>
                <ImgSVG bg={s.bg} label={s.tag} minH="160px" height="100%" />
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '10px' }}><Tag label={s.tag} /></div>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400, color: '#111111', marginBottom: '8px', lineHeight: 1.4 }}>{s.title}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444444', lineHeight: '1.7', marginBottom: '14px' }}>{s.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar initials={s.initials} size={22} bg="#D4C8B8" />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999999' }}>{s.author} · {s.date}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: '#e8e8e4', marginBottom: '48px' }} />

        {/* 推荐作者 */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', marginBottom: '24px' }}>推荐作者</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#e8e8e4', marginBottom: '64px' }}>
          {[
            { initials: 'S', bg: '#C8B8A8', name: 'Sammi', site: 'ohsammi.com', siteUrl: 'https://www.ohsammi.com', tags: '穿衣哲学 · 生活方式', bio: '写40+女性的自我认知与衣橱关系，文字克制而有力。' },
            { initials: 'LW', bg: '#D4C8B8', name: 'Lin Wei', site: '即将入驻', siteUrl: null, tags: '色彩 · 搭配理论', bio: '前时尚编辑，深度研究色彩季型系统十年，现任独立顾问。' },
            { initials: 'MZ', bg: '#DDD0C0', name: 'Mia Zhang', site: '即将入驻', siteUrl: null, tags: '极简主义 · 胶囊衣橱', bio: '帮助女性建立属于自己的10件核心单品，相信少即是多。' },
          ].map(a => (
            <div key={a.name} style={{ background: '#fafaf8', padding: '28px 24px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: a.bg, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: 'rgba(0,0,0,0.3)', fontStyle: 'italic' }}>{a.initials}</span>
              </div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, color: '#111111', marginBottom: '4px' }}>{a.name}</p>
              {a.siteUrl ? (
                <a href={a.siteUrl} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#B8973A', letterSpacing: '1px', display: 'block', marginBottom: '12px', textDecoration: 'none' }}>
                  {a.site} ↗
                </a>
              ) : (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999999', letterSpacing: '1px', marginBottom: '12px' }}>{a.site}</p>
              )}
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px', color: '#B8973A', marginBottom: '10px' }}>{a.tags}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#666666', lineHeight: '1.75' }}>{a.bio}</p>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', background: '#e8e8e4', marginBottom: '48px' }} />

        {/* 全部文章 */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', marginBottom: '24px' }}>全部文章</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#e8e8e4' }}>
          {ARTICLES.map(a => (
            <a key={a.title} href={a.link} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block', background: '#fafaf8' }}>
              <ImgSVG bg={a.bg} label={a.tag} minH="180px" height="180px" />
              <div style={{ padding: '18px 20px 22px' }}>
                <div style={{ marginBottom: '12px' }}><Tag label={a.tag} /></div>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400, color: '#111111', marginBottom: '8px', lineHeight: 1.4 }}>{a.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444444', lineHeight: '1.75', marginBottom: '16px' }}>{a.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar initials={a.author[0]} size={24} bg="#D4C8B8" />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999999' }}>{a.author}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#999999', marginLeft: 'auto' }}>{a.date} · {a.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  )
}
