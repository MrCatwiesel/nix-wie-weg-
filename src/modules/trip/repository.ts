import { db, newId, now } from '@/core/db'
import type { Trip, TripDraft } from './types'

/** Datenzugriff des Moduls – Views greifen nie direkt auf die Datenbank zu. */
export const tripRepository = {
  listAll(): Promise<Trip[]> {
    return db.trips.orderBy('startDate').reverse().toArray()
  },

  get(id: string): Promise<Trip | undefined> {
    return db.trips.get(id)
  },

  async create(draft: TripDraft): Promise<string> {
    const ts = now()
    const trip: Trip = { ...draft, id: newId(), createdAt: ts, updatedAt: ts }
    await db.trips.add(trip)
    return trip.id
  },

  async update(id: string, draft: TripDraft): Promise<void> {
    await db.trips.update(id, { ...draft, updatedAt: now() })
  },

  async remove(id: string): Promise<void> {
    await db.trips.delete(id)
  }
}

// Leerer Entwurf liegt in logic.ts (ohne Datenbank testbar).
export { emptyTripDraft } from './logic'
