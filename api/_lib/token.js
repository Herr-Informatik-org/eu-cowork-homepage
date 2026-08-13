// Verschluesselte Tokens — der Ersatz fuer eine Datenbank.
//
// Die Warteliste speichert nichts. Was zwischen dem Absenden des Formulars und
// dem Klick im Bestaetigungsmail erhalten bleiben muss, reist deshalb im Link
// selbst mit: die Formulardaten stecken verschluesselt in der Adresse, die wir
// dem Interessenten schicken. Beim Klick packen wir sie wieder aus.
//
// Verschluesselt und nicht bloss signiert, weil in der Nutzlast eine
// E-Mail-Adresse und ein Firmenname stehen. Beides soll nicht in Browser-
// Verlaeufen, Proxy-Protokollen oder Referrer-Kopfzeilen lesbar liegen.
//
// AES-256-GCM ist hier genau richtig: es verschluesselt und beglaubigt in
// einem Zug. Ein veraenderter Token faellt beim Entschluesseln durch die
// Pruefsumme, wir brauchen also keine zweite Signatur und keinen zeitgleichen
// Vergleich von Hand — den erledigt GCM intern.

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

// Empfohlene Groessen fuer GCM: 96-Bit-Nonce, 128-Bit-Pruefsumme.
const IV_BYTES = 12;
const TAG_BYTES = 16;

// Obergrenze fuer Eingaben aus dem Netz. Ein echter Token liegt bei rund 200
// Zeichen; alles jenseits davon ist kein Versehen, sondern ein Versuch. Wir
// weisen es ab, bevor Rechenzeit hineinfliesst.
const MAX_TOKEN_CHARS = 4096;

let cachedKey = null;
let cachedSecret = null;

/**
 * Leitet den 256-Bit-Schluessel aus TOKEN_SECRET ab.
 *
 * sha256 ueber das Geheimnis, nicht das Geheimnis selbst: so darf TOKEN_SECRET
 * beliebig lang oder kurz sein und ist trotzdem immer exakt die Schluessel-
 * laenge, die AES-256 verlangt. Das Ergebnis wird gemerkt, damit nicht jeder
 * Aufruf neu hasht — der Wert aendert sich waehrend einer Instanz nicht.
 */
function keyFrom(env) {
  const secret = env.TOKEN_SECRET;
  if (!secret) throw new Error('TOKEN_SECRET fehlt — bitte als Environment-Variable im Vercel-Projekt setzen.');

  if (cachedKey && cachedSecret === secret) return cachedKey;

  cachedKey = createHash('sha256').update(String(secret)).digest();
  cachedSecret = secret;
  return cachedKey;
}

/**
 * Packt ein Objekt in einen Token: base64url(iv | Geheimtext | Pruefsumme).
 *
 * base64url statt base64, weil der Token in eine URL wandert — '+' und '/'
 * muessten sonst noch einmal maskiert werden.
 *
 * @param {object} payload Beliebiges JSON-taugliches Objekt, mit Feld `typ`.
 * @param {Record<string, string|undefined>} [env]
 * @returns {string}
 */
export function encryptToken(payload, env = process.env) {
  const key = keyFrom(env);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, ciphertext, tag]).toString('base64url');
}

/**
 * Packt einen Token wieder aus.
 *
 * Gibt bei JEDEM Fehler null zurueck und wirft nie: ob der Token fehlt, falsch
 * kodiert, zu kurz, veraendert oder mit einem anderen Geheimnis erzeugt wurde,
 * ist fuer den Aufrufer dieselbe Lage — "damit kann ich nichts anfangen". Eine
 * feinere Unterscheidung waere nur ein Hinweis fuer den, der herumprobiert.
 *
 * Ein Zeitkanal ist hier kein Thema: die Echtheit prueft GCM ueber die
 * Pruefsumme, und ein Angreifer erfaehrt aus der Dauer nichts, was ihm beim
 * Raten des 256-Bit-Schluessels helfen wuerde.
 *
 * @param {unknown} token
 * @param {Record<string, string|undefined>} [env]
 * @returns {object|null}
 */
export function decryptToken(token, env = process.env) {
  if (typeof token !== 'string') return null;
  const raw = token.trim();
  if (!raw || raw.length > MAX_TOKEN_CHARS) return null;

  try {
    const buf = Buffer.from(raw, 'base64url');
    // Ohne Nutzlast waeren es genau IV + Pruefsumme; kuerzer kann kein
    // echter Token sein, und ein leerer Geheimtext truege nichts.
    if (buf.length <= IV_BYTES + TAG_BYTES) return null;

    const iv = buf.subarray(0, IV_BYTES);
    const ciphertext = buf.subarray(IV_BYTES, buf.length - TAG_BYTES);
    const tag = buf.subarray(buf.length - TAG_BYTES);

    const decipher = createDecipheriv('aes-256-gcm', keyFrom(env), iv);
    decipher.setAuthTag(tag);
    // final() wirft, wenn die Pruefsumme nicht passt — genau dort faellt
    // jeder manipulierte Token durch.
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');

    const parsed = JSON.parse(plaintext);
    // Nur echte Objekte gelten. Ein Array oder eine blanke Zahl waere zwar
    // gueltiges JSON, aber keine Nutzlast, die wir je erzeugt haben.
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

/** Zufallshex fuer die Einmalnummer im Challenge-Token. */
export function randomHex(bytes = 8) {
  return randomBytes(bytes).toString('hex');
}
