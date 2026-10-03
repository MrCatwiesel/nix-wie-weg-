import { describe, expect, it } from 'vitest'
import { countByStatus, emptyActivityDraft, estimatedCost, filterAndSort, plannedHoursByDay, rainyDayOptions, totalEstimatedCost, validateActivity } from '../logic'
import type { Activity } from '../types'

const act = (over: Partial<Activity>): Activity => ({
  ...emptyActivityDraft(),
  title: 'Test',
  id: Math.random().toString(36),
  tripId: 't1',
  createdAt: '',
  updatedAt: '',
  ...over
})

describe('Kosten', () => {
  it('rechnet Preis pro Person mal Reisende', () => {
    expect(estimatedCost({ pricePerPerson: 12.5 }, 4)).toBe(50)
    expect(estimatedCost({ pricePerPerson: null }, 4)).toBe(0)
  })
  it('summiert ohne Verworfenes und nur in der Reisewährung', () => {
    const list = [act({ pricePerPerson: 10 }), act({ pricePerPerson: 20, status: 'verworfen' }), act({ pricePerPerson: 5, currency: 'CHF' })]
    expect(totalEstimatedCost(list, 2, 'EUR')).toBe(20)
  })
})

describe('filterAndSort', () => {
  const list = [
    act({ title: 'Museum', status: 'idee', priority: 2, setting: 'innen' }),
    act({ title: 'Wanderung', status: 'geplant', plannedDate: '2026-07-03', setting: 'aussen' }),
    act({ title: 'Eis essen', status: 'erledigt' }),
    act({ title: 'Burg', status: 'idee', priority: 1, setting: 'gemischt' }),
    act({ title: 'Bootstour', status: 'geplant', plannedDate: '2026-07-02' })
  ]
  it('sortiert Geplantes nach Tag, dann Ideen nach Priorität', () => {
    expect(filterAndSort(list).map((a) => a.title)).toEqual(['Bootstour', 'Wanderung', 'Burg', 'Museum', 'Eis essen'])
  })
  it('filtert nach Drinnen/Draußen und offenen Einträgen', () => {
    expect(filterAndSort(list, { setting: 'innen' }).map((a) => a.title)).toEqual(['Museum'])
    expect(filterAndSort(list, { openOnly: true })).toHaveLength(4)
  })
  it('findet Regentag-Alternativen', () => {
    expect(rainyDayOptions(list).map((a) => a.title)).toEqual(['Burg', 'Museum'])
  })
})

describe('countByStatus / plannedHoursByDay', () => {
  it('zählt und summiert Stunden pro Tag', () => {
    const list = [
      act({ status: 'geplant', plannedDate: '2026-07-02', durationHours: 3 }),
      act({ status: 'geplant', plannedDate: '2026-07-02', durationHours: 6 }),
      act({ status: 'verworfen', plannedDate: '2026-07-02', durationHours: 5 })
    ]
    expect(countByStatus(list)).toEqual({ idee: 0, geplant: 2, erledigt: 0, verworfen: 1 })
    expect(plannedHoursByDay(list)).toEqual({ '2026-07-02': 9 })
  })
})

describe('validateActivity', () => {
  it('prüft Name und geplanten Tag', () => {
    const e = validateActivity({ ...emptyActivityDraft(), plannedDate: '2026-08-01' }, { startDate: '2026-07-01', endDate: '2026-07-10' })
    expect(e.title).toBeDefined()
    expect(e.plannedDate).toBeDefined()
  })
})
