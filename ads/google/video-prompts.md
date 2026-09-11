# Video-Anzeige fuer Google Ads: Prompts fuer DaVinci AI

DaVinci AI (`davinci.ai/video-generator`) erzeugt einzelne Clips aus je einem
Prompt, mit Modellwahl (Veo 3.1, Kling 3.0, Seedance, Wan), Seitenverhaeltnis,
Aufloesung, Dauer und optionalem Start- und Endbild. Es ist kein
Skript-zu-Video-Werkzeug. Die Anzeige entsteht im Schnitt aus zwei erzeugten
Clips plus eigenem Material.

**Laenge: 10 Sekunden.** Das ist bewusst kein beliebiger Wert, sondern
entscheidet ueber die Platzierung:

| Format | Laenge | 10 Sekunden? |
|---|---|---|
| In-Stream nicht ueberspringbar | 7 bis 15 s | ja, das Zielformat |
| In-Stream ueberspringbar | ab 12 s | nein, zu kurz |
| Bumper | bis 6 s | nein, zu lang, siehe Fassung B |
| Demand Gen, In-Feed, Shorts | frei | ja |

Nicht ueberspringbar heisst: die zehn Sekunden laufen ganz. Es braucht also
keinen Rettungshaken in Sekunde fuenf, wohl aber einen Schluss, der steht,
denn der Aufruf wird garantiert gesehen. Wer zusaetzlich ueberspringbar
ausliefern will, braucht eine zweite Fassung ab zwoelf Sekunden.

## Was der Generator liefern darf und was nicht

Dieselbe Regel wie bei den Bild-Assets: **kein Satz und kein Bild, das auf der
Zielseite nicht belegt ist.** Daraus folgt die Arbeitsteilung.

| Baustein | Woher |
|---|---|
| Stimmung, Landschaft, Rechenzentrum | DaVinci AI |
| Produktoberflaeche | `assets/shots/*.webp`, echte Aufnahmen |
| Schrift im Bild, Wortmarke, Adresse | Schnittprogramm oder `ads/google/*.png` |
| Sprecherstimme | separat aufgenommen oder TTS, nicht generiert |

Generatoren setzen Schrift unzuverlaessig und erfinden Oberflaechen. Beides
gehoert deshalb nicht in den Prompt, sondern in den Schnitt. Jeder Prompt unten
verbietet Schrift, Logos und Bildschirminhalte ausdruecklich.

**Empfehlung: keine erfundenen Menschen.** Wer Nachweisbarkeit verkauft, sollte
nicht mit einer synthetischen Buerokraft werben, die es nie gab; ein Mensch im
Bild wirkt zudem schnell wie eine Kundenstimme, und Kunden gibt es vor dem
Launch keine. Der Satz unten kommt ohne Personen aus. Eine Variante mit Person
steht am Ende, falls sie doch gewuenscht ist.

## Zeichengrenze: 1000 je Prompt

Das Eingabefeld nimmt hoechstens 1000 Zeichen. Alle Prompts unten liegen
darunter, und zwar mit Reserve fuer den Hochformat-Zusatz, der bei 9:16
angehaengt wird.

| Prompt | Zeichen | mit Hochformat-Zusatz |
|---|---|---|
| Clip A, Talkessel | 621 | 758 |
| Clip B, Rechenzentrum | 680 | 817 |
| Clip B alternativ, eigener Server | 658 | 797 |
| Variante mit Person | 750 | 887 |

Nachmessen nach jeder Aenderung:

    awk '/^```$/{f=!f; if(!f){printf "Block %d: %d Zeichen\n", ++n, len; len=0} next} f{len+=length($0)+1}' ads/google/video-prompts.md

Wenn gekuerzt werden muss, faellt zuerst die Ausschlussliste am Ende: sie ist
nach abnehmender Wichtigkeit sortiert, das Letzte darf gehen. Nie fallen
duerfen "live action", "no people", das Verbot von Schrift und Logos sowie die
Audiozeile. Ohne sie legt der Generator Musik unter und stellt Beschriftungen
ins Bild, und beides macht den Clip unbrauchbar.

## Fassung A: 10 Sekunden, In-Stream nicht ueberspringbar (16:9)

