import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import i18n from '@/locales'

/** 路由守卫：登录态校验 + 动态标题 */
export const setupRouterGuard = (router: Router) => {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // 等待鉴权初始化完成（首跳时 store 可能在恢复登录态）
    if (authStore.loading) {
      await new Promise<void>((resolve) => {
        const unwatch = authStore.$subscribe(() => {
          if (!authStore.loading) {
            unwatch()
            resolve()
          }
        })
        // 初始化是同步完成的（本地模拟模式），兜底直接放行
        setTimeout(resolve, 0)
      })
    }

    // 需要登录但未登录 → 跳转登录页并记录来源
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return {
        path: '/auth/login',
        query: { redirect: to.fullPath },
      }
    }

    // 已登录访问登录/注册页 → 回工作台
    if (
      authStore.isAuthenticated &&
      (to.path === '/auth/login' || to.path === '/auth/signup')
    ) {
      return authStore.isEmployer ? '/employer/dashboard' : '/dashboard'
    }

    return true
  })

  // 动态页面标题
  router.afterEach((to) => {
    const { t } = i18n.global
    const title = to.meta.title ? t(String(to.meta.title)) : ''
    const appName = i18n.global.t('common.appName')
    document.title = title ? `${title} · ${appName}` : appName
  })
}
