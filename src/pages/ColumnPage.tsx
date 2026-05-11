import { useState, useMemo } from 'react'
import Footer from '../components/Footer'

const ALL_TAGS = ['全部', '穿衣哲学', '色彩', '购物决策', '40+', '体型', '极简']

const FEATURED = [
  {
    bg: '#E2D8CC', tag: '穿衣哲学', extraTag: '40+',
    title: '四十岁以后，我不再为别人的眼光购买衣服',
    excerpt: '当我不再问"这件好看吗"，而开始问"这件是我吗"，我的衣橱才真正属于我自己。',
    author: 'Sammi', initials: 'S', authorBg: '#C8B8A8', date: '2026.05.01', readTime: '6 分钟',
    link: 'https://www.ohsammi.com',
  },
]

const FEATURED_SIDE = [
  {
    bg: '#D4C8B8', tag: '色彩',
    title: '你以为自己不适合颜色，其实只是不对的颜色',
    excerpt: '色彩季型不是限制，是找到属于你那个频段的钥匙。',
    author: 'Lin Wei', initials: 'LW', date: '2026.04.20', link: 'https://www.ohsammi.com',
  },
  {
    bg: '#C8B8A8', tag: '体型',
    title: '骨架才是衣橱的地基，其他都是装修',
    excerpt: '学会看骨骼，你就会明白为什么同一件衣服差别这么大。',
    author: 'AIFFD', initials: 'AI', date: '2026.04.15', link: 'https://www.ohsammi.com',
  },
]

const ARTICLES = [
  { tag: '穿衣哲学', title: '断舍离之后，我的衣橱反而变得更贵了', excerpt: '减少才能看见真正想要的。一次清空，让我终于明白自己的风格。', author: 'Sammi', initials: 'S', date: '2026.04.08', readTime: '4 分钟', link: 'https://www.ohsammi.com', bg: '#E8E0D5' },
  { tag: '色彩', title: '秋冬色彩指南：找到你的暖棕调', excerpt: '不是每个人都适合黑色。暖棕调可能才是你的本命配色。', author: 'Lin Wei', initials: 'LW', date: '2026.03.25', readTime: '5 分钟', link: 'https://www.ohsammi.com', bg: '#D4C8B8' },
  { tag: '购物决策', title: '买衣服前，我开始问自己这三个问题', excerpt: '这三个问题让我的冲动消费减少了80%，也让每件新衣都物尽其用。', author: 'Mia Zhang', initials: 'MZ', date: '2026.03.10', readTime: '4 分钟', link: 'https://www.ohsammi.com', bg: '#C8B8A8' },
  { tag: '40+', title: '职场转型期，我如何重建自己的穿衣语言', excerpt: '身份变了，衣橱也要跟着变。不是招贴，而是重新认识自己。', author: 'Sammi', initials: 'S', date: '2026.03.01', readTime: '6 分钟', link: 'https://www.ohsammi.com', bg: '#DDD0C0' },
  { tag: '体型', title: 'H型骨架的人，为什么总觉得穿什么都不好看', excerpt: '问题不在身材，在于你还没找到属于H型骨架的建筑逻辑。', author: 'AIFFD', initials: 'AI', date: '2026.02.20', readTime: '3 分钟', link: 'https://www.ohsammi.com', bg: '#E4D8C8' },
  { tag: '极简', title: '一个衣橱里到底需要多少件衣服？', excerpt: '我的答案是：20件。而且这20件里有10件是基础款。', author: 'Mia Zhang', initials: 'MZ', date: '2026.02.10', readTime: '4 分钟', link: 'https://www.ohsammi.com', bg: '#D8CCB8' },
  { tag: '色彩', title: '冷暖色调的边界在哪里？', excerpt: '很多人以为自己是冷调，其实只是从没遇见对的暖色。', author: 'Lin Wei', initials: 'LW', date: '2026.01.28', readTime: '5 分钟', link: 'https://www.ohsammi.com', bg: '#D0C4B4' },
  { tag: '穿衣哲学', title: '为什么你的衣橱总是"没衣服穿"', excerpt: '不是数量不够，是你的衣橱缺少一个核心逻辑。', author: 'AIFFD', initials: 'AI', date: '2026.01.15', readTime: '4 分钟', link: 'https://www.ohsammi.com', bg: '#E0D4C4' },
  { tag: '购物决策', title: '贵价单品真的值得买吗？', excerpt: '答案不是贵不贵，而是这件单品在你的衣橱里能出现多少次。', author: 'Mia Zhang', initials: 'MZ', date: '2026.01.05', readTime: '3 分钟', link: 'https://www.ohsammi.com', bg: '#CCC0B0' },
]

