<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  Building2,
  Heart,
  LayoutDashboard,
  User,
  FileText,
  BarChartHorizontal,
  Rocket,
  Kanban,
  MessageSquare,
  BarChart3,
  Shield,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const employeeLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Opportunities', href: '/opportunities', icon: Briefcase },
  { label: 'Employers', href: '/employers', icon: Building2 },
  { label: 'Applications', href: '/applications', icon: Kanban },
  { label: 'LaunchPad', href: '/ai-tools', icon: Rocket },
  { label: 'Saved', href: '/saved', icon: Heart },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Inbox', href: '/inbox', icon: MessageSquare },
  { label: 'Insights', href: '/insights', icon: BarChart3 },
]

const employerLinks = [
  { label: 'Dashboard', href: '/employer/dashboard', icon: Building2 },
  { label: 'Postings', href: '/employer/postings', icon: FileText },
  { label: 'Analytics', href: '/employer/analytics', icon: BarChartHorizontal },
  { label: 'Profile', href: '/employer/profile', icon: User },
  { label: 'Inbox', href: '/inbox', icon: MessageSquare },
]

const adminLinks = [
  { label: 'Admin Dashboard', href: '/admin', icon: Shield },
]

const links = computed(() => {
  if (authStore.isAdmin) return adminLinks
  if (authStore.isEmployer) return employerLinks
  return employeeLinks
})

const dashboardHref = computed(() => {
  if (authStore.isAdmin) return '/admin'
  if (authStore.isEmployer) return '/employer/dashboard'
  return '/dashboard'
})

const navigateTo = (href: string) => {
  router.push(href)
}
</script>

<template>
  <div class="w-[60px] md:w-64 bg-neutral-100 dark:bg-neutral-800 p-4 flex flex-col">
    <!-- Logo -->
    <div class="flex items-center gap-2 mb-8">
      <img
        src="https://i.postimg.cc/nLrDYrHW/icon.png"
        alt="CareerCompass logo"
        class="w-6 h-6 dark:bg-white dark:p-0.5 dark:rounded-3xl flex-shrink-0"
      />
      <span class="font-medium text-black dark:text-white hidden md:block">CareerCompass</span>
    </div>

    <!-- Navigation Links -->
    <nav class="flex flex-col gap-2 flex-1">
      <button
        v-for="link in links"
        :key="link.href"
        @click="navigateTo(link.href)"
        :class="cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700',
          route.path === link.href && 'bg-neutral-200 dark:bg-neutral-700'
        )"
      >
        <component :is="link.icon" class="h-5 w-5 flex-shrink-0" />
        <span class="hidden md:block">{{ link.label }}</span>
      </button>
    </nav>
  </div>
</template>
