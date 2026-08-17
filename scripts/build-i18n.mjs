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
       Adresspraefix kommt. Damit auch ohne JavaScript etwas dasteht, erzeugt
       der Vorrenderer weiter unten den <noscript>-Block aus derselben Vorlage
       und denselben Uebersetzungsdaten -- siehe den ausfuehrlichen Abschnitt
       dort, insbesondere die Begruendung, warum der Text in <noscript> gehoert
       und nicht ins <x-dc>-Template.

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

    /* Das Vorschaubild. Bis hierher trugen alle fuenf Sprachfassungen das
       deutsche Bild, und der Alternativtext blieb sogar in /fr/ deutsch.
       Wo eine Seite je Sprache ein eigenes Bild hat, steht es als ogImage
       im Woerterbuch; ohne den Schluessel bleibt stehen, was in der Vorlage
       steht. twitter:image zieht mit, sonst zeigt X ein anderes Bild als
       LinkedIn. */
    out = setMeta(out, /(<meta property="og:image" content=")([^"]*)(")/i, meta.ogImage);
    out = setMeta(out, /(<meta name="twitter:image" content=")([^"]*)(")/i, meta.twImage ?? meta.ogImage);
    out = setMeta(out, /(<meta property="og:image:alt" content=")([^"]*)(")/i, meta.ogImageAlt);
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

/* ============================================================================
   Vorrenderer fuer den noscript-Block der .dc-Seiten

   Das Problem: eine .dc-Seite liefert im HTML nur die Vorlage aus. Erst der
   Browser setzt die Uebersetzungsdaten ein und baut den Rumpf. Wer kein
   JavaScript ausfuehrt -- und das tut keiner der KI-Crawler, weder GPTBot noch
   ClaudeBot, PerplexityBot oder CCBot -- sieht davon nichts: gemessen am
   ausgelieferten HTML standen auf der Startseite 507 Woerter im noscript und
   daneben 391 unaufgeloeste {{ }}. Im Browser sind es 1'438 Woerter. Der
   Inhalt war da, er kam nur nicht heraus.

   Hier entsteht er deshalb beim Bauen ein zweites Mal, aus derselben Quelle:
   das Logikskript der Seite laeuft in einer Sandbox, renderVals() liefert
   dieselben Werte wie im Browser, und die Vorlage wird damit zu lesbarem Text
   ausgewertet. Aus einer Quelle erzeugt heisst: die beiden Fassungen koennen
   nicht auseinanderlaufen. Google fuehrt JavaScript aus und sieht beide; ein
   von Hand gepflegter Zweittext waere frueher oder spaeter ein Widerspruch,
   und ein Widerspruch liest sich wie Verschleierung.

   WARUM DER TEXT IN <noscript> GEHOERT UND NICHT INS TEMPLATE
   -----------------------------------------------------------
   Die naheliegende Idee ist, das gerenderte HTML gleich in <x-dc> zu legen.
   Das zerstoert die Seite. Die Laufzeit liest ihre Vorlage aus dem DOM
   (`template: dc.innerHTML`, support.js:32) -- das <x-dc>-Element IST die
   Vorlage, kein Container fuer ein Ergebnis. Wer dort Gerendertes hineinlegt,
   nimmt der Komponente ihre Vorlage weg, und es bleibt eine tote Seite.

   <noscript> ist die einzige Stelle, die beides kann. Ein Browser mit
   JavaScript parst den Inhalt als Text und rendert ihn nie; er taucht in
   keinem querySelector auf, wird von keinem IntersectionObserver gesehen, von
   keiner Messroutine vermessen und loest keine Animation ein zweites Mal aus.
   Ein Crawler ohne JavaScript liest genau ihn. Deshalb steht der erzeugte
   Block dort und nirgends sonst.
   ============================================================================ */

/* ------------------------- Ausdruecke ------------------------- */

/* Zeilengetreuer Nachbau von src/expr.ts aus support.js. Nachgebaut statt
   nachempfunden, weil jede Abweichung genau das erzeugen wuerde, was dieser
   Weg vermeiden soll: einen Unterschied zwischen dem, was der Crawler liest,
   und dem, was der Besucher sieht. */
const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*/;
const NUMBER_RE = /^-?\d+(\.\d+)?$/;

function resolve(vals, src) {
  const expr = String(src).trim();
  if (!expr) return undefined;
  if (expr[0] === '(' && expr[expr.length - 1] === ')' && parensWrapWhole(expr)) return resolve(vals, expr.slice(1, -1));
  const eq = findTopLevelEquality(expr);
  if (eq) {
    const lv = resolve(vals, expr.slice(0, eq.index));
    const rv = resolve(vals, expr.slice(eq.index + eq.op.length));
    switch (eq.op) {
      case '===': return lv === rv;
      case '!==': return lv !== rv;
      case '==': return lv == rv;
      default: return lv != rv;
    }
  }
  if (expr[0] === '!') return !resolve(vals, expr.slice(1));
  if (expr === 'true') return true;
  if (expr === 'false') return false;
  if (expr === 'null') return null;
  if (expr === 'undefined') return undefined;
  if (NUMBER_RE.test(expr)) return Number(expr);
  if (expr.length >= 2 && (expr[0] === '"' || expr[0] === "'") && expr[expr.length - 1] === expr[0]) return expr.slice(1, -1);
  return resolvePath(vals, expr);
}

function parensWrapWhole(expr) {
  let depth = 0;
  for (let i = 0; i < expr.length - 1; i++) {
    if (expr[i] === '(') depth++;
    else if (expr[i] === ')') { depth--; if (depth === 0) return false; }
  }
  return true;
}

function findTopLevelEquality(expr) {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (depth === 0 && (c === '=' || c === '!') && expr[i + 1] === '=') {
      if (i > 0 && (expr[i - 1] === '=' || expr[i - 1] === '!')) continue;
      if (!expr.slice(0, i).trim()) continue;
      return { index: i, op: expr[i + 2] === '=' ? c + '==' : c + '=' };
    }
  }
  return null;
}

function resolvePath(vals, expr) {
  const head = expr.match(IDENT_RE);
  if (!head) return undefined;
  let cur = vals == null ? undefined : vals[head[0]];
  let i = head[0].length;
  while (i < expr.length) {
    if (expr[i] === '.') {
      const m = expr.slice(i + 1).match(IDENT_RE) || expr.slice(i + 1).match(/^\d+/);
      if (!m) return undefined;
      cur = cur == null ? undefined : cur[m[0]];
      i += 1 + m[0].length;
    } else if (expr[i] === '[') {
      let depth = 1, j = i + 1;
      while (j < expr.length && depth > 0) {
        if (expr[j] === '[') depth++;
        else if (expr[j] === ']') { depth--; if (depth === 0) break; }
        j++;
      }
      if (depth !== 0) return undefined;
      cur = cur == null ? undefined : cur[resolve(vals, expr.slice(i + 1, j))];
      i = j + 1;
    } else return undefined;
  }
  return cur;
}

/* ------------------------- HTML lesen ------------------------- */

/* Ein eigener, absichtlich kleiner Parser statt jsdom: der Build soll ohne
   npm install laufen (siehe replaceTagged weiter oben, gleiche Ueberlegung).
   Er muss auch nur eine einzige, erzeugte und wohlgeformte Quelle lesen. */
const VOID_TAGS = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const RAWTEXT_TAGS = new Set(['script', 'style', 'textarea', 'title']);

function parseHtml(html) {
  const root = { tag: '#root', attrs: {}, children: [] };
  const stack = [root];
  const top = () => stack[stack.length - 1];
  const addText = (s) => { if (s) top().children.push({ tag: '#text', text: s }); };
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { addText(html.slice(i)); break; }
    if (lt > i) addText(html.slice(i, lt));
    if (html.startsWith('<!--', lt)) { const e = html.indexOf('-->', lt); i = e < 0 ? html.length : e + 3; continue; }
    if (html.startsWith('<!', lt)) { const e = html.indexOf('>', lt); i = e < 0 ? html.length : e + 1; continue; }

    if (html[lt + 1] === '/') {
      const e = html.indexOf('>', lt);
      const name = html.slice(lt + 2, e < 0 ? html.length : e).trim().toLowerCase();
      for (let k = stack.length - 1; k > 0; k--) if (stack[k].tag === name) { stack.length = k; break; }
      i = e < 0 ? html.length : e + 1;
      continue;
    }

    const m = /^<([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(lt, lt + 48));
    if (!m) { addText('<'); i = lt + 1; continue; }
    const tag = m[1].toLowerCase();
    // Grafik wird als Ganzes uebersprungen: sie traegt keinen Text, und ihre
    // Kindelemente halten sich nicht an die Regeln fuer leere Elemente.
    if (tag === 'svg') { i = skipSubtree(html, lt, 'svg'); continue; }

    let j = lt + m[0].length, selfClose = false;
    const attrs = {};
    while (j < html.length) {
      while (j < html.length && /\s/.test(html[j])) j++;
      if (html[j] === '>') { j++; break; }
      if (html[j] === '/' && html[j + 1] === '>') { selfClose = true; j += 2; break; }
      const am = /^[^\s=/>]+/.exec(html.slice(j));
      if (!am) { j++; continue; }
      const name = am[0].toLowerCase();
      j += am[0].length;
      const afterName = j;
      let val = '';
      while (j < html.length && /\s/.test(html[j])) j++;
      if (html[j] === '=') {
        j++;
        while (j < html.length && /\s/.test(html[j])) j++;
        const q = html[j];
        if (q === '"' || q === "'") {
          const e = html.indexOf(q, j + 1);
          val = html.slice(j + 1, e < 0 ? html.length : e);
          j = e < 0 ? html.length : e + 1;
        } else {
          const e = /[\s>]/.exec(html.slice(j));
          const end = e ? j + e.index : html.length;
          val = html.slice(j, end);
          j = end;
        }
      } else j = afterName;   // Attribut ohne Wert
      attrs[name] = val;
    }

    const node = { tag, attrs, children: [] };
    top().children.push(node);
    i = j;
    if (selfClose || VOID_TAGS.has(tag)) continue;
    if (RAWTEXT_TAGS.has(tag)) {
      const close = html.toLowerCase().indexOf('</' + tag, i);
      node.children.push({ tag: '#text', text: html.slice(i, close < 0 ? html.length : close) });
      const gt = close < 0 ? -1 : html.indexOf('>', close);
      i = gt < 0 ? html.length : gt + 1;
      continue;
    }
    stack.push(node);
  }
  return root;
}

function skipSubtree(html, from, tag) {
  const openRe = new RegExp('<' + tag + '(?=[\\s/>])', 'gi');
  const closeRe = new RegExp('</' + tag + '\\s*>', 'gi');
  let depth = 0, i = from;
  while (i < html.length) {
    openRe.lastIndex = i; closeRe.lastIndex = i;
    const o = openRe.exec(html), c = closeRe.exec(html);
    if (!c) return html.length;
    if (o && o.index < c.index) { depth++; i = o.index + o[0].length; continue; }
    depth--;
    i = c.index + c[0].length;
    if (depth <= 0) return i;
  }
  return html.length;
}

/* ------------------------- Die Logik der Seite ausfuehren ------------------------- */

/* Die Komponente wird gebaut, aber nie montiert: nur der Konstruktor und
   renderVals() laufen. Alles, was erst componentDidMount anfasst -- Canvas,
   WebGL, Beobachter, Zeitgeber -- kommt hier nie an die Reihe. Die Attrappen
   unten muessen deshalb nur das aushalten, was ein Konstruktor beruehrt.

   localStorage ist der Hebel fuer die Sprache: die Komponenten lesen dort
   'eucowork_lang'. Wir antworten mit der Zielsprache und bekommen damit
   denselben Weg wie im Browser, ohne einen zweiten einzubauen. */
function makeSandbox(lang) {
  const noop = () => {};
  const fakeEl = () => ({
    style: {}, dataset: {}, textContent: '', offsetWidth: 0, offsetHeight: 0,
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    setAttribute: noop, getAttribute: () => null, removeAttribute: noop,
    appendChild: noop, removeChild: noop, addEventListener: noop, removeEventListener: noop,
    getContext: () => null, querySelector: () => null, querySelectorAll: () => [],
    getBoundingClientRect: () => ({ x: 0, y: 0, top: 0, left: 0, width: 0, height: 0 }),
    contains: () => false
  });
  const doc = {
    createElement: fakeEl, createElementNS: fakeEl,
    documentElement: fakeEl(), head: fakeEl(), body: fakeEl(),
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
    addEventListener: noop, removeEventListener: noop, hidden: false
  };
  // 1280 Pixel breit: die Kopfleiste schaltet unter 940 auf das Klappmenue um.
  // Auf der breiten Fassung steht die Navigation als Liste im Markup, und der
  // Crawler findet die Verweise ohne einen Zustand, den er nie umschaltet.
  const win = {
    innerWidth: 1280, innerHeight: 900, devicePixelRatio: 1, scrollY: 0,
    addEventListener: noop, removeEventListener: noop, dispatchEvent: noop,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop }),
    performance: { now: () => 0 },
    location: { pathname: '/', search: '', hash: '', href: ORIGIN + '/' },
    navigator: { language: lang, languages: [lang], userAgent: 'build-i18n' },
    requestAnimationFrame: () => 0, cancelAnimationFrame: noop,
    setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0, clearInterval: noop
  };
  win.document = doc;
  const sandbox = {
    window: win, document: doc, navigator: win.navigator, location: win.location,
    localStorage: { getItem: (k) => (k === 'eucowork_lang' ? lang : null), setItem: noop, removeItem: noop },
    sessionStorage: { getItem: () => null, setItem: noop, removeItem: noop },
    console: { log: noop, warn: noop, error: noop, info: noop, debug: noop },
    setTimeout: () => 0, clearTimeout: noop, setInterval: () => 0, clearInterval: noop,
    requestAnimationFrame: () => 0, cancelAnimationFrame: noop,
    fetch: () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }),
    CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } },
    Event: class { constructor(t) { this.type = t; } },
    // React wird nur fuer createRef gebraucht; gerendert wird hier nichts.
    React: { createRef: () => ({ current: null }), createElement: () => ({}), Fragment: 'Fragment', isValidElement: () => false },
    ReactDOM: {},
    DCLogic: class {
      constructor(props) { this.props = props || {}; this.state = {}; }
      setState(u) { Object.assign(this.state, typeof u === 'function' ? u(this.state, this.props) : u); }
      forceUpdate() {}
    }
  };
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  return sandbox;
}

