#!/usr/bin/env python3
# =============================================================================
# Schneidet aus den Schriftdateien unter fonts/ die Umrisse der Zeichen heraus,
# die die Vorschaubilder brauchen, und legt sie als JSON unter og/src/ ab.
#
# Warum dieser Umweg: Die Vorschaubilder entstehen aus einem SVG, das sharp
# (librsvg) zu PNG rastert. librsvg wertet @font-face NICHT aus -- weder mit
# woff2 noch mit ttf, weder als Datei noch als data:-URI. Ein <text> im SVG
# fiele also auf irgendeine Schrift der jeweiligen Maschine zurueck, und das
# Bild saehe auf jedem Rechner anders aus. Deshalb enthaelt das erzeugte SVG
# ueberhaupt keinen Text mehr, sondern nur noch <path>: die Schrift ist als
# Umriss eingebettet und kann gar nicht mehr ersetzt werden.
#
# Aufruf (nur noetig, wenn die Bildtexte ein Zeichen bekommen, das noch nicht
# im Vorrat steht, oder wenn die Schriftdateien getauscht werden):
#   python3 scripts/og-glyphs.py
# Danach neu rendern: node scripts/build-og.mjs
#
# Benoetigt fontTools mit brotli (pip install "fonttools[woff]").
# =============================================================================

import json
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Grosszuegiger Vorrat: alles, was die fuenf Sprachen auf der Karte brauchen,
# plus die uebliche westeuropaeische Akzentlage. Lieber ein paar Umrisse zu
# viel im JSON als ein fehlendes Zeichen im fertigen Bild.
CHARSET = (
    " !\"#%&'()+,-./0123456789:;=?@"
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "ÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜ"
    "àáâãäåçèéêëìíîïñòóôõöùúûüß"
    "’‘“”„«»·•… €"
)

FONTS = [
    ("fonts/inter-400-latin.woff2", "og/src/glyphs-inter-400.json"),
    ("fonts/inter-600-latin.woff2", "og/src/glyphs-inter-600.json"),
    ("fonts/jetbrains-mono-400-latin.woff2", "og/src/glyphs-mono-400.json"),
]


def ntos(v):
    """Koordinate kurz schreiben, ohne sie zu veraendern.

    Der naheliegende Einzeiler repr(v).rstrip("0") ist eine Falle: TrueType
    liefert ganze Zahlen, und aus "20" wird damit "2". Deshalb erst runden,
    dann nur eine echte Nachkommastelle abschneiden.
    """
    v = round(float(v), 1)
    return str(int(v)) if v == int(v) else f"{v:.1f}"


def coverage(font):
    """Bester Unicode-cmap der Schrift als dict codepoint -> Glyphenname."""
    return font.getBestCmap()


def kern_pairs(font, names):
    """Kerning aus GPOS ziehen, beschraenkt auf die Glyphen des Vorrats.

    Ohne Kerning stehen in Inter Paare wie 'Ko', 'Ta' oder 'AV' sichtbar zu
    weit auseinander; in einer 76-px-Schlagzeile faellt das auf. Gelesen
    werden die PairPos-Lookups des Features 'kern', Format 1 (einzelne Paare)
    und Format 2 (Klassenpaare). Nur die X-Vorschubkorrektur des ersten
    Glyphen wird uebernommen, mehr braucht eine Zeile ohne Schriftmischung
    nicht.
    """
    out = {}
    if "GPOS" not in font:
        return out
    gpos = font["GPOS"].table
    if not gpos or not gpos.FeatureList or not gpos.LookupList:
        return out

    wanted = set(names)
    lookup_indices = set()
    for rec in gpos.FeatureList.FeatureRecord:
        if rec.FeatureTag != "kern":
            continue
        lookup_indices.update(rec.Feature.LookupListIndex)

    def walk(lookup):
        if lookup.LookupType == 9:  # Extension
            for sub in lookup.SubTable:
                inner = type("L", (), {})()
                inner.LookupType = sub.ExtensionLookupType
                inner.SubTable = [sub.ExtSubTable]
                walk(inner)
            return
        if lookup.LookupType != 2:
            return
        for sub in lookup.SubTable:
            if sub.Format == 1:
                for first, ps in zip(sub.Coverage.glyphs, sub.PairSet):
                    if first not in wanted:
                        continue
                    for rec in ps.PairValueRecord:
                        second = rec.SecondGlyph
                        if second not in wanted:
                            continue
                        v = getattr(rec.Value1, "XAdvance", 0) or 0
                        if v:
                            out[(first, second)] = v
            elif sub.Format == 2:
                cov = set(sub.Coverage.glyphs)
                c1 = sub.ClassDef1.classDefs if sub.ClassDef1 else {}
                c2 = sub.ClassDef2.classDefs if sub.ClassDef2 else {}
                by_class1 = {}
                for g in cov & wanted:
                    by_class1.setdefault(c1.get(g, 0), []).append(g)
                by_class2 = {}
                for g in wanted:
                    by_class2.setdefault(c2.get(g, 0), []).append(g)
                for i, rec1 in enumerate(sub.Class1Record):
                    if i not in by_class1:
                        continue
                    for j, rec2 in enumerate(rec1.Class2Record):
                        v = getattr(rec2.Value1, "XAdvance", 0) or 0
                        if not v or j not in by_class2:
                            continue
                        for a in by_class1[i]:
                            for b in by_class2[j]:
                                out[(a, b)] = v

    for i in sorted(lookup_indices):
        walk(gpos.LookupList.Lookup[i])
    return out


def extract(src, dst):
    font = TTFont(os.path.join(ROOT, src))
    cmap = coverage(font)
    hmtx = font["hmtx"]
    glyph_set = font.getGlyphSet()
    upem = font["head"].unitsPerEm

    glyphs = {}
    used_names = {}
    missing = []
    for ch in CHARSET:
        cp = ord(ch)
        name = cmap.get(cp)
        if name is None:
            missing.append(hex(cp))
            continue
        pen = SVGPathPen(glyph_set, ntos=ntos)
        glyph_set[name].draw(pen)
        glyphs[ch] = {"a": hmtx[name][0], "d": pen.getCommands()}
        used_names[name] = ch

    kern = {}
    for (a, b), v in kern_pairs(font, used_names.keys()).items():
        kern[used_names[a] + used_names[b]] = v

    data = {
        "source": src,
        "unitsPerEm": upem,
        "glyphs": glyphs,
        "kern": kern,
    }
    out_path = os.path.join(ROOT, dst)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    size = os.path.getsize(out_path)
    print(f"{dst}: {len(glyphs)} Zeichen, {len(kern)} Kerning-Paare, {size // 1024} KB"
          + (f", fehlend: {', '.join(missing)}" if missing else ""))


if __name__ == "__main__":
    for src, dst in FONTS:
        extract(src, dst)
    sys.exit(0)
