<script setup lang="ts">
import { computed } from 'vue'
import { useLiveQuery } from '@/core/composables'
import { tripRepository } from '../repository'
import { participantsOf } from '../logic'
import type { Trip } from '../types'

/**
 * Auswahl "Für wen?" – nutzt die Teilnehmer der Reise.
 * Ohne Teilnehmer erscheint ein freies Textfeld (wie bisher).
 * Leerer Wert = für alle / gemeinsam.
 */
const props = defineProps<{ tripId: string; inputId?: string }>()
const model = defineModel<string>({ required: true })

const trip = useLiveQuery(() => tripRepository.get(props.tripId), undefined as Trip | undefined)
const people = computed(() => participantsOf(trip.value))
/** Ein früher frei eingetragener Name, der nicht (mehr) in der Teilnehmerliste steht, bleibt wählbar. */
const extra = computed(() => (model.value && !people.value.includes(model.value) ? [model.value] : []))
</script>

<template>
  <select v-if="people.length" :id="inputId" v-model="model" class="form-select">
    <option value="">Alle / gemeinsam</option>
    <option v-for="p in [...people, ...extra]" :key="p" :value="p">{{ p }}</option>
  </select>
  <input v-else :id="inputId" v-model="model" class="form-control" placeholder="leer = für alle" />
</template>
