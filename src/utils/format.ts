/** 千分位金额：1234567.89 -> 1,234,567.89 */
export const formatMoney = (value: number | string | null | undefined, digits = 2): string => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '-'
  return num.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

/** 金额简写：12000 -> 1.2w */
export const formatCompact = (value: number | string | null | undefined): string => {
  const num = Number(value)
  if (!Number.isFinite(num)) return '-'
  if (Math.abs(num) >= 1e8) return `${(num / 1e8).toFixed(1)}亿`
  if (Math.abs(num) >= 1e4) return `${(num / 1e4).toFixed(1)}w`
  return String(num)
}

/** 文件大小：字节 -> KB/MB */
export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) return '-'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

/** 手机号脱敏：138****1234 */
export const maskPhone = (phone?: string | null): string =>
  phone && phone.length >= 7 ? phone.replace(/^(\d{3})\d*(\d{4})$/, '$1****$2') : (phone ?? '')

/** 邮箱脱敏：ab***@domain.com */
export const maskEmail = (email?: string | null): string => {
  if (!email || !email.includes('@')) return email ?? ''
  const [name, domain] = email.split('@')
  const visible = name.slice(0, 2)
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`
}

/** 百分比：0.1234 -> 12.3% */
export const formatPercent = (value: number, digits = 1): string =>
  `${(value * 100).toFixed(digits)}%`
