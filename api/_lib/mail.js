// Vorlagen und Versand der beiden Mails, die die Warteliste kennt.
//
//   1. Bestaetigungsmail an den Interessenten — in der Sprache, in der das
//      Formular ausgefuellt wurde (de, en, fr, it, es).
//   2. Lead-Mail an uns, sobald der Link geklickt wurde — immer deutsch, sie
//      geht ins eigene Postfach und nicht nach draussen.
//
// Ton und Aufbau folgen der Website: sachlich, in der Sie-Form, ohne
// Ausrufezeichen und ohne Werbefloskeln. Die Mail beantwortet in dieser
// Reihenfolge die drei Fragen, die jemand beim Oeffnen hat: Wer schreibt mir,
// warum, und was soll ich tun.
//
// Das HTML ist absichtlich altmodisch (Tabelle, Inline-Styles, keine externen
// Bilder oder Schriften). Mailprogramme verwerfen fast alles andere, und ohne
// externe Ressourcen gibt es keine Nachladeanfragen aus dem Postfach heraus —
// also auch kein stilles Mitlesen, wann wer die Mail oeffnet.

const SMTP2GO_ENDPOINT = 'https://api.smtp2go.com/v3/email/send';
const DEFAULT_FROM = 'EU Cowork AI <noreply@eucowork.ai>';
const DEFAULT_LEAD_TO = 'info@herr-informatik.ch';

/** Textbausteine je Sprache. Alles Unbekannte faellt auf Deutsch zurueck. */
const COPY = {
  de: {
    subject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
    preheader: 'Ein Klick, dann steht Ihr Platz auf der Warteliste von EU Cowork AI fest.',
    heading: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
    intro: 'Sie haben sich auf eucowork.ai für den frühen Zugang zu EU Cowork AI eingetragen — der KI-Plattform für Unternehmen, die in Europa betrieben und in der Schweiz gehostet wird.',
    why: 'Damit wir sicher sind, dass diese Adresse wirklich Ihnen gehört, bestätigen Sie bitte einmal kurz:',
    button: 'E-Mail-Adresse bestätigen',
    fallback: 'Falls der Knopf nicht funktioniert, öffnen Sie diese Adresse im Browser:',
    validity: 'Der Link gilt 48 Stunden. Danach tragen Sie sich einfach erneut ein.',
    ignore: 'Falls Sie sich nicht eingetragen haben, ignorieren Sie diese E-Mail. Ohne Bestätigung wird Ihre Adresse nicht weiter verwendet.',
    signoff: 'Freundliche Grüsse',
    team: 'Ihr Team von EU Cowork AI',
    footerNote: 'Diese Nachricht wurde automatisch versendet, weil auf eucowork.ai eine Anmeldung mit dieser Adresse erfolgt ist.'
  },
  en: {
    subject: 'Please confirm your email address',
    preheader: 'One click and your spot on the EU Cowork AI waiting list is set.',
    heading: 'Please confirm your email address',
    intro: 'You signed up on eucowork.ai for early access to EU Cowork AI — the AI platform for businesses, operated in Europe and hosted in Switzerland.',
    why: 'To make sure this address really belongs to you, please confirm once:',
    button: 'Confirm email address',
    fallback: 'If the button does not work, open this address in your browser:',
    validity: 'The link is valid for 48 hours. After that, simply sign up again.',
    ignore: 'If you did not sign up, please ignore this email. Without confirmation your address will not be used any further.',
    signoff: 'Kind regards',
    team: 'The EU Cowork AI team',
    footerNote: 'This message was sent automatically because someone signed up on eucowork.ai using this address.'
  },
  fr: {
    subject: 'Veuillez confirmer votre adresse e-mail',
    preheader: 'Un clic et votre place sur la liste d’attente d’EU Cowork AI est assurée.',
    heading: 'Veuillez confirmer votre adresse e-mail',
    intro: 'Vous vous êtes inscrit sur eucowork.ai pour un accès anticipé à EU Cowork AI — la plateforme d’IA pour les entreprises, exploitée en Europe et hébergée en Suisse.',
    why: 'Afin que nous soyons certains que cette adresse vous appartient réellement, veuillez la confirmer une fois :',
    button: 'Confirmer l’adresse e-mail',
    fallback: 'Si le bouton ne fonctionne pas, ouvrez cette adresse dans votre navigateur :',
    validity: 'Le lien est valable 48 heures. Passé ce délai, il vous suffit de vous inscrire à nouveau.',
    ignore: 'Si vous n’êtes pas à l’origine de cette inscription, ignorez cet e-mail. Sans confirmation, votre adresse ne sera pas utilisée davantage.',
    signoff: 'Cordialement',
    team: 'Votre équipe EU Cowork AI',
    footerNote: 'Ce message a été envoyé automatiquement parce qu’une inscription avec cette adresse a été effectuée sur eucowork.ai.'
  },
  it: {
    subject: 'La preghiamo di confermare il Suo indirizzo e-mail',
    preheader: 'Un clic e il Suo posto nella lista d’attesa di EU Cowork AI è assicurato.',
    heading: 'La preghiamo di confermare il Suo indirizzo e-mail',
    intro: 'Si è registrato su eucowork.ai per l’accesso anticipato a EU Cowork AI — la piattaforma di IA per le aziende, gestita in Europa e ospitata in Svizzera.',
    why: 'Per essere certi che questo indirizzo appartenga davvero a Lei, La preghiamo di confermarlo una volta:',
    button: 'Conferma indirizzo e-mail',
    fallback: 'Se il pulsante non funziona, apra questo indirizzo nel Suo browser:',
    validity: 'Il link è valido 48 ore. Trascorso questo termine, è sufficiente registrarsi di nuovo.',
    ignore: 'Se non si è registrato, ignori questa e-mail. Senza conferma il Suo indirizzo non verrà utilizzato oltre.',
    signoff: 'Cordiali saluti',
    team: 'Il Suo team di EU Cowork AI',
    footerNote: 'Questo messaggio è stato inviato automaticamente perché su eucowork.ai è stata effettuata una registrazione con questo indirizzo.'
  },
  es: {
    subject: 'Confirme su dirección de correo electrónico',
    preheader: 'Un clic y su lugar en la lista de espera de EU Cowork AI queda asegurado.',
    heading: 'Confirme su dirección de correo electrónico',
    intro: 'Se ha registrado en eucowork.ai para el acceso anticipado a EU Cowork AI — la plataforma de IA para empresas, operada en Europa y alojada en Suiza.',
    why: 'Para asegurarnos de que esta dirección le pertenece realmente, confírmela una vez:',
    button: 'Confirmar dirección de correo electrónico',
    fallback: 'Si el botón no funciona, abra esta dirección en su navegador:',
    validity: 'El enlace es válido durante 48 horas. Transcurrido ese plazo, basta con registrarse de nuevo.',
    ignore: 'Si no se ha registrado, ignore este correo electrónico. Sin confirmación, su dirección no se utilizará más.',
    signoff: 'Atentamente',
    team: 'Su equipo de EU Cowork AI',
    footerNote: 'Este mensaje se ha enviado automáticamente porque en eucowork.ai se ha realizado un registro con esta dirección.'
  }
};

