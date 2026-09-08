<script setup lang="ts">
import Card from '@/components/ui/card.vue'
import CardContent from '@/components/ui/card-content.vue'
import Button from '@/components/ui/button.vue'
import Badge from '@/components/ui/badge.vue'
import { MapPin, Heart } from 'lucide-vue-next'
import type { Opportunity } from '../types'

defineProps<{ opportunity: Opportunity }>()

const emit = defineEmits<{ (e: 'click', id: string): void }>()
</script>

<template>
  <Card
    class="hover:shadow-lg transition-shadow cursor-pointer"
    @click="emit('click', opportunity.id)"
  >
    <CardContent class="p-6">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="font-semibold text-lg mb-1">{{ opportunity.title }}</h3>
          <p class="text-muted-foreground mb-2">{{ opportunity.employerName }}</p>
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <span class="flex items-center gap-1">
              <MapPin class="h-4 w-4" />
              {{ opportunity.location || 'Remote' }}
            </span>
            <Badge variant="secondary">{{ opportunity.type }}</Badge>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Heart class="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
