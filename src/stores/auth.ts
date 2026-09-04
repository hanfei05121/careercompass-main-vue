import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db, auth as firebaseAuth } from '@/lib/firebase'
import { AUTH_ENABLED } from '@/lib/authConfig'

interface UserProfile {
  role: string
  plan?: string
  skills?: string
  displayName?: string
  email?: string
  firstName?: string
  lastName?: string
  companyName?: string
  photoURL?: string
  [key: string]: any
}

/**
 * 鉴权关闭时使用的虚拟用户。
 * 只提供 UI 层会读取的字段，不触发任何网络请求。
 */
const GUEST_USER = {
  uid: 'guest',
  email: 'guest@careercompass.local',
  displayName: 'Guest',
  photoURL: null,
  isAnonymous: true,
} as unknown as User

const GUEST_PROFILE: UserProfile = {
  role: 'employee',
  plan: 'pro',
  displayName: 'Guest',
  email: 'guest@careercompass.local',
  firstName: 'Guest',
  lastName: '',
}

/** 鉴权关闭时 login/signup 返回的占位结果，模拟「用户文档不存在」 */
const EMPTY_DOC_SNAP = { exists: () => false, data: () => undefined }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(AUTH_ENABLED ? null : GUEST_USER)
  const loading = ref(AUTH_ENABLED)
  const role = ref<string | null>(AUTH_ENABLED ? null : GUEST_PROFILE.role)
  const userProfile = ref<UserProfile | null>(AUTH_ENABLED ? null : GUEST_PROFILE)

  const isAuthenticated = computed(() => (AUTH_ENABLED ? !!user.value : true))
  const isAdmin = computed(() => role.value === 'admin')
  const isEmployer = computed(() => role.value === 'employer')

  const initAuth = () => {
    // 鉴权关闭：保持内置的虚拟用户状态，不触碰 Firebase
    if (!AUTH_ENABLED) {
      loading.value = false
      return
    }

    if (!firebaseAuth || !db) {
      console.warn('Firebase is not initialized. Please configure your Firebase credentials.')
      loading.value = false
      return
    }

    // db 是模块级 let 绑定，TS 不会在闭包内保留上面的非空收窄，
    // 这里转存成 const 供 onAuthStateChanged 回调使用
    const firestore = db

    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`
        } catch (e) {
          console.error('Failed to set session cookie:', e)
        }

        const docRef = doc(firestore, 'users', firebaseUser.uid)
        onSnapshot(docRef, (doc) => {
          if (doc.exists()) {
            const profileData = doc.data() as UserProfile
            profileData.plan = 'pro'
            role.value = profileData.role
            userProfile.value = profileData
          }
          loading.value = false
        })
      } else {
        document.cookie = '__session=; path=/; max-age=0'
        role.value = null
        userProfile.value = null
        loading.value = false
      }
    })
  }

  const login = async (email: string, password: string) => {
    if (!AUTH_ENABLED) return EMPTY_DOC_SNAP

    if (!firebaseAuth || !db) {
      throw new Error('Firebase is not initialized. Please configure your Firebase credentials.')
    }

    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password)
    const firebaseUser = userCredential.user

    const userDocRef = doc(db, 'users', firebaseUser.uid)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data()
      await setDoc(
        doc(db, 'publicProfiles', firebaseUser.uid),
        { uid: firebaseUser.uid, ...userData },
        { merge: true }
      )
    }

    return userDocSnap
  }

  const loginWithGoogle = async () => {
    if (!AUTH_ENABLED) return EMPTY_DOC_SNAP

    if (!firebaseAuth || !db) {
      throw new Error('Firebase is not initialized. Please configure your Firebase credentials.')
    }

    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(firebaseAuth, provider)
    const firebaseUser = result.user

    const userDocRef = doc(db, 'users', firebaseUser.uid)
    const userDocSnap = await getDoc(userDocRef)

    if (!userDocSnap.exists()) {
      const emailDomain = firebaseUser.email?.split('@')[1]
      const role = emailDomain === 'gmail.com' ? 'employee' : 'employer'

      const nameParts = firebaseUser.displayName?.split(' ') || []
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      const userData = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        role: role,
        photoURL: firebaseUser.photoURL,
        firstName: firstName,
        lastName: lastName,
        ...(role === 'employer' && { companyName: firebaseUser.displayName }),
      }

      await setDoc(userDocRef, userData)
      await setDoc(
        doc(db, 'publicProfiles', firebaseUser.uid),
        userData,
        { merge: true }
      )
    }

    return userDocSnap
  }

  const signup = async (
    fullName: string,
    email: string,
    password: string,
    selectedRole: 'employee' | 'employer'
  ) => {
    if (!AUTH_ENABLED) {
      return { uid: GUEST_USER.uid, ...GUEST_PROFILE, role: selectedRole }
    }

    if (!firebaseAuth || !db) {
      throw new Error('Firebase is not initialized. Please configure your Firebase credentials.')
    }

    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    const firebaseUser = userCredential.user

    await updateProfile(firebaseUser, {
      displayName: fullName,
    })

    const nameParts = fullName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    const userData = {
      uid: firebaseUser.uid,
      displayName: fullName,
      email: email,
      role: selectedRole,
      firstName: firstName,
      lastName: lastName,
      ...(selectedRole === 'employer' && { companyName: fullName }),
    }

    await setDoc(doc(db, 'users', firebaseUser.uid), userData)
    await setDoc(
      doc(db, 'publicProfiles', firebaseUser.uid),
      userData
    )

    return userData
  }

  const logout = async () => {
    // 鉴权关闭：没有真实的登录态可清除，直接视为已登出并保持虚拟用户
    if (!AUTH_ENABLED) return

    if (!firebaseAuth) {
      throw new Error('Firebase is not initialized. Please configure your Firebase credentials.')
    }

    await signOut(firebaseAuth)
    user.value = null
    role.value = null
    userProfile.value = null
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