/** Standardsprache, sobald etwas Unbekanntes hereinkommt. */
const FALLBACK_LANG = 'de';

/** Auswahlwerte des Formulars in lesbaren Klartext. */
const INTEREST_LABEL = {
  hosted: 'Gehostet in der Schweiz',
  selfhost: 'Self-Hosting',
  both: 'Beides'
};

/** Sprachcodes in Klartext fuer die Lead-Mail — die bleibt deutsch. */
const LANG_LABEL = {
  de: 'Deutsch',
  en: 'Englisch',
  fr: 'Französisch',
  it: 'Italienisch',
  es: 'Spanisch'
};

/** Nur diese fuenf Zeichen koennen HTML-Struktur kaputt machen oder erzeugen. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Normiert einen Sprachwunsch auf einen Code, den wir wirklich haben.
 * Der eigene Schluesseltest statt `COPY[lang]`: sonst gaebe ein Wert wie
 * 'constructor' etwas Wahrheitswertiges vom Prototyp zurueck.
 */
function langCode(lang) {
  const key = typeof lang === 'string' ? lang.toLowerCase() : '';
  return Object.prototype.hasOwnProperty.call(COPY, key) ? key : FALLBACK_LANG;
}

/** Liefert die Textbausteine zur gewuenschten Sprache. */
export function copyForLang(lang) {
  return COPY[langCode(lang)];
}

/**
 * Zeitstempel als Schweizer Datum mit Uhrzeit, fest in Europe/Zurich.
 * Serverless-Instanzen laufen in UTC; ohne feste Zone stuende in der Lead-Mail
 * eine Uhrzeit, die niemand im Buero wiedererkennt.
 */
