<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const email = authStore.userProfile?.email ?? authStore.user?.email ?? ''
const name =
  authStore.userProfile?.firstName ||
  authStore.userProfile?.displayName?.split(' ')[0] ||
  'there'
</script>

<template>
  <div class="container mx-auto space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Community Feed</h1>
      <p class="text-muted-foreground">Stay connected with the career community.</p>
    </div>

    <!-- Welcome card -->
    <div class="rounded-3xl border border-border/60 bg-card p-6 md:p-8">
      <p class="text-sm text-muted-foreground mb-1">Signed in as</p>
      <p class="text-xl font-semibold mb-2">{{ name }}</p>
      <p class="text-muted-foreground break-all">{{ email }}</p>
      <p class="mt-4 text-sm text-muted-foreground">
        You're now inside the platform. Use the sidebar to explore — most pages are placeholders
        waiting to be connected to real data.
      </p>
    </div>
  </div>
</template>
