/* ==========================================================================
   Landmetzgerei Nonnenmacher – Seitenlogik
   --------------------------------------------------------------------------
   Inhalte kommen aus daten/*.js – hier muss normalerweise nichts geändert
   werden. Aufbau:
     1. Hilfsfunktionen (Datum/Zeit in deutscher Zeitzone)
     2. Mobiles Menü
     3. Aktuelles-Box
     4. Öffnungszeiten-Tabelle + „heute geöffnet/geschlossen“
     5. Kundenstimmen
     6. Vorbestellformular (Abholtage, Mengenzeilen, Versand)
     7. Google Maps (2-Klick-Lösung)
     8. Aktionsleiste fürs Handy
   ========================================================================== */
(function () {
  "use strict";

  var E = window.EINSTELLUNGEN || {};
  var TAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  var TAGE_KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  var MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli",
                "August", "September", "Oktober", "November", "Dezember"];

  /* ---------- 1. Hilfsfunktionen ---------------------------------------- */

  // Aktuelles Datum + Uhrzeit in Deutschland, unabhängig von der Zeitzone des Besuchers
  function jetztInDeutschland() {
    var teile = {};
    new Intl.DateTimeFormat("de-DE", {
      timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date()).forEach(function (t) { teile[t.type] = t.value; });
    var datum = new Date(Date.UTC(+teile.year, +teile.month - 1, +teile.day));
    return { datum: datum, minuten: +teile.hour * 60 + +teile.minute };
  }

  // Date (UTC-Mitternacht) → "2026-12-24"
  function isoDatum(d) { return d.toISOString().slice(0, 10); }

  function plusTage(d, n) { var x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; }

  function zuMinuten(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }

  // "08:00" → "8:00", "18:30" → "18:30"
  function uhrzeit(hhmm) { return hhmm.replace(/^0/, ""); }

  // "08:00" → "8", "18:30" → "18:30"
  function uhrzeitKurz(hhmm) { return uhrzeit(hhmm).replace(/:00$/, ""); }

  function zeitenFuerTag(wochentag) {
    return (E.oeffnungszeiten || []).filter(function (z) { return z.tag === wochentag; });
  }

  function istGeschlossenerTag(d) {
    return (E.geschlosseneTage || []).indexOf(isoDatum(d)) !== -1;
  }

  function el(tag, klasse, text) {
    var e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- 2. Mobiles Menü ------------------------------------------- */

  var menueKnopf = document.getElementById("menue-knopf");
  var nav = document.getElementById("nav");
  if (menueKnopf && nav) {
    var menueSetzen = function (offen) {
      menueKnopf.setAttribute("aria-expanded", String(offen));
      nav.classList.toggle("nav--offen", offen);
    };
    menueKnopf.addEventListener("click", function () {
      menueSetzen(menueKnopf.getAttribute("aria-expanded") !== "true");
    });
    // Nach Klick auf einen Menüpunkt wieder schließen
    nav.addEventListener("click", function (ev) { if (ev.target.closest("a")) menueSetzen(false); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") menueSetzen(false); });
  }

  // Schatten am Header, sobald gescrollt wird
  var kopf = document.getElementById("kopf");
  if (kopf) {
    var schatten = function () { kopf.classList.toggle("kopf--gescrollt", window.scrollY > 8); };
    window.addEventListener("scroll", schatten, { passive: true });
    schatten();
  }

  /* ---------- 3. Aktuelles ---------------------------------------------- */

  (function aktuelles() {
    var liste = document.getElementById("aktuelles-liste");
    var sektion = document.getElementById("aktuelles");
    if (!liste || !sektion) return;
    var heute = isoDatum(jetztInDeutschland().datum);

    var sichtbar = (window.AKTUELLES || []).filter(function (h) {
      return h && h.titel && (!h.von || h.von <= heute) && (!h.bis || h.bis >= heute);
    });

    if (!sichtbar.length) { sektion.hidden = true; return; }

    sichtbar.forEach(function (h) {
      var li = el("li", "hinweis hinweis--" + (h.art || "info"));
      li.appendChild(el("h3", "hinweis__titel", h.titel));
      li.appendChild(el("p", "hinweis__text", h.text || ""));
      liste.appendChild(li);
    });
  })();

  /* ---------- 4. Öffnungszeiten ----------------------------------------- */

  (function oeffnungszeiten() {
    var jetzt = jetztInDeutschland();
    var heuteTag = jetzt.datum.getUTCDay();
    var heuteZu = istGeschlossenerTag(jetzt.datum);

    // Tabelle Montag → Sonntag
    var tbody = document.querySelector("#zeiten-tabelle tbody");
    if (tbody) {
      tbody.textContent = "";
      [1, 2, 3, 4, 5, 6, 0].forEach(function (tag) {
        var zeiten = zeitenFuerTag(tag);
        var tr = el("tr");
        var th = el("th", null, TAGE[tag]);
        th.scope = "row";
        var td = el("td", null, zeiten.length
          ? zeiten.map(function (z) { return uhrzeit(z.von) + " – " + uhrzeit(z.bis) + " Uhr"; }).join(", ")
          : "geschlossen");
        if (!zeiten.length) tr.className = "zu";
        if (tag === heuteTag) {
          tr.classList.add("heute");
          tr.setAttribute("aria-current", "date");
          th.appendChild(el("span", "heute-marke", "heute"));
          if (heuteZu && zeiten.length) td.textContent = "heute ausnahmsweise geschlossen";
        }
        tr.appendChild(th);
        tr.appendChild(td);
        tbody.appendChild(tr);
      });
    }

    // Kurzfassung, z. B. "Do & Fr 8–18 Uhr / Sa 8–13 Uhr"
    // data-zeiten-kurz="zeile" → in einer Zeile (Hero), sonst mit Umbruch (Footer)
    if (E.oeffnungszeiten) {
      var gruppen = [];
      E.oeffnungszeiten.forEach(function (z) {
        var text = uhrzeitKurz(z.von) + "–" + uhrzeitKurz(z.bis) + " Uhr";
        var g = gruppen.filter(function (x) { return x.text === text; })[0];
        if (g) g.tage.push(TAGE_KURZ[z.tag]); else gruppen.push({ text: text, tage: [TAGE_KURZ[z.tag]] });
      });
      document.querySelectorAll("[data-zeiten-kurz]").forEach(function (kurz) {
        var eineZeile = kurz.getAttribute("data-zeiten-kurz") === "zeile";
        kurz.textContent = "";
        gruppen.forEach(function (g, i) {
          if (i) kurz.appendChild(eineZeile ? document.createTextNode(" · ") : document.createElement("br"));
          kurz.appendChild(document.createTextNode(g.tage.join(" & ") + " " + g.text));
        });
      });
    }

    // Status-Text „Jetzt geöffnet …“ / „Geschlossen – nächste Öffnung …“
    var status = statusText(jetzt, heuteZu);
    document.querySelectorAll("[data-heute-status]").forEach(function (p) {
      p.textContent = status.text;
      p.classList.add(status.offen ? "ist-offen" : "ist-zu");
    });

    var jahr = document.querySelector("[data-jahr]");
    if (jahr) jahr.textContent = jetzt.datum.getUTCFullYear();
  })();

  function statusText(jetzt, heuteZu) {
    var heute = zeitenFuerTag(jetzt.datum.getUTCDay());
    if (!heuteZu) {
      for (var i = 0; i < heute.length; i++) {
        var von = zuMinuten(heute[i].von), bis = zuMinuten(heute[i].bis);
        if (jetzt.minuten >= von && jetzt.minuten < bis) {
          return { offen: true, text: "Jetzt geöffnet – heute bis " + uhrzeit(heute[i].bis) + " Uhr" };
        }
        if (jetzt.minuten < von) {
          return { offen: false, text: "Heute geöffnet ab " + uhrzeit(heute[i].von) + " Uhr" };
        }
      }
    }
    // Nächsten Öffnungstag suchen (max. 60 Tage, falls lange Betriebsferien)
    for (var n = 1; n <= 60; n++) {
      var d = plusTage(jetzt.datum, n);
      var z = zeitenFuerTag(d.getUTCDay());
      if (z.length && !istGeschlossenerTag(d)) {
        var wann = n === 1 ? "morgen" : TAGE[d.getUTCDay()] + ", " + d.getUTCDate() + ". " + MONATE[d.getUTCMonth()];
        return { offen: false, text: "Heute geschlossen – wieder geöffnet " + wann + " ab " + uhrzeit(z[0].von) + " Uhr" };
      }
    }
    return { offen: false, text: "Derzeit geschlossen" };
  }

  /* ---------- 5. Kundenstimmen ------------------------------------------ */

  (function stimmen() {
    var B = window.BEWERTUNGEN || {};
    var liste = document.getElementById("stimmen-liste");
    var link = document.getElementById("google-bewertungen");
    if (link && B.googleLink) link.href = B.googleLink;
    if (!liste) return;

    // Gesamtwertung nur zeigen, wenn echte Zahlen eingetragen sind
    var gesamt = document.getElementById("stimmen-gesamt");
    if (gesamt && B.gesamt && B.gesamt.sterne && B.gesamt.anzahl) {
      gesamt.textContent = "★ " + String(B.gesamt.sterne).replace(".", ",") + " von 5 · " +
        B.gesamt.anzahl + " Bewertungen auf Google";
      gesamt.hidden = false;
    }

    var eintraege = (B.eintraege || []).filter(function (b) { return !b.platzhalter || B.zeigePlatzhalter; });
    // Keine echten Stimmen? Dann nur den Link zu Google zeigen statt leerer Kästen.
    if (!eintraege.length) liste.hidden = true;

    eintraege.forEach(function (b) {
      var li = el("li", "stimme" + (b.platzhalter ? " stimme--platzhalter" : ""));
      var sterne = Math.max(0, Math.min(5, b.sterne || 0));
      var s = el("p", "stimme__sterne", "★★★★★".slice(0, sterne) + "☆☆☆☆☆".slice(0, 5 - sterne));
      s.setAttribute("aria-label", sterne + " von 5 Sternen");
      li.appendChild(s);
      var zitat = el("blockquote", "stimme__text");
      zitat.appendChild(el("p", null, b.text));
      li.appendChild(zitat);
      li.appendChild(el("p", "stimme__name", b.name + (b.datum ? " · " + b.datum : "") + " · Google"));
      liste.appendChild(li);
    });
  })();

  /* ---------- 6. Vorbestellformular ------------------------------------- */

  (function formular() {
    var form = document.getElementById("bestellformular");
    if (!form) return;
    var V = E.vorbestellung || {};
    var meldung = document.getElementById("formular-meldung");

    // 6a. Abholtage: nur Öffnungstage, ohne geschlossene Tage
    var auswahl = document.getElementById("f-datum");
    var start = jetztInDeutschland().datum;
    var bisTag = (V.wochenImVoraus || 6) * 7;
    for (var n = V.vorlaufTage == null ? 1 : V.vorlaufTage; n <= bisTag; n++) {
      var d = plusTage(start, n);
      var z = zeitenFuerTag(d.getUTCDay());
      if (!z.length || istGeschlossenerTag(d)) continue;
      var text = TAGE[d.getUTCDay()] + ", " + d.getUTCDate() + ". " + MONATE[d.getUTCMonth()] + " " +
                 d.getUTCFullYear() + " (" + uhrzeit(z[0].von) + "–" + uhrzeit(z[z.length - 1].bis) + " Uhr)";
      var opt = el("option", null, text);
      opt.value = text;
      auswahl.appendChild(opt);
    }

    // Hinweis auf die Vorlaufzeit, z. B. „ – bitte mind. 2 Tage vorher bestellen“
    var vorlauf = document.querySelector("[data-vorlauf]");
    if (vorlauf && V.vorlaufTage > 1) vorlauf.textContent = " – bitte mindestens " + V.vorlaufTage + " Tage vorher bestellen";

    // Klick auf „… vorbestellen“ im Sortiment trägt die Kategorie schon ein (weniger Tipparbeit)
    var wunsch = document.getElementById("f-wunsch");
    document.querySelectorAll("[data-vorbestellen]").forEach(function (link) {
      link.addEventListener("click", function () {
        var eintrag = link.getAttribute("data-vorbestellen") + ": ";
        if (wunsch.value.indexOf(eintrag) === -1) {
          wunsch.value = (wunsch.value ? wunsch.value.replace(/\s*$/, "") + "\n" : "") + eintrag;
        }
        // Fokus erst nach dem Scrollen setzen, damit die Tastatur am Handy nicht springt
        setTimeout(function () { wunsch.focus({ preventScroll: true }); }, 500);
      });
    });

    // 6b. Optionale Mengenzeilen
    var zeilen = document.getElementById("mengen-zeilen");
    var zaehler = 0;
    function neueZeile() {
      zaehler++;
      var reihe = el("div", "mengen__zeile");
      reihe.innerHTML =
        '<label class="sr-only" for="p' + zaehler + '">Produkt ' + zaehler + '</label>' +
        '<input id="p' + zaehler + '" name="produkt_' + zaehler + '" type="text" placeholder="z. B. Rouladen">' +
        '<label class="sr-only" for="m' + zaehler + '">Menge ' + zaehler + '</label>' +
        '<input id="m' + zaehler + '" name="menge_' + zaehler + '" type="number" min="0" step="any" inputmode="decimal">' +
        '<label class="sr-only" for="e' + zaehler + '">Einheit ' + zaehler + '</label>' +
        '<select id="e' + zaehler + '" name="einheit_' + zaehler + '">' +
          '<option>kg</option><option>g</option><option>Stück</option><option>Paar</option><option>Scheiben</option><option>Dosen</option>' +
        '</select>';
      zeilen.appendChild(reihe);
    }
    for (var i = 0; i < 3; i++) neueZeile();
    document.getElementById("zeile-hinzu").addEventListener("click", function () {
      neueZeile();
      zeilen.lastChild.querySelector("input").focus();
    });

    // 6c. Prüfen + Absenden
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (form.elements.firma && form.elements.firma.value) return; // Spam-Bot
      if (!pruefen()) return;

      var versandart = V.versandart || "mailto";
      var knopf = form.querySelector('button[type="submit"]');

      if (versandart === "mailto" || (versandart !== "netlify" && !V.endpoint)) {
        window.location.href = mailtoLink();
        zeigeMeldung("ok", "Ihr E-Mail-Programm öffnet sich mit der fertigen Bestellung. Bitte dort noch auf „Senden“ klicken. " +
          "Klappt das nicht? Rufen Sie uns an: " + (E.kontakt ? E.kontakt.telefonAnzeige : ""));
        return;
      }

      knopf.disabled = true;
      var daten = new FormData(form);
      var anfrage = versandart === "netlify"
        ? fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                       body: new URLSearchParams(daten).toString() })
        : fetch(V.endpoint, { method: "POST", body: daten, headers: { "Accept": "application/json" } });

      anfrage.then(function (antwort) {
        if (!antwort.ok) throw new Error(antwort.status);
        form.reset();
        zeigeMeldung("ok", "Vielen Dank! Ihre Vorbestellung ist bei uns eingegangen. Wir bestätigen sie Ihnen telefonisch oder per E-Mail.");
      }).catch(function () {
        zeigeMeldung("fehler", "Das Senden hat leider nicht geklappt. Bitte versuchen Sie es erneut oder rufen Sie uns an: " +
          (E.kontakt ? E.kontakt.telefonAnzeige : ""));
      }).then(function () { knopf.disabled = false; });
    });

    function pruefen() {
      var erstesFehlerfeld = null;
      form.querySelectorAll("[required]").forEach(function (f) {
        var ok = f.type === "checkbox" ? f.checked : f.value.trim() !== "" && f.checkValidity();
        f.setAttribute("aria-invalid", String(!ok));
        if (!ok && !erstesFehlerfeld) erstesFehlerfeld = f;
      });
      var mail = form.elements.email;
      if (mail.value && !mail.checkValidity()) {
        mail.setAttribute("aria-invalid", "true");
        erstesFehlerfeld = erstesFehlerfeld || mail;
      }
      if (erstesFehlerfeld) {
        zeigeMeldung("fehler", "Bitte füllen Sie die markierten Pflichtfelder aus.");
        erstesFehlerfeld.focus();
        return false;
      }
      return true;
    }

    // Fehlermarkierung entfernen, sobald korrigiert wird
    form.addEventListener("input", function (ev) {
      if (ev.target.getAttribute("aria-invalid") === "true") ev.target.setAttribute("aria-invalid", "false");
    });

    function zeigeMeldung(art, text) {
      meldung.className = "formular__meldung formular__meldung--" + art;
      meldung.textContent = text;
      if (art === "ok") meldung.focus();
    }

    function mailtoLink() {
      var f = form.elements; // nicht form.name: das wäre der Name des Formulars selbst
      var zeilenText = Array.prototype.map.call(zeilen.children, function (r) {
        var x = r.querySelectorAll("input, select");
        return x[0].value.trim() ? "- " + x[0].value.trim() + ": " + (x[1].value || "?") + " " + x[2].value : null;
      }).filter(Boolean).join("\n");

      var text =
        "Vorbestellung über die Website\n\n" +
        "Name: " + f.name.value + "\n" +
        "Telefon: " + f.telefon.value + "\n" +
        "E-Mail: " + (f.email.value || "-") + "\n" +
        "Abholtag: " + f.abholdatum.value + "\n\n" +
        "Wunschprodukte:\n" + f.wunschprodukte.value + "\n" +
        (zeilenText ? "\nEinzelpositionen:\n" + zeilenText + "\n" : "") +
        "\nAnmerkungen:\n" + (f.anmerkungen.value || "-") + "\n\n" +
        "Datenschutzhinweis zur Kenntnis genommen: ja";

      return "mailto:" + (V.empfaenger || (E.kontakt && E.kontakt.email) || "") +
        "?subject=" + encodeURIComponent("Vorbestellung für " + f.abholdatum.value) +
        "&body=" + encodeURIComponent(text);
    }
  })();

  /* ---------- 7. Google Maps (2-Klick) ---------------------------------- */

  (function karte() {
    var knopf = document.getElementById("karte-laden");
    var box = document.getElementById("karte");
    if (!knopf || !box) return;
    knopf.addEventListener("click", function () {
      var adresse = (E.kontakt && E.kontakt.adresse) || "Keltenstr. 5, 88368 Bergatreute";
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=" + encodeURIComponent("Landmetzgerei Nonnenmacher, " + adresse) + "&output=embed";
      iframe.title = "Karte: Landmetzgerei Nonnenmacher, " + adresse;
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      box.textContent = "";
      box.classList.add("karte--geladen");
      box.appendChild(iframe);
    });
  })();

  /* ---------- 8. Aktionsleiste fürs Handy ------------------------------- */
  // Sichtbar, sobald die Hero-Knöpfe aus dem Bild sind; ausgeblendet, solange
  // das Formular oder der Footer zu sehen ist (dort wäre sie nur doppelt).

  (function aktionsleiste() {
    var leiste = document.getElementById("aktionsleiste");
    var hero = document.querySelector(".hero__knoepfe");
    if (!leiste || !hero || !("IntersectionObserver" in window)) return;
    var sichtbar = {};
    var ziele = [hero, document.getElementById("vorbestellen"), document.querySelector(".fuss")];
    var beobachter = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) { sichtbar[ziele.indexOf(e.target)] = e.isIntersecting; });
      leiste.hidden = !!(sichtbar[0] || sichtbar[1] || sichtbar[2]) || sichtbar[0] === undefined;
    });
    ziele.forEach(function (z) { if (z) beobachter.observe(z); });
  })();
})();
