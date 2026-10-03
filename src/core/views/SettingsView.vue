<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { downloadJson, exportBackup, importBackup, type BackupFile } from '../backup'
import { formatBytes, requestPersistentStorage, storageInfo, type StorageInfo } from '../storage'

const message = ref<{ type: 'success' | 'danger'; text: string } | null>(null)
const includePhotos = ref(false)
const busy = ref(false)
const storage = ref<StorageInfo | null>(null)

async function refreshStorage() {
  storage.value = await storageInfo()
}
onMounted(refreshStorage)

async function doExport() {
  busy.value = true
  try {
    const data = await exportBackup({ includeLarge: includePhotos.value })
    const suffix = includePhotos.value ? '-mit-fotos' : ''
    downloadJson(data, `nix-wie-weg-backup-${data.exportedAt.slice(0, 10)}${suffix}.json`)
    message.value = { type: 'success', text: 'Backup wurde heruntergeladen.' }
  } catch (err) {
    message.value = { type: 'danger', text: `Export fehlgeschlagen: ${(err as Error).message}` }
  } finally {
    busy.value = false
  }
}

async function doImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  busy.value = true
  try {
    const data = JSON.parse(await file.text()) as BackupFile
    const count = await importBackup(data)
    message.value = { type: 'success', text: `${count} Einträge wiederhergestellt.` }
    await refreshStorage()
  } catch (err) {
    message.value = { type: 'danger', text: `Import fehlgeschlagen: ${(err as Error).message}` }
  } finally {
    input.value = ''
    busy.value = false
  }
}

async function persist() {
  const ok = await requestPersistentStorage()
  await refreshStorage()
  message.value = ok
    ? { type: 'success', text: 'Der Browser behält die Daten jetzt dauerhaft.' }
    : { type: 'danger', text: 'Der Browser hat abgelehnt. Tipp: App über „Teilen → Zum Home-Bildschirm“ installieren und dort öffnen.' }
}
</script>

<template>
  <h1 class="h3 mb-3">Einstellungen</h1>

  <div v-if="message" class="alert" :class="`alert-${message.type}`">{{ message.text }}</div>

  <section class="card mb-3">
    <div class="card-body">
      <h2 class="h5">Datensicherung</h2>
      <p class="text-body-secondary small">
        Alle Daten liegen nur auf diesem Gerät. Sichere sie regelmäßig als Datei –
        damit kannst du sie auch auf ein anderes Gerät übertragen.
      </p>
      <div class="form-check form-switch mb-2">
        <input id="photos" v-model="includePhotos" class="form-check-input" type="checkbox" role="switch" />
        <label class="form-check-label" for="photos">Fotos mitsichern (Datei wird deutlich größer)</label>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-primary" :disabled="busy" @click="doExport">
          <span v-if="busy" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
          <i v-else class="bi bi-download me-1" aria-hidden="true"></i>Backup exportieren
        </button>
        <label class="btn btn-outline-secondary mb-0" :class="{ disabled: busy }">
          <i class="bi bi-upload me-1" aria-hidden="true"></i>Backup importieren
          <input type="file" accept="application/json" class="d-none" @change="doImport" />
        </label>
      </div>
    </div>
  </section>

  <section class="card mb-3">
    <div class="card-body">
      <h2 class="h5">Speicher</h2>
      <p v-if="storage?.usedBytes != null" class="small mb-1">
        Belegt: <strong>{{ formatBytes(storage.usedBytes) }}</strong>
        <template v-if="storage.quotaBytes"> von ca. {{ formatBytes(storage.quotaBytes) }} verfügbar</template>
      </p>
      <p class="small mb-2">
        <template v-if="storage?.persisted">
          <i class="bi bi-shield-check text-success me-1" aria-hidden="true"></i>Daten werden dauerhaft behalten.
        </template>
        <template v-else>
          <i class="bi bi-exclamation-triangle text-warning me-1" aria-hidden="true"></i>
          Der Browser darf die Daten bei Platzmangel löschen. Regelmäßig sichern!
        </template>
      </p>
      <button v-if="!storage?.persisted" type="button" class="btn btn-sm btn-outline-primary" @click="persist">
        Dauerhaft speichern anfragen
      </button>
    </div>
  </section>

  <section class="card">
    <div class="card-body">
      <h2 class="h5">Über „Nix wie weg“</h2>
      <p class="small text-body-secondary mb-0">
        Version {{ '0.10.0' }} · Freie Software, entwickelt in der Freizeit.
        Wenn dir die App hilft, freuen wir uns über eine Spende.
      </p>
    </div>
  </section>
</template>
