import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const problems = [
  { num: '01', title: '我适合什么风格', desc: '体型、肤色、气质三维建档，AI 精准匹配你的专属风格关键词' },
  { num: '02', title: '这件商品值不值得买', desc: '上传商品图或链接，30秒获得购买前风险判断与建议' },
  { num: '03', title: '今天 / 本周怎么穿', desc: '基于你的风格档案，生成场景化穿搭方案与单品清单' },
  { num: '04', title: '复杂问题找专业造型师', desc: '遇到高价值购买或特殊场景，升级人工造型师一对一服务' },
]

const steps = [
  { step: 'STEP 01', title: '问卷初评', desc: '5步建立你的初始风格档案' },
  { step: 'STEP 02', title: 'AI 建档', desc: '生成 Style Profile 1.0' },
  { step: 'STEP 03', title: '持续反馈', desc: '上传穿搭与商品，系统不断学习' },
  { step: 'STEP 04', title: '定期更新', desc: '每季度档案升级，风格越来越准' },
]

const services = [
  { tag: 'AI', title: 'AI 造型师', desc: '即时回复，商品分析，每日穿搭建议', price: '免费起' },
  { tag: 'S1', title: '专业造型师', desc: '人工审核，月度报告，场景造型方案', price: '会员专享' },
  { tag: 'S2+', title: '高级造型师', desc: '专属顾问，季度档案升级，高价值购买支持', price: '高级会员' },
]

export default function HomePage() {
  const { token } = useAuth()

  return (
    <div className="bg-cream">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24">
        <div className="max-w-2xl">
          <p className="label-lux mb-8">购买前风格决策系统</p>
          <h1 className="text-[48px] leading-[1.2] font-normal mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            为 40+ 女性<br />
            建立长期<em className="text-gold not-italic">穿衣系统</em>
          </h1>
          <p className="text-[15px] text-[#555] leading-[1.9] mb-10 max-w-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
            不是一次性测试，而是一套持续进化的个人风格档案。
            AI 判断日常穿搭，复杂需求交给专业造型师。
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/onboarding" className="btn-primary">开始风格测试</Link>
            <Link to="/diagnosis" className="btn-outline">上传商品做分析</Link>
          </div>
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── PROBLEMS ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="label-lux mb-12">我们解决的问题</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-[#e8e8e4]">
          {problems.map((p, i) => (
            <div key={i} className={`p-8 ${i % 2 === 0 ? 'border-r border-[#e8e8e4]' : ''} ${i < 2 ? 'border-b border-[#e8e8e4]' : ''}`}>
              <p className="text-gold label-lux mb-4">{p.num}</p>
              <h3 className="text-[18px] font-normal mb-3" style={{ fontFamily: 'Georgia, serif' }}>{p.title}</h3>
              <p className="text-[13px] text-[#666] leading-[1.8]" style={{ fontFamily: 'Inter, sans-serif' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="label-lux mb-12">系统如何运作</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[#e8e8e4]">
          {steps.map((s, i) => (
            <div key={i} className={`p-8 ${i < 3 ? 'border-r border-[#e8e8e4]' : ''}`}>
              <p className="label-lux text-gold mb-4">{s.step}</p>
              <h3 className="text-[16px] font-normal mb-2" style={{ fontFamily: 'Georgia, serif' }}>{s.title}</h3>
              <p className="text-[12px] text-[#888] leading-[1.7]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── SERVICES ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="label-lux mb-12">服务分层</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className={`card-lux ${i === 1 ? 'border-[#B8973A]' : ''}`}>
              <div className="flex items-start justify-between mb-6">
                <span className="label-lux text-gold border border-[#B8973A] px-3 py-1">{s.tag}</span>
                <span className="text-[11px] text-[#888]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.price}</span>
              </div>
              <h3 className="text-[20px] font-normal mb-3" style={{ fontFamily: 'Georgia, serif' }}>{s.title}</h3>
              <p className="text-[13px] text-[#666] leading-[1.8]" style={{ fontFamily: 'Inter, sans-serif' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="divider-lux" />

      {/* ── CTA ── */}
      {!token && (
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="label-lux mb-6">立即开始</p>
          <h2 className="text-[36px] font-normal mb-6" style={{ fontFamily: 'Georgia, serif' }}>
            建立你的专属<em className="text-gold not-italic">风格档案</em>
          </h2>
          <p className="text-[14px] text-[#666] mb-10 max-w-md mx-auto leading-[1.8]" style={{ fontFamily: 'Inter, sans-serif' }}>
            5分钟完成初评，立即获得 Style Profile 1.0
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/onboarding" className="btn-primary">免费建立风格档案</Link>
            <Link to="/auth" className="btn-outline">查看会员方案</Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#e8e8e4] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '4px', color: '#888' }}>AIFFD © 2026</span>
          <span className="label-lux">智搭 · 购买前风格决策系统</span>
        </div>
      </footer>

    </div>
  )
}
