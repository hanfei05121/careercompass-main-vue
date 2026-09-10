/**
 * 主页模块类型。
 * 当前主页为纯展示型分区组合，类型保持精简，
 * 便于后续新增分区时在此统一登记 props / 数据结构。
 */

/** 主导航锚点项 */
export interface NavLink {
  label: string
  href: string
}

/** 板块三支柱项 */
export interface Pillar {
  title: string
  desc: string
}