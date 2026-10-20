#!/usr/bin/env python3
"""
Liest alle Farbwerte aus einer SVG-Datei (z. B. images/logo.svg) und schlägt
daraus die CSS-Variablen für css/farben.css vor.

Aufruf:
    python3 tools/farben-aus-logo.py images/logo.svg

Ausgabe:
    - Liste aller gefundenen Farben mit Häufigkeit und Kontrast zu Weiß
    - Fertiger :root-Block zum Einfügen in css/farben.css
Benötigt nur Python 3 (keine Zusatzpakete).
"""
import re
import sys
from collections import Counter

# Benannte SVG-Farben, die in Logos häufig vorkommen
BENANNT = {
    "black": "#000000", "white": "#ffffff", "red": "#ff0000",
    "green": "#008000", "blue": "#0000ff", "yellow": "#ffff00",
    "gray": "#808080", "grey": "#808080", "maroon": "#800000",
    "darkred": "#8b0000", "navy": "#000080", "olive": "#808000",
}


def normalisieren(wert):
    """Wandelt #abc, #aabbcc, rgb(…) und Farbnamen in #aabbcc um."""
    wert = wert.strip().lower()
    if wert in BENANNT:
        return BENANNT[wert]
    if re.fullmatch(r"#[0-9a-f]{3}", wert):
        return "#" + "".join(c * 2 for c in wert[1:])
    if re.fullmatch(r"#[0-9a-f]{6}", wert):
        return wert
    m = re.fullmatch(r"rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+).*\)", wert)
    if m:
        return "#" + "".join(f"{int(x):02x}" for x in m.groups())
    return None


def rgb(hexwert):
    return tuple(int(hexwert[i:i + 2], 16) for i in (1, 3, 5))


def luminanz(hexwert):
    def kanal(c):
        c /= 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (kanal(c) for c in rgb(hexwert))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def kontrast(a, b):
    la, lb = sorted((luminanz(a), luminanz(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def mischen(hexwert, ziel, anteil):
    """Mischt hexwert mit ziel (#ffffff = aufhellen, #000000 = abdunkeln)."""
    a, z = rgb(hexwert), rgb(ziel)
    return "#" + "".join(f"{round(x + (y - x) * anteil):02x}" for x, y in zip(a, z))


def ist_neutral(hexwert):
    r, g, b = rgb(hexwert)
    return max(r, g, b) - min(r, g, b) < 18  # Weiß, Schwarz, Grautöne


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    svg = open(sys.argv[1], encoding="utf-8", errors="replace").read()

    # fill="…", stroke="…", stop-color="…" sowie dieselben Angaben in style="…"/<style>
    roh = re.findall(r'(?:fill|stroke|stop-color|color)\s*[:=]\s*["\']?\s*([#\w(),.\s]+?)\s*["\';}\s>]', svg)
    farben = Counter(f for f in (normalisieren(w) for w in roh) if f)

    if not farben:
        sys.exit("Keine Farbwerte gefunden. Ist es eine Vektor-SVG (kein eingebettetes Bild)?")

    print("Gefundene Farben (Häufigkeit · Kontrast zu Weiß):")
    for farbe, anzahl in farben.most_common():
        art = "neutral" if ist_neutral(farbe) else "Markenfarbe"
        print(f"  {farbe}  {anzahl:3}×  {kontrast(farbe, '#ffffff'):4.1f}:1  {art}")

    marke = [f for f, _ in farben.most_common() if not ist_neutral(f)]
    if not marke:
        print("\nDas Logo enthält nur neutrale Farben – Primärfarbe bitte manuell wählen.")
        return
    primaer = marke[0]
    akzent = marke[1] if len(marke) > 1 else mischen(primaer, "#000000", 0.35)

    print("\nVorschlag für css/farben.css:")
    print(f"  --c-primaer:        {primaer};")
    print(f"  --c-primaer-dunkel: {mischen(primaer, '#000000', 0.22)};")
    print(f"  --c-primaer-hell:   {mischen(primaer, '#ffffff', 0.88)};")
    print(f"  --c-akzent:         {akzent};")
    print(f"  --c-akzent-hell:    {mischen(akzent, '#ffffff', 0.85)};")

    if kontrast(primaer, "#ffffff") < 4.5:
        print("\nHinweis: Primärfarbe hat < 4.5:1 Kontrast zu Weiß. Für Text/Buttons "
              "lieber --c-primaer-dunkel verwenden oder die Rollen tauschen.")


if __name__ == "__main__":
    main()
