<script setup lang="ts">
import { useLiveQuery } from '@/core/composables'
import { tripRepository } from '../repository'
import { daysUntil, formatDate, tripDays, tripPhase } from '../logic'
import type { Trip } from '../types'

const trips = useLiveQuery(() => tripRepository.listAll(), [] as Trip[])

const phaseBadge = {
  planung: { label: 'In Planung', cls: 'text-bg-primary' },
  unterwegs: { label: 'Unterwegs', cls: 'text-bg-success' },
  vorbei: { label: 'Erinnerung', cls: 'text-bg-secondary' }
} as const

function subline(t: Trip): string {
  const d = daysUntil(t.startDate)
  if (d > 1) return `noch ${d} Tage`
  if (d === 1) return 'morgen geht es los'
  return `${tripDays(t.startDate, t.endDate)} Tage`
}
</script>

<template>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h1 class="h3 mb-0">Meine Reisen</h1>
    <RouterLink to="/trip/neu" class="btn btn-primary">
      <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Neue Reise
    </RouterLink>
  </div>

  <div v-if="trips.length === 0" class="text-center py-5 text-body-secondary">
    <i class="bi bi-globe-europe-africa display-4 d-block mb-3" aria-hidden="true"></i>
    <p class="mb-3">Noch keine Reise angelegt.</p>
    <RouterLink to="/trip/neu" class="btn btn-outline-primary">Erste Reise planen</RouterLink>
  </div>

  <div v-else class="row g-3">
    <div v-for="t in trips" :key="t.id" class="col-12 col-md-6 col-lg-4">
      <RouterLink :to="`/trip/${t.id}`" class="card h-100 text-decoration-none trip-card">
        <div class="card-body">
          <span class="badge mb-2" :class="phaseBadge[tripPhase(t.startDate, t.endDate)].cls">
            {{ phaseBadge[tripPhase(t.startDate, t.endDate)].label }}
          </span>
          <h2 class="h5 card-title mb-1">{{ t.title }}</h2>
          <p class="mb-2 text-body-secondary">
            <i class="bi bi-geo-alt me-1" aria-hidden="true"></i>{{ t.destination }}
          </p>
          <p class="small mb-0">
            {{ formatDate(t.startDate) }} – {{ formatDate(t.endDate) }} · {{ subline(t) }}
          </p>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.trip-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.trip-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--bs-box-shadow-sm);
}
</style>
