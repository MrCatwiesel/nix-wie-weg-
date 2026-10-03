import { describe, expect, it } from 'vitest'
import {
  draftsFromOtherTrip, draftsFromTemplates, emptyPackingDraft, groupByCategory, parseQuickAdd, persons, progress,
  resolveQuantity, validatePacking
} from '../logic'
import { TEMPLATES, type PackingTemplate } from '../templates'
import type { PackingItem } from '../types'

const item = (over: Partial<PackingItem>): PackingItem => ({
  ...emptyPackingDraft({ name: 'X' }),
  id: Math.random().toString(36),
  tripId: 't1',
  createdAt: '',
  updatedAt: '',
  ...over
})

describe('resolveQuantity', () => {
  it('feste Menge, pro Tag mit Deckel, pro Person', () => {
    expect(resolveQuantity(undefined, 7, 2)).toBe(1)
    expect(resolveQuantity(2, 7, 2)).toBe(2)
    expect(resolveQuantity({ perDay: 1, max: 8 }, 5, 2)).toBe(5)
    expect(resolveQuantity({ perDay: 1, max: 8 }, 14, 2)).toBe(8)
    expect(resolveQuantity({ perDay: 0.3, max: 3 }, 2, 1)).toBe(1)
    expect(resolveQuantity({ perPerson: 1 }, 7, 4)).toBe(4)
  })
})

describe('draftsFromTemplates', () => {
  const a: PackingTemplate = { id: 'a', title: 'A', icon: '', description: '', items: [
    { name: 'Sonnencreme', category: 'hygiene' },
    { name: 'Socken', category: 'kleidung', qty: { perDay: 1, max: 8 } }
  ] }
  const b: PackingTemplate = { id: 'b', title: 'B', icon: '', description: '', items: [
    { name: 'sonnencreme ', category: 'hygiene', qty: 2, essential: true },
    { name: 'Zelt', category: 'freizeit' }
  ] }
  it('fasst Doppeltes zusammen (größte Menge, wichtig gewinnt)', () => {
    const d = draftsFromTemplates([a, b], 5, 2)
    expect(d).toHaveLength(3)
    const sc = d.find((x) => x.name === 'Sonnencreme')!
    expect(sc.quantity).toBe(2)
    expect(sc.essential).toBe(true)
  })
  it('überspringt Vorhandenes', () => {
    const d = draftsFromTemplates([a, b], 5, 2, [{ name: 'ZELT' }])
    expect(d.map((x) => x.name)).toEqual(['Sonnencreme', 'Socken'])
  })
  it('alle eingebauten Vorlagen sind gültig und eindeutig', () => {
    const ids = TEMPLATES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of TEMPLATES) for (const i of t.items) expect(validatePacking(emptyPackingDraft({ name: i.name }))).toEqual({})
  })
})

describe('draftsFromOtherTrip', () => {
  it('übernimmt ausgepackt und ohne Doppelte', () => {
    const src = [item({ name: 'Kamera', packed: true }), item({ name: 'Buch' }), item({ name: 'kamera' })]
    const d = draftsFromOtherTrip(src, [{ name: 'Buch' }])
    expect(d.map((x) => [x.name, x.packed])).toEqual([['Kamera', false]])
    expect('id' in d[0]).toBe(false)
  })
})

describe('progress / groupByCategory / persons', () => {
  const list = [
    item({ name: 'Pass', category: 'dokumente', essential: true }),
    item({ name: 'Socken', category: 'kleidung', packed: true, person: 'Anna' }),
    item({ name: 'Ausweis', category: 'dokumente', packed: true, essential: true }),
    item({ name: 'Mütze', category: 'kleidung', person: 'Ben' })
  ]
  it('zählt Fortschritt und fehlende wichtige Dinge', () => {
    expect(progress(list)).toEqual({ total: 4, packed: 2, percent: 50, essentialOpen: 1 })
  })
  it('gruppiert in fester Reihenfolge, Offenes zuerst', () => {
    const g = groupByCategory(list)
    expect(g.map((x) => x.category)).toEqual(['dokumente', 'kleidung'])
    expect(g[0].items.map((i) => i.name)).toEqual(['Pass', 'Ausweis'])
  })
  it('filtert nach Person (Gemeinsames bleibt sichtbar) und offen', () => {
    const g = groupByCategory(list, { person: 'Anna', openOnly: true })
    expect(g.flatMap((x) => x.items.map((i) => i.name))).toEqual(['Pass'])
  })
  it('listet Personen', () => {
    expect(persons(list)).toEqual(['Anna', 'Ben'])
  })
})

describe('parseQuickAdd', () => {
  it('erkennt Mengen vorne und hinten', () => {
    expect(parseQuickAdd('3x Socken')).toEqual({ name: 'Socken', quantity: 3 })
    expect(parseQuickAdd('Badehose x2')).toEqual({ name: 'Badehose', quantity: 2 })
    expect(parseQuickAdd('Ladekabel USB-C')).toEqual({ name: 'Ladekabel USB-C', quantity: 1 })
  })
})
