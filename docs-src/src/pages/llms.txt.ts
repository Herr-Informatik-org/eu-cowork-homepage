/**
 * `/docs/llms.txt` — der Wegweiser durch die Dokumentation für Sprachmodelle.
 *
 * Wegen `base: '/docs'` landet diese Datei im Ausgabeverzeichnis als
 * `docs/llms.txt` und wird unter `https://eucowork.ai/docs/llms.txt`
 * ausgeliefert. Sie ergänzt die `llms.txt` im Wurzelverzeichnis, die die
 * Marketing-Website beschreibt.
 *
 * Der Aufbau folgt der llms.txt-Konvention: eine Überschrift erster Ordnung,
 * ein Blockzitat mit einem Satz zum Inhalt, danach Abschnitte mit Linklisten.
 * Gruppiert wird zuerst nach Sprache, dann nach Kapitel. Die deutsche Fassung
 * steht zuerst, weil sie die Quelle ist und die übrigen Übersetzungen davon.
 *
 * Die Liste entsteht aus der Inhalts-Collection. Neue Seiten stehen damit ohne
 * weiteres Zutun darin, gelöschte verschwinden.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { BASIS, SPRACHEN, nachKapitel, urlVon } from '../lib/doku';

export const GET: APIRoute = async () => {
  const seiten = await getCollection('docs');
  const zeilen: string[] = [];

  zeilen.push('# EU Cowork AI — Dokumentation');
  zeilen.push('');
  zeilen.push(
    '> Dokumentation von EU Cowork AI: Überblick, Installation und Betrieb auf dem eigenen Server, Funktionen aus Nutzersicht, Administration sowie der Anschluss eigener Systeme über das Model Context Protocol.'
  );
  zeilen.push('');
  zeilen.push(
    'EU Cowork AI ist eine quelloffene KI-Arbeitsplattform für Unternehmen, ein Angebot der'
  );
  zeilen.push(
    'Herr Informatik GmbH, Windisch (CH). Die Dokumentation liegt in fünf Sprachen vor; die'
  );
  zeilen.push(
    'deutsche Fassung ist die Quelle, die übrigen sind Übersetzungen davon. Den Volltext der'
  );
  zeilen.push(`deutschen Fassung gibt es unter ${BASIS}/llms-full.txt.`);
  zeilen.push('Die Website selbst ist unter https://eucowork.ai/llms.txt beschrieben.');

  for (const sprache of SPRACHEN) {
    const startseite = seiten.find((s) => s.id === (sprache.praefix ?? 'index'));
    const wurzel = sprache.praefix ? `${BASIS}/${sprache.praefix}` : BASIS;

    zeilen.push('');
    zeilen.push(`## ${sprache.label} (${sprache.lang})`);
    zeilen.push('');
    if (startseite) {
      zeilen.push(`- [${startseite.data.title}](${wurzel}): ${startseite.data.description ?? ''}`.trimEnd());
    }

    for (const kapitel of nachKapitel(seiten, sprache.praefix)) {
      zeilen.push('');
      zeilen.push(`### ${kapitel.label}`);
      zeilen.push('');
      for (const seite of kapitel.seiten) {
        const beschreibung = seite.data.description ? `: ${seite.data.description}` : '';
        zeilen.push(`- [${seite.data.title}](${urlVon(seite)})${beschreibung}`);
      }
    }
  }

  zeilen.push('');

  return new Response(zeilen.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
