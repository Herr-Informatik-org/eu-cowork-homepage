// Vorlagen und Versand der beiden Mails, die die Warteliste kennt.
//
//   1. Bestaetigungsmail an den Interessenten, in der Sprache, in der das
//      Formular ausgefuellt wurde (de, en, fr, it, es).
//   2. Lead-Mail an uns, sobald der Link geklickt wurde: immer deutsch, sie
//      geht ins eigene Postfach und nicht nach draussen.
//
// Ton und Aufbau folgen der Website: sachlich, in der Sie-Form, ohne
// Ausrufezeichen und ohne Werbefloskeln. Die Mail beantwortet in dieser
// Reihenfolge die drei Fragen, die jemand beim Oeffnen hat: Wer schreibt mir,
// warum, und was soll ich tun.
//
// Das HTML ist absichtlich altmodisch (Tabelle, Inline-Styles, keine externen
// Stylesheets und keine nachgeladenen Schriften). Mailprogramme verwerfen fast
// alles andere. Der <style>-Block ergaenzt nur; wer ihn verwirft, sieht
// dieselbe Mail, bloss ohne die Anpassung an schmale Bildschirme.
//
// Aussehen: Die Mail traegt dieselben Werte wie eucowork.ai. Farben, Radien
// und die Schriftreihenfolge stammen aus assets/content.css und stehen hier
// ausgeschrieben, weil kein Mailprogramm CSS-Variablen aufloest.
//
// Bilder: Frueher enthielt die Mail bewusst gar keines, weil ein nachgeladenes
// Bild verraet, wann wer die Mail oeffnet. Das Logo liegt deshalb nicht auf
// dem Server, sondern reist als eingebettetes Bild (SMTP2GO-Feld `inlines`,
// im HTML per `cid:` referenziert) in der Nachricht selbst mit. Damit ist die
// Marke sichtbar und es entsteht trotzdem keine einzige Anfrage aus dem
// Postfach heraus: der Datenschutzgrund von damals bleibt gewahrt. Andere
// externe Ressourcen gibt es weiterhin keine.

const SMTP2GO_ENDPOINT = 'https://api.smtp2go.com/v3/email/send';
const DEFAULT_FROM = 'EU Cowork AI <noreply@eucowork.ai>';
const DEFAULT_LEAD_TO = 'info@herr-informatik.ch';

/**
 * Gestaltungswerte, wortgleich aus assets/content.css uebernommen.
 * Die Namen entsprechen den dortigen Tokens, damit eine Aenderung an der
 * Website hier wiederfindbar ist.
 */
const C = {
  bg: '#FAFAF7', // --c-bg, Knochenweiss, Grundflaeche
  surface: '#FFFFFF', // --c-surface, Karte
  ink: '#0B1E33', // --c-ink, Ueberschrift
  deep: '#0B1E33', // --c-deep, Navy: Primaerknopf und dunkle Bloecke
  onDeep: '#F7FAFC', // --c-on-deep, Schrift auf Navy
  body: '#41505E', // --c-body, Fliesstext
  bodySoft: '#5A6472', // --c-body-soft, Nebentext und Kleingedrucktes
  line: '#E7ECF0', // --c-line, Trenner in der Karte
  hairline: '#DDE4EA', // --c-hairline, Kartenkante (--bd)
  link: '#12326B' // --c-eu-700, Europa-Blau: Links, und das AI der Wortmarke
};
// Das Gold der Website (--c-gold-500) taucht hier nicht als Wert auf: es steckt
// im Punkt des Logos und bleibt damit das, was es auf der Website ist, naemlich
// Interpunktion und keine Flaeche.

/** --r-card und --r-control. Die Karte ist rund, der Knopf fast eckig. */
const R_CARD = '12px';
const R_CONTROL = '4px';

/**
 * --f-body aus content.css. Inter ist die Schrift der Website; nachladen
 * koennen wir sie in einer Mail nicht, also bleibt sie ein Wunsch mit
 * vollstaendiger Ersatzkette bis hinunter zu Arial.
 */
const FONT = "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif";

