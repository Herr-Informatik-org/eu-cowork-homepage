// Sperrliste oeffentlicher Postfaecher und Wegwerfdienste.
//
// Die Warteliste richtet sich an Betriebe. Eine Adresse bei gmail.com sagt uns
// nichts ueber das Unternehmen dahinter, und Wegwerfdienste machen die
// Bestaetigungsmail sinnlos. Deshalb weisen wir beides freundlich ab statt es
// still zu schlucken — die Person soll die Geschaeftsadresse nachreichen
// koennen.
//
// Die Liste ist bewusst endlich und wird nie vollstaendig sein. Sie deckt die
// grossen internationalen Anbieter, den deutschsprachigen Raum (DE/AT/CH) und
// die gaengigen Wegwerfdienste ab. Erweitern ist billig: eine Zeile mehr.

export const FREEMAIL_DOMAINS = new Set([
  // -- Google -------------------------------------------------------------
  'gmail.com', 'googlemail.com',

  // -- Microsoft ----------------------------------------------------------
  'outlook.com', 'outlook.de', 'outlook.at', 'outlook.ch', 'outlook.fr',
  'outlook.it', 'outlook.es', 'outlook.co.uk', 'outlook.com.br',
  'hotmail.com', 'hotmail.de', 'hotmail.ch', 'hotmail.at', 'hotmail.fr',
  'hotmail.it', 'hotmail.es', 'hotmail.co.uk', 'hotmail.nl', 'hotmail.be',
  'live.com', 'live.de', 'live.ch', 'live.at', 'live.fr', 'live.it',
  'live.nl', 'live.be', 'live.co.uk', 'live.se', 'live.dk',
  'msn.com', 'passport.com', 'windowslive.com',

  // -- Yahoo und Verwandte ------------------------------------------------
  'yahoo.com', 'yahoo.de', 'yahoo.ch', 'yahoo.at', 'yahoo.fr', 'yahoo.it',
  'yahoo.es', 'yahoo.co.uk', 'yahoo.ca', 'yahoo.com.au', 'yahoo.co.jp',
  'yahoo.com.br', 'yahoo.in', 'ymail.com', 'rocketmail.com',
  'aol.com', 'aol.de', 'aim.com',

  // -- Apple --------------------------------------------------------------
  'icloud.com', 'me.com', 'mac.com',

  // -- Deutschsprachiger Raum ---------------------------------------------
  'gmx.ch', 'gmx.de', 'gmx.at', 'gmx.net', 'gmx.com', 'gmx.li', 'gmx.us',
  'web.de', 't-online.de', 'freenet.de', 'arcor.de', 'online.de',
  'unitybox.de', 'kabelmail.de', 'vodafone.de', 'vodafonemail.de',
  '1und1.de', 'email.de', 'gmy.de', 'gmail.de',
  'mailbox.org', 'posteo.de', 'posteo.ch', 'posteo.net',
  'aon.at', 'a1.net', 'chello.at', 'inode.at', 'utanet.at', 'kabsi.at',

  // -- Schweiz ------------------------------------------------------------
  'bluewin.ch', 'bluemail.ch', 'sunrise.ch', 'hispeed.ch', 'greenmail.ch',
  'swissonline.ch', 'gawab.ch', 'quickline.ch', 'netplus.ch', 'vtxmail.ch',
  'sensemail.ch', 'datazug.ch', 'romandie.com', 'span.ch', 'solnet.ch',
  'chmail.ch', 'freesurf.ch', 'tele2.ch',

  // -- Datenschutz-orientierte Anbieter -----------------------------------
  'proton.me', 'protonmail.com', 'protonmail.ch', 'pm.me',
  'tutanota.com', 'tutanota.de', 'tutamail.com', 'tuta.com', 'tuta.io',
  'keemail.me', 'hushmail.com', 'startmail.com', 'runbox.com',
  'countermail.com', 'disroot.org', 'riseup.net', 'systemli.org',
  'autistici.org', 'kolabnow.com', 'mailfence.com', 'ctemplar.com',

  // -- Weitere internationale Anbieter ------------------------------------
  'mail.com', 'email.com', 'usa.com', 'consultant.com', 'europe.com',
  'post.com', 'techie.com', 'writeme.com', 'dr.com', 'engineer.com',
  'iname.com', 'inbox.com', 'inbox.lv', 'inbox.ru',
  'mail.ru', 'bk.ru', 'list.ru', 'internet.ru', 'yandex.ru', 'yandex.com',
  'yandex.ua', 'ya.ru', 'rambler.ru',
  'zoho.com', 'zohomail.com', 'zoho.eu',
  'fastmail.com', 'fastmail.fm', 'sent.com', 'messagingengine.com',
  'gmx.fr', 'laposte.net', 'orange.fr', 'wanadoo.fr', 'free.fr', 'sfr.fr',
  'neuf.fr', 'bbox.fr', 'numericable.fr',
  'libero.it', 'virgilio.it', 'alice.it', 'tin.it', 'tiscali.it', 'inwind.it',
  'terra.com', 'terra.es', 'telefonica.net', 'wanadoo.es',
  'seznam.cz', 'email.cz', 'centrum.cz', 'volny.cz', 'atlas.cz',
  'wp.pl', 'o2.pl', 'onet.pl', 'interia.pl', 'gazeta.pl', 'op.pl',
  'ziggo.nl', 'kpnmail.nl', 'planet.nl', 'home.nl', 'telenet.be', 'skynet.be',
  'btinternet.com', 'sky.com',
  'virginmedia.com', 'talktalk.net', 'ntlworld.com', 'blueyonder.co.uk',
  'comcast.net', 'verizon.net', 'att.net', 'sbcglobal.net', 'cox.net',
  'charter.net', 'earthlink.net', 'juno.com', 'netzero.net', 'optonline.net',
  'rogers.com', 'sympatico.ca', 'shaw.ca', 'telus.net', 'videotron.ca',
  'bigpond.com', 'bigpond.net.au', 'optusnet.com.au', 'iinet.net.au',
  'xtra.co.nz', 'telkomsa.net',
  'qq.com', 'foxmail.com', '163.com', '126.com', 'sina.com', 'sohu.com',
  'naver.com', 'daum.net', 'hanmail.net', 'nate.com',
  'rediffmail.com', 'sify.com', 'indiatimes.com',
  'uol.com.br', 'bol.com.br', 'ig.com.br', 'globo.com', 'terra.com.br',
  'gmx.co.uk', 'lycos.com', 'excite.com', 'mail.bg', 'abv.bg',
  'walla.com', 'walla.co.il', 'nifty.com', 'ocn.ne.jp', 'so-net.ne.jp',

  // -- Wegwerf- und Einmaladressen ----------------------------------------
  'mailinator.com', 'mailinator.net', 'guerrillamail.com', 'guerrillamail.net',
  'guerrillamail.org', 'guerrillamail.biz', 'guerrillamailblock.com',
  'sharklasers.com', 'grr.la', 'spam4.me', 'pokemail.net',
  '10minutemail.com', '10minutemail.net', '20minutemail.com',
  'temp-mail.org', 'temp-mail.io', 'tempmail.com', 'tempmail.net',
  'tempmailo.com', 'tempr.email', 'tmpmail.org', 'minuteinbox.com',
  'throwawaymail.com', 'trashmail.com', 'trashmail.de', 'trashmail.net',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'einrot.com',
  'mailnesia.com', 'mailcatch.com', 'maildrop.cc', 'mailnull.com',
  'dispostable.com', 'discard.email', 'getnada.com', 'nada.email',
  'inboxbear.com', 'emailondeck.com', 'fakeinbox.com', 'fakemail.net',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'jetable.org',
  'moakt.com', 'mohmal.com', 'mytemp.email', 'burnermail.io',
  'anonaddy.com', 'anonaddy.me', 'simplelogin.com', 'simplelogin.io',
  'duck.com', 'spamgourmet.com', 'spambog.com', 'spamex.com',
  'mailsac.com', 'harakirimail.com', 'byom.de', 'dropmail.me',
  'linshiyouxiang.net', 'luxusmail.org', 'vomoto.com', 'zetmail.com',
  'inboxkitten.com', 'mail-temp.com', 'mailpoof.com', 'smailpro.com',
  'tempinbox.com', 'tempemail.net', 'meltmail.com', 'incognitomail.com'
]);

/**
 * Prueft, ob eine Domain zu einem oeffentlichen Postfach oder Wegwerfdienst
 * gehoert. Neben dem genauen Treffer zaehlt auch jede Unterdomain: viele
 * Wegwerfdienste vergeben Adressen wie name@abc.mailinator.com, und
 * "gmail.com.example.org" darf umgekehrt nicht faelschlich anschlagen —
 * deshalb der Vergleich auf das Ende mit vorangestelltem Punkt.
 */
export function isFreemailDomain(domain) {
  const d = String(domain || '').trim().toLowerCase();
  if (!d) return false;
  if (FREEMAIL_DOMAINS.has(d)) return true;

  for (const listed of FREEMAIL_DOMAINS) {
    if (d.endsWith('.' + listed)) return true;
  }
  return false;
}
