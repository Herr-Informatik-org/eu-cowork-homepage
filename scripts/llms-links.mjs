/* Handgeschriebene Linkbeschreibungen fuer die deutsche llms.txt.

   Warum nicht einfach die SEO-Beschreibungen aus assets/seo-meta-*.json:
   diese hier nennen die Belege beim Namen (Aktenzeichen, Datum der Note,
   Fassung des Protokolls) und sind damit fuer ein Sprachmodell brauchbarer
   als eine Beschreibung, die fuer die Trefferliste einer Suchmaschine
   geschrieben wurde. Fehlt hier ein Eintrag, faellt build-llms.mjs auf die
   SEO-Beschreibung zurueck; so ist es fuer en, fr, it und es heute. */
export const LINKS = {
  de: {
    'landing': { titel: 'Startseite', text: 'Produktübersicht, Funktionen, Governance, Anbindungen, Vergleich, FAQ.' },
    'preise': { titel: 'Preise', text: 'zwei Wege, ein Produkt. Selbstbetrieb dauerhaft gratis mit dem vollen Funktionsumfang inklusive aller Enterprise-Bausteine; betreuter Betrieb 15 EUR pro Person und Monat, in der Schweiz 14 CHF, inklusive Modell-Guthaben, für die Testphase kostenlos mit einmaligem Startguthaben von 55 EUR beziehungsweise 50 CHF. Support fuer eigene Installationen separat buchbar.' },
    'blog': { titel: 'Blog', text: 'sechzehn Artikel für die Schweiz und Europa mit konkreten KI-Anwendungsfällen, Konnektoren zur Branchensoftware und Branchen-FAQ, dazu Notizen aus dem Betrieb.' },
    'blog-ch-daten': { titel: 'Der Bund zieht eine Linie durch seinen Datenbestand', text: 'EDÖB-Taetigkeitsbericht 2025/2026 zu kommerziellen Sprachmodellen als Datensicherheitsrisiko, privatim-Resolution mit kundeneigenen Schluesseln, Selbstbetrieb als einziger Weg dorthin; offengelegt wird, dass im betreuten Betrieb die einzelne Anfrage ueber Amazon Bedrock an ein kommerzielles Modell geht und der CLOUD Act greift; Oesterreich mit NISG 2026.' },
    'blog-fristen': { titel: 'Der 2. Dezember 2026 und der 12. Januar 2027', text: 'zwei uebersehene Fristen aus der geaenderten KI-Verordnung (EU) 2026/1744 und dem Data Act; Anbieter- gegen Betreiberpflichten in Artikel 50 getrennt; Wechselentgelte nach Artikel 29, Ankuendigungsfrist nach Artikel 25 Absatz 2 Buchstabe d; der OVHcloud-Fall in Ontario ist offen.' },
    'blog-agenten': { titel: 'Handelnde KI und wer die Werkzeuge kontrolliert', text: 'CNIL-Note zu agentischer KI vom 20.7.2026, MCP-Fassung 2026-07-28, Rechte pro Werkzeug und Audit-Log; SecNumCloud 19.6 Buchstabe a trifft den Sitz, Buchstabe c den Modellweg, deshalb erfuellt weder ein Schweizer Rechenzentrum noch der Weg ueber Amazon Bedrock Artikel 31 Loi SREN.' },
    'blog-haftung': { titel: 'Wenn menschliche Aufsicht zur Strafnorm wird', text: 'italienische Durchfuehrungsdekrete vom 4.8.2026 mit Artikel 437-bis c.p. und Unternehmenshaftung nach d.lgs. 231/2001, Nichtigkeit rein automatisierter Kuendigungen; zum Redaktionsschluss am 3.9.2026 nicht in der Gazzetta Ufficiale veroeffentlicht und damit nicht in Kraft; ACN-Regelwerk verlangt EU-Metadaten.' },
    'blog-quellen': { titel: '48 erfundene Urteile', text: 'spanische Gerichtsentscheide 2026 zu erfundenen Fundstellen, AEPD-Ratgeber, Wissensbasen mit Fundstelle; Fundstellen verhindern Halluzinationen nicht, sie machen sie pruefbar, und der Engpass ist fehlendes Fachpersonal.' },
    'blog-anthropic': { titel: 'Claude Opus und Sonnet über Amazon Bedrock', text: 'Spitzenmodelle von Anthropic über Amazon Bedrock im europäischen Inferenzprofil; drei Abläufe (lange Ausschreibungen, Regelwerk gegen eigene Weisungen, Vorgänge über mehrere Systeme via MCP); Architektur mit Datenhaltung in der Schweiz; CLOUD Act offen benannt, In-Region für Claude in eu-central-2 nicht verfügbar.' },
    'blog-handwerk': { titel: 'KI im Handwerk und KMU', text: 'Offerten aus Firmenwissen, Rapport zu Bericht, Wissensbasis; Konnektoren u. a. Microsoft 365, bexio, KLARA; Elektro: SiNa-Fristen nach Art. 36 NIV.' },
    'blog-produktion': { titel: 'KI in der Produktion', text: 'Wissenserhalt aus Serviceberichten, Pflichtenheft-Analyse, HACCP- und Audit-Vorbereitung; Konnektoren u. a. Abacus, SAP Business One, Dynamics 365 BC, Odoo.' },
    'blog-treuhand': { titel: 'KI in Kanzlei und Treuhand', text: 'Dossier-Erschliessung, Vertragsprüfung gegen die eigene Musterbibliothek, mehrsprachige Mandantenkommunikation; Berufsgeheimnis nach Art. 321 StGB als Voraussetzung; Konnektoren u. a. Vertec (MCP ab Werk), justitia.swiss, bexio.' },
    'blog-immobilien': { titel: 'KI in der Immobilienverwaltung', text: 'Mieteranfragen sortieren und beantworten, Nebenkosten-Erklärung, Abnahmeprotokolle; Konnektoren u. a. Microsoft 365, GARAIO REM, Abacus/AbaImmo, ImmoTop2, SwissRETS.' },
    'blog-praxis': { titel: 'KI in Praxis und Apotheke', text: 'Berichts- und Versicherungsentwürfe, Team-Wissensbasis, mehrsprachige Merkblätter; bewusst ohne Diagnose, Triage oder Medikations-Check; FHIR als Anbindungspfad, Software u. a. vitomed, Elexis, OneDoc, Documedis.' },
    'blog-handwerk-eu': { titel: 'KI im Handwerk und KMU in Europa', text: 'Offerten- und Mahnentwürfe, Baustellendoku, Betriebswissen; E-Rechnungspflichten DE/FR/ES, Software u. a. Lexware Office, Pennylane, Fortnox.' },
    'blog-produktion-eu': { titel: 'KI in der Produktion in Europa', text: 'Wissenserhalt, Kundenaudits (LkSG/IFS), mehrsprachige Anweisungen; Software u. a. Monitor ERP, RamBase, Dynamics BC; ohne Maschinenebene.' },
    'blog-kanzlei-eu': { titel: 'KI für Kanzlei und Treuhand in Europa', text: 'Mandats-Erschliessung, Kanzleiwissen, Fristenkommunikation; Verifactu, facturation électronique, bokføringsloven; DATEV als Partnerweg.' },
    'blog-immobilien-eu': { titel: 'KI für Immobilienverwaltungen in Europa', text: 'Anfragen aus Beschlusslage, Versammlungsvorbereitung, Abrechnungen erklären; ehrlich zur API-Lage der Branche, genannt u. a. casavi, Immoware24, Vitec Fastighet.' },
    'blog-praxis-eu': { titel: 'KI in Praxis und Apotheke in Europa', text: 'Berichtsentwürfe, Praxiswissen, Patienteninfo mehrsprachig; ohne Diagnose, Triage oder Medikationscheck; HDS in Frankreich erklärt, Software u. a. medatixx, IXOS, Kaddio, awinta.' },
    'faq': { titel: 'FAQ', text: '41 Fragen und Antworten zu Datenschutz, Betrieb, Funktionen, Rechten und Lizenz, offen sichtbar.' },
    'vergleich': { titel: 'Vergleich', text: 'KI-Plattformen im Vergleich (ChatGPT Enterprise, Microsoft 365 Copilot, Claude, Langdock, Open WebUI/LibreChat), jede Angabe mit Quelle und Stand-Datum.' },
    'governance': { titel: 'Governance', text: 'Rollen, Rechte bis auf Werkzeug-Ebene, Audit-Log, Kostenkontrolle und gepoolte Budgets.' },
    'integrationen': { titel: 'Integrationen', text: 'native Anbindungen, das Model Context Protocol (MCP) erklärt, fertige MCP-Server für verbreitete Werkzeuge.' },
    'self-hosting': { titel: 'Self-Hosting', text: 'Docker-Compose-Stack, Auto-TLS via Caddy, private Websuche via SearXNG. MIT-Lizenz, kein Seat-Limit, ab 1 Nutzer.' },
    'sicherheit': { titel: 'Trust Center', text: 'Sicherheits- und Datenschutz-Zusicherungen mit Belegen: Hosting, revDSG/DSGVO, No-Training, Telemetrie, Audit-Logs, TOMs.' },
    'vision': { titel: 'Vision', text: 'Warum wir EU Cowork AI bauen: Europas Firmen KI-fähig machen, mit Open Source, Transparenz und Schulungen.' },
    'warteliste': { titel: 'Zugang anfragen', text: 'Formular für den Zugang zur betreuten Schweizer Instanz; die Zugänge werden wegen der hohen Nachfrage gestaffelt vergeben.' },
    'avv': { titel: 'Auftragsverarbeitungsvertrag (AVV)', text: 'Verarbeitung personenbezogener Daten nach Art. 28 DSGVO und revDSG.' },
    'subprozessoren': { titel: 'Subprozessoren', text: 'Liste der Unterauftragsverarbeiter, Teil des AVV.' },
    'datenschutz': { titel: 'Datenschutzerklärung', text: 'Umgang mit personenbezogenen Daten nach revDSG und DSGVO.' },
    'agb': { titel: 'AGB', text: 'Vertragliche Bedingungen für die Nutzung des Dienstes.' },
    'impressum': { titel: 'Impressum', text: 'Herr Informatik GmbH, Klosterzelgstrasse 1a, 5210 Windisch, Schweiz. UID CHE-112.168.836.' },
  }
};
