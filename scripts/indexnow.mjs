/* =============================================================================
   Meldet alle Adressen der Website an IndexNow.

   Warum ueberhaupt: Die Google Search Console kennt keine Sammelanfrage. Dort
   geht "Indexierung beantragen" eine Adresse nach der anderen, mit einem
   Tageskontingent im niedrigen zweistelligen Bereich. IndexNow ist der Kanal,
   der das kann: eine Anfrage, bis zu 10'000 Adressen. Beteiligt sind unter
   anderem Bing, Yandex, Seznam und Naver; api.indexnow.org verteilt an alle.
   Google gehoert nicht dazu und wird es absehbar auch nicht.

   Fuer den eigentlichen Zweck ist das trotzdem die richtige Stelle: Bings
   Index speist Microsoft Copilot, und wer in Antwortmaschinen vorkommen will,
   kommt an Bing nicht vorbei.

   Wie der Schluessel funktioniert: IndexNow prueft die Berechtigung ueber eine
   Datei im Wurzelverzeichnis, deren Name der Schluessel ist und deren Inhalt
   derselbe Schluessel. Der Schluessel ist damit oeffentlich und ist kein
   Geheimnis; er belegt nur, dass wer meldet, auch auf dem Server schreiben
   darf. Deshalb liegt er im Repository und nicht in einer Umgebungsvariablen.

   Die Adressliste kommt aus den ausgelieferten Sitemaps, nicht aus dem
   Arbeitsverzeichnis. So wird nie etwas gemeldet, das noch gar nicht online
   ist -- eine Meldung auf eine 404 ist bei IndexNow ein Fehler, der die
   Glaubwuerdigkeit der ganzen Domain senkt.

   Aufruf: node scripts/indexnow.mjs           (meldet alles)
           node scripts/indexnow.mjs --probe   (zeigt nur, was gemeldet wuerde)
           node scripts/indexnow.mjs /preise /faq   (meldet einzelne Pfade)
   ============================================================================= */

import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HOST = 'eucowork.ai';
const ORIGIN = `https://${HOST}`;
const ENDPUNKT = 'https://api.indexnow.org/indexnow';
const SITEMAPS = [`${ORIGIN}/sitemap.xml`, `${ORIGIN}/docs/sitemap-index.xml`];
const GRENZE = 10000; // Hoechstzahl Adressen je Anfrage laut Spezifikation

/* Der Schluessel ist der Dateiname der einzigen 32-stelligen Hex-Datei im
   Wurzelverzeichnis. So bleibt er an genau einer Stelle gepflegt: benennt man
   die Datei um, zieht das Skript automatisch nach. */
async function schluessel() {
  const dateien = await readdir(ROOT);
  const treffer = dateien.filter(f => /^[0-9a-f]{32}\.txt$/.test(f));
  if (treffer.length === 0) {
    throw new Error('Keine Schluesseldatei im Wurzelverzeichnis gefunden (erwartet: <32 Hex>.txt)');
  }
  if (treffer.length > 1) {
    throw new Error(`Mehrere Schluesseldateien gefunden: ${treffer.join(', ')}`);
  }
  return treffer[0].replace(/\.txt$/, '');
}

async function hole(url) {
  const antwort = await fetch(url, { headers: { 'user-agent': 'eucowork-indexnow/1.0' } });
  if (!antwort.ok) throw new Error(`${url}: HTTP ${antwort.status}`);
  return antwort.text();
}

/* Sitemaps koennen Indexdateien sein, die auf weitere Sitemaps zeigen. Ein
   Sitemap-Index erkennt man am Wurzelelement <sitemapindex>. */
async function adressenAus(url, gesehen = new Set()) {
  if (gesehen.has(url)) return [];
  gesehen.add(url);
  const xml = await hole(url);
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
  if (/<sitemapindex[\s>]/.test(xml)) {
    const alles = [];
    for (const kind of locs) alles.push(...await adressenAus(kind, gesehen));
    return alles;
  }
  return locs;
}

/* Vor dem Melden pruefen, ob die Schluesseldatei wirklich ausgeliefert wird.
   Faellt dieser Schritt aus, weist IndexNow die ganze Meldung zurueck, und
   zwar mit 403 statt mit einer verwertbaren Meldung. */
async function schluesselPruefen(key) {
  const ort = `${ORIGIN}/${key}.txt`;
  const antwort = await fetch(ort);
  if (!antwort.ok) throw new Error(`Schluesseldatei nicht erreichbar: ${ort} liefert HTTP ${antwort.status}. Zuerst deployen.`);
  const inhalt = (await antwort.text()).trim();
  if (inhalt !== key) throw new Error(`Schluesseldatei ${ort} enthaelt "${inhalt.slice(0, 40)}", erwartet "${key}".`);
  return ort;
}

async function melden(key, ort, urls) {
  const rumpf = { host: HOST, key, keyLocation: ort, urlList: urls };
  const antwort = await fetch(ENDPUNKT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(rumpf)
  });
  const text = await antwort.text();
  return { status: antwort.status, text: text.trim() };
}

/* IndexNow antwortet mit nackten Statuscodes; die Bedeutung steht nur in der
   Dokumentation. Hier ausgeschrieben, damit ein Fehlschlag nicht als "422"
   im Terminal endet. */
const BEDEUTUNG = {
  200: 'angenommen',
  202: 'angenommen, Schluessel wird noch geprueft',
  400: 'fehlerhafte Anfrage',
  403: 'Schluessel ungueltig oder Schluesseldatei nicht erreichbar',
  422: 'Adressen gehoeren nicht zu diesem Host oder Schluessel passt nicht',
  429: 'zu viele Anfragen'
};

async function main() {
  const argumente = process.argv.slice(2);
  const trocken = argumente.includes('--probe');
  const pfade = argumente.filter(a => a.startsWith('/'));

  const key = await schluessel();

  let urls;
  if (pfade.length) {
    urls = pfade.map(p => ORIGIN + p);
    console.log(`${urls.length} Adressen aus der Befehlszeile.`);
  } else {
    urls = [];
    for (const sm of SITEMAPS) {
      const teil = await adressenAus(sm);
      console.log(`${sm}: ${teil.length} Adressen`);
      urls.push(...teil);
    }
    urls = [...new Set(urls)];
  }

  const fremd = urls.filter(u => !u.startsWith(ORIGIN + '/') && u !== ORIGIN + '/');
  if (fremd.length) {
    console.log(`\n${fremd.length} Adressen gehoeren nicht zu ${HOST} und werden weggelassen:`);
    for (const u of fremd.slice(0, 5)) console.log('  - ' + u);
    urls = urls.filter(u => !fremd.includes(u));
  }

  console.log(`\nSchluessel: ${key}`);
  console.log(`Zu melden:  ${urls.length} Adressen`);

  if (trocken) {
    console.log('\nProbelauf, nichts gemeldet. Die ersten zehn:');
    for (const u of urls.slice(0, 10)) console.log('  ' + u);
    return;
  }

  const ort = await schluesselPruefen(key);
  console.log(`Schluesseldatei geprueft: ${ort}`);

  for (let i = 0; i < urls.length; i += GRENZE) {
    const teil = urls.slice(i, i + GRENZE);
    const { status, text } = await melden(key, ort, teil);
    const wort = BEDEUTUNG[status] || 'unbekannter Status';
    console.log(`\n${teil.length} Adressen gemeldet -> HTTP ${status} (${wort})${text ? ': ' + text : ''}`);
    if (status >= 400) process.exitCode = 1;
  }
}

main().catch(err => {
  console.error('\nAbbruch: ' + err.message);
  process.exitCode = 1;
});
