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
      'chrome.footer.col.product': 'Product',
      'chrome.footer.col.know': 'Knowledge',
      'chrome.footer.col.trust': 'Trust',
      'chrome.footer.col.legal': 'Legal',
      'chrome.footer.link.features': 'Features',
      'chrome.footer.link.sovereignty': 'Sovereignty',
      'chrome.footer.link.pricing': 'Pricing',
      'chrome.footer.link.selfhost': 'Self-Host',
      'chrome.footer.link.integrations': 'Integrations',
      'chrome.footer.link.faq': 'FAQ',
      'chrome.footer.link.docs': 'Docs',
      'chrome.footer.link.blog': 'Blog',
      'chrome.footer.link.comparison': 'Comparison',
      'chrome.footer.link.governance': 'Governance',
      'chrome.footer.link.vision': 'Vision',
      'chrome.footer.link.security': 'Security & Trust',
      'chrome.footer.link.avv': 'DPA',
      'chrome.footer.link.toms': 'TOMs',
      'chrome.footer.link.subs': 'Subprocessors',
      'chrome.footer.link.imprint': 'Imprint',
      'chrome.footer.link.privacy': 'Privacy',
      'chrome.footer.link.terms': 'Terms (GTC)',
      'chrome.footer.rights': '© 2026 EU Cowork AI. Name is a working title.',
      'chrome.footer.built': 'Built on LibreChat · MIT'
    },
    fr: {
      'chrome.skip': 'Aller au contenu',
      'chrome.nav.pricing': 'Tarifs',
      'chrome.nav.docs': 'Docs',
      'chrome.nav.blog': 'Blog',
      'chrome.cta.selfhost': 'Self-host for free',
      'chrome.cta.waitlist': 'Rejoindre la liste d’attente',
      'chrome.crumb.home': 'Accueil',
      'chrome.footer.tagline': 'Votre collègue IA. Il reste en Europe.',
      'chrome.footer.badge1t': 'Déployable partout',
      'chrome.footer.badge1s': 'Managé, votre cloud ou on-premise',
      'chrome.footer.badge2t': 'Conforme au RGPD',
      'chrome.footer.badge2s': 'Traitement dans l’UE',
      'chrome.footer.more': 'En savoir plus sur la sécurité',
      'chrome.footer.status': 'Opérationnel',
      'chrome.footer.col.product': 'Produit',
      'chrome.footer.col.know': 'Ressources',
      'chrome.footer.col.trust': 'Confiance',
      'chrome.footer.col.legal': 'Juridique',
      'chrome.footer.link.features': 'Fonctionnalités',
      'chrome.footer.link.sovereignty': 'Souveraineté',
      'chrome.footer.link.pricing': 'Tarifs',
      'chrome.footer.link.selfhost': 'Self-Host',
      'chrome.footer.link.integrations': 'Intégrations',
      'chrome.footer.link.faq': 'FAQ',
      'chrome.footer.link.docs': 'Docs',
      'chrome.footer.link.blog': 'Blog',
      'chrome.footer.link.comparison': 'Comparatif',
      'chrome.footer.link.governance': 'Gouvernance',
      'chrome.footer.link.vision': 'Vision',
      'chrome.footer.link.security': 'Security & Trust',
      'chrome.footer.link.avv': 'DPA (sous-traitance)',
      'chrome.footer.link.toms': 'TOMs',
      'chrome.footer.link.subs': 'Sous-traitants ultérieurs',
      'chrome.footer.link.imprint': 'Mentions légales',
      'chrome.footer.link.privacy': 'Confidentialité',
      'chrome.footer.link.terms': 'CGV',
      'chrome.footer.rights': '© 2026 EU Cowork AI. Le nom est provisoire.',
      'chrome.footer.built': 'Built on LibreChat · MIT'
    },
    it: {
      'chrome.skip': 'Vai al contenuto',
      'chrome.nav.pricing': 'Prezzi',
      'chrome.nav.docs': 'Docs',
      'chrome.nav.blog': 'Blog',
      'chrome.cta.selfhost': 'Self-host for free',
      'chrome.cta.waitlist': 'Iscriviti alla lista d’attesa',
      'chrome.crumb.home': 'Home',
      'chrome.footer.tagline': 'Il vostro collega IA. Resta in Europa.',
      'chrome.footer.badge1t': 'Installabile ovunque',
      'chrome.footer.badge1s': 'Gestito, cloud proprio oppure on-premise',
      'chrome.footer.badge2t': 'Conforme al GDPR',
      'chrome.footer.badge2s': 'Elaborazione nell’UE',
      'chrome.footer.more': 'Di più sulla sicurezza',
      'chrome.footer.status': 'Operativo',
      'chrome.footer.col.product': 'Prodotto',
      'chrome.footer.col.know': 'Risorse',
      'chrome.footer.col.trust': 'Fiducia',
      'chrome.footer.col.legal': 'Note legali',
      'chrome.footer.link.features': 'Funzionalità',
      'chrome.footer.link.sovereignty': 'Sovranità',
      'chrome.footer.link.pricing': 'Prezzi',
      'chrome.footer.link.selfhost': 'Self-Host',
      'chrome.footer.link.integrations': 'Integrazioni',
      'chrome.footer.link.faq': 'FAQ',
      'chrome.footer.link.docs': 'Docs',
      'chrome.footer.link.blog': 'Blog',
      'chrome.footer.link.comparison': 'Confronto',
      'chrome.footer.link.governance': 'Governance',
      'chrome.footer.link.vision': 'Visione',
      'chrome.footer.link.security': 'Security & Trust',
      'chrome.footer.link.avv': 'Accordo sul trattamento (DPA)',
      'chrome.footer.link.toms': 'TOMs',
      'chrome.footer.link.subs': 'Sub-responsabili',
      'chrome.footer.link.imprint': 'Note legali',
      'chrome.footer.link.privacy': 'Privacy',
      'chrome.footer.link.terms': 'Condizioni generali',
      'chrome.footer.rights': '© 2026 EU Cowork AI. Il nome è provvisorio.',
      'chrome.footer.built': 'Built on LibreChat · MIT'
    },
    es: {
      'chrome.skip': 'Saltar al contenido',
      'chrome.nav.pricing': 'Precios',
      'chrome.nav.docs': 'Docs',
      'chrome.nav.blog': 'Blog',
      'chrome.cta.selfhost': 'Self-host for free',
      'chrome.cta.waitlist': 'Únete a la lista de espera',
      'chrome.crumb.home': 'Inicio',
      'chrome.footer.tagline': 'Su colega de IA. Se queda en Europa.',
      'chrome.footer.badge1t': 'Desplegable en cualquier lugar',
      'chrome.footer.badge1s': 'Gestionado, nube propia u on-premise',
      'chrome.footer.badge2t': 'Conforme al RGPD',
      'chrome.footer.badge2s': 'Procesamiento en la UE',
      'chrome.footer.more': 'Más sobre la seguridad',
      'chrome.footer.status': 'Operativo',
      'chrome.footer.col.product': 'Producto',
      'chrome.footer.col.know': 'Recursos',
      'chrome.footer.col.trust': 'Confianza',
      'chrome.footer.col.legal': 'Legal',
      'chrome.footer.link.features': 'Funciones',
      'chrome.footer.link.sovereignty': 'Soberanía',
      'chrome.footer.link.pricing': 'Precios',
      'chrome.footer.link.selfhost': 'Self-Host',
      'chrome.footer.link.integrations': 'Integraciones',
      'chrome.footer.link.faq': 'FAQ',
      'chrome.footer.link.docs': 'Docs',
      'chrome.footer.link.blog': 'Blog',
      'chrome.footer.link.comparison': 'Comparativa',
      'chrome.footer.link.governance': 'Gobernanza',
      'chrome.footer.link.vision': 'Visión',
      'chrome.footer.link.security': 'Security & Trust',
      'chrome.footer.link.avv': 'Acuerdo de encargo (DPA)',
      'chrome.footer.link.toms': 'TOMs',
      'chrome.footer.link.subs': 'Subencargados',
      'chrome.footer.link.imprint': 'Aviso legal',
      'chrome.footer.link.privacy': 'Privacidad',
      'chrome.footer.link.terms': 'Condiciones generales',
      'chrome.footer.rights': '© 2026 EU Cowork AI. El nombre es provisional.',
      'chrome.footer.built': 'Built on LibreChat · MIT'
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

  var current = stored() || fromBrowser();
  if (current) {
    persist(current);
  } else {
    // Weder gespeichert noch per Browsersprache bestimmbar: vorlaeufig
    // Englisch, dann fragt der Server das IP-Land ab (keine Freigabe noetig).
    current = 'en';
    persist('en');
    if (typeof fetch === 'function') {
      fetch('/api/locale').then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (d) {
        if (d && SUPPORTED.indexOf(d.lang) >= 0 && d.lang !== 'en') setLang(d.lang);
      }).catch(function () {});
    }
  }
  document.documentElement.lang = current;

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
  }

  function wire() {
    document.querySelectorAll('select[data-euc-lang]').forEach(function (s) {
      s.value = readCurrent();
      s.addEventListener('change', function () { setLang(s.value); });
    });
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
