import Dexie, { type Table } from 'dexie'
import type { Trip } from '@/modules/trip/types'
import type { Accommodation } from '@/modules/accommodation/types'
import type { Activity } from '@/modules/activity/types'
import type { TravelLeg } from '@/modules/travel/types'
import type { PackingItem } from '@/modules/packing/types'
import type { Medication, Vaccination } from '@/modules/meds/types'
import type { EmergencyContact, TravelDocument } from '@/modules/documents/types'
import type { WeatherCache } from '@/modules/dayplanner/types'
import type { JournalEntry, Photo } from '@/modules/journal/types'

/**
 * Lokale Datenbank (IndexedDB) – die einzige Stelle, an der das Schema steht.
 *
 * Regeln für Änderungen:
 *  - Bestehende `version(n)`-Aufrufe NIE ändern.
 *  - Neue Tabellen oder Indizes => neue `version(n + 1)` darunter anlegen,
 *    bei Bedarf mit `.upgrade(tx => ...)` für die Datenmigration.
 *  - Neue Tabelle auch in `BACKUP_TABLES` (core/backup.ts) eintragen.
 */
export class NixDb extends Dexie {
  trips!: Table<Trip, string>
  accommodations!: Table<Accommodation, string>
  activities!: Table<Activity, string>
  travelLegs!: Table<TravelLeg, string>
  packingItems!: Table<PackingItem, string>
  medications!: Table<Medication, string>
  vaccinations!: Table<Vaccination, string>
  documents!: Table<TravelDocument, string>
  emergencyContacts!: Table<EmergencyContact, string>
  weather!: Table<WeatherCache, string>
  journalEntries!: Table<JournalEntry, string>
  photos!: Table<Photo, string>

  constructor() {
    super('nix-wie-weg')

    // v1: Modul "Reiseprojekt"
    this.version(1).stores({
      trips: 'id, startDate, updatedAt'
    })

    // v2: Module "Unterkünfte" und "Unternehmungen"
    this.version(2).stores({
      accommodations: 'id, tripId, checkIn',
      activities: 'id, tripId, status, priority'
    })

    // v3: Modul "Anreise"
    this.version(3).stores({
      travelLegs: 'id, tripId'
    })

    // v4: Modul "Packliste"
    this.version(4).stores({
      packingItems: 'id, tripId'
    })

    // v5: Modul "Reiseapotheke"
    this.version(5).stores({
      medications: 'id, tripId',
      vaccinations: 'id, tripId'
    })

    // v6: Modul "Dokumente & Notfall"
    this.version(6).stores({
      documents: 'id, tripId',
      emergencyContacts: 'id, tripId'
    })

    // v7: Teilnehmer pro Reise (kein neuer Index, nur Datenmigration)
    this.version(7)
      .stores({})
      .upgrade((tx) =>
        tx
          .table('trips')
          .toCollection()
          .modify((t: { participants?: string[] }) => {
            if (!Array.isArray(t.participants)) t.participants = []
          })
      )

    // v8: Tagesplaner – zuletzt geladene Wettervorhersage je Reise (nicht im Backup, wird neu geladen)
    this.version(8).stores({
      weather: 'tripId'
    })

    // v9: Reisetagebuch mit Fotos (Fotos als Blob, verkleinert)
    this.version(9).stores({
      journalEntries: 'id, tripId, date',
      photos: 'id, tripId, entryId'
    })

    // Nächste Änderung: this.version(10).stores({ … })
  }
}

export const db = new NixDb()

/** Erzeugt eine eindeutige ID, auch offline. */
export function newId(): string {
  return crypto.randomUUID()
}

/** Zeitstempel im ISO-Format für createdAt/updatedAt. */
export function now(): string {
  return new Date().toISOString()
}
