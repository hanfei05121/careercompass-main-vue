<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { cn } from '@/utils'
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
const { t } = useI18n()

interface SidebarLink {
  /** i18n key（menu.*） */
  labelKey: string
  href: string
  icon: typeof LayoutDashboard
}

const employeeLinks: SidebarLink[] = [
  { labelKey: 'menu.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { labelKey: 'menu.opportunities', href: '/opportunities', icon: Briefcase },
  { labelKey: 'menu.employers', href: '/employers', icon: Building2 },
  { labelKey: 'menu.applications', href: '/applications', icon: Kanban },
  { labelKey: 'menu.aiTools', href: '/ai-tools', icon: Rocket },
  { labelKey: 'menu.saved', href: '/saved', icon: Heart },
  { labelKey: 'menu.profile', href: '/profile', icon: User },
  { labelKey: 'menu.inbox', href: '/inbox', icon: MessageSquare },
  { labelKey: 'menu.insights', href: '/insights', icon: BarChart3 },
]

const employerLinks: SidebarLink[] = [
  { labelKey: 'menu.employerDashboard', href: '/employer/dashboard', icon: Building2 },
  { labelKey: 'menu.postings', href: '/employer/postings', icon: FileText },
  { labelKey: 'menu.analytics', href: '/employer/analytics', icon: BarChartHorizontal },
  { labelKey: 'menu.employerProfile', href: '/employer/profile', icon: User },
  { labelKey: 'menu.inbox', href: '/inbox', icon: MessageSquare },
]

const adminLinks: SidebarLink[] = [{ labelKey: 'menu.admin', href: '/admin', icon: Shield }]

const links = computed(() => {
  if (authStore.isAdmin) return adminLinks
  if (authStore.isEmployer) return employerLinks
  return employeeLinks
})

/** 按角色取首页路径 */
const dashboardHref = computed(() => links.value[0]?.href ?? '/dashboard')

const navigateTo = (href: string) => {
  router.push(href)
}
</script>

<template>
  <div class="w-[60px] md:w-64 bg-neutral-100 dark:bg-neutral-800 p-4 flex flex-col">
    <!-- Logo -->
    <router-link :to="dashboardHref" class="flex items-center gap-2 mb-8">
      <img
        src="https://i.postimg.cc/nLrDYrHW/icon.png"
        alt="CareerCompass logo"
        class="w-6 h-6 dark:bg-white dark:p-0.5 dark:rounded-3xl flex-shrink-0"
      />
      <span class="font-medium text-black dark:text-white hidden md:block">
        {{ t('common.appName') }}
      </span>
    </router-link>

    <!-- Navigation Links -->
    <nav class="flex flex-col gap-2 flex-1">
      <button
        v-for="link in links"
        :key="link.href"
        type="button"
        :title="t(link.labelKey)"
        @click="navigateTo(link.href)"
        :class="cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700',
          route.path === link.href && 'bg-neutral-200 dark:bg-neutral-700'
        )"
      >
        <component :is="link.icon" class="h-5 w-5 flex-shrink-0" />
        <span class="hidden md:block">{{ t(link.labelKey) }}</span>
      </button>
    </nav>
  </div>
</template>
