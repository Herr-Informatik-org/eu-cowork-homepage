/* =============================================================================
   Erzeugt die Vorschaubilder (Open Graph) fuer die Startseite, eines je Sprache.

   Warum es die gibt: Wer eucowork.ai in WhatsApp, LinkedIn oder Slack teilt,
   sieht zuerst diese Karte, sonst nichts. Sie muss deshalb in drei Sekunden
   sagen, worum es geht, und darf nichts behaupten, was die Website nicht
   belegt.

   Warum je Sprache eine: Bis hierher zeigten alle fuenf Sprachfassungen
   dasselbe deutsche Bild. Wer den franzoesischen Link teilte, bekam eine
   deutsche Karte.

   Wie der Text ins Bild kommt: nicht als <text>. librsvg, das sharp zum
   Rastern benutzt, wertet @font-face nicht aus (getestet, mit woff2 und mit
   ttf, als Datei und als data:-URI) und faellt still auf irgendeine Schrift
   der Maschine zurueck. Stattdessen setzt textPath() unten die Zeilen selbst
   aus Glyphenumrissen, die scripts/og-glyphs.py aus fonts/*.woff2 geschnitten
   hat. Im fertigen SVG steht nur noch <path>: kein Schriftname, keine
   Abhaengigkeit von der Maschine, und die Zeilenbreite ist vor dem Rendern
   bekannt und damit pruefbar (siehe fit() weiter unten).

   Aufruf: node scripts/build-og.mjs
   Erzeugt: og/eucowork-share-<lang>.png und daneben das SVG unter og/src/.
   ============================================================================= */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL('..', import.meta.url));
/* sharp haengt an der Dokumentation (docs-src) und nicht am Wurzelprojekt.
   Die Website selbst soll ohne npm install baubar bleiben; dieses Skript
   laeuft nur, wenn jemand die Bilder neu erzeugt. */
const sharp = require(join(ROOT, 'docs-src/node_modules/sharp/lib/index.js'));

const LANGS = ['de', 'en', 'fr', 'it', 'es'];

/* --------------------------------- Farben ---------------------------------
   Alle Werte stammen aus assets/content.css, damit die Karte dieselbe
   Handschrift traegt wie die Seite, auf die sie zeigt. */
const C = {
  bg:      '#FAFAF7',  /* --c-bg,       Knochenweiss */
  ink:     '#0B1E33',  /* --c-ink       */
  body:    '#41505E',  /* --c-body      */
  eu700:   '#12326B',  /* --c-eu-700    */
  eu500:   '#2E6C86',  /* --c-eu-500    */
  ice300:  '#A5D8E6',  /* --c-ice-300   */
  iceTint: '#EAF3F7',  /* --c-ice-tint  */
  gold:    '#F4C542',  /* --c-gold-500  */
  line:    '#E7ECF0',  /* --c-line      */
  surface: '#FFFFFF'   /* --c-surface   */
};

/* --------------------------------- Inhalt ---------------------------------

   Die Schlagzeile steht NICHT hier. Sie wird aus assets/seo-meta-dc.json
   gelesen (Block landing, Schluessel ogTitle) und nur um den Markennamen
   gekuerzt, der oben links schon als Wortmarke steht. Grund: Bis hierher
   trug das Bild "Ihr KI-Kollege. Bleibt in Europa.", waehrend der Titel
   daneben etwas anderes sagte. Zwei Orte fuer denselben Satz driften
   auseinander, sobald einer davon angefasst wird. Ein Ort kann das nicht.
   Wer den Titel aendert, laesst danach node scripts/build-og.mjs laufen,
   und die Karte zieht mit.

   Die beiden Unterzeilen sind der Teil, den ein Laie liest. Sie sagen, was
   das Ding tut: ein Chat fuer die Firma, verbunden mit den eigenen Daten,
   betrieben in der Schweiz. Keine Abkuerzung, kein Fachwort. Belegt durch
   llms.txt ("eine browserbasierte Chat-Plattform, die Sprachmodelle mit den
   Systemen der Firma verbindet") und den Funktionsblock auf der Startseite
   (Websuche, Dateien erzeugen, ERP-Anbindung).

   Die Abzeichenzeile trug bis hierher "MIT-Lizenz", "ISO 27001" und "revDSG".
   Zwei davon stimmten so nicht:
     - ISO 27001 ist die Zertifizierung von Green als Rechenzentrumsbetreiber,
       nicht von EU Cowork AI (sicherheit/index.html:181 und :304). Geblieben
       ist die Aussage, die traegt und stimmt: das Rechenzentrum steht in der
       Schweiz.
     - "MIT-Lizenz" las sich wie "liegt offen da". Das Release-Repository ist
       heute nicht oeffentlich; die Website schreibt seit dieser Woche
       "Quellcode ab Start" (Landing.dc.html, Schluessel selfhost.badge).
   revDSG stimmt und bleibt; dazu die DSGVO, beides vertraglich zugesichert
   (llms.txt, Abschnitt Datenschutz und Compliance). In FR, IT und ES heisst
   das Schweizer Gesetz auf der Website "nLPD", nicht "revDSG"; die Karte
   folgt der jeweiligen Sprachfassung.
   ------------------------------------------------------------------------- */
