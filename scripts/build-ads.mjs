/* =============================================================================
   Erzeugt die Bild-Assets fuer Google Ads aus den eigenen Assets der Website.

   Warum es die gibt: Google Ads verlangt je Anzeige mindestens ein Querformat
   1.91:1 und ein Quadrat 1:1, empfohlen sind vier oder mehr verschiedene
   Bilder, dazu optional ein Hochformat 4:5. Gekaufte Symbolbilder scheiden
   aus: Wer Nachweisbarkeit verkauft, darf nicht mit einer Bildsprache
   werben, die man aus zweifelhaften Anzeigen kennt. Also zeigt die Anzeige
   das, was es wirklich gibt: die Aussage der Startseite und zwei echte
   Aufnahmen aus der Verwaltungsoberflaeche.

   Quellen der Bildteile:
     - Text, Farben, Wortmarke: dieselben Werte wie og/kisuno-share-*.png
       (scripts/build-og.mjs), Schlagzeile aus assets/seo-meta-dc.json.
     - Produktaufnahmen: assets/shots/*.webp. Google nimmt nur PNG oder JPG,
       deshalb werden sie hier nach PNG gewandelt und eingesetzt.

   Sicherer Bereich: Google beschneidet die Bilder je nach Platzierung an den
   Raendern. Alles, was gelesen werden muss, liegt deshalb in den mittleren
   80 Prozent; die Konstante PAD je Format haelt diesen Abstand ein und die
   Pruefung am Ende meldet jede Zeile, die darueber hinauslaeuft.

   Aufruf:  node scripts/build-ads.mjs [--langs de,en,fr,it,es]
   Erzeugt: ads/google/kisuno-<lang>-<format>-<breite>x<hoehe>-<motiv>.png
            ads/google/kisuno-logo-quadrat-1200x1200.png (Pflicht-Asset Logo)
            ads/google/kisuno-logo-querformat-1200x300.png (optionales 4:1)
   ============================================================================= */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL('..', import.meta.url));
/* sharp haengt an der Dokumentation und nicht am Wurzelprojekt, siehe
   scripts/build-og.mjs. Die Website bleibt ohne npm install baubar. */
const sharp = require(join(ROOT, 'docs-src/node_modules/sharp/lib/index.js'));

/* --------------------------------- Farben ---------------------------------
   Wortgleich zu scripts/build-og.mjs und damit zu assets/content.css. */
const C = {
  bg:      '#FAFAF7',
  ink:     '#0B1E33',
  body:    '#41505E',
  eu700:   '#12326B',
  eu500:   '#2E6C86',
  ice300:  '#A5D8E6',
  iceTint: '#EAF3F7',
  gold:    '#F4C542',
  line:    '#E7ECF0',
  surface: '#FFFFFF'
};

/* --------------------------------- Inhalt ---------------------------------

   Die Schlagzeile kommt aus assets/seo-meta-dc.json (Block landing,
   Schluessel ogTitle), genau wie beim Vorschaubild: ein Ort fuer den Satz,
   sonst driften die beiden auseinander.

   Die Unterzeilen und die Abzeichen sind aus scripts/build-og.mjs
   uebernommen. Die Bildunterschriften der beiden Produktaufnahmen stammen
   wortgleich aus der Startseite (Landing.dc.html, features.d1 und
   features.d5), damit die Anzeige nichts sagt, was die Seite dahinter nicht
   auch sagt. */