function formatTs(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return '–';
  try {
    const s = new Intl.DateTimeFormat('de-CH', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Zurich'
    }).format(new Date(n));
    return s + ' (Europe/Zurich)';
  } catch {
    return new Date(n).toISOString();
  }
}

/**
 * Baut Betreff, Text- und HTML-Fassung der Bestaetigungsmail.
 * @param {{ lang?: string, confirmUrl: string }} args
 */
export function buildConfirmationMail({ lang, confirmUrl }) {
  const t = copyForLang(lang);
  const url = String(confirmUrl);
  const urlHtml = escapeHtml(url);

  // Die Textfassung ist keine Notloesung, sondern die Fassung, die jedes
  // Programm zeigen kann — entsprechend vollstaendig ist sie aufgebaut.
  const text = [
    t.heading,
    '',
    t.intro,
    '',
    t.why,
    url,
    '',
    t.validity,
    '',
    t.ignore,
    '',
    t.signoff,
    t.team,
    '',
    '— ' + t.footerNote
  ].join('\n');

  const html = `<!doctype html>
<html lang="${langCode(lang)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(t.subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f4f1;">
<!-- Vorschauzeile: viele Programme zeigen sie neben dem Betreff, sichtbar sein soll sie nicht. -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(t.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f4f1;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e2dc;border-radius:8px;">
        <tr>
          <td style="padding:28px 32px 8px 32px;font-family:Helvetica,Arial,sans-serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b6560;">
            EU Cowork AI
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 20px 32px;font-family:Helvetica,Arial,sans-serif;font-size:21px;line-height:1.35;font-weight:600;color:#1c1a18;">
            ${escapeHtml(t.heading)}
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a3531;">
            <p style="margin:0 0 16px 0;">${escapeHtml(t.intro)}</p>
            <p style="margin:0 0 24px 0;">${escapeHtml(t.why)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px 32px;">
            <a href="${urlHtml}" style="display:inline-block;padding:13px 24px;background:#1c1a18;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">${escapeHtml(t.button)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px 32px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#6b6560;">
            <p style="margin:0 0 6px 0;">${escapeHtml(t.fallback)}</p>
            <p style="margin:0;word-break:break-all;"><a href="${urlHtml}" style="color:#3a3531;">${urlHtml}</a></p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 24px 32px;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#6b6560;">
            <p style="margin:0 0 10px 0;">${escapeHtml(t.validity)}</p>
            <p style="margin:0;">${escapeHtml(t.ignore)}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 28px 32px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#3a3531;border-top:1px solid #e5e2dc;padding-top:20px;">
            ${escapeHtml(t.signoff)}<br>${escapeHtml(t.team)}
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td style="padding:16px 32px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.5;color:#8a837c;">
            ${escapeHtml(t.footerNote)}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject: t.subject, text, html };
}

/**
 * Baut die Lead-Mail an das eigene Postfach. Immer deutsch: sie geht an uns,
 * nicht an den Interessenten.
 *
 * Aufbau bewusst als schlichte Liste — diese Mail wird ueberflogen, nicht
 * gelesen. Die Reihenfolge folgt dem, was fuer die Nachfass-Entscheidung
 * zaehlt: wer, welche Firma, was will er.
 *
 * @param {{ lead: object, confirmedAt: number }} args
 */
export function buildLeadMail({ lead, confirmedAt }) {
  const email = String(lead.email || '');
  const rows = [
    ['E-Mail', email],
    ['Unternehmen', lead.company || '–'],
    ['Interesse', INTEREST_LABEL[lead.interest] || '–'],
    ['Teamgrösse', lead.teamSize || '–'],
    ['Sprache', LANG_LABEL[langCode(lead.lang)]],
    ['Eintrag', formatTs(lead.iat)],
    ['Bestätigt', formatTs(confirmedAt)]
  ];

  const subject = `Warteliste: bestätigter Eintrag – ${email}`;

  const text = [
    'Ein Eintrag auf der Warteliste wurde per Klick im Bestätigungsmail belegt.',
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Antworten auf diese Mail gehen direkt an den Interessenten.'
  ].join('\n');

  const html = `<!doctype html>
<html lang="de">
<head><meta charset="utf-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background:#f5f4f1;font-family:Helvetica,Arial,sans-serif;color:#1c1a18;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e2dc;border-radius:8px;">
  <tr>
    <td style="padding:24px 28px 12px 28px;font-size:16px;font-weight:600;">
      Warteliste: bestätigter Eintrag
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 16px 28px;font-size:14px;line-height:1.6;color:#3a3531;">
      Ein Eintrag wurde per Klick im Bestätigungsmail belegt.
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 20px 28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;font-size:14px;line-height:1.6;">
${rows.map(([label, value]) => `        <tr>
          <td style="padding:4px 12px 4px 0;color:#6b6560;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:4px 0;color:#1c1a18;">${escapeHtml(value)}</td>
        </tr>`).join('\n')}
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0 28px 24px 28px;font-size:12px;line-height:1.5;color:#8a837c;border-top:1px solid #e5e2dc;padding-top:16px;">
      Antworten auf diese Mail gehen direkt an den Interessenten.
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}