const CONTENT = {
  de: {
    sub: [
      'Ein Chat für Ihre Firma: Fragen, Recherche, Dateien.',
      'Verbunden mit Ihren eigenen Daten. Betrieben in der Schweiz.'
    ],
    badges: ['Rechenzentrum Schweiz', 'Quellcode ab Start', 'revDSG & DSGVO']
  },
  en: {
    sub: [
      'A chat for your company: questions, research, files.',
      'Connected to your own data. Operated in Switzerland.'
    ],
    badges: ['Swiss data centre', 'Source code at launch', 'revDSG & GDPR']
  },
  fr: {
    sub: [
      'Un chat pour votre entreprise : questions, recherche, fichiers.',
      'Relié à vos propres données. Exploité en Suisse.'
    ],
    badges: ['Centre de données suisse', 'Code source au lancement', 'nLPD & RGPD']
  },
  it: {
    sub: [
      'Una chat per la sua azienda: domande, ricerca, file.',
      'Collegata ai suoi dati. Gestita in Svizzera.'
    ],
    badges: ['Data center svizzero', 'Codice sorgente dal lancio', 'nLPD & GDPR']
  },
  es: {
    sub: [
      'Un chat para su empresa: preguntas, búsqueda, archivos.',
      'Conectado a sus propios datos. Operado en Suiza.'
    ],
    badges: ['Centro de datos suizo', 'Código fuente al lanzamiento', 'nLPD & RGPD']
  }
};

/* --------------------------------- Raster ---------------------------------
   1200 x 630 ist das Format, das Facebook, LinkedIn, WhatsApp, Slack und X
   gleichermassen erwarten. Der Aufbau ist der des bisherigen Bildes: Marke
   oben links, grosse Schlagzeile, zwei ruhige Unterzeilen, ein kurzer
   Trennstrich, unten die Abzeichenzeile. */
const W = 1200;
const H = 630;
const PAD = 72;              /* linker Rand, wie im bisherigen Bild */
const TEXT_MAX = 900;        /* rechts davon beginnt die Luft fuer den Verlauf */

const BRAND_Y = 92;          /* Grundlinie der Wortmarke */
const H1_SIZE = 76;
const H1_BASE = [232, 310];  /* Grundlinien der beiden Schlagzeilenzeilen */
const SUB_SIZE = 25;
const SUB_BASE = [392, 428];
const RULE_Y = 478;
const BADGE_TOP = 502;
const BADGE_H = 44;
const BADGE_SIZE = 15;
const BADGE_PAD = 19;
const BADGE_GAP = 14;

/* ------------------------- Schlagzeile aus dem Titel -------------------------

   Der Titel lautet "EU Cowork AI: Ihr KI-Kollege. Bleibt in Europa." (FR mit
   Leerzeichen vor dem Doppelpunkt). Weg faellt der Markenname, denn der steht
   oben links schon als Wortmarke; uebrig bleiben zwei Saetze, und die werden
   die zwei Zeilen der Schlagzeile. Faellt der Titel einmal anders aus, nimmt
   die Karte die naechstbeste Teilung und meldet es beim Bauen.

   Hervorgehoben wird das letzte Wort der zweiten Zeile, so wie bisher
   "Europa" gelb hinterlegt war. Die Regel traegt auch, wenn der Satz
   spaeter wieder "100 % europaeisch" heisst. */
