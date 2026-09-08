import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { appEnv } from '@/config'
import { STORAGE_KEYS } from '@/constants'
import { localCache } from '@/utils/storage'
import type { UserProfile, UserRole } from '@/api/types'

/**
 * 认证 Store
 * ------------------------------------------------------------
 * 双模式运行，由 VITE_AUTH_ENABLED 控制：
 *  - true ：走 Firebase Auth + Firestore（需要配置 .env 中的 VITE_FIREBASE_*）
 *  - false：本地模拟登录（localStorage 持久化），后端未就绪也能跑通全流程
 *
 * Firebase 采用动态 import，鉴权关闭时不会打进主包。
 */

/** 最小用户结构，兼容 Firebase User 与本地模拟用户 */
interface AuthUser {
  uid: string
  email: string | null
  displayName?: string | null
  photoURL?: string | null
}

/** 鉴权关闭时使用的虚拟用户 */
const GUEST_USER: AuthUser = {
  uid: 'guest',
  email: 'guest@careercompass.local',
  displayName: 'Guest',
  photoURL: null,
}

/** 鉴权关闭时使用的虚拟资料 */
const GUEST_PROFILE: UserProfile = {
  uid: 'guest',
  email: 'guest@careercompass.local',
  role: 'employee',
  plan: 'pro',
  displayName: 'Guest',
  firstName: 'Guest',
  lastName: '',
}

/** 加载 Firebase 模块（按需） */
async function loadFirebase() {
  const { auth: firebaseAuth, db: firestore } = await import('@/lib/firebase')
  if (!firebaseAuth || !firestore) {
    throw new Error('Firebase is not initialized. Please configure your Firebase credentials.')
  }
  return { firebaseAuth, firestore }
}

/** 邮箱域名推导角色：gmail 视为求职者，其余视为雇主 */
const resolveRoleByEmail = (email?: string | null): UserRole =>
  email?.split('@')[1] === 'gmail.com' ? 'employee' : 'employer'

