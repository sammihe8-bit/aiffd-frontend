import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const features = [
  { icon: '🎨', title: '色彩风格诊断', desc: '基于 AI 分析你的专属色彩季型，找到最适合你的颜色' },
  { icon: '👗', title: '穿搭智能建议', desc: '根据诊断结果，生成个性化穿搭方案与购物清单' },
  { icon: '✨', title: '任务解锁权益', desc: '完成每日任务，解锁更多高级诊断与专属内容' },
]

export default function HomePage() {
  const { token } = useAuth()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <section className="text-center py-16 space-y-6">
        <div className="inline-block bg-pink-100 text-pink-600 text-sm font-medium px-4 py-1.5 rounded-full">
          🌸 AI 驱动的女性色彩美学平台
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
          发现属于你的<br />
          <span className="text-pink-500">专属色彩密码</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          通过智能色彩诊断，找到最适合你肤色与气质的颜色搭配，让每天的穿搭都充满自信。
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          {token ? (
            <Link to="/diagnosis" className="btn-primary text-base px-8 py-3">
              开始诊断 →
            </Link>
          ) : (
            <>
              <Link to="/auth" className="btn-primary text-base px-8 py-3">
                免费开始 →
              </Link>
              <Link to="/auth" className="btn-secondary text-base px-8 py-3">
                已有账号，登录
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 py-8">
        {features.map((f) => (
          <div key={f.title} className="card hover:shadow-md transition-shadow text-center space-y-3">
            <div className="text-4xl">{f.icon}</div>
            <h3 className="font-semibold text-gray-800 text-lg">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {!token && (
        <section className="text-center py-12">
          <div className="card bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 space-y-4 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800">准备好了吗？</h2>
            <p className="text-gray-500">注册即可免费体验色彩诊断，发现你的专属美学风格。</p>
            <Link to="/auth" className="btn-primary inline-block px-10 py-3">
              立即注册 🌸
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
