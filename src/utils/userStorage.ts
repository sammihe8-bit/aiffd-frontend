import type { AuthUser } from '../hooks/useAuth'

// 给本地存储的 key 加上用户 ID 前缀，避免同一浏览器切换账号后
// 看到上一个账号留下的测试数据/进度（比如 aiffd_body_result 这类喂给打分引擎的原始数据）。
// 未登录（user 为 null）时统一用 'guest'，行为和之前保持一致，不影响访客路径。
export function userScopedKey(base: string, user: AuthUser | null): string {
  const uid = user?.id ?? 'guest'
  return `${base}_${uid}`
}

// 判断"体型+风格+色彩三层"是否已经全部测完（个人爱好测试还没上线，不计入这个判断）。
// 用在测试中心的主入口：全部做完的用户点"开始测试"应该直接进结果页，而不是从头再问一遍。
export function isFullProfileComplete(user: AuthUser | null): boolean {
  const has = (base: string) => !!localStorage.getItem(userScopedKey(base, user))
  return has('aiffd_body_result') && has('aiffd_style_result') && has('aiffd_25season')
}
