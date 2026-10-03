# Architektur

## Grundsätze

1. **Offline zuerst.** Alle Daten liegen in IndexedDB auf dem Gerät. Online-Dienste (Wetter, Karten) ergänzen nur und werden zwischengespeichert.
2. **Module kennen einander nicht.** Jedes Modul meldet sich über `core/registry.ts` an und nutzt nur den Kern. Verknüpfung läuft über IDs (z. B. `tripId`).
3. **Daten nur über Repositories.** Views greifen nie direkt auf `db` zu, sondern auf `<modul>/repository.ts`.
4. **Logik ohne Oberfläche.** Berechnungen und Prüfungen stehen in `<modul>/logic.ts` als reine Funktionen und haben Tests.
5. **Öffentliche Schnittstellen.** Module importieren voneinander nur die Datei `public.ts` (z. B. `trip/public.ts`, `activity/public.ts`), nie deren innere Dateien. Abhängigkeiten nur in eine Richtung: Basis-Module (Reise, Unternehmungen) kennen die Aufbau-Module (Tagesplaner) nicht.
6. **Andocken an die Reise-Seite** über `tripSection` (Titel, Link, Zusammenfassung, geplante Kosten) und Aufräumen über `onTripDelete` in der Modul-Definition.
7. **Bootstrap nicht verändern.** Anpassungen nur über CSS-Variablen in `src/ui/theme.css`.

## Schichten

```
Module (trip, packing, meds, dayplanner, journal, website …)
   │  nutzen nur
   ▼
Kern  (db.ts · registry.ts · router.ts · backup.ts · composables.ts · dates.ts · format.ts)
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

## Reise-Webseite (M5)

Der Generator (`modules/website`) erzeugt **eine einzige HTML-Datei**: Bootstrap-CSS, Vorlagen-CSS, Texte und alle Fotos (als data:-URL, auf die gewählte Größe verkleinert) sind eingebettet, dazu ein kleines Skript für die Fotoansicht. Die Datei funktioniert ohne Internet und lässt sich teilen oder auf GitHub Pages hochladen.

- `logic.ts`: Daten aufbereiten (`buildSiteData`), sicheres HTML (`esc`, `paragraphs`)
- `templates/<name>.ts`: eine Vorlage = CSS + Funktion, die den `<body>` liefert; Registrierung in `templates/index.ts`, Beschreibung in `TEMPLATE_INFO`
- `render.ts`: setzt das Dokument zusammen (Kopf, Farben, Schrift, Hell/Dunkel, Fotoansicht)
- Alle Nutzertexte laufen durch `esc()`, Farben durch `safeColor()`.

## Entscheidungen

| Datum | Entscheidung | Grund |
| --- | --- | --- |
| 2026-10-03 | PWA statt nativer App | eine Codebasis, offline-fähig, später per Capacitor in die Stores |
| 2026-10-03 | Vue 3 + Bootstrap 5.3 | leicht lesbar, Bootstrap auch für Webseiten-Templates |
| 2026-10-03 | Dexie/IndexedDB | große Datenmengen (Fotos) lokal, Live-Abfragen |
| 2026-10-03 | Reise-Seite über `tripSection` erweiterbar | Reise-Modul muss neue Module nicht kennen |
| 2026-10-03 | Teilnehmer als Namensliste an der Reise (`participants`), Module speichern den Namen im Feld `person` | einfach, offline, ohne eigene Personen-Tabelle; `PersonSelect` aus `trip/public` für alle Formulare |
