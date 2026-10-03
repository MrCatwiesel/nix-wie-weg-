# Änderungsprotokoll

## 0.5.0 – 2026-10-03

### Neu
- Modul „Reiseapotheke“ mit drei Bereichen:
  - Medikamente: Dauermedikation, bei Bedarf, Notfall; Bedarf für Reisetage plus 3 Tage Reserve, Vorratsprüfung, Warnung bei Ablauf vor oder während der Reise; Rezept, Handgepäck, Kühlen; abhaken beim Packen
  - Einnahmeplan: alle Einnahmen eines Tages nach Uhrzeit, filterbar nach Person
  - Impfungen: Status Prüfen/Termin/Erledigt, Hinweis wenn Schutz vor Reiseende endet
- Grundausstattung Reiseapotheke mit einem Klick (ohne Dosierungen)

### Geändert
- Datenbank-Version 5 (neue Tabellen `medications`, `vaccinations`), Backup enthält sie

## 0.4.0 – 2026-10-03

### Neu
- Modul „Packliste“: abhaken mit Fortschrittsbalken, Kategorien zum Auf- und Zuklappen, Suche, Filter „nur offene“ und nach Person
- 9 Vorlagen (Grundausstattung, Strand, Wandern, Stadt, Winter, Camping, Kinder, Auto, Flug); Mengen nach Reisetagen und Personen, Doppeltes wird zusammengefasst
- Passende Vorlage zur Anreiseart wird vorausgewählt
- Packliste einer früheren Reise übernehmen
- Schnelleingabe mit Menge („3x Socken“), wichtige Dinge markieren und Warnung, wenn sie fehlen
- „Alle Häkchen entfernen“ zum Packen für die Rückreise

### Geändert
- Datenbank-Version 4 (neue Tabelle `packingItems`), Backup enthält sie

## 0.3.0 – 2026-10-03

### Neu
- Modul „An- und Rückreise“: Etappen mit Auto, Bahn, Flug, Bus, Fähre, Fahrrad; Fahrzeit (auch über Mitternacht), Kilometer, Kosten je Richtung
- Auto: Spritkosten-Rechner (Verbrauch × Preis) plus Maut/Vignette; Pausenempfehlung alle 2 Stunden
- Hinweis auf Lücken zwischen Etappen; Reihenfolge per Pfeil änderbar; Rückreise mit einem Klick aus der Hinreise erzeugen
- Route direkt in Apple Karten oder Google Maps öffnen
- Neue Etappen werden vorbelegt (Start = letztes Ziel, Datum, Verkehrsmittel, Verbrauch)
- Budgetvergleich enthält jetzt auch die Anreisekosten

### Geändert
- Datenbank-Version 3 (neue Tabelle `travelLegs`), Backup enthält sie

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
