/* ==========================================================================
   EINSTELLUNGEN – hier ändern Sie Öffnungszeiten, Kontakt und Formular.
   --------------------------------------------------------------------------
   Regeln beim Bearbeiten:
     • Texte stehen immer in "Anführungszeichen".
     • Nach jedem Eintrag ein Komma – außer nach dem letzten in einer Liste.
     • Uhrzeiten im Format "08:00", Datumsangaben im Format "2026-12-24".
   ========================================================================== */

window.EINSTELLUNGEN = {

  /* --- Kontakt ---------------------------------------------------------- */
  kontakt: {
    telefonAnzeige: "(0 75 27) 15 40",
    telefonLink:    "+4975271540",          // ohne Leerzeichen, für tel:-Links
    faxAnzeige:     "(0 75 27) 91 48 96",
    email:          "service@landmetzgerei-nonnenmacher.de",
    adresse:        "Keltenstr. 5, 88368 Bergatreute",
    onlineshop:     "http://www.dosenwurst-nonnenmacher.com/"
  },

  /* --- Öffnungszeiten ---------------------------------------------------
     Tage: 1 = Montag, 2 = Dienstag, … 6 = Samstag, 0 = Sonntag.
     Nicht aufgeführte Tage gelten als geschlossen.
     WICHTIG: Bei Änderungen bitte auch den Block "openingHoursSpecification"
     in index.html anpassen (für Google). Siehe README.                     */
  oeffnungszeiten: [
    { tag: 4, von: "08:00", bis: "18:00" },  // Donnerstag
    { tag: 5, von: "08:00", bis: "18:00" },  // Freitag
    { tag: 6, von: "08:00", bis: "13:00" }   // Samstag
  ],

  /* --- Ausnahmen: Tage, an denen der Laden zu ist ------------------------
     (Urlaub, Feiertage). Diese Tage werden in der Öffnungszeiten-Anzeige
     als „geschlossen“ gezeigt und sind im Vorbestellformular nicht wählbar.
     Beispiel: geschlosseneTage: ["2026-12-24", "2026-12-26"],               */
  geschlosseneTage: [
  ],

  /* --- Vorbestellung ---------------------------------------------------- */
  vorbestellung: {
    // Wie viele Tage im Voraus muss mindestens bestellt werden?
    // 1 = frühestens Abholung morgen, 2 = frühestens übermorgen …
    vorlaufTage: 2,

    // Wie viele Wochen im Voraus kann ein Abholtermin gewählt werden?
    wochenImVoraus: 6,

    /* Versandart des Formulars:
         "mailto"    → öffnet das E-Mail-Programm des Kunden (kein Dienst nötig)
         "formspree" → Versand über formspree.io (endpoint unten eintragen)
         "netlify"   → Versand über Netlify Forms (nur bei Hosting auf Netlify)
         "post"      → beliebiger anderer Dienst, der Formulardaten per POST annimmt */
    versandart: "mailto",

    // Nur für "formspree" / "post": Adresse des Formular-Dienstes,
    // z. B. "https://formspree.io/f/abcdwxyz"
    endpoint: "",

    // Empfänger für "mailto" (und Anzeige im Formular)
    empfaenger: "service@landmetzgerei-nonnenmacher.de"
  }
};
