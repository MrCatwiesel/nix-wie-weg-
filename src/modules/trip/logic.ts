import type { TripDraft } from './types'

/** Leerer Entwurf für das Formular "Neue Reise". */
export function emptyTripDraft(): TripDraft {
  return {
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: null,
    currency: 'EUR',
    transport: 'auto',
    notes: ''
  }
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Datum YYYY-MM-DD als UTC-Mitternacht, damit Zeitzonen nicht stören. */
function toUtcDay(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Anzahl Reisetage inkl. An- und Abreisetag. */
export function tripDays(startDate: string, endDate: string): number {
  return Math.round((toUtcDay(endDate) - toUtcDay(startDate)) / DAY_MS) + 1
}

/** Tage bis zum Reisebeginn (negativ = Reise läuft oder ist vorbei). */
export function daysUntil(startDate: string, today: Date = new Date()): number {
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((toUtcDay(startDate) - t) / DAY_MS)
}

export type TripPhase = 'planung' | 'unterwegs' | 'vorbei'

export function tripPhase(startDate: string, endDate: string, today: Date = new Date()): TripPhase {
  if (daysUntil(startDate, today) > 0) return 'planung'
  if (daysUntil(endDate, today) >= 0) return 'unterwegs'
  return 'vorbei'
}

/** Budget pro Person und Tag, oder null wenn kein Budget gesetzt ist. */
export function budgetPerPersonDay(draft: Pick<TripDraft, 'budget' | 'travelers' | 'startDate' | 'endDate'>): number | null {
  if (!draft.budget || draft.travelers < 1) return null
  return draft.budget / draft.travelers / tripDays(draft.startDate, draft.endDate)
}

/** Prüft einen Entwurf und liefert Fehlermeldungen je Feld. */
export function validateTrip(draft: TripDraft): Partial<Record<keyof TripDraft, string>> {
  const errors: Partial<Record<keyof TripDraft, string>> = {}
  if (!draft.title.trim()) errors.title = 'Bitte einen Namen für die Reise angeben.'
  if (!draft.destination.trim()) errors.destination = 'Bitte ein Reiseziel angeben.'
  if (!draft.startDate) errors.startDate = 'Bitte ein Startdatum wählen.'
  if (!draft.endDate) errors.endDate = 'Bitte ein Enddatum wählen.'
  if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
    errors.endDate = 'Das Ende liegt vor dem Start.'
  }
  if (!Number.isInteger(draft.travelers) || draft.travelers < 1) {
    errors.travelers = 'Mindestens eine reisende Person.'
  }
  if (draft.budget !== null && draft.budget < 0) errors.budget = 'Budget darf nicht negativ sein.'
  return errors
}

export function formatMoney(value: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(value)
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(toUtcDay(isoDate)))
}