const CONTENT = {
  de: {
    sub: [
      'Ein Chat für Ihre Firma: Fragen, Recherche, Dateien.',
      'Verbunden mit Ihren eigenen Daten. Betrieben in der Schweiz.'
    ],
    badges: ['Rechenzentrum Schweiz', 'Quellcode ab Start', 'revDSG & DSGVO'],
    shots: {
      rechte: 'ERP-Anbindung mit Rechte-Kontrolle. Jeder Aufruf auditiert.',
      verbrauch: 'GPT, Claude, GLM, Kimi und DeepSeek über einen Zugang.'
    },
    label: { rechte: 'admin · anbindungen', verbrauch: 'admin · verbrauch' }
  },
  en: {
    sub: [
      'A chat for your company: questions, research, files.',
      'Connected to your own data. Operated in Switzerland.'
    ],
    badges: ['Swiss data centre', 'Source code at launch', 'revDSG & GDPR'],
    shots: {
      rechte: 'ERP integration with access control. Every call audited.',
      verbrauch: 'GPT, Claude, GLM, Kimi and DeepSeek through one access point.'
    },
    label: { rechte: 'admin · integrations', verbrauch: 'admin · usage' }
  },
  fr: {
    sub: [
      'Un chat pour votre entreprise : questions, recherche, fichiers.',
      'Relié à vos propres données. Exploité en Suisse.'
    ],
    badges: ['Centre de données suisse', 'Code source au lancement', 'nLPD & RGPD'],
    shots: {
      rechte: 'ERP avec contrôle des droits. Chaque appel est audité.',
      verbrauch: 'GPT, Claude, GLM, Kimi et DeepSeek via un seul accès.'
    },
    label: { rechte: 'admin · connexions', verbrauch: 'admin · consommation' }
  },
  it: {
    sub: [
      'Una chat per la sua azienda: domande, ricerca, file.',
      'Collegata ai suoi dati. Gestita in Svizzera.'
    ],
    badges: ['Data center svizzero', 'Codice sorgente dal lancio', 'nLPD & GDPR'],
    shots: {
      rechte: 'ERP con controllo dei diritti. Ogni chiamata è tracciata.',
      verbrauch: 'GPT, Claude, GLM, Kimi e DeepSeek con un unico accesso.'
    },
    label: { rechte: 'admin · collegamenti', verbrauch: 'admin · consumo' }
  },
  es: {
    sub: [
      'Un chat para su empresa: preguntas, búsqueda, archivos.',
      'Conectado a sus propios datos. Operado en Suiza.'
    ],
    badges: ['Centro de datos suizo', 'Código fuente al lanzamiento', 'nLPD & RGPD'],
    shots: {
      rechte: 'ERP con control de permisos. Cada llamada queda auditada.',
      verbrauch: 'GPT, Claude, GLM, Kimi y DeepSeek con un solo acceso.'
    },
    label: { rechte: 'admin · conexiones', verbrauch: 'admin · consumo' }
  }
};

/* ------------------------------ Produktbilder ------------------------------

   Beide Aufnahmen sind Ausschnitte einer breiteren Oberflaeche und laufen
   rechts aus dem Bild; das ist auf der Website die uebliche Darstellung
   ("Anschnitt") und bleibt hier so. Der Ausschnitt waehlt jeweils den Teil,
   der ohne Erklaerung lesbar ist: bei den Anbindungen die drei Zeilen mit
   Gateway und Direkt, beim Verbrauch das Diagramm mit der Achse. */
const SHOTS = {
  rechte: {
    file: 'assets/shots/admin-mcp-rechte.webp',
    /* Kopfzeile mit der Benutzer-Ausnahme faellt weg: sie zeigt eine
       Beispiel-Adresse und wirkt aus dem Zusammenhang geloest. */
    crop: { left: 0, top: 262, width: 932, height: 410 },
    position: 'left top'
  },
  verbrauch: {
    file: 'assets/shots/admin-verbrauch-modelle.webp',
    /* Titel, Diagramm und Achsenbeschriftung; die Tabelle darunter wuerde
       im Anzeigenformat zu klein. */
    crop: { left: 0, top: 0, width: 1200, height: 640 },
    position: 'left top'
  }
};

/* --------------------------------- Formate ---------------------------------

   PAD ist der Abstand zum Rand: gut elf Prozent der jeweiligen Kante. Damit
   liegt jede Zeile innerhalb der mittleren 80 Prozent, auch wenn Google an
   beiden Seiten beschneidet. */