function headline(ogTitle) {
  const withoutBrand = ogTitle.replace(/^EU Cowork AI\s*:\s*/i, '').trim();
  const sentences = withoutBrand.match(/[^.]+\.?/g)?.map(s => s.trim()).filter(Boolean) ?? [];
  const lines = sentences.length === 2 ? sentences : [withoutBrand];
  /* In FR, IT und ES faengt der Titel hinter dem Doppelpunkt klein an
     ("EU Cowork AI : votre collegue IA."). Als eigenstaendige Zeile ohne den
     Markennamen davor muss der Satz gross beginnen. */
  lines[0] = lines[0].charAt(0).toUpperCase() + lines[0].slice(1);
  const last = lines[lines.length - 1];
  const words = last.replace(/\.$/, '').split(' ');
  return { lines, highlight: words[words.length - 1] };
}

/* ------------------------------ Schriftsatz ------------------------------ */

const FONTS = {};

async function loadFonts() {
  for (const [key, file] of [
    ['regular', 'og/src/glyphs-inter-400.json'],
    ['semibold', 'og/src/glyphs-inter-600.json'],
    ['mono', 'og/src/glyphs-mono-400.json']
  ]) {
    FONTS[key] = JSON.parse(await readFile(join(ROOT, file), 'utf8'));
  }
}

/* Breite einer Zeile in px, vor dem Rendern. Damit laesst sich pruefen, ob
   eine Uebersetzung ueber den Rand laeuft, statt es hinterher am Bild zu
   merken. */
function measure(text, font, size) {
  const s = size / font.unitsPerEm;
  let units = 0;
  for (let i = 0; i < text.length; i++) {
    const g = font.glyphs[text[i]];
    if (!g) throw new Error(`Zeichen "${text[i]}" (U+${text.codePointAt(i).toString(16).toUpperCase()}) fehlt im Glyphenvorrat. scripts/og-glyphs.py mit erweitertem CHARSET neu laufen lassen.`);
    units += g.a;
    const k = font.kern[text[i] + text[i + 1]];
    if (k) units += k;
  }
  return units * s;
}

/* Setzt eine Zeile als Gruppe von Umrissen. Die Gruppe kippt die Y-Achse
   (scale(s,-s)), weil Schriftkoordinaten nach oben zaehlen und SVG nach
   unten; die einzelnen Glyphen werden darin nur noch verschoben. */
function textPath(text, font, size, x, baseline, fill, opacity) {
  const s = size / font.unitsPerEm;
  let pen = 0;
  const parts = [];
  for (let i = 0; i < text.length; i++) {
    const g = font.glyphs[text[i]];
    if (g.d) parts.push(`<path transform="translate(${round(pen)} 0)" d="${g.d}"/>`);
    pen += g.a;
    const k = font.kern[text[i] + text[i + 1]];
    if (k) pen += k;
  }
  const op = opacity === undefined ? '' : ` opacity="${opacity}"`;
  return `<g transform="translate(${round(x)} ${round(baseline)}) scale(${s.toFixed(6)} ${(-s).toFixed(6)})" fill="${fill}"${op}>${parts.join('')}</g>`;
}

function round(n) {
  return Math.round(n * 100) / 100;
}

/* Passt die Schriftgroesse an, falls eine Uebersetzung laenger geraten ist
   als die deutsche Vorlage. Lieber zwei Punkt kleiner als ein Wort, das aus
   dem Bild laeuft. */
function fit(text, font, size, maxWidth) {
  let s = size;
  while (s > 8 && measure(text, font, s) > maxWidth) s -= 0.5;
  return s;
}

/* ------------------------------- Hintergrund -------------------------------
   Die weiche Aurora rechts ist dieselbe Idee wie im bisherigen Bild und auf
   der Startseite: kaltes Eisblau, das aus der rechten oberen Ecke in das
   Knochenweiss laeuft. Gebaut aus wenigen Ellipsen hinter einem
   Weichzeichner, damit keine Kanten entstehen. */
