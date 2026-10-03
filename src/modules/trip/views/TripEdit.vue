<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { emptyTripDraft, tripRepository } from '../repository'
import { budgetPerPersonDay, cleanParticipants, formatMoney, tripDays, validateTrip } from '../logic'
import { TRANSPORT_LABELS, type TripDraft } from '../types'

const props = defineProps<{ id?: string }>()
const router = useRouter()

const draft = reactive<TripDraft>(emptyTripDraft())
const submitted = ref(false)
const saving = ref(false)
const isEdit = computed(() => !!props.id)

onMounted(async () => {
  if (!props.id) return
  const trip = await tripRepository.get(props.id)
  if (!trip) return router.replace('/trip')
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = trip
  Object.assign(draft, { ...rest, participants: [...(rest.participants ?? [])] })
})

const newParticipant = ref('')

function addParticipant() {
  const name = newParticipant.value.trim()
  if (!name) return
  draft.participants = cleanParticipants([...draft.participants, name])
  newParticipant.value = ''
  // Personenzahl folgt der Teilnehmerliste
  draft.travelers = Math.max(draft.travelers, draft.participants.length)
}

function removeParticipant(i: number) {
  draft.participants.splice(i, 1)
  if (draft.participants.length) draft.travelers = draft.participants.length
}

const errors = computed(() => validateTrip(draft))
const hasErrors = computed(() => Object.keys(errors.value).length > 0)

const summary = computed(() => {
  if (!draft.startDate || !draft.endDate || errors.value.endDate) return null
  const days = tripDays(draft.startDate, draft.endDate)
  const perDay = budgetPerPersonDay(draft)
  return perDay === null
    ? `${days} Tage`
    : `${days} Tage · ${formatMoney(perDay, draft.currency)} pro Person und Tag`
})

async function save() {
  submitted.value = true
  if (hasErrors.value) return
  saving.value = true
  try {
    // Leeres Zahlenfeld liefert "" – als "kein Budget" speichern.
    const budget = typeof draft.budget === 'number' && !Number.isNaN(draft.budget) ? draft.budget : null
    const participants = cleanParticipants(draft.participants)
    const travelers = participants.length || draft.travelers
    const plain: TripDraft = { ...draft, budget, participants, travelers, title: draft.title.trim(), destination: draft.destination.trim() }
    if (props.id) {
      await tripRepository.update(props.id, plain)
      router.push(`/trip/${props.id}`)
    } else {
      const id = await tripRepository.create(plain)
      router.push(`/trip/${id}`)
    }
  } finally {
    saving.value = false
  }
}

function invalid(field: keyof TripDraft) {
  return submitted.value && !!errors.value[field]
}
</script>

<template>
  <h1 class="h3 mb-3">{{ isEdit ? 'Reise bearbeiten' : 'Neue Reise' }}</h1>

  <form class="row g-3" novalidate @submit.prevent="save">
    <div class="col-12">
      <label for="title" class="form-label">Name der Reise</label>
      <input id="title" v-model="draft.title" class="form-control" :class="{ 'is-invalid': invalid('title') }"
             placeholder="z. B. Sommer am Gardasee" />
      <div class="invalid-feedback">{{ errors.title }}</div>
    </div>

    <div class="col-12">
      <label for="destination" class="form-label">Reiseziel</label>
      <input id="destination" v-model="draft.destination" class="form-control"
             :class="{ 'is-invalid': invalid('destination') }" placeholder="Ort, Region oder Land" />
      <div class="invalid-feedback">{{ errors.destination }}</div>
    </div>

    <div class="col-6">
      <label for="start" class="form-label">Von</label>
      <input id="start" v-model="draft.startDate" type="date" class="form-control"
             :class="{ 'is-invalid': invalid('startDate') }" />
      <div class="invalid-feedback">{{ errors.startDate }}</div>
    </div>
    <div class="col-6">
      <label for="end" class="form-label">Bis</label>
      <input id="end" v-model="draft.endDate" type="date" class="form-control" :min="draft.startDate"
             :class="{ 'is-invalid': invalid('endDate') }" />
      <div class="invalid-feedback">{{ errors.endDate }}</div>
    </div>

    <div class="col-12">
      <label for="participant" class="form-label">Wer reist mit?</label>
      <div v-if="draft.participants.length" class="d-flex flex-wrap gap-2 mb-2">
        <span v-for="(p, i) in draft.participants" :key="p" class="badge rounded-pill text-bg-primary d-flex align-items-center gap-1 fs-6 fw-normal">
          <i class="bi bi-person" aria-hidden="true"></i>{{ p }}
          <button type="button" class="btn-close btn-close-white ms-1" style="font-size: 0.6rem" :aria-label="`${p} entfernen`"
                  @click="removeParticipant(i)"></button>
        </span>
      </div>
      <div class="input-group">
        <input id="participant" v-model="newParticipant" class="form-control" placeholder="Name, z. B. Ich oder Anna"
               @keydown.enter.prevent="addParticipant" />
        <button type="button" class="btn btn-outline-primary" @click="addParticipant">
          <i class="bi bi-person-plus" aria-hidden="true"></i><span class="visually-hidden">Hinzufügen</span>
        </button>
      </div>
      <div class="form-text">Optional. Damit lassen sich Packliste, Medikamente und Dokumente pro Person trennen.</div>
      <div v-if="invalid('participants')" class="text-danger small">{{ errors.participants }}</div>
    </div>

    <div class="col-6 col-md-4">
      <label for="travelers" class="form-label">Personen</label>
      <input id="travelers" v-model.number="draft.travelers" type="number" min="1" step="1" class="form-control"
             :disabled="draft.participants.length > 0" :title="draft.participants.length ? 'Ergibt sich aus den Teilnehmern' : undefined"
             :class="{ 'is-invalid': invalid('travelers') }" />
      <div class="invalid-feedback">{{ errors.travelers }}</div>
    </div>
    <div class="col-6 col-md-4">
      <label for="transport" class="form-label">Anreise</label>
      <select id="transport" v-model="draft.transport" class="form-select">
        <option v-for="(label, key) in TRANSPORT_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>
    <div class="col-12 col-md-4">
      <label for="budget" class="form-label">Budget gesamt</label>
      <div class="input-group has-validation">
        <input id="budget" v-model.number="draft.budget" type="number" min="0" step="50" class="form-control"
               :class="{ 'is-invalid': invalid('budget') }" placeholder="optional" />
        <select v-model="draft.currency" class="form-select flex-grow-0 w-auto" aria-label="Währung">
          <option>EUR</option><option>CHF</option><option>USD</option><option>GBP</option>
        </select>
        <div class="invalid-feedback">{{ errors.budget }}</div>
      </div>
    </div>

    <div class="col-12">
      <label for="notes" class="form-label">Notizen</label>
      <textarea id="notes" v-model="draft.notes" rows="3" class="form-control"
                placeholder="Ideen, Wünsche, Links …"></textarea>
    </div>

    <div v-if="summary" class="col-12">
      <div class="alert alert-light border mb-0 py-2">
        <i class="bi bi-calendar-range me-1" aria-hidden="true"></i>{{ summary }}
      </div>
    </div>

    <div class="col-12 d-flex gap-2">
      <button type="submit" class="btn btn-primary" :disabled="saving">
        <i class="bi bi-check-lg me-1" aria-hidden="true"></i>Speichern
      </button>
      <button type="button" class="btn btn-outline-secondary" @click="router.back()">Abbrechen</button>
    </div>
  </form>
</template>