/* Vorlage und Logikskript einer .dc-Datei trennen -- dieselbe Aufteilung, die
   parseDcText in support.js vornimmt. */
function splitDc(src) {
  const open = /<x-dc(?:\s[^>]*)?>/.exec(src);
  const close = src.lastIndexOf('</x-dc>');
  const template = open && close > open.index ? src.slice(open.index + open[0].length, close) : '';
  const script = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(src);
  return { template, script: script ? script[1] : '' };
}

function runRenderVals(script, lang, props) {
  const sandbox = makeSandbox(lang);
  vm.createContext(sandbox);
  const Comp = vm.runInContext(script + '\n;typeof Component !== "undefined" ? Component : null;', sandbox, { timeout: 15000 });
  if (!Comp) throw new Error('keine Component-Klasse im Logikskript');
  const inst = new Comp(props || {});
  if (!inst.state) inst.state = {};
  inst.state.lang = lang;   // Ohne localStorage-Attrappe waere hier 'de'.
  return typeof inst.renderVals === 'function' ? (inst.renderVals() || {}) : {};
}

/* ------------------------- Vorlage zu lesbarem Text ------------------------- */

/* Ziel ist Lesbarkeit, nicht originalgetreues Markup. Was bleibt: die
   Ueberschriften in ihrer Hierarchie, die Absaetze, die Listen, die Tabellen
   und vor allem die internen Verweise. Was faellt: Attrappen-Fenster,
   Animationsgeruest, Inline-Grafik -- alles, was auf der Seite Bild ist und
   im Text nichts erklaert. */
