import { createRouter, createWebHistory } from 'vue-router'
import { appEnv } from '@/config'

/**
 * 复现 Karot 作品集站点：单页落地（/）+ 文章详情（/articles/:slug）。
 * 站点完全公开，无需鉴权守卫。
 */
const router = createRouter({
  history: createWebHistory(appEnv.routerBase),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/index.vue'),
      meta: { title: '把工程判断，写成可安装的工具与 Skill' },
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
  const base = 'Karot · Frontend · Agent'
  document.title = to.meta.title ? `${to.meta.title} · ${base}` : base
})

export default router