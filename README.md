# Nix wie weg

Reise-App von der Planung bis zur Reise-Webseite – offline zuerst, als installierbare Web-App (PWA) für Handy, Tablet und PC.

**Stand 0.1.0:** Kern (lokale Datenbank, Modul-System, Backup) und erstes Modul **Reiseprojekt** (Reisen anlegen, bearbeiten, Budget pro Person und Tag).

## Starten

Voraussetzung: [Node.js](https://nodejs.org) 20 oder neuer.

```bash
npm install      # einmalig: Abhängigkeiten laden
npm run dev      # Entwicklungsserver, im Browser http://localhost:5173 öffnen
npm test         # Tests ausführen
npm run build    # fertige App in dist/ (statisch hostbar, z. B. GitHub Pages)
```

Auf dem Handy testen: `npm run dev -- --host` und die angezeigte Netzwerk-Adresse im Handy-Browser öffnen (gleiches WLAN). Offline und „Zum Startbildschirm hinzufügen“ funktionieren im Build (`npm run build && npm run preview -- --host`).

## Technik

| Baustein | Wahl |
| --- | --- |
| Oberfläche | Vue 3 + TypeScript, Vite |
| Design | Bootstrap 5.3 + Bootstrap Icons, Theme über CSS-Variablen (`src/ui/theme.css`) |
| Daten | IndexedDB über Dexie, nur auf dem Gerät |
| Offline | Service Worker über vite-plugin-pwa |
| Tests | Vitest |

## Projektstruktur

```
src/
  core/            Kern: Datenbank, Modul-Registry, Router, Backup, Einstellungen
  ui/              gemeinsames Theme und (später) gemeinsame Komponenten
  modules/
    index.ts       Liste der aktiven Module
    trip/          Modul "Reiseprojekt"
  services/        (später) Wetter, Karten, Öffnungszeiten, Routen
docs/
  ARCHITEKTUR.md   Regeln und Aufbau
  MODUL-VORLAGE.md So entsteht ein neues Modul
```

## Weiterentwickeln

- Neues Modul: siehe [docs/MODUL-VORLAGE.md](docs/MODUL-VORLAGE.md)
- Architektur-Regeln: siehe [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md)
- Änderungen: [CHANGELOG.md](CHANGELOG.md)

## Roadmap

| Meilenstein | Inhalt | Status |
| --- | --- | --- |
| M0 Fundament | Gerüst, Kern, Datenbank, PWA, Theme | erledigt |
| M1 Planung | Reiseprojekt ✔, Anreise, Unterkünfte, Unternehmungen, Budget | in Arbeit |
| M2 Vorbereitung | Packlisten mit Vorlagen, Medikamente, Dokumente | offen |
| M3 Unterwegs | Tagesplaner mit Wetter, Öffnungszeiten, Karte offline | offen |
| M4 Tagebuch | Tageseinträge, Fotos, Orte, Ausgaben | offen |
| M5 Webseite | Templates, Highlights, statischer Export | offen |
| M6 Ausbau | Sync, Mitreisende, App Stores, Spenden-Dienste | offen |

## Lizenz

Noch festzulegen (Vorschlag: AGPL-3.0 oder MIT).
