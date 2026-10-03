import type { RouteRecordRaw } from 'vue-router'

/**
 * Ein Abschnitt auf der Reise-Detailseite, den ein Modul beisteuert
 * (z. B. "Unterkünfte · 2 gebucht"). So zeigt die Reise-Seite neue Module an,
 * ohne sie zu kennen.
 */
export interface TripSection {
  title: string
  /** Bootstrap-Icon-Name ohne "bi-" */
  icon: string
  /** Ziel-Route für eine Reise */
  to: (tripId: string) => string
  /** Kurze Zusammenfassung, z. B. "3 Nächte gebucht" */
  summary?: (tripId: string) => Promise<string>
  /** Geplante Kosten dieses Bereichs (für den Budget-Vergleich) */
  plannedCost?: (tripId: string) => Promise<number>
}

/**
 * Vertrag, den jedes Modul erfüllt. Module kennen einander nicht –
 * sie melden sich nur hier beim Kern an.
 */
export interface AppModule {
  /** Eindeutige, kurze ID, z. B. "trip", "packing" */
  id: string
  /** Anzeigename im Menü */
  title: string
  /** Bootstrap-Icon-Name ohne "bi-", z. B. "suitcase" */
  icon: string
  /** Routen des Moduls */
  routes: RouteRecordRaw[]
  /** Ziel des Menüeintrags; ohne Angabe erscheint das Modul nicht im Menü */
  navTo?: string
  /** Reihenfolge im Menü und auf der Reise-Seite (klein = weiter vorne) */
  order?: number
  /** Abschnitt auf der Reise-Detailseite */
  tripSection?: TripSection
  /** Aufräumen, wenn eine Reise gelöscht wird (eigene Daten zur Reise entfernen) */
  onTripDelete?: (tripId: string) => Promise<void>
}

const modules: AppModule[] = []

export function registerModule(mod: AppModule): void {
  if (modules.some((m) => m.id === mod.id)) {
    throw new Error(`Modul "${mod.id}" ist bereits registriert.`)
  }
  modules.push(mod)
}

export function getModules(): readonly AppModule[] {
  return [...modules].sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
}

export function getNavItems() {
  return getModules()
    .filter((m) => m.navTo)
    .map((m) => ({ id: m.id, title: m.title, icon: m.icon, to: m.navTo! }))
}

export function getTripSections(): (TripSection & { moduleId: string })[] {
  return getModules()
    .filter((m) => m.tripSection)
    .map((m) => ({ ...m.tripSection!, moduleId: m.id }))
}

/** Ruft die Aufräum-Funktionen aller Module für eine gelöschte Reise auf. */
export async function notifyTripDeleted(tripId: string): Promise<void> {
  for (const m of getModules()) {
    if (m.onTripDelete) await m.onTripDelete(tripId)
  }
}