const DROP_TAGS = new Set(['script', 'style', 'helmet', 'sc-helmet', 'noscript', 'template',
  'iframe', 'video', 'audio', 'object', 'canvas', 'x-import', 'picture', 'source',
  'img', 'input', 'link', 'meta', 'svg']);
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
/* b und i sind hier durchweg Auszeichnung im Fliesstext, nicht Rolle. */
const INLINE_TAGS = { strong: 'strong', b: 'strong', em: 'em', i: 'em', code: 'code' };
const TRANSPARENT_INLINE = new Set(['span', 'sub', 'sup', 'small', 'abbr', 'mark', 'time', 'u', 's', 'kbd', 'var', 'cite', 'q']);

function interpolate(text, vals) {
  if (!text.includes('{{')) return escapeText(text);
  const parts = text.split(/\{\{([\s\S]+?)\}\}/g);
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    if (!(i & 1)) { out += escapeText(parts[i]); continue; }
    const v = resolve(vals, parts[i]);
    // Funktionen, Objekte und React-Elemente haben keinen Text. Sie still
    // wegzulassen ist richtig: die Laufzeit macht an dieser Stelle dasselbe.
    if (v === undefined || v === null || typeof v !== 'string' && typeof v !== 'number') continue;
    out += escapeText(String(v));
  }
  return out;
}

