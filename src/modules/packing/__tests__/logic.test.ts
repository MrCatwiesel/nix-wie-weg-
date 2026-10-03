import { describe, expect, it } from 'vitest'
import {
  SHARED, isPersonal, progressByPerson,
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
    const d = draftsFromTemplates([a, b], 5, 2, [{ name: 'ZELT', person: '' }])
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
    const d = draftsFromOtherTrip(src, [{ name: 'Buch', person: '' }])
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

describe('Teilnehmer', () => {
  const tpl: PackingTemplate = { id: 't', title: 'T', icon: '', description: '', items: [
    { name: 'Socken', category: 'kleidung', qty: { perDay: 1, max: 8 } },
    { name: 'Zahnbürste', category: 'hygiene', personal: true },
    { name: 'Duschgel', category: 'hygiene' },
    { name: 'Strandtuch', category: 'freizeit', qty: { perPerson: 1 } }
  ] }

  it('erkennt persönliche Einträge', () => {
    expect(tpl.items.map(isPersonal)).toEqual([true, true, false, true])
  })

  it('legt Persönliches je Teilnehmer an, Gemeinsames einmal', () => {
    const d = draftsFromTemplates([tpl], 5, 2, [], ['Ich', 'Anna'])
    const view = d.map((x) => `${x.person || '-'}:${x.name}:${x.quantity}`).sort()
    expect(view).toEqual([
      '-:Duschgel:1',
      'Anna:Socken:5', 'Anna:Strandtuch:1', 'Anna:Zahnbürste:1',
      'Ich:Socken:5', 'Ich:Strandtuch:1', 'Ich:Zahnbürste:1'
    ])
  })

  it('überspringt, was eine Person schon hat, legt es für die andere an', () => {
    const d = draftsFromTemplates([tpl], 5, 2, [{ name: 'Zahnbürste', person: 'Ich' }], ['Ich', 'Anna'])
    expect(d.filter((x) => x.name === 'Zahnbürste').map((x) => x.person)).toEqual(['Anna'])
  })

  it('übernimmt aus anderer Reise nur bekannte Personen, sonst gemeinsam', () => {
    const src = [item({ name: 'Kamera', person: 'anna' }), item({ name: 'Buch', person: 'Paul' })]
    const d = draftsFromOtherTrip(src, [], ['Ich', 'Anna'])
    expect(d.map((x) => `${x.name}:${x.person}`)).toEqual(['Kamera:Anna', 'Buch:'])
  })

  it('filtert nur Gemeinsames bzw. Person ohne Gemeinsames', () => {
    const list = [item({ name: 'A', person: 'Ich' }), item({ name: 'B' }), item({ name: 'C', person: 'Anna' })]
    expect(groupByCategory(list, { person: SHARED }).flatMap((g) => g.items.map((i) => i.name))).toEqual(['B'])
    expect(groupByCategory(list, { person: 'Ich', includeShared: false }).flatMap((g) => g.items.map((i) => i.name))).toEqual(['A'])
    expect(groupByCategory(list, { person: 'Ich' }).flatMap((g) => g.items.map((i) => i.name)).sort()).toEqual(['A', 'B'])
  })

  it('zählt Fortschritt je Person', () => {
    const list = [item({ person: 'Ich', packed: true }), item({ person: 'Ich' }), item({ person: '' })]
    const r = progressByPerson(list, ['Ich', 'Anna'])
    expect(r.map((x) => `${x.person}:${x.progress.packed}/${x.progress.total}`)).toEqual(['Ich:1/2', 'Anna:0/0', `${SHARED}:0/1`])
  })
})
