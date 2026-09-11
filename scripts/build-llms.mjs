/* =============================================================================
   Erzeugt llms.txt und llms-full.txt fuer alle fuenf Sprachen.

   Warum: llms.txt ist der Einstieg, den Sprachmodelle als erstes holen. Bis
   jetzt gab es davon genau eine, auf Deutsch, mit null Adressen aus den vier
   uebersetzten Baeumen. 128 uebersetzte Seiten waren damit fuer das eine
   Artefakt unsichtbar, das eigens fuer Maschinen gedacht ist.

   Zwei Dateien je Sprache:

     llms.txt       Der kuratierte Einstieg: Was das Produkt ist, was es kann,
                    wo die Belege liegen, danach die Linkliste. Der Fliesstext
                    kommt aus scripts/llms-prose.mjs, die Linkliste aus
                    assets/seo-meta-*.json. Titel und Beschreibungen sind dort
                    bereits uebersetzt und gepflegt; wer eine Seitenbeschreibung
                    aendert, aendert damit automatisch auch die llms.txt.

     llms-full.txt  Der Volltext: der Sichttext jeder Seite dieser Sprache,
                    hintereinander. Fuer Modelle, die nicht 30 Adressen einzeln
                    holen wollen. Wird aus den gebauten Seiten extrahiert, ist
                    also per Konstruktion identisch mit dem, was ausgeliefert
                    wird.

   Reihenfolge: erst node scripts/build-i18n.mjs, dann dieses Skript. Die
   Sprachbaeume muessen existieren, sonst hat der Volltext nichts zu lesen.

   Aufruf: node scripts/build-llms.mjs
   ============================================================================= */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { PROSA, SPRACHNAMEN } from './llms-prose.mjs';
import { LINKS } from './llms-links.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const ORIGIN = 'https://kisuno.ai';
const LANGS = ['de', 'en', 'fr', 'it', 'es'];

/* Die Gliederung der Linkliste. Reihenfolge und Gruppierung sind bewusst
   gesetzt: was ein Kaufinteressent zuerst braucht, steht zuerst. Die Schluessel
   entsprechen denen in assets/seo-meta-*.json, die Pfade denen in
   scripts/build-i18n.mjs. */
const SEITEN = [
  { key: 'landing',        path: '/' },
  { key: 'preise',         path: '/preise' },
  { key: 'warteliste',     path: '/warteliste' },
  { key: 'vergleich',      path: '/vergleich' },
  { key: 'faq',            path: '/faq' },
  { key: 'sicherheit',     path: '/sicherheit' },
  { key: 'governance',     path: '/governance' },
  { key: 'integrationen',  path: '/integrationen' },
  { key: 'self-hosting',   path: '/self-hosting' },
  { key: 'vision',         path: '/vision' },
  { key: 'blog',           path: '/blog' }
];

const ARTIKEL = [
  { key: 'blog-ch-daten',       path: '/blog/ki-datenhaltung-schweiz' },
  { key: 'blog-fristen',        path: '/blog/ai-act-fristen-dezember-2026' },
  { key: 'blog-agenten',        path: '/blog/ki-agenten-governance' },
  { key: 'blog-haftung',        path: '/blog/ki-haftung-italien' },
  { key: 'blog-quellen',        path: '/blog/ki-quellen-statt-halluzination' },
  { key: 'blog-anthropic',      path: '/blog/anthropic-modelle-schweiz' },
  { key: 'blog-handwerk-eu',    path: '/blog/ki-handwerk-europa' },
  { key: 'blog-produktion-eu',  path: '/blog/ki-produktion-europa' },
  { key: 'blog-kanzlei-eu',     path: '/blog/ki-kanzlei-europa' },
  { key: 'blog-immobilien-eu',  path: '/blog/ki-immobilien-europa' },
  { key: 'blog-praxis-eu',      path: '/blog/ki-praxis-europa' },
  { key: 'blog-handwerk',       path: '/blog/ki-handwerk-kmu' },
  { key: 'blog-produktion',     path: '/blog/ki-produktion' },
  { key: 'blog-treuhand',       path: '/blog/ki-treuhand-kanzlei' },
  { key: 'blog-immobilien',     path: '/blog/ki-immobilienverwaltung' },
  { key: 'blog-praxis',         path: '/blog/ki-praxis-apotheke' }
];

