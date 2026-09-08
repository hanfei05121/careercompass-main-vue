<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import LangSwitch from '@/components/common/LangSwitch.vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const { t } = useI18n()
const router = useRouter()

/** 退出登录并回到登录页 */
const handleLogout = async () => {
  await authStore.logout()
  ElMessage.success(t('auth.logoutSuccess'))
  router.replace('/auth/login')
}
</script>

<template>
  <div class="flex h-screen w-full flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
    <AppSidebar />
    <div class="flex flex-1 flex-col overflow-hidden rounded-l-3xl bg-white dark:bg-neutral-900">
      <header class="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 dark:border-neutral-700 px-4 sm:h-auto sm:px-6 py-2 border-b">
        <div class="flex-1" />
        <div class="flex-1 flex justify-center max-w-xl">
          <!-- Search bar placeholder -->
        </div>
        <div class="flex-1 flex items-center justify-end gap-4">
          <LangSwitch />
          <el-dropdown v-if="authStore.isAuthenticated" trigger="click">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-card text-sm font-semibold uppercase"
            >
              {{ (authStore.userProfile?.displayName ?? 'U').slice(0, 1) }}
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  {{ authStore.userProfile?.email }}
                </el-dropdown-item>
                <el-dropdown-item divided @click="router.push('/profile')">
                  {{ t('menu.profile') }}
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">
                  {{ t('common.signOut') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <main class="flex-1 p-4 md:p-6 overflow-auto">
        <RouterView v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
