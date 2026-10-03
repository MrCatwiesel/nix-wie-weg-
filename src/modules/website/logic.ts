import { diffDays } from '../../core/dates'
import { formatDate } from '../../core/format'
import { MOODS } from '../journal/types'
import type { SiteData, SiteDay, SitePhoto, WebsiteSettingsDraft } from './types'

export function defaultSettings(trip: { title: string; destination: string; startDate: string; endDate: string }): WebsiteSettingsDraft {
  return {
    template: 'klassisch',
    accent: '#0d6efd',
    font: 'modern',
    dark: false,
    title: trip.title,
    subtitle: `${trip.destination} · ${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`,
    intro: '',
    author: '',
    onlyHighlights: true,
    showMood: true,
    showLocation: true,
    imageSize: 'mittel'
  }
}

/** Text sicher in HTML einsetzen. */
export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** Fließtext → Absätze (Leerzeile) und Zeilenumbrüche. */
export function paragraphs(text: string, cls = ''): string {
  const c = cls ? ` class="${cls}"` : ''
  return text
    .trim()
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p) => `<p${c}>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('\n')
}

/** Nur gültige Hex-Farben durchlassen (sonst Standardblau). */
export function safeColor(c: string): string {
  return /^#[0-9a-f]{6}$/i.test(c) ? c.toLowerCase() : '#0d6efd'
}

/** Hex-Farbe → "r, g, b" für rgba(). */
export function rgbOf(hex: string): string {
  const h = safeColor(hex).slice(1)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(', ')
}

export function moodEmoji(value: number): string {
  return MOODS.find((m) => m.value === value)?.emoji ?? ''
}

/** Datum lang, z. B. "Samstag, 4. Juli 2026" */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d))
  )
}

/** <img> mit Größenangaben (verhindert Springen beim Laden), lazy und mit Lightbox-Markierung. */
export function img(p: SitePhoto, cls = '', eager = false): string {
  return `<img src="${p.src}" alt="${esc(p.caption)}" width="${p.width}" height="${p.height}"${cls ? ` class="${cls}"` : ''} loading="${eager ? 'eager' : 'lazy'}" decoding="async" data-lb>`
}

export interface EntryInput {
  date: string
  title: string
  text: string
  mood: number
  location: string
  highlight: boolean
  photos: SitePhoto[]
  createdAt: string
}

/**
 * Baut die Daten für die Vorlage: filtert (nur Highlights), gruppiert nach Tag, wählt das Titelbild.
 * `entries` enthalten schon die fertigen Bildquellen.
 */
export function buildSiteData(
  trip: { destination: string; startDate: string; endDate: string; participants?: string[] },
  settings: Pick<WebsiteSettingsDraft, 'title' | 'subtitle' | 'intro' | 'author' | 'onlyHighlights'>,
  entries: EntryInput[],
  generatedAt = new Date().toISOString()
): SiteData {
  const chosen = entries
    .filter((e) => !settings.onlyHighlights || e.highlight)
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))

  const byDate = new Map<string, SiteDay>()
  for (const e of chosen) {
    const inTrip = e.date >= trip.startDate && e.date <= trip.endDate
    const day = byDate.get(e.date) ?? { date: e.date, dayNumber: inTrip ? diffDays(trip.startDate, e.date) + 1 : null, entries: [] }
    day.entries.push({ title: e.title, text: e.text, mood: e.mood, location: e.location, photos: e.photos })
    byDate.set(e.date, day)
  }
  const days = [...byDate.values()]
  const allPhotos = days.flatMap((d) => d.entries.flatMap((e) => e.photos))
  // Titelbild: erstes Querformat, sonst erstes Foto überhaupt
  const cover = allPhotos.find((p) => p.width >= p.height) ?? allPhotos[0] ?? null

  return {
    title: settings.title,
    subtitle: settings.subtitle,
    intro: settings.intro,
    author: settings.author,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    participants: trip.participants ?? [],
    cover,
    days,
    stats: { days: diffDays(trip.startDate, trip.endDate) + 1, entries: chosen.length, photos: allPhotos.length },
    generatedAt
  }
}

/** Dateiname für den Download, z. B. "sommer-am-gardasee.html" */
export function fileNameFor(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
  return `${slug || 'reise'}.html`
}
