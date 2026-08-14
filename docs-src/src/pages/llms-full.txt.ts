/**
 * `/docs/llms-full.txt` — der Volltext der Dokumentation für Sprachmodelle.
 *
 * Enthalten ist die deutsche Fassung. Sie ist die Quelle, die Fassungen
 * en/fr/it/es sind Übersetzungen davon und stehen als HTML unter
 * `/docs/<sprache>/…`; sie hier ein zweites Mal mitzuliefern würde die Datei
 * verfünffachen, ohne inhaltlich etwas hinzuzufügen.
 *
 * Die Reihenfolge ist die der Seitenleiste, damit der Text so gelesen werden
 * kann, wie die Dokumentation aufgebaut ist.
 *
 * ## Wie aus MDX Text wird
 *
 * Die Seiten sind MDX, enthalten also neben Markdown auch Import-Zeilen und
 * Komponenten. Für eine Textfassung gilt:
 *
 * 1. Import-Zeilen fallen weg. Sie sind reine Technik und sagen über den
 *    Inhalt nichts aus.
 * 2. Welche Namen überhaupt Komponenten sind, wird aus genau diesen
 *    Import-Zeilen gelesen und nicht hier fest hinterlegt. Sonst würde eine
 *    neue Komponente stillschweigend als Text durchrutschen — und umgekehrt
 *    würde ein Platzhalter wie `<IHRE-DOMAIN>` in einem Befehl fälschlich als
 *    Komponente gelöscht.
 * 3. Selbstschliessende Komponenten fallen ganz weg. Das sind die Karten
 *    (`<LinkCard />`), deren Titel und Beschreibung die Zielseite weiter unten
 *    ohnehin selbst mitbringt, und die Diagramme, die Grafik sind.
 * 4. Bei paarigen Komponenten (`<Aside>`, `<Steps>`, `<CardGrid>`, `<Card>`)
 *    fallen nur die Tags weg, der Text dazwischen bleibt. Trägt das öffnende
 *    Tag einen Titel, wird dieser als fette Zeile gerettet; sonst verlöre ein
 *    Hinweiskasten seine Überschrift.
 * 5. Code-Blöcke werden nicht angetastet. Was dort zwischen spitzen Klammern
 *    steht, ist ein Platzhalter und keine Komponente.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { BASIS, nachKapitel, urlVon } from '../lib/doku';

/** Namen der in einer Datei importierten Komponenten. */
function importierteNamen(quelle: string): string[] {
  const namen: string[] = [];
  for (const zeile of quelle.split('\n')) {
    const geschweift = /^import\s*\{([^}]*)\}\s*from/.exec(zeile);
    if (geschweift) {
      for (const teil of geschweift[1]!.split(',')) {
        const name = teil.trim().split(/\s+as\s+/).pop()?.trim();
        if (name) namen.push(name);
      }
      continue;
    }
    const einfach = /^import\s+([A-Za-z_$][\w$]*)\s+from/.exec(zeile);
    if (einfach) namen.push(einfach[1]!);
  }
  return namen.filter((n) => /^[A-Z]/.test(n));
}

