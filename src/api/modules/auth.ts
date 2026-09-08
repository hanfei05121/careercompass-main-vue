import { httpGet, httpPost } from '../request'
import type { ApiResponse, ChangePasswordForm, LoginForm, LoginResult, RegisterForm, UserProfile } from '../types'
import { mockLogin, mockProfile, mockRegister } from '../mock/auth.mock'
import { appEnv } from '@/config'

/** 邮箱密码登录 */
export const apiLogin = (form: LoginForm) =>
  appEnv.useMock ? mockLogin(form) : httpPost<ApiResponse<LoginResult>>('/auth/login', form)

/** Google 等第三方登录的票据换 token */
export const apiSocialLogin = (provider: string, idToken: string) =>
  httpPost<ApiResponse<LoginResult>>('/auth/social', { provider, idToken })

/** 注册 */
export const apiRegister = (form: RegisterForm) =>
  appEnv.useMock ? mockRegister(form) : httpPost<ApiResponse<LoginResult>>('/auth/register', form)

/** 退出登录 */
export const apiLogout = () => httpPost<ApiResponse<null>>('/auth/logout')

/** 当前用户资料 */
export const apiProfile = (uid: string) =>
  appEnv.useMock ? mockProfile(uid) : httpGet<ApiResponse<UserProfile>>('/user/profile', { uid })

/** 修改密码 */
export const apiChangePassword = (form: ChangePasswordForm) =>
  httpPost<ApiResponse<null>>('/auth/change-password', form)
