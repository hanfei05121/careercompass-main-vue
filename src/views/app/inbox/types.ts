/** 消息中心模块类型 */

/** 消息类型 */
export type InboxMessageType = 'system' | 'application' | 'interview' | 'message'

/** 消息条目 */
export interface InboxMessageItem {
  id: string
  type: InboxMessageType
  title: string
  /** 消息摘要 */
  snippet?: string
  /** 发送者名称（系统消息可为空） */
  fromName?: string
  read: boolean
  createdAt?: string
}