/**
 * Das Logo, erzeugt aus icon.svg und im Repository als
 * assets/eucowork-mail-logo.png abgelegt. Zweimal so gross wie die
 * Darstellung (80 px Bild, 40 px im HTML), damit es auf feinen Bildschirmen
 * nicht ausfranst.
 *
 * Gewaehlt ist die Kachelfassung der Marke und nicht die freistehende
 * Bildmarke der Kopfleiste: die freistehende hat einen durchsichtigen Grund
 * und navyfarbene Linien, die in einem erzwungenen Dunkelmodus im Hintergrund
 * verschwinden wuerden. Die Kachel bringt ihre eigene Flaeche mit und bleibt
 * darum ueberall sichtbar.
 *
 * Die Daten stehen hier als Text und nicht als Dateizugriff, weil eine
 * Serverless-Function nur ihren eigenen Bundle sieht und statische Dateien
 * aus assets/ dort nicht liegen. Neu erzeugen laesst sich das Bild mit sharp:
 *   sharp('icon.svg', { density: 900 }).resize(80, 80).png({ palette: true })
 */
const LOGO_FILENAME = 'eucowork-mail-logo.png';
const LOGO_MIMETYPE = 'image/png';
const LOGO_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAAAh1BMVEVMaXEMHDMKHTIKHTILHTIK' +
  'HTILHjIKHTILHTIAGTYLHjIKHjILHjMLHjP6+vf0xULa3d1rdoL09fIYKTgrPE4QIjfKztBJWGYd' +
  'L0L5+fassreAipPr7Ovk5uU8S1u7wMRtZDlcaXbY29txfIcrNTanjT2MlZ2cpKqUnKPTrD9aZ3S6' +
  'rH7k0JO4c7aWAAAADXRSTlMAJ9F8huP28UAFFrq4ziOMfwAAAAlwSFlzAACKaQAAimkBsWWzMgAA' +
  'Ao1JREFUeNrNmdl6wiAQhVGzVok1MYvGajTaprbv/3wVzAIBQXAueq6q/fI7DDMnZILQoDBw5q6P' +
  'jeS7cycIkUxvjost5TpvAi6cefgFebNRlJMpflHTCcsLfPyy/IDheRhAXk+c+BhEfrvqcIqBNL3v' +
  'zAyDaUbrz4MDeqQeHQwo55ZBFxLohijAoApgV0zWPIcFLpALC3SRDwv0kfk156qqzg//awxMLkui' +
  'SwIETL6Xd30nMMDLstMFBHheDjpDACsGWP0XYJ5lOSSw2EXRrgDM4Wd00yfcLq9jAozXYHX4FVF9' +
  'QXXKPUA2xFsef35/rHt5S2AEuh2+K28fS0vgfkOWS5a92bPbHn0kdsADXS1d94HPam0FzNuSoaWT' +
  'c1l9T22AWXQvarrKbMgq0dECeIy69Jc9Im95Hd8EmJ767Ccf3SpJ0DGbAgPgily24v++0qAp/2AK' +
  'pFedUi7aLmiagr0hkF505fNZtxVDd2lrBmR3tt/xPuhm1I5PAMeJ77f32ldjYwIs4nHeD1y50CYv' +
  'DIB8//Z93QdNP5XPA9exmHXaI1s2YJlFoMe2tVmLPzJ8lz+wCKSwrfG3dRzX/LZLLAIpbEus9WTc' +
  '6cfngDl/p1O0evYcsLMttWqpRSClbalPdlKLQErbUktqEUhtW9pTimARSG1bajWSakUa29IfAxoN' +
  'cGxb+nNAoQaq7hfyjiqVQNG2tCeBXaICiraFtUeBWgGU2RbWnQU4i0B621JKsAgkJjlbmSgeFQXC' +
  'kvuGsZiq4B5vC0seU9w+9wCe7iyBNfMAPucfct4tdGpSZkQAPsQAH7OAD4LAR1XwwzTwcR/8QBJ8' +
  'ZAo/1IUfO8MPxuFH9/AvF9rXHwvz1x8L/vXHH/0CS+6inmbAAAAAAElFTkSuQmCC';

