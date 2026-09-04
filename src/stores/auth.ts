import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * 本地模拟认证 Store
 *
 * 项目当前未接入真实后端（Firebase 未配置），为了让平台可以完整跑通
 * 「输入邮箱 + 密码 → 登录 → 进入平台内部首页」的流程，这里使用
 * localStorage 保存登录态做本地模拟：
 *  - 任意合法邮箱 + 至少 6 位密码即可登录（不做真实账号校验）
 *  - 登录态写入 localStorage，刷新页面后仍然保持
 *  - 后续接入真实后端时，只需替换 login / signup / logout 的实现
 */

const STORAGE_KEY = 'careercompass_user'

interface UserProfile {
  uid: string
  email: string
  role: string
  plan?: string
  displayName?: string
  firstName?: string
  lastName?: string
  companyName?: string
  skills?: string
  photoURL?: string
  [key: string]: any
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const loading = ref(false)
  const role = ref<string | null>(null)
  const userProfile = ref<UserProfile | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => role.value === 'admin')
  const isEmployer = computed(() => role.value === 'employer')

  const persist = (profile: UserProfile | null) => {
    user.value = profile
    userProfile.value = profile
    role.value = profile?.role ?? null
    if (profile) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      } catch (e) {
        console.warn('Failed to persist session:', e)
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.warn('Failed to clear session:', e)
      }
    }
  }

  /** 应用启动时从 localStorage 恢复登录态 */
  const initAuth = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        persist(JSON.parse(raw) as UserProfile)
      }
    } catch (e) {
      console.warn('Failed to restore session:', e)
      localStorage.removeItem(STORAGE_KEY)
    }
    loading.value = false
  }

  /**
   * 登录：本地模拟实现。
   * 任意格式合法的邮箱 + 不少于 6 位的密码即可登录，
   * 登录成功后以「求职者（employee）」身份进入平台，默认着陆 /dashboard。
   */
  const login = async (email: string, password: string): Promise<UserProfile> => {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Please enter a valid email address.')
    }

    const name = trimmed.split('@')[0] || 'User'
    const profile: UserProfile = {
      uid: `local-${Date.now()}`,
      email: trimmed,
      role: 'employee',
      plan: 'pro',
      displayName: name,
      firstName: name.charAt(0).toUpperCase() + name.slice(1),
      lastName: '',
    }

    persist(profile)
    return profile
  }

  /** 注册：本地模拟实现，注册成功后自动登录。 */
  const signup = async (
    fullName: string,
    email: string,
    password: string,
    selectedRole: 'employee' | 'employer'
  ): Promise<UserProfile> => {
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) {
      throw new Error('Please enter a valid email address.')
    }

    const nameParts = fullName.trim().split(/\s+/)
    const profile: UserProfile = {
      uid: `local-${Date.now()}`,
      email: trimmed,
      role: selectedRole,
      plan: 'pro',
      displayName: fullName.trim(),
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      ...(selectedRole === 'employer' && { companyName: fullName.trim() }),
    }

    persist(profile)
    return profile
  }

  /** 退出登录：清除本地登录态 */
  const logout = async () => {
    persist(null)
  }

  return {
    user,
    loading,
    role,
    userProfile,
    isAuthenticated,
    isAdmin,
    isEmployer,
    initAuth,
    login,
    signup,
    logout,
  }
})
