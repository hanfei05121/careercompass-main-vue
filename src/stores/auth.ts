import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAuth,
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
import { app, db, auth as firebaseAuth } from '@/lib/firebase'

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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const role = ref<string | null>(null)
  const userProfile = ref<UserProfile | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => role.value === 'admin')
  const isEmployer = computed(() => role.value === 'employer')

  const initAuth = () => {
    if (!firebaseAuth || !db) {
      console.warn('Firebase is not initialized. Please configure your Firebase credentials.')
      loading.value = false
      return
    }

    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken()
          document.cookie = `__session=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`
        } catch (e) {
          console.error('Failed to set session cookie:', e)
        }

        const docRef = doc(db, 'users', firebaseUser.uid)
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