/**
 * Verschickt eine fertige Nachricht ueber die HTTP-Schnittstelle von SMTP2GO.
 * Bewusst HTTP und nicht SMTP: eine Serverless-Function hat keine Zeit fuer
 * einen SMTP-Dialog mit mehreren Runden, und wir sparen uns eine weitere
 * Abhaengigkeit.
 *
 * Wirft bei jedem Fehlschlag. Die Meldung ist fuers Log gedacht und darf nie
 * an den Browser durchgereicht werden — der Aufrufer antwortet generisch.
 * Der API-Schluessel steht nur in der Kopfzeile und taucht in keiner Meldung
 * auf, auch nicht in der Fehlermeldung ueber einen fehlenden Schluessel.
 *
 * @param {{ to: string, subject: string, html: string, text: string,
 *           replyTo?: string, fetchImpl?: typeof fetch,
 *           env?: Record<string,string|undefined> }} args
 */
export async function sendMail({ to, subject, html, text, replyTo, fetchImpl = fetch, env = process.env }) {
  const apiKey = env.SMTP2GO_API_KEY;
  if (!apiKey) throw new Error('SMTP2GO_API_KEY fehlt — bitte als Environment-Variable im Vercel-Projekt setzen.');

  const payload = {
    sender: env.MAIL_FROM || DEFAULT_FROM,
    to: [to],
    subject,
    html_body: html,
    text_body: text
  };

  // Reply-To setzt SMTP2GO ueber die freien Kopfzeilen. Damit landet eine
  // Antwort auf die Lead-Mail beim Interessenten und nicht beim Absender
  // noreply@, aus dem niemand etwas zurueckbekommt.
  if (replyTo) {
    payload.custom_headers = [{ header: 'Reply-To', value: replyTo }];
  }

  const response = await fetchImpl(SMTP2GO_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    // Den Text lesen wir nur fuers Log; er landet nie in einer Antwort an den
    // Browser, damit keine Interna nach aussen dringen.
    const detail = await response.text().catch(() => '');
    throw new Error(`SMTP2GO antwortete mit ${response.status}: ${detail.slice(0, 300)}`);
  }

  // SMTP2GO liefert HTTP 200 auch dann, wenn im Rumpf Fehler stehen —
  // "abgeschickt" heisst erst, dass succeeded mindestens 1 ist.
  const body = await response.json().catch(() => null);
  const succeeded = body && body.data && Number(body.data.succeeded);
  if (!succeeded) {
    throw new Error('SMTP2GO hat die Nachricht nicht angenommen: ' + JSON.stringify(body).slice(0, 300));
  }

  return true;
}

/**
 * Bestaetigungsmail an den Interessenten.
 * @param {{ to: string, lang?: string, confirmUrl: string,
 *           fetchImpl?: typeof fetch, env?: Record<string,string|undefined> }} args
 */
export async function sendConfirmationMail({ to, lang, confirmUrl, fetchImpl = fetch, env = process.env }) {
  const { subject, text, html } = buildConfirmationMail({ lang, confirmUrl });
  return sendMail({ to, subject, html, text, fetchImpl, env });
}

/**
 * Lead-Mail an das eigene Postfach, nach bestaetigtem Klick.
 * @param {{ lead: object, confirmedAt: number,
 *           fetchImpl?: typeof fetch, env?: Record<string,string|undefined> }} args
 */
export async function sendLeadMail({ lead, confirmedAt, fetchImpl = fetch, env = process.env }) {
  const { subject, text, html } = buildLeadMail({ lead, confirmedAt });
  return sendMail({
    to: env.LEAD_TO || DEFAULT_LEAD_TO,
    subject,
    html,
    text,
    replyTo: String(lead.email || ''),
    fetchImpl,
    env
  });
}