const FORMATS = {
  querformat: { w: 1200, h: 628,  padX: 132, padY: 70,  ratio: '1.91:1' },
  quadrat:    { w: 1200, h: 1200, padX: 132, padY: 132, ratio: '1:1' },
  hochformat: { w: 960,  h: 1200, padX: 106, padY: 132, ratio: '4:5' }
};

/* Die Bildliste: Querformat einmal als reine Aussage (das Motiv des
   Vorschaubildes) und einmal mit dem Verbrauchsdiagramm, Quadrat und
   Hochformat je einmal mit jeder Aufnahme. Macht sechs verschiedene Bilder
   und damit mehr als die vier, die Google empfiehlt. */
const SHEET = [
  { format: 'querformat', motiv: 'claim' },
  { format: 'querformat', motiv: 'verbrauch' },
  { format: 'quadrat',    motiv: 'rechte' },
  { format: 'quadrat',    motiv: 'verbrauch' },
  { format: 'hochformat', motiv: 'rechte' },
  { format: 'hochformat', motiv: 'verbrauch' }
];

/* ------------------------------ Schriftsatz ------------------------------
   Wie im Vorschaubild wird der Text aus Glyphenumrissen gesetzt und nicht
   als <text>: librsvg wertet @font-face nicht aus und faellt sonst still auf
   irgendeine Schrift der Maschine zurueck. */
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

function fit(text, font, size, maxWidth) {
  let s = size;
  while (s > 8 && measure(text, font, s) > maxWidth) s -= 0.5;
  return s;
}

/* ------------------------- Schlagzeile aus dem Titel -------------------------
   Gleiche Regel wie im Vorschaubild: der Markenname faellt weg, weil er oben
   links als Wortmarke steht, und das letzte Wort der zweiten Zeile bekommt
   die goldene Lasur. */
function headline(ogTitle) {
  const withoutBrand = ogTitle.replace(/^Kisuno\s*:\s*/i, '').trim();
  const sentences = withoutBrand.match(/[^.]+\.?/g)?.map(s => s.trim()).filter(Boolean) ?? [];
  const lines = sentences.length === 2 ? sentences : [withoutBrand];
  lines[0] = lines[0].charAt(0).toUpperCase() + lines[0].slice(1);
  const last = lines[lines.length - 1];
  const words = last.replace(/\.$/, '').split(' ');
  return { lines, highlight: words[words.length - 1] };
}

/* ------------------------------- Bildteile ------------------------------- */

/* Der Hintergrund ist die Aurora des Vorschaubildes, auf die jeweilige Kante
   umgerechnet: dieselben Ellipsen, nur am Format skaliert, damit alle drei
   Formate erkennbar dasselbe Bild sind. */
function background(f) {
  const sx = f.w / 1200;
  const sy = f.h / 630;
  const e = (cx, cy, rx, ry, fill, op) =>
    `<ellipse cx="${round(cx * sx)}" cy="${round(cy * sy)}" rx="${round(rx * sx)}" ry="${round(ry * sy)}" fill="${fill}" opacity="${op}"/>`;
  return `
  <defs>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="${round(70 * sx)}"/>
    </filter>
    <filter id="cardshadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14"/>
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
  <rect width="${f.w}" height="${f.h}" fill="${C.bg}"/>
  <g filter="url(#soft)">
    ${e(1010, 150, 430, 300, C.ice300, 0.62)}
    ${e(820, 60, 300, 200, C.iceTint, 0.9)}
    ${e(1180, 430, 260, 230, C.ice300, 0.34)}
    ${e(1120, 620, 240, 170, C.eu500, 0.10)}
    ${e(700, 330, 240, 220, C.iceTint, 0.7)}
  </g>
  <rect width="${f.w}" height="${f.h}" fill="url(#veil)"/>`;
}