function attrValue(node, name, vals) {
  const raw = node.attrs[name];
  if (raw === undefined) return undefined;
  const whole = raw.match(/^\s*\{\{([\s\S]+?)\}\}\s*$/);
  if (whole) return resolve(vals, whole[1]);
  if (raw.includes('{{')) return raw.split(/\{\{([\s\S]+?)\}\}/g).map((s, i) => (i & 1 ? (resolve(vals, s) ?? '') : s)).join('');
  return raw;
}

/* Sammelt Text. `inlineOnly` schaltet das Bilden von Bloecken ab -- gebraucht
   dort, wo aus einem ganzen Teilbaum eine einzige Zeile werden muss, etwa in
   einer Verweis-Kachel, die ausser Text auch Ueberschrift und Absatz enthaelt. */
class Sink {
  constructor(inlineOnly) { this.blocks = []; this.inline = []; this.inlineOnly = !!inlineOnly; this.cells = null; }
  text(s) { if (s) this.inline.push(s); }
  take() { const s = this.inline.join('').replace(/\s+/g, ' ').trim(); this.inline.length = 0; return s; }
  peek() { return this.inline.join('').replace(/\s+/g, ' ').trim(); }
  flush(tag) {
    if (this.inlineOnly) { this.inline.push(' '); return; }
    const s = this.take();
    if (s) this.blocks.push(`<${tag || 'p'}>${s}</${tag || 'p'}>`);
  }
}

