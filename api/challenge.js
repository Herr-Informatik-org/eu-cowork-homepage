// GET /api/challenge — holt sich das Formular beim Aufbau der Seite.
//
// Der zurueckgegebene Token ist ein verschluesselter Zeitstempel. Beim
// Absenden schickt ihn das Formular unveraendert mit, und /api/waitlist liest
// daraus ab, wie lange das Ausfuellen gedauert hat.
//
// Warum nicht einfach eine Zahl aus dem Browser? Weil der Browser luegen kann.
// Ein Bot setzt "elapsedMs: 5000" ohne zu warten. Der Zeitstempel hier ist
// verschluesselt und beglaubigt — wer ihn faelschen will, braucht TOKEN_SECRET,
// und wer ihn echt haben will, muss ihn abholen und wirklich warten.
//
// Nebenwirkung, die uns entgegenkommt: ein Bot, der nur stumpf auf
// /api/waitlist schiesst, ohne die Seite zu laden, hat gar keinen Token.

import { encryptToken, randomHex } from './_lib/token.js';

export async function handleChallenge(req, res, deps = {}) {
  const { now = () => Date.now(), env = process.env, log = console.error } = deps;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  try {
    const c = encryptToken({
      typ: 'challenge',
      iat: now(),
      // Einmalnummer. Sie macht zwei Token derselben Millisekunde
      // unterscheidbar und sorgt dafuer, dass der Geheimtext nie zweimal
      // gleich aussieht — auch wenn jemand die Antworten vergleicht.
      n: randomHex(8)
    }, env);

    // Kein Zwischenspeicher darf diesen Token festhalten: er misst Zeit, und
    // eine aufgewaermte Kopie waere beim Ankommen schon alt.
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ c });
  } catch (err) {
    // Faellt nur an, wenn TOKEN_SECRET fehlt. Nach aussen bleibt es vage,
    // im Log steht der Grund.
    log('Challenge konnte nicht erzeugt werden:', err && err.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
}

export default async function handler(req, res) {
  return handleChallenge(req, res, {});
}
