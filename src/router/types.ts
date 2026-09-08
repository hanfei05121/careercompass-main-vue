import type { RouteRecordRaw } from 'vue-router'

/** 扩展路由 meta */
export interface AppRouteMeta {
  /** 页面标题（对应 menu.* 的 i18n key） */
  title?: string
  /** 是否需要登录 */
  requiresAuth?: boolean
  /** 是否公开页面（无需登录） */
  public?: boolean
  /** 是否隐藏在菜单中 */
  hidden?: boolean
  /** 菜单图标（lucide 组件名） */
  icon?: string
  /** 是否缓存组件 */
  keepAlive?: boolean
  /** 使用的布局名 */
  layout?: string
}

/** 带自定义 meta 的路由记录 */
export type AppRouteRecordRaw = RouteRecordRaw & { meta?: AppRouteMeta }

/** import.meta.glob 扫描出的页面模块表 */
export type ViewModules = Record<string, () => Promise<unknown>>
