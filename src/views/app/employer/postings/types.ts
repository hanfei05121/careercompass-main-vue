/** 职位发布模块类型 */

/** 职位发布状态 */
export type PostingStatus = 'draft' | 'active' | 'closed'

/** 职位发布条目 */
export interface PostingItem {
  id: string
  title: string
  location?: string
  type?: string
  status: PostingStatus
  /** 收到的申请数 */
  applicationCount?: number
  createdAt?: string
}
