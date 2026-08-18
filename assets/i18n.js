/* =============================================================================
   eucowork.ai Sprach-Laufzeit.

   Aufgaben:
   1. Sprachwahl beim ersten Besuch: gespeicherte Wahl -> Browsersprache ->
      IP-Land (/api/locale, ohne Geolocation-Freigabe) -> Englisch.
      Das Ergebnis landet in localStorage('eucowork_lang'), wo die
      React-Komponenten der .dc-Seiten es beim Mounten lesen.
   2. Statische Seiten: Elemente mit [data-i18n] werden beim Sprachwechsel
      aus dem Woerterbuch ersetzt. Deutsch ist die Inline-Fassung im Markup
      und wird beim ersten Durchlauf als Original gesichert. Seiteninhalte
      liefert window.EUC_I18N (pro Seite), Kopf-/Fussleiste und Brotkrumen
      das eingebaute CHROME-Woerterbuch.
   3. Sprachumschalter: <select data-euc-lang> wird verdrahtet; Wechsel
      feuern dasselbe Event 'eucowork:langchange' wie die React-Umschalter,
      damit beide Welten synchron bleiben.

   Einbindung: <script src="/assets/i18n.js"></script> im <head>, vor
   support.js. Der Erkennungsteil laeuft synchron, damit die Komponenten
   beim Mounten schon den richtigen Wert vorfinden.
   ============================================================================= */
