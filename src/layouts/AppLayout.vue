<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
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
          <!-- Notifications, Theme toggle, User nav -->
        </div>
      </header>
      <main class="flex-1 p-4 md:p-6 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