/** Reguläre Sonderzeichen in einem Namen unschädlich machen. */
function maskiert(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Den gemeinsamen Einzug eines Blocks entfernen. Kinder einer Komponente sind
 * im MDX eingerückt; bleibt der Einzug stehen, liest Markdown vier Leerzeichen
 * als Code-Block und die Prosa käme in der Textfassung als Code an.
 */
function ausgerueckt(text: string): string {
  const zeilen = text.split('\n');
  const einzuege = zeilen
    .filter((z) => z.trim() !== '')
    .map((z) => (/^[ \t]*/.exec(z)?.[0] ?? '').length);
  const kleinster = einzuege.length > 0 ? Math.min(...einzuege) : 0;
  return kleinster === 0 ? text : zeilen.map((z) => z.slice(kleinster)).join('\n');
}

/** MDX in Fliesstext überführen, siehe Erläuterung im Kopf dieser Datei. */
function alsText(quelle: string): string {
  const namen = importierteNamen(quelle);

  // Import-Zeilen entfernen.
  let text = quelle.replace(/^import\s+[^\n]*\n/gm, '');

  if (namen.length > 0) {
    // Der längste Name zuerst, sonst würde die Alternative `Card` schon in
    // `CardGrid` zuschlagen und das falsche Ende suchen. Die Vorschau danach
    // stellt zusätzlich sicher, dass der Name wirklich zu Ende ist.
    const auswahl = [...namen].sort((a, b) => b.length - a.length).map(maskiert).join('|');
    const name = `(?:${auswahl})(?![\\w-])`;
    // Attribute dürfen alles enthalten ausser spitzen Klammern; Werte in
    // Anführungszeichen dürfen auch die enthalten.
    const attribute = '(?:[^<>"]|"[^"]*")*';
    const selbstschliessend = new RegExp(`[ \\t]*<${name}${attribute}/>[ \\t]*\\n?`, 'g');
    const paarig = new RegExp(
      `[ \\t]*<(${auswahl})(?![\\w-])(${attribute})>([\\s\\S]*?)</\\1>[ \\t]*\\n?`,
      'g'
    );
    const uebrigeTags = new RegExp(`[ \\t]*</?${name}${attribute}/?>[ \\t]*\\n?`, 'g');

    // Abschnitte zwischen Code-Zäunen bleiben unverändert: was dort in spitzen
    // Klammern steht, ist ein Platzhalter und keine Komponente.
    const teile = text.split(/(^```[\s\S]*?^```)/gm);
    text = teile
      .map((teil) => {
        if (teil.startsWith('```')) return teil;
        let inhalt = teil.replace(selbstschliessend, '');
        // Paarige Komponenten von aussen nach innen auflösen, bis keine mehr
        // übrig ist. Jede Auflösung rückt ihren Inhalt eine Ebene aus.
        let vorher: string;
        do {
          vorher = inhalt;
          inhalt = inhalt.replace(paarig, (_treffer, _name, attrs: string, kinder: string) => {
            const titel = /title="([^"]*)"/.exec(attrs);
            const kopf = titel ? `**${titel[1]}**\n\n` : '';
            return `${kopf}${ausgerueckt(kinder).trim()}\n`;
          });
        } while (inhalt !== vorher);
        // Falls ein Tag ohne Partner dastand, fällt es hier weg.
        return inhalt.replace(uebrigeTags, '');
      })
      .join('');
  }

  // Höchstens eine Leerzeile am Stück, keine Leerzeichen am Zeilenende.
  return text
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const GET: APIRoute = async () => {
  const seiten = await getCollection('docs');
  const startseite = seiten.find((s) => s.id === 'index');
  const abschnitte: string[] = [];

  abschnitte.push(
    [
      '# EU Cowork AI — Dokumentation, Volltext',
      '',
      '> Der vollständige Text der Dokumentation von EU Cowork AI: Überblick, Installation und',
      '> Betrieb auf dem eigenen Server, Funktionen aus Nutzersicht, Administration und der',
      '> Anschluss eigener Systeme über das Model Context Protocol.',
      '',
      'Diese Datei enthält die deutsche Fassung; sie ist die Quelle. Dieselben Seiten gibt es',
      'übersetzt auf Englisch, Französisch, Italienisch und Spanisch als HTML unter',
      `${BASIS}/en/…, ${BASIS}/fr/…, ${BASIS}/it/… und ${BASIS}/es/….`,
      `Eine reine Übersicht aller Seiten aller Sprachen steht unter ${BASIS}/llms.txt,`,
      'die Marketing-Website ist unter https://eucowork.ai/llms.txt beschrieben.',
      '',
      'EU Cowork AI ist ein Angebot der Herr Informatik GmbH, Klosterzelgstrasse 1a,',
      '5210 Windisch, Schweiz.',
      '',
      'Die Reihenfolge folgt der Gliederung der Dokumentation.',
    ].join('\n')
  );

  if (startseite) {
    abschnitte.push(
      [
        `# ${startseite.data.title}`,
        `Quelle: ${urlVon(startseite)}`,
        '',
        startseite.data.description ?? '',
        '',
        alsText(startseite.body ?? ''),
      ]
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
    );
  }

  for (const kapitel of nachKapitel(seiten, undefined)) {
    abschnitte.push(`# Kapitel: ${kapitel.label}`);
    for (const seite of kapitel.seiten) {
      abschnitte.push(
        [
          `# ${seite.data.title}`,
          `Quelle: ${urlVon(seite)}`,
          `Kapitel: ${kapitel.label}`,
          '',
          seite.data.description ?? '',
          '',
          alsText(seite.body ?? ''),
        ]
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
      );
    }
  }

  return new Response(abschnitte.join('\n\n---\n\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
