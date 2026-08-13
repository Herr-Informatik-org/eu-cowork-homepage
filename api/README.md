# Serverless-Functions der Warteliste

Drei Endpunkte, keine Datenbank, kein Zustand. Die Website bleibt statisch;
Vercel baut nichts, es liegen lediglich diese Funktionen daneben.

## Ablauf

```
Formular laedt      →  GET  /api/challenge   →  { c: <Token> }
Formular sendet     →  POST /api/waitlist    →  Bestaetigungsmail an den Interessenten
Interessent klickt  →  GET  /api/confirm?t=… →  Lead-Mail an LEAD_TO, dann 303 auf /warteliste
```

Der Kniff steckt im Token. Was normalerweise zwischen Absenden und Klick in
einer Datenbankzeile liegen wuerde — Adresse, Firma, Interesse, Teamgroesse,
Sprache, Zeitpunkt — reist stattdessen **verschluesselt im Bestaetigungslink**
mit (AES-256-GCM, Schluessel aus `TOKEN_SECRET`). `/api/confirm` packt es
wieder aus und verschickt daraus die Lead-Mail.

Zwei Eigenschaften fallen dabei ab:

- **Es wird nichts gespeichert.** Kein Datenbanktisch, keine Adressliste, die
  irgendwann abhandenkommen kann. Wer den Eintrag nie bestaetigt, hinterlaesst
  nirgends eine Spur.
- **Nur Bestaetigtes erreicht das Postfach.** Die Lead-Mail entsteht erst durch
  den Klick, nicht durch das Absenden.

Verschluesselt und nicht bloss signiert, weil im Token eine E-Mail-Adresse und
ein Firmenname stehen — beides soll nicht in Browser-Verlaeufen oder
Proxy-Protokollen lesbar liegen. AES-GCM beglaubigt zugleich: ein veraenderter
Token faellt beim Entschluesseln durch und fuehrt auf `?confirm=invalid`.

## Endpunkte

### `GET /api/challenge`

Liefert `{ c: "<Token>" }`, einen verschluesselten Zeitstempel, und setzt
`Cache-Control: no-store`. Das Formular holt ihn beim Aufbau der Seite und
schickt ihn beim Absenden unveraendert wieder mit. Daraus liest der Server ab,
wie lange das Ausfuellen gedauert hat — eine Zahl aus dem Browser waere
faelschbar, dieser Token nicht.

### `POST /api/waitlist`

Rumpf: `{ email, company, interest, teamSize, lang, hp, challenge }`.

| Antwort | Bedeutung |
| --- | --- |
| `200 {ok:true}` | Bestaetigungsmail ist unterwegs — **oder** eine Bot-Pruefung hat still gegriffen (Fangfeld gefuellt, Formular in unter 2 s abgeschickt). Nach aussen ununterscheidbar; ein Bot soll nicht lernen, woran er scheitert. |
| `400 {error:'invalid_input'}` | Rumpf kaputt oder zu gross, unerlaubter Wert in `interest`/`teamSize`, oder `challenge` fehlt bzw. ist unbrauchbar. |
| `400 {error:'expired'}` | Challenge aelter als 6 h — die Seite lag lange offen. Das Formular bittet ums Neuladen. |
| `400 {error:'invalid_email'}` | Schreibweise unplausibel, oder die Domain hat keinen Mailserver (MX). |
| `400 {error:'free_email'}` | Oeffentliches Postfach oder Wegwerfdienst, siehe `_lib/freemail.js`. |
| `429 {error:'rate_limited'}` | Mehr als 5 Versuche pro Stunde und IP. |
| `405 {error:'method_not_allowed'}` | Alles ausser POST. |
| `500 {error:'mail_failed'}` | SMTP2GO hat die Mail nicht angenommen. |

Die Pruefungen laufen in dieser Reihenfolge: Rumpf und Felder → Fangfeld →
Challenge-Alter → Rate-Begrenzung → Adresse → Freemail → MX → Versand.

Der MX-Test bricht nach 3 s ab und **laesst dann durch**: ein wackliger
Resolver darf keine echte Anmeldung kosten.

### `GET /api/confirm?t=<Token>`

Entschluesselt den Token, prueft Typ und Alter (48 h ab `iat`), verschickt die
Lead-Mail an `LEAD_TO` und leitet mit **303** weiter:

