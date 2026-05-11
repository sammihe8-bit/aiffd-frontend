
const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#999999', gold: '#B8973A', border: '#e8e8e4',
  bg: '#fafaf8', cream: '#fafaf8',
}

const FEATURED = [
  {
    tag: '穿衣哲学', tag2: '40+',
    title: '四十岁以后，我不再为别人的眼光购买衣服',
    excerpt: '当我不再问“这件好看吗”，而开始问“这件是我吗”，我的衣橱才真正属于我自己。这不是决心，而是一种慢慢长出的自知。',
    author: 'Sammi', avatar: '/column-sammi.jpg', date: '2026.05.01', readTime: '6 分钟',
    img: '/column-featured.jpg', link: 'https://www.ohsammi.com',
  },
]

const SECONDARY = [
  {
    tag: '色彩',
    title: '你以为自己不适合颜色，其实只是不对的颜色',
    excerpt: '色彩季型不是限制，是找到属于你那个频段的鑰匙。',
    author: 'Lin Wei', avatar: '/column-linwei.jpg', date: '2026.04.20',
    img: '/column-color.jpg', link: 'https://www.ohsammi.com',
  },
  {
    tag: '体型',
    title: '骨架才是衣橱的地基，其他都是装修',
    excerpt: '学会看骨骼，你就会明白为什么同一件衣服差别这么大。',
    author: 'AIFFD', avatar: '/column-aiffd.jpg', date: '2026.04.15',
    img: '/column-body.jpg', link: 'https://www.ohsammi.com',
  },
]

const AUTHORS = [
  {
    name: 'Sammi', site: 'ohsammi.com', siteUrl: 'https://www.ohsammi.com',
    tags: '穿衣哲学 · 生活方式',
    bio: '写40+女性的自我认知与衣橱关系，文字克制而有力。',
    photo: '/author-sammi.jpg',
  },
  {
    name: 'Lin Wei', site: '即将入驻', siteUrl: null,
    tags: '色彩 · 搭配理论',
    bio: '前时尚编辑，深度研究色彩季型系统十年，现任独立顾问。',
    photo: '/author-linwei.jpg',
  },
  {
    name: 'Mia Zhang', site: '即将入驻', siteUrl: null,
    tags: '极简主义 · 胶囊衣橱',
    bio: '帮助女性建立属于自己的10件核心单品，相信少即是多。',
    photo: '/author-mia.jpg',
  },
]

const ARTICLES = [
  {
    tag: '穿衣哲学',
    title: '断舍离之后，我的衣橱反而变得更贵了',
    excerpt: '减少才能看见真正想要的。一次清空，让我终于明白自己的风格。',
    author: 'Sammi', avatar: '/author-sammi.jpg', date: '2026.04.08', readTime: '4 分钟',
    img: '/article-1.jpg', link: 'https://www.ohsammi.com',
  },
  {
    tag: '色彩',
    title: '秋冬色彩指南：找到你的暖棕调',
    excerpt: '不是每个人都适合黑色。暖棕调可能才是你的本命配色。',
    author: 'Lin Wei', avatar: '/author-linwei.jpg', date: '2026.03.25', readTime: '5 分钟',
    img: '/article-2.jpg', link: 'https://www.ohsammi.com',
  },
  {
    tag: '购物决策',
    title: '买衣服前，我开始问自己这三个问题',
    excerpt: '这三个问题让我的冲动消费减少了80%，也让每件新衣都物尽其用。',
    author: 'Mia Zhang', avatar: '/author-mia.jpg', date: '2026.03.10', readTime: '4 分钟',
    img: '/article-3.jpg', link: 'https://www.ohsammi.com',
  },
  {
    tag: '40+',
    title: '职场转型期，我如何重建自己的穿衣语言',
    excerpt: '身份变了，衣橱也要跟着变。不是招贴，而是重新认识自己。',
    author: 'Sammi', avatar: '/author-sammi.jpg', date: '2026.03.01', readTime: '6 分钟',
    img: '/article-4.jpg', link: 'https://www.ohsammi.com',
  },
  {
    tag: '体型',
    title: 'H型骨架的人，为什么总觉得穿什么都不好看',
    excerpt: '问题不在身材，在于你还没找到属于 H 型骨架的建筑逻辑。',
    author: 'AIFFD', avatar: '/column-aiffd.jpg', date: '2026.02.20', readTime: '3 分钟',
    img: '/article-5.jpg', link: 'https://www.ohsammi.com',
  },
  {
    tag: '极简',
    title: '一个衣橱里到底需要多少件衣服？',
    excerpt: '我的答案是：20件。而且这 20 件里有 10 件是基础款。',
    author: 'Mia Zhang', avatar: '/author-mia.jpg', date: '2026.02.10', readTime: '4 分钟',
    img: '/article-6.jpg', link: 'https://www.ohsammi.com',
  },
]

