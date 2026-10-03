import { db, now } from '@/core/db'
import type { WebsiteSettings, WebsiteSettingsDraft } from './types'

export const websiteRepository = {
  get(tripId: string): Promise<WebsiteSettings | undefined> {
    return db.websites.get(tripId)
  },
  async save(tripId: string, draft: WebsiteSettingsDraft): Promise<void> {
    await db.websites.put({ ...draft, tripId, updatedAt: now() })
  },
  async remove(tripId: string): Promise<void> {
    await db.websites.delete(tripId)
  }
}
