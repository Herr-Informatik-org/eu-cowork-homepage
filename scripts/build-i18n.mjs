/* =============================================================================
   Erzeugt die Sprachfassungen der Website als eigene URLs.

   Warum ueberhaupt: Die Umschaltung im Browser tauscht zwar den Text, aber
   nicht die Adresse. Fuer Suchmaschinen gibt es damit nur eine einzige Seite,
   und die ist deutsch. Wer in Paris nach einer souveraenen KI-Plattform sucht,
   findet uns so nie. Erst eigene Adressen je Sprache, wechselseitig mit
   hreflang verknuepft, machen die fuenf Fassungen auffindbar.

   Was hier entsteht:
     /            deutsch, unveraendert (behaelt die bestehenden Rankings)
     /en, /fr, /it, /es   je ein vollstaendiger Seitenbaum

   Zwei Sorten Seiten, zwei Verfahren:
     - Statische Seiten tragen ihre Uebersetzung als [data-i18n] im Markup.
       Die werden hier vollstaendig uebersetzt ausgeliefert, also auch ohne
       JavaScript in der Zielsprache lesbar.
     - Die .dc-Seiten rendern ihren Rumpf im Browser. Uebersetzt wird der
       Kopfbereich; den Rumpf baut die Laufzeit in der Sprache, die aus dem
       Adresspraefix kommt.

   Aufruf: node scripts/build-i18n.mjs
   ============================================================================= */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ORIGIN = 'https://eucowork.ai';
const LANGS = ['de', 'en', 'fr', 'it', 'es'];
const OTHER = LANGS.filter(l => l !== 'de');

// og:locale erwartet Sprache_REGION. Deutsch steht auf der Schweiz, weil der
// Anbieter dort sitzt; die uebrigen auf dem groessten Markt der Sprache.
const OG_LOCALE = { de: 'de_CH', en: 'en_US', fr: 'fr_FR', it: 'it_IT', es: 'es_ES' };
// inLanguage im JSON-LD folgt BCP-47.
const BCP47 = { de: 'de-CH', en: 'en', fr: 'fr', it: 'it', es: 'es' };

/* Die Adressen stammen aus vercel.json. Security.dc.html und SelfHost.dc.html
   stehen bewusst nicht in der Liste: sie sind nicht mehr geroutet, die
   statischen Seiten /sicherheit und /self-hosting haben sie abgeloest.

   lastmod ist hier nur noch der Rueckfall fuer Umgebungen ohne Git. Das echte
   Datum holt gitDatum() weiter unten aus dem Stand der Datei; von Hand
   gepflegte Daten waren zuletzt eine Woche zu alt. */
