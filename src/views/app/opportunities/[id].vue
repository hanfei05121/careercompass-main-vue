<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const opportunityId = route.params.id
</script>

<template>
  <div class="container mx-auto">
    <h1 class="text-3xl font-bold tracking-tight mb-6">职位详情</h1>
    <p class="text-muted-foreground">职位 ID：{{ opportunityId }}</p>
  </div>
</template>
