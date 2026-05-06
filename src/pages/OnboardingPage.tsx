import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BODY_TYPES = [
  {
    id: 'xiju',
    name: '戏剧型',
    img: '/xiju.png',
    keywords: ['高挑', '骨感', '线条分明'],
    desc: '身形挺拔，骨骼感强，线条硬朗利落',
  },
  {
    id: 'langman',
    name: '浪漫型',
    img: '/langman.png',
    keywords: ['曲线', '丰盈', '柔美'],
    desc: '曲线丰盈，身形圆润，女性气息浓郁',
  },
  {
    id: 'ziran',
    name: '自然型',
    img: '/ziran.png',
    keywords: ['匀称', '平衡', '自然'],
    desc: '比例匀称，不突出也不平淡，适应性强',
  },
  {
    id: 'lingqiao',
    name: '灵巧型',
    img: '/lingqiao.png',
    keywords: ['娇小', '精致', '轻盈'],
    desc: '小巧精致，骨架细小，整体轻盈感',
  },
  {
    id: 'jindain',
    name: '今黛型',
    img: '/jindain.png',
    keywords: ['纤细', '直线', '中性'],
    desc: '身形纤细修长，直线条，现代感强',
  },
]

const STYLE_CONCERNS = [
  '买了很多衣服但不知道怎么搭',
  '每次购物都后悔，买回来不穿',
  '不知道什么颜色适合自己',
  '场合着装总是拿不准',
  '体型有特点，普通搭配不适合',
  '风格在变化，旧衣服越来越难搭',
]

const STYLE_DIRECTIONS = [
  '经典优雅', '简约现代', '休闲自然',
  '浪漫女性', '知性干练', '时尚前卫',
  '复古格调', '运动活力',
]

const BUDGET_OPTIONS = [
  { label: '轻度消费', sub: '单件 500 元以内' },
  { label: '中度消费', sub: '单件 500–2000 元' },
  { label: '品质消费', sub: '单件 2000–5000 元' },
  { label: '高端消费', sub: '单件 5000 元以上' },
]

const SCENES = ['职场办公', '商务出行', '日常休闲', '社交聚会', '亲子活动', '旅行度假', '重要场合']

interface FormData {
  ageRange: string
  height: string
  weight: string
  scenes: string[]
  concerns: string[]
  bodyType: string
  skinTone: string
  hairColor: string
  styleDirections: string[]
  budget: string
}