const RECHT = [
  { key: 'avv',            path: '/avv' },
  { key: 'subprozessoren', path: '/subprozessoren' },
  { key: 'datenschutz',    path: '/datenschutz' },
  { key: 'agb',            path: '/agb' },
  { key: 'impressum',      path: '/impressum' }
];

/* Die Dokumentation bringt ihre eigene Zweisprachigkeit mit und hat eigene
   llms-Dateien; sie wird deshalb nur verwiesen, nicht ausgelesen. */
const DOCS = {
  de: { pfad: '/docs',    text: 'Dokumentation auf Deutsch, Englisch, Französisch, Italienisch und Spanisch: Überblick, Funktionen aus Nutzersicht, Administration und die Konzepte hinter Self-Hosting und MCP-Anbindungen. Wegweiser durch alle Seiten aller Sprachen: https://kisuno.ai/docs/llms.txt, Volltext: https://kisuno.ai/docs/llms-full.txt.' },
  en: { pfad: '/docs/en', text: 'Documentation: overview, features, administration, self-hosting and MCP. Its own llms.txt at /docs/llms.txt, full text at /docs/llms-full.txt.' },
  fr: { pfad: '/docs/fr', text: 'Documentation : aperçu, fonctions, administration, auto-hébergement et MCP. Sa propre llms.txt à /docs/llms.txt, texte intégral à /docs/llms-full.txt.' },
  it: { pfad: '/docs/it', text: 'Documentazione: panoramica, funzioni, amministrazione, self-hosting e MCP. Una propria llms.txt a /docs/llms.txt, testo integrale a /docs/llms-full.txt.' },
  es: { pfad: '/docs/es', text: 'Documentación: visión general, funciones, administración, autoalojamiento y MCP. Su propia llms.txt en /docs/llms.txt, texto completo en /docs/llms-full.txt.' }
};

const url = (lang, pfad) => {
  if (lang === 'de') return ORIGIN + pfad;
  if (pfad === '/') return `${ORIGIN}/${lang}`;
  return `${ORIGIN}/${lang}${pfad}`;
};

/* Die Datei im Sprachbaum, aus der der Volltext kommt. */
function datei(lang, pfad) {
  const rel = pfad === '/' ? 'index.html' : pfad.replace(/^\//, '') + '/index.html';
  if (lang === 'de') {
    // Deutsch liegt teils als .dc.html in der Wurzel, teils als statische Seite.
    const dc = {
      '/': 'Landing.dc.html', '/preise': 'Preise.dc.html', '/warteliste': 'Waitlist.dc.html',
      '/impressum': 'Impressum.dc.html', '/datenschutz': 'Datenschutz.dc.html',
      '/agb': 'AGB.dc.html', '/avv': 'AVV.dc.html', '/subprozessoren': 'Subprozessoren.dc.html'
    }[pfad];
    return join(ROOT, dc || rel);
  }
  return join(ROOT, lang, rel);
}

/* Sichttext einer Seite.

   Die .dc-Seiten tragen zweierlei im Markup: die Vorlage mit ihren {{ }}
   Platzhaltern und daneben den vorgerenderten <noscript>-Block mit dem
   fertigen Text. Fuer den Volltext gilt der noscript-Block; die Vorlage wird
   verworfen, sonst stuenden 472 Platzhalter im Volltext. Statische Seiten
   haben keinen noscript-Block und werden ganz gelesen. */
function sichttext(html) {
  const ns = html.match(/<noscript>([\s\S]*?)<\/noscript>/i);
  let s = ns ? ns[1] : html;
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  if (!ns) s = s.replace(/<header[\s\S]*?<\/header>|<footer[\s\S]*?<\/footer>/gi, '');
  // Blockelemente werden zu Absatzgrenzen, damit der Text lesbar bleibt.
  s = s.replace(/<\/(p|div|li|h[1-6]|tr|section|article|dd|dt|blockquote)>/gi, '\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<li[^>]*>/gi, '- ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/\{\{[^}]*\}\}/g, '');
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
       .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
       .replace(/&shy;/g, '').replace(/&auml;/g, 'ä').replace(/&ouml;/g, 'ö')
       .replace(/&uuml;/g, 'ü');
  s = s.split('\n').map(z => z.replace(/[ \t]+/g, ' ').trim()).filter(Boolean).join('\n');
  return s.replace(/\n{3,}/g, '\n\n');
}