(function () {
  'use strict';

  var SUPPORTED = ['de', 'en', 'fr', 'it', 'es'];
  var KEY = 'eucowork_lang';

  /* ------------------------- Kopf/Fuss der statischen Seiten ------------------------- */
  var CHROME = {
    en: {
      'chrome.skip': 'Skip to content',
      'chrome.nav.pricing': 'Pricing',
      'chrome.nav.docs': 'Docs',
      'chrome.nav.blog': 'Blog',
      'chrome.cta.selfhost': 'Self-host for free',
      'chrome.cta.waitlist': 'Join the waitlist',
      'chrome.crumb.home': 'Home',
      'chrome.footer.tagline': 'Your AI coworker. Stays in Europe.',
      'chrome.footer.badge1t': 'Deployable anywhere',
      'chrome.footer.badge1s': 'Managed, own cloud or on-prem',
      'chrome.footer.badge2t': 'GDPR-compliant',
      'chrome.footer.badge2s': 'EU processing',
      'chrome.footer.more': 'More about security',
      'chrome.footer.status': 'Operational',
      'chrome.footer.statusSwiss': 'Swiss instance',
      'chrome.footer.col.product': 'Product',
      'chrome.footer.col.trust': 'Trust',
      'chrome.footer.col.legal': 'Legal',
      'chrome.footer.link.features': 'Features',
      'chrome.footer.link.sovereignty': 'Sovereignty',
      'chrome.footer.link.pricing': 'Pricing',
      'chrome.footer.link.selfhost': 'Self-Host',
      'chrome.footer.link.integrations': 'Integrations',
      'chrome.footer.link.booking': 'Book a call',
      'chrome.footer.link.faq': 'FAQ',
      'chrome.footer.link.docs': 'Documentation',
      'chrome.footer.link.blog': 'Blog',
      'chrome.footer.link.comparison': 'Comparison',
      'chrome.footer.link.governance': 'Governance',
      'chrome.footer.link.vision': 'Our vision',
      'chrome.footer.link.security': 'Security & Trust',
      'chrome.footer.link.avv': 'DPA',
      'chrome.footer.link.toms': 'TOM overview',
      'chrome.footer.link.subs': 'Subprocessors',
      'chrome.footer.link.imprint': 'Imprint',
      'chrome.footer.link.privacy': 'Privacy',
      'chrome.footer.link.terms': 'Terms (GTC)',
      'chrome.footer.col.lang': 'Language',
      'chrome.footer.rights': '© 2026 EU Cowork AI by Herr-Informatik GmbH'
    },
    fr: {
      'chrome.skip': 'Aller au contenu',
      'chrome.nav.pricing': 'Tarifs',
      'chrome.nav.docs': 'Docs',
      'chrome.nav.blog': 'Blog',
      'chrome.cta.selfhost': 'Héberger vous-même',
      'chrome.cta.waitlist': 'Rejoindre la liste d’attente',
      'chrome.crumb.home': 'Accueil',
      'chrome.footer.tagline': 'Votre collègue IA. Il reste en Europe.',
      'chrome.footer.badge1t': 'Déployable partout',
      'chrome.footer.badge1s': 'Managé, votre cloud ou on-premise',
      'chrome.footer.badge2t': 'Conforme au RGPD',
      'chrome.footer.badge2s': 'Traitement dans l’UE',
      'chrome.footer.more': 'En savoir plus sur la sécurité',
      'chrome.footer.status': 'Opérationnel',
      'chrome.footer.statusSwiss': 'Instance suisse',
      'chrome.footer.col.product': 'Produit',
      'chrome.footer.col.trust': 'Trust',
      'chrome.footer.col.legal': 'Juridique',
      'chrome.footer.link.features': 'Fonctionnalités',
      'chrome.footer.link.sovereignty': 'Souveraineté',
      'chrome.footer.link.pricing': 'Tarifs',
      'chrome.footer.link.selfhost': 'Self-Host',
      'chrome.footer.link.integrations': 'Intégrations',
      'chrome.footer.link.booking': 'Réserver un rendez-vous',
      'chrome.footer.link.faq': 'FAQ',
      'chrome.footer.link.docs': 'Documentation',
      'chrome.footer.link.blog': 'Blog',
      'chrome.footer.link.comparison': 'Comparatif',
      'chrome.footer.link.governance': 'Governance',
      'chrome.footer.link.vision': 'Notre vision',
      'chrome.footer.link.security': 'Security & Trust',
      'chrome.footer.link.avv': 'DPA (sous-traitance)',
      'chrome.footer.link.toms': 'Aperçu des MTO',
      'chrome.footer.link.subs': 'Sous-traitants ultérieurs',
      'chrome.footer.link.imprint': 'Mentions légales',
      'chrome.footer.link.privacy': 'Confidentialité',
      'chrome.footer.link.terms': 'CGV',
      'chrome.footer.col.lang': 'Langue',
      'chrome.footer.rights': '© 2026 EU Cowork AI by Herr-Informatik GmbH'
    },
    it: {
      'chrome.skip': 'Vai al contenuto',
      'chrome.nav.pricing': 'Prezzi',
      'chrome.nav.docs': 'Docs',
      'chrome.nav.blog': 'Blog',
      'chrome.cta.selfhost': 'Ospitare in proprio',
      'chrome.cta.waitlist': 'Iscriviti alla lista d’attesa',
      'chrome.crumb.home': 'Home',
      'chrome.footer.tagline': 'Il vostro collega IA. Resta in Europa.',
      'chrome.footer.badge1t': 'Eseguibile ovunque',
      'chrome.footer.badge1s': 'Gestito, cloud proprio o on-premise',
      'chrome.footer.badge2t': 'Conforme al GDPR',
      'chrome.footer.badge2s': 'Trattamento nell’UE',
      'chrome.footer.more': 'Maggiori informazioni sulla sicurezza',
      'chrome.footer.status': 'Operativo',
      'chrome.footer.statusSwiss': 'Istanza svizzera',
      'chrome.footer.col.product': 'Prodotto',
      'chrome.footer.col.trust': 'Trust',
      'chrome.footer.col.legal': 'Legale',
      'chrome.footer.link.features': 'Funzionalità',
      'chrome.footer.link.sovereignty': 'Sovranità',
      'chrome.footer.link.pricing': 'Prezzi',
      'chrome.footer.link.selfhost': 'Self-Host',
      'chrome.footer.link.integrations': 'Integrazioni',
      'chrome.footer.link.booking': 'Prenotare un appuntamento',
      'chrome.footer.link.faq': 'FAQ',
      'chrome.footer.link.docs': 'Documentazione',
      'chrome.footer.link.blog': 'Blog',
      'chrome.footer.link.comparison': 'Confronto',
      'chrome.footer.link.governance': 'Governance',
      'chrome.footer.link.vision': 'La nostra visione',
      'chrome.footer.link.security': 'Security & Trust',
      'chrome.footer.link.avv': 'Accordo sul trattamento (DPA)',
      'chrome.footer.link.toms': 'Panoramica MTO',
      'chrome.footer.link.subs': 'Sub-responsabili',
      'chrome.footer.link.imprint': 'Note legali',
      'chrome.footer.link.privacy': 'Privacy',
      'chrome.footer.link.terms': 'Condizioni generali',
      'chrome.footer.col.lang': 'Lingua',
      'chrome.footer.rights': '© 2026 EU Cowork AI by Herr-Informatik GmbH'
    },
    es: {
      'chrome.skip': 'Saltar al contenido',
      'chrome.nav.pricing': 'Precios',
      'chrome.nav.docs': 'Docs',
      'chrome.nav.blog': 'Blog',
      'chrome.cta.selfhost': 'Alojar usted mismo',
      'chrome.cta.waitlist': 'Únase a la lista de espera',
      'chrome.crumb.home': 'Inicio',
      'chrome.footer.tagline': 'Su colega de IA. Se queda en Europa.',
      'chrome.footer.badge1t': 'Desplegable en cualquier lugar',
      'chrome.footer.badge1s': 'Gestionado, nube propia u on-premise',
      'chrome.footer.badge2t': 'Conforme al RGPD',
      'chrome.footer.badge2s': 'Tratamiento en la UE',
      'chrome.footer.more': 'Más sobre la seguridad',
      'chrome.footer.status': 'Operativo',
      'chrome.footer.statusSwiss': 'Instancia suiza',
      'chrome.footer.col.product': 'Producto',
      'chrome.footer.col.trust': 'Trust',
      'chrome.footer.col.legal': 'Legal',
      'chrome.footer.link.features': 'Funciones',
      'chrome.footer.link.sovereignty': 'Soberanía',
      'chrome.footer.link.pricing': 'Precios',
      'chrome.footer.link.selfhost': 'Self-Host',
      'chrome.footer.link.integrations': 'Integraciones',
      'chrome.footer.link.booking': 'Reservar una cita',
      'chrome.footer.link.faq': 'FAQ',
      'chrome.footer.link.docs': 'Documentación',
      'chrome.footer.link.blog': 'Blog',
      'chrome.footer.link.comparison': 'Comparativa',
      'chrome.footer.link.governance': 'Governance',
      'chrome.footer.link.vision': 'Nuestra visión',
      'chrome.footer.link.security': 'Security & Trust',
      'chrome.footer.link.avv': 'Acuerdo de encargo (DPA)',
      'chrome.footer.link.toms': 'Resumen de MTO',
      'chrome.footer.link.subs': 'Subencargados',
      'chrome.footer.link.imprint': 'Aviso legal',
      'chrome.footer.link.privacy': 'Privacidad',
      'chrome.footer.link.terms': 'Condiciones generales',
      'chrome.footer.col.lang': 'Idioma',
      'chrome.footer.rights': '© 2026 EU Cowork AI by Herr-Informatik GmbH'
    }
  };

  /* ------------------------------ Erkennung ------------------------------ */

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return SUPPORTED.indexOf(v) >= 0 ? v : null;
    } catch (e) { return null; }
  }

  function persist(l) {
    try { localStorage.setItem(KEY, l); } catch (e) {}
  }

  function fromBrowser() {
    var list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || ''];
    for (var i = 0; i < list.length; i++) {
      var primary = String(list[i] || '').slice(0, 2).toLowerCase();
      if (SUPPORTED.indexOf(primary) >= 0) return primary;
    }
    return null;
  }

  function setLang(l) {
    if (SUPPORTED.indexOf(l) < 0) l = 'en';
    persist(l);
    document.documentElement.lang = l;
    // Dasselbe Event, das auch die React-Umschalter feuern; beide Seiten
    // (Komponenten und diese Laufzeit) hoeren darauf.
    window.dispatchEvent(new CustomEvent('eucowork:langchange', { detail: l }));
  }

  /* ------------------------- Sprache und Adresse -------------------------
     Jede Sprache hat eine eigene Adresse: Deutsch steht auf den Wurzelpfaden,
     die uebrigen unter /en, /fr, /it und /es. Erst dadurch kann eine
     Suchmaschine fuenf Fassungen kennen statt einer. Daraus folgt die Regel
     dieses Abschnitts: Die Adresse bestimmt die Sprache, nicht der Browser.
     ----------------------------------------------------------------------- */

  var PREFIX_RE = /^\/(en|fr|it|es)(?=\/|$)/;

  function langFromPath(path) {
    var m = PREFIX_RE.exec(path || '');
    return m ? m[1] : 'de';
  }

  // Der Pfad ohne Sprachpraefix, also die deutsche Adresse derselben Seite.
  function basePath(path) {
    var p = String(path || '/').replace(PREFIX_RE, '');
    return p === '' ? '/' : p;
  }

  function urlForLang(l, path) {
    var base = basePath(path);
    if (l === 'de') return base;
    return base === '/' ? '/' + l : '/' + l + base;
  }

  /* Suchmaschinen duerfen nie umgeleitet werden: sie sollen genau die Sprache
     sehen, die sie angefragt haben. Sonst landet die franzoesische Fassung
     unter der deutschen Adresse im Index, oder die deutsche Startseite
     verschwindet daraus. */
  function isCrawler() {
    return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|showyoubot|outbrain|pinterest|vkshare|w3c_validator|whatsapp|telegram|lighthouse|headlesschrome/i
      .test(navigator.userAgent || '');
  }

  var urlLang = langFromPath(location.pathname);
  var current;

  if (urlLang !== 'de') {
    // Die Adresse ist eindeutig; sie gilt und wird auch fuer den naechsten
    // Besuch gemerkt.
    current = urlLang;
    persist(current);
  } else {
    var choice = stored();
    current = 'de';
    if (!isCrawler()) {
      if (choice && choice !== 'de') {
        location.replace(urlForLang(choice, location.pathname) + location.search + location.hash);
      } else if (!choice) {
        var guess = fromBrowser();
        if (guess && guess !== 'de') {
          persist(guess);
          location.replace(urlForLang(guess, location.pathname) + location.search + location.hash);
        } else if (!guess && typeof fetch === 'function') {
          // Browsersprache passt zu keiner unserer Fassungen: das Land aus der
          // Anfrage entscheidet. Ohne Freigabe, nur aus der IP-Adresse.
          fetch('/api/locale').then(function (r) {
            return r.ok ? r.json() : null;
          }).then(function (d) {
            if (d && SUPPORTED.indexOf(d.lang) >= 0 && d.lang !== 'de') {
              persist(d.lang);
              location.replace(urlForLang(d.lang, location.pathname) + location.search + location.hash);
            }
          }).catch(function () {});
        }
      }
    }
  }
  document.documentElement.lang = current;

  /* ------------------------- Verweise nachziehen -------------------------
     Kopf- und Fussleiste entstehen erst im Browser und kennen nur die
     deutschen Adressen. Blieben sie so, verwiese die spanische Seite auf die
     deutsche Preisseite: der Besucher macht einen Umweg ueber die Umleitung,
     und eine Suchmaschine sieht eine spanische Seite, die nach Deutsch zeigt.
     Deshalb bekommen alle internen Verweise das Praefix der Seite -- auch die,
     die spaeter nachgereicht werden.
     ----------------------------------------------------------------------- */

  var NO_PREFIX = ['/docs', '/assets/', '/fonts/', '/og/', '/api/', '/vendor/'];
  var ASSET_RE = /\.(png|jpe?g|svg|ico|webp|woff2?|xml|txt|json|css|js)$/i;

  function prefixLinks(root) {
    if (urlLang === 'de') return;
    var links = (root || document).querySelectorAll('a[href^="/"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) !== '/') continue;
      if (href === '/' + urlLang || href.indexOf('/' + urlLang + '/') === 0) continue;
      var bare = href.split('#')[0].split('?')[0];
      if (ASSET_RE.test(bare)) continue;
      /* Die Dokumentation zaehlt anders: sie ist ein eigenes Starlight-Projekt
         und legt die Sprache HINTER /docs ab, nicht davor. Deutsch liegt dort
         auf der Wurzel, die uebrigen vier unter /docs/<sprache>. */
      if (href === '/docs' || href.indexOf('/docs/') === 0) {
        var rest = href.slice(5);
        if (rest !== '/' + urlLang && rest.indexOf('/' + urlLang + '/') !== 0) {
          a.setAttribute('href', '/docs/' + urlLang + rest);
        }
        continue;
      }
      var skip = false;
      for (var n = 0; n < NO_PREFIX.length; n++) {
        if (href === NO_PREFIX[n] || href.indexOf(NO_PREFIX[n]) === 0) { skip = true; break; }
      }
      if (skip) continue;
      a.setAttribute('href', '/' + urlLang + (href === '/' ? '' : href));
    }
  }

  if (urlLang !== 'de' && typeof MutationObserver !== 'undefined') {
    var linkTimer = null;
    new MutationObserver(function () {
      clearTimeout(linkTimer);
      linkTimer = setTimeout(function () { prefixLinks(document); }, 30);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* Ein Sprachwechsel ist ein Seitenwechsel. Die Umschalter in Kopf- und
     Fussleiste melden ihn nur; hierher gehoert der Sprung auf die passende
     Adresse. */
  window.addEventListener('eucowork:langchange', function (e) {
    var l = e.detail;
    if (SUPPORTED.indexOf(l) < 0) return;
    var target = urlForLang(l, location.pathname);
    if (target !== location.pathname) {
      location.assign(target + location.search + location.hash);
    }
  });

  /* --------------------- Anwenden auf statische Seiten --------------------- */

  // Erst beim ersten Anwenden gefuellt: data-i18n-Element -> deutsches Original.
  var originals = null;

  function lookup(lang, key) {
    var page = window.EUC_I18N || {};
    var v = (page[lang] || {})[key];
    if (typeof v === 'string') return v;
    v = (CHROME[lang] || {})[key];
    if (typeof v === 'string') return v;
    // Fehlender Schluessel: englische Fassung vor deutschem Original.
    if (lang !== 'en') {
      v = (page.en || {})[key];
      if (typeof v === 'string') return v;
      v = CHROME.en[key];
      if (typeof v === 'string') return v;
    }
    return null;
  }

  function apply(lang) {
    // Seiten unter einem Sprachpraefix werden fertig uebersetzt ausgeliefert.
    // Dort noch einmal zu ersetzen brachte nichts und wuerde die vorhandene
    // Fassung faelschlich als deutsches Original sichern.
    if (urlLang !== 'de') {
      syncSwitchers(lang);
      return;
    }
    var els = document.querySelectorAll('[data-i18n]');
    if (!els.length) {
      syncSwitchers(lang);
      return;
    }
    if (!originals) {
      originals = new Map();
      els.forEach(function (el) { originals.set(el, el.innerHTML); });
    }
    els.forEach(function (el) {
      if (!originals.has(el)) originals.set(el, el.innerHTML);
      if (lang === 'de') {
        el.innerHTML = originals.get(el);
        return;
      }
      var v = lookup(lang, el.getAttribute('data-i18n'));
      el.innerHTML = (v !== null) ? v : originals.get(el);
    });
    syncSwitchers(lang);
  }

  function syncSwitchers(lang) {
    document.querySelectorAll('select[data-euc-lang]').forEach(function (s) {
      if (s.value !== lang) s.value = lang;
    });
    document.querySelectorAll('button[data-euc-lang-to]').forEach(function (b) {
      b.classList.toggle('is-current', b.getAttribute('data-euc-lang-to') === lang);
    });
  }

  function wire() {
    document.querySelectorAll('select[data-euc-lang]').forEach(function (s) {
      s.value = readCurrent();
      s.addEventListener('change', function () { setLang(s.value); });
    });
    /* Sprachspalte der Fussleiste: jede Sprache hat ihre eigene Adresse,
       deshalb wird navigiert statt nur ausgetauscht. */
    document.querySelectorAll('button[data-euc-lang-to]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = b.getAttribute('data-euc-lang-to');
        if (SUPPORTED.indexOf(l) < 0) return;
        persist(l);
        var here = location.pathname + location.search + location.hash;
        var target = urlForLang(l, location.pathname) + location.search + location.hash;
        if (target !== here) { location.href = target; } else { setLang(l); }
      });
    });
    /* Ortszeit in der Statuszeile, wie auf der Startseite. */
    var clocks = document.querySelectorAll('[data-euc-clock]');
    if (clocks.length) {
      var tickClock = function () {
        try {
          var t = new Date().toLocaleTimeString('de-CH', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit', second: '2-digit' });
          clocks.forEach(function (c) { c.textContent = 'Lupfig ' + t; });
        } catch (e) {}
      };
      tickClock();
      setInterval(tickClock, 1000);
    }
    apply(readCurrent());
  }

  function readCurrent() {
    return stored() || current;
  }

  window.addEventListener('eucowork:langchange', function (e) {
    var l = e.detail;
    if (SUPPORTED.indexOf(l) < 0) return;
    current = l;
    document.documentElement.lang = l;
    apply(l);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }

  window.EUCI18N = { setLang: setLang, current: readCurrent, supported: SUPPORTED.slice() };
})();