/** Textbausteine je Sprache. Alles Unbekannte faellt auf Deutsch zurueck. */
const COPY = {
  de: {
    subject: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
    preheader: 'Ein Klick, dann steht Ihr Platz auf der Warteliste von EU Cowork AI fest.',
    heading: 'Bitte bestätigen Sie Ihre E-Mail-Adresse',
    intro: 'Sie haben sich auf eucowork.ai für den frühen Zugang zu EU Cowork AI eingetragen: der KI-Plattform für Unternehmen, die in Europa betrieben und in der Schweiz gehostet wird.',
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
    intro: 'You signed up on eucowork.ai for early access to EU Cowork AI: the AI platform for businesses, operated in Europe and hosted in Switzerland.',
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
    intro: 'Vous vous êtes inscrit sur eucowork.ai pour un accès anticipé à EU Cowork AI : la plateforme d’IA pour les entreprises, exploitée en Europe et hébergée en Suisse.',
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
    intro: 'Si è registrato su eucowork.ai per l’accesso anticipato a EU Cowork AI: la piattaforma di IA per le aziende, gestita in Europa e ospitata in Svizzera.',
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
    intro: 'Se ha registrado en eucowork.ai para el acceso anticipado a EU Cowork AI: la plataforma de IA para empresas, operada en Europa y alojada en Suiza.',
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

/** Die Wortmarke, wie sie die Kopfleiste der Website fuehrt. */
const BRAND_MAIN = 'EU Cowork';
const BRAND_AI = 'AI';

/** Auswahlwerte des Formulars in lesbaren Klartext. */
const INTEREST_LABEL = {
  hosted: 'Gehostet in der Schweiz',
  selfhost: 'Self-Hosting',
  both: 'Beides'
};

/** Sprachcodes in Klartext fuer die Lead-Mail, die bleibt deutsch. */
const LANG_LABEL = {
  de: 'Deutsch',
  en: 'Englisch',
  fr: 'Französisch',
  it: 'Italienisch',
  es: 'Spanisch'
};

/** Steht in der Lead-Mail, wo das Formular nichts geliefert hat. */
const NO_VALUE = 'nicht angegeben';

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
  if (!Number.isFinite(n) || n <= 0) return 'unbekannt';
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
 * Der gemeinsame Rahmen beider Mails: Grundflaeche, Logo mit Wortmarke, eine
 * weisse Karte und darunter die Fussnote. Beide Mails bekommen denselben
 * Rahmen, weil beide dieselbe Absenderin haben.
 *
 * `cardRows` sind fertige <tr>-Zeilen der Kartentabelle. So bleibt die Struktur
 * an einer Stelle und nur der Inhalt unterscheidet sich.
 */
function mailShell({ lang, title, preheader, cardRows, footerNote }) {
  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};">${escapeHtml(preheader)}</div>`
    : '';

  const footerHtml = footerNote
    ? `      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr>
          <td class="euc-pad euc-soft" style="padding:18px 28px 0 28px;font-family:${FONT};font-size:12.5px;line-height:1.55;color:${C.bodySoft};background-color:${C.bg};">
            ${escapeHtml(footerNote)}
          </td>
        </tr>
      </table>`
    : '';

  return `<!doctype html>
<html lang="${langCode(lang)}" style="background-color:${C.bg};">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- Die Mail ist hell gebaut. Wo ein Programm die Angabe beachtet, laesst es
     sie hell; wo nicht, greifen die Regeln im Media-Query weiter unten. -->
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(title)}</title>
<style>
  /* Dieser Block ergaenzt nur. Jede Farbe und jeder Abstand steht zusaetzlich
     als Inline-Style an seinem Element; ein Programm, das <style> verwirft,
     bekommt dieselbe Mail, bloss ohne die Anpassung an schmale Fenster. */
  @media only screen and (max-width:620px) {
    .euc-outer { padding:20px 12px !important; }
    .euc-pad { padding-left:20px !important; padding-right:20px !important; }
    .euc-h1 { font-size:21px !important; }
    /* Auf dem Telefon nimmt der Knopf die ganze Breite: er ist dann mit dem
       Daumen sicher zu treffen. */
    .euc-btn { display:block !important; text-align:center !important; }
  }
  /* Erzwingt ein Programm den Dunkelmodus, dreht es helle Flaechen um und
     laesst die Schrift oft stehen. Das Ergebnis waere heller Text auf hellem
     Grund. Darum werden Flaeche und Schrift hier noch einmal gemeinsam
     festgeschrieben, nie nur eines von beidem, und nicht nur auf den Zellen:
     ein solcher Filter faerbt auch das <p> und das <a> darin ein. */
  @media (prefers-color-scheme: dark) {
    html, body { background-color:${C.bg} !important; }
    .euc-page, .euc-page td, .euc-page div, .euc-page p,
    .euc-page span, .euc-page a { background-color:${C.bg} !important; }
    .euc-surface, .euc-surface td, .euc-surface div, .euc-surface p,
    .euc-surface span, .euc-surface a { background-color:${C.surface} !important; }
    .euc-ink { color:${C.ink} !important; }
    .euc-body { color:${C.body} !important; }
    .euc-soft { color:${C.bodySoft} !important; }
    .euc-link { color:${C.link} !important; }
    /* Diese beiden zuletzt: sie sind die Ausnahmen von den Flaechenregeln
       darueber. Der Elementname steht mit davor, damit sie so schwer wiegen
       wie die Regel .euc-surface a; bei gleichem Gewicht gewinnt die
       spaetere Regel. */
    div.euc-rule { background-color:${C.line} !important; }
    a.euc-btn { background-color:${C.deep} !important; color:${C.onDeep} !important; }
  }
</style>
</head>
<body class="euc-page" style="margin:0;padding:0;background-color:${C.bg};color:${C.body};">
<!-- Vorschauzeile: viele Programme zeigen sie neben dem Betreff, sichtbar sein soll sie nicht. -->
${preheaderHtml}
<table role="presentation" class="euc-page" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${C.bg};">
  <tr>
    <td class="euc-outer" align="center" style="padding:32px 16px;background-color:${C.bg};">

      <!-- Kopfzeile wie die Kopfleiste der Website: Bildmarke, daneben die
           Wortmarke als echter Text. Bleibt das Bild blockiert, steht die
           Marke trotzdem lesbar da. -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
        <tr>
          <td class="euc-pad" style="padding:0 28px 18px 28px;background-color:${C.bg};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:0 11px 0 0;background-color:${C.bg};" valign="middle">
                  <!-- Der alt-Text nennt die Marke, weil Vorleseprogramme und
                       Programme mit blockierten Bildern sonst nur ein leeres
                       Kaestchen haetten. Klein gesetzt, damit er das Kaestchen
                       nicht sprengt; lesbar bleibt die Marke ohnehin durch die
                       Wortmarke rechts daneben. -->
                  <img src="cid:${LOGO_FILENAME}" width="40" height="40" alt="EU Cowork AI" style="display:block;width:40px;height:40px;border:0;outline:none;text-decoration:none;border-radius:9px;font-family:${FONT};font-size:9px;line-height:1.1;color:${C.ink};background-color:${C.bg};">
                </td>
                <td class="euc-ink" valign="middle" style="font-family:${FONT};font-size:19px;font-weight:600;letter-spacing:-.010em;line-height:1.2;color:${C.ink};background-color:${C.bg};white-space:nowrap;">
                  ${escapeHtml(BRAND_MAIN)} <span class="euc-link" style="color:${C.link};background-color:${C.bg};">${escapeHtml(BRAND_AI)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table role="presentation" class="euc-surface" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${C.surface};border:1px solid ${C.hairline};border-radius:${R_CARD};border-collapse:separate;">
${cardRows}
      </table>

${footerHtml}
    </td>
  </tr>
</table>
</body>
</html>`;
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
  // Programm zeigen kann. Entsprechend vollstaendig ist sie aufgebaut, und sie
  // nennt die Absenderin gleich in der ersten Zeile.
  const text = [
    BRAND_MAIN + ' ' + BRAND_AI,
    '',
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
    // Zwei Bindestriche trennen die Fussnote ab. Das ist die alte
    // Signaturmarke aus der Mailwelt und kein Gedankenstrich.
    '--',
    t.footerNote
  ].join('\n');

  const cardRows = `        <tr>
          <td class="euc-pad euc-ink euc-h1" style="padding:30px 32px 18px 32px;font-family:${FONT};font-size:24px;line-height:1.28;letter-spacing:-.018em;font-weight:600;color:${C.ink};background-color:${C.surface};">
            ${escapeHtml(t.heading)}
          </td>
        </tr>
        <tr>
          <td class="euc-pad euc-body" style="padding:0 32px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.body};background-color:${C.surface};">
            <p class="euc-body" style="margin:0 0 16px 0;color:${C.body};background-color:${C.surface};">${escapeHtml(t.intro)}</p>
            <p class="euc-body" style="margin:0 0 24px 0;color:${C.body};background-color:${C.surface};">${escapeHtml(t.why)}</p>
          </td>
        </tr>
        <tr>
          <td class="euc-pad euc-btn-cell" style="padding:0 32px 26px 32px;background-color:${C.surface};">
            <a class="euc-btn" href="${urlHtml}" style="display:inline-block;padding:15px 22px;background-color:${C.deep};color:${C.onDeep};font-family:${FONT};font-size:15px;font-weight:600;letter-spacing:-.004em;line-height:1;text-decoration:none;border-radius:${R_CONTROL};">${escapeHtml(t.button)}</a>
          </td>
        </tr>
        <tr>
          <td class="euc-pad euc-soft" style="padding:0 32px 22px 32px;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.bodySoft};background-color:${C.surface};">
            <p class="euc-soft" style="margin:0 0 6px 0;color:${C.bodySoft};background-color:${C.surface};">${escapeHtml(t.fallback)}</p>
            <p class="euc-soft" style="margin:0;word-break:break-all;background-color:${C.surface};"><a class="euc-link" href="${urlHtml}" style="color:${C.link};background-color:${C.surface};text-decoration:underline;">${urlHtml}</a></p>
          </td>
        </tr>
        <tr>
          <td class="euc-pad euc-soft" style="padding:0 32px 24px 32px;font-family:${FONT};font-size:13px;line-height:1.6;color:${C.bodySoft};background-color:${C.surface};">
            <p class="euc-soft" style="margin:0 0 10px 0;color:${C.bodySoft};background-color:${C.surface};">${escapeHtml(t.validity)}</p>
            <p class="euc-soft" style="margin:0;color:${C.bodySoft};background-color:${C.surface};">${escapeHtml(t.ignore)}</p>
          </td>
        </tr>
        <tr>
          <td class="euc-pad" style="padding:0 32px;background-color:${C.surface};">
            <!-- Trenner als Tabellenzelle statt <hr>: Outlook zeichnet ein <hr>
                 in eigener Dicke und eigener Farbe. -->
            <div class="euc-rule" style="height:1px;line-height:1px;font-size:0;background-color:${C.line};">&nbsp;</div>
          </td>
        </tr>
        <tr>
          <td class="euc-pad euc-body" style="padding:20px 32px 28px 32px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.body};background-color:${C.surface};">
            ${escapeHtml(t.signoff)}<br>${escapeHtml(t.team)}
          </td>
        </tr>`;

  const html = mailShell({
    lang,
    title: t.subject,
    preheader: t.preheader,
    cardRows,
    footerNote: t.footerNote
  });

  return { subject: t.subject, text, html };
}

/**
 * Baut die Lead-Mail an das eigene Postfach. Immer deutsch: sie geht an uns,
 * nicht an den Interessenten.
 *
 * Aufbau bewusst als schlichte Liste, denn diese Mail wird ueberflogen und
 * nicht gelesen. Die Reihenfolge folgt dem, was fuer die Nachfass-Entscheidung
 * zaehlt: wer, welche Firma, was will er.
 *
 * @param {{ lead: object, confirmedAt: number }} args
 */
export function buildLeadMail({ lead, confirmedAt }) {
  const email = String(lead.email || '');
  const rows = [
    ['E-Mail', email],
    ['Unternehmen', lead.company || NO_VALUE],
    ['Interesse', INTEREST_LABEL[lead.interest] || NO_VALUE],
    ['Teamgrösse', lead.teamSize || NO_VALUE],
    ['Sprache', LANG_LABEL[langCode(lead.lang)]],
    ['Eintrag', formatTs(lead.iat)],
    ['Bestätigt', formatTs(confirmedAt)]
  ];

  const heading = 'Warteliste: bestätigter Eintrag';
  const subject = `Warteliste: bestätigter Eintrag von ${email}`;
  const lede = 'Ein Eintrag wurde per Klick im Bestätigungsmail belegt.';
  const footerNote = 'Antworten auf diese Mail gehen direkt an den Interessenten.';

  const text = [
    BRAND_MAIN + ' ' + BRAND_AI,
    '',
    heading,
    '',
    lede,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    '--',
    footerNote
  ].join('\n');

  const cardRows = `        <tr>
          <td class="euc-pad euc-ink euc-h1" style="padding:28px 32px 14px 32px;font-family:${FONT};font-size:20px;line-height:1.3;letter-spacing:-.014em;font-weight:600;color:${C.ink};background-color:${C.surface};">
            ${escapeHtml(heading)}
          </td>
        </tr>
        <tr>
          <td class="euc-pad euc-body" style="padding:0 32px 18px 32px;font-family:${FONT};font-size:14.5px;line-height:1.55;color:${C.body};background-color:${C.surface};">
            ${escapeHtml(lede)}
          </td>
        </tr>
        <tr>
          <td class="euc-pad" style="padding:0 32px 26px 32px;background-color:${C.surface};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;font-family:${FONT};font-size:14px;line-height:1.6;">
${rows.map(([label, value]) => `              <tr>
                <td class="euc-soft" style="padding:5px 14px 5px 0;color:${C.bodySoft};vertical-align:top;white-space:nowrap;background-color:${C.surface};">${escapeHtml(label)}</td>
                <td class="euc-ink" style="padding:5px 0;color:${C.ink};background-color:${C.surface};word-break:break-word;">${escapeHtml(value)}</td>
              </tr>`).join('\n')}
            </table>
          </td>
        </tr>`;

  const html = mailShell({
    lang: 'de',
    title: subject,
    preheader: `${lede} ${email}`,
    cardRows,
    footerNote
  });

  return { subject, text, html };
}

/**
 * Verschickt eine fertige Nachricht ueber die HTTP-Schnittstelle von SMTP2GO.
 * Bewusst HTTP und nicht SMTP: eine Serverless-Function hat keine Zeit fuer
 * einen SMTP-Dialog mit mehreren Runden, und wir sparen uns eine weitere
 * Abhaengigkeit.
 *
 * Wirft bei jedem Fehlschlag. Die Meldung ist fuers Log gedacht und darf nie
 * an den Browser durchgereicht werden; der Aufrufer antwortet generisch.
 * Der API-Schluessel steht nur in der Kopfzeile und taucht in keiner Meldung
 * auf, auch nicht in der Fehlermeldung ueber einen fehlenden Schluessel.
 *
 * @param {{ to: string, subject: string, html: string, text: string,
 *           replyTo?: string, fetchImpl?: typeof fetch,
 *           env?: Record<string,string|undefined> }} args
 */
export async function sendMail({ to, subject, html, text, replyTo, fetchImpl = fetch, env = process.env }) {
  const apiKey = env.SMTP2GO_API_KEY;
  if (!apiKey) throw new Error('SMTP2GO_API_KEY fehlt, bitte als Environment-Variable im Vercel-Projekt setzen.');

  const payload = {
    sender: env.MAIL_FROM || DEFAULT_FROM,
    to: [to],
    subject,
    html_body: html,
    text_body: text,
    // Eingebettetes Bild statt Verweis auf den Server. SMTP2GO nimmt es als
    // `inlines` entgegen und macht den Dateinamen zur Content-ID, auf die das
    // HTML mit `cid:` zeigt. Rund 900 Byte, das faellt neben dem HTML nicht
    // ins Gewicht.
    inlines: [{
      filename: LOGO_FILENAME,
      fileblob: LOGO_BASE64,
      mimetype: LOGO_MIMETYPE
    }]
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

  // SMTP2GO liefert HTTP 200 auch dann, wenn im Rumpf Fehler stehen.
  // "Abgeschickt" heisst erst, dass succeeded mindestens 1 ist.
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
