import { useState, useEffect, useMemo } from 'react'
import Footer from '../components/Footer'

const ALL_TAGS = ['全部', '穿衣哲学', '色彩', '购物决策', '40+', '体型', '极简']
const PAGE_SIZE = 6

const AUTHOR_COLORS: Record<string, string> = {
  'Sammi': '#C8B8A8',
  'Lin Wei': '#D4C8B8',
  'Mia Zhang': '#DDD0C0',
  'AIFFD': '#B8973A',
}

interface Article {
  id: string
  title: string
  excerpt: string
  author: string
  tag: string
  date: string
  readTime: string
  link: string
  featured: boolean
  coverColor: string
}

function ImgPlaceholder({ bg, minH = '180px', height = '100%', zoomed = false }: {
  bg: string; minH?: string; height?: string; zoomed?: boolean
}) {
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

function TagBadge({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <span onClick={onClick} style={{
      fontFamily: 'Inter, sans-serif', fontSize: '11px', padding: '4px 12px',
      border: active ? '0.5px solid #B8973A' : '0.5px solid #e8e8e4',
      color: active ? '#B8973A' : '#999999', borderRadius: '20px', display: 'inline-block',
      cursor: onClick ? 'pointer' : 'default',
      background: active ? 'rgba(184,151,58,0.06)' : 'transparent',
      transition: 'all 0.2s', userSelect: 'none', whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function Avatar({ initials, size = 28, bg = '#DDD6CC' }: { initials: string; size?: number; bg?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: 'Georgia, serif', fontSize: size * 0.38, color: 'rgba(0,0,0,0.35)', fontStyle: 'italic' }}>{initials}</span>
    </div>
  )
}

function HoverCard({ href, style, children }: {
  href: string; style?: React.CSSProperties; children: (hovered: boolean) => React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: 'none', display: 'block', position: 'relative', zIndex: hovered ? 2 : 0,
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.10)' : '0 0 0 rgba(0,0,0,0)',
        ...style,
      }}>
      {children(hovered)}
    </a>
  )
}

