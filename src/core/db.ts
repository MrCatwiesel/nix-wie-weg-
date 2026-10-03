import Dexie, { type Table } from 'dexie'
import type { Trip } from '@/modules/trip/types'
import type { Accommodation } from '@/modules/accommodation/types'
import type { Activity } from '@/modules/activity/types'
import type { TravelLeg } from '@/modules/travel/types'

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

    // Beispiel für später (M2 Packliste):
    // this.version(4).stores({
    //   packingItems: 'id, tripId, category, done'
    // })
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
