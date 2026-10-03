import { db, newId, now } from '@/core/db'
import type { EmergencyContact, EmergencyContactDraft, TravelDocument, TravelDocumentDraft } from './types'

export const documentRepository = {
  listByTrip(tripId: string): Promise<TravelDocument[]> {
    return db.documents.where('tripId').equals(tripId).toArray()
  },
  get(id: string): Promise<TravelDocument | undefined> {
    return db.documents.get(id)
  },
  async create(tripId: string, draft: TravelDocumentDraft): Promise<string> {
    const ts = now()
    const item: TravelDocument = { ...draft, id: newId(), tripId, createdAt: ts, updatedAt: ts }
    await db.documents.add(item)
    return item.id
  },
  async createMany(tripId: string, drafts: TravelDocumentDraft[]): Promise<void> {
    const ts = now()
    await db.documents.bulkAdd(drafts.map((d) => ({ ...d, id: newId(), tripId, createdAt: ts, updatedAt: ts })))
  },
  async update(id: string, draft: TravelDocumentDraft): Promise<void> {
    await db.documents.update(id, { ...draft, updatedAt: now() })
  },
  async setPacked(id: string, packed: boolean): Promise<void> {
    await db.documents.update(id, { packed, updatedAt: now() })
  },
  async remove(id: string): Promise<void> {
    await db.documents.delete(id)
  },
  async removeByTrip(tripId: string): Promise<void> {
    await db.documents.where('tripId').equals(tripId).delete()
  }
}

export const contactRepository = {
  listByTrip(tripId: string): Promise<EmergencyContact[]> {
    return db.emergencyContacts.where('tripId').equals(tripId).toArray()
  },
  get(id: string): Promise<EmergencyContact | undefined> {
    return db.emergencyContacts.get(id)
  },
  async create(tripId: string, draft: EmergencyContactDraft): Promise<string> {
    const ts = now()
    const item: EmergencyContact = { ...draft, id: newId(), tripId, createdAt: ts, updatedAt: ts }
    await db.emergencyContacts.add(item)
    return item.id
  },
  async update(id: string, draft: EmergencyContactDraft): Promise<void> {
    await db.emergencyContacts.update(id, { ...draft, updatedAt: now() })
  },
  async remove(id: string): Promise<void> {
    await db.emergencyContacts.delete(id)
  },
  async removeByTrip(tripId: string): Promise<void> {
    await db.emergencyContacts.where('tripId').equals(tripId).delete()
  }
}
