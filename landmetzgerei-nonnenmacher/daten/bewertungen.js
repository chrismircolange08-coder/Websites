/* ==========================================================================
   KUNDENSTIMMEN – echte Google-Bewertungen
   --------------------------------------------------------------------------
   ⚠ Bitte nur echte Bewertungen eintragen (wörtlich, mit Vorname bzw. so,
   wie die Person auf Google erscheint). Keine erfundenen Stimmen!

   Felder je Eintrag: name, sterne (1–5), text, datum (z. B. "März 2026"),
   platzhalter (true = noch kein echter Inhalt)
   ========================================================================== */

window.BEWERTUNGEN = {
  // Link zu Ihrem Google-Profil (Bewertungen). Aus Google Maps:
  // „Teilen“ → „Link kopieren“ und hier einfügen.
  googleLink: "https://www.google.com/maps/search/?api=1&query=Landmetzgerei+Nonnenmacher+Bergatreute",

  // Gesamtwertung aus Google, z. B. sterne: 4.8, anzahl: 57.
  // Solange null eingetragen ist, wird nichts angezeigt.
  gesamt: { sterne: null, anzahl: null },

  // true  = Platzhalter-Kästen werden angezeigt (zum Ansehen während des Aufbaus)
  // false = Platzhalter werden ausgeblendet – VOR DEM LIVEGANG auf false setzen.
  //         Sind dann keine echten Stimmen eingetragen, erscheint nur der
  //         Link „Alle Bewertungen auf Google ansehen“.
  zeigePlatzhalter: true,

  eintraege: [
    { name: "[Name aus Google]", sterne: 5, text: "[Platzhalter: Hier den Text einer echten Google-Bewertung einfügen.]", datum: "[Monat Jahr]", platzhalter: true },
    { name: "[Name aus Google]", sterne: 5, text: "[Platzhalter: Hier den Text einer echten Google-Bewertung einfügen.]", datum: "[Monat Jahr]", platzhalter: true },
    { name: "[Name aus Google]", sterne: 5, text: "[Platzhalter: Hier den Text einer echten Google-Bewertung einfügen.]", datum: "[Monat Jahr]", platzhalter: true }
  ]
};
