import type { RouteRecordRaw } from 'vue-router'
import { buildMeta } from './meta'
import type { AppRouteRecordRaw, ViewModules } from './types'

/**
 * 基于文件目录的路由自动生成
 * 新增/删除页面只需增删 src/views 下的 .vue 文件
 */

const viewModules: ViewModules = import.meta.glob('../views/**/*.vue')

const layoutModules = import.meta.glob('../layouts/*.vue') as Record<
  string,
  () => Promise<unknown>
>

/** PascalCase / camelCase / snake_case → kebab-case */
const toKebab = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()

/** 文件名 → 路由段：index → 空，[id] → :id，[[id]] → :id? */
const toPathSegment = (filename: string): string => {
  if (filename === 'index') return ''
  const optional = filename.match(/^\[\[(.+)\]\]$/)
  if (optional) return `:${optional[1]}?`
  const dynamic = filename.match(/^\[(.+)\]$/)
  if (dynamic) return `:${dynamic[1]}`
  return toKebab(filename)
}

interface PageEntry {
  /** 完整路由路径（以 / 开头） */
  path: string
  /** 路由名（kebab，动态段去除冒号） */
  name: string
  component: () => Promise<unknown>
  meta: ReturnType<typeof buildMeta>
  /** 所属布局（app 分组） */
  layout: string
  /** 布局分组内的子路径 */
  childPath: string
}

/** 扫描所有页面文件，归一化为页面条目 */
const collectPages = (): PageEntry[] => {
  const pages: PageEntry[] = []

  Object.keys(viewModules)
    .sort()
    .forEach((file) => {
      // '../views/app/opportunities/[id].vue' -> 'app/opportunities/[id]'
      const relative = file.replace(/^..\/views\//, '').replace(/\.vue$/, '')
      const parts = relative.split('/')

      let layout = ''
      if (parts[0] === 'app') {
        layout = 'AppLayout'
        parts.shift()
      }

      const segments = parts.map(toPathSegment)
      const path = `/${segments.filter(Boolean).join('/')}` || '/'
      const name =
        path
          .replace(/^\//, '')
          .replace(/\/:/g, '-')
          .replace(/:/g, '')
          .replace(/\//g, '-') || 'home'

      pages.push({
        path,
        name,
        component: viewModules[file] as PageEntry['component'],
        meta: buildMeta(path, layout || undefined),
        layout,
        childPath: segments.filter(Boolean).join('/') || '',
      })
    })

  return pages
}

/** 生成最终路由表 */
export const createAutoRoutes = (): RouteRecordRaw[] => {
  const pages = collectPages()
  const routes: RouteRecordRaw[] = []
  const standalone: RouteRecordRaw[] = []
  const layouts = new Map<string, PageEntry[]>()

  pages.forEach((page) => {
    if (page.layout) {
      const list = layouts.get(page.layout) ?? []
      list.push(page)
      layouts.set(page.layout, list)
    } else {
      standalone.push({
        path: page.path,
        name: page.name,
        component: page.component,
        meta: page.meta,
      } as RouteRecordRaw)
    }
  })

  // 布局分组：/ 套 AppLayout，子路由挂在布局下
  layouts.forEach((children, layoutName) => {
    const layoutFile = `../layouts/${layoutName}.vue`
    routes.push({
      path: '/',
      component: layoutModules[layoutFile],
      meta: { requiresAuth: true, layout: layoutName },
      children: children.map((child) => ({
        path: child.childPath,
        name: child.name,
        component: child.component,
        meta: child.meta,
      })) as unknown as RouteRecordRaw[],
    } as unknown as RouteRecordRaw)
  })

  return [...standalone, ...routes]
}

export type { AppRouteRecordRaw }