function background() {
  return `
  <defs>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="70"/>
    </filter>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.ink}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${C.ink}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.bg}" stop-opacity="0.94"/>
      <stop offset="0.45" stop-color="${C.bg}" stop-opacity="0.72"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <g filter="url(#soft)">
    <ellipse cx="1010" cy="150" rx="430" ry="300" fill="${C.ice300}" opacity="0.62"/>
    <ellipse cx="820" cy="60"  rx="300" ry="200" fill="${C.iceTint}" opacity="0.9"/>
    <ellipse cx="1180" cy="430" rx="260" ry="230" fill="${C.ice300}" opacity="0.34"/>
    <ellipse cx="1120" cy="620" rx="240" ry="170" fill="${C.eu500}" opacity="0.10"/>
    <ellipse cx="700" cy="330" rx="240" ry="220" fill="${C.iceTint}" opacity="0.7"/>
  </g>
  <rect width="${W}" height="${H}" fill="url(#veil)"/>`;
}

/* Die Wortmarke: dasselbe Zeichen wie icon.svg, daneben "EU Cowork" in Tinte
   und "AI" im Europa-Blau. */
function brand() {
  const size = 34;
  const y = BRAND_Y - 25;
  const mark = `
  <g transform="translate(${PAD} ${y})">
    <rect width="${size}" height="${size}" rx="${size * 7 / 32}" fill="${C.ink}"/>
    <g transform="scale(${size / 32}) translate(3.5 4)">
      <path d="M2.5 21.5 L10.5 6.5 L14.5 14 L17.5 8.5 L23.5 21.5 Z" fill="none" stroke="${C.bg}" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="17.5" cy="5.4" r="2.4" fill="${C.gold}"/>
    </g>
  </g>`;
  const x = PAD + size + 14;
  const name = 'EU Cowork ';
  const wordmark =
    textPath(name, FONTS.semibold, 27, x, BRAND_Y, C.ink) +
    textPath('AI', FONTS.semibold, 27, x + measure(name, FONTS.semibold, 27), BRAND_Y, C.eu700);
  return mark + wordmark;
}

/* Die gelbe Markierung sitzt hinter genau einem Wort der zweiten
   Schlagzeilenzeile, wie bisher hinter "Europa". Gold ist auf dieser Website
   Interpunktion und nie Flaeche, deshalb bleibt es eine duenne Lasur. */
function highlight(line, word, font, size, x, baseline) {
  const at = line.lastIndexOf(word);
  if (at < 0) return '';
  const before = measure(line.slice(0, at), font, size);
  const width = measure(word, font, size);
  const top = baseline - size * 0.80;
  const height = size * 1.06;
  return `<rect x="${round(x + before - 8)}" y="${round(top)}" width="${round(width + 16)}" height="${round(height)}" rx="3" fill="${C.gold}" opacity="0.42"/>`;
}

function badges(list) {
  const font = FONTS.mono;
  const widths = list.map(t => measure(t, font, BADGE_SIZE));
  let x = PAD;
  const out = [];
  for (let i = 0; i < list.length; i++) {
    const w = widths[i] + BADGE_PAD * 2;
    out.push(`<rect x="${round(x)}" y="${BADGE_TOP}" width="${round(w)}" height="${BADGE_H}" rx="${BADGE_H / 2}" fill="${C.surface}" stroke="${C.line}" stroke-width="1.5"/>`);
    out.push(textPath(list[i], font, BADGE_SIZE, x + BADGE_PAD, BADGE_TOP + 28, C.body));
    x += w + BADGE_GAP;
  }
  return { svg: out.join(''), width: x - BADGE_GAP - PAD };
}

/* --------------------------------- Aufbau --------------------------------- */

