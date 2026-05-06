import { Link } from 'react-router-dom'

interface Props {
  title: string
  description: string
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="text-center space-y-8 max-w-md">
        <div className="border border-[#e8e8e4] w-16 h-16 mx-auto flex items-center justify-center">
          <span className="text-[#B8973A] text-2xl">✦</span>
        </div>
        <div>
          <p className="label-lux mb-4">即将上线</p>
          <h1 className="text-[28px] font-normal mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            {title}
          </h1>
          <p className="text-[13px] text-[#888] leading-[1.8]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {description}
          </p>
        </div>
        <Link to="/" className="btn-outline inline-block">返回首页</Link>
      </div>
    </div>
  )
}
