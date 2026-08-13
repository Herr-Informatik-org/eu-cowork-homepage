/**
 * Sprachvorschlag aus dem Anfrage-Standort, ohne Browser-Geolocation.
 *
 * Vercel setzt auf jeder Anfrage den Header `x-vercel-ip-country` (ISO-3166
 * Alpha-2, aus der IP-Adresse abgeleitet). Der Client fragt hier nur dann an,
 * wenn keine gespeicherte Wahl existiert und keine Browsersprache passt --
 * der Nutzer muss also nichts freigeben, und es wird nichts gespeichert.
 */

const LANG_BY_COUNTRY = {
  // Deutsch
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // Franzoesisch
  FR: 'fr', MC: 'fr', BE: 'fr', LU: 'fr',
  // Italienisch
  IT: 'it', SM: 'it', VA: 'it',
  // Spanisch (Spanien und Lateinamerika)
  ES: 'es', AD: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  UY: 'es', EC: 'es', VE: 'es', BO: 'es', PY: 'es', GT: 'es', CR: 'es',
  PA: 'es', DO: 'es', HN: 'es', SV: 'es', NI: 'es', CU: 'es', PR: 'es'
};

export default async function handler(req, res) {
  const raw = req.headers['x-vercel-ip-country'];
  const country = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
  const lang = LANG_BY_COUNTRY[country] || 'en';
  // Die Antwort haengt von der IP ab und darf nicht aus einem gemeinsamen
  // Cache kommen; der Browser des Nutzers darf sie kurz behalten.
  res.setHeader('Cache-Control', 'private, max-age=3600');
  return res.status(200).json({ country: country || null, lang });
}
