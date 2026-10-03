import { describe, expect, it } from 'vitest'
import { emptyActivityDraft } from '../../activity/logic'
import type { Activity } from '../../activity/types'
import type { DailyWeather } from '../../../services/weather'
import { forecastAvailableFrom, initialDay, inForecastRange, isNice, isRainy, isStale, planDay, tripDates } from '../logic'

const act = (over: Partial<Activity>): Activity => ({
  ...emptyActivityDraft(),
  title: 'X',
  id: over.title ?? Math.random().toString(36),
  tripId: 't1',
  createdAt: '',
  updatedAt: '',
  ...over
})
const w = (over: Partial<DailyWeather>): DailyWeather => ({
  date: '2026-07-01', code: 0, tempMax: 25, tempMin: 15, precipitation: 0, precipitationProbability: 0, windMax: 10, ...over
})

describe('Wetter-Bewertung', () => {
  it('Regen und schönes Wetter', () => {
    expect(isRainy(w({ code: 63 }))).toBe(true)
    expect(isRainy(w({ code: 3, precipitationProbability: 70 }))).toBe(true)
    expect(isRainy(w({ code: 3, precipitation: 4 }))).toBe(true)
    expect(isRainy(w({ code: 1 }))).toBe(false)
    expect(isNice(w({ code: 1, tempMax: 24 }))).toBe(true)
    expect(isNice(w({ code: 1, tempMax: 10 }))).toBe(false)
  })
})

describe('Tage und Vorhersagezeitraum', () => {
  const today = new Date(2026, 6, 1)
  it('Reisetage', () => {
    expect(tripDates('2026-07-01', '2026-07-03')).toEqual(['2026-07-01', '2026-07-02', '2026-07-03'])
  })
  it('Vorhersage nur 16 Tage voraus', () => {
    expect(inForecastRange('2026-07-01', today)).toBe(true)
    expect(inForecastRange('2026-07-16', today)).toBe(true)
    expect(inForecastRange('2026-07-17', today)).toBe(false)
    expect(inForecastRange('2026-06-30', today)).toBe(false)
    expect(forecastAvailableFrom('2026-08-20')).toBe('2026-08-05')
  })
  it('Starttag: heute während der Reise, sonst erster Tag', () => {
    expect(initialDay('2026-06-28', '2026-07-05', today)).toBe('2026-07-01')
    expect(initialDay('2026-08-01', '2026-08-05', today)).toBe('2026-08-01')
  })
  it('Vorhersage veraltet nach 3 Stunden', () => {
    const now = new Date('2026-07-01T12:00:00Z')
    expect(isStale('2026-07-01T10:00:00Z', now)).toBe(false)
    expect(isStale('2026-07-01T08:00:00Z', now)).toBe(true)
    expect(isStale(undefined, now)).toBe(true)
  })
})

describe('planDay', () => {
  // 2026-07-06 ist ein Montag
  const date = '2026-07-06'
  const list = [
    act({ title: 'Museum', setting: 'innen', priority: 2, openingHours: 'Di-So 10-18' }),
    act({ title: 'Aquarium', setting: 'innen', priority: 2, openingHours: 'täglich 9-18' }),
    act({ title: 'Wanderung', setting: 'aussen', priority: 1 }),
    act({ title: 'Bootstour', setting: 'aussen', priority: 2, plannedDate: date, status: 'geplant', durationHours: 3 }),
    act({ title: 'Stadtbummel', setting: 'gemischt', priority: 3, bookingRequired: true }),
    act({ title: 'Alt', status: 'erledigt' })
  ]

  it('bei Regen: Drinnen vorn, Draußen hinten, geschlossenes ausgeschlossen', () => {
    const p = planDay(date, list, w({ date, code: 63 }))
    expect(p.closed.map((c) => c.activity.title)).toEqual(['Museum'])
    expect(p.closed[0].reason).toBe('Montag geschlossen')
    expect(p.suggestions.map((s) => s.activity.title)).toEqual(['Aquarium', 'Stadtbummel', 'Wanderung'])
    expect(p.suggestions[0].reasons).toContain('Drinnen – gut bei Regen')
    expect(p.suggestions.find((s) => s.activity.title === 'Stadtbummel')!.notes).toContain('Reservierung nötig')
  })

  it('geplante Draußen-Aktivität bekommt bei Regen Warnung und Alternative', () => {
    const p = planDay(date, list, w({ date, code: 63 }))
    expect(p.planned).toHaveLength(1)
    expect(p.planned[0].warnings).toContain('Regen erwartet')
    expect(p.planned[0].alternative?.title).toBe('Aquarium')
    expect(p.plannedHours).toBe(3)
  })

  it('bei Sonne: Muss-Ziel draußen ganz vorn', () => {
    const p = planDay(date, list, w({ date, code: 0, tempMax: 26 }))
    expect(p.suggestions[0].activity.title).toBe('Wanderung')
    expect(p.planned[0].warnings).toEqual([])
  })

  it('ohne Wetter nur nach Priorität', () => {
    const p = planDay(date, list)
    expect(p.suggestions[0].activity.title).toBe('Wanderung')
  })

  it('warnt bei vollem Tag und Hitze', () => {
    const busy = [act({ plannedDate: date, status: 'geplant', durationHours: 5 }), act({ plannedDate: date, status: 'geplant', durationHours: 4 })]
    const p = planDay(date, busy, w({ date, tempMax: 34 }))
    expect(p.dayWarnings).toHaveLength(2)
  })

  it('warnt, wenn Geplantes an dem Tag geschlossen hat', () => {
    const p = planDay(date, [act({ title: 'Galerie', plannedDate: date, status: 'geplant', openingHours: 'Di-So 10-17' })])
    expect(p.planned[0].warnings).toEqual(['Am Montag geschlossen'])
  })
})
