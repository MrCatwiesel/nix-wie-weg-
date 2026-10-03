# Architektur

## Grundsätze

1. **Offline zuerst.** Alle Daten liegen in IndexedDB auf dem Gerät. Online-Dienste (Wetter, Karten) ergänzen nur und werden zwischengespeichert.
2. **Module kennen einander nicht.** Jedes Modul meldet sich über `core/registry.ts` an und nutzt nur den Kern. Verknüpfung läuft über IDs (z. B. `tripId`).
3. **Daten nur über Repositories.** Views greifen nie direkt auf `db` zu, sondern auf `<modul>/repository.ts`.
4. **Logik ohne Oberfläche.** Berechnungen und Prüfungen stehen in `<modul>/logic.ts` als reine Funktionen und haben Tests.
5. **Das Reiseprojekt ist die gemeinsame Basis.** Andere Module dürfen nur `modules/trip/public.ts` importieren (Reise lesen, Kopfzeile `TripContextHeader`) – nie andere Dateien aus `trip/` und nie andere Module.
6. **Andocken an die Reise-Seite** über `tripSection` (Titel, Link, Zusammenfassung, geplante Kosten) und Aufräumen über `onTripDelete` in der Modul-Definition.
7. **Bootstrap nicht verändern.** Anpassungen nur über CSS-Variablen in `src/ui/theme.css`.

## Schichten

```
Module (trip, packing, meds, dayplanner, journal, website …)
   │  nutzen nur
   ▼
Kern  (db.ts · registry.ts · router.ts · backup.ts · composables.ts)
   │
   ├── Offline: Service Worker (App, Kartenkacheln, letztes Wetter)
   └── Online-Dienste über src/services/ (Open-Meteo, OpenStreetMap, OpenRouteService)
```

## Datenbank

- Schema steht ausschließlich in `src/core/db.ts`.
- Schemaänderung = neue `version(n + 1)`, alte Versionen bleiben unverändert.
- Jede neue Tabelle auch in `BACKUP_TABLES` (`src/core/backup.ts`) eintragen.
- IDs sind UUIDs (`newId()`), damit später eine Synchronisation zwischen Geräten möglich ist.
- Jeder Datensatz hat `createdAt` und `updatedAt`.

## Reise-Webseite (M5, Ausblick)

Der Generator erzeugt eine **statische** Webseite (HTML + CSS + Bilder) aus ausgewählten Tagebuch-Einträgen. Templates sind Ordner mit Bootstrap-basiertem Layout und eigenen CSS-Variablen – ähnlich WordPress-Themes. Die Seite kann als ZIP exportiert oder auf GitHub Pages / Netlify veröffentlicht werden.

## Entscheidungen

| Datum | Entscheidung | Grund |
| --- | --- | --- |
| 2026-10-03 | PWA statt nativer App | eine Codebasis, offline-fähig, später per Capacitor in die Stores |
| 2026-10-03 | Vue 3 + Bootstrap 5.3 | leicht lesbar, Bootstrap auch für Webseiten-Templates |
| 2026-10-03 | Dexie/IndexedDB | große Datenmengen (Fotos) lokal, Live-Abfragen |
| 2026-10-03 | Reise-Seite über `tripSection` erweiterbar | Reise-Modul muss neue Module nicht kennen |
| 2026-10-03 | Teilnehmer als Namensliste an der Reise (`participants`), Module speichern den Namen im Feld `person` | einfach, offline, ohne eigene Personen-Tabelle; `PersonSelect` aus `trip/public` für alle Formulare |
