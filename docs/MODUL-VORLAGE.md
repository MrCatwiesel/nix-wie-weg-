# Vorlage: neues Modul anlegen

Beispiel: Modul **Packliste** mit der ID `packing`.

## 1. Ordner anlegen

```
src/modules/packing/
  index.ts          Modul-Definition (Name, Icon, Routen)
  types.ts          Datentypen
  logic.ts          reine Funktionen (ohne Datenbank, ohne Vue)
  repository.ts     Datenzugriff
  views/            Seiten (.vue)
  __tests__/        Tests für logic.ts
```

## 2. Tabelle in der Datenbank ergänzen

In `src/core/db.ts` eine **neue** Version anlegen – bestehende nie ändern:

```ts
packingItems!: Table<PackingItem, string>

this.version(2).stores({
  packingItems: 'id, tripId, category, done'
})
```

Danach `'packingItems'` in `BACKUP_TABLES` (`src/core/backup.ts`) eintragen.

## 3. Modul-Definition

```ts
// src/modules/packing/index.ts
import type { AppModule } from '@/core/registry'

export const packingModule: AppModule = {
  id: 'packing',
  title: 'Packliste',
  icon: 'backpack',
  order: 20,
  routes: [
    { path: '/trip/:tripId/packliste', component: () => import('./views/PackingList.vue'), props: true }
  ]
}
```

Module, die zu einer Reise gehören, brauchen meist kein `navTo` – sie werden von der Reise-Detailseite aus verlinkt.

## 4. Registrieren

In `src/modules/index.ts`:

```ts
import { packingModule } from './packing'
registerModule(packingModule)
```

## 5. Fertig, wenn

- [ ] `npm test` grün, Logik hat Tests
- [ ] funktioniert im Flugmodus
- [ ] Daten erscheinen im Backup-Export
- [ ] Eintrag in `CHANGELOG.md`
