// 顶部三段式进度条：形 / 色 / 意
// 参考 AIFFD 产品架构文档 3.3 节："顶部固定显示三段式进度：形/色/意；
// 已完成段、当前段和未开始段视觉区分。当前段显示小阶段名称、当前题号与剩余题数。"
//
// 这是纯展示组件，不管数据从哪来——每个测试页自己算好 formDone/colorDone/preferenceDone
// （比如"styleResult 是否存在"）和当前所在的小阶段信息，传进来就行。

const STAGES: { key: StageKey; label: string }[] = [
  { key: 'form', label: '形' },
  { key: 'color', label: '色' },
  { key: 'preference', label: '意' },
]

export type StageKey = 'form' | 'color' | 'preference'

interface ThreeStageProgressProps {
  activeStage: StageKey
  formDone: boolean
  colorDone: boolean
  preferenceDone: boolean
  // 当前小阶段信息，比如「五官特征」「6 / 12」；不传就只显示三段条本身，不显示细节文字
  currentLabel?: string
  currentNum?: number
  currentTotal?: number
}

export default function ThreeStageProgress(props: ThreeStageProgressProps) {
  const { activeStage, currentLabel, currentNum, currentTotal } = props
  const isDone = (key: StageKey): boolean => {
    if (key === 'form') return props.formDone
    if (key === 'color') return props.colorDone
    return props.preferenceDone
  }

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d8', padding: '14px 24px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: currentLabel ? '8px' : 0 }}>
          {STAGES.map((stage, i) => {
            const done = isDone(stage.key)
            const isCurrent = stage.key === activeStage
            const color = done ? '#B8973A' : isCurrent ? '#B8973A' : '#e8e2d8'
            const textColor = done || isCurrent ? '#B8973A' : '#bbb'
            return (
              <div key={stage.key} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? color : '#fff',
                    border: `1.5px solid ${color}`,
                  }}>
                    {done && <span style={{ color: '#fff', fontSize: '10px', lineHeight: 1 }}>✓</span>}
                    {!done && isCurrent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '1px', color: textColor, fontWeight: isCurrent ? 600 : 400 }}>
                    {stage.label}
                  </span>
                </div>
                {i < STAGES.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: done ? color : '#e8e2d8' }} />
                )}
              </div>
            )
          })}
        </div>
        {currentLabel && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#999', margin: 0 }}>
            当前：{currentLabel}{currentNum != null && currentTotal != null ? ` · ${currentNum} / ${currentTotal}` : ''}
          </p>
        )}
      </div>
    </div>
  )
}
