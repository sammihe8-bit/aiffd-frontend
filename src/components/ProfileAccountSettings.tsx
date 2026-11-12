// 2026-11-12 新增：「我的档案」里的两块账号设置
//   · AgeRangePrompt：档案里还没有年龄段的老用户在这里补填（写入云端档案，来源 user_manual_edit）
//   · ConsentSettings：查看并修改两项可选授权（照片分析、研究数据）。每次修改在云端追加一条
//     source = profile_update 的同意记录，旧记录保留。撤回只影响之后：已保存的数据不删除，但不再用于对应用途。
import { useState } from 'react'
import type { AuthUser } from '../hooks/useAuth'
import { useConsentRecord, rememberConsent } from '../hooks/useConsentRecord'
import { consentAPI } from '../utils/api'
import { syncProfile } from '../utils/profileSync'
import { AGE_RANGES, CONSENT_POLICY_VERSION } from '../utils/consentConstants'

const C = { gold: '#B8973A', border: '#e8e8e4', muted: '#999999', h1: '#111111', body: '#555555', error: '#B5483A' }
const text = (size: number, color: string) => ({ fontFamily: 'Inter, sans-serif', fontSize: `${size}px`, color, lineHeight: 1.8, margin: 0 })

export function AgeRangePrompt({ user, onSaved }: { user: AuthUser | null; onSaved: (age: string) => void }) {
  const [saving, setSaving] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const choose = async (age: string) => {
    setSaving(age); setFailed(false)
    const ok = await syncProfile(user, '年龄段', { kind: 'patch', patch: { ageRange: age }, source: 'user_manual_edit', reason: '档案页补填年龄段' })
    setSaving(null)
    // 失败时 syncProfile 已提示并排队补发；这里仍按用户的选择显示，并说明会稍后保存
    if (!ok) setFailed(true)
    onSaved(age)
  }
  return (
    <div>
      <p style={{ ...text(13, C.body), marginBottom: '12px' }}>请补充你的年龄段，用于让推荐更贴合你。</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {AGE_RANGES.map(r => (
          <button key={r} disabled={!!saving} onClick={() => choose(r)} style={{
            padding: '8px 18px', border: `1px solid ${C.gold}`, background: saving === r ? C.gold : '#fff',
            color: saving === r ? '#fff' : C.gold, fontFamily: 'Inter, sans-serif', fontSize: '13px',
            borderRadius: '4px', cursor: saving ? 'default' : 'pointer',
          }}>{r === '55+' ? '55 岁及以上' : `${r} 岁`}</button>
        ))}
      </div>
      {failed && <p style={{ ...text(12, C.error), marginTop: '8px' }}>暂时没能保存到云端，网站会在你下次打开时自动重试。</p>}
    </div>
  )
}

type OptionalKey = 'photoConsent' | 'researchDataConsent'
const OPTIONS: { key: OptionalKey; title: string; desc: string; off: string }[] = [
  {
    key: 'photoConsent', title: '照片分析',
    desc: '允许上传和分析你的照片，用于辅助判断体型、五官和个人色彩。',
    off: '关闭后，测试中不再出现“AI 拍照识别”，你仍可以用文字和图片选项完成测试。',
  },
  {
    key: 'researchDataConsent', title: '研究与系统改进',
    desc: '允许把你的问卷答案、反馈和测试结果去标识化后，用于研究分析和改进测试方法。',
    off: '关闭后，你之后的数据不再用于研究；不影响测试结果和基本功能。',
  },
]

export function ConsentSettings({ user }: { user: AuthUser | null }) {
  const consent = useConsentRecord(user)
  const [saving, setSaving] = useState<OptionalKey | null>(null)
  const [error, setError] = useState('')

  if (consent.status !== 'found') {
    return <p style={text(13, C.muted)}>{consent.status === 'loading' ? '正在读取…' : '暂时无法读取你的授权设置，请稍后刷新页面。'}</p>
  }

  const toggle = async (key: OptionalKey) => {
    const next = { photoConsent: consent.photoConsent, researchDataConsent: consent.researchDataConsent, [key]: !consent[key] }
    setSaving(key); setError('')
    try {
      // 修改的前提是用户已同意过必选两项，所以这里两项必选固定为 true
      await consentAPI.save({
        ageAndResearchAck: true, privacyAck: true, ...next,
        policyVersion: CONSENT_POLICY_VERSION, source: 'profile_update',
      })
      rememberConsent(user, {
        ageAndResearchAck: true, privacyAck: true, ...next,
        policyVersion: CONSENT_POLICY_VERSION, timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error('[consent] 修改授权失败', err)
      setError('没能保存修改，请检查网络后再试一次。')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: C.border }}>
      {OPTIONS.map(o => {
        const on = consent[o.key]
        return (
          <div key={o.key} style={{ background: '#fff', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <p style={{ ...text(14, C.h1), marginBottom: '4px' }}>{o.title}<span style={{ color: on ? C.gold : C.muted, marginLeft: '10px', fontSize: '12px' }}>{on ? '已允许' : '未允许'}</span></p>
              <p style={text(12, C.body)}>{o.desc}</p>
              {on && <p style={text(12, C.muted)}>{o.off}</p>}
            </div>
            <button onClick={() => toggle(o.key)} disabled={!!saving} style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: '4px', fontFamily: 'Inter, sans-serif', fontSize: '12px',
              border: `1px solid ${on ? C.border : C.gold}`, background: on ? '#fff' : C.gold, color: on ? C.body : '#fff',
              cursor: saving ? 'default' : 'pointer',
            }}>{saving === o.key ? '保存中…' : on ? '撤回授权' : '允许'}</button>
          </div>
        )
      })}
      <div style={{ background: '#fff', padding: '14px 20px' }}>
        <p style={text(12, C.muted)}>撤回只影响之后：已经保存的数据不会被删除，但不会再用于对应用途。每次修改都会留下记录。</p>
        {error && <p style={text(12, C.error)}>{error}</p>}
      </div>
    </div>
  )
}