function brand(x, baseline, size) {
  const box = size * 1.26;
  const y = baseline - box * 0.74;
  const mark = `
  <g transform="translate(${round(x)} ${round(y)})">
    <rect width="${round(box)}" height="${round(box)}" rx="${round(box * 7 / 32)}" fill="${C.ink}"/>
    <g transform="scale(${(box / 32).toFixed(4)}) translate(3.5 4)">
      <path d="M2.5 21.5 L10.5 6.5 L14.5 14 L17.5 8.5 L23.5 21.5 Z" fill="none" stroke="${C.bg}" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="17.5" cy="5.4" r="2.4" fill="${C.gold}"/>
    </g>
  </g>`;
  const tx = x + box + size * 0.52;
  const name = 'Kisuno';
  return mark + textPath(name, FONTS.semibold, size, tx, baseline, C.ink);
}

function highlight(line, word, font, size, x, baseline) {
  const at = line.lastIndexOf(word);
  if (at < 0) return '';
  const before = measure(line.slice(0, at), font, size);
  const width = measure(word, font, size);
  const top = baseline - size * 0.80;
  const height = size * 1.06;
  const pad = size * 0.13;
  return `<rect x="${round(x + before - pad)}" y="${round(top)}" width="${round(width + pad * 2)}" height="${round(height)}" rx="3" fill="${C.gold}" opacity="0.42"/>`;
}

/* Abzeichen in einer Zeile, und wenn der Platz nicht reicht, in zweien. Im
   Hochformat passen die drei Schweizer Angaben nicht nebeneinander. */
function badges(list, x, top, size, maxWidth) {
  const font = FONTS.mono;
  const padX = size * 1.26;
  const gap = size * 0.95;
  const h = size * 2.9;
  const rows = [[]];
  let used = 0;
  for (const t of list) {
    const w = measure(t, font, size) + padX * 2;
    if (used > 0 && used + gap + w > maxWidth) { rows.push([]); used = 0; }
    rows[rows.length - 1].push({ t, w });
    used += (used ? gap : 0) + w;
  }
  const out = [];
  let widest = 0;
  rows.forEach((row, r) => {
    let px = x;
    const y = top + r * (h + gap * 0.8);
    for (const b of row) {
      out.push(`<rect x="${round(px)}" y="${round(y)}" width="${round(b.w)}" height="${round(h)}" rx="${round(h / 2)}" fill="${C.surface}" stroke="${C.line}" stroke-width="1.5"/>`);
      out.push(textPath(b.t, font, size, px + padX, y + h * 0.63, C.body));
      px += b.w + gap;
    }
    widest = Math.max(widest, px - gap - x);
  });
  return { svg: out.join(''), width: widest, height: rows.length * h + (rows.length - 1) * gap * 0.8 };
}

/* Wie hoch die Karte mindestens sein muss, damit die Aufnahme nur rechts
   beschnitten wird (das faengt die Blende ab) und nicht unten: dort saessen
   sonst die Achsenbeschriftung des Diagramms und die untere Zeilenkante
   abgeschnitten, was wie ein Fehler aussieht. */
function kartenhoehe(motiv, breite, mindestens) {
  const c = SHOTS[motiv].crop;
  return Math.max(mindestens, Math.ceil(breite * c.height / c.width));
}

/* Setzt die Karte mittig in den freien Raum zwischen Textblock und unterem
   Rand des sicheren Bereichs. So steht sie bei beiden Aufnahmen ruhig, auch
   wenn die eine hoeher ausfaellt als die andere. */
function kartenplatz(motiv, x, breite, mindestens, oben, unten) {
  const h = kartenhoehe(motiv, breite, mindestens);
  return { x, y: Math.round(oben + (unten - oben - h) / 2), w: breite, h };
}

/* Die Karte, in der die Aufnahme sitzt: weisse Flaeche mit weichem Schatten,
   Radius 16 wie die Karten der Website. Die Aufnahme selbst wird spaeter
   hineinkopiert, der Haarstrich kommt darueber. */