function kebabToCamel(s) { return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()); }

function walkChildren(node, vals, sink, ctx) {
  for (const child of node.children) walkNode(child, vals, sink, ctx);
}

function emitBlock(node, vals, sink, ctx, tag, prefix) {
  if (sink.inlineOnly) { sink.text(' '); walkChildren(node, vals, sink, ctx); sink.text(' '); return; }
  sink.flush();
  const sub = new Sink(false);
  if (prefix) sub.text(prefix);
  walkChildren(node, vals, sub, ctx);
  sub.flush(tag);
  for (const b of sub.blocks) sink.blocks.push(b);
}

function emitGroup(node, vals, sink, ctx, wrapper, itemTag) {
  if (sink.inlineOnly) { walkChildren(node, vals, sink, ctx); return; }
  sink.flush();
  const sub = new Sink(false);
  walkChildren(node, vals, sub, ctx);
  sub.flush(itemTag);
  if (sub.blocks.length) sink.blocks.push(`<${wrapper}>${sub.blocks.join('')}</${wrapper}>`);
}

function walkNode(node, vals, sink, ctx) {
  if (node.tag === '#text') { sink.text(interpolate(node.text, vals)); return; }
  const tag = node.tag;
  if (DROP_TAGS.has(tag)) return;

  if (tag === 'sc-for') {
    const list = attrValue(node, 'list', vals);
    if (!Array.isArray(list)) return;
    const as = node.attrs.as || 'item';
    list.forEach((item, i) => walkChildren(node, { ...vals, [as]: item, $index: i }, sink, ctx));
    return;
  }

  if (tag === 'sc-if') {
    if (attrValue(node, 'value', vals)) walkChildren(node, vals, sink, ctx);
    return;
  }

  /* Kopf- und Fussleiste kommen erst zur Laufzeit dazu und fehlen im
     ausgelieferten HTML vollstaendig. Sie sind selbst .dc-Komponenten, also
     werden sie hier auf demselben Weg gerendert -- damit stehen die
     Navigationsverweise im Block und ein Crawler kommt von jeder Seite
     weiter, statt in einer Sackgasse zu landen. */
  if (tag === 'dc-import') {
    const name = node.attrs.name || node.attrs.component || '';
    const props = {};
    for (const key of Object.keys(node.attrs)) {
      if (key === 'name' || key === 'component' || key === 'hint-size' || key === 'style') continue;
      props[kebabToCamel(key)] = attrValue(node, key, vals);
    }
    const blocks = ctx.renderImport(name, props);
    if (blocks.length) { sink.flush(); for (const b of blocks) sink.blocks.push(b); }
    return;
  }

  if (HEADING_TAGS.has(tag)) {
    /* Die Ziffer vor einer Abschnittsueberschrift steht im Markup daneben,
       nicht darin. Als eigener Absatz waere sie Muell; sie gehoert an die
       Ueberschrift, so wie sie auf der Seite auch gelesen wird. */
    let prefix = '';
    const pending = sink.peek();
    if (!sink.inlineOnly && pending && pending.length <= 24 && !pending.includes('<') && !/[.!?:]$/.test(pending)) {
      sink.inline.length = 0;
      prefix = pending + ' ';
    }
    emitBlock(node, vals, sink, ctx, tag, prefix);
    return;
  }

  if (tag === 'a') {
    const sub = new Sink(true);
    walkChildren(node, vals, sub, ctx);
    const label = sub.take();
    if (!label) return;
    const href = attrValue(node, 'href', vals);
    if (typeof href === 'string' && href && !href.startsWith('javascript:')) sink.text(`<a href="${escapeAttr(href)}">${label}</a>`);
    else sink.text(label);
    return;
  }

  if (INLINE_TAGS[tag]) {
    const sub = new Sink(true);
    walkChildren(node, vals, sub, ctx);
    const label = sub.take();
    if (label) sink.text(`<${INLINE_TAGS[tag]}>${label}</${INLINE_TAGS[tag]}>`);
    return;
  }

  if (tag === 'br') { sink.text(' '); return; }
  if (tag === 'hr') { sink.flush(); return; }

  if (TRANSPARENT_INLINE.has(tag)) { sink.text(' '); walkChildren(node, vals, sink, ctx); sink.text(' '); return; }

  if (tag === 'p' || tag === 'blockquote' || tag === 'pre') { emitBlock(node, vals, sink, ctx, tag); return; }
  if (tag === 'figcaption' || tag === 'summary' || tag === 'option') { emitBlock(node, vals, sink, ctx, 'p'); return; }
  if (tag === 'ul' || tag === 'ol') { emitGroup(node, vals, sink, ctx, tag, 'li'); return; }
  if (tag === 'dl') { emitGroup(node, vals, sink, ctx, 'dl', 'dd'); return; }
  if (tag === 'li' || tag === 'dt' || tag === 'dd') { emitBlock(node, vals, sink, ctx, tag); return; }

  if (tag === 'table') { emitGroup(node, vals, sink, ctx, 'table', 'tr'); return; }
  if (tag === 'thead' || tag === 'tbody' || tag === 'tfoot') { walkChildren(node, vals, sink, ctx); return; }
  if (tag === 'tr') {
    if (sink.inlineOnly) { walkChildren(node, vals, sink, ctx); return; }
    sink.flush();
    const sub = new Sink(false);
    sub.cells = [];
    walkChildren(node, vals, sub, ctx);
    if (sub.cells.length) sink.blocks.push(`<tr>${sub.cells.join('')}</tr>`);
    return;
  }
  if (tag === 'th' || tag === 'td') {
    const sub = new Sink(true);
    walkChildren(node, vals, sub, ctx);
    const cell = sub.take();
    if (sink.cells) sink.cells.push(`<${tag}>${cell}</${tag}>`);
    else sink.text(cell + ' ');
    return;
  }

  /* Alles Uebrige (div, section, main, header, nav, button ...) ist Layout:
     durchreichen, aber die Textlaeufe davor und danach abschliessen, damit
     nicht zwei Beschriftungen zu einem Satz verschmelzen. */
  if (sink.inlineOnly) { sink.text(' '); walkChildren(node, vals, sink, ctx); sink.text(' '); return; }
  sink.flush();
  walkChildren(node, vals, sink, ctx);
  sink.flush();
}