/* Das Datum kommt aus Git, nicht von Hand. Die alte llms.txt trug den 17.
   August und beschrieb Artikel vom 3. September. */
function heute() {
  const jetzt = new Date().toISOString().slice(0, 10);
  try {
    // Bei ungespeicherten Aenderungen gilt heute, sonst das Datum des letzten
    // Commits. Sonst traegt die Datei nach jedem Commit das Datum davor.
    const schmutzig = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT }).toString().trim();
    if (schmutzig) return jetzt;
    return execFileSync('git', ['log', '-1', '--format=%cs'], { cwd: ROOT }).toString().trim();
  } catch {
    return jetzt;
  }
}

/* Eine Linkzeile. Wo eine handgeschriebene Beschreibung vorliegt, gewinnt
   sie; sonst die SEO-Beschreibung aus assets/seo-meta-*.json. Der Titelzusatz
   " | Kisuno" faellt weg, in einer Liste unter der Ueberschrift
   "Kisuno" ist er nur Wiederholung. */
function liste(lang, meta, eintraege) {
  const eigen = LINKS[lang] || {};
  const zeilen = [];
  for (const e of eintraege) {
    const hand = eigen[e.key];
    const m = meta[e.key] && meta[e.key][lang];
    if (!hand && !m) { zeilen.push(`  FEHLT: ${e.key}/${lang}`); continue; }
    const titel = (hand && hand.titel) || m.title.replace(/\s*\|\s*Kisuno\s*$/, '');
    const text = (hand && hand.text) || m.description;
    zeilen.push(`- [${titel}](${url(lang, e.path)}): ${text}`);
  }
  return zeilen.join('\n');
}

function baueLlms(lang, meta, stand) {
  const t = PROSA[lang];
  const a = [];
  a.push(`# ${t.titel}`, '');
  a.push(`> ${t.zusammenfassung}`, '');
  for (const p of t.intro) a.push(p, '');
  a.push(`## ${t.hKoennen}`, '');
  for (const b of t.koennen) a.push(`- ${b}`);
  a.push('');
  a.push(`## ${t.hGovernance}`, '');
  for (const b of t.governance) a.push(`- ${b}`);
  a.push('');
  a.push(`## ${t.hDatenschutz}`, '');
  for (const b of t.datenschutz) a.push(`- ${b}`);
  a.push('');
  a.push(`## ${t.hAnbindungen}`, '', t.anbindungen, '');
  a.push(`## ${t.hMarkt}`, '', t.markt, '');
  a.push(`## ${t.hSeiten}`, '', liste(lang, meta, SEITEN));
  a.push(`- [${DOCS[lang].pfad === '/docs' ? 'Dokumentation' : 'Docs'}](${ORIGIN}${DOCS[lang].pfad}): ${DOCS[lang].text}`, '');
  a.push(`## ${t.hBlog}`, '', t.blogLead, '', liste(lang, meta, ARTIKEL), '');
  a.push(`## ${t.hRecht}`, '', liste(lang, meta, RECHT), '');
  a.push(`## ${t.hPruef}`, '', t.pruefLead, '');
  t.pruef.forEach((f, i) => a.push(`${i + 1}. ${f}`));
  a.push('');
  a.push(`## ${t.hStatus}`, '', t.status, '');
  a.push(`## ${t.hKontakt}`, '', t.kontakt, '');
  a.push(`## ${t.hVolltext}`, '', t.volltext.replace('{full}', url(lang, '/llms-full.txt').replace(/\/llms-full\.txt$/, '/llms-full.txt')), '');
  a.push(`## ${t.hSprachen}`, '');
  for (const l of LANGS) {
    if (l === lang) continue;
    a.push(`- [${SPRACHNAMEN[l][lang]}](${url(l, '/llms.txt')})`);
  }
  a.push('', `${t.stand}: ${stand}.`, '');
  return a.join('\n');
}