function ImgPlaceholder({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#EAE4DC', overflow: 'hidden', position: 'relative', ...style }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }} />
    </div>
  )
}

function Avatar({ src, size = 28 }: { src: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', background: '#DDD6CC', flexShrink: 0 }}>
      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

export default function ColumnPage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 64px 96px' }}>

        <div style={{ marginBottom: '48px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '12px' }}>COLUMN</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, marginBottom: '12px', lineHeight: 1.3 }}>专栏</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.8', maxWidth: '520px' }}>关于穿衣这件事 — 我们邀请真实的她们，写下与衣橱的私人关系。</p>
        </div>

        <div style={{ height: '1px', background: C.border, marginBottom: '48px' }} />

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '24px' }}>本期推荐</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: C.border, marginBottom: '64px' }}>
          {FEATURED.map(f => (
            <a key={f.title} href={f.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', background: C.cream }}>
              <ImgPlaceholder src={f.img} alt={f.title} style={{ height: '320px' }} />
              <div style={{ padding: '28px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  {[f.tag, f.tag2].filter(Boolean).map(t => (
                    <span key={t} style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', padding: '3px 10px', border: '0.5px solid ' + C.border, color: C.muted, borderRadius: '20px' }}>{t}</span>
                  ))}
                </div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: C.h1, marginBottom: '12px', lineHeight: 1.4 }}>{f.title}</h2>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: C.sub, lineHeight: '1.85', marginBottom: '20px' }}>{f.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar src={f.avatar} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.body }}>{f.author}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, marginLeft: 'auto' }}>{f.date} · {f.readTime}</span>
                </div>
              </div>
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: C.border }}>
            {SECONDARY.map(s => (
              <a key={s.title} href={s.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '140px 1fr', background: C.cream, flex: 1 }}>
                <ImgPlaceholder src={s.img} alt={s.title} style={{ height: '100%', minHeight: '160px' }} />
                <div style={{ padding: '20px' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', padding: '3px 10px', border: '0.5px solid ' + C.border, color: C.muted, borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>{s.tag}</span>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400, color: C.h1, marginBottom: '8px', lineHeight: 1.4 }}>{s.title}</h3>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, lineHeight: '1.7', marginBottom: '14px' }}>{s.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar src={s.avatar} size={22} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>{s.author} · {s.date}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: C.border, marginBottom: '48px' }} />

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '24px' }}>推荐作者</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: C.border, marginBottom: '64px' }}>
          {AUTHORS.map(a => (
            <div key={a.name} style={{ background: C.cream, padding: '28px 24px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', background: '#DDD6CC', marginBottom: '16px' }}>
                <img src={a.photo} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: 400, color: C.h1, marginBottom: '4px' }}>{a.name}</p>
              {a.siteUrl ? (
                <a href={a.siteUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.gold, letterSpacing: '1px', display: 'block', marginBottom: '12px', textDecoration: 'none' }}>{a.site} ↗</a>
              ) : (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted, letterSpacing: '1px', marginBottom: '12px' }}>{a.site}</p>
              )}
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '2px', color: C.gold, marginBottom: '10px' }}>{a.tags}</p>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.body, lineHeight: '1.75' }}>{a.bio}</p>
            </div>
          ))}
        </div>

        <div style={{ height: '1px', background: C.border, marginBottom: '48px' }} />

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.gold, marginBottom: '24px' }}>全部文章</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: C.border }}>
          {ARTICLES.map(a => (
            <a key={a.title} href={a.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', background: C.cream }}>
              <ImgPlaceholder src={a.img} alt={a.title} style={{ height: '180px' }} />
              <div style={{ padding: '18px 20px 22px' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', padding: '3px 10px', border: '0.5px solid ' + C.border, color: C.muted, borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>{a.tag}</span>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400, color: C.h1, marginBottom: '8px', lineHeight: 1.4 }}>{a.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.sub, lineHeight: '1.75', marginBottom: '16px' }}>{a.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar src={a.avatar} size={24} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: C.muted }}>{a.author}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: C.muted, marginLeft: 'auto' }}>{a.date} · {a.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  )
}
