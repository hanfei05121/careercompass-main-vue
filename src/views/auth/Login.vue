<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-vue-next'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'
import Checkbox from '@/components/ui/checkbox.vue'
import AnimatedCharacters from '@/components/ui/animated-characters.vue'
import InteractiveHoverButton from '@/components/ui/interactive-hover-button.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { toast } = useToast()

const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')
const isTyping = ref(false)

const loginSchema = toTypedSchema(
  z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  })
)

// 注意：vee-validate 暴露的 `values` 是 readonly 的，不能直接 v-model。
// 必须用 defineField 拿到可写的字段 ref，否则 passwordLength 永远是 0，
// 左侧动画收不到任何密码输入信号。
const { handleSubmit, errors, defineField } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: '',
    password: '',
  },
})

const [email] = defineField('email')
const [password] = defineField('password')

const navigateAfterLogin = (role?: string) => {
  const redirect = route.query.redirect as string
  if (redirect) {
    router.push(redirect)
    return
  }
  if (role === 'admin') {
    router.push('/admin')
  } else if (role === 'employer') {
    router.push('/employer/dashboard')
  } else {
    router.push('/dashboard')
  }
}

const onSubmit = handleSubmit(async (formValues) => {
  isLoading.value = true
  error.value = ''
  try {
    const userDocSnap = await authStore.login(formValues.email, formValues.password)
    const role = userDocSnap.exists() ? userDocSnap.data().role : undefined
    navigateAfterLogin(role)
  } catch (err: any) {
    error.value = err.message || 'Invalid email or password. Please try again.'
    toast({
      title: 'Login Failed',
      description: err.message,
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
})

const handleGoogleSignIn = async () => {
  try {
    const userDocSnap = await authStore.loginWithGoogle()
    const role = userDocSnap.exists() ? userDocSnap.data().role : undefined
    navigateAfterLogin(role)
  } catch (err: any) {
    toast({
      title: 'Google Sign-In Failed',
      description: err.message,
      variant: 'destructive',
    })
  }
}
</script>

<template>
  <div class="min-h-screen max-h-screen overflow-hidden grid lg:grid-cols-2">
    <!-- Left Content Section with Animated Characters -->
    <div class="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 dark:from-white/90 dark:via-white/80 dark:to-white/70 p-12 text-white dark:text-gray-900">
      <div class="relative z-20">
        <router-link to="/" class="flex items-center gap-2 text-lg font-semibold">
          <img
            src="https://i.postimg.cc/nLrDYrHW/icon.png"
            alt="CareerCompass logo"
            class="w-8 h-8 bg-white/10 backdrop-blur-sm p-1 rounded-lg"
          />
          <span>CareerCompass</span>
        </router-link>
      </div>

      <div class="relative z-20 flex items-end justify-center h-[500px]">
        <AnimatedCharacters
          :isTyping="isTyping"
          :showPassword="showPassword"
          :passwordLength="password?.length || 0"
        />
      </div>

      <div class="relative z-20 flex items-center gap-8 text-sm text-gray-600 dark:text-gray-700">
        <router-link to="/privacy-policy" class="hover:text-gray-900 dark:hover:text-black transition-colors">
          Privacy Policy
        </router-link>
        <router-link to="/terms" class="hover:text-gray-900 dark:hover:text-black transition-colors">
          Terms of Service
        </router-link>
      </div>

      <!-- Decorative elements -->
      <div class="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div class="absolute top-1/4 right-1/4 size-64 bg-gray-400/20 dark:bg-gray-300/30 rounded-full blur-3xl" />
      <div class="absolute bottom-1/4 left-1/4 size-96 bg-gray-300/20 dark:bg-gray-200/20 rounded-full blur-3xl" />
    </div>

    <!-- Right Login Section -->
    <div class="flex items-center justify-center p-8 bg-background">
      <div class="w-full max-w-[420px]">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
          <img
            src="https://i.postimg.cc/nLrDYrHW/icon.png"
            alt="CareerCompass logo"
            class="w-8 h-8 dark:bg-white dark:p-1 dark:rounded-md"
          />
          <span>CareerCompass</span>
        </div>

        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-3xl font-bold tracking-tight mb-2">Welcome back!</h1>
          <p class="text-muted-foreground text-sm">Please enter your details</p>
        </div>

        <!-- Login Form -->
        <form @submit="onSubmit" class="space-y-5">
          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="off"
              v-model="email"
              class="h-12 bg-background border-border/60 focus:border-primary"
              @focus="isTyping = true"
              @blur="isTyping = false"
            />
            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-sm font-medium">Password</Label>
            <div class="relative">
              <Input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                v-model="password"
                class="h-12 pr-10 bg-background border-border/60 focus:border-primary"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <EyeOff v-if="showPassword" class="h-5 w-5" />
                <Eye v-else class="h-5 w-5" />
              </button>
            </div>
            <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label for="remember" class="text-sm font-normal cursor-pointer">
                Remember for 30 days
              </Label>
            </div>
            <router-link to="/forgot-password" class="text-sm text-primary hover:underline font-medium">
              Forgot password?
            </router-link>
          </div>

          <div v-if="error" class="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
            {{ error }}
          </div>

          <InteractiveHoverButton
            type="submit"
            :text="isLoading ? 'Signing in...' : 'Log in'"
            class="w-full h-12 text-base font-medium"
            :disabled="isLoading"
          />
        </form>

        <!-- Social Login -->
        <div class="mt-6">
          <InteractiveHoverButton
            type="button"
            text="Log in with Google"
            class="w-full h-12 border-border/60"
            @click="handleGoogleSignIn"
          >
            <template #icon>
              <svg class="h-5 w-5" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 76.2C322.3 113.2 289.4 96 248 96c-88.8 0-160.1 71.9-160.1 160.1s71.3 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
              </svg>
            </template>
          </InteractiveHoverButton>
        </div>

        <!-- Sign Up Link -->
        <div class="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?
          <router-link to="/signup" class="text-foreground font-medium hover:underline">
            Sign Up
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