/* ------------------------- Einstieg ------------------------- */

/* Der Baumdurchlauf ist synchron, das Einlesen der Dateien nicht. Alle
   .dc-Quellen werden deshalb einmal vorab geholt; danach ist der Vorrenderer
   eine reine Rechnung ohne Dateizugriff.

   Kopf und Fuss sind auf allen acht Seiten dieselben; ohne den Speicher liefe
   ihr Logikskript achtzigmal statt zehnmal. */
const dcSources = new Map();
const prerenderCache = new Map();

async function loadDcSources(files) {
  for (const f of files) {
    if (!dcSources.has(f)) dcSources.set(f, await readFile(join(ROOT, f), 'utf8'));
  }
}

function prerender(file, lang, props) {
  const key = `${file}\0${lang}\0${JSON.stringify(props || {})}`;
  if (prerenderCache.has(key)) return prerenderCache.get(key);
  const src = dcSources.get(file);
  if (src === undefined) throw new Error(`${file}: nicht eingelesen`);
  const { template, script } = splitDc(src);
  if (!template) throw new Error(`${file}: kein <x-dc>-Rumpf gefunden`);
  const vals = runRenderVals(script, lang, props);
  const sink = new Sink(false);
  const ctx = {
    renderImport: (name, p) => (/^Site(Header|Footer)$/.test(name) ? prerender(name + '.dc.html', lang, p) : [])
  };
  walkChildren(parseHtml(template), vals, sink, ctx);
  sink.flush();
  prerenderCache.set(key, sink.blocks);
  return sink.blocks;
}

