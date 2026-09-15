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

// 2026-09-15 新增：所有会被 userScopedKey 隔离的业务 key，集中维护在这一份清单里。
// 这份清单同时服务于下面的访客数据迁移函数——新增任何一个会被 userScopedKey 包装的
// localStorage key，都应该顺手加进这个数组，否则这个 key 不会被下面的迁移逻辑覆盖到。
export const SCOPED_STORAGE_KEYS = [
  'aiffd_consent',            // OnboardingPage：数据使用授权记录
  'aiffd_avatar_choice',      // ProfilePage：预设头像选择
  'aiffd_profile',            // 补充信息（年龄段/预算/肤色倾向等）
  'aiffd_body_progress',      // BodyTestPage：体型测试中途存档
  'aiffd_body_result',        // 体型测试原始维度结果
  'aiffd_style_result',       // 13 型风格判定结果
  'aiffd_face_result',        // 五官详情
  'aiffd_qixue_result',       // 整体风格复核（气血态）结果
  'aiffd_warmcool',           // 色彩测试第一层：冷暖底调
  'aiffd_color_result',       // 色彩测试通用结果
  'aiffd_season_result',      // 五季测试结果
  'aiffd_season_name',        // 五季主型名称
  'aiffd_season_element',     // 季节自带五行
  'aiffd_element_result',     // 个人五行副气结果
  'aiffd_element_name',       // 个人五行副气名称
  'aiffd_25season',           // 东方 25 季最终结果
  'aiffd_fashion_style',      // 个人时尚选择（理想形象）结果
]

// 2026-09-15 新增：把访客（'guest' 桶）身份下留存的数据，迁移到刚登录/注册成功的
// 真实用户名下。之前的假设是"checkLocalFallback 会兜底读到访客数据"，但实际上
// BodyTestPage 等页面读取时传的都是当前已登录的 user，userScopedKey 算出来的 key
// 从来都不是 '_guest' 结尾，所以那份"迁移"其实从未真正发生过——这个函数是真正
// 补上这条迁移路径的地方。
//
// 调用时机：必须在拿到真实、稳定的用户 id 之后立刻调用一次（登录成功回调 / 注册成功回调），
// 且只调用这一次——多次调用是安全的（幂等），但没必要重复跑。
//
// 迁移策略：逐个 key 检查 guest 桶里是不是有值；如果这个用户名下已经有同名 key 的真实数据，
// 说明这不是这个账号第一次使用，不覆盖，避免用旧的访客数据覆盖掉账号里更新的数据；
// 不管有没有真正搬运成功，guest 桶里的这个 key 最后都会被清空，避免同一台设备之后
// 又被别的账号或别的访客身份误读到这份旧数据。
export function migrateGuestDataToUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return
  if (!user?.id) return // 没有真实用户 id（比如又变回访客）就不用迁移

  SCOPED_STORAGE_KEYS.forEach(base => {
    const guestKey = `${base}_guest`
    const guestValue = localStorage.getItem(guestKey)
    if (guestValue === null) return // guest 桶里本来就没有这份数据

    const userKey = userScopedKey(base, user)
    const alreadyHasOwnData = localStorage.getItem(userKey) !== null
    if (!alreadyHasOwnData) {
      try {
        localStorage.setItem(userKey, guestValue)
      } catch {
        // 写入失败（比如存储空间满了）就跳过这个 key，不阻塞其余 key 的迁移，
        // 也不清空对应的 guestKey，留着下次登录还有机会再迁移一次
        return
      }
    }
    // 不管是"成功搬运"还是"用户名下已有数据所以跳过"，guest 桶里这份都该清掉，
    // 避免同一台设备下次又被读到、造成串号
    localStorage.removeItem(guestKey)
  })
}
