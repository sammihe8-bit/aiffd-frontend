import { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'

// AIFFD 黑白灰品牌色；真实服装图片和色彩测试内容保留原色。
const C = {
  h1: '#111111', h2: '#222222', sub: '#444444',
  body: '#666666', muted: '#737373', border: '#E5E5E5',
  bg: '#FFFFFF', surface: '#F5F5F5', accent: '#111111',
  primary: '#111111', onPrimary: '#FFFFFF',
  inverseMuted: '#BDBDBD', inverseText: '#F5F5F5',
}

// 本季精选单品。img 对应 public/products/ 下的文件名，大小写必须完全一致。
// 不填 img（或图片加载失败）时，自动显示灰色占位块。
const ITEMS: { no: string; name: string; en: string; img?: string }[] = [
  { no: '01', name: '羽绒服',   en: 'Down Jacket',   img: '/products/02-downjacket.png' },
  { no: '02', name: '羊毛针织', en: 'Wool Sweater',  img: '/products/03-wool-sweater.png' },
  { no: '03', name: '连帽卫衣', en: 'Hoodie',        img: '/products/02-Hoodie.png' },
  { no: '04', name: '基础T恤',  en: 'Essential Tee', img: '/products/02-Tshirt.png' },
  { no: '05', name: '连衣裙',   en: 'Dress',         img: '/products/02-dress.png' },
  { no: '06', name: '半身裙',   en: 'Skirt',         img: '/products/02-skirt.png' },
  // 想换成球鞋，把上面任意一行替换为：
  // { no: '07', name: '运动鞋', en: 'Sneakers', img: '/products/02-sneaker.png' },
]

const PLACEHOLDER_COLORS = ['#F2F2F2','#E8E8E8','#DEDEDE','#EEEEEE','#E4E4E4','#D8D8D8']

function ProductImg({ color, no, label, img }: { color: string; no: string; label: string; img?: string }) {
  const [failed, setFailed] = useState(false)
  const showImg = img && !failed
  return (
    <div style={{ width: '100%', paddingBottom: '125%', position: 'relative', background: color, overflow: 'hidden' }}>
      {showImg ? (
        <img
          src={img}
          alt={label}
          loading='lazy'
          onError={() => setFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
        />
      ) : (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '3px', color: C.muted }}>NO. {no}</span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: C.body }}>{label}</span>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const border = C.border
  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
        <div style={{ padding: '0 32px 0 160px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: C.bg }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.accent, marginBottom: '28px' }}>NO. 01 — 春日 SS26</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '42px', fontWeight: 400, lineHeight: 1.2, color: C.h1, marginBottom: '20px' }}>
            为今天<br /><em style={{ color: C.accent, fontStyle: 'italic' }}>试一件。</em>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.9', maxWidth: '340px', marginBottom: '44px' }}>
            AIFFD智搭是一个为衣橱而生的 AI 工作室 — 虚拟试穿你已经拥有的、想象你尚未穿过的。
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: C.onPrimary, background: C.primary, padding: '14px 32px', textDecoration: 'none' }}>开始试衣</Link>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: C.sub, textDecoration: 'none' }}>了解AIFFD →</Link>
          </div>
        </div>
        {/* 背景图铺满右侧区域，保持比例并裁切超出部分。 */}
        <div
          role='img'
          aria-label='春日衣架'
          style={{
            position: 'relative', overflow: 'hidden', minHeight: '600px',
            alignSelf: 'stretch', width: '100%',
            backgroundColor: C.surface,
            backgroundImage: 'url(/hero-wardrobe.jpeg)',
            backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div style={{ position: 'absolute', bottom: '48px', right: '24px' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>春日 SS26</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginTop: '2px' }}>NO. 14</p>
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: border }} />

      <section style={{ padding: '80px 64px', background: C.surface }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.accent, marginBottom: '12px' }}>三件事</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, lineHeight: 1.3, color: C.h1 }}>
              拥有你的<em style={{ color: C.accent, fontStyle: 'italic' }}>风格系统。</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid ' + C.border }}>
            {[
              { num: '01', title: '虚拟试衣', en: 'FITTING ROOM', desc: '上传一张全身照，在屏幕里试穿你尚未拥有的每一件。光感、垂坠、剪裁，都被精准还原。' },
              { num: '02', title: '搭配方案', en: 'DAILY OUTFITS', desc: '为今日的天气、心情、场合提出一组方案。三件可能，而不是三十。我们相信选择越少，越自由。' },
              { num: '03', title: '衣橱', en: 'WARDROBE', desc: '将你的衣物收入数字衣橱。按色温、材质、季节自动归档。重新发现你已经拥有的。' },
            ].map((item, i) => (
              <div key={item.num} style={{ padding: '40px 36px', borderRight: i < 2 ? '1px solid ' + border : 'none' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.accent, marginBottom: '16px' }}>{item.num}</p>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: C.h2, marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '2px', color: C.muted, marginBottom: '16px' }}>{item.en}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: C.body, lineHeight: '1.8' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: '1px', background: border }} />

      <section style={{ padding: '80px 64px', background: C.bg }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.accent, marginBottom: '10px' }}>本季精选</p>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, lineHeight: 1.3 }}>当下的二十件</h2>
            </div>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: C.muted, textDecoration: 'none' }}>查看全部 →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '24px' }}>
            {ITEMS.map((item, i) => (
              <Link key={item.no} to='/onboarding' style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ marginBottom: '12px' }}>
                  <ProductImg color={PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]} no={item.no} label={item.name} img={item.img} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: C.h2 }}>{item.name}</span>
                  <span style={{ fontFamily: 'Georgia, serif', fontSize: '13px', fontStyle: 'italic', color: C.muted }}>{item.en}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: C.primary, padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '3px', color: C.inverseMuted, marginBottom: '32px' }}>— AIFFD · 主编手记</p>
          <blockquote style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, lineHeight: 1.5, color: C.inverseText, fontStyle: 'italic', margin: 0, maxWidth: '860px' }}>
            "我们不卖衣服。我们卖的是 — 在你按下购买前，先看见自己穿上它的那一刻。"
          </blockquote>
        </div>
      </section>

      <section style={{ background: C.surface, padding: '80px 64px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.accent, marginBottom: '16px' }}>我的风格系统</p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: 400, color: C.h1, lineHeight: 1.3, marginBottom: '16px' }}>先了解自己，<br />再购买任何一件。</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '17px', color: C.sub, lineHeight: '1.9', marginBottom: '32px' }}>
              体型 · 色彩 · 风格 · 时尚个性，四项测试构成你的专属风格档案，让每一次购买都成为精准决策。
            </p>
            <Link to='/onboarding' style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', letterSpacing: '2px', color: C.onPrimary, background: C.primary, padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }}>建立我的风格档案</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: border }}>
            {[
              { num: '01', label: '体型测试', sub: 'BODY' },
              { num: '02', label: '色彩测试', sub: 'COLOR' },
              { num: '03', label: '风格测试', sub: 'STYLE' },
              { num: '04', label: '时尚个性', sub: 'FASHION' },
            ].map(t => (
              <div key={t.num} style={{ background: C.surface, padding: '28px 24px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', letterSpacing: '4px', color: C.accent, marginBottom: '10px' }}>{t.num}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 400, color: C.h2, marginBottom: '4px' }}>{t.label}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '3px', color: C.muted }}>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

    </div>
  )
}
