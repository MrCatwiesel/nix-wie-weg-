import { addDays, diffDays, todayIso } from '../../core/dates'
import { MOODS, type JournalEntry, type JournalEntryDraft, type Photo } from './types'

export function emptyEntryDraft(date = ''): JournalEntryDraft {
  return { date, title: '', text: '', mood: 0, location: '', highlight: false }
}

/** Tag für einen neuen Eintrag: heute während der Reise, davor der erste, danach der letzte Tag. */
export function defaultEntryDate(start: string, end: string, today: Date = new Date()): string {
  const t = todayIso(today)
  if (t < start) return start
  if (t > end) return end
  return t
}

/** Ein Eintrag braucht ein Datum und irgendeinen Inhalt (Titel, Text oder Foto). */
export function validateEntry(d: JournalEntryDraft, photoCount: number): Partial<Record<keyof JournalEntryDraft | 'content', string>> {
  const e: Partial<Record<keyof JournalEntryDraft | 'content', string>> = {}
  if (!d.date) e.date = 'Bitte ein Datum wählen.'
  if (!d.title.trim() && !d.text.trim() && photoCount === 0) e.content = 'Schreib etwas oder füge ein Foto hinzu.'
  return e
}

/** Kurzfassung für die Übersicht, an Wortgrenze gekürzt. */
export function excerpt(text: string, max = 140): string {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,.;:!?-]+$/, '')} …`
}

export function moodOf(value: number) {
  return MOODS.find((m) => m.value === value)
}

export interface DayGroup {
  date: string
  /** Tag n der Reise (1-basiert) oder null außerhalb */
  dayNumber: number | null
  entries: JournalEntry[]
}

/**
 * Alle Reisetage mit ihren Einträgen (auch leere Tage, damit man sieht, wo noch etwas fehlt).
 * Einträge außerhalb des Zeitraums kommen ebenfalls hinein.
 */
export function entriesByDay(start: string, end: string, entries: JournalEntry[]): DayGroup[] {
  const map = new Map<string, JournalEntry[]>()
  for (const e of entries) map.set(e.date, [...(map.get(e.date) ?? []), e])
  const days = new Set<string>()
  for (let d = start; d <= end; d = addDays(d, 1)) days.add(d)
  for (const d of map.keys()) days.add(d)
  return [...days]
    .sort()
    .map((date) => ({
      date,
      dayNumber: date >= start && date <= end ? diffDays(start, date) + 1 : null,
      entries: (map.get(date) ?? []).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    }))
}

export interface JournalStats {
  entries: number
  photos: number
  highlights: number
  /** Reisetage mit mindestens einem Eintrag */
  daysWritten: number
}

export function journalStats(entries: JournalEntry[], photoCount: number): JournalStats {
  return {
    entries: entries.length,
    photos: photoCount,
    highlights: entries.filter((e) => e.highlight).length,
    daysWritten: new Set(entries.map((e) => e.date)).size
  }
}

/** Fotos in der gespeicherten Reihenfolge; unbekannte hinten nach Zeit. */
export function orderPhotos<T extends Pick<Photo, 'id' | 'takenAt'>>(photoIds: string[], photos: T[]): T[] {
  const pos = new Map(photoIds.map((id, i) => [id, i]))
  return [...photos].sort((a, b) => {
    const pa = pos.get(a.id) ?? Number.MAX_SAFE_INTEGER
    const pb = pos.get(b.id) ?? Number.MAX_SAFE_INTEGER
    return pa - pb || a.takenAt.localeCompare(b.takenAt)
  })
}

/** Verschiebt ein Element um eine Position (gibt eine neue Liste zurück). */
export function moveItem<T>(list: T[], index: number, delta: -1 | 1): T[] {
  const j = index + delta
  if (index < 0 || index >= list.length || j < 0 || j >= list.length) return list
  const copy = [...list]
  ;[copy[index], copy[j]] = [copy[j], copy[index]]
  return copy
}

/** Aufnahmezeit aus der Datei, soweit bekannt (Änderungsdatum), sonst jetzt. */
export function takenAtFromFile(file: { lastModified?: number }, now: Date = new Date()): string {
  return new Date(file.lastModified && file.lastModified > 0 ? file.lastModified : now.getTime()).toISOString()
}
