import { describe, expect, it } from 'vitest'
import { balances, emptyExpenseDraft, inTripCurrency, parseQuickExpense, round2, settle, sortExpenses, summarize, validateExpense } from '../logic'
import type { Expense } from '../types'

const ex = (over: Partial<Expense>): Expense => ({
  ...emptyExpenseDraft({ date: '2026-07-01' }),
  id: Math.random().toString(36),
  tripId: 't1',
  createdAt: '2026-07-01T10:00:00Z',
  updatedAt: '',
  ...over
})

describe('Beträge', () => {
  it('rundet auf Cent', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3)
    expect(round2(1.005)).toBe(1.01)
  })
  it('rechnet Fremdwährung um', () => {
    expect(inTripCurrency({ amount: 100, currency: 'CHF', rate: 1.05 }, 'EUR')).toBe(105)
    expect(inTripCurrency({ amount: 12.5, currency: 'EUR', rate: 0 }, 'EUR')).toBe(12.5)
  })
  it('liest die Schnelleingabe', () => {
    expect(parseQuickExpense('12,50 Eis')).toEqual({ amount: 12.5, description: 'Eis' })
    expect(parseQuickExpense('Pizza 23')).toEqual({ amount: 23, description: 'Pizza' })
    expect(parseQuickExpense('Hotel 1.234,50 €')).toEqual({ amount: 1234.5, description: 'Hotel' })
    expect(parseQuickExpense('Parken 3.5')).toEqual({ amount: 3.5, description: 'Parken' })
    expect(parseQuickExpense('nur Text')).toBeNull()
    expect(parseQuickExpense('0 gratis')).toBeNull()
  })
  it('prüft Betrag und Kurs', () => {
    expect(validateExpense(emptyExpenseDraft({ amount: 0 }), 'EUR').amount).toBeDefined()
    expect(validateExpense(emptyExpenseDraft({ amount: 5, currency: 'USD', rate: 0 }), 'EUR').rate).toBeDefined()
    expect(validateExpense(emptyExpenseDraft({ amount: 5 }), 'EUR')).toEqual({})
  })
})

describe('Zusammenfassung', () => {
  const list = [
    ex({ date: '2026-07-01', amount: 30, category: 'essen' }),
    ex({ date: '2026-07-02', amount: 50, category: 'aktivitaet' }),
    ex({ date: '2026-07-02', amount: 20, category: 'essen', currency: 'CHF', rate: 1.1 })
  ]
  it('summiert nach Kategorie und Tag, Durchschnitt und Hochrechnung', () => {
    const s = summarize(list, 'EUR', '2026-07-01', '2026-07-10', new Date(2026, 6, 2))
    expect(s.total).toBe(102)
    expect(s.byCategory).toEqual([{ category: 'essen', amount: 52 }, { category: 'aktivitaet', amount: 50 }])
    expect(s.byDay).toEqual([{ date: '2026-07-01', amount: 30 }, { date: '2026-07-02', amount: 72 }])
    expect(s.daysElapsed).toBe(2)
    expect(s.perDay).toBe(51)
    expect(s.projected).toBe(510)
  })
  it('nach der Reise ist die Hochrechnung die Summe', () => {
    const s = summarize(list, 'EUR', '2026-07-01', '2026-07-03', new Date(2026, 7, 1))
    expect(s.projected).toBe(102)
    expect(s.daysElapsed).toBe(3)
  })
  it('sortiert neueste zuerst', () => {
    expect(sortExpenses(list).map((e) => e.date)).toEqual(['2026-07-02', '2026-07-02', '2026-07-01'])
  })
})

describe('Ausgleich', () => {
  it('teilt gleich auf und berechnet eine Überweisung', () => {
    const list = [ex({ amount: 100, paidBy: 'Ich' }), ex({ amount: 40, paidBy: 'Anna' })]
    const b = balances(list, ['Ich', 'Anna'], 'EUR')
    expect(b).toEqual([
      { person: 'Ich', paid: 100, share: 70, net: 30 },
      { person: 'Anna', paid: 40, share: 70, net: -30 }
    ])
    expect(settle(b)).toEqual([{ from: 'Anna', to: 'Ich', amount: 30 }])
  })
  it('berücksichtigt "nur für" und ignoriert gemeinsame Kasse', () => {
    const list = [ex({ amount: 20, paidBy: 'Ich', splitAmong: ['Anna'] }), ex({ amount: 500, paidBy: '' })]
    const b = balances(list, ['Ich', 'Anna'], 'EUR')
    expect(settle(b)).toEqual([{ from: 'Anna', to: 'Ich', amount: 20 }])
  })
  it('drei Personen, mehrere Zahler', () => {
    const list = [ex({ amount: 90, paidBy: 'A' }), ex({ amount: 30, paidBy: 'B' })]
    const t = settle(balances(list, ['A', 'B', 'C'], 'EUR'))
    expect(t).toEqual([{ from: 'C', to: 'A', amount: 40 }, { from: 'B', to: 'A', amount: 10 }])
  })
  it('quitt ergibt keine Überweisung', () => {
    const list = [ex({ amount: 50, paidBy: 'Ich' }), ex({ amount: 50, paidBy: 'Anna' })]
    expect(settle(balances(list, ['Ich', 'Anna'], 'EUR'))).toEqual([])
  })
})