export const useAuthStore = defineStore('auth', () => {
  const enabled = appEnv.authEnabled

  const user = ref<AuthUser | null>(enabled ? null : GUEST_USER)
  const loading = ref(enabled)
  const role = ref<UserRole | null>(enabled ? null : GUEST_PROFILE.role)
  const userProfile = ref<UserProfile | null>(enabled ? null : GUEST_PROFILE)

  const isAuthenticated = computed(() => (enabled ? !!user.value : true))
  const isAdmin = computed(() => role.value === 'admin')
  const isEmployer = computed(() => role.value === 'employer')

  /** 写入资料并持久化（仅本地模拟模式需要） */
  const applyProfile = (profile: UserProfile | null) => {
    userProfile.value = profile
    role.value = profile?.role ?? null
    if (profile) {
      localCache.set(STORAGE_KEYS.USER, profile)
    } else {
      localCache.remove(STORAGE_KEYS.USER)
    }
  }

  /** 应用启动：恢复登录态 */
  const initAuth = async () => {
    // 本地模拟模式：从缓存恢复，没有则保持虚拟用户
    if (!enabled) {
      const cached = localCache.get<UserProfile>(STORAGE_KEYS.USER)
      if (cached) applyProfile(cached)
      loading.value = false
      return
    }

    try {
      const { firebaseAuth, firestore } = await loadFirebase()
      const { onAuthStateChanged } = await import('firebase/auth')
      const { doc, onSnapshot } = await import('firebase/firestore')

      onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
        user.value = firebaseUser
        if (!firebaseUser) {
          document.cookie = '__session=; path=/; max-age=0'
          applyProfile(null)
          loading.value = false
          return
        }

        try {
          const token = await firebaseUser.getIdToken()
          document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`
        } catch (e) {
          console.error('Failed to set session cookie:', e)
        }

        onSnapshot(doc(firestore, 'users', firebaseUser.uid), (snapshot) => {
          if (snapshot.exists()) {
            const profile = { ...(snapshot.data() as UserProfile), uid: firebaseUser.uid }
            profile.plan = 'pro'
            userProfile.value = profile
            role.value = profile.role
          }
          loading.value = false
        })
      })
    } catch (e) {
      console.warn('Failed to initialize auth:', e)
      loading.value = false
    }
  }

  /** 邮箱密码登录 */
  const login = async (email: string, password: string): Promise<UserProfile> => {
    if (!enabled) {
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
      user.value = { uid: profile.uid, email: profile.email, displayName: profile.displayName }
      applyProfile(profile)
      return profile
    }

    const { firebaseAuth, firestore } = await loadFirebase()
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    const { doc, getDoc, setDoc } = await import('firebase/firestore')

    const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    const snapshot = await getDoc(doc(firestore, 'users', credential.user.uid))

    if (snapshot.exists()) {
      const data = snapshot.data() as UserProfile
      await setDoc(
        doc(firestore, 'publicProfiles', credential.user.uid),
        { ...data, uid: credential.user.uid },
        { merge: true }
      )
      role.value = data.role
      userProfile.value = { ...data, uid: credential.user.uid }
      return userProfile.value
    }

    return { uid: credential.user.uid, email: credential.user.email ?? '', role: 'employee', plan: 'pro' }
  }

  /** Google 登录 */
  const loginWithGoogle = async (): Promise<UserProfile> => {
    if (!enabled) {
      applyProfile(GUEST_PROFILE)
      return GUEST_PROFILE
    }

    const { firebaseAuth, firestore } = await loadFirebase()
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    const { doc, getDoc, setDoc } = await import('firebase/firestore')

    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(firebaseAuth, provider)
    const firebaseUser = result.user

    const userDocRef = doc(firestore, 'users', firebaseUser.uid)
    const snapshot = await getDoc(userDocRef)

    if (snapshot.exists()) {
      const profile = { ...(snapshot.data() as UserProfile), uid: firebaseUser.uid }
      applyProfile(profile)
      return profile
    }

    const nameParts = firebaseUser.displayName?.split(' ') ?? []
    const profile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      role: resolveRoleByEmail(firebaseUser.email),
      plan: 'pro',
      displayName: firebaseUser.displayName ?? '',
      photoURL: firebaseUser.photoURL ?? undefined,
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' '),
      ...(resolveRoleByEmail(firebaseUser.email) === 'employer' && {
        companyName: firebaseUser.displayName ?? '',
      }),
    }

    await setDoc(userDocRef, profile)
    await setDoc(doc(firestore, 'publicProfiles', firebaseUser.uid), profile, { merge: true })
    applyProfile(profile)
    return profile
  }

  /** 注册 */
  const signup = async (
    fullName: string,
    email: string,
    password: string,
    selectedRole: UserRole
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
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' '),
      ...(selectedRole === 'employer' && { companyName: fullName.trim() }),
    }

    if (!enabled) {
      user.value = { uid: profile.uid, email: profile.email, displayName: profile.displayName }
      applyProfile(profile)
      return profile
    }

    const { firebaseAuth, firestore } = await loadFirebase()
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth')
    const { doc, setDoc } = await import('firebase/firestore')

    const credential = await createUserWithEmailAndPassword(firebaseAuth, trimmed, password)
    await updateProfile(credential.user, { displayName: fullName.trim() })

    const created: UserProfile = { ...profile, uid: credential.user.uid }
    await setDoc(doc(firestore, 'users', credential.user.uid), created)
    await setDoc(doc(firestore, 'publicProfiles', credential.user.uid), created)

    user.value = credential.user
    applyProfile(created)
    return created
  }

  /** 退出登录 */
  const logout = async () => {
    if (!enabled) {
      applyProfile(null)
      user.value = GUEST_USER
      role.value = GUEST_PROFILE.role
      userProfile.value = GUEST_PROFILE
      return
    }

    const { firebaseAuth } = await loadFirebase()
    const { signOut } = await import('firebase/auth')
    await signOut(firebaseAuth)
    user.value = null
    applyProfile(null)
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
    loginWithGoogle,
    signup,
    logout,
  }
})
