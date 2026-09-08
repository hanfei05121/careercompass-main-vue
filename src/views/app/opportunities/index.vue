<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardTitle from '@/components/ui/card-title.vue'
import CardContent from '@/components/ui/card-content.vue'
import Input from '@/components/ui/input.vue'
import Select from '@/components/ui/select.vue'
import { Loader2, SlidersHorizontal } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import OpportunityCard from './components/OpportunityCard.vue'
import { DEMO_OPPORTUNITIES, type Opportunity } from './types'

const router = useRouter()
const opportunities = ref<Opportunity[]>([])
const loading = ref(true)
const locationFilter = ref('')
const typeFilter = ref('')
const searchQuery = ref('')

onMounted(async () => {
  // db 是模块级绑定，TS 不会在闭包内保留非空收窄，这里转存为 const
  const firestore = db
  if (!firestore) {
    console.warn('Firebase not configured. Showing demo opportunities.')
    opportunities.value = DEMO_OPPORTUNITIES
    loading.value = false
    return
  }

  try {
    const q = query(
      collection(firestore, 'opportunities'),
      where('status', '==', 'Active'),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    opportunities.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Opportunity[]
  } catch (error) {
    console.error('Error fetching opportunities:', error)
  } finally {
    loading.value = false
  }
})

const viewOpportunity = (id: string) => {
  router.push(`/opportunities/detail/${id}`)
}
</script>

<template>
  <div class="container mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-bold tracking-tight">Browse Opportunities</h1>
      <p class="text-muted-foreground">Find your next great opportunity.</p>
    </div>

    <Card class="mb-6 rounded-3xl">
      <CardHeader>
        <CardTitle class="text-lg flex items-center gap-2">
          <SlidersHorizontal class="h-5 w-5" />
          Filter Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            v-model="searchQuery"
            placeholder="Search opportunities..."
          />
          <Input
            v-model="locationFilter"
            placeholder="Filter by location..."
          />
          <Select v-model="typeFilter">
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Volunteer">Volunteer</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <div v-if="loading" class="flex justify-center items-center py-10">
      <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>

    <div v-else-if="opportunities.length === 0" class="text-center py-20 text-muted-foreground">
      <p>No opportunities found.</p>
    </div>

    <div v-else class="grid gap-4">
      <OpportunityCard
        v-for="opp in opportunities"
        :key="opp.id"
        :opportunity="opp"
        @click="viewOpportunity"
      />
    </div>
  </div>
</template>
