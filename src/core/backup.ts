import { db } from './db'

/** Alle Tabellen, die ins Backup gehören. Neue Tabellen hier ergänzen. */
export const BACKUP_TABLES = ['trips'] as const

export interface BackupFile {
  app: 'nix-wie-weg'
  format: 1
  exportedAt: string
  tables: Record<string, unknown[]>
}

/** Exportiert alle Daten als JSON-Objekt (Sicherung, Gerätewechsel). */
export async function exportBackup(): Promise<BackupFile> {
  const tables: Record<string, unknown[]> = {}
  for (const name of BACKUP_TABLES) {
    tables[name] = await db.table(name).toArray()
  }
  return { app: 'nix-wie-weg', format: 1, exportedAt: new Date().toISOString(), tables }
}

/** Spielt ein Backup ein. Vorhandene Einträge mit gleicher ID werden überschrieben. */
export async function importBackup(file: BackupFile): Promise<number> {
  if (file.app !== 'nix-wie-weg' || file.format !== 1) {
    throw new Error('Unbekanntes Backup-Format.')
  }
  let count = 0
  await db.transaction('rw', BACKUP_TABLES.map((t) => db.table(t)), async () => {
    for (const name of BACKUP_TABLES) {
      const rows = file.tables[name] ?? []
      await db.table(name).bulkPut(rows)
      count += rows.length
    }
  })
  return count
}

/** Startet im Browser den Download einer JSON-Datei. */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
