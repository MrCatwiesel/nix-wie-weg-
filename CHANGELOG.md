# Änderungsprotokoll

## 0.2.1 – 2026-10-03

### Geändert
- Läuft auf jedem einfachen Webserver und in jedem Unterordner (relative Pfade, Hash-Routing `#/trip`)
- GitHub Actions: automatischer Test, Build und Veröffentlichung auf GitHub Pages, fertige App als ZIP-Download
- Anleitung für iPad / Tiny-Server im README

## 0.2.0 – 2026-10-03

### Neu
- Modul „Unterkünfte“: Hotels, Ferienwohnungen, Camping erfassen; Status Idee/Angefragt/Gebucht/Storniert; Preis pro Nacht; Abdeckung der Reisenächte mit Lücken und Doppelbuchungen; Warnung vor ablaufenden kostenlosen Stornofristen
- Modul „Unternehmungen“: Ideen sammeln mit Kategorie, Drinnen/Draußen, Priorität, Dauer, Preis pro Person, Öffnungszeiten; Filter; Status inkl. „erledigt“ per Klick; Warnung bei über 8 Stunden Programm pro Tag
- Reise-Detailseite zeigt die Planungsbereiche der Module mit Zusammenfassung und vergleicht geplante Kosten mit dem Budget
- Kern: Module können Abschnitte auf der Reise-Seite beisteuern (`tripSection`) und beim Löschen einer Reise ihre Daten aufräumen (`onTripDelete`)
- Gemeinsame Hilfen `core/dates.ts` und `core/format.ts`

### Geändert
- Datenbank-Version 2 (neue Tabellen `accommodations`, `activities`), Backup enthält beide

## 0.1.0 – 2026-10-03

### Neu
- Projekt-Grundgerüst: Vue 3, TypeScript, Vite, Bootstrap 5.3, Bootstrap Icons
- PWA: installierbar, läuft offline (Service Worker)
- Kern: lokale Datenbank (Dexie/IndexedDB), Modul-Registry, Router, JSON-Backup (Export/Import)
- Modul „Reiseprojekt“: Reisen anlegen, bearbeiten, löschen; Zeitraum, Personen, Anreiseart, Budget pro Person und Tag
- Mobile Bedienung mit unterer Navigation, Dark Mode nach Systemeinstellung, Offline-Hinweis
- Tests für die Reise-Logik
