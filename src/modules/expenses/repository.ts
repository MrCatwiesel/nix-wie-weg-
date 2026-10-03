import { db, newId, now } from '@/core/db'
import type { Expense, ExpenseDraft } from './types'

export const expenseRepository = {
  listByTrip(tripId: string): Promise<Expense[]> {
    return db.expenses.where('tripId').equals(tripId).toArray()
  },
  get(id: string): Promise<Expense | undefined> {
    return db.expenses.get(id)
  },
  async create(tripId: string, draft: ExpenseDraft): Promise<string> {
    const ts = now()
    const item: Expense = { ...draft, id: newId(), tripId, createdAt: ts, updatedAt: ts }
    await db.expenses.add(item)
    return item.id
  },
  async update(id: string, draft: ExpenseDraft): Promise<void> {
    await db.expenses.update(id, { ...draft, updatedAt: now() })
  },
  async remove(id: string): Promise<void> {
    await db.expenses.delete(id)
  },
  async removeByTrip(tripId: string): Promise<void> {
    await db.expenses.where('tripId').equals(tripId).delete()
  }
}