function buildSvg(lang, head, report) {
  const c = CONTENT[lang];
  const parts = [background(), brand()];

  head.lines.forEach((line, i) => {
    const size = fit(line, FONTS.semibold, H1_SIZE, TEXT_MAX - PAD);
    const base = H1_BASE[i];
    const isLast = i === head.lines.length - 1;
    if (isLast && head.highlight) parts.push(highlight(line, head.highlight, FONTS.semibold, size, PAD, base));
    parts.push(textPath(line, FONTS.semibold, size, PAD, base, C.ink));
    report.push({ what: `h1[${i}]`, size, width: measure(line, FONTS.semibold, size) });
  });

  c.sub.forEach((line, i) => {
    const size = fit(line, FONTS.regular, SUB_SIZE, TEXT_MAX - PAD);
    parts.push(textPath(line, FONTS.regular, size, PAD, SUB_BASE[i], C.body));
    report.push({ what: `sub[${i}]`, size, width: measure(line, FONTS.regular, size) });
  });

  parts.push(`<rect x="${PAD}" y="${RULE_Y}" width="220" height="2" fill="url(#rule)"/>`);

  const b = badges(c.badges);
  parts.push(b.svg);
  report.push({ what: 'badges', size: BADGE_SIZE, width: b.width });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('\n  ')}</svg>`;
}

/* --------------------------------- Rendern --------------------------------- */

/* Der Alternativtext beschreibt, was auf dem Bild steht, und nichts sonst.
   Er wird hier aus denselben Zeilen gebaut, die gerendert werden, damit er
   nicht stehen bleibt, wenn das Bild sich aendert. */
function altText(ogTitle, lang) {
  return [ogTitle.replace(/\.$/, '') + '.', ...CONTENT[lang].sub].join(' ');
}

async function main() {
  await loadFonts();
  await mkdir(join(ROOT, 'og/src'), { recursive: true });

  const metaRaw = await readFile(join(ROOT, 'assets/seo-meta-dc.json'), 'utf8');
  const meta = JSON.parse(metaRaw).landing;
  const alts = {};

  for (const lang of LANGS) {
    const report = [];
    const head = headline(meta[lang].ogTitle ?? meta[lang].title);
    alts[lang] = altText(meta[lang].ogTitle ?? meta[lang].title, lang);
    const svg = buildSvg(lang, head, report);
    const svgPath = join(ROOT, `og/src/eucowork-share-${lang}.svg`);
    await writeFile(svgPath, svg + '\n', 'utf8');

    /* Palettiertes PNG mit voller Fehlerstreuung. Die Karte ist Flaeche,
       weicher Verlauf und Text; 256 Farben reichen dafuer. Gemessen: als
       echtes RGBA wiegt dasselbe Bild 272 KB, palettiert 135 KB, und im
       Verlauf ist bei zweifacher Vergroesserung kein Streifen zu sehen. Das
       bisherige Bild lag bei 600 KB und damit in dem Bereich, in dem
       WhatsApp die Vorschau nicht mehr zuverlaessig nachlaedt. */
    const png = await sharp(Buffer.from(svg), { density: 72 })
      .png({ palette: true, colours: 256, dither: 1, compressionLevel: 9, effort: 10 })
      .toBuffer();

    const out = join(ROOT, `og/eucowork-share-${lang}.png`);
    await writeFile(out, png);

    const widest = Math.max(...report.map(r => r.width));
    console.log(
      `${lang}: ${(png.length / 1024).toFixed(0)} KB, breiteste Zeile ${widest.toFixed(0)} px ` +
      `(Grenze ${TEXT_MAX - PAD} px)` +
      report.filter(r => r.what.startsWith('h1') && r.size !== H1_SIZE)
            .map(r => `, ${r.what} verkleinert auf ${r.size} px`).join('')
    );
  }

  /* Der Alternativtext steht im Kopfbereich, nicht im Bild, und wird deshalb
     in assets/seo-meta-dc.json gepflegt (Block landing, Schluessel
     ogImageAlt). Geschrieben wird die Datei hier bewusst nicht: an ihr
     arbeiten auch andere. Stattdessen wird verglichen und gemeldet, was
     abweicht. */
  const stored = JSON.parse(metaRaw).landing;
  let drift = 0;
  console.log('\nog:image:alt, Bild gegen assets/seo-meta-dc.json:');
  for (const lang of LANGS) {
    const ok = stored[lang].ogImageAlt === alts[lang];
    if (!ok) drift++;
    console.log(`  ${lang}: ${ok ? 'stimmt ueberein' : 'WEICHT AB, bitte eintragen:\n       ' + alts[lang]}`);
  }
  if (drift) console.log(`\n${drift} Sprachfassung(en) mit abweichendem og:image:alt.`);
}

main().catch(err => { console.error(err); process.exit(1); });
