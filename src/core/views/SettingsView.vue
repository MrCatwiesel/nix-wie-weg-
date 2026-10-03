<script setup lang="ts">
import { ref } from 'vue'
import { downloadJson, exportBackup, importBackup, type BackupFile } from '../backup'

const message = ref<{ type: 'success' | 'danger'; text: string } | null>(null)

async function doExport() {
  const data = await exportBackup()
  downloadJson(data, `nix-wie-weg-backup-${data.exportedAt.slice(0, 10)}.json`)
  message.value = { type: 'success', text: 'Backup wurde heruntergeladen.' }
}

async function doImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const data = JSON.parse(await file.text()) as BackupFile
    const count = await importBackup(data)
    message.value = { type: 'success', text: `${count} Einträge wiederhergestellt.` }
  } catch (err) {
    message.value = { type: 'danger', text: `Import fehlgeschlagen: ${(err as Error).message}` }
  } finally {
    input.value = ''
  }
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
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-primary" @click="doExport">
          <i class="bi bi-download me-1" aria-hidden="true"></i>Backup exportieren
        </button>
        <label class="btn btn-outline-secondary mb-0">
          <i class="bi bi-upload me-1" aria-hidden="true"></i>Backup importieren
          <input type="file" accept="application/json" class="d-none" @change="doImport" />
        </label>
      </div>
    </div>
  </section>

  <section class="card">
    <div class="card-body">
      <h2 class="h5">Über „Nix wie weg“</h2>
      <p class="small text-body-secondary mb-0">
        Version {{ '0.6.0' }} · Freie Software, entwickelt in der Freizeit.
        Wenn dir die App hilft, freuen wir uns über eine Spende.
      </p>
    </div>
  </section>
</template>
