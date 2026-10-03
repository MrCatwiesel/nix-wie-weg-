# Nix wie weg

Reise-App von der Planung bis zur Reise-Webseite – offline zuerst, als installierbare Web-App (PWA) für Handy, Tablet und PC.

**Stand 0.4.0:** Planung komplett (M1: **Reiseprojekt**, **An- und Rückreise**, **Unterkünfte**, **Unternehmungen**, Budgetvergleich) und Vorbereitung komplett (M2: **Packliste**, **Reiseapotheke**, **Dokumente & Notfall**).

**App online:** https://mrcatwiesel.github.io/nix-wie-weg-/

## Starten

Voraussetzung: [Node.js](https://nodejs.org) 20 oder neuer.

```bash
npm install      # einmalig: Abhängigkeiten laden
npm run dev      # Entwicklungsserver, im Browser http://localhost:5173 öffnen
npm test         # Tests ausführen
npm run build    # fertige App in dist/ (statisch hostbar, z. B. GitHub Pages)
```

Auf dem Handy testen: `npm run dev -- --host` und die angezeigte Netzwerk-Adresse im Handy-Browser öffnen (gleiches WLAN). Offline und „Zum Startbildschirm hinzufügen“ funktionieren im Build (`npm run build && npm run preview -- --host`).

## Auf dem iPad oder einem einfachen Webserver

Die App braucht **keinen Datenbank-Server**: alle Daten liegen im Browser (IndexedDB). Der Server liefert nur die fertigen Dateien aus dem Ordner `dist/` aus.

**Weg A – ganz ohne Computer (GitHub):**
1. Auf github.com ein neues Repository anlegen und den Projektinhalt hochladen („Add file → Upload files“).
2. Settings → Pages → Source: **GitHub Actions** wählen.
3. Unter „Actions“ baut GitHub die App automatisch. Danach:
   - online nutzbar unter `https://<name>.github.io/<repository>/`, oder
   - im Lauf unter „Artifacts“ **nix-wie-weg-app** herunterladen, entpacken und den Inhalt in den Ordner des Tiny-Servers kopieren.

**Weg B – mit einem Computer:** `npm install && npm run build`, dann den Inhalt von `dist/` auf das iPad in den Server-Ordner kopieren.

Wichtig:
- Öffnen in Safari auf demselben iPad über `http://localhost:<port>/` (nicht über die IP-Adresse) – nur dann funktionieren Offline-Modus und „Zum Home-Bildschirm“.
- Die Daten gehören zur Adresse: unter einer anderen Adresse oder einem anderen Port beginnt die App leer. Umzug über Einstellungen → Backup.
- Die Datei `index.html` direkt aus der Dateien-App zu öffnen funktioniert nicht; es braucht den Webserver.

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
    trip/          Modul "Reiseprojekt" (public.ts = Schnittstelle für andere Module)
    travel/        Modul "Anreise"
    accommodation/ Modul "Unterkünfte"
    packing/       Modul "Packliste" (templates.ts = Vorlagen)
    meds/          Modul "Reiseapotheke" (Medikamente, Einnahmeplan, Impfungen)
    documents/     Modul "Dokumente & Notfall"
    activity/      Modul "Unternehmungen"
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
| M1 Planung | Reiseprojekt, Anreise, Unterkünfte, Unternehmungen, Budgetvergleich | erledigt |
| M2 Vorbereitung | Packliste, Reiseapotheke, Dokumente & Notfall | erledigt |
| M3 Unterwegs | Tagesplaner mit Wetter, Öffnungszeiten, Karte offline | offen |
| M4 Tagebuch | Tageseinträge, Fotos, Orte, Ausgaben | offen |
| M5 Webseite | Templates, Highlights, statischer Export | offen |
| M6 Ausbau | Sync, Mitreisende, App Stores, Spenden-Dienste | offen |

## Lizenz

Noch festzulegen (Vorschlag: AGPL-3.0 oder MIT).