/* Kopf- und Fussleiste stehen auf jeder Seite und werden bewusst NICHT
   entfernt. Nachgemessen sind es sieben Zeilentypen und 371 Woerter, also
   0.5 Prozent der Datei. Eine Haeufigkeitsfilterung wuerde dafuer echte
   Zwischentitel wie "Kurz gesagt" und "Auf dieser Seite" mitreissen, die auf
   fast jeder Seite stehen und Struktur tragen. */
async function baueVolltext(lang, meta, stand) {
  const t = PROSA[lang];
  const alle = [...SEITEN, ...ARTIKEL, ...RECHT];
  const roh = [];
  const fehlend = [];
  for (const e of alle) {
    const p = datei(lang, e.path);
    if (!existsSync(p)) { fehlend.push(p); continue; }
    const m = meta[e.key] && meta[e.key][lang];
    roh.push({
      titel: m ? m.title.replace(/\s*\|\s*Kisuno\s*$/, '') : e.key,
      url: url(lang, e.path),
      text: sichttext(await readFile(p, 'utf8'))
    });
  }

  const a = [];
  a.push(`# ${t.titel}`, '');
  a.push(`> ${t.zusammenfassung}`, '');
  a.push(`${t.stand}: ${stand}.`, '');
  for (const s of roh) {
    a.push('---', '', `# ${s.titel}`, '', `URL: ${s.url}`, '', s.text, '');
  }
  for (const p of fehlend) a.push(`<!-- fehlt: ${p} -->`, '');
  return { text: a.join('\n'), gelesen: roh.length };
}

async function main() {
  const meta = {};
  for (const f of ['assets/seo-meta-dc.json', 'assets/seo-meta-static.json']) {
    Object.assign(meta, JSON.parse(await readFile(join(ROOT, f), 'utf8')));
  }
  const stand = heute();
  const probleme = [];

  for (const lang of LANGS) {
    const ziel = lang === 'de' ? ROOT : join(ROOT, lang);
    if (lang !== 'de' && !existsSync(ziel)) {
      probleme.push(`Sprachbaum fehlt: /${lang}. Zuerst scripts/build-i18n.mjs laufen lassen.`);
      continue;
    }
    const kurz = baueLlms(lang, meta, stand);
    if (kurz.includes('FEHLT:')) probleme.push(`${lang}/llms.txt: Metadaten fehlen`);
    await writeFile(join(ziel, 'llms.txt'), kurz);

    const { text, gelesen } = await baueVolltext(lang, meta, stand);
    if (text.includes('<!-- fehlt:')) probleme.push(`${lang}/llms-full.txt: Seiten fehlen`);
    await writeFile(join(ziel, 'llms-full.txt'), text);

    const w = (s) => (s.match(/\S+/g) || []).length;
    console.log(`${lang}: llms.txt ${w(kurz)} Woerter, llms-full.txt ${w(text)} Woerter aus ${gelesen} Seiten`);
  }

  if (probleme.length) {
    console.log('\nOffene Punkte:');
    for (const p of probleme) console.log('  - ' + p);
    process.exitCode = 1;
  } else {
    console.log('\nKeine offenen Punkte.');
  }
}

main().catch(err => { console.error(err); process.exitCode = 1; });
