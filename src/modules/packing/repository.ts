import { db, newId, now } from '@/core/db'
import type { PackingDraft, PackingItem } from './types'

export const packingRepository = {
  listByTrip(tripId: string): Promise<PackingItem[]> {
    return db.packingItems.where('tripId').equals(tripId).toArray()
  },

  get(id: string): Promise<PackingItem | undefined> {
    return db.packingItems.get(id)
  },

  async create(tripId: string, draft: PackingDraft): Promise<string> {
    const ts = now()
    const item: PackingItem = { ...draft, id: newId(), tripId, createdAt: ts, updatedAt: ts }
    await db.packingItems.add(item)
    return item.id
  },

  async createMany(tripId: string, drafts: PackingDraft[]): Promise<number> {
    const ts = now()
    await db.packingItems.bulkAdd(drafts.map((d) => ({ ...d, id: newId(), tripId, createdAt: ts, updatedAt: ts })))
    return drafts.length
  },

  async update(id: string, draft: PackingDraft): Promise<void> {
    await db.packingItems.update(id, { ...draft, updatedAt: now() })
  },

  async setPacked(id: string, packed: boolean): Promise<void> {
    await db.packingItems.update(id, { packed, updatedAt: now() })
  },

  /** Alle als "nicht eingepackt" markieren – z. B. vor der Rückreise. */
  async unpackAll(tripId: string): Promise<void> {
    const ts = now()
    await db.packingItems.where('tripId').equals(tripId).modify({ packed: false, updatedAt: ts })
  },

  async remove(id: string): Promise<void> {
    await db.packingItems.delete(id)
  },

  async removeByTrip(tripId: string): Promise<void> {
    await db.packingItems.where('tripId').equals(tripId).delete()
  }
}
