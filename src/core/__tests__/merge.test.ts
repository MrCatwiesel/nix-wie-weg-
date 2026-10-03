import { describe, expect, it } from 'vitest'
import { decide, describeStats, stampOf } from '../merge'

describe('Zusammenführen', () => {
  it('nimmt den passenden Zeitstempel', () => {
    expect(stampOf({ updatedAt: '2026-07-02', createdAt: '2026-07-01' })).toBe('2026-07-02')
    expect(stampOf({ createdAt: '2026-07-01' })).toBe('2026-07-01')
    expect(stampOf({ fetchedAt: '2026-07-03' })).toBe('2026-07-03')
    expect(stampOf(undefined)).toBe('')
  })
  it('neu hinzufügen, neuer ersetzen, älter/gleich behalten', () => {
    expect(decide(undefined, { updatedAt: '2026-07-01' })).toBe('add')
    expect(decide({ updatedAt: '2026-07-01' }, { updatedAt: '2026-07-02' })).toBe('update')
    expect(decide({ updatedAt: '2026-07-02' }, { updatedAt: '2026-07-01' })).toBe('skip')
    expect(decide({ updatedAt: '2026-07-02' }, { updatedAt: '2026-07-02' })).toBe('skip')
  })
  it('beschreibt das Ergebnis', () => {
    expect(describeStats({ added: 3, updated: 1, unchanged: 0 })).toBe('3 neu, 1 aktualisiert')
    expect(describeStats({ added: 0, updated: 0, unchanged: 0 })).toBe('nichts zu übernehmen')
  })
})