function cardPlate(r) {
  return `
  <g filter="url(#cardshadow)" opacity="0.16">
    <rect x="${r.x}" y="${r.y + 8}" width="${r.w}" height="${r.h}" rx="18" fill="${C.ink}"/>
  </g>
  <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="16" fill="${C.surface}"/>`;
}

/* Ueber der Aufnahme liegen zwei Dinge: rechts eine weiche Blende, weil die
   Oberflaeche breiter ist als die Karte und sonst mitten im Wort abbricht
   ("http" ohne Rest liest sich wie ein Fehler, nicht wie ein Ausschnitt),
   und darueber der Haarstrich der Karte. */
function cardOverlay(r) {
  const fade = Math.round(r.w * 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${r.canvasW}" height="${r.canvasH}">
    <defs>
      <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${C.surface}" stop-opacity="0"/>
        <stop offset="0.55" stop-color="${C.surface}" stop-opacity="0.82"/>
        <stop offset="1" stop-color="${C.surface}" stop-opacity="1"/>
      </linearGradient>
      <clipPath id="karte">
        <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="16"/>
      </clipPath>
    </defs>
    <g clip-path="url(#karte)">
      <rect x="${r.x + r.w - fade}" y="${r.y}" width="${fade}" height="${r.h}" fill="url(#fade)"/>
    </g>
    <rect x="${r.x + 0.75}" y="${r.y + 0.75}" width="${r.w - 1.5}" height="${r.h - 1.5}" rx="16" fill="none" stroke="${C.line}" stroke-width="1.5"/>
  </svg>`;
}

/* --------------------------------- Aufbau ---------------------------------

   Je Format eine Funktion. Die Zahlen sind bewusst ausgeschrieben statt
   berechnet: so laesst sich am Bild nachrechnen, warum eine Zeile dort
   sitzt, wo sie sitzt. Alle Werte liegen zwischen PAD und Kante minus PAD.
   ------------------------------------------------------------------------- */

function layout(formatName, motiv, lang, head) {
  const f = FORMATS[formatName];
  const c = CONTENT[lang];
  const inner = f.w - f.padX * 2;
  const parts = [];
  const report = [];
  let card = null;

  const put = (what, text, font, size, x, baseline, fill, maxWidth) => {
    const s = fit(text, font, size, maxWidth);
    parts.push(textPath(text, font, s, x, baseline, fill));
    report.push({ what, size: s, right: x + measure(text, font, s) });
    return s;
  };

  if (formatName === 'querformat' && motiv === 'claim') {
    parts.push(brand(f.padX, f.padY + 34, 28));
    const size = Math.min(...head.lines.map(l => fit(l, FONTS.semibold, 62, inner)));
    head.lines.forEach((line, i) => {
      const base = 258 + i * 76;
      if (i === head.lines.length - 1 && head.highlight) {
        parts.push(highlight(line, head.highlight, FONTS.semibold, size, f.padX, base));
      }
      parts.push(textPath(line, FONTS.semibold, size, f.padX, base, C.ink));
      report.push({ what: `h1[${i}]`, size, right: f.padX + measure(line, FONTS.semibold, size) });
    });
    c.sub.forEach((line, i) => put(`sub[${i}]`, line, FONTS.regular, 22, f.padX, 390 + i * 34, C.body, inner));
    parts.push(`<rect x="${f.padX}" y="462" width="200" height="2" fill="url(#rule)"/>`);
    const b = badges(c.badges, f.padX, 490, 14, inner);
    parts.push(b.svg);
    report.push({ what: 'badges', size: 14, right: f.padX + b.width });
  }

  if (formatName === 'querformat' && motiv !== 'claim') {
    /* Text links, Aufnahme rechts. Die Spalte ist so breit, dass die
       Schlagzeile in zwei Zeilen passt, ohne dass fit() sie schrumpft. */
    const colW = 470;
    card = { x: f.padX + colW + 46, y: 128, w: f.w - (f.padX + colW + 46) - f.padX, h: 372 };
    /* Die Textspalte steht tiefer als im Motiv ohne Aufnahme: sie soll auf
       der Hoehe der Karte liegen, sonst kippt das Bild nach oben. */
    parts.push(brand(f.padX, f.padY + 75, 25));
    const size = Math.min(...head.lines.map(l => fit(l, FONTS.semibold, 46, colW)));
    head.lines.forEach((line, i) => {
      const base = 297 + i * 56;
      if (i === head.lines.length - 1 && head.highlight) {
        parts.push(highlight(line, head.highlight, FONTS.semibold, size, f.padX, base));
      }
      parts.push(textPath(line, FONTS.semibold, size, f.padX, base, C.ink));
      report.push({ what: `h1[${i}]`, size, right: f.padX + measure(line, FONTS.semibold, size) });
    });
    put('shot', c.shots[motiv], FONTS.regular, 18, f.padX, 397, C.body, colW);
    const b = badges([c.badges[0], c.badges[2]], f.padX, 447, 13, colW);
    parts.push(b.svg);
    report.push({ what: 'badges', size: 13, right: f.padX + b.width });
  }

  if (formatName === 'quadrat') {
    parts.push(brand(f.padX, f.padY + 34, 28));
    const size = Math.min(...head.lines.map(l => fit(l, FONTS.semibold, 62, inner)));
    head.lines.forEach((line, i) => {
      const base = 300 + i * 78;
      if (i === head.lines.length - 1 && head.highlight) {
        parts.push(highlight(line, head.highlight, FONTS.semibold, size, f.padX, base));
      }
      parts.push(textPath(line, FONTS.semibold, size, f.padX, base, C.ink));
      report.push({ what: `h1[${i}]`, size, right: f.padX + measure(line, FONTS.semibold, size) });
    });
    put('shot', c.shots[motiv], FONTS.regular, 23, f.padX, 452, C.body, inner);
    put('label', c.label[motiv], FONTS.mono, 13, f.padX, 496, C.eu500, inner);
    const b = badges(c.badges, f.padX, 518, 14, inner);
    parts.push(b.svg);
    report.push({ what: 'badges', size: 14, right: f.padX + b.width });
    card = kartenplatz(motiv, f.padX, inner, 430, 518 + b.height + 26, f.h - f.padY);
  }

  if (formatName === 'hochformat') {
    parts.push(brand(f.padX, f.padY + 32, 26));
    const size = Math.min(...head.lines.map(l => fit(l, FONTS.semibold, 52, inner)));
    head.lines.forEach((line, i) => {
      const base = 300 + i * 66;
      if (i === head.lines.length - 1 && head.highlight) {
        parts.push(highlight(line, head.highlight, FONTS.semibold, size, f.padX, base));
      }
      parts.push(textPath(line, FONTS.semibold, size, f.padX, base, C.ink));
      report.push({ what: `h1[${i}]`, size, right: f.padX + measure(line, FONTS.semibold, size) });
    });
    put('shot', c.shots[motiv], FONTS.regular, 20, f.padX, 444, C.body, inner);
    put('label', c.label[motiv], FONTS.mono, 12, f.padX, 486, C.eu500, inner);
    const b = badges(c.badges, f.padX, 508, 13, inner);
    parts.push(b.svg);
    report.push({ what: 'badges', size: 13, right: f.padX + b.width });
    card = kartenplatz(motiv, f.padX, inner, 424, 508 + b.height + 26, f.h - f.padY);
  }

  if (card) parts.splice(0, 0, cardPlate(card));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${f.w}" height="${f.h}" viewBox="0 0 ${f.w} ${f.h}">` +
    background(f) + parts.join('\n  ') + '</svg>';

  return { f, svg, card, report };
}

/* Bereitet eine Aufnahme fuer die Karte auf: Ausschnitt waehlen, auf die
   Kartengroesse bringen (der Rest laeuft rechts aus dem Bild, wie auf der
   Website) und die Ecken runden, damit sie in die Karte passt. */
async function shotFor(motiv, card) {
  const spec = SHOTS[motiv];
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${card.w}" height="${card.h}">` +
    `<rect width="${card.w}" height="${card.h}" rx="16" fill="#fff"/></svg>`
  );
  return sharp(join(ROOT, spec.file))
    .extract(spec.crop)
    .resize(card.w, card.h, { fit: 'cover', position: spec.position })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

/* ----------------------------------- Logo -----------------------------------

   Google Ads fuehrt das Logo als eigenes Asset: 1:1 ist Pflicht (empfohlen
   1200 x 1200), 4:1 ist optional (empfohlen 1200 x 300). Es wird klein
   ausgespielt und in manchen Platzierungen rund beschnitten.

   Deshalb steht im Quadrat nur das Zeichen und kein Schriftzug: "Kisuno"
   waere bei 48 px Anzeigegroesse ein grauer Strich. Das Zeichen ist dasselbe
   wie in icon.svg, nur gross gerechnet: dunkle Kachel mit dem Rundungsmass
   7/32, darin der Linienzug und der goldene Punkt. Die Ecken liegen ausserhalb
   des Kreises, den ein runder Beschnitt stehen laesst; das Zeichen selbst
   liegt weit innerhalb.

   Im Querformat 4:1 ist Platz fuer den Schriftzug, dort steht er daneben.
   ----------------------------------------------------------------------- */

/* Das Zeichen aus icon.svg, auf Kantenlaenge s gerechnet und an (x, y)
   gesetzt. radius = 0 zeichnet die Kachel ohne Rundung. */
function zeichen(x, y, s, radius = 7 / 32) {
  return `
  <g transform="translate(${round(x)} ${round(y)})">
    <rect width="${round(s)}" height="${round(s)}" rx="${round(s * radius)}" fill="${C.ink}"/>
    <g transform="scale(${(s / 32).toFixed(5)}) translate(3.5 4)">
      <path d="M2.5 21.5 L10.5 6.5 L14.5 14 L17.5 8.5 L23.5 21.5 Z" fill="none" stroke="${C.bg}" stroke-width="1.7" stroke-linejoin="round"/>
      <circle cx="17.5" cy="5.4" r="2.4" fill="${C.gold}"/>
    </g>
  </g>`;
}

function logoQuadrat() {
  const W = 1200;
  /* Die Kachel fuellt das Bild bis auf einen schmalen Rand: Google mag
     Logos ohne grosse Leerflaeche, die Rundung soll aber sichtbar bleiben. */
  const rand = 60;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">` +
    `<rect width="${W}" height="${W}" fill="${C.bg}"/>` +
    zeichen(rand, rand, W - rand * 2) + '</svg>';
}

function logoQuer() {
  const W = 1200;
  const H = 300;
  const s = 168;
  const schrift = 92;
  const wort = 'Kisuno';
  const breite = s + 44 + measure(wort, FONTS.semibold, schrift);
  const x = Math.round((W - breite) / 2);
  const y = Math.round((H - s) / 2);
  const tx = x + s + 44;
  const grundlinie = H / 2 + schrift * 0.35;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    `<rect width="${W}" height="${H}" fill="${C.bg}"/>` +
    zeichen(x, y, s) +
    textPath(wort, FONTS.semibold, schrift, tx, grundlinie, C.ink) +
    '</svg>';
}

/* --------------------------------- Rendern --------------------------------- */

async function main() {
  const arg = process.argv.find(a => a.startsWith('--langs='));
  const langs = (arg ? arg.slice('--langs='.length) : 'de').split(',').map(s => s.trim()).filter(Boolean);
  for (const l of langs) if (!CONTENT[l]) throw new Error(`Unbekannte Sprache "${l}". Bekannt: ${Object.keys(CONTENT).join(', ')}`);

  await loadFonts();
  await mkdir(join(ROOT, 'ads/google'), { recursive: true });

  const meta = JSON.parse(await readFile(join(ROOT, 'assets/seo-meta-dc.json'), 'utf8')).landing;
  let warnungen = 0;

  for (const lang of langs) {
    const head = headline(meta[lang].ogTitle ?? meta[lang].title);
    for (const item of SHEET) {
      const { f, svg, card, report } = layout(item.format, item.motiv, lang, head);
      const base = await sharp(Buffer.from(svg), { density: 72 }).png().toBuffer();

      const layers = [];
      if (card) {
        layers.push({ input: await shotFor(item.motiv, card), left: card.x, top: card.y });
        layers.push({
          input: Buffer.from(cardOverlay({ ...card, canvasW: f.w, canvasH: f.h })),
          left: 0, top: 0
        });
      }

      /* Echtes RGB statt Palette: das Vorschaubild darf palettiert sein, weil
         WhatsApp und Slack es klein brauchen. Hier zaehlt das Gegenteil, die
         Anzeige wird auch gross ausgespielt, und 256 Farben legen sichtbare
         Streifen in den weichen Verlauf. Die Grenze von 5 MB ist weit weg. */
      /* Zwei Durchgaenge, weil sharp flatten() vor composite() ausfuehrt: erst
         zusammensetzen, dann die Alphaebene entfernen. Die Bilder sind ohnehin
         ueberall deckend; ohne Alphaebene kann keine Anzeigenflaeche
         durchscheinen und die Datei wird kleiner. */
      const zusammengesetzt = await sharp(base).composite(layers).png().toBuffer();
      const png = await sharp(zusammengesetzt)
        .flatten({ background: C.bg })
        .png({ palette: false, compressionLevel: 9, effort: 10 })
        .toBuffer();

      const name = `kisuno-${lang}-${item.format}-${f.w}x${f.h}-${item.motiv}.png`;
      await writeFile(join(ROOT, 'ads/google', name), png);

      /* Pruefung statt Vertrauen: kein Text darf ueber den sicheren Bereich
         hinauslaufen, und Google nimmt hoechstens 5 MB. */
      const grenze = f.w - f.padX;
      const raus = report.filter(r => r.right > grenze + 0.5);
      const mb = png.length / (1024 * 1024);
      if (raus.length || mb > 5) warnungen++;
      console.log(
        `${name.padEnd(52)} ${(png.length / 1024).toFixed(0).padStart(4)} KB` +
        (raus.length ? `  ACHTUNG: ${raus.map(r => `${r.what} endet bei ${r.right.toFixed(0)} px, Grenze ${grenze}`).join('; ')}` : '') +
        (mb > 5 ? '  ACHTUNG: groesser als 5 MB' : '')
      );
    }
  }

  /* Die Logos haengen an keiner Sprache: im Quadrat steht nur das Zeichen,
     im Querformat der Schriftzug, und der ist in allen fuenf Sprachen
     derselbe. */
  for (const [name, svg] of [
    ['kisuno-logo-quadrat-1200x1200.png', logoQuadrat()],
    ['kisuno-logo-querformat-1200x300.png', logoQuer()]
  ]) {
    const roh = await sharp(Buffer.from(svg), { density: 72 }).png().toBuffer();
    const png = await sharp(roh)
      .flatten({ background: C.bg })
      .png({ palette: false, compressionLevel: 9, effort: 10 })
      .toBuffer();
    await writeFile(join(ROOT, 'ads/google', name), png);
    console.log(`${name.padEnd(52)} ${(png.length / 1024).toFixed(0).padStart(4)} KB`);
  }

  console.log(
    `\n${langs.length * SHEET.length} Bilder und 2 Logos in ads/google/` +
    (warnungen ? `, ${warnungen} mit Beanstandung.` : ', keine Beanstandung.')
  );
}

main().catch(err => { console.error(err); process.exit(1); });
