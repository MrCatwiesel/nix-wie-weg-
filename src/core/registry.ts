import type { RouteRecordRaw } from 'vue-router'

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
  /** Routen des Moduls; Pfade beginnen mit "/<id>" */
  routes: RouteRecordRaw[]
  /** Ziel des Menüeintrags; ohne Angabe erscheint das Modul nicht im Menü */
  navTo?: string
  /** Reihenfolge im Menü (klein = weiter vorne) */
  order?: number
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