const STEPS = ['基础信息', '体型判断', '色彩信息', '风格偏好', '专属档案']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    ageRange: '',
    height: '',
    weight: '',
    scenes: [],
    concerns: [],
    bodyType: '',
    skinTone: '',
    hairColor: '',
    styleDirections: [],
    budget: '',
  })

  const toggle = (field: 'scenes' | 'concerns' | 'styleDirections', val: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(val)
        ? prev[field].filter(v => v !== val)
        : [...prev[field], val],
    }))
  }

  const next = () => setStep(s => Math.min(s + 1, 4))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  const finish = () => {
    localStorage.setItem('aiffd_profile', JSON.stringify(form))
    navigate('/profile')
  }

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[12px] border transition-all cursor-pointer ${
        active
          ? 'border-[#B8973A] text-[#B8973A] bg-[#fdf8ee]'
          : 'border-[#e8e8e4] text-[#666] hover:border-[#999]'
      }`}
      style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '1px' }}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Progress */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-6 h-6 flex items-center justify-center text-[10px] border transition-all
                  ${i === step ? 'border-[#B8973A] text-[#B8973A]' : i < step ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#ddd] text-[#ccc]'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] tracking-[1.5px] hidden md:block ${i === step ? 'text-[#1a1a1a]' : 'text-[#bbb]'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}>
                  {s}
                </span>
                {i < 4 && <div className={`w-8 h-[0.5px] mx-2 ${i < step ? 'bg-[#1a1a1a]' : 'bg-[#e8e8e4]'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP 0: 基础信息 ── */}
        {step === 0 && (
          <div className="space-y-10">
            <div>
              <p className="label-lux mb-2">Step 01</p>
              <h2 className="text-[28px] font-normal" style={{ fontFamily: 'Georgia, serif' }}>基础信息</h2>
              <p className="text-[13px] text-[#888] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>帮助我们了解你的基本情况</p>
            </div>

            <div className="space-y-8">
              <div>
                <p className="label-lux mb-4">年龄段</p>
                <div className="flex flex-wrap gap-3">
                  {['30岁以下', '30–39岁', '40–49岁', '50–59岁', '60岁以上'].map(a => (
                    <Chip key={a} label={a} active={form.ageRange === a} onClick={() => setForm(f => ({ ...f, ageRange: a }))} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="label-lux mb-3">身高 (cm)</p>
                  <input className="input-lux" placeholder="例：165" value={form.height}
                    onChange={e => setForm(f => ({ ...f, height: e.target.value }))} />
                </div>
                <div>
                  <p className="label-lux mb-3">体重 (kg)</p>
                  <input className="input-lux" placeholder="例：55" value={form.weight}
                    onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
                </div>
              </div>

              <div>
                <p className="label-lux mb-4">常见生活场景（可多选）</p>
                <div className="flex flex-wrap gap-3">
                  {SCENES.map(s => (
                    <Chip key={s} label={s} active={form.scenes.includes(s)} onClick={() => toggle('scenes', s)} />
                  ))}
                </div>
              </div>

              <div>
                <p className="label-lux mb-4">当前最主要的穿衣困扰（可多选）</p>
                <div className="flex flex-wrap gap-3">
                  {STYLE_CONCERNS.map(c => (
                    <Chip key={c} label={c} active={form.concerns.includes(c)} onClick={() => toggle('concerns', c)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: 体型判断 ── */}
        {step === 1 && (
          <div className="space-y-10">
            <div>
              <p className="label-lux mb-2">Step 02</p>
              <h2 className="text-[28px] font-normal" style={{ fontFamily: 'Georgia, serif' }}>体型与比例判断</h2>
              <p className="text-[13px] text-[#888] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>选择最接近你身形特征的类型</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {BODY_TYPES.map(bt => (
                <button
                  key={bt.id}
                  onClick={() => setForm(f => ({ ...f, bodyType: bt.id }))}
                  className={`border p-3 text-left transition-all cursor-pointer ${
                    form.bodyType === bt.id ? 'border-[#B8973A]' : 'border-[#e8e8e4] hover:border-[#ccc]'
                  }`}
                >
                  <div className="aspect-[3/5] overflow-hidden mb-3 bg-[#f0ede8]">
                    <img src={bt.img} alt={bt.name}
                      className="w-full h-full object-cover object-top" />
                  </div>
                  <p className={`text-[12px] mb-1 ${form.bodyType === bt.id ? 'text-[#B8973A]' : 'text-[#1a1a1a]'}`}
                    style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '1px' }}>
                    {bt.name}
                  </p>
                  <p className="text-[10px] text-[#999] leading-[1.6]" style={{ fontFamily: 'Inter, sans-serif' }}>{bt.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bt.keywords.map(k => (
                      <span key={k} className="text-[9px] text-[#B8973A] border border-[#e8c97a] px-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}>{k}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: 色彩信息 ── */}
        {step === 2 && (
          <div className="space-y-10">
            <div>
              <p className="label-lux mb-2">Step 03</p>
              <h2 className="text-[28px] font-normal" style={{ fontFamily: 'Georgia, serif' }}>色彩与外貌信息</h2>
              <p className="text-[13px] text-[#888] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>帮助 AI 判断你的色彩季型</p>
            </div>

            <div className="space-y-8">
              <div>
                <p className="label-lux mb-4">肤色倾向</p>
                <div className="flex flex-wrap gap-3">
                  {['冷白皮', '自然黄', '小麦色', '偏深色', '混合型'].map(s => (
                    <Chip key={s} label={s} active={form.skinTone === s} onClick={() => setForm(f => ({ ...f, skinTone: s }))} />
                  ))}
                </div>
              </div>

              <div>
                <p className="label-lux mb-4">发色</p>
                <div className="flex flex-wrap gap-3">
                  {['纯黑', '深棕', '浅棕', '暖棕', '染色（冷色系）', '染色（暖色系）'].map(h => (
                    <Chip key={h} label={h} active={form.hairColor === h} onClick={() => setForm(f => ({ ...f, hairColor: h }))} />
                  ))}
                </div>
              </div>

              <div>
                <p className="label-lux mb-4">你觉得自己穿哪类颜色更好看？</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '暖色系', sub: '米、橙、棕、暖红、驼色' },
                    { label: '冷色系', sub: '宝蓝、冰粉、紫、灰蓝' },
                    { label: '中性色', sub: '黑、白、灰、深海军蓝' },
                    { label: '不确定', sub: '需要帮我判断' },
                  ].map(opt => (
                    <button key={opt.label}
                      onClick={() => setForm(f => ({ ...f, skinTone: f.skinTone + opt.label }))}
                      className={`border p-4 text-left transition-all cursor-pointer`}
                      style={{ borderColor: '#e8e8e4', fontFamily: 'Inter, sans-serif' }}>
                      <p className="text-[13px] text-[#1a1a1a] mb-1">{opt.label}</p>
                      <p className="text-[11px] text-[#999]">{opt.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: 风格偏好 ── */}
        {step === 3 && (
          <div className="space-y-10">
            <div>
              <p className="label-lux mb-2">Step 04</p>
              <h2 className="text-[28px] font-normal" style={{ fontFamily: 'Georgia, serif' }}>风格偏好与预算</h2>
              <p className="text-[13px] text-[#888] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>帮助系统为你匹配最合适的建议</p>
            </div>

            <div className="space-y-8">
              <div>
                <p className="label-lux mb-4">喜欢的风格方向（可多选）</p>
                <div className="flex flex-wrap gap-3">
                  {STYLE_DIRECTIONS.map(s => (
                    <Chip key={s} label={s} active={form.styleDirections.includes(s)} onClick={() => toggle('styleDirections', s)} />
                  ))}
                </div>
              </div>

              <div>
                <p className="label-lux mb-4">单件服装常用预算</p>
                <div className="grid grid-cols-2 gap-4">
                  {BUDGET_OPTIONS.map(b => (
                    <button key={b.label}
                      onClick={() => setForm(f => ({ ...f, budget: b.label }))}
                      className={`border p-4 text-left transition-all cursor-pointer ${
                        form.budget === b.label ? 'border-[#B8973A]' : 'border-[#e8e8e4] hover:border-[#ccc]'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}>
                      <p className={`text-[13px] mb-1 ${form.budget === b.label ? 'text-[#B8973A]' : 'text-[#1a1a1a]'}`}>{b.label}</p>
                      <p className="text-[11px] text-[#999]">{b.sub}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: 结果 ── */}
        {step === 4 && (
          <div className="space-y-10">
            <div>
              <p className="label-lux mb-2 text-gold">Style Profile 1.0</p>
              <h2 className="text-[32px] font-normal" style={{ fontFamily: 'Georgia, serif' }}>
                你的专属风格档案
              </h2>
              <p className="text-[13px] text-[#888] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                基于你的信息，AI 已生成初始风格档案
              </p>
            </div>

            {/* Profile Card */}
            <div className="border border-[#B8973A] p-8 space-y-6">
              <div className="flex items-start justify-between border-b border-[#e8e8e4] pb-6">
                <div>
                  <p className="label-lux mb-2">体型风格</p>
                  <p className="text-[22px] font-normal text-gold" style={{ fontFamily: 'Georgia, serif' }}>
                    {BODY_TYPES.find(b => b.id === form.bodyType)?.name || '待完善'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="label-lux mb-2">档案版本</p>
                  <p className="text-[13px] text-[#888]" style={{ fontFamily: 'Inter, sans-serif' }}>v1.0 · {new Date().toLocaleDateString('zh-CN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="label-lux mb-2">风格关键词</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.styleDirections.length > 0
                      ? form.styleDirections.map(s => (
                        <span key={s} className="text-[11px] border border-[#B8973A] text-gold px-3 py-1"
                          style={{ fontFamily: 'Inter, sans-serif' }}>{s}</span>
                      ))
                      : <span className="text-[12px] text-[#999]">请返回补充风格偏好</span>
                    }
                  </div>
                </div>
                <div>
                  <p className="label-lux mb-2">预算区间</p>
                  <p className="text-[14px] text-[#1a1a1a] mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {form.budget || '未填写'}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#e8e8e4] pt-6">
                <p className="label-lux mb-3">主要穿衣困扰</p>
                <div className="flex flex-wrap gap-2">
                  {form.concerns.length > 0
                    ? form.concerns.map(c => (
                      <span key={c} className="text-[11px] bg-[#f5f5f3] text-[#666] px-3 py-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}>{c}</span>
                    ))
                    : <span className="text-[12px] text-[#999]">未填写</span>
                  }
                </div>
              </div>

              <div className="border-t border-[#e8e8e4] pt-6 bg-[#fdf8ee] -mx-8 -mb-8 px-8 py-6">
                <p className="label-lux mb-3 text-gold">推荐下一步</p>
                <div className="space-y-2">
                  {['上传一套满意的穿搭，帮系统更精准了解你', '上传想购买的商品，获得 AI 购买建议', '开通会员，解锁造型师人工服务'].map((r, i) => (
                    <p key={i} className="text-[12px] text-[#666] flex gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="text-gold">→</span> {r}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#e8e8e4]">
          <button
            onClick={prev}
            className={`btn-outline py-2 px-6 ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            上一步
          </button>
          <span className="label-lux">{step + 1} / 5</span>
          {step < 4 ? (
            <button onClick={next} className="btn-primary py-2 px-6">下一步</button>
          ) : (
            <button onClick={finish} className="btn-primary py-2 px-8">进入我的档案</button>
          )}
        </div>

      </div>
    </div>
  )
}
