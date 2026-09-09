import type { AppRouteMeta } from './types'

/**
 * 文件路由约定说明
 * ------------------------------------------------------------
 * 1. 页面文件放在 src/views 下，文件路径即访问路径（kebab-case）：
 *      views/index.vue                 ->  /
 *      views/auth/Login.vue            ->  /auth/login        （公开页）
 *      views/app/Dashboard.vue         ->  /dashboard          （AppLayout 分组，需登录）
 *      views/app/opportunities/detail/[id].vue->  /opportunities/detail/:id  （动态段）
 * 2. app/ 目录 = 受保护业务区，自动套用 AppLayout 并要求登录；
 * 3. 其余目录（auth、根级公开页）不套布局；
 * 4. 新增页面只需新建 .vue 文件，无需手动注册路由。
 */

/** 公开页面（无需登录）：auth 目录 + 根级营销页 */
export const PUBLIC_PAGES = new Set([
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/pricing',
  '/privacy-policy',
  '/terms',
])

/** 页面文件 → 路由 meta 的默认映射 */
export const buildMeta = (path: string, layout?: string): AppRouteMeta => {
  const title = pageTitleMap[path] ?? pageTitleMap[path.replace(/\/:.*$/, '')]
  const isPublic = PUBLIC_PAGES.has(path) || PUBLIC_PAGES.has(path.replace(/\/:.*$/, ''))
  return {
    title,
    requiresAuth: !isPublic,
    public: isPublic,
    layout,
    icon: menuIconMap[path],
  }
}

/** 路径 → i18n 标题（menu.* key） */
export const pageTitleMap: Record<string, string> = {
  '/': 'menu.home',
  '/dashboard': 'menu.dashboard',
  '/opportunities': 'menu.opportunities',
  '/opportunities/detail/:id': 'menu.opportunityDetail',
  '/applications': 'menu.applications',
  '/ai-tools': 'menu.aiTools',
  '/saved': 'menu.saved',
  '/profile': 'menu.profile',
  '/inbox': 'menu.inbox',
  '/insights': 'menu.insights',
  '/cards': 'menu.cards',
  '/cards/:type': 'menu.cards',
  '/employer/dashboard': 'menu.employerDashboard',
  '/employer/postings': 'menu.postings',
  '/employer/analytics': 'menu.analytics',
  '/employer/profile': 'menu.employerProfile',
  '/admin': 'menu.admin',
  '/auth/login': 'menu.login',
  '/auth/signup': 'menu.signup',
  '/auth/forgot-password': 'menu.forgotPassword',
  '/pricing': 'menu.pricing',
  '/privacy-policy': 'menu.privacyPolicy',
  '/terms': 'menu.terms',
}

/** 路径 → 菜单图标（与 AppSidebar 中的 lucide 图标对应） */
export const menuIconMap: Record<string, string> = {
  '/dashboard': 'LayoutDashboard',
  '/opportunities': 'Briefcase',
  '/applications': 'Kanban',
  '/ai-tools': 'Rocket',
  '/saved': 'Heart',
  '/profile': 'User',
  '/inbox': 'MessageSquare',
  '/insights': 'BarChart3',
  '/employer/dashboard': 'Building2',
  '/employer/postings': 'FileText',
  '/employer/analytics': 'BarChartHorizontal',
  '/employer/profile': 'User',
  '/admin': 'Shield',
}
