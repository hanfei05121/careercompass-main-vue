/**
 * 鉴权总开关
 *
 * 设为 'true' 时启用 Firebase 登录鉴权（需要配置 .env 中的 VITE_FIREBASE_* 变量）
 * 未设置或设为其他值时，鉴权被完全关闭：
 *   - 所有页面直接放行，不再跳转登录页
 *   - auth store 提供一个内置的虚拟用户，isAuthenticated 恒为 true
 *   - login / signup / logout 变成空操作，不再请求 Firebase
 *
 * 注意：这里只关闭「鉴权」，不关闭 Firestore 数据读写。
 */
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true'
