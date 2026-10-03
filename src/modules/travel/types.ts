export type TravelDirection = 'hin' | 'rueck'
export type TravelMode = 'auto' | 'bahn' | 'flug' | 'bus' | 'faehre' | 'fahrrad' | 'sonstiges'

/** Eine Etappe der An- oder Rückreise, z. B. "München → Innsbruck mit dem Auto". */
export interface TravelLeg {
  id: string
  tripId: string
  direction: TravelDirection
  /** Reihenfolge innerhalb der Richtung (0, 1, 2 …) */
  position: number
  mode: TravelMode
  from: string
  to: string
  /** ISO-Datum YYYY-MM-DD */
  date: string
  /** Abfahrt "HH:MM" oder leer */
  departTime: string
  /** Ankunft "HH:MM" oder leer; liegt sie vor der Abfahrt, gilt der Folgetag */
  arriveTime: string
  distanceKm: number | null
  /** Ticket- oder Gesamtpreis; beim Auto optional, sonst aus Sprit + Maut berechnet */
  cost: number | null
  currency: string
  /** Nur Auto: Verbrauch in l/100 km (bzw. kWh/100 km) */
  consumption: number | null
  /** Nur Auto: Preis pro Liter (bzw. kWh) */
  fuelPrice: number | null
  /** Nur Auto: Maut, Vignette, Tunnel */
  tolls: number | null
  bookingRef: string
  url: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type TravelLegDraft = Omit<TravelLeg, 'id' | 'tripId' | 'position' | 'createdAt' | 'updatedAt'>

export const MODE: Record<TravelMode, { label: string; icon: string }> = {
  auto: { label: 'Auto', icon: 'car-front' },
  bahn: { label: 'Bahn', icon: 'train-front' },
  flug: { label: 'Flug', icon: 'airplane' },
  bus: { label: 'Bus', icon: 'bus-front' },
  faehre: { label: 'Fähre', icon: 'water' },
  fahrrad: { label: 'Fahrrad', icon: 'bicycle' },
  sonstiges: { label: 'Sonstiges', icon: 'signpost-2' }
}

export const DIRECTION: Record<TravelDirection, string> = {
  hin: 'Hinreise',
  rueck: 'Rückreise'
}
