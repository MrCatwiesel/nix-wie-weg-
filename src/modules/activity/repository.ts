import { db, newId, now } from '@/core/db'
import type { Activity, ActivityDraft, ActivityStatus } from './types'

export const activityRepository = {
  listByTrip(tripId: string): Promise<Activity[]> {
    return db.activities.where('tripId').equals(tripId).toArray()
  },

  get(id: string): Promise<Activity | undefined> {
    return db.activities.get(id)
  },

  async create(tripId: string, draft: ActivityDraft): Promise<string> {
    const ts = now()
    const item: Activity = { ...draft, id: newId(), tripId, createdAt: ts, updatedAt: ts }
    await db.activities.add(item)
    return item.id
  },

  async update(id: string, draft: ActivityDraft): Promise<void> {
    await db.activities.update(id, { ...draft, updatedAt: now() })
  },

  async setStatus(id: string, status: ActivityStatus): Promise<void> {
    await db.activities.update(id, { status, updatedAt: now() })
  },

  async remove(id: string): Promise<void> {
    await db.activities.delete(id)
  },

  async removeByTrip(tripId: string): Promise<void> {
    await db.activities.where('tripId').equals(tripId).delete()
  }
}
