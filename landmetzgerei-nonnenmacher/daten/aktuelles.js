/* ==========================================================================
   AKTUELLES – Hinweise für die Box ganz oben auf der Startseite
   --------------------------------------------------------------------------
   Jeder Hinweis steht in geschweiften Klammern { … }. Felder:
     titel  – kurze Überschrift (Pflicht)
     text   – ein bis zwei Sätze (Pflicht)
     art    – "info" (normal), "wichtig" (rot hervorgehoben) oder "urlaub"
     von    – (optional) ab diesem Tag anzeigen, Format "JJJJ-MM-TT"
     bis    – (optional) nach diesem Tag automatisch ausblenden
   Ist die Liste leer [ ], wird die ganze Box ausgeblendet.

   Vorlage zum Kopieren (Hinweis von der bisherigen Website):
     {
       titel: "Geänderte Öffnungszeiten",
       text:  "Unser Sommerurlaub ist vom 10. August bis einschließlich 2. September 2026. Ab Do., den 3. September sind wir wieder für Sie da!",
       art:   "urlaub",
       von:   "2026-07-20",
       bis:   "2026-09-02"
     },
   Tipp: Die Urlaubstage zusätzlich in daten/einstellungen.js bei
   geschlosseneTage eintragen, damit sie nicht vorbestellt werden können.
   ========================================================================== */

// Derzeit keine Hinweise → die Box ist ausgeblendet.
// Einfach die Vorlage von oben zwischen die eckigen Klammern kopieren.
window.AKTUELLES = [
];
