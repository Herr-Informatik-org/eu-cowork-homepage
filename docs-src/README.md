# Dokumentation von EU Cowork AI

Quelle der Doku unter `https://eucowork.ai/docs`. Gebaut mit [Astro](https://astro.build)
und [Starlight](https://starlight.astro.build), beide MIT-Lizenz.

## Wie das mit der Website zusammenpasst

Die Website ist eine reine Sammlung statischer Dateien ohne Build-Schritt und wird per
Vercel-CLI hochgeladen. Damit das so bleibt, erzeugt dieses Projekt ebenfalls nur
statische Dateien und legt sie direkt an die richtige Stelle im Website-Baum:

```
website/
├── docs-src/     ← Quelle (dieses Verzeichnis), nicht im Deployment
└── docs/         ← Bauergebnis, wird ausgeliefert und mitversioniert
```

`docs-src/` steht in `.vercelignore`, `docs/` nicht. Deshalb muss vor jedem Deployment,
das die Doku betrifft, einmal gebaut werden.

## Befehle

```bash
cd website/docs-src
npm install          # einmalig
npm run dev          # Vorschau auf http://localhost:4321/docs
npm run build        # baut nach ../docs
```

Danach wie gewohnt deployen:

```bash
cd website
vercel deploy --prod
```

## Aufbau

```
src/
├── content/docs/          Inhalte
│   ├── index.mdx          Startseite (Deutsch)
│   ├── erste-schritte/    Überblick, Architektur, Systemanforderungen, Schnellstart
│   ├── betrieb/           Installation, Konfiguration, TLS, Update, Backup, Fehler
│   ├── funktionen/        Was Mitarbeitende im Chat tun können
│   ├── administration/    Admin-Panel, Benutzer, Modelle, Verbrauch, Protokolle
│   ├── konnektoren/       MCP, Rechte-Gateway, eigene Konnektoren
│   ├── referenz/          Variablen, Dienste, Befehle, Lizenzen
│   └── en/                dieselbe Struktur auf Englisch
├── components/            SiteTitle (Markenzeile in der Kopfleiste)
├── styles/eucowork.css    Theme, nutzt dieselben Token wie assets/content.css
└── assets/                Logo hell und dunkel
```

Die Navigation entsteht automatisch aus den Verzeichnissen. Die Reihenfolge innerhalb
einer Gruppe steuert `sidebar.order` im Frontmatter. Neue Gruppen werden in
`astro.config.mjs` eingetragen.

## Zweisprachigkeit

Deutsch ist die Grundsprache und liegt direkt unter `content/docs/`. Englisch liegt
unter `content/docs/en/` mit identischen Dateinamen. Fehlt eine englische Seite, zeigt
Starlight automatisch die deutsche Fassung mit einem Hinweis an.

Die Umschaltung sitzt in der Kopfleiste. Die Oberflächentexte von Starlight sind für
beide Sprachen eingebaut.

## Schreibregeln

- Schweizer Rechtschreibung, immer `ss`, nie `ß`
- Keine Gedankenstriche als Satzzeichen
- Anrede in der Sie-Form, sachlich
- Jeder Befehl muss gegen die echte Datei im Repo geprüft sein
- Niemals echte Schlüssel, Tokens oder Kundendaten, nur Platzhalter

## Suche

Die Volltextsuche kommt von [Pagefind](https://pagefind.app) und läuft vollständig im
Browser. Der Index wird beim Bauen erzeugt und liegt unter `docs/pagefind/`. Es gibt
keinen Suchdienst, keinen externen Aufruf und kein Tracking.