const NOSCRIPT_START = '<!-- i18n:noscript:start -->';
const NOSCRIPT_END = '<!-- i18n:noscript:end -->';

/* Idempotent ersetzen, genau wie bei den hreflang-Blocken: beim ersten Lauf
   tritt der erzeugte Block an die Stelle des von Hand gepflegten Inhalts, bei
   jedem weiteren nur noch an die Stelle seiner selbst. */
function injectNoscript(html, block) {
  const marked = `${NOSCRIPT_START}\n${block}\n${NOSCRIPT_END}`;
  const existing = new RegExp(`${NOSCRIPT_START}[\\s\\S]*?${NOSCRIPT_END}`);
  if (existing.test(html)) return html.replace(existing, () => marked);
  if (/<noscript>[\s\S]*?<\/noscript>/i.test(html)) {
    return html.replace(/<noscript>[\s\S]*?<\/noscript>/i, () => `<noscript>\n${marked}\n</noscript>`);
  }
  return html.replace(/<body([^>]*)>/i, (full) => `${full}\n<noscript>\n${marked}\n</noscript>`);
}

function noscriptBlock(page, lang) {
  const blocks = prerender(page.src, lang, {});
  // Die Laufzeit setzt die Sprachpraefixe im DOM nach (assets/i18n.js). An den
  // noscript-Inhalt kommt sie nicht heran -- der ist fuer den Browser Text --,
  // also muessen die Verweise hier schon in der Zielsprache stehen.
  return prefixLinks(blocks.join('\n'), lang);
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
  const src = dcSources.get(page.src) ?? await readFile(join(ROOT, page.src), 'utf8');
  let out = rewriteHead(src, { lang, pagePath: page.path, meta });

  // Relative Verweise brechen eine Ebene tiefer.
  out = out.replace(/src="\.\/support\.js"/g, 'src="/support.js"');

  // Der Rumpf entsteht im Browser; der noscript-Block ist die Fassung fuer
  // alles, was kein JavaScript ausfuehrt. Er wird aus derselben Vorlage und
  // denselben Uebersetzungsdaten erzeugt, aus denen die Laufzeit rendert.
  const errors = [];
  try {
    out = injectNoscript(out, noscriptBlock(page, lang));
  } catch (err) {
    // Ein Fehler im Vorrenderer darf den Build nicht anhalten. Dann steht dort
    // wieder die knappe Fassung aus den Metadaten -- duerftig, aber nie leer.
    errors.push(`Vorrenderer: ${err.message}`);
    if (meta) {
      out = injectNoscript(out, `<h1>${escapeText(meta.title)}</h1>\n<p>${escapeText(meta.description || '')}</p>`);
    }
  }
  return { html: out, missing: [], errors };
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

  // Der Vorrenderer arbeitet ohne Dateizugriff; die Quellen kommen vorher.
  await loadDcSources([
    ...PAGES.filter(p => p.kind === 'dc').map(p => p.src),
    'SiteHeader.dc.html', 'SiteFooter.dc.html'
  ]);

  const problems = [];
  let written = 0;

  for (const page of PAGES) {
    const pageMeta = metaAll[page.key];
    if (!pageMeta) problems.push(`${page.key}: keine Metadaten`);

    /* Deutsch bleibt an seinem Platz, bekommt aber die hreflang-Verknuepfung --
       und seit dem Vorrenderer auch den erzeugten noscript-Block, denn die
       deutsche Fassung wird direkt aus *.dc.html ausgeliefert. */
    const deSrc = await readFile(join(ROOT, page.src), 'utf8');
    let deOut = injectHreflang(deSrc, page.path);
    if (page.kind === 'dc') {
      try {
        deOut = injectNoscript(deOut, noscriptBlock(page, 'de'));
      } catch (err) {
        problems.push(`${page.key}/de: Vorrenderer: ${err.message}`);
      }
    }
    if (deOut !== deSrc) {
      await writeFile(join(ROOT, page.src), deOut);
      dcSources.set(page.src, deOut);
    }

    for (const lang of OTHER) {
      const meta = pageMeta ? pageMeta[lang] : null;
      if (pageMeta && !meta) problems.push(`${page.key}/${lang}: Metadaten fehlen`);
      const built = page.kind === 'static'
        ? await buildStatic(page, lang, meta, chrome)
        : await buildDc(page, lang, meta);
      if (built.missing.length) {
        problems.push(`${page.key}/${lang}: ${built.missing.length} Schluessel ohne Uebersetzung (${[...new Set(built.missing)].slice(0, 3).join(', ')})`);
      }
      for (const e of built.errors || []) problems.push(`${page.key}/${lang}: ${e}`);
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