- `/warteliste?confirm=ok` — bestaetigt
- `/warteliste?confirm=invalid` — Token unbrauchbar, abgelaufen, oder der
  Mailversand ist gescheitert

Die Lead-Mail traegt `Reply-To` auf die Adresse des Interessenten; eine Antwort
darauf geht also direkt an ihn.

Ein zweiter Klick auf denselben Link fuehrt ebenfalls auf `?confirm=ok`,
verschickt aber nichts mehr — ein kleines Gedaechtnis im Arbeitsspeicher haelt
die zuletzt gesehenen Token-Abdruecke fest. Das ist Best-Effort: eine kalte
Instanz weiss von nichts. Ein gelegentliches Duplikat im eigenen Postfach ist
der bewusst gewaehlte Preis dafuer, keine Datenbank zu betreiben.

## Environment-Variablen

Alle gehoeren ins Vercel-Projekt, keine davon ins Repository:

```bash
vercel env add SMTP2GO_API_KEY production
vercel env add TOKEN_SECRET production
vercel env add SITE_URL production      # optional
vercel env add MAIL_FROM production     # optional
vercel env add LEAD_TO production       # optional
```

| Variable | Pflicht | Vorgabe | Bedeutung |
| --- | --- | --- | --- |
| `SMTP2GO_API_KEY` | ja | — | API-Schluessel aus dem SMTP2GO-Konto. Steht nur in der Kopfzeile der Anfrage und taucht in keiner Antwort und keinem Log auf. |
| `TOKEN_SECRET` | ja | — | Basis des Schluessels fuer die Tokens (`sha256` davon ergibt die 256 Bit fuer AES). Erzeugen mit `openssl rand -hex 32`. Wird er geaendert, werden alle noch offenen Bestaetigungslinks ungueltig — mehr passiert nicht. |
| `SITE_URL` | nein | `https://eucowork.ai` | Grundadresse fuer den Bestaetigungslink. Fuer eine Vorschau-Umgebung setzen, sonst zeigt der Link aus der Testmail auf die Produktion. |
| `MAIL_FROM` | nein | `EU Cowork AI <noreply@eucowork.ai>` | Absender beider Mails. |
| `LEAD_TO` | nein | `info@herr-informatik.ch` | Empfaenger der Lead-Mail. |

Wer dieselben Werte auch fuer Vorschau-Deployments braucht, wiederholt die
Befehle mit `preview` statt `production`.

## SMTP2GO einrichten

1. **API-Schluessel** unter *Settings → API Keys* anlegen und die Berechtigung
   auf **"Email Send"** beschraenken. Ein Schluessel, der nur senden darf,
   richtet bei einem Leck deutlich weniger Schaden an als ein
   Vollzugriffs-Schluessel.
2. **Sender-Domain `eucowork.ai` verifizieren** (*Settings → Sender Domains*)
   und die genannten **SPF- und DKIM-Eintraege** im DNS setzen. Ohne diese
   Eintraege landen beide Mails zuverlaessig im Spam — und eine
   Bestaetigungsmail im Spam ist eine verlorene Anmeldung.

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `challenge.js` | Ausgabe des Zeitstempel-Tokens |
| `waitlist.js` | Formularannahme, Bot- und Adresspruefungen, Bestaetigungsmail |
| `confirm.js` | Einloesen des Links, Lead-Mail, Weiterleitung |
| `_lib/token.js` | Ver- und Entschluesseln der Tokens |
| `_lib/mail.js` | Beide Mailvorlagen (DE/EN) und der Versand ueber SMTP2GO |
| `_lib/freemail.js` | Sperrliste oeffentlicher Postfaecher und Wegwerfdienste |

Dateien unter `_lib/` beginnen mit einem Unterstrich und werden von Vercel
darum nicht als eigene Endpunkte veroeffentlicht.

Alle drei Endpunkte trennen Ablauf und Abhaengigkeiten: die Kernlogik liegt in
`handleChallenge` / `handleWaitlist` / `handleConfirm`, die Mailversand, DNS
und Uhr als Parameter entgegennehmen. Der Default-Export bindet die echten an.
So laesst sich der Ablauf pruefen, ohne eine einzige Mail zu verschicken.
