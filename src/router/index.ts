import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/views/auth/Signup.vue'),
      meta: { public: true },
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPassword.vue'),
      meta: { public: true },
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/views/Pricing.vue'),
      meta: { public: true },
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import('@/views/PrivacyPolicy.vue'),
      meta: { public: true },
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('@/views/Terms.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: 'opportunities',
          name: 'opportunities',
          component: () => import('@/views/Opportunities.vue'),
        },
        {
          path: 'opportunities/:id',
          name: 'opportunity-detail',
          component: () => import('@/views/OpportunityDetail.vue'),
        },
        {
          path: 'employers',
          name: 'employers',
          component: () => import('@/views/Employers.vue'),
        },
        {
          path: 'applications',
          name: 'applications',
          component: () => import('@/views/Applications.vue'),
        },
        {
          path: 'ai-tools',
          name: 'ai-tools',
          component: () => import('@/views/AITools.vue'),
        },
        {
          path: 'saved',
          name: 'saved',
          component: () => import('@/views/Saved.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/Profile.vue'),
        },
        {
          path: 'inbox',
          name: 'inbox',
          component: () => import('@/views/Inbox.vue'),
        },
        {
          path: 'insights',
          name: 'insights',
          component: () => import('@/views/Insights.vue'),
        },
        {
          path: 'employer/dashboard',
          name: 'employer-dashboard',
          component: () => import('@/views/employer/Dashboard.vue'),
        },
        {
          path: 'employer/postings',
          name: 'employer-postings',
          component: () => import('@/views/employer/Postings.vue'),
        },
        {
          path: 'employer/analytics',
          name: 'employer-analytics',
          component: () => import('@/views/employer/Analytics.vue'),
        },
        {
          path: 'employer/profile',
          name: 'employer-profile',
          component: () => import('@/views/employer/Profile.vue'),
        },
        {
          path: 'admin',
          name: 'admin',
          component: () => import('@/views/admin/Admin.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.public) {
    next()
    return
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    if (authStore.loading) {
      await new Promise((resolve) => {
        // 先检查当前状态，避免订阅时状态已改变
        if (!authStore.loading) {
          resolve(true)
          return
        }
        const unwatch = authStore.$subscribe(() => {
          if (!authStore.loading) {
            unwatch()
            resolve(true)
          }
        })
      })
    }

    if (!authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
  }

  if (authStore.isAuthenticated && to.name === 'home') {
    if (authStore.isEmployer) {
      next({ name: 'employer-dashboard' })
    } else {
      next({ name: 'dashboard' })
    }
    return
  }

  next()
})

export default router
