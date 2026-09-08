import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { zhCN } from 'date-fns/locale'

type DateInput = Date | string | number | null | undefined

/** 宽松地把各种输入转成 Date，非法输入返回 null */
export const toDate = (input: DateInput): Date | null => {
  if (!input) return null
  const date = input instanceof Date ? input : typeof input === 'string' ? parseISO(input) : new Date(input)
  return isValid(date) ? date : null
}

/** YYYY-MM-DD */
export const formatDate = (input: DateInput, pattern = 'yyyy-MM-dd'): string => {
  const date = toDate(input)
  return date ? format(date, pattern) : ''
}

/** YYYY-MM-DD HH:mm:ss */
export const formatDateTime = (input: DateInput): string => formatDate(input, 'yyyy-MM-dd HH:mm:ss')

/** HH:mm */
export const formatTime = (input: DateInput): string => formatDate(input, 'HH:mm')

/** 相对时间：3 分钟前 / 2 天前 */
export const formatFromNow = (input: DateInput): string => {
  const date = toDate(input)
  if (!date) return ''
  return formatDistanceToNow(date, { addSuffix: true, locale: zhCN })
}

/** 人性化日期：今天、昨天、否则 MM-dd 或 yyyy-MM-dd */
export const formatFriendlyDate = (input: DateInput): string => {
  const date = toDate(input)
  if (!date) return ''
  const now = new Date()
  const diffDays = Math.floor((+new Date(now.toDateString()) - +new Date(date.toDateString())) / 86400000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  const pattern = date.getFullYear() === now.getFullYear() ? 'MM-dd' : 'yyyy-MM-dd'
  return format(date, pattern)
}

/** 时间戳（秒）转日期字符串 */
export const fromTimestamp = (seconds: number, pattern = 'yyyy-MM-dd HH:mm'): string =>
  formatDate(new Date(seconds * 1000), pattern)

/** 日期字符串转时间戳（秒） */
export const toTimestamp = (input: DateInput): number => {
  const date = toDate(input)
  return date ? Math.floor(date.getTime() / 1000) : 0
}
