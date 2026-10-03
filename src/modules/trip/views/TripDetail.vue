<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLiveQuery } from '@/core/composables'
import { tripRepository } from '../repository'
import { budgetPerPersonDay, daysUntil, formatDate, formatMoney, tripDays } from '../logic'
import { TRANSPORT_LABELS, type Trip } from '../types'

const props = defineProps<{ id: string }>()
const router = useRouter()

const trip = useLiveQuery(() => tripRepository.get(props.id), undefined as Trip | undefined)

const facts = computed(() => {
  const t = trip.value
  if (!t) return []
  const perDay = budgetPerPersonDay(t)
  return [
    { icon: 'calendar-range', label: 'Zeitraum', value: `${formatDate(t.startDate)} – ${formatDate(t.endDate)} (${tripDays(t.startDate, t.endDate)} Tage)` },
    { icon: 'people', label: 'Personen', value: String(t.travelers) },
    { icon: 'signpost-split', label: 'Anreise', value: TRANSPORT_LABELS[t.transport] },
    {
      icon: 'wallet2',
      label: 'Budget',
      value: t.budget ? `${formatMoney(t.budget, t.currency)} (${formatMoney(perDay!, t.currency)} p. P./Tag)` : 'nicht festgelegt'
    }
  ]
})

/** Platzhalter für die kommenden Module – zeigt die Roadmap direkt in der App. */
const upcoming = [
  { icon: 'house-door', title: 'Unterkünfte', milestone: 'M1' },
  { icon: 'star', title: 'Unternehmungen', milestone: 'M1' },
  { icon: 'backpack', title: 'Packliste', milestone: 'M2' },
  { icon: 'capsule', title: 'Medikamente', milestone: 'M2' },
  { icon: 'cloud-sun', title: 'Tagesplaner', milestone: 'M3' },
  { icon: 'journal-richtext', title: 'Tagebuch', milestone: 'M4' },
  { icon: 'globe2', title: 'Reise-Webseite', milestone: 'M5' }
]

async function remove() {
  if (!trip.value) return
  if (!confirm(`„${trip.value.title}“ wirklich löschen?`)) return
  await tripRepository.remove(props.id)
  router.replace('/trip')
}
</script>

<template>
  <div v-if="trip">
    <div class="d-flex align-items-start justify-content-between gap-2 mb-3">
      <div>
        <h1 class="h3 mb-1">{{ trip.title }}</h1>
        <p class="text-body-secondary mb-0">
          <i class="bi bi-geo-alt me-1" aria-hidden="true"></i>{{ trip.destination }}
          <span v-if="daysUntil(trip.startDate) > 0"> · noch {{ daysUntil(trip.startDate) }} Tage</span>
        </p>
      </div>
      <div class="dropdown">
        <button class="btn btn-outline-secondary" data-bs-toggle="dropdown" aria-label="Aktionen">
          <i class="bi bi-three-dots" aria-hidden="true"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><RouterLink class="dropdown-item" :to="`/trip/${trip.id}/bearbeiten`">Bearbeiten</RouterLink></li>
          <li><button class="dropdown-item text-danger" @click="remove">Löschen</button></li>
        </ul>
      </div>
    </div>

    <ul class="list-group mb-4">
      <li v-for="f in facts" :key="f.label" class="list-group-item d-flex gap-3">
        <i :class="`bi bi-${f.icon} text-primary`" aria-hidden="true"></i>
        <div>
          <div class="small text-body-secondary">{{ f.label }}</div>
          <div>{{ f.value }}</div>
        </div>
      </li>
    </ul>

    <div v-if="trip.notes" class="mb-4">
      <h2 class="h6 text-body-secondary">Notizen</h2>
      <p class="mb-0" style="white-space: pre-line">{{ trip.notes }}</p>
    </div>

    <h2 class="h6 text-body-secondary">Bald verfügbar</h2>
    <div class="row g-2">
      <div v-for="m in upcoming" :key="m.title" class="col-6 col-md-3">
        <div class="border rounded p-3 h-100 text-body-secondary">
          <i :class="`bi bi-${m.icon} fs-4 d-block mb-1`" aria-hidden="true"></i>
          <div class="small">{{ m.title }}</div>
          <span class="badge text-bg-light border">{{ m.milestone }}</span>
        </div>
      </div>
    </div>
  </div>

  <p v-else class="text-body-secondary">Reise wird geladen …</p>
</template>