Vier Einstellungen, mehr traegt die Laenge nicht. Jede Zeile im Bild bleibt
unter sechs Woertern, sonst ist sie in ihrer Standzeit nicht lesbar.

| Zeit | Bild | Text im Bild |
|---|---|---|
| 0.0 bis 2.8 s | Clip A, Talkessel im Morgenlicht | Wortmarke, darunter: Die KI-Plattform fuer Ihr Unternehmen. |
| 2.8 bis 5.6 s | `assets/shots/admin-mcp-rechte.webp`, langsamer Zoom | Verbunden mit Ihren Daten. Alles auditiert. |
| 5.6 bis 8.0 s | Clip B, Serverreihe | Betrieben in der Schweiz. |
| 8.0 bis 10.0 s | Standbild aus `kisuno-de-querformat-1200x628-claim.png` | kisuno.ai, Auf die Warteliste |

Die Schlusstafel bekommt volle zwei Sekunden. Weniger reicht nicht, um eine
Adresse zu lesen und zu behalten, und sie ist der einzige Grund, warum die
Anzeige laeuft.

### Clip A, Aufhaenger, 0.0 bis 2.8 s

```
Cinematic aerial shot, live action, no people. Slow drone push forward over a
wide Alpine valley shortly after sunrise: a small town in the hollow, thin fog
over the fields, dark forested ridges on both sides, snow on the far peaks
catching the first warm light. Camera: steady forward move with a slow descent,
24mm equivalent, level horizon, no roll. Natural muted grade, cool blue shadows
against warm gold peaks, subtle film grain, documentary realism, no lens flare.
Audio: faint wind only, no music, no speech.
Negative: text, letters, captions, logos, watermarks, signage, flags, people,
vehicles, oversaturation.
```

### Clip B, Rechenzentrum, 5.6 bis 8.0 s

```
Cinematic tracking shot inside a modern data centre, live action, no people.
The camera glides steadily forward down a narrow aisle between two rows of tall
dark server racks; hundreds of small status lights, cool white and blue light
from above, faint haze in the air, polished floor with soft reflections.
Camera: smooth steadicam dolly forward at walking pace, 24mm lens, centred one
point perspective, slight low angle. Cool desaturated grade, deep blacks,
restrained teal highlights, fine grain.
Audio: low hum of cooling fans, no music, no speech.
Negative: text, letters, readable screens, captions, logos, watermarks, people,
strobing lights, neon, hologram, sci-fi look.
```

### Clip B als Alternative: eigener Server

Wenn die Anzeige auf den Selbstbetrieb zielen soll statt auf den betreuten
Betrieb, tritt dieser Clip an die Stelle von B. Die Zeile im Bild lautet dann
"Oder auf Ihrem eigenen Server."

```
Cinematic close-up, live action, no people. A single small rack mounted server
in a plain utility room of an ordinary office building: two mounted units, a
neat bundle of network cables, one green link light blinking, painted wall
behind. Warm practical ceiling light from the left, dust motes in the air.
Camera: slow lateral dolly to the right, 50mm lens, shallow depth of field,
focus on the blinking link light. Natural grade, warm neutral tones, gentle
contrast, fine grain, unglamorous documentary look.
Audio: quiet fan noise, no music, no speech.
Negative: text, letters, captions, logos, watermarks, people, hands, neon,
hologram, glossy 3D render.
```

### Sprechertext, Deutsch

> Ein KI-Kollege fuer Ihre Firma, verbunden mit Ihren eigenen Systemen und
> betrieben in der Schweiz oder auf Ihrem Server. Auf die Warteliste:
> kisuno punkt ai.

25 Woerter, das ist bei Anzeigentempo die Obergrenze fuer zehn Sekunden. Wer
mehr unterbringen will, kuerzt das Bild, nicht die Sprechpausen. Nicht vom
Generator sprechen lassen: die Aussprache von "kisuno.ai" und die Betonung im
Deutschen sind zu unsicher.

## Fassung B: 6 Sekunden, Bumper

Ein Clip, ein Satz, eine Schlusstafel: Clip A auf 4 Sekunden, danach 2 Sekunden
Schlusstafel. Laeuft als eigenes Format neben Fassung A und braucht keinen
zweiten Dreh, weil derselbe Clip A genuegt.

