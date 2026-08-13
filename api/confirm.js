// GET /api/confirm?t=… — loest den Bestaetigungslink ein.
//
// Erst hier entsteht die Lead-Mail an unser Postfach. Alles, was dafuer noetig
// ist, steht verschluesselt im Token: Adresse, Firma, Interesse, Teamgroesse,
// Sprache und der Zeitpunkt des Eintrags. Es gibt nichts nachzuschlagen, weil
// nirgends etwas abgelegt wurde.
//
// Aufgerufen wird das aus dem Postfach heraus, also von einem Menschen im
// Browser und nicht von unserem Formular. Deshalb gibt es hier kein JSON,
// sondern eine Weiterleitung zurueck auf die Seite, von der die Anmeldung kam:
//   /warteliste?confirm=ok       — bestaetigt, Lead-Mail ist raus
//   /warteliste?confirm=invalid  — Token unbrauchbar, abgelaufen oder Panne
//
// 303 statt 302, damit der Browser die Folge-Anfrage garantiert als GET
// stellt und die Adresse mit dem Token nicht im Verlauf haengen bleibt.

import { createHash } from 'node:crypto';

import { sendLeadMail } from './_lib/mail.js';
import { decryptToken } from './_lib/token.js';

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

/**
 * Gedaechtnis gegen Doppelklicks, nur im Arbeitsspeicher.
 *
 * Mailprogramme und Sicherheitsdienste rufen Links im Text gerne einmal
 * vorab ab; dazu kommt der Mensch, der zweimal klickt. Ohne diese Bremse
 * laegen dann zwei gleiche Lead-Mails im Postfach.
 *
 * Bewusst Best-Effort: eine kalte Instanz weiss von nichts, und mehrere
 * Instanzen wissen nichts voneinander. Ein Duplikat im eigenen Postfach ist
 * ein kleines Aergernis — dafuer eine Datenbank einzufuehren waere teurer als
 * das Problem. Gemerkt wird nur sha256 des Tokens, nicht der Token selbst.
 */
const seen = new Map();
const SEEN_TTL_MS = TOKEN_TTL_MS;
const SEEN_MAX = 500;

function seenKey(token) {
  return createHash('sha256').update(token).digest('hex');
}

function alreadySeen(key, nowMs) {
  for (const [k, t] of seen) {
    if (nowMs - t > SEEN_TTL_MS) seen.delete(k);
  }
  // Notbremse gegen unbegrenztes Wachstum: bei Ueberlauf faellt der aelteste
  // Eintrag. Map behaelt die Einfuegereihenfolge, der erste Schluessel ist
  // also der aelteste.
  while (seen.size >= SEEN_MAX) {
    const oldest = seen.keys().next().value;
    if (oldest === undefined) break;
    seen.delete(oldest);
  }

  if (seen.has(key)) return true;
  seen.set(key, nowMs);
  return false;
}

/** Nur fuer Tests: leert das Doppelklick-Gedaechtnis. */
export function _resetSeen() {
  seen.clear();
}

function redirect(res, target) {
  res.setHeader('Location', target);
  // Ein Bestaetigungsergebnis darf kein Zwischenspeicher festhalten.
  res.setHeader('Cache-Control', 'no-store');
  return res.status(303).end();
}

/**
 * @param {object} req
 * @param {object} res
 * @param {{
 *   sendMail: Function,
 *   now?: () => number,
 *   env?: Record<string, string|undefined>,
 *   log?: (...args:any[]) => void
 * }} deps
 */
export async function handleConfirm(req, res, deps) {
  const {
    sendMail,
    now = () => Date.now(),
    env = process.env,
    log = console.error
  } = deps;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  // req.query gibt es in der Node-Laufzeit von Vercel; der Rueckfallweg ueber
  // die URL macht den Handler ohne diese Laufzeit testbar.
  const fromQuery = req.query && req.query.t;
  let raw = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
  if (raw == null) {
    try {
      raw = new URL(req.url || '/', 'http://localhost').searchParams.get('t');
    } catch {
      raw = null;
    }
  }

  const token = typeof raw === 'string' ? raw.trim() : '';

  // Ein manipulierter, fremder oder abgeschnittener Token faellt hier durch:
  // decryptToken prueft die Pruefsumme von AES-GCM und gibt sonst null.
  const payload = decryptToken(token, env);
  if (!payload || payload.typ !== 'confirm' || !payload.email) {
    return redirect(res, '/warteliste?confirm=invalid');
  }

  const iat = Number(payload.iat);
  const nowMs = now();
  if (!Number.isFinite(iat) || nowMs - iat > TOKEN_TTL_MS) {
    return redirect(res, '/warteliste?confirm=invalid');
  }

  // Der zweite Klick fuehrt auf dieselbe Erfolgsseite, verschickt aber nichts
  // mehr. Fuer die Person sieht es aus wie beim ersten Mal — das ist richtig
  // so, ihre Anmeldung IST ja bestaetigt.
  const key = seenKey(token);
  if (alreadySeen(key, nowMs)) {
    return redirect(res, '/warteliste?confirm=ok');
  }

  try {
    await sendMail({ lead: payload, confirmedAt: nowMs, env });
  } catch (err) {
    // Vormerkung zuruecknehmen: der Versand ist nicht passiert, also darf ein
    // zweiter Klick es erneut versuchen duerfen statt ins Doppelklick-
    // Gedaechtnis zu laufen und faelschlich "erledigt" zu melden.
    seen.delete(key);
    // Auch ein Mailfehler endet auf der Seite und nicht in einer Fehlerseite
    // von Vercel. Der Person hilft die Meldung mehr als ein 500er, und sie
    // kann es ueber das Formular erneut versuchen.
    log('Lead-Mail fehlgeschlagen:', err && err.message);
    return redirect(res, '/warteliste?confirm=invalid');
  }

  return redirect(res, '/warteliste?confirm=ok');
}

export default async function handler(req, res) {
  return handleConfirm(req, res, { sendMail: sendLeadMail });
}