const PAGE_SIZE = 6

// ─── 子组件 ───────────────────────────────────────────────────

function ImgPlaceholder({ bg, minH = '180px', height = '100%', zoomed = false }: { bg: string; minH?: string; height?: string; zoomed?: boolean }) {
  return (
    <div style={{ overflow: 'hidden', width: '100%', height, minHeight: minH, flexShrink: 0 }}>
      <div style={{
        background: bg, width: '100%', height: '100%', minHeight: minH,
        transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: zoomed ? 'scale(1.06)' : 'scale(1)',
      }} />
    </div>
  )
}

function Tag({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontFamily: 'Inter, sans-serif', fontSize: '11px',
        padding: '4px 12px',
        border: active ? '0.5px solid #B8973A' : '0.5px solid #e8e8e4',
        color: active ? '#B8973A' : '#999999',
        borderRadius: '20px', display: 'inline-block',
        cursor: onClick ? 'pointer' : 'default',
        background: active ? 'rgba(184,151,58,0.06)' : 'transparent',
        transition: 'all 0.2s',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
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

// HoverCard：将 hovered 通过 render prop 传给子组件
function HoverCard({
  href, style, children,
}: {
  href: string
  style?: React.CSSProperties
  children: (hovered: boolean) => React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none', display: 'block',
        position: 'relative', zIndex: hovered ? 2 : 0,
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.10)' : '0 0 0 rgba(0,0,0,0)',
        ...style,
      }}
    >
      {children(hovered)}
    </a>
  )
}

// ─── 主组件 ───────────────────────────────────────────────────

