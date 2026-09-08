import { createRouter, createWebHistory } from 'vue-router'
import { appEnv } from '@/config'
import { createAutoRoutes } from './auto-routes'
import { setupRouterGuard } from './guard'

/**
 * 路由完全由 src/views 下的文件结构自动生成，
 * 约定见 ./meta.ts 顶部注释。
 */
const router = createRouter({
  history: createWebHistory(appEnv.routerBase),
  routes: [
    ...createAutoRoutes(),
    // 404 兜底
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
      meta: { title: 'menu.notFound', public: true },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

setupRouterGuard(router)

export default router
