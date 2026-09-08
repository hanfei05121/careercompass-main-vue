export type UserRole = 'employee' | 'employer' | 'admin'
export type PlanType = 'free' | 'pro' | 'enterprise'

/** 用户资料（与 Firestore users 文档结构一致） */
export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  plan: PlanType
  displayName?: string
  firstName?: string
  lastName?: string
  photoURL?: string
  /** 雇主企业名称 */
  companyName?: string
  /** 创建时间 */
  createdAt?: string
}

/** 登录参数 */
export interface LoginForm {
  email: string
  password: string
}

/** 注册参数 */
export interface RegisterForm {
  fullName: string
  email: string
  password: string
  role: UserRole
}

/** 修改密码参数 */
export interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
}

export interface LoginResult {
  token: string
  profile: UserProfile
}