export default function ColumnPage() {
  const [activeTag, setActiveTag] = useState('全部')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return ARTICLES.filter(a => {
      const tagMatch = activeTag === '全部' || a.tag === activeTag
      const searchMatch = search === '' ||
        a.title.includes(search) ||
        a.excerpt.includes(search) ||
        a.author.includes(search) ||
        a.tag.includes(search)
      return tagMatch && searchMatch
    })
  }, [activeTag, search])

  const shown = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = shown.length < filtered.length

  function handleTag(tag: string) {
    setActiveTag(tag)
    setPage(1)
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 768px) {
          .col-hero-grid { grid-template-columns: 1fr !important; }
          .col-side-card { grid-template-columns: 120px 1fr !important; }
          .col-authors { grid-template-columns: 1fr !important; }
          .col-articles { grid-template-columns: 1fr !important; }
          .col-wrap { padding: 40px 20px 72px !important; }
          .col-hero-img { min-height: 220px !important; height: 220px !important; }
        }
        @media (max-width: 480px) {
          .col-tag-bar { flex-wrap: wrap !important; }
          .col-side-card { grid-template-columns: 1fr !important; }
          .col-side-img { min-height: 140px !important; height: 140px !important; width: 100% !important; }
        }
      `}</style>

      <div className="col-wrap" style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 64px 96px' }}>

        {/* 页头 */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', marginBottom: '12px' }}>COLUMN</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: '#111111', marginBottom: '12px', lineHeight: 1.3 }}>专栏</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: '#444444', lineHeight: '1.8', maxWidth: '520px' }}>关于穿衣这件事 — 我们邀请真实的她们，写下与衣橱的私人关系。</p>
        </div>

        <div style={{ height: '1px', background: '#e8e8e4', marginBottom: '40px' }} />

        {/* ── 本期推荐 ── */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', marginBottom: '24px' }}>本期推荐</p>
        <div className="col-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#e8e8e4', marginBottom: '64px' }}>

          {/* 主文章 */}
          <HoverCard href={FEATURED[0].link} style={{ background: '#fafaf8' }}>
            {(hovered) => (
              <>
                <ImgPlaceholder bg={FEATURED[0].bg} minH="320px" height="320px" zoomed={hovered} />
                <div style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <Tag label={FEATURED[0].tag} />
                    <Tag label={FEATURED[0].extraTag} />
                  </div>
                  <h2 style={{
                    fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400,
                    color: hovered ? '#B8973A' : '#111111',
                    marginBottom: '12px', lineHeight: 1.4,
                    transition: 'color 0.25s ease',
                  }}>
                    {FEATURED[0].title}
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#444444', lineHeight: '1.85', marginBottom: '20px' }}>
                    {FEATURED[0].excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar initials={FEATURED[0].initials} bg={FEATURED[0].authorBg} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#666666' }}>{FEATURED[0].author}</span>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999999',
                      marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      {FEATURED[0].date} · {FEATURED[0].readTime}
                      <span style={{
                        display: 'inline-block',
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
                        transition: 'opacity 0.25s ease, transform 0.25s ease',
                        color: '#B8973A',
                      }}>→</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </HoverCard>

          {/* 右侧两篇 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e8e8e4' }}>
            {FEATURED_SIDE.map(s => (
              <HoverCard key={s.title} href={s.link}
                style={{ background: '#fafaf8', flex: 1, display: 'grid', gridTemplateColumns: '160px 1fr' }}
              >
                {(hovered) => (
                  <>
                    <div className="col-side-img" style={{ minHeight: '160px', height: '100%', overflow: 'hidden' }}>
                      <ImgPlaceholder bg={s.bg} minH="160px" height="100%" zoomed={hovered} />
                    </div>
                    <div style={{ padding: '20px' }}>
                      <div style={{ marginBottom: '10px' }}><Tag label={s.tag} /></div>
                      <h3 style={{
                        fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400,
                        color: hovered ? '#B8973A' : '#111111',
                        marginBottom: '8px', lineHeight: 1.4,
                        transition: 'color 0.25s ease',
                      }}>{s.title}</h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444444', lineHeight: '1.7', marginBottom: '14px' }}>{s.excerpt}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar initials={s.initials} size={22} bg="#D4C8B8" />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999999' }}>{s.author} · {s.date}</span>
                        <span style={{
                          marginLeft: 'auto', color: '#B8973A', fontSize: '13px',
                          opacity: hovered ? 1 : 0,
                          transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
                          transition: 'opacity 0.25s ease, transform 0.25s ease',
                        }}>→</span>
                      </div>
                    </div>
                  </>
                )}
              </HoverCard>
            ))}
          </div>
        </div>

        <div style={{ height: '1px', background: '#e8e8e4', marginBottom: '48px' }} />

        {/* ── 推荐作者 ── */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', marginBottom: '24px' }}>推荐作者</p>
        <div className="col-authors" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#e8e8e4', marginBottom: '64px' }}>
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

        {/* ── 全部文章 ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', margin: 0 }}>全部文章</p>

          {/* 搜索框 */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="搜索文章..." value={search} onChange={handleSearch}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#333',
                paddingLeft: '34px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px',
                border: '0.5px solid #e8e8e4', borderRadius: '20px', background: '#fff',
                outline: 'none', width: '180px', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = '#B8973A')}
              onBlur={e => (e.target.style.borderColor = '#e8e8e4')}
            />
          </div>
        </div>

        {/* Tag 筛选栏 */}
        <div className="col-tag-bar" style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
          {ALL_TAGS.map(t => (
            <Tag key={t} label={t} active={activeTag === t} onClick={() => handleTag(t)} />
          ))}
        </div>

        {/* 文章网格 */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#999', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
            没有找到相关文章
          </div>
        ) : (
          <>
            <div className="col-articles" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#e8e8e4' }}>
              {shown.map(a => (
                <HoverCard key={a.title} href={a.link} style={{ background: '#fafaf8' }}>
                  {(hovered) => (
                    <>
                      <ImgPlaceholder bg={a.bg} minH="180px" height="180px" zoomed={hovered} />
                      <div style={{ padding: '18px 20px 22px' }}>
                        <div style={{ marginBottom: '12px' }}><Tag label={a.tag} /></div>
                        <h3 style={{
                          fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400,
                          color: hovered ? '#B8973A' : '#111111',
                          marginBottom: '8px', lineHeight: 1.4,
                          transition: 'color 0.25s ease',
                        }}>{a.title}</h3>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444444', lineHeight: '1.75', marginBottom: '16px' }}>{a.excerpt}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar initials={a.initials} size={24} bg="#D4C8B8" />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999999' }}>{a.author}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#999999', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {a.date} · {a.readTime}
                            <span style={{
                              color: '#B8973A',
                              opacity: hovered ? 1 : 0,
                              transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
                              transition: 'opacity 0.25s ease, transform 0.25s ease',
                            }}>→</span>
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </HoverCard>
              ))}
            </div>

            {/* 加载更多 */}
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <button
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px',
                    color: '#B8973A', background: 'transparent',
                    border: '0.5px solid #B8973A', borderRadius: '24px',
                    padding: '12px 36px', cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#B8973A'; (e.target as HTMLButtonElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent'; (e.target as HTMLButtonElement).style.color = '#B8973A' }}
                >
                  加载更多
                </button>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#bbb', marginTop: '12px' }}>
                  已显示 {shown.length} / {filtered.length} 篇
                </p>
              </div>
            )}

            {!hasMore && filtered.length > PAGE_SIZE && (
              <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#bbb', marginTop: '40px' }}>
                已加载全部 {filtered.length} 篇文章
              </p>
            )}
          </>
        )}

      </div>
      <Footer />
    </div>
  )
}
