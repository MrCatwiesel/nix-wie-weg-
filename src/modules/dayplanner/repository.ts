import { db } from '@/core/db'
import type { WeatherCache } from './types'

export const weatherRepository = {
  get(tripId: string): Promise<WeatherCache | undefined> {
    return db.weather.get(tripId)
  },
  async put(cache: WeatherCache): Promise<void> {
    await db.weather.put(cache)
  },
  async remove(tripId: string): Promise<void> {
    await db.weather.delete(tripId)
  }
}
