// 2026-10-23 新增：各页面读取云端 Human Profile 的统一入口（原来写在个人档案页里）。
// 读取顺序统一为“本机优先、云端补缺”：页面先用本机存档，本机没有的再用这里拿到的云端档案。
// 返回值：undefined = 还在读取；null = 没有档案或读取失败（页面照常只用本机数据）；否则为云端档案。
import { useEffect, useState } from 'react'
import { humanProfileAPI } from '../utils/api'
import type { ServerProfile } from '../utils/profileFromServer'
import type { AuthUser } from './useAuth'

export function useServerProfile(user: AuthUser | null): ServerProfile | null | undefined {
  const [profile, setProfile] = useState<ServerProfile | null | undefined>(undefined)
  useEffect(() => {
    setProfile(undefined)
    if (!user?.id) { setProfile(null); return }
    let cancelled = false
    humanProfileAPI.getMe()
      .then(res => { if (!cancelled) setProfile(res.data?.profile ?? null) })
      .catch(err => {
        console.error('[profile] 读取云端档案失败，仅使用本机数据', err)
        if (!cancelled) setProfile(null)
      })
    return () => { cancelled = true }
  }, [user?.id])
  return profile
}