function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#e8e8e4' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: '#fafaf8' }}>
          <div style={{ height: '180px', background: '#f0ece6', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ padding: '18px 20px 22px' }}>
            <div style={{ height: '12px', width: '60px', background: '#f0ece6', borderRadius: '10px', marginBottom: '16px' }} />
            <div style={{ height: '16px', background: '#f0ece6', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ height: '16px', width: '70%', background: '#f0ece6', borderRadius: '4px', marginBottom: '16px' }} />
            <div style={{ height: '12px', width: '40%', background: '#f0ece6', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function authorInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(d: string) {
  return d ? d.replace(/-/g, '.').slice(0, 10) : ''
}

export default function ColumnPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTag, setActiveTag] = useState('全部')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch('/.netlify/functions/articles')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => { setArticles(data); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  const featuredMain = articles.find(a => a.featured)
  const featuredSide = articles.filter(a => a.featured).slice(1, 3)

  const filtered = useMemo(() => articles.filter(a => {
    const tagMatch = activeTag === '全部' || a.tag === activeTag
    const searchMatch = !search || a.title.includes(search) || a.excerpt.includes(search) || a.author.includes(search) || a.tag.includes(search)
    return tagMatch && searchMatch
  }), [articles, activeTag, search])

  const shown = filtered.slice(0, page * PAGE_SIZE)

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh' }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @media(max-width:768px){
          .col-hero{grid-template-columns:1fr!important}
          .col-authors{grid-template-columns:1fr!important}
          .col-articles{grid-template-columns:1fr!important}
          .col-wrap{padding:40px 20px 72px!important}
        }
        @media(max-width:480px){
          .col-tags{flex-wrap:wrap!important}
          .col-side{grid-template-columns:1fr!important}
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

        {/* 本期推荐 */}
        {!loading && featuredMain && (
          <>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', marginBottom: '24px' }}>本期推荐</p>
            <div className="col-hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#e8e8e4', marginBottom: '64px' }}>
              <HoverCard href={featuredMain.link} style={{ background: '#fafaf8' }}>
                {(hov) => (<>
                  <ImgPlaceholder bg={featuredMain.coverColor} minH="320px" height="320px" zoomed={hov} />
                  <div style={{ padding: '28px' }}>
                    <div style={{ marginBottom: '16px' }}><TagBadge label={featuredMain.tag} /></div>
                    <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 400, color: hov ? '#B8973A' : '#111', marginBottom: '12px', lineHeight: 1.4, transition: 'color 0.25s' }}>{featuredMain.title}</h2>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: '#444', lineHeight: '1.85', marginBottom: '20px' }}>{featuredMain.excerpt}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar initials={authorInitials(featuredMain.author)} bg={AUTHOR_COLORS[featuredMain.author] ?? '#D4C8B8'} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#666' }}>{featuredMain.author}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {formatDate(featuredMain.date)} · {featuredMain.readTime}
                        <span style={{ color: '#B8973A', opacity: hov ? 1 : 0, transform: hov ? 'translateX(0)' : 'translateX(-6px)', transition: 'opacity 0.25s, transform 0.25s' }}>→</span>
                      </span>
                    </div>
                  </div>
                </>)}
              </HoverCard>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#e8e8e4' }}>
                {featuredSide.map(s => (
                  <HoverCard key={s.id} href={s.link} style={{ background: '#fafaf8', flex: 1, display: 'grid', gridTemplateColumns: '160px 1fr' }}>
                    {(hov) => (<>
                      <ImgPlaceholder bg={s.coverColor} minH="160px" height="100%" zoomed={hov} />
                      <div style={{ padding: '20px' }}>
                        <div style={{ marginBottom: '10px' }}><TagBadge label={s.tag} /></div>
                        <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400, color: hov ? '#B8973A' : '#111', marginBottom: '8px', lineHeight: 1.4, transition: 'color 0.25s' }}>{s.title}</h3>
                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444', lineHeight: '1.7', marginBottom: '14px' }}>{s.excerpt}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar initials={authorInitials(s.author)} size={22} bg={AUTHOR_COLORS[s.author] ?? '#D4C8B8'} />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999' }}>{s.author} · {formatDate(s.date)}</span>
                          <span style={{ marginLeft: 'auto', color: '#B8973A', opacity: hov ? 1 : 0, transform: hov ? 'translateX(0)' : 'translateX(-6px)', transition: 'opacity 0.25s, transform 0.25s' }}>→</span>
                        </div>
                      </div>
                    </>)}
                  </HoverCard>
                ))}
              </div>
            </div>
            <div style={{ height: '1px', background: '#e8e8e4', marginBottom: '48px' }} />
          </>
        )}

        {/* 全部文章 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: '#B8973A', margin: 0 }}>全部文章</p>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="搜索文章..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#333', paddingLeft: '34px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px', border: '0.5px solid #e8e8e4', borderRadius: '20px', background: '#fff', outline: 'none', width: '180px', transition: 'border-color 0.2s' }}
              onFocus={e => (e.target.style.borderColor = '#B8973A')}
              onBlur={e => (e.target.style.borderColor = '#e8e8e4')} />
          </div>
        </div>

        <div className="col-tags" style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
          {ALL_TAGS.map(t => <TagBadge key={t} label={t} active={activeTag === t} onClick={() => { setActiveTag(t); setPage(1) }} />)}
        </div>

        {loading ? <Skeleton /> : error ? (
          <div style={{ textAlign: 'center', padding: '64px 0', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#999' }}>加载失败：{error}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#999' }}>没有找到相关文章</div>
        ) : (<>
          <div className="col-articles" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: '#e8e8e4' }}>
            {shown.map(a => (
              <HoverCard key={a.id} href={a.link} style={{ background: '#fafaf8' }}>
                {(hov) => (<>
                  <ImgPlaceholder bg={a.coverColor} minH="180px" height="180px" zoomed={hov} />
                  <div style={{ padding: '18px 20px 22px' }}>
                    <div style={{ marginBottom: '12px' }}><TagBadge label={a.tag} /></div>
                    <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', fontWeight: 400, color: hov ? '#B8973A' : '#111', marginBottom: '8px', lineHeight: 1.4, transition: 'color 0.25s' }}>{a.title}</h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#444', lineHeight: '1.75', marginBottom: '16px' }}>{a.excerpt}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar initials={authorInitials(a.author)} size={24} bg={AUTHOR_COLORS[a.author] ?? '#D4C8B8'} />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#999' }}>{a.author}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#999', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {formatDate(a.date)} · {a.readTime}
                        <span style={{ color: '#B8973A', opacity: hov ? 1 : 0, transform: hov ? 'translateX(0)' : 'translateX(-6px)', transition: 'opacity 0.25s, transform 0.25s' }}>→</span>
                      </span>
                    </div>
                  </div>
                </>)}
              </HoverCard>
            ))}
          </div>
          {shown.length < filtered.length && (
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <button onClick={() => setPage(p => p + 1)}
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: '#B8973A', background: 'transparent', border: '0.5px solid #B8973A', borderRadius: '24px', padding: '12px 36px', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#B8973A'; (e.target as HTMLButtonElement).style.color = '#fff' }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent'; (e.target as HTMLButtonElement).style.color = '#B8973A' }}>
                加载更多
              </button>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#bbb', marginTop: '12px' }}>已显示 {shown.length} / {filtered.length} 篇</p>
            </div>
          )}
        </>)}

      </div>
      <Footer />
    </div>
  )
}