const PAGES = [
  { key: 'landing',        path: '/',                src: 'Landing.dc.html',        out: 'index.html',                 kind: 'dc' , lastmod: '2026-08-05', changefreq: 'weekly', priority: '1.0' },
  { key: 'preise',         path: '/preise',          src: 'Preise.dc.html',         out: 'preise/index.html',          kind: 'dc' , lastmod: '2026-08-13', changefreq: 'monthly', priority: '0.9' },
  { key: 'warteliste',     path: '/warteliste',      src: 'Waitlist.dc.html',       out: 'warteliste/index.html',      kind: 'dc' , lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.9' },
  { key: 'impressum',      path: '/impressum',       src: 'Impressum.dc.html',      out: 'impressum/index.html',       kind: 'dc' , lastmod: '2026-08-05', changefreq: 'yearly', priority: '0.3' },
  { key: 'datenschutz',    path: '/datenschutz',     src: 'Datenschutz.dc.html',    out: 'datenschutz/index.html',     kind: 'dc' , lastmod: '2026-08-05', changefreq: 'yearly', priority: '0.3' },
  { key: 'agb',            path: '/agb',             src: 'AGB.dc.html',            out: 'agb/index.html',             kind: 'dc' , lastmod: '2026-08-05', changefreq: 'yearly', priority: '0.3' },
  { key: 'avv',            path: '/avv',             src: 'AVV.dc.html',            out: 'avv/index.html',             kind: 'dc' , lastmod: '2026-08-05', changefreq: 'yearly', priority: '0.3' },
  { key: 'subprozessoren', path: '/subprozessoren',  src: 'Subprozessoren.dc.html', out: 'subprozessoren/index.html',  kind: 'dc' , lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.4' },
  { key: 'vergleich',      path: '/vergleich',       src: 'vergleich/index.html',   out: 'vergleich/index.html',       kind: 'static' , lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.8' },
  { key: 'faq',            path: '/faq',             src: 'faq/index.html',         out: 'faq/index.html',             kind: 'static' , lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.8' },
  { key: 'governance',     path: '/governance',      src: 'governance/index.html',  out: 'governance/index.html',      kind: 'static' , lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.8' },
  { key: 'integrationen',  path: '/integrationen',   src: 'integrationen/index.html', out: 'integrationen/index.html', kind: 'static' , lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.7' },
  { key: 'blog',           path: '/blog',            src: 'blog/index.html',        out: 'blog/index.html',            kind: 'static' , lastmod: '2026-08-11', changefreq: 'weekly', priority: '0.6' },
  { key: 'vision',         path: '/vision',          src: 'vision/index.html',      out: 'vision/index.html',          kind: 'static' , lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.6' },
  { key: 'sicherheit',     path: '/sicherheit',      src: 'sicherheit/index.html',  out: 'sicherheit/index.html',      kind: 'static' , lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.8' },
  { key: 'self-hosting',   path: '/self-hosting',    src: 'self-hosting/index.html', out: 'self-hosting/index.html',   kind: 'static', lastmod: '2026-08-05', changefreq: 'monthly', priority: '0.8' }
];

/* Pfade, die keine Sprachfassung haben und deshalb nie ein Praefix bekommen.
   /docs bringt seine eigene Zweisprachigkeit mit (Astro Starlight). */
const NO_PREFIX = ['/docs', '/assets/', '/fonts/', '/og/', '/api/', '/vendor/'];

/* ---------------------------------------------------------------------------
   Uebersetzen der [data-i18n]-Elemente.

   Bewusst kein DOM-Parser: das Markup ist erzeugt und wohlgeformt, und eine
   Abhaengigkeit weniger heisst, dass der Build ohne npm install laeuft. Die
   Klammerzaehlung unten kommt mit verschachtelten gleichnamigen Elementen
   zurecht, was eine einzelne Ersetzung per Regex nicht koennte.
   --------------------------------------------------------------------------- */
function replaceTagged(html, lookup) {
  let out = '';
  let cursor = 0;
  const attr = /\sdata-i18n="([^"]+)"/g;
  let m;
  while ((m = attr.exec(html)) !== null) {
    if (m.index < cursor) continue;
    // Vom Attribut zurueck zum Anfang des Elements.
    const open = html.lastIndexOf('<', m.index);
    if (open < 0) continue;
    const nameMatch = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(open, m.index + m[0].length + 200));
    if (!nameMatch) continue;
    const tag = nameMatch[1];
    const openEnd = html.indexOf('>', m.index + m[0].length);
    if (openEnd < 0) continue;

    // Passendes schliessendes Element suchen, verschachtelte mitzaehlen.
    const openRe = new RegExp('<' + tag + '(?=[\\s/>])', 'gi');
    const closeRe = new RegExp('</' + tag + '\\s*>', 'gi');
    let depth = 1;
    let scan = openEnd + 1;
    let close = -1;
    while (depth > 0) {
      closeRe.lastIndex = scan;
      const c = closeRe.exec(html);
      if (!c) break;
      openRe.lastIndex = scan;
      let nested = 0;
      let o;
      while ((o = openRe.exec(html)) !== null && o.index < c.index) nested++;
      depth += nested - 1;
      scan = c.index + c[0].length;
      if (depth === 0) close = c.index;
    }
    if (close < 0) continue;

    const value = lookup(m[1]);
    out += html.slice(cursor, openEnd + 1);
    out += (value === null || value === undefined) ? html.slice(openEnd + 1, close) : value;
    cursor = close;
    attr.lastIndex = close;
  }
  return out + html.slice(cursor);
}

/* Das Woerterbuch einer statischen Seite steht als Inline-Skript vor </body>. */
function readPageDict(html) {
  const m = html.match(/window\.EUC_I18N\s*=\s*(\{[\s\S]*?\});\s*<\/script>/);
  if (!m) return null;
  return vm.runInNewContext('(' + m[1] + ')');
}

/* Das gemeinsame Woerterbuch fuer Kopf- und Fussleiste liegt in i18n.js. */
function readChromeDict(src) {
  const m = src.match(/var CHROME = (\{[\s\S]*?\n  \});/);
  if (!m) throw new Error('CHROME-Woerterbuch in assets/i18n.js nicht gefunden');
  return vm.runInNewContext('(' + m[1] + ')');
}

/* --------------------------------- Kopfbereich --------------------------------- */

function setMeta(html, selectorRe, value) {
  if (value === undefined || value === null) return html;
  return html.replace(selectorRe, (full, before, _old, after) => before + escapeAttr(value) + after);
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function escapeText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function hreflangBlock(pagePath) {
  const lines = ['<!-- i18n:hreflang:start -->'];
  for (const l of LANGS) {
    lines.push(`<link rel="alternate" hreflang="${l}" href="${ORIGIN}${urlFor(l, pagePath)}">`);
  }
  lines.push(`<link rel="alternate" hreflang="x-default" href="${ORIGIN}${pagePath}">`);
  lines.push('<!-- i18n:hreflang:end -->');
  return lines.join('\n');
}

function urlFor(lang, pagePath) {
  if (lang === 'de') return pagePath;
  return pagePath === '/' ? `/${lang}` : `/${lang}${pagePath}`;
}

function injectHreflang(html, pagePath) {
  const block = hreflangBlock(pagePath);
  const existing = /<!-- i18n:hreflang:start -->[\s\S]*?<!-- i18n:hreflang:end -->/;
  if (existing.test(html)) return html.replace(existing, block);
  // Direkt nach dem canonical einhaengen, sonst vor </head>.
  if (/<link rel="canonical"[^>]*>/.test(html)) {
    return html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${block}`);
  }
  return html.replace('</head>', `${block}\n</head>`);
}

function rewriteHead(html, { lang, pagePath, meta }) {
  let out = html;

  out = out.replace(/<html([^>]*)\slang="[^"]*"/i, `<html$1 lang="${lang}"`);
  // Die Laufzeit liest dieses Attribut und uebernimmt die Sprache der Adresse,
  // damit die Erkennung im Browser die URL nicht ueberstimmt.
  if (!/data-euc-lang=/.test(out)) {
    out = out.replace(/<html([^>]*)>/i, `<html$1 data-euc-lang="${lang}">`);
  } else {
    out = out.replace(/data-euc-lang="[^"]*"/, `data-euc-lang="${lang}"`);
  }

  if (meta) {
    if (meta.title) out = out.replace(/(<title[^>]*>)[\s\S]*?(<\/title>)/i, `$1${escapeText(meta.title)}$2`);
    out = setMeta(out, /(<meta name="description" content=")([^"]*)(")/i, meta.description);
    out = setMeta(out, /(<meta property="og:title" content=")([^"]*)(")/i, meta.ogTitle ?? meta.title);
    out = setMeta(out, /(<meta property="og:description" content=")([^"]*)(")/i, meta.ogDescription ?? meta.description);
    out = setMeta(out, /(<meta name="twitter:title" content=")([^"]*)(")/i, meta.twTitle ?? meta.ogTitle ?? meta.title);
    out = setMeta(out, /(<meta name="twitter:description" content=")([^"]*)(")/i, meta.twDescription ?? meta.ogDescription ?? meta.description);
  }

  out = setMeta(out, /(<meta property="og:locale" content=")([^"]*)(")/i, OG_LOCALE[lang]);
  out = setMeta(out, /(<meta property="og:url" content=")([^"]*)(")/i, ORIGIN + urlFor(lang, pagePath));
  out = out.replace(/(<link rel="canonical" href=")([^"]*)(")/i, `$1${ORIGIN}${urlFor(lang, pagePath)}$3`);
  out = out.replace(/"inLanguage":\s*"[^"]*"/g, `"inLanguage": "${BCP47[lang]}"`);
  out = localizeJsonLd(out, lang);

  return injectHreflang(out, pagePath);
}

/* ------------------------------ JSON-LD-Adressen ------------------------------ */

/* Diese drei Bezeichner benennen kein Dokument, sondern eine Sache: das
   Unternehmen, die Website als Ganzes und die Software. Sie sind ueber alle
   fuenf Sprachen dieselbe Sache und muessen deshalb in jeder Sprachfassung
   woertlich gleich bleiben. Wer sie mituebersetzt, macht aus einer Organisation
   fuenf und zerlegt den Wissensgraphen, den die Verknuepfungen aufbauen. */
const GLOBAL_IDS = new Set([
  `${ORIGIN}/#organization`,
  `${ORIGIN}/#website`,
  `${ORIGIN}/#software`
]);

/* Alles andere im JSON-LD, was auf eucowork.ai zeigt, ist eine Adresse: die
   Adresse der Seite selbst (url, @id der WebPage), ihre Einordnung
   (mainEntityOfPage) und vor allem die Brotkrumen (item). Blieben die deutsch,
   widerspraeche das strukturierte Datum dem canonical derselben Seite --
   /es/self-hosting behauptete von sich, unter /self-hosting zu liegen. */
const LD_URL_KEYS = new Set(['@id', 'url', 'item', 'mainEntityOfPage', 'sameAs', 'relatedLink', 'significantLink']);

function localizeUrl(url, lang) {
  if (lang === 'de' || typeof url !== 'string') return url;
  if (url !== ORIGIN && !url.startsWith(ORIGIN + '/')) return url;

  const rest = url.slice(ORIGIN.length);
  const hashAt = rest.indexOf('#');
  const hash = hashAt >= 0 ? rest.slice(hashAt) : '';
  const path = (hashAt >= 0 ? rest.slice(0, hashAt) : rest) || '/';

  // Die Dokumentation legt die Sprache HINTER /docs ab, siehe prefixLinks.
  if (path === '/docs' || path.startsWith('/docs/')) {
    const tail = path.slice(5);
    if (tail === `/${lang}` || tail.startsWith(`/${lang}/`)) return url;
    return `${ORIGIN}/docs/${lang}${tail}${hash}`;
  }
  if (NO_PREFIX.some(p => path === p || path.startsWith(p))) return url;
  if (path === `/${lang}` || path.startsWith(`/${lang}/`)) return url;

  return `${ORIGIN}/${lang}${path === '/' ? '' : path}${hash}`;
}

/* Ein Knoten, der sich als eine der globalen Sachen ausweist, bleibt komplett
   unangetastet: sein @id ist der Bezeichner, und sein url zeigt auf die
   deutsche Wurzel, weil die Organisation genau eine Startseite hat. */
function localizeNode(node, lang) {
  if (Array.isArray(node)) return node.map(v => localizeNode(v, lang));
  if (node === null || typeof node !== 'object') return node;

  if (typeof node['@id'] === 'string' && GLOBAL_IDS.has(node['@id'])) return node;

  const out = {};
  for (const [key, value] of Object.entries(node)) {
    if (LD_URL_KEYS.has(key)) {
      if (typeof value === 'string') { out[key] = localizeUrl(value, lang); continue; }
      if (Array.isArray(value) && value.every(v => typeof v === 'string')) {
        out[key] = value.map(v => localizeUrl(v, lang));
        continue;
      }
    }
    out[key] = localizeNode(value, lang);
  }
  return out;
}

function localizeJsonLd(html, lang) {
  if (lang === 'de') return html;
  return html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/gi, (full, open, body, close) => {
    let data;
    try { data = JSON.parse(body); } catch { return full; }   // Kaputtes JSON lieber unveraendert lassen.
    const json = JSON.stringify(localizeNode(data, lang), null, 2).replace(/<\//g, '<\\/');
    return `${open}\n${json}\n${close}`;
  });
}

/* --------------------------------- Verweise --------------------------------- */

/* Innerhalb einer Sprachfassung muessen die Verweise in derselben Sprache
   bleiben, sonst faellt der Besucher beim ersten Klick zurueck auf Deutsch --
   und Suchmaschinen finden die uebrigen Seiten der Sprache gar nicht erst. */
function prefixLinks(html, lang) {
  if (lang === 'de') return html;
  return html.replace(/href="(\/[^"]*)"/g, (full, href) => {
    if (/\.(png|jpg|jpeg|svg|ico|webp|woff2?|xml|txt|json|css|js)$/i.test(href.split('#')[0].split('?')[0])) return full;
    // Die Dokumentation ist ein eigenes Starlight-Projekt und legt die Sprache
    // HINTER /docs ab, nicht davor: Deutsch auf der Wurzel, die uebrigen vier
    // unter /docs/<sprache>.
    if (href === '/docs' || href.startsWith('/docs/')) {
      const rest = href.slice(5);
      if (rest === `/${lang}` || rest.startsWith(`/${lang}/`)) return full;
      return `href="/docs/${lang}${rest}"`;
    }
    if (NO_PREFIX.some(p => href === p || href.startsWith(p))) return full;
    if (href.startsWith(`/${lang}/`) || href === `/${lang}`) return full;
    const clean = href === '/' ? '' : href;
    return `href="/${lang}${clean}"`;
  });
}

/* --------------------------------- Erzeugung --------------------------------- */

async function buildStatic(page, lang, meta, chrome) {
  const src = await readFile(join(ROOT, page.src), 'utf8');
  const dict = readPageDict(src);
  if (!dict) throw new Error(`${page.src}: kein Seitenwoerterbuch gefunden`);

  const missing = [];
  const lookup = (key) => {
    if (key.startsWith('chrome.')) {
      const v = (chrome[lang] || {})[key];
      if (v === undefined) { missing.push(key); return null; }
      return v;
    }
    const v = (dict[lang] || {})[key];
    if (v === undefined) { missing.push(key); return null; }
    return v;
  };

  let out = replaceTagged(src, lookup);
  out = rewriteHead(out, { lang, pagePath: page.path, meta });
  out = prefixLinks(out, lang);
  return { html: out, missing };
}

async function buildDc(page, lang, meta) {
  const src = await readFile(join(ROOT, page.src), 'utf8');
  let out = rewriteHead(src, { lang, pagePath: page.path, meta });

  // Relative Verweise brechen eine Ebene tiefer.
  out = out.replace(/src="\.\/support\.js"/g, 'src="/support.js"');

  // Der Rumpf entsteht im Browser; der noscript-Block ist die Fassung fuer
  // alles, was kein JavaScript ausfuehrt. Deutsch stehen zu lassen waere dort
  // falsch, also tritt eine knappe Fassung aus den uebersetzten Metadaten an
  // seine Stelle.
  if (meta) {
    out = out.replace(/<noscript>[\s\S]*?<\/noscript>/i,
      `<noscript>\n  <h1>${escapeText(meta.title)}</h1>\n  <p>${escapeText(meta.description || '')}</p>\n</noscript>`);
  }
  return { html: out, missing: [] };
}

async function main() {
  const i18nSrc = await readFile(join(ROOT, 'assets/i18n.js'), 'utf8');
  const chrome = readChromeDict(i18nSrc);

  const metaAll = {};
  for (const f of ['assets/seo-meta-dc.json', 'assets/seo-meta-static.json']) {
    const p = join(ROOT, f);
    if (!existsSync(p)) throw new Error(`fehlt: ${f}`);
    Object.assign(metaAll, JSON.parse(await readFile(p, 'utf8')));
  }

  // Alte Ausgabe verwerfen, damit entfernte Seiten nicht liegen bleiben.
  for (const l of OTHER) await rm(join(ROOT, l), { recursive: true, force: true });

  const problems = [];
  let written = 0;

  for (const page of PAGES) {
    const pageMeta = metaAll[page.key];
    if (!pageMeta) problems.push(`${page.key}: keine Metadaten`);

    // Deutsch bleibt an seinem Platz, bekommt aber die hreflang-Verknuepfung.
    const deSrc = await readFile(join(ROOT, page.src), 'utf8');
    const deOut = injectHreflang(deSrc, page.path);
    if (deOut !== deSrc) await writeFile(join(ROOT, page.src), deOut);

    for (const lang of OTHER) {
      const meta = pageMeta ? pageMeta[lang] : null;
      if (pageMeta && !meta) problems.push(`${page.key}/${lang}: Metadaten fehlen`);
      const built = page.kind === 'static'
        ? await buildStatic(page, lang, meta, chrome)
        : await buildDc(page, lang, meta);
      if (built.missing.length) {
        problems.push(`${page.key}/${lang}: ${built.missing.length} Schluessel ohne Uebersetzung (${[...new Set(built.missing)].slice(0, 3).join(', ')})`);
      }
      const target = join(ROOT, lang, page.out);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, built.html);
      written++;
    }
  }

  await writeSitemap();

  console.log(`${written} Sprachfassungen geschrieben (${OTHER.join(', ')}), Deutsch mit hreflang ergaenzt.`);
  if (problems.length) {
    console.log('\nOffene Punkte:');
    for (const p of problems) console.log('  - ' + p);
    process.exitCode = 1;
  } else {
    console.log('Keine offenen Punkte.');
  }
}

/* ------------------------------- lastmod -------------------------------

   Ein von Hand gepflegtes Datum veraltet zuverlaessig: die Tabelle oben stand
   auf dem 5. August, waehrend die Seiten laengst neuer waren. Ein falsches
   lastmod ist schlimmer als gar keines, denn Suchmaschinen holen die Seite
   dann nicht neu. Deshalb fragen wir das Datum dort, wo es ohnehin steht:

     - Die Datei ist gegenueber dem Stand im Git veraendert? Dann ist heute
       der Tag der Aenderung, egal was der letzte Commit sagt.
     - Sonst zaehlt das Datum des letzten Commits, der die Datei angefasst hat.
     - Ohne Git (fremde Umgebung, Zip-Kopie) bleibt der Wert aus der Tabelle.

   Die mtime der Datei kommt bewusst nicht vor: ein frischer Clone setzt sie
   auf den Zeitpunkt des Clones und wuerde die ganze Website als heute geaendert
   ausgeben. ------------------------------------------------------------- */

function heute() {
  return new Date().toISOString().slice(0, 10);
}

function gitDatum(relPfad, rueckfall) {
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', relPfad],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (dirty) return heute();

    const commit = execFileSync('git', ['log', '-1', '--format=%cs', '--', relPfad],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(commit)) return commit;
  } catch { /* kein Git zur Hand, Rueckfall greift */ }
  return rueckfall;
}

/* Die Sitemap nennt jede Adresse einmal und fuehrt an jedem Eintrag die
   uebrigen vier Sprachen mit. Ohne diese Wechselseitigkeit ignoriert Google
   die Verknuepfung. */
async function writeSitemap() {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
  ];
  for (const page of PAGES) {
    const m = { ...page, lastmod: gitDatum(page.src, page.lastmod) };
    for (const lang of LANGS) {
      lines.push('  <url>');
      lines.push(`    <loc>${ORIGIN}${urlFor(lang, page.path)}</loc>`);
      for (const alt of LANGS) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt}" href="${ORIGIN}${urlFor(alt, page.path)}"/>`);
      }
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${page.path}"/>`);
      lines.push(`    <lastmod>${m.lastmod}</lastmod>`);
      lines.push(`    <changefreq>${m.changefreq}</changefreq>`);
      // Uebersetzungen stehen eine Stufe unter der deutschen Fassung.
      lines.push(`    <priority>${lang === 'de' ? m.priority : Math.max(0.1, (parseFloat(m.priority) - 0.1)).toFixed(1)}</priority>`);
      lines.push('  </url>');
    }
  }
  // Die Doku bringt ihre eigene Sitemap mit, hier steht nur der Einstieg.
  lines.push('  <url>');
  lines.push(`    <loc>${ORIGIN}/docs</loc>`);
  lines.push(`    <lastmod>${gitDatum('docs/index.html', '2026-08-13')}</lastmod>`);
  lines.push('    <changefreq>weekly</changefreq>');
  lines.push('    <priority>0.9</priority>');
  lines.push('  </url>');
  lines.push('</urlset>');
  await writeFile(join(ROOT, 'sitemap.xml'), lines.join('\n') + '\n');
}

main().catch(err => { console.error(err); process.exit(1); });
