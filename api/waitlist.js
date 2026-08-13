// POST /api/waitlist — nimmt das Formular entgegen und verschickt die
// Bestaetigungsmail.
//
// Hier wird nichts gespeichert. Die Angaben wandern verschluesselt in den
// Bestaetigungslink; erst wenn dieser Link geklickt wird, entsteht in
// /api/confirm die Lead-Mail an unser Postfach. Ein Eintrag, der nie bestaetigt
// wird, hinterlaesst folglich nirgends eine Spur — nicht in einer Datenbank,
// nicht in einem Postfach.
//
// Zwei Leitgedanken bestimmen den Aufbau:
//
// 1. Bots erfahren nichts. Fangfeld und Zeitfalle fuehren nicht zu einer
//    Fehlermeldung, sondern zu einem freundlichen, folgenlosen "ok". Wer
//    keine Rueckmeldung bekommt, kann seinen Bot nicht nachbessern.
//
// 2. Keine Adress-Ausforschung. Weil nichts gespeichert wird, gibt es auch
//    keinen Zustand, den man abfragen koennte: dieselbe Adresse zweimal
//    eingetragen ergibt zweimal dieselbe Antwort.
//
// Die Kernlogik steckt in handleWaitlist(req, res, deps) — mit ausgelagerten
// Abhaengigkeiten, damit sie ohne Mailversand und ohne DNS testbar ist. Der
// Default-Export bindet die echten Abhaengigkeiten an.

import { resolveMx as dnsResolveMx } from 'node:dns/promises';

import { isFreemailDomain } from './_lib/freemail.js';
import { sendConfirmationMail } from './_lib/mail.js';
import { decryptToken, encryptToken } from './_lib/token.js';

// --- Grenzwerte -------------------------------------------------------------
const MAX_BODY_BYTES = 8 * 1024;      // Vier Felder brauchen kein Kilobyte mehr.
const MAX_EMAIL_LEN = 254;            // Obergrenze einer Adresse laut RFC 5321.
const MAX_COMPANY_LEN = 200;
const MIN_FILL_MS = 2000;             // Schneller fuellt kein Mensch ein Formular.
const MAX_CHALLENGE_AGE_MS = 6 * 60 * 60 * 1000;
const RATE_MAX_PER_HOUR = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MX_TIMEOUT_MS = 3000;

const ALLOWED_INTEREST = new Set(['', 'hosted', 'selfhost', 'both']);
// Gedankenstrich, nicht Bindestrich — genau die Werte aus dem Formular.
const ALLOWED_TEAM_SIZE = new Set(['', '1', '2–10', '11–50', '51–200', '200+']);
const ALLOWED_LANG = new Set(['de', 'en', 'fr', 'it', 'es']);

// Bewusst streng, aber nicht paedantisch: genau ein @, davor und danach etwas
// ohne Leerzeichen, hinten ein Punkt mit Endung. Die vollstaendige RFC-Syntax
// nachzubauen bringt nichts — was wirklich zaehlt, klaert die Bestaetigungsmail.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * Zaehlwerk der Rate-Begrenzung, absichtlich nur im Arbeitsspeicher.
 *
 * Das ist Best-Effort und kein Bollwerk: Vercel haelt eine Instanz nur so
 * lange warm, wie Verkehr da ist, und mehrere Instanzen wissen nichts
 * voneinander. Fuer den Zweck reicht es trotzdem — es bremst den Wiederholer,
 * der in einer Minute dreissig Mal abschickt. Wer wirklich verteilt angreift,
 * scheitert an den Stufen davor (Challenge-Token) und daran, dass ohne Klick
 * im Postfach ohnehin keine Mail bei uns ankommt.
 *
 * Der Preis fuer diese Einfachheit: kein Redis, kein Datenbanktisch, keine
 * gespeicherte IP-Adresse, die irgendwann jemand auswerten koennte.
 */
const hits = new Map();

/** Antwortet mit JSON und verhindert, dass Zwischenspeicher etwas festhalten. */
function json(res, status, payload) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(payload);
}

