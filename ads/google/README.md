# Bild-Assets fuer Google Ads

Erzeugt mit `node scripts/build-ads.mjs` aus den eigenen Assets der Website:
Schlagzeile, Farben und Wortmarke wie beim Vorschaubild
(`og/kisuno-share-de.png`), Produktaufnahmen aus `assets/shots/`. Keine
gekauften Symbolbilder.

Die Dateien werden bei Google Ads hochgeladen und **nicht** von der Website
ausgeliefert; `ads/` steht deshalb in `.vercelignore`.

## Was hier liegt

| Datei | Format | Groesse | Motiv |
|---|---|---|---|
| `kisuno-de-querformat-1200x628-claim.png` | 1.91:1, Pflicht | 1200 x 628 | Aussage der Startseite, Abzeichenzeile |
| `kisuno-de-querformat-1200x628-verbrauch.png` | 1.91:1, Pflicht | 1200 x 628 | Text links, Verbrauchsdiagramm rechts |
| `kisuno-de-quadrat-1200x1200-rechte.png` | 1:1, Pflicht | 1200 x 1200 | Anbindungen mit Gateway und Direkt |
| `kisuno-de-quadrat-1200x1200-verbrauch.png` | 1:1, Pflicht | 1200 x 1200 | Verbrauch pro Tag, nach Modell |
| `kisuno-de-hochformat-960x1200-rechte.png` | 4:5, optional | 960 x 1200 | Anbindungen mit Gateway und Direkt |
| `kisuno-de-hochformat-960x1200-verbrauch.png` | 4:5, optional | 960 x 1200 | Verbrauch pro Tag, nach Modell |

Sechs verschiedene Bilder, also mehr als die vier, die Google empfiehlt. Alle
als PNG in echtem RGB ohne Alphaebene, alle weit unter der Obergrenze von
5 MB (schwerstes Bild rund 360 KB).

Dazu die Logo-Assets, die Google getrennt von den Bildern fuehrt:

| Datei | Format | Groesse |
|---|---|---|
| `kisuno-logo-quadrat-1200x1200.png` | 1:1, Pflicht | 1200 x 1200 |
| `kisuno-logo-querformat-1200x300.png` | 4:1, optional | 1200 x 300 |

Im Quadrat steht nur das Zeichen aus `icon.svg`. Ein Schriftzug waere bei den
48 Pixeln, mit denen Google das Logo oft ausspielt, nur noch ein grauer
Strich; ausserdem beschneiden einzelne Platzierungen das Quadrat rund, und
das Zeichen liegt weit innerhalb dieses Kreises. Der Schriftzug steht im
Querformat 4:1, wo er lesbar bleibt.

## Regeln, die im Skript stecken

- **Sicherer Bereich:** Google beschneidet je nach Platzierung die Raender.
  Wortmarke, Schlagzeile, Unterzeile und Abzeichen liegen deshalb mit gut elf
  Prozent Abstand zur Kante und damit sicher in den mittleren 80 Prozent. Das
  Skript misst jede Zeile und meldet jede, die darueber hinauslaeuft.
- **Anschnitt statt Verstuemmelung:** Die Aufnahmen sind breiter als die
  Karte. Rechts liegt eine weiche Blende darueber, damit der Schnitt wie ein
  Ausschnitt aussieht und nicht wie ein Fehler. Nach unten wird nie
  beschnitten: die Kartenhoehe folgt dem Seitenverhaeltnis der Aufnahme, damit
  Achsenbeschriftung und Zeilenkanten vollstaendig bleiben.
- **Nur belegte Aussagen:** Die Bildunterschriften stehen wortgleich auf der
  Startseite (`Landing.dc.html`, `features.d1` und `features.d5`), die
  Abzeichen kommen aus `scripts/build-og.mjs`. Kein Satz im Bild, der auf der
  Zielseite nicht auch steht.

## Weitere Sprachen

```
node scripts/build-ads.mjs --langs de,en,fr,it,es
```

Erzeugt denselben Satz je Sprache; die Texte stammen aus dem Skript und aus
`assets/seo-meta-dc.json`.

## Wenn sich die Schlagzeile aendert

Die Schlagzeile kommt aus `assets/seo-meta-dc.json` (Block `landing`,
Schluessel `ogTitle`). Wer sie aendert, laesst danach `build-og.mjs` **und**
`build-ads.mjs` laufen, sonst sagen Vorschaubild und Anzeige zweierlei.
