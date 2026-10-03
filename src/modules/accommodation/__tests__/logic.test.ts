import { describe, expect, it } from 'vitest'
import { coverage, emptyAccommodationDraft, nights, pricePerNight, toRanges, totalCost, upcomingCancelDeadlines, validateAccommodation } from '../logic'
import type { Accommodation } from '../types'

const acc = (over: Partial<Accommodation>): Accommodation => ({
  ...emptyAccommodationDraft('2026-07-01', '2026-07-04'),
  name: 'Test',
  id: Math.random().toString(36),
  tripId: 't1',
  createdAt: '',
  updatedAt: '',
  ...over
})

describe('nights / pricePerNight', () => {
  it('zählt Übernachtungen', () => {
    expect(nights('2026-07-01', '2026-07-04')).toBe(3)
  })
  it('rechnet den Preis pro Nacht', () => {
    expect(pricePerNight({ price: 300, checkIn: '2026-07-01', checkOut: '2026-07-04' })).toBe(100)
    expect(pricePerNight({ price: null, checkIn: '2026-07-01', checkOut: '2026-07-04' })).toBeNull()
  })
})

describe('coverage', () => {
  // Reise 01.–08.07. = 7 Nächte
  it('findet Lücken und zählt gebuchte Nächte', () => {
    const list = [
      acc({ checkIn: '2026-07-01', checkOut: '2026-07-04', status: 'gebucht' }),
      acc({ checkIn: '2026-07-06', checkOut: '2026-07-08', status: 'idee' })
    ]
    const c = coverage('2026-07-01', '2026-07-08', list)
    expect(c.totalNights).toBe(7)
    expect(c.bookedNights).toBe(3)
    expect(c.plannedNights).toBe(2)
    expect(c.gaps).toEqual([{ from: '2026-07-04', to: '2026-07-07', nights: 4 }])
  })
  it('ignoriert Storniertes und meldet Doppelbuchungen', () => {
    const list = [
      acc({ checkIn: '2026-07-01', checkOut: '2026-07-03', status: 'gebucht' }),
      acc({ checkIn: '2026-07-02', checkOut: '2026-07-03', status: 'gebucht' }),
      acc({ checkIn: '2026-07-03', checkOut: '2026-07-04', status: 'storniert' })
    ]
    const c = coverage('2026-07-01', '2026-07-04', list)
    expect(c.bookedNights).toBe(2)
    expect(c.doubleBooked).toEqual(['2026-07-02'])
    expect(c.gaps).toEqual([{ from: '2026-07-03', to: '2026-07-03', nights: 1 }])
  })
})

describe('toRanges', () => {
  it('fasst aufeinanderfolgende Tage zusammen', () => {
    expect(toRanges(['2026-07-01', '2026-07-02', '2026-07-05'])).toEqual([
      { from: '2026-07-01', to: '2026-07-02', nights: 2 },
      { from: '2026-07-05', to: '2026-07-05', nights: 1 }
    ])
  })
})

describe('totalCost', () => {
  it('summiert nur nicht stornierte Preise in der Reisewährung', () => {
    const list = [
      acc({ price: 300, status: 'gebucht' }),
      acc({ price: 200, status: 'storniert' }),
      acc({ price: 100, currency: 'CHF' }),
      acc({ price: 50 })
    ]
    expect(totalCost(list, 'EUR')).toBe(350)
  })
})

describe('upcomingCancelDeadlines', () => {
  it('meldet nahe Stornofristen gebuchter Unterkünfte', () => {
    const today = new Date(2026, 9, 3)
    const list = [
      acc({ name: 'A', status: 'gebucht', cancelUntil: '2026-10-05' }),
      acc({ name: 'B', status: 'gebucht', cancelUntil: '2026-12-01' }),
      acc({ name: 'C', status: 'idee', cancelUntil: '2026-10-04' }),
      acc({ name: 'D', status: 'gebucht', cancelUntil: '2026-10-01' })
    ]
    const r = upcomingCancelDeadlines(list, 14, today)
    expect(r.map((x) => [x.accommodation.name, x.daysLeft])).toEqual([['A', 2]])
  })
})

describe('validateAccommodation', () => {
  it('verlangt Abreise nach Anreise', () => {
    const e = validateAccommodation({ ...emptyAccommodationDraft('2026-07-04', '2026-07-04'), name: 'X' })
    expect(e.checkOut).toBeDefined()
  })
})
