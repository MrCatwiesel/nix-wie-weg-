import { toUtcDay } from './dates'

/** Anzeige-Formate (deutsch). Von allen Modulen gemeinsam genutzt. */

export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(value)
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(toUtcDay(isoDate)))
}

/** Kurzform mit Wochentag, z. B. "Sa., 03.10." */
export function formatDayShort(isoDate: string): string {
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' })
    .format(new Date(toUtcDay(isoDate)))
}

/** Gibt nur eine sichere http(s)-URL zurück, sonst null (Schutz vor javascript:-Links). */
export function safeUrl(url: string | undefined | null): string | null {
  if (!url) return null
  try {
    const u = new URL(url.trim())
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}
