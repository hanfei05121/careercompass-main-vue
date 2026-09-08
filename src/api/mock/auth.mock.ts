import type { LoginResult, LoginForm, RegisterForm, UserProfile } from '@/api/types'
import { ok, withMock } from '../mock'

/** 模拟已注册用户 */
const mockUsers: UserProfile[] = [
  {
    uid: 'mock-001',
    email: 'employee@demo.com',
    role: 'employee',
    plan: 'pro',
    displayName: 'Demo Employee',
    firstName: 'Demo',
    lastName: 'Employee',
  },
  {
    uid: 'mock-002',
    email: 'employer@demo.com',
    role: 'employer',
    plan: 'pro',
    displayName: 'Demo Employer',
    companyName: '示例科技',
  },
]

export const mockLogin = (form: LoginForm) =>
  withMock(async () => {
    const profile = mockUsers.find((u) => u.email === form.email.trim().toLowerCase())
    const target = profile ?? {
      uid: `mock-${Date.now()}`,
      email: form.email,
      role: 'employee' as const,
      plan: 'pro' as const,
      displayName: form.email.split('@')[0],
      firstName: form.email.split('@')[0],
      lastName: '',
    }
    return ok<LoginResult>({ token: `mock-token-${Date.now()}`, profile: target })
  })

export const mockRegister = (form: RegisterForm) =>
  withMock(async () => {
    const profile: UserProfile = {
      uid: `mock-${Date.now()}`,
      email: form.email,
      role: form.role,
      plan: 'pro',
      displayName: form.fullName,
      firstName: form.fullName.split(' ')[0] ?? form.fullName,
      lastName: form.fullName.split(' ').slice(1).join(' '),
    }
    return ok<LoginResult>({ token: `mock-token-${Date.now()}`, profile })
  })

export const mockProfile = (uid: string) =>
  withMock(async () => ok(mockUsers.find((u) => u.uid === uid) ?? mockUsers[0]))
