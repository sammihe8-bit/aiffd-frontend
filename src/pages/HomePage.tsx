import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sparkles, Palette, ArrowRight, Star, Users, Award } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI 智能色彩诊断
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              发现你的
              <span className="text-primary-600">专属色彩</span>
              <br />
              绽放独特魅力
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              基于人工智能与色彩科学，精准分析你的肤色、气质与风格，
              <br className="hidden lg:block" />
              为你定制个性化的穿搭色彩方案
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link to="/diagnosis" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-3">
                  <Palette className="w-5 h-5" />
                  开始诊断
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link to="/auth" className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-3">
                  免费体验
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <Link to="/tasks" className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-3">
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心服务</h2>
            <p className="text-gray-600">四大维度，全方位打造你的个人风格</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Palette className="w-8 h-8" />,
                title: '色彩诊断',
                desc: 'AI分析肤色基调，匹配最适合你的色彩季型',
                color: 'bg-primary-100 text-primary-600',
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: '风格定位',
                desc: '精准定位你的穿搭风格，告别盲目跟风',
                color: 'bg-secondary-100 text-secondary-600',
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: '穿搭方案',
                desc: '根据场合与体型，生成专属搭配建议',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: '会员特权',
                desc: 'VIP用户享受专属造型师一对一服务',
                color: 'bg-purple-100 text-purple-600',
              },
            ].map((feature, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好发现全新的自己了吗？
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            加入 AIFFD 智搭，让科技为你的美丽加分
          </p>
          <Link 
            to={isAuthenticated ? "/diagnosis" : "/auth"}
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3 rounded-lg font-bold text-lg hover:bg-primary-50 transition-colors"
          >
            {isAuthenticated ? '立即诊断' : '免费注册'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
