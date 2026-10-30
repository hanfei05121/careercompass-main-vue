import { createRouter, createWebHistory } from 'vue-router'
import { appEnv } from '@/config'

/**
 * 个人介绍站点：单页落地（/）+ 文章详情（/articles/:slug）。
 * 站点完全公开，无需鉴权守卫。
 */
const router = createRouter({
  history: createWebHistory(appEnv.routerBase),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/index.vue'),
      meta: { title: 'Vue 前端工程师 · 项目与实践' },
    },
    {
      path: '/articles/:slug',
      name: 'article',
      component: () => import('@/views/articles/[slug].vue'),
      meta: { title: '文章' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior: (to, _from, saved) => {
    if (saved) return saved
    // 带 hash 时滚动到对应分区，偏移量与 .scroll-anchor 的 scroll-margin-top 对齐
    if (to.hash) return { el: to.hash, top: 96, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const base = '韩 · Frontend · Vue'
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base
})

export default router