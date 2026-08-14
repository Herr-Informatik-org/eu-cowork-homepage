/**
 * Gemeinsame Hilfsmittel für die beiden Textfassungen der Dokumentation
 * (`/docs/llms.txt` und `/docs/llms-full.txt`).
 *
 * Beide Dateien werden bei jedem Build aus der Inhalts-Collection erzeugt und
 * nicht von Hand gepflegt. Eine handgeschriebene Liste wäre nach der dritten
 * neuen Seite überholt, ohne dass es jemandem auffällt.
 */
import type { CollectionEntry } from 'astro:content';
// @ts-ignore Virtuelles Modul von Starlight. Es liefert dieselbe Konfiguration,
// die in `astro.config.mjs` steht, damit Kapitelnamen und Sprachbezeichnungen
// nicht an zwei Stellen gepflegt werden müssen.
import starlightConfig from 'virtual:starlight/user-config';

export type Seite = CollectionEntry<'docs'>;

/** Adresse, unter der die Dokumentation ausgeliefert wird, ohne Schrägstrich am Ende. */
export const BASIS = 'https://eucowork.ai/docs';

/**
 * Eine Sprachfassung der Dokumentation. `praefix` ist das Pfadsegment der
 * Sprache; die deutsche Fassung liegt ohne Segment direkt unter `/docs`.
 */
export interface Sprache {
  praefix: string | undefined;
  label: string;
  lang: string;
}

/**
 * Die fünf Sprachfassungen in der Reihenfolge, in der sie in `astro.config.mjs`
 * stehen. Deutsch ist dort die Wurzelsprache und steht deshalb zuerst.
 */
export const SPRACHEN: Sprache[] = Object.entries(
  starlightConfig.locales as Record<string, { label: string; lang: string }>
).map(([schluessel, wert]) => ({
  praefix: schluessel === 'root' ? undefined : schluessel,
  label: wert.label,
  lang: wert.lang,
}));

/**
 * Die Kapitel in der Reihenfolge der Seitenleiste, mit dem Verzeichnisnamen
 * und den Übersetzungen der Beschriftung.
 */
export const KAPITEL: { verzeichnis: string; label: string; uebersetzungen: Record<string, string> }[] =
  (starlightConfig.sidebar as any[])
    .map((gruppe) => ({
      verzeichnis: gruppe.items?.[0]?.autogenerate?.directory as string | undefined,
      label: gruppe.label as string,
      uebersetzungen: (gruppe.translations ?? {}) as Record<string, string>,
    }))
    .filter((k): k is { verzeichnis: string; label: string; uebersetzungen: Record<string, string> } =>
      Boolean(k.verzeichnis)
    );

/** Beschriftung eines Kapitels in der gewünschten Sprache. */
export function kapitelLabel(verzeichnis: string, praefix: string | undefined): string {
  const kapitel = KAPITEL.find((k) => k.verzeichnis === verzeichnis);
  if (!kapitel) return verzeichnis;
  return (praefix && kapitel.uebersetzungen[praefix]) || kapitel.label;
}

/**
 * Kennungen der Inhalts-Collection: die deutsche Startseite heisst `index`,
 * die übrigen Startseiten heissen wie ihr Sprachsegment (`en`, `fr`, `it`,
 * `es`), alle weiteren Seiten `[<sprache>/]<kapitel>/<name>`.
 */
export function istStartseite(seite: Seite): boolean {
  return seite.id === 'index' || SPRACHEN.some((s) => s.praefix === seite.id);
}

/** Sprachsegment einer Seite, `undefined` für die deutsche Fassung. */
export function praefixVon(seite: Seite): string | undefined {
  const erstes = seite.id.split('/')[0];
  return SPRACHEN.some((s) => s.praefix === erstes) ? erstes : undefined;
}

/** Verzeichnis des Kapitels, `undefined` auf den Startseiten. */
export function verzeichnisVon(seite: Seite): string | undefined {
  const teile = seite.id.split('/');
  const ohneSprache = praefixVon(seite) ? teile.slice(1) : teile;
  return ohneSprache.length > 1 ? ohneSprache[0] : undefined;
}

/** Kanonische Adresse einer Seite, gleich gebildet wie von Starlight. */
export function urlVon(seite: Seite): string {
  return seite.id === 'index' ? BASIS : `${BASIS}/${seite.id}`;
}

/** Reihenfolge innerhalb eines Kapitels: wie in der Seitenleiste. */
export function nachSeitenleiste(a: Seite, b: Seite): number {
  const ordnung = (s: Seite) => s.data.sidebar?.order ?? Number.MAX_SAFE_INTEGER;
  const abstand = ordnung(a) - ordnung(b);
  return abstand !== 0 ? abstand : a.data.title.localeCompare(b.data.title, 'de');
}

/** Alle Seiten einer Sprache, nach Kapitel gruppiert, in Seitenleisten-Reihenfolge. */
export function nachKapitel(
  seiten: Seite[],
  praefix: string | undefined
): { verzeichnis: string; label: string; seiten: Seite[] }[] {
  const derSprache = seiten.filter((s) => praefixVon(s) === praefix && !istStartseite(s));
  return KAPITEL.map((kapitel) => ({
    verzeichnis: kapitel.verzeichnis,
    label: kapitelLabel(kapitel.verzeichnis, praefix),
    seiten: derSprache.filter((s) => verzeichnisVon(s) === kapitel.verzeichnis).sort(nachSeitenleiste),
  })).filter((k) => k.seiten.length > 0);
}
