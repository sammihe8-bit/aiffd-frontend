import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface StyleProfile {
  ageRange: string
  bodyType: string
  styleDirections: string[]
  budget: string
  concerns: string[]
  skinTone: string
  scenes: string[]
}

const BODY_TYPE_NAMES: Record<string, string> = {
  xiju: '戏剧型', langman: '浪漫型', ziran: '自然型',
  lingqiao: '灵巧型', jindain: '今黛型',
}

export default function ProfilePage() {
  const { user } = useAuth()
  const u = user as Record<string, unknown> | null
  const username = (u?.username ?? u?.email ?? '用户') as string

  const raw = localStorage.getItem('aiffd_profile')
  const profile: StyleProfile | null = raw ? JSON.parse(raw) : null

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between border-b border-[#e8e8e4] pb-8">
          <div>
            <p className="label-lux mb-3">个人风格档案</p>
            <h1 className="text-[32px] font-normal" style={{ fontFamily: 'Georgia, serif' }}>{username}</h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] border border-[#B8973A] text-gold px-3 py-1"
              style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '2px' }}>
              {profile ? 'STYLE PROFILE 1.0' : '档案未建立'}
            </span>
          </div>
        </div>

        {profile ? (
          <>
            {/* 核心数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[#e8e8e4]">
              {[
                { label: '体型风格', value: BODY_TYPE_NAMES[profile.bodyType] || '未填写' },
                { label: '肤色倾向', value: profile.skinTone || '未填写' },
                { label: '预算区间', value: profile.budget || '未填写' },
                { label: '年龄段', value: profile.ageRange || '未填写' },
              ].map((item, i) => (
                <div key={i} className={`p-6 ${i < 3 ? 'border-r border-[#e8e8e4]' : ''}`}>
                  <p className="label-lux mb-2">{item.label}</p>
                  <p className="text-[16px] font-normal text-gold" style={{ fontFamily: 'Georgia, serif' }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* 风格关键词 */}
            {profile.styleDirections?.length > 0 && (
              <div className="card-lux space-y-4">
                <p className="label-lux">风格关键词</p>
                <div className="flex flex-wrap gap-2">
                  {profile.styleDirections.map(s => (
                    <span key={s} className="border border-[#B8973A] text-gold px-4 py-1 text-[11px]"
                      style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '1px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 穿衣困扰 */}
            {profile.concerns?.length > 0 && (
              <div className="card-lux space-y-4">
                <p className="label-lux">主要穿衣困扰</p>
                <div className="flex flex-wrap gap-2">
                  {profile.concerns.map(c => (
                    <span key={c} className="bg-[#f5f5f3] text-[#666] px-4 py-1 text-[11px]"
                      style={{ fontFamily: 'Inter, sans-serif' }}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* 快捷入口 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { to: '/diagnosis', label: '商品分析', desc: '上传商品获得购买建议' },
                { to: '/onboarding', label: '更新档案', desc: '重新完成风格测试' },
                { to: '/diagnosis', label: '任务中心', desc: '完成任务解锁权益' },
              ].map(item => (
                <Link key={item.label} to={item.to}
                  className="card-lux hover:border-[#B8973A] transition-colors group">
                  <p className="text-[13px] font-normal mb-1 group-hover:text-gold transition-colors"
                    style={{ fontFamily: 'Georgia, serif' }}>{item.label}</p>
                  <p className="text-[11px] text-[#999]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.desc}</p>
                </Link>
              ))}
            </div>
          </>
        ) : (
          /* 未建档状态 */
          <div className="card-lux text-center py-16 space-y-6">
            <p className="text-[32px] font-normal text-[#e8e8e4]" style={{ fontFamily: 'Georgia, serif' }}>No Profile Yet</p>
            <p className="label-lux">你还没有建立风格档案</p>
            <p className="text-[13px] text-[#888] max-w-xs mx-auto leading-[1.8]" style={{ fontFamily: 'Inter, sans-serif' }}>
              完成 5 步初评，立即获得你的 Style Profile 1.0
            </p>
            <Link to="/onboarding" className="btn-primary inline-block">开始风格测试</Link>
          </div>
        )}
      </div>
    </div>
  )
}
