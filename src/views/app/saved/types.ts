/** 收藏模块类型 */

/** 收藏项类型：职位 / 企业 */
export type SavedTargetType = 'job' | 'company'

/** 收藏条目 */
export interface SavedItem {
  id: string
  type: SavedTargetType
  /** 被收藏对象 id */
  targetId: string
  title: string
  subtitle?: string
  createdAt?: string
}

/** 收藏筛选 */
export interface SavedFilters {
  type?: SavedTargetType
}
