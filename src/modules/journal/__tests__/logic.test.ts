import { describe, expect, it } from 'vitest'
import {
  defaultEntryDate, emptyEntryDraft, entriesByDay, excerpt, journalStats, moodOf, moveItem, orderPhotos, takenAtFromFile,
  validateEntry
} from '../logic'
import { fitWithin } from '../../../services/images'
import type { JournalEntry } from '../types'

const entry = (over: Partial<JournalEntry>): JournalEntry => ({
  ...emptyEntryDraft('2026-07-01'),
  id: Math.random().toString(36),
  tripId: 't1',
  photoIds: [],
  createdAt: '2026-07-01T10:00:00Z',
  updatedAt: '',
  ...over
})

describe('Datum und Prüfung', () => {
  const today = new Date(2026, 6, 3)
  it('wählt heute während der Reise, sonst Anfang oder Ende', () => {
    expect(defaultEntryDate('2026-07-01', '2026-07-10', today)).toBe('2026-07-03')
    expect(defaultEntryDate('2026-07-05', '2026-07-10', today)).toBe('2026-07-05')
    expect(defaultEntryDate('2026-06-20', '2026-06-25', today)).toBe('2026-06-25')
  })
  it('verlangt Datum und Inhalt', () => {
    expect(validateEntry(emptyEntryDraft(), 0)).toEqual({ date: 'Bitte ein Datum wählen.', content: 'Schreib etwas oder füge ein Foto hinzu.' })
    expect(validateEntry(emptyEntryDraft('2026-07-01'), 1)).toEqual({})
    expect(validateEntry({ ...emptyEntryDraft('2026-07-01'), text: 'Schön' }, 0)).toEqual({})
  })
})

describe('Darstellung', () => {
  it('kürzt Texte an Wortgrenzen', () => {
    expect(excerpt('kurz')).toBe('kurz')
    const long = 'Heute waren wir am See und sind mit dem Boot nach Limone gefahren, dort gab es das beste Eis der ganzen Reise, danach Wanderung.'
    const e = excerpt(long, 60)
    expect(e.endsWith(' …')).toBe(true)
    expect(e.length).toBeLessThanOrEqual(62)
  })
  it('findet die Stimmung', () => {
    expect(moodOf(5)?.label).toBe('Traumhaft')
    expect(moodOf(0)).toBeUndefined()
  })
})

describe('entriesByDay', () => {
  it('zeigt alle Reisetage, auch leere, plus Einträge außerhalb', () => {
    const list = [entry({ date: '2026-07-02', title: 'B' }), entry({ date: '2026-07-05', title: 'Nach der Reise' })]
    const days = entriesByDay('2026-07-01', '2026-07-03', list)
    expect(days.map((d) => [d.date, d.dayNumber, d.entries.length])).toEqual([
      ['2026-07-01', 1, 0],
      ['2026-07-02', 2, 1],
      ['2026-07-03', 3, 0],
      ['2026-07-05', null, 1]
    ])
  })
  it('sortiert mehrere Einträge eines Tages nach Erstellung', () => {
    const list = [entry({ title: 'Abend', createdAt: '2026-07-01T20:00:00Z' }), entry({ title: 'Morgen', createdAt: '2026-07-01T08:00:00Z' })]
    expect(entriesByDay('2026-07-01', '2026-07-01', list)[0].entries.map((e) => e.title)).toEqual(['Morgen', 'Abend'])
  })
})

describe('Statistik und Fotos', () => {
  it('zählt Einträge, Fotos, Highlights, Tage', () => {
    const list = [entry({ highlight: true }), entry({}), entry({ date: '2026-07-02' })]
    expect(journalStats(list, 12)).toEqual({ entries: 3, photos: 12, highlights: 1, daysWritten: 2 })
  })
  it('ordnet Fotos nach gespeicherter Reihenfolge', () => {
    const photos = [{ id: 'a', takenAt: '1' }, { id: 'b', takenAt: '2' }, { id: 'c', takenAt: '0' }]
    expect(orderPhotos(['b', 'a'], photos).map((p) => p.id)).toEqual(['b', 'a', 'c'])
  })
  it('verschiebt Elemente', () => {
    expect(moveItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3])
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3])
  })
  it('Aufnahmezeit aus der Datei', () => {
    expect(takenAtFromFile({ lastModified: Date.UTC(2026, 6, 1, 12) })).toBe('2026-07-01T12:00:00.000Z')
    expect(takenAtFromFile({}, new Date('2026-07-02T00:00:00Z'))).toBe('2026-07-02T00:00:00.000Z')
  })
  it('verkleinert ins Format, vergrößert nie', () => {
    expect(fitWithin(4032, 3024, 2048)).toEqual({ width: 2048, height: 1536 })
    expect(fitWithin(3024, 4032, 480)).toEqual({ width: 360, height: 480 })
    expect(fitWithin(800, 600, 2048)).toEqual({ width: 800, height: 600 })
  })
})
