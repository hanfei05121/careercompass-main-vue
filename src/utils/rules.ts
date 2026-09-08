import { REGEXP } from '@/constants'
import { isEmpty } from './validate'

type RuleValidator = (
  _rule: unknown,
  value: string,
  callback: (error?: Error) => void
) => void

/** 必填校验（el-form rule 用） */
export const requiredRule = (message = '该项为必填项') => ({
  required: true,
  message,
  trigger: 'blur' as const,
})

/** 通用正则校验生成器 */
const patternRule = (
  regexp: RegExp,
  message: string,
  trigger: 'blur' | 'change' = 'blur'
) => ({
  validator: ((_rule, value: string, callback) => {
    if (isEmpty(value) || regexp.test(value)) callback()
    else callback(new Error(message))
  }) as RuleValidator,
  trigger,
})

/** 邮箱规则 */
export const emailRule = (message = '邮箱格式不正确') => patternRule(REGEXP.email, message)

/** 手机号规则 */
export const phoneRule = (message = '手机号格式不正确') => patternRule(REGEXP.phone, message, 'blur')

/** 密码规则：8-20 位字母+数字 */
export const passwordRule = (message = '密码需 8-20 位且包含字母和数字') =>
  patternRule(REGEXP.password, message)

/** 最小长度规则 */
export const minLengthRule = (min: number, message?: string) => ({
  min,
  message: message ?? `长度不能少于 ${min} 个字符`,
  trigger: 'blur' as const,
})

/** 自定义校验器：两个密码一致 */
export const confirmPasswordRule = (getPassword: () => string, message = '两次输入的密码不一致') => ({
  validator: ((_rule, value: string, callback) => {
    if (value !== getPassword()) callback(new Error(message))
    else callback()
  }) as RuleValidator,
  trigger: 'blur' as const,
})
