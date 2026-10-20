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

   Vorlage zum Kopieren:
     {
       titel: "Betriebsurlaub",
       text:  "Vom 10. bis 20. August bleibt unser Laden geschlossen. Ab dem 21. August sind wir wieder für Sie da.",
       art:   "urlaub",
       von:   "2026-07-25",
       bis:   "2026-08-20"
     },
   ========================================================================== */

window.AKTUELLES = [
  {
    titel: "Bequem vorbestellen",
    text:  "Bestellen Sie Ihre Wunschprodukte vor – telefonisch oder über unser Formular – und holen Sie sie donnerstags, freitags oder samstags ab.",
    art:   "info"
  }
];
