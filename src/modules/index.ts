import { registerModule } from '@/core/registry'
import { tripModule } from './trip'
import { accommodationModule } from './accommodation'
import { activityModule } from './activity'
import { travelModule } from './travel'

/**
 * Liste der aktiven Module. Ein neues Modul:
 *  1. Ordner src/modules/<id>/ nach docs/MODUL-VORLAGE.md anlegen
 *  2. hier importieren und registrieren
 */
export function registerAllModules(): void {
  registerModule(tripModule)
  registerModule(travelModule)
  registerModule(accommodationModule)
  registerModule(activityModule)
  // registerModule(packingModule)    // M2
  // registerModule(medsModule)       // M2
}
