# Website Landmetzgerei Nonnenmacher

Statische Website (HTML/CSS/JavaScript), ohne Framework und ohne Build-Schritt.
Den kompletten Ordner einfach per FTP zum Webhoster hochladen, oder bei Netlify bzw. GitHub Pages veröffentlichen.

## Ordnerstruktur

```
landmetzgerei-nonnenmacher/
├── index.html            Startseite (One-Pager)
├── impressum.html        Vorlage, Platzhalter <mark>…</mark> ausfüllen
├── datenschutz.html      Vorlage, Platzhalter ausfüllen
├── daten/                ← HIER pflegen Sie die Inhalte
│   ├── einstellungen.js  Öffnungszeiten, geschlossene Tage, Kontakt, Formular
│   ├── aktuelles.js      Hinweise (Urlaub, Feiertage, Bestellstopps)
│   └── bewertungen.js    Kundenstimmen (echte Google-Bewertungen)
├── css/
│   ├── farben.css        Farbpalette (aus dem Logo)
│   └── style.css         Gestaltung
├── js/main.js            Seitenlogik (muss normalerweise nicht geändert werden)
├── fonts/                Schriften Bitter + Source Sans 3, lokal (DSGVO), Lizenz OFL
├── images/
│   ├── logo.svg          ⚠ Platzhalter, durch das Original-Logo ersetzen
│   └── fotos/            ⚠ Platzhalter-Fotos (WebP)
├── tools/farben-aus-logo.py   liest die Farben aus dem Logo aus
├── .htaccess             Komprimierung + Cache (Apache-Hosting)
├── robots.txt, sitemap.xml
```

Lokal ansehen: `index.html` im Browser per Doppelklick öffnen. Alles funktioniert, nur die Formular-Dienste nicht.
Besser ist ein kleiner Testserver: `python3 -m http.server` im Ordner starten, dann http://localhost:8000 öffnen.

---

## Öffnungszeiten ändern

1. `daten/einstellungen.js` öffnen (mit einem einfachen Texteditor, nicht mit Word).
2. Unter `oeffnungszeiten` die Zeilen anpassen. `tag`: 1 = Montag … 6 = Samstag, 0 = Sonntag.
   ```js
   { tag: 4, von: "08:00", bis: "18:00" },  // Donnerstag
   ```
   Einen weiteren Tag hinzufügen = eine Zeile kopieren. Einen Tag entfernen = die Zeile löschen.
   Nach jeder Zeile steht ein Komma, nur nach der letzten nicht.
3. **Auch für Google anpassen:** In `index.html` den Block `"openingHoursSpecification"` (im oberen Teil) entsprechend ändern.
   Ohne JavaScript und für Suchmaschinen gibt es außerdem eine Tabelle in `index.html` (`id="zeiten-tabelle"`), die Sie bei Gelegenheit mit anpassen.

Tabelle, „Heute geöffnet / geschlossen“-Anzeige, Footer und die wählbaren Abholtage im Formular aktualisieren sich danach automatisch.

### Einzelne Tage schließen (Urlaub, Feiertag)

In `daten/einstellungen.js` bei `geschlosseneTage` eintragen:
```js
geschlosseneTage: ["2026-12-24", "2026-12-26", "2026-12-31"],
```
Diese Tage werden als geschlossen angezeigt und sind im Vorbestellformular nicht wählbar.

## Hinweise in „Aktuelles“ ändern

`daten/aktuelles.js` öffnen. Jeder Hinweis sieht so aus:
```js
{
  titel: "Weihnachtsbestellungen",
  text:  "Bitte bestellen Sie Ihre Festtagsbraten bis spätestens 18. Dezember vor.",
  art:   "wichtig",          // "info", "wichtig" (rot) oder "urlaub" (grau)
  von:   "2026-11-20",       // optional: ab wann anzeigen
  bis:   "2026-12-18"        // optional: danach automatisch ausblenden
},
```
Mit `von`/`bis` verschwinden veraltete Hinweise von selbst, so bleibt kein Weihnachts-Bestellstopp bis in den Sommer stehen.
Ist die Liste leer (`window.AKTUELLES = [ ];`), wird die Box ausgeblendet.

## Vorbestellformular: Versand einstellen

In `daten/einstellungen.js` → `vorbestellung`:

| `versandart`  | Was passiert | Was Sie tun müssen |
|---------------|--------------|--------------------|
| `"mailto"` (Standard) | Beim Absenden öffnet sich das E-Mail-Programm des Kunden mit fertig ausgefüllter Bestellung. | nichts |
| `"formspree"` | Bestellung kommt direkt als E-Mail bei Ihnen an. | Kostenlos bei https://formspree.io registrieren, Formular anlegen, die Adresse (`https://formspree.io/f/xxxx`) bei `endpoint` eintragen. |
| `"netlify"`   | Wie Formspree, wenn die Seite bei Netlify liegt. | In Netlify unter „Forms“ die E-Mail-Benachrichtigung einschalten. `endpoint` bleibt leer. |
| `"post"`      | Anderer Formular-Dienst (z. B. Getform, Web3Forms, eigenes PHP-Skript). | Dessen URL bei `endpoint` eintragen. |

Beispiel:
```js
versandart: "formspree",
endpoint:   "https://formspree.io/f/abcdwxyz",
```
Ist bei `formspree`/`post` kein Endpoint eingetragen, nutzt das Formular automatisch den mailto-Weg.
**Wichtig:** Den passenden Abschnitt in `datenschutz.html` behalten (Variante A/B/C) und die anderen löschen.

Weitere Einstellungen: `vorlaufTage` (wie viele Tage im Voraus bestellt werden muss) und `wochenImVoraus` (wie weit im Voraus ein Termin wählbar ist).

## Kundenstimmen eintragen

`daten/bewertungen.js`: Text, Name und Datum einer **echten** Google-Bewertung wörtlich übernehmen und `platzhalter: false` setzen.
Bei `googleLink` den Link zu Ihrem Google-Profil eintragen (Google Maps → Ihr Eintrag → „Teilen“ → „Link kopieren“).

## Logo und Farben

1. Das Original-Logo als `images/logo.svg` ablegen und den Platzhalter überschreiben. Den Dateinamen beibehalten.
2. Farben auslesen:
   ```
   python3 tools/farben-aus-logo.py images/logo.svg
   ```
3. Die vorgeschlagenen Werte in `css/farben.css` eintragen. Die Hauptfarbe zusätzlich in `index.html` bei `<meta name="theme-color">` eintragen.

## Fotos austauschen

- Die Dateien in `images/fotos/` durch echte Fotos **mit gleichem Dateinamen** ersetzen. Dann muss kein HTML angepasst werden.
- Format WebP, empfohlene Größen: Hero 1600×900 und 800×450 px, Sortiment 800×600 px, Über uns 900×1100 px.
- Umwandeln geht kostenlos im Browser mit https://squoosh.app (Format „WebP“, Qualität ca. 75).
- Danach in `index.html` die `alt`-Texte anpassen. Dort steht vorerst „Platzhalter: …“.

## Vor dem Livegang

- Endgültige Domain in `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` und `sitemap.xml` prüfen.
- Impressum und Datenschutz ausfüllen und rechtlich prüfen lassen.
- Alle Texte mit `[Platzhalter …]` ersetzen. Suche nach `Platzhalter` in `index.html` und `daten/`.
