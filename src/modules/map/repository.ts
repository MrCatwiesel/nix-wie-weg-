import { db, now } from '@/core/db'
import type { MapPlace, PlaceKind } from './types'
import { placeId } from './logic'

export const placeRepository = {
  listByTrip(tripId: string): Promise<MapPlace[]> {
    return db.places.where('tripId').equals(tripId).toArray()
  },
  async set(tripId: string, kind: PlaceKind, refId: string, lat: number, lon: number, label: string): Promise<void> {
    await db.places.put({ id: placeId(kind, refId), tripId, kind, refId, lat, lon, label, updatedAt: now() })
  },
  async remove(kind: PlaceKind, refId: string): Promise<void> {
    await db.places.delete(placeId(kind, refId))
  },
  async removeByTrip(tripId: string): Promise<void> {
    await db.places.where('tripId').equals(tripId).delete()
  }
}
