export type PackingCategory =
  | 'kleidung'
  | 'hygiene'
  | 'gesundheit'
  | 'dokumente'
  | 'technik'
  | 'freizeit'
  | 'kinder'
  | 'unterwegs'
  | 'sonstiges'

/** Ein Gegenstand auf der Packliste einer Reise. */
export interface PackingItem {
  id: string
  tripId: string
  name: string
  category: PackingCategory
  quantity: number
  /** Für wen, z. B. "Anna"; leer = für alle / gemeinsam */
  person: string
  packed: boolean
  /** Wichtig – darf auf keinen Fall fehlen */
  essential: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

export type PackingDraft = Omit<PackingItem, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>

export const CATEGORY: Record<PackingCategory, { label: string; icon: string; order: number }> = {
  dokumente: { label: 'Dokumente & Geld', icon: 'passport', order: 1 },
  kleidung: { label: 'Kleidung', icon: 'bag', order: 2 },
  hygiene: { label: 'Hygiene & Pflege', icon: 'droplet', order: 3 },
  gesundheit: { label: 'Gesundheit', icon: 'heart-pulse', order: 4 },
  technik: { label: 'Technik', icon: 'phone', order: 5 },
  unterwegs: { label: 'Für unterwegs', icon: 'cup-straw', order: 6 },
  freizeit: { label: 'Freizeit & Sport', icon: 'sunglasses', order: 7 },
  kinder: { label: 'Kinder', icon: 'balloon', order: 8 },
  sonstiges: { label: 'Sonstiges', icon: 'three-dots', order: 9 }
}