Sprechertext: *Der KI-Kollege fuer Ihre Firma. Auf die Warteliste: kisuno
punkt ai.* Text im Bild wie in Fassung A, Einstellung 1 und 4.

## Hochformat 9:16 und Quadrat 1:1

Dieselben Prompts, nur das Seitenverhaeltnis im Werkzeug umstellen und **nicht**
beschneiden. Im Prompt zusaetzlich anhaengen:

```
Vertical 9:16 framing, the horizon in the lower third, generous empty sky in
the upper third so that captions can be placed there later.
```

Beim Server-Clip statt dessen:

```
Vertical 9:16 framing, the server centred in the lower half, plain wall filling
the upper half so that captions can be placed there later.
```

## Einstellungen im Werkzeug

- **Modell:** Veo 3.1 fuer Clip A, dort zaehlt natuerliches Licht. Kling 3.0
  fuer Clip B, es haelt eine gerade Kamerafahrt am ruhigsten. Erst mit einem
  guenstigen Modell (Wan, Seedance) den Bildaufbau suchen, dann teuer final
  rendern.
- **Dauer:** trotzdem 8 Sekunden je Clip erzeugen, auch wenn nur knapp 3
  gebraucht werden. Aus acht Sekunden laesst sich das ruhigste Stueck
  herausschneiden; eine auf drei Sekunden erzeugte Fahrt hat keinen Anlauf und
  wirkt abgehackt.
- **Aufloesung:** 1080p genuegt, YouTube liefert Anzeigen nicht hoeher aus.
- **Start- und Endbild:** leer lassen. Eine generierte Fahrt in eine Texttafel
  hinein verzieht die Schrift; die Tafel wird geschnitten, nicht generiert.
- **Anzahl:** drei bis vier Durchlaeufe je Prompt, dann den ruhigsten nehmen.
  Ausschussgrund ist fast immer eine kippende Kamera oder ein Objekt, das im
  Bild waechst.

Zwei Clips statt drei: das ist der ganze Unterschied zur 20-Sekunden-Fassung
und halbiert die Rechenkosten.

## Regeln, die eingehalten werden muessen

- **Belegte Aussagen.** Die Zeilen im Bild stehen wortgleich auf der Startseite:
  Ueberschrift aus `Landing.dc.html` (`hero2.h1a`, `h1b`), "Alles auditiert" aus
  `features.d5`, "verbunden mit Ihren Daten" und "betrieben in der Schweiz" aus
  `assets/seo-meta-dc.json` (`landing.de.ogDescription`). Der Preis steht in der
  Anzeige gar nicht.
- **ISO 27001 gehoert Green.** Wenn ein Abzeichen erscheint, dann mit dem
  Wortlaut der Seite ("Rechenzentrum Schweiz"), nicht als eigene Zertifizierung.
- **Keine Kundenstimme.** Das Produkt ist vor dem Launch. Kein Bild und kein
  Satz darf nahelegen, dass jemand es bereits einsetzt.
- **Keine Gedankenstriche** im Bildtext, wie ueberall sonst.
- **Hochladen:** Google Ads spielt Videoanzeigen nur von YouTube aus. Das
  fertige Video muss dort oeffentlich oder nicht gelistet liegen.

## Variante mit Person, falls doch gewuenscht

Tritt an die Stelle von Clip A.

```
Cinematic live action shot. A person in a plain knit sweater sits down at a
light wood desk in a small modern office, opens a laptop and begins to type;
seen from behind over the left shoulder, face not visible. Through the window:
low buildings, bare trees, soft hills in the haze. Early morning light, cool
outside, warm lamp inside. The laptop screen is out of focus and reads only as
a soft even glow. Camera: slow dolly push from wide to medium, 35mm lens,
shallow depth of field, subtle handheld movement. Muted natural grade, fine
grain, documentary tone, not glossy.
Audio: quiet room tone and keyboard clicks, no music, no speech.
Negative: text, letters, captions, logos, watermarks, readable screen content,
visible face, distorted hands.
```

Das Gesicht bleibt bewusst verdeckt: es haelt die Aufnahme auf der Ebene einer
Illustration und nicht auf der einer Person, die es nicht gibt.
