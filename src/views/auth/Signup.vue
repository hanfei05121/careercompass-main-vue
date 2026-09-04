<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-vue-next'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'
import Checkbox from '@/components/ui/checkbox.vue'
import RadioGroup from '@/components/ui/radio-group.vue'
import RadioGroupItem from '@/components/ui/radio-group-item.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const { toast } = useToast()

const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

const signupSchema = toTypedSchema(
  z.object({
    fullName: z.string().min(2, { message: 'Please enter your full name.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    role: z.enum(['employee', 'employer']).default('employee'),
  })
)

// 注意：vee-validate 的 `values` 是 readonly 的，不能直接 v-model，
// 必须用 defineField 拿到的可写 ref 来绑定输入框。
const { handleSubmit, errors, values, setFieldValue, defineField } = useForm({
  validationSchema: signupSchema,
  initialValues: {
    role: 'employee',
  },
})

const [fullName] = defineField('fullName')
const [email] = defineField('email')
const [password] = defineField('password')

const onSubmit = handleSubmit(async (formValues) => {
  isLoading.value = true
  error.value = ''
  try {
    const userData = await authStore.signup(
      formValues.fullName,
      formValues.email,
      formValues.password,
      formValues.role
    )

    toast({
      title: 'Account Created',
      description: 'Your account has been successfully created. You are now logged in.',
    })

    if (userData.role === 'admin') {
      router.push('/admin')
    } else if (userData.role === 'employer') {
      router.push('/employer/dashboard')
    } else {
      router.push('/dashboard')
    }
  } catch (err: any) {
    error.value = err.message || 'Something went wrong. Please try again.'
    toast({
      title: 'Signup Failed',
      description: err.message,
      variant: 'destructive',
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen max-h-screen overflow-hidden grid lg:grid-cols-2">
    <!-- Left Content Section -->
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

      <div class="relative z-20 flex items-center gap-8 text-sm text-gray-600 dark:text-gray-700">
        <router-link to="/privacy-policy" class="hover:text-gray-900 dark:hover:text-black transition-colors">
          Privacy Policy
        </router-link>
        <router-link to="/terms" class="hover:text-gray-900 dark:hover:text-black transition-colors">
          Terms of Service
        </router-link>
      </div>
    </div>

    <!-- Right Signup Section -->
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
          <h1 class="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
          <p class="text-muted-foreground text-sm">Join CareerCompass to find your next opportunity</p>
        </div>

        <!-- Signup Form -->
        <form @submit="onSubmit" class="space-y-5">
          <div class="space-y-3">
            <Label class="text-sm font-medium">I am a...</Label>
            <RadioGroup
              :model-value="values.role"
              @update:model-value="(val) => setFieldValue('role', val)"
              class="flex gap-4"
            >
              <div class="flex items-center space-x-2 border rounded-xl px-4 py-3 flex-1 cursor-pointer hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                <RadioGroupItem value="employee" id="employee" class="sr-only" />
                <Label for="employee" class="cursor-pointer flex-1 font-medium">Job Seeker</Label>
              </div>
              <div class="flex items-center space-x-2 border rounded-xl px-4 py-3 flex-1 cursor-pointer hover:bg-muted/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                <RadioGroupItem value="employer" id="employer" class="sr-only" />
                <Label for="employer" class="cursor-pointer flex-1 font-medium">Employer</Label>
              </div>
            </RadioGroup>
          </div>

          <div class="space-y-2">
            <Label for="fullName" class="text-sm font-medium">Full Name or Company Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe or Acme Inc."
              autocomplete="off"
              v-model="fullName"
              class="h-12 bg-background border-border/60 focus:border-primary"
            />
            <p v-if="errors.fullName" class="text-sm text-destructive">{{ errors.fullName }}</p>
          </div>

          <div class="space-y-2">
            <Label for="email" class="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autocomplete="off"
              v-model="email"
              class="h-12 bg-background border-border/60 focus:border-primary"
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

          <div class="flex items-center space-x-2">
            <Checkbox id="privacy-terms" required />
            <Label for="privacy-terms" class="text-sm font-normal cursor-pointer">
              I agree to the
              <router-link to="/privacy-policy" class="text-primary underline mx-1">Privacy Policy</router-link>
              and
              <router-link to="/terms" class="text-primary underline mx-1">Terms of Service</router-link>
            </Label>
          </div>

          <div v-if="error" class="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
            {{ error }}
          </div>

          <Button type="submit" class="w-full h-12 text-base font-medium" :disabled="isLoading">
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </Button>
        </form>

        <!-- Sign In Link -->
        <div class="text-center text-sm text-muted-foreground mt-8">
          Already have an account?
          <router-link to="/login" class="text-foreground font-medium hover:underline">Sign in</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
