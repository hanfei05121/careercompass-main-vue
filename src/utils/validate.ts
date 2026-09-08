import { REGEXP } from '@/constants'

/** 是否邮箱 */
export const isEmail = (value?: string | null): boolean => REGEXP.email.test(value ?? '')

/** 是否中国大陆手机号 */
export const isPhone = (value?: string | null): boolean => REGEXP.phone.test(value ?? '')

/** 是否 URL */
export const isUrl = (value?: string | null): boolean => REGEXP.url.test(value ?? '')

/** 是否身份证号（仅格式校验） */
export const isIdCard = (value?: string | null): boolean => REGEXP.idCard.test(value ?? '')

/** 是否外部链接 */
export const isExternal = (path?: string | null): boolean => /^(https?:|mailto:|tel:)/.test(path ?? '')

/** 是否为空值（null / undefined / '' / 空数组 / 空对象） */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/** 是否数字（含字符串数字） */
export const isNumber = (value: unknown): boolean => value !== '' && !Number.isNaN(Number(value))

/** 是否整数 */
export const isInteger = (value: unknown): boolean => Number.isInteger(Number(value))
