import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { PROFILE_SYNC_FAILED_EVENT, backfillProfile, clearLegacyUnscopedKeys } from '../utils/profileSync'

// 2026-10-16 新增：测试结果同步到云端档案失败时的提示条，同时负责每次打开网站时的补传。
// 测试结果本身仍然先存在本机，用户可以照常查看；这里只是让"云端没存上"不再悄无声息。

interface Notice { label: string; willRetry: boolean }

export default function ProfileSyncNotice() {
  const { user } = useAuth()
  const [notice, setNotice] = useState<Notice | null>(null)

  // 打开网站时清理旧版存档；登录用户每个浏览器会话补传一次
  useEffect(() => { clearLegacyUnscopedKeys() }, [])
  useEffect(() => {
    if (user?.id) backfillProfile(user)
  }, [user?.id])

  useEffect(() => {
    const onFail = (e: Event) => setNotice((e as CustomEvent<Notice>).detail)
    window.addEventListener(PROFILE_SYNC_FAILED_EVENT, onFail)
    return () => window.removeEventListener(PROFILE_SYNC_FAILED_EVENT, onFail)
  }, [])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 12000)
    return () => clearTimeout(t)
  }, [notice])

  if (!notice) return null
  return (
    <div role="status" style={{
      position: 'fixed', left: '50%', bottom: '24px', transform: 'translateX(-50%)', zIndex: 1000,
      width: 'min(520px, calc(100% - 32px))', background: '#fff', border: '1px solid #e8e8e4',
      borderLeft: '3px solid #B8973A', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
      padding: '14px 40px 14px 16px', fontFamily: 'Inter, sans-serif', fontSize: '13px', lineHeight: 1.7, color: '#444444',
    }}>
      <strong style={{ color: '#111111' }}>{notice.label}的结果已保存在这台设备上</strong>，但暂时没能同步到你的云端档案。
      {notice.willRetry
        ? '下次打开网站时会自动重试。'
        : '如果反复出现，请联系 hello@aiffd.com。'}
      <button onClick={() => setNotice(null)} aria-label="关闭提示" style={{
        position: 'absolute', top: '8px', right: '10px', background: 'none', border: 'none',
        fontSize: '18px', color: '#999999', cursor: 'pointer', lineHeight: 1,
      }}>×</button>
    </div>
  )
}