/** Kuerzt und trimmt einen Eingabewert; alles Nicht-Textliche wird zu ''. */
function str(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

/**
 * Erste IP aus x-forwarded-for. Vercel haengt hinten die eigenen Proxys an;
 * der erste Eintrag ist der Besucher. Faelschbar ist er nur insoweit, als ein
 * Angreifer sich damit selbst eine andere Rate-Schublade gibt — mehr als eine
 * grobe Bremse soll die Zaehlung ohnehin nicht sein.
 */
function clientIp(req) {
  const headers = req.headers || {};
  const xff = headers['x-forwarded-for'];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  if (raw) {
    const first = String(raw).split(',')[0].trim();
    if (first) return first;
  }
  const real = headers['x-real-ip'];
  return (Array.isArray(real) ? real[0] : real) || 'unbekannt';
}

/**
 * Zaehlt einen Versuch und sagt, ob das Stundenkontingent aufgebraucht ist.
 * Raeumt dabei auf: abgelaufene Schubladen fliegen raus, damit die Map auf
 * einer lange warmen Instanz nicht unbegrenzt waechst.
 */
function rateLimited(ip, nowMs) {
  for (const [key, stamps] of hits) {
    const fresh = stamps.filter((t) => nowMs - t < RATE_WINDOW_MS);
    if (fresh.length === 0) hits.delete(key);
    else hits.set(key, fresh);
  }

  const stamps = hits.get(ip) || [];
  if (stamps.length >= RATE_MAX_PER_HOUR) return true;

  stamps.push(nowMs);
  hits.set(ip, stamps);
  return false;
}

/** Nur fuer Tests: setzt das Zaehlwerk zurueck. */
export function _resetRateLimit() {
  hits.clear();
}

/**
 * Nimmt den Rumpf entgegen, egal in welchem Zustand ihn die Laufzeit liefert.
 * Bei application/json hat Vercel bereits geparst; ein String oder Buffer
 * kommt vor, wenn der Content-Type fehlt oder falsch gesetzt ist.
 * @returns {object|null} null bei kaputtem oder untauglichem Rumpf.
 */
function readBody(req) {
  const raw = req.body;
  if (raw == null) return null;
  if (typeof raw === 'object' && !Buffer.isBuffer(raw)) {
    return Array.isArray(raw) ? null : raw;
  }
  const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw);
  if (text.length > MAX_BODY_BYTES) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Hat die Domain ueberhaupt einen Mailserver?
 *
 * Faengt Tippfehler in der Endung ab, die die Syntaxpruefung durchlaesst
 * ("@firma.hc"). Bei Zeitueberschreitung oder DNS-Stoerung lassen wir bewusst
 * durch: ein wackliger Resolver darf keine echte Anmeldung kosten. Der Preis
 * ist, dass in dem Fall eine unzustellbare Adresse durchgeht — die faellt
 * spaetestens auf, weil die Bestaetigungsmail nie geklickt wird.
 */
async function hasMx(domain, resolveMx) {
  let timer = null;
  try {
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve('timeout'), MX_TIMEOUT_MS);
    });
    const result = await Promise.race([resolveMx(domain), timeout]);
    if (result === 'timeout') return true;
    return Array.isArray(result) && result.length > 0;
  } catch {
    // NXDOMAIN und "keine MX-Records" landen beide hier. Wir koennen die
    // beiden nicht sauber trennen, ohne den Fehlercode auszuwerten — und
    // beide bedeuten dasselbe: an diese Domain laesst sich nichts zustellen.
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Die eigentliche Verarbeitung.
 *
 * @param {object} req
 * @param {object} res
 * @param {{
 *   sendMail: Function,
 *   resolveMx?: Function,
 *   now?: () => number,
 *   env?: Record<string, string|undefined>,
 *   log?: (...args: any[]) => void
 * }} deps
 */
export async function handleWaitlist(req, res, deps) {
  const {
    sendMail,
    resolveMx = dnsResolveMx,
    now = () => Date.now(),
    env = process.env,
    log = console.error
  } = deps;

  // --- a) Methode, Rumpf, Felder ------------------------------------------
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  // Grober Riegel vor dem Parsen: was zu gross angekuendigt wird, sehen wir
  // uns gar nicht erst an.
  const declaredLen = Number((req.headers || {})['content-length'] || 0);
  if (declaredLen > MAX_BODY_BYTES) {
    return json(res, 400, { ok: false, error: 'invalid_input' });
  }

  const body = readBody(req);
  if (!body) return json(res, 400, { ok: false, error: 'invalid_input' });

  const email = str(body.email, MAX_EMAIL_LEN);
  const company = str(body.company, MAX_COMPANY_LEN);
  const interest = str(body.interest, 20);
  const teamSize = str(body.teamSize, 20);
  const langRaw = str(body.lang, 5).toLowerCase();
  // Die Sprache ist eine Anzeigeentscheidung, kein Nutzereingabefeld: was wir
  // nicht kennen, wird still zu Deutsch, statt die Anmeldung scheitern zu lassen.
  const lang = ALLOWED_LANG.has(langRaw) ? langRaw : 'de';

  if (!ALLOWED_INTEREST.has(interest) || !ALLOWED_TEAM_SIZE.has(teamSize)) {
    return json(res, 400, { ok: false, error: 'invalid_input' });
  }

  // --- b) Fangfeld: stilles OK --------------------------------------------
  // Das Feld ist im Formular unsichtbar. Ein Mensch kann es gar nicht
  // ausfuellen, ein Bot fuellt reflexhaft alles aus. Wer hier haengen bleibt,
  // bekommt dieselbe freundliche Antwort wie ein Erfolg — und wir verschicken
  // nichts.
  const hp = typeof body.hp === 'string' ? body.hp.trim() : '';
  if (hp !== '') return json(res, 200, { ok: true });

  // --- c) Challenge-Token: Alter des Formulars ----------------------------
  const challenge = decryptToken(body.challenge, env);
  if (!challenge || challenge.typ !== 'challenge' || !Number.isFinite(Number(challenge.iat))) {
    return json(res, 400, { ok: false, error: 'invalid_input' });
  }

  const age = now() - Number(challenge.iat);
  // Zu schnell heisst Maschine — wieder stilles OK, damit ein Bot nicht durch
  // Ausprobieren herausfindet, wie lange er warten muesste.
  // Ein negatives Alter (Uhr der Instanz laeuft vor) faellt in denselben Fall.
  if (age < MIN_FILL_MS) return json(res, 200, { ok: true });
  // Zu alt heisst: Seite lag lange offen. Das ist kein Bot, sondern ein
  // Mensch, dem wir sagen koennen, was zu tun ist — deshalb ein echter Fehler.
  if (age > MAX_CHALLENGE_AGE_MS) return json(res, 400, { ok: false, error: 'expired' });

  // --- d) Rate-Begrenzung --------------------------------------------------
  if (rateLimited(clientIp(req), now())) {
    return json(res, 429, { ok: false, error: 'rate_limited' });
  }

  // --- e) Adresse: Schreibweise und Anbieter ------------------------------
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return json(res, 400, { ok: false, error: 'invalid_email' });
  }

  const emailNorm = email.toLowerCase();
  const domain = emailNorm.slice(emailNorm.lastIndexOf('@') + 1);
  if (isFreemailDomain(domain)) {
    return json(res, 400, { ok: false, error: 'free_email' });
  }

  // --- f) Hat die Domain einen Mailserver? --------------------------------
  if (!(await hasMx(domain, resolveMx))) {
    return json(res, 400, { ok: false, error: 'invalid_email' });
  }

  // --- g) Bestaetigungslink bauen und verschicken --------------------------
  // Die Angaben reisen im Token mit — das ist der Ersatz fuer die Zeile in
  // einer Datenbank. Der Ablauf nach 48 Stunden wird nicht hier gesetzt,
  // sondern beim Einloesen aus iat gerechnet: ein Ablaufdatum im Token, das
  // der Token selbst mitbringt, waere nur eine zweite Fassung derselben Zahl.
  let confirmUrl;
  try {
    const token = encryptToken({
      typ: 'confirm',
      email,
      company,
      interest,
      teamSize,
      lang,
      iat: now()
    }, env);

    const siteUrl = (env.SITE_URL || 'https://eucowork.ai').replace(/\/+$/, '');
    confirmUrl = `${siteUrl}/api/confirm?t=${encodeURIComponent(token)}`;
  } catch (err) {
    log('Bestaetigungs-Token konnte nicht erzeugt werden:', err && err.message);
    return json(res, 500, { ok: false, error: 'mail_failed' });
  }

  try {
    await sendMail({ to: email, lang, confirmUrl, env });
  } catch (err) {
    // Nur die Meldung ins Log, nie der Fehler selbst an den Browser: in der
    // Antwort von SMTP2GO koennen Interna stehen.
    log('Mailversand fehlgeschlagen:', err && err.message);
    return json(res, 500, { ok: false, error: 'mail_failed' });
  }

  return json(res, 200, { ok: true });
}

export default async function handler(req, res) {
  return handleWaitlist(req, res, { sendMail: sendConfirmationMail });
}
