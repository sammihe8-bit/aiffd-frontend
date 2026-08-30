import type { AuthUser } from '../hooks/useAuth'

// 给本地存储的 key 加上用户 ID 前缀，避免同一浏览器切换账号后
// 看到上一个账号留下的测试数据/进度（比如 aiffd_body_result 这类喂给打分引擎的原始数据）。
// 未登录（user 为 null）时统一用 'guest'，行为和之前保持一致，不影响访客路径。
export function userScopedKey(base: string, user: AuthUser | null): string {
  const uid = user?.id ?? 'guest'
  return `${base}_${uid}`
}
