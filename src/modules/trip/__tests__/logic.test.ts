import { describe, expect, it } from 'vitest'
import { budgetPerPersonDay, daysUntil, emptyTripDraft, tripDays, tripPhase, validateTrip } from '../logic'

describe('tripDays', () => {
  it('zählt An- und Abreisetag mit', () => {
    expect(tripDays('2026-07-01', '2026-07-14')).toBe(14)
    expect(tripDays('2026-07-01', '2026-07-01')).toBe(1)
  })
  it('funktioniert über die Zeitumstellung hinweg', () => {
    expect(tripDays('2026-10-20', '2026-10-30')).toBe(11)
  })
})

describe('daysUntil / tripPhase', () => {
  const today = new Date(2026, 9, 3) // 3. Oktober 2026
  it('berechnet die Tage bis zum Start', () => {
    expect(daysUntil('2026-10-10', today)).toBe(7)
  })
  it('erkennt die Phase', () => {
    expect(tripPhase('2026-10-10', '2026-10-20', today)).toBe('planung')
    expect(tripPhase('2026-10-01', '2026-10-05', today)).toBe('unterwegs')
    expect(tripPhase('2026-09-01', '2026-09-05', today)).toBe('vorbei')
  })
})

describe('budgetPerPersonDay', () => {
  it('teilt durch Personen und Tage', () => {
    expect(budgetPerPersonDay({ budget: 1400, travelers: 2, startDate: '2026-07-01', endDate: '2026-07-07' })).toBe(100)
  })
  it('liefert null ohne Budget', () => {
    expect(budgetPerPersonDay({ budget: null, travelers: 2, startDate: '2026-07-01', endDate: '2026-07-07' })).toBeNull()
  })
})

describe('validateTrip', () => {
  it('meldet Pflichtfelder', () => {
    const errors = validateTrip(emptyTripDraft())
    expect(Object.keys(errors).sort()).toEqual(['destination', 'endDate', 'startDate', 'title'])
  })
  it('erkennt Ende vor Start', () => {
    const errors = validateTrip({ ...emptyTripDraft(), title: 'X', destination: 'Y', startDate: '2026-07-10', endDate: '2026-07-01' })
    expect(errors.endDate).toBeDefined()
  })
})
