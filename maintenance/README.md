# Kisuno: die Werkstatt-Startseite

Temporäre Startseite vom 11. September 2026. Das bestehende Website-Projekt
liefert sie auf `kisuno.ai` aus. Die Vercel-Domainweiterleitungen von
`eucowork.ai`, `www.eucowork.ai` und `www.kisuno.ai` bleiben bestehen.

## Gestaltung und Bedienung

Das vom Auftraggeber gelieferte Urahara-Bild wurde mit dem eingebauten
Bildgenerator erweitert. Das fertige Webmotiv liegt in
`assets/maintenance/urahara-workshop.webp` (1536 × 1024, rund 254 KiB).
Manrope wird lokal eingebunden; die OFL-Lizenz liegt daneben.

Die Szene besteht seit der zweiten Fassung aus drei unabhängig bewegten
Bildebenen: `background.webp`, `kisuke-cutout.webp` und
`foreground-flowers.webp`. Alle behalten dieselbe Zeichenfläche von
1536 × 1024 Pixeln. Kisuke bewegt sich stärker als der Garten, die vorderen
Blüten nochmals stärker. Auf schmalen Bildschirmen wird der Ausschnitt angepasst.

Die Sprechblase nutzt `bankai-frame.webp`: ein gezeichneter Rahmen mit roten
Nähten, Schnüren und Tusche. Text, Rollenbezeichnung und Schaltfläche bleiben
echtes HTML. Rollenbezeichnung und Tee-Hinweis sind grösser und dunkler;
die Innenabstände halten sie von den Ziernähten fern.

Partikel weichen dem Mauszeiger aus. Zwei kurz nachlaufende Energiefäden mit
Quernähten zeichnen seine Bewegung nach. Jeder Teeklick fügt eine weitere
Tasse hinzu; der wachsende Berg passt sich seiner verfügbaren Fläche an.
Nur die drei jüngsten Tassen dampfen. Vier Antworten wechseln sich ab.
Es werden keine Bestellungen gesendet und keine Daten gespeichert.
Die Effekte lassen sich pausieren, respektieren reduzierte Bewegung und
stoppen bei einem ausgeblendeten Browser-Tab. Der Text bleibt ohne JavaScript lesbar.

Die deutsche Quelle ist `maintenance/index.html`. Die vier Sprachfassungen
entstehen weiterhin aus `scripts/build-i18n.mjs`. Dafür ergänzt der Eintrag `maintenance` den bestehenden Seitenkatalog
unter `/wartung`; seine eigene `origin` hält die Kisuno-Wartungsseite
unabhängig von den noch nicht umbenannten Unterseiten. Die bisherigen
Startseiten bleiben vollständig im Repository erhalten. Vercel ordnet `/`
intern der Wartungsseite zu; `/en`, `/fr`, `/it` und `/es` führen mit einer
temporären Weiterleitung zur jeweiligen Wartungsseite. Das ist erforderlich,
weil vorhandene Sprachverzeichnisse Vorrang vor einem Rewrite haben.
Impressum, Datenschutz, Dokumentation, Blog und Warteliste sind
weiterhin über ihre bestehenden Adressen erreichbar.

## Prüfen und veröffentlichen

Aus dem Verzeichnis `website/`:

```sh
npm run build:all
node --check assets/maintenance/maintenance.js
git diff --check
```

Im Browser wurden Desktop (1440 × 1000), Mobil (390 × 844) und alle fünf
Sprachfassungen bei 320 Pixel Breite geprüft. Mausreaktion mit unterschiedlichen
Verschiebungen der drei Ebenen, echte Teeklicks auf Desktop und Mobil,
200 gleichzeitig vorhandene Tassen mit unterschiedlichen Positionen sowie
Pause-Funktion und reduzierte Bewegung gehören zur Abnahme. Die alte
Startseitenquelle und ihre vier Sprachfassungen sind gegenüber dem unten
genannten Ausgangsstand unverändert. Der lokale statische Vorschau-Server öffnet
`/maintenance/index.html`; Vercel schreibt `/` auf diese Datei um.

Vor der Umsetzung wurde der lokale Stand auf den veröffentlichten Commit
`f891fa5abe57dd34e43cc75a2fc536d44958c16d` aktualisiert. Die vorherige
Produktionsbereitstellung als Rückfall:
`eu-cowork-homepage-lf2a98mnj-josipfxs-projects.vercel.app`.

Für das vollständige Rebranding später die Startseiten-Zuordnung in
`vercel.json`, den Wartungseintrag in `PAGES` und die Wartungsseiten-Metadaten
anpassen und die Sprachfassungen neu erzeugen. `Landing.dc.html` bleibt als
Quelle der bisherigen Startseite erhalten. Dieses Dokument ist in
`.vercelignore` von der Veröffentlichung ausgeschlossen.

## Verwendeter Bildprompt

Werkzeug: eingebauter Bildgenerator, Bearbeitung mit dem angehängten Bild als Referenz.

Die vier Prompts für die Bildebenen und den Rahmen sind vollständig in
`maintenance/layer-prompts.json` gespeichert. Der Generator lieferte bei den
Freistellern ein sichtbares Schachbrett statt eines Alphakanals. Nach ausdrücklicher
Freigabe des Auftraggebers wurden die neutralen Hintergrundflächen lokal
maskiert, eingeschlossene Schachbrettreste entfernt und weiche Blütenränder
von grauen Farbsäumen bereinigt. Fächer und Papierinneres bleiben deckend.
Die fertigen WebP-Dateien besitzen echte Transparenz und wurden einzeln auf
dunklem Grund sowie zusammen im Browser geprüft. Das ursprüngliche Gesamtmotiv
bleibt für die Vorschau beim Teilen erhalten.

> Use case: identity-preserve / background extension. Create a premium cinematic anime illustration for the real Kisuno AI maintenance webpage. Use the ATTACHED Kisuke Urahara drawing as the edit target: preserve the instantly recognizable smiling face, blond hair, striped olive bucket hat, black sunglasses, cheerful open mouth and white folding fan, clean manga ink lines. Extend the cropped bust downward into the upper waist and robe, natural anatomy. Replace all white background with an epic atmospheric scene. Wide landscape 1536x1024 composition: Urahara is large in the RIGHT 45 percent, face centered around x=76%, y=35%, hat top at y=9%, fan around x=70%, y=65%; bottom robe naturally exits frame. The LEFT 50 percent is quiet dark charcoal forest green negative space reserved for real HTML text; NO text in this generated image. Background is a mysterious moonlit Japanese garden/workshop with dramatic distant mountain silhouettes, subtle ruined torii silhouettes, drifting pale green mist over stone, a very large muted terracotta/crimson glowing eclipse disk behind the character, delicate scarlet energy threads and a few red camellia petals. Sophisticated editorial art direction, matte ink and subtle hand-painted anime texture, warm ivory highlights on character, deep ink-black/forest-green shadows, sage and burnt coral accents. Strong contrast, exceptional polished theatrical lighting, bright character face clearly readable, graceful visual storytelling, cheeky relaxed friendly mood, premium not horror. Preserve reference character expression and outfit precisely. No extra people, no gore, no lettering, no logos, no UI, no border, no speech bubble. The speech bubble and all particles will be implemented independently in HTML.
