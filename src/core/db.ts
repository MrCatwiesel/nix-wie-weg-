import Dexie, { type Table } from 'dexie'
import type { Trip } from '@/modules/trip/types'

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

  constructor() {
    super('nix-wie-weg')

    // v1: Modul "Reiseprojekt"
    this.version(1).stores({
      trips: 'id, startDate, updatedAt'
    })

    // Beispiel für später (M2 Packliste):
    // this.version(2).stores({
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
