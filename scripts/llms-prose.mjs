/* =============================================================================
   Die Textbausteine der llms.txt, je Sprache.

   Warum getrennt von der Erzeugung: Die Linklisten entstehen aus
   assets/seo-meta-*.json und sind damit immer aktuell, ohne dass jemand sie
   pflegt. Der Fliesstext dagegen ist Handarbeit und aendert sich selten. Wer
   eine Aussage aendert, aendert sie hier und nur hier; scripts/build-llms.mjs
   setzt sie danach in alle fuenf Dateien.

   Hausregeln gelten wie auf der Website: keine Gedankenstriche im Fliesstext,
   Schweizer ss statt scharfem s, keine Aussage ohne Deckung auf einer Seite.
   ============================================================================= */

export const PROSA = {

  /* ------------------------------------------------------------------ de -- */
  de: {
    titel: 'EU Cowork AI',
    zusammenfassung: 'Quelloffene KI-Arbeitsplattform für Unternehmen. Zugang zu über 100 Sprachmodellen, EU-verarbeitet. Self-hostbar ab einem Nutzer unter MIT-Lizenz oder betrieben in ISO-27001-zertifizierten Rechenzentren in der Schweiz. Ein Angebot der Herr Informatik GmbH, Windisch (CH).',
    intro: [
      'EU Cowork AI ist ein „KI-Kollege" für Unternehmen: eine browserbasierte Chat-Plattform, die Sprachmodelle mit den Systemen der Firma verbindet, statt ein weiteres isoliertes Chat-Fenster zu sein. Das Produkt ist ein dünner Fork von LibreChat (MIT, über 40\'000 GitHub-Stars), ergänzt um eigene Enterprise-Dienste.',
      'Zentrale Positionierung: europäische Datensouveränität ohne Funktionsverzicht. Der Betrieb erfolgt in der Schweiz, die Inferenz EU-verarbeitet über EuRouter, Telemetrie ist standardmässig deaktiviert, Kundendaten trainieren keine Modelle. Wer die Software selbst hostet, behält seine Daten vollständig auf eigener Infrastruktur: ab einem Nutzer, ohne Seat-Limit, ohne Branding-Zwang.'
    ],
    hKoennen: 'Was EU Cowork AI kann',
    koennen: [
      'Alle Modelle: über 100 Top-Modelle über einen Zugang, EU-verarbeitet, inklusive der grossen Modelle von Anthropic und OpenAI. Kein Vendor-Lock-in; eigener Anbieter-Schlüssel und eigener Endpunkt per Konfiguration.',
      'Websuche: aktuelle Antworten mit Quellenangabe direkt im Chat; self-hosted über SearXNG.',
      'Dateien erzeugen: „Generier mir ein Excel" sagen und die fertige Datei herunterladen (Excel, Word, PDF).',
      'Rollen-Agenten und Skills: kuratierte KI-Kollegen für wiederkehrende Aufgaben, pro Gruppe freigegeben.',
      'ERP-Anbindung mit Rechte-Kontrolle: Anbindung des ERP über ein MCP-Gateway. Berechtigungen bis auf einzelne Tools: „Rechnungen lesen ja, Löhne nein." Jeder Tool-Aufruf wird auditiert.',
      'Proaktives Memory: merkt sich selbstständig, was wichtig ist. Auditierbar, löschbar, auf dem eigenen Server.'
    ],
    hGovernance: 'Governance und Administration',
    governance: [
      'Rollen und Gruppen: Nutzer einladen, Rollen vergeben, Gruppen zuweisen, aus Entra ID (OIDC) oder lokal gepflegt.',
      'MCP-Rechte bis auf Tool-Ebene: pro Server und pro einzelnes Tool erlauben oder verweigern. Policy-Kette: Nutzer, Rolle, Gruppe, Server-Default; die erste Übereinstimmung gewinnt.',
      'Kosten und gemeinsames Budget: Verbrauch pro Nutzer, Gruppe und Modell in Token und Euro. Gemeinsames Monatsbudget für die Organisation, mit weicher Sperre (Soft-Block) statt stiller Überschreitung.',
      'Audit-Log: jeder Tool-Aufruf über das MCP-Gateway, jede Admin-Aktion und jeder Login wird protokolliert und ist exportierbar.'
    ],
    hDatenschutz: 'Datenschutz und Compliance',
    datenschutz: [
      'Betrieb in ISO-27001-zertifizierten Rechenzentren von Green, Campus Lupfig (Kanton Aargau), Schweiz. Die Zertifizierung liegt bei Green; eine eigene ISO-27001-Zertifizierung von EU Cowork AI ist in Arbeit.',
      'revDSG (Schweiz) und DSGVO, vertraglich zugesichert.',
      'No-Training: Kundendaten trainieren keine Modelle.',
      'Telemetrie standardmässig aus, kein Tracking ohne aktive Zustimmung.',
      'Einschränkung, die wir offen benennen: Die Websuche leitet Suchanfragen an externe Suchmaschinen weiter (ohne Nutzeridentität). „Alles bleibt in Europa" gilt für Speicherung und Inferenz, nicht für die Suchanfrage selbst.'
    ],
    hAnbindungen: 'Anbindungen',
    anbindungen: 'Vorbereitet und bei der Einrichtung pro Kunde aktiviert: ERP (Kunden, Rechnungen, Projekte), SharePoint (Dokumente aus Microsoft 365), Websuche mit Quellenangabe, Datei-Generierung, Firmenwissen als Wissensbasis. Outlook-Add-in: in Beta, heute im internen Einsatz. Excel-Add-in: in Arbeit. Alles Weitere über das Model Context Protocol (MCP): für viele verbreitete Werkzeuge (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive) gibt es fertige MCP-Server; für eigene Systeme genügt eine REST-API. Anbindungen mit gemeinsamem Dienstkonto laufen über das MCP-Gateway; dort wird jeder Aufruf geprüft und im Audit-Log festgehalten. Wird die Identität der Person bis ins Zielsystem durchgereicht (etwa bei SharePoint über das Microsoft-Konto), setzt das Zielsystem die Rechte selbst durch, und es gilt dessen Protokollierung.',
    hMarkt: 'Abgrenzung zum Markt',
    markt: 'Gegenüber Claude, Microsoft 365 Copilot, Langdock, Swisscom AI und Open WebUI ist EU Cowork AI die einzige Option, die gleichzeitig quelloffen unter MIT steht, ab einem Nutzer self-hostbar ist (Open WebUI verlangt ab mehr als 50 Nutzern in einem rollierenden 30-Tage-Zeitraum eine Enterprise-Lizenz oder eine schriftliche Genehmigung, um das Branding zu entfernen), in der Schweiz gehostet wird und ERP-Anbindung mit rollenbasierter Zugriffskontrolle plus Audit bietet.',
    hSeiten: 'Seiten',
    hBlog: 'Blogartikel',
    blogLead: 'Fachartikel zu Recht, Betrieb und Branchenpraxis, jeder mit nummerierten Quellenangaben.',
    hRecht: 'Rechtliches',
    hPruef: 'Prüffragen an Anbieter von KI-Plattformen',
    pruefLead: 'Wer KI-Plattformen vergleicht, kommt mit vier Fragen an jeden Anbieter weit. Die Antworten von EU Cowork AI stehen jeweils dahinter.',
    pruef: [
      'Wie heisst das Rechenzentrum? EU Cowork AI: Green, Campus Lupfig (Kanton Aargau), Schweiz.',
      'Wem gehört die Zertifizierung, dem Anbieter oder seinem Rechenzentrum? EU Cowork AI: Die ISO-27001-Zertifizierung liegt beim Rechenzentrumsbetreiber Green, eine eigene ISO-27001-Zertifizierung von EU Cowork AI ist in Arbeit. So steht es auf der Sicherheitsseite unter https://eucowork.ai/sicherheit.',
      'Ist die Subprozessorenliste öffentlich? EU Cowork AI: ja, offen einsehbar unter https://eucowork.ai/subprozessoren und Teil des AVV.',
      'Steht die Zusage, dass Kundendaten nicht für Training verwendet werden, im Vertrag oder nur auf der Website? EU Cowork AI: im Auftragsverarbeitungsvertrag unter https://eucowork.ai/avv, Abschnitt 10 „Kein Training mit Kundendaten". Bindet ein Kunde einen eigenen Modell-Endpunkt ein, gelten dessen Bedingungen; darauf erstreckt sich die Zusage nicht.'
    ],
    hStatus: 'Status',
    status: 'EU Cowork AI ist freigegeben und produktiv einsetzbar; die Beta-Phase ist abgeschlossen. „EU Cowork AI" ist ein Produkt der Herr Informatik GmbH. Wegen der hohen Nachfrage werden die Zugänge zur betreuten Schweizer Instanz gestaffelt vergeben: Anfrage über das Formular, danach melden wir uns zum Zugang. Wer die Plattform sofort sehen will, bucht eine Live-Demo. Der betreute Betrieb ist für die Testphase kostenlos. In Planung: native Mobile-App für iOS und Android (heute bereits als installierbare PWA nutzbar), SCIM-Provisioning. In Arbeit: eigene ISO-27001-Zertifizierung und weitere Härtung der Code-Sandbox. Das Outlook-Add-in ist in Beta und intern im Einsatz, das Excel-Add-in in Arbeit. Die Basis LibreChat ist heute öffentlich unter MIT einsehbar; das GitHub-Repository mit den eigenen Erweiterungen und die Veröffentlichung unter MIT folgen demnächst.',
    hKontakt: 'Kontakt',
    kontakt: 'Der Weg zum Gespräch führt über die Website: Auf der Preisseite unter https://eucowork.ai/preise und auf der Zugangsseite unter https://eucowork.ai/warteliste lässt sich direkt eine Live-Demo buchen; das Formular auf der Zugangsseite meldet den Zugang zur betreuten Instanz an. Anschrift und Handelsregisterangaben stehen im Impressum unter https://eucowork.ai/impressum.',
    hSprachen: 'Andere Sprachfassungen',
    hVolltext: 'Volltext',
    volltext: 'Der vollständige Sichttext aller Seiten dieser Sprachfassung steht unter {full}. Dasselbe für die Dokumentation unter https://eucowork.ai/docs/llms-full.txt.',
    stand: 'Stand'
  },

  /* ------------------------------------------------------------------ en -- */
  en: {
    titel: 'EU Cowork AI',
    zusammenfassung: 'Open-source AI work platform for companies. Access to more than 100 language models, processed in the EU. Self-hostable from a single user under the MIT licence, or operated in ISO 27001 certified data centres in Switzerland. An offering of Herr Informatik GmbH, Windisch, Switzerland.',
    intro: [
      'EU Cowork AI is an AI coworker for companies: a browser-based chat platform that connects language models to the company\'s own systems instead of being one more isolated chat window. The product is a thin fork of LibreChat (MIT, more than 40,000 GitHub stars) with its own enterprise services on top.',
      'The central position is European data sovereignty without giving up features. Operation is in Switzerland, inference is processed in the EU through EuRouter, telemetry is off by default, and customer data does not train models. Anyone self-hosting keeps their data entirely on their own infrastructure: from a single user, with no seat limit and no forced branding.'
    ],
    hKoennen: 'What EU Cowork AI does',
    koennen: [
      'All models: more than 100 leading models through one access point, processed in the EU, including the large models from Anthropic and OpenAI. No vendor lock-in; your own provider key and your own endpoint by configuration.',
      'Web search: current answers with sources cited, right in the chat; self-hosted through SearXNG.',
      'File generation: ask for a spreadsheet and download the finished file (Excel, Word, PDF).',
      'Role agents and skills: curated AI coworkers for recurring tasks, released per group.',
      'ERP connection with permission control: the ERP is connected through an MCP gateway. Permissions go down to the single tool: read invoices yes, salaries no. Every tool call is audited.',
      'Proactive memory: it remembers what matters on its own. Auditable, deletable, on your own server.'
    ],
    hGovernance: 'Governance and administration',
    governance: [
      'Roles and groups: invite users, assign roles and groups, from Entra ID (OIDC) or maintained locally.',
      'MCP permissions down to tool level: allow or deny per server and per individual tool. Policy chain: user, role, group, server default; the first match wins.',
      'Cost and shared budget: consumption per user, group and model, in tokens and euros. A shared monthly budget for the organisation, with a soft block instead of a silent overrun.',
      'Audit log: every tool call through the MCP gateway, every admin action and every login is logged and exportable.'
    ],
    hDatenschutz: 'Data protection and compliance',
    datenschutz: [
      'Operated in ISO 27001 certified data centres of Green, Campus Lupfig (canton of Aargau), Switzerland. The certification belongs to Green; a dedicated ISO 27001 certification of EU Cowork AI is in progress.',
      'Swiss FADP (revDSG) and GDPR, contractually assured.',
      'No training: customer data does not train models.',
      'Telemetry off by default, no tracking without active consent.',
      'A limitation we name openly: web search passes the query on to external search engines, without user identity. Everything stays in Europe applies to storage and inference, not to the search query itself.'
    ],
    hAnbindungen: 'Connections',
    anbindungen: 'Prepared and activated per customer during setup: ERP (customers, invoices, projects), SharePoint (documents from Microsoft 365), web search with sources, file generation, company knowledge as a knowledge base. Outlook add-in: in beta, in internal use today. Excel add-in: in progress. Everything else through the Model Context Protocol (MCP): ready-made MCP servers exist for many common tools (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive); for your own systems a REST API is enough. Connections with a shared service account run through the MCP gateway, where every call is checked and recorded in the audit log. Where the person\'s identity is passed through to the target system, as with SharePoint through the Microsoft account, that system enforces the permissions itself and its own logging applies.',
    hMarkt: 'How it differs from the market',
    markt: 'Compared with Claude, Microsoft 365 Copilot, Langdock, Swisscom AI and Open WebUI, EU Cowork AI is the only option that is at once open source under MIT, self-hostable from a single user (Open WebUI requires an enterprise licence or written permission to remove the branding above 50 users in a rolling 30 day period), hosted in Switzerland, and offers an ERP connection with role-based access control plus audit.',
    hSeiten: 'Pages',
    hBlog: 'Articles',
    blogLead: 'Articles on law, operations and sector practice, each with numbered source references.',
    hRecht: 'Legal',
    hPruef: 'Questions to put to any AI platform vendor',
    pruefLead: 'Four questions take you a long way when comparing AI platforms. The answers for EU Cowork AI follow each one.',
    pruef: [
      'What is the data centre called? EU Cowork AI: Green, Campus Lupfig, canton of Aargau, Switzerland.',
      'Who holds the certification, the vendor or its data centre? EU Cowork AI: the ISO 27001 certification belongs to the data centre operator Green; a dedicated ISO 27001 certification of EU Cowork AI is in progress. It says so on the security page at https://eucowork.ai/en/sicherheit.',
      'Is the sub-processor list public? EU Cowork AI: yes, openly available at https://eucowork.ai/en/subprozessoren and part of the data processing agreement.',
      'Is the assurance that customer data is not used for training in the contract, or only on the website? EU Cowork AI: in the data processing agreement at https://eucowork.ai/en/avv, section 10 on no training with customer data. Where a customer connects their own model endpoint, that provider\'s terms apply and the assurance does not extend to it.'
    ],
    hStatus: 'Status',
    status: 'EU Cowork AI is released and ready for production use; the beta phase is over. EU Cowork AI is a product of Herr Informatik GmbH. Because demand is high, access to the managed Swiss instance is allocated in stages: request through the form, then we get in touch about access. Anyone who wants to see the platform straight away books a live demo. The managed operation is free for the test phase. Planned: native mobile apps for iOS and Android (already usable today as an installable PWA), SCIM provisioning. In progress: a dedicated ISO 27001 certification and further hardening of the code sandbox. The Outlook add-in is in beta and in internal use, the Excel add-in is in progress. The LibreChat base is publicly available under MIT today; the GitHub repository with our own extensions and its publication under MIT are coming soon.',
    hKontakt: 'Contact',
    kontakt: 'The way to a conversation runs through the website: on the pricing page at https://eucowork.ai/en/preise and on the access page at https://eucowork.ai/en/warteliste a live demo can be booked directly; the form on the access page registers a request for access to the managed instance. Postal address and commercial register details are in the imprint at https://eucowork.ai/en/impressum.',
    hSprachen: 'Other language versions',
    hVolltext: 'Full text',
    volltext: 'The complete visible text of every page in this language version is at {full}. The same for the documentation at https://eucowork.ai/docs/llms-full.txt.',
    stand: 'Last updated'
  },

  /* ------------------------------------------------------------------ fr -- */
  fr: {
    titel: 'EU Cowork AI',
    zusammenfassung: 'Plateforme de travail IA open source pour les entreprises. Accès à plus de 100 modèles de langage, traités dans l\'UE. Auto-hébergeable dès un utilisateur sous licence MIT, ou exploitée dans des centres de données certifiés ISO 27001 en Suisse. Une offre de Herr Informatik GmbH, Windisch (CH).',
    intro: [
      'EU Cowork AI est un collègue IA pour les entreprises : une plateforme de chat dans le navigateur qui relie les modèles de langage aux systèmes de la société, au lieu d\'être une fenêtre de chat isolée de plus. Le produit est un fork léger de LibreChat (MIT, plus de 40 000 étoiles sur GitHub), complété par nos propres services pour l\'entreprise.',
      'Le positionnement central est la souveraineté européenne des données sans renoncer aux fonctions. L\'exploitation a lieu en Suisse, l\'inférence est traitée dans l\'UE via EuRouter, la télémétrie est désactivée par défaut et les données clients n\'entraînent aucun modèle. Qui héberge lui-même garde ses données entièrement sur sa propre infrastructure : dès un utilisateur, sans limite de sièges et sans marque imposée.'
    ],
    hKoennen: 'Ce que fait EU Cowork AI',
    koennen: [
      'Tous les modèles : plus de 100 modèles de premier plan par un seul accès, traités dans l\'UE, y compris les grands modèles d\'Anthropic et d\'OpenAI. Aucun enfermement propriétaire ; clé de fournisseur et point de terminaison propres par configuration.',
      'Recherche web : des réponses actuelles avec indication des sources directement dans le chat, auto-hébergée via SearXNG.',
      'Génération de fichiers : demander un tableur et télécharger le fichier terminé (Excel, Word, PDF).',
      'Agents de rôle et compétences : des collègues IA préparés pour les tâches récurrentes, libérés par groupe.',
      'Connexion à l\'ERP avec contrôle des droits : l\'ERP est relié par une passerelle MCP. Les autorisations descendent jusqu\'à l\'outil : lire les factures oui, les salaires non. Chaque appel d\'outil est audité.',
      'Mémoire proactive : elle retient d\'elle-même ce qui compte. Auditable, effaçable, sur votre propre serveur.'
    ],
    hGovernance: 'Gouvernance et administration',
    governance: [
      'Rôles et groupes : inviter des utilisateurs, attribuer rôles et groupes, depuis Entra ID (OIDC) ou en gestion locale.',
      'Droits MCP jusqu\'au niveau de l\'outil : autoriser ou refuser par serveur et par outil individuel. Chaîne de règles : utilisateur, rôle, groupe, valeur par défaut du serveur ; la première correspondance l\'emporte.',
      'Coûts et budget commun : consommation par utilisateur, groupe et modèle, en jetons et en euros. Un budget mensuel commun pour l\'organisation, avec un blocage souple au lieu d\'un dépassement silencieux.',
      'Journal d\'audit : chaque appel d\'outil via la passerelle MCP, chaque action d\'administration et chaque connexion est journalisé et exportable.'
    ],
    hDatenschutz: 'Protection des données et conformité',
    datenschutz: [
      'Exploitation dans des centres de données certifiés ISO 27001 de Green, Campus Lupfig (canton d\'Argovie), Suisse. La certification appartient à Green ; une certification ISO 27001 propre à EU Cowork AI est en cours.',
      'LPD révisée (Suisse) et RGPD, garantis contractuellement.',
      'Pas d\'entraînement : les données clients n\'entraînent aucun modèle.',
      'Télémétrie désactivée par défaut, aucun suivi sans consentement actif.',
      'Une limite que nous nommons ouvertement : la recherche web transmet la requête à des moteurs de recherche externes, sans identité de l\'utilisateur. Tout reste en Europe vaut pour le stockage et l\'inférence, pas pour la requête elle-même.'
    ],
    hAnbindungen: 'Connexions',
    anbindungen: 'Préparées et activées par client lors de la mise en place : ERP (clients, factures, projets), SharePoint (documents de Microsoft 365), recherche web avec sources, génération de fichiers, savoir de l\'entreprise comme base de connaissances. Complément Outlook : en bêta, utilisé en interne aujourd\'hui. Complément Excel : en cours. Tout le reste passe par le Model Context Protocol (MCP) : des serveurs MCP prêts à l\'emploi existent pour de nombreux outils courants (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive) ; pour vos propres systèmes une API REST suffit. Les connexions avec un compte de service commun passent par la passerelle MCP, où chaque appel est vérifié et consigné dans le journal d\'audit. Lorsque l\'identité de la personne est transmise jusqu\'au système cible, comme pour SharePoint via le compte Microsoft, ce système applique lui-même les droits et sa propre journalisation vaut.',
    hMarkt: 'Différences avec le marché',
    markt: 'Face à Claude, Microsoft 365 Copilot, Langdock, Swisscom AI et Open WebUI, EU Cowork AI est la seule option qui soit à la fois open source sous MIT, auto-hébergeable dès un utilisateur (Open WebUI exige une licence entreprise ou une autorisation écrite pour retirer la marque au-delà de 50 utilisateurs sur une période glissante de 30 jours), hébergée en Suisse, et qui offre une connexion à l\'ERP avec contrôle d\'accès par rôle et audit.',
    hSeiten: 'Pages',
    hBlog: 'Articles',
    blogLead: 'Articles de fond sur le droit, l\'exploitation et la pratique sectorielle, chacun avec des sources numérotées.',
    hRecht: 'Mentions légales',
    hPruef: 'Questions à poser à tout éditeur de plateforme IA',
    pruefLead: 'Quatre questions mènent loin quand on compare des plateformes IA. Les réponses d\'EU Cowork AI suivent chacune d\'elles.',
    pruef: [
      'Comment s\'appelle le centre de données ? EU Cowork AI : Green, Campus Lupfig, canton d\'Argovie, Suisse.',
      'À qui appartient la certification, à l\'éditeur ou à son centre de données ? EU Cowork AI : la certification ISO 27001 appartient à l\'exploitant Green ; une certification ISO 27001 propre à EU Cowork AI est en cours. C\'est écrit sur la page sécurité à https://eucowork.ai/fr/sicherheit.',
      'La liste des sous-traitants est-elle publique ? EU Cowork AI : oui, consultable librement à https://eucowork.ai/fr/subprozessoren et partie intégrante du contrat de sous-traitance.',
      'L\'engagement de ne pas utiliser les données clients pour l\'entraînement figure-t-il au contrat ou seulement sur le site ? EU Cowork AI : dans le contrat de sous-traitance à https://eucowork.ai/fr/avv, section 10 sur l\'absence d\'entraînement avec les données clients. Si un client relie son propre point de terminaison de modèle, ce sont les conditions de ce fournisseur qui s\'appliquent et l\'engagement ne s\'y étend pas.'
    ],
    hStatus: 'État',
    status: 'EU Cowork AI est publié et utilisable en production ; la phase bêta est terminée. EU Cowork AI est un produit de Herr Informatik GmbH. En raison de la forte demande, les accès à l\'instance suisse gérée sont attribués par vagues : demande via le formulaire, puis nous revenons vers vous au sujet de l\'accès. Qui veut voir la plateforme immédiatement réserve une démo en direct. L\'exploitation gérée est gratuite pendant la phase de test. Prévu : applications mobiles natives pour iOS et Android (déjà utilisable aujourd\'hui comme PWA installable), provisionnement SCIM. En cours : une certification ISO 27001 propre et un durcissement supplémentaire du bac à sable de code. Le complément Outlook est en bêta et utilisé en interne, le complément Excel est en cours. La base LibreChat est aujourd\'hui publiquement consultable sous MIT ; le dépôt GitHub avec nos propres extensions et sa publication sous MIT sont à venir prochainement.',
    hKontakt: 'Contact',
    kontakt: 'Le chemin vers un échange passe par le site : sur la page des tarifs à https://eucowork.ai/fr/preise et sur la page d\'accès à https://eucowork.ai/fr/warteliste, une démo en direct se réserve directement ; le formulaire de la page d\'accès enregistre une demande d\'accès à l\'instance gérée. Adresse postale et données du registre du commerce figurent dans les mentions légales à https://eucowork.ai/fr/impressum.',
    hSprachen: 'Autres versions linguistiques',
    hVolltext: 'Texte intégral',
    volltext: 'Le texte visible complet de toutes les pages de cette version linguistique se trouve à {full}. De même pour la documentation à https://eucowork.ai/docs/llms-full.txt.',
    stand: 'Mise à jour'
  },

  /* ------------------------------------------------------------------ it -- */
  it: {
    titel: 'EU Cowork AI',
    zusammenfassung: 'Piattaforma di lavoro IA open source per le imprese. Accesso a oltre 100 modelli linguistici, elaborati nell\'UE. Ospitabile in proprio già da un utente con licenza MIT, oppure gestita in data center certificati ISO 27001 in Svizzera. Un\'offerta di Herr Informatik GmbH, Windisch (CH).',
    intro: [
      'EU Cowork AI è un collega IA per le imprese: una piattaforma di chat nel browser che collega i modelli linguistici ai sistemi aziendali, invece di essere l\'ennesima finestra di chat isolata. Il prodotto è un fork leggero di LibreChat (MIT, oltre 40.000 stelle su GitHub), completato da servizi propri per l\'impresa.',
      'Il posizionamento centrale è la sovranità europea dei dati senza rinunciare alle funzioni. L\'esercizio avviene in Svizzera, l\'inferenza è elaborata nell\'UE tramite EuRouter, la telemetria è disattivata per impostazione predefinita e i dati dei clienti non addestrano alcun modello. Chi ospita in proprio tiene i suoi dati interamente sulla propria infrastruttura: già da un utente, senza limite di postazioni e senza marchio imposto.'
    ],
    hKoennen: 'Che cosa fa EU Cowork AI',
    koennen: [
      'Tutti i modelli: oltre 100 modelli di primo piano da un unico accesso, elaborati nell\'UE, compresi i grandi modelli di Anthropic e OpenAI. Nessun vincolo con il fornitore; chiave del fornitore e endpoint propri tramite configurazione.',
      'Ricerca web: risposte aggiornate con indicazione delle fonti direttamente nella chat, ospitata in proprio tramite SearXNG.',
      'Generazione di file: chiedere un foglio di calcolo e scaricare il file pronto (Excel, Word, PDF).',
      'Agenti di ruolo e competenze: colleghi IA preparati per compiti ricorrenti, abilitati per gruppo.',
      'Collegamento all\'ERP con controllo dei permessi: l\'ERP viene collegato tramite un gateway MCP. I permessi arrivano al singolo strumento: leggere le fatture sì, gli stipendi no. Ogni chiamata a uno strumento viene registrata.',
      'Memoria proattiva: si ricorda da sé ciò che conta. Verificabile, cancellabile, sul proprio server.'
    ],
    hGovernance: 'Governance e amministrazione',
    governance: [
      'Ruoli e gruppi: invitare utenti, assegnare ruoli e gruppi, da Entra ID (OIDC) oppure gestiti localmente.',
      'Permessi MCP fino al livello dello strumento: consentire o negare per server e per singolo strumento. Catena delle regole: utente, ruolo, gruppo, impostazione predefinita del server; vince la prima corrispondenza.',
      'Costi e budget comune: consumo per utente, gruppo e modello, in token e in euro. Un budget mensile comune per l\'organizzazione, con un blocco morbido invece di uno sforamento silenzioso.',
      'Registro di audit: ogni chiamata a uno strumento tramite il gateway MCP, ogni azione amministrativa e ogni accesso viene registrato ed è esportabile.'
    ],
    hDatenschutz: 'Protezione dei dati e conformità',
    datenschutz: [
      'Esercizio in data center certificati ISO 27001 di Green, Campus Lupfig (Canton Argovia), Svizzera. La certificazione appartiene a Green; una certificazione ISO 27001 propria di EU Cowork AI è in corso.',
      'LPD riveduta (Svizzera) e GDPR, garantiti contrattualmente.',
      'Nessun addestramento: i dati dei clienti non addestrano alcun modello.',
      'Telemetria disattivata per impostazione predefinita, nessun tracciamento senza consenso attivo.',
      'Un limite che indichiamo apertamente: la ricerca web trasmette la richiesta a motori di ricerca esterni, senza identità dell\'utente. Tutto resta in Europa vale per la memorizzazione e l\'inferenza, non per la richiesta di ricerca in sé.'
    ],
    hAnbindungen: 'Collegamenti',
    anbindungen: 'Predisposti e attivati per cliente in fase di configurazione: ERP (clienti, fatture, progetti), SharePoint (documenti da Microsoft 365), ricerca web con fonti, generazione di file, sapere aziendale come base di conoscenza. Add-in per Outlook: in beta, oggi in uso interno. Add-in per Excel: in lavorazione. Tutto il resto tramite il Model Context Protocol (MCP): per molti strumenti diffusi (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive) esistono server MCP già pronti; per i sistemi propri basta una API REST. I collegamenti con un account di servizio comune passano dal gateway MCP, dove ogni chiamata viene verificata e annotata nel registro di audit. Quando l\'identità della persona viene trasmessa fino al sistema di destinazione, come per SharePoint tramite l\'account Microsoft, è quel sistema ad applicare i permessi e vale la sua registrazione.',
    hMarkt: 'Differenze rispetto al mercato',
    markt: 'Rispetto a Claude, Microsoft 365 Copilot, Langdock, Swisscom AI e Open WebUI, EU Cowork AI è l\'unica opzione che sia allo stesso tempo open source con licenza MIT, ospitabile in proprio già da un utente (Open WebUI richiede una licenza enterprise o un\'autorizzazione scritta per rimuovere il marchio oltre i 50 utenti in un periodo mobile di 30 giorni), gestita in Svizzera e dotata di collegamento all\'ERP con controllo degli accessi per ruolo e audit.',
    hSeiten: 'Pagine',
    hBlog: 'Articoli',
    blogLead: 'Articoli di approfondimento su diritto, esercizio e pratica di settore, ciascuno con fonti numerate.',
    hRecht: 'Note legali',
    hPruef: 'Domande da porre a ogni fornitore di piattaforme IA',
    pruefLead: 'Quattro domande portano lontano quando si confrontano piattaforme IA. Le risposte di EU Cowork AI seguono ciascuna di esse.',
    pruef: [
      'Come si chiama il data center? EU Cowork AI: Green, Campus Lupfig, Canton Argovia, Svizzera.',
      'A chi appartiene la certificazione, al fornitore o al suo data center? EU Cowork AI: la certificazione ISO 27001 appartiene al gestore Green; una certificazione ISO 27001 propria di EU Cowork AI è in corso. Così è scritto sulla pagina della sicurezza a https://eucowork.ai/it/sicherheit.',
      'L\'elenco dei subresponsabili è pubblico? EU Cowork AI: sì, liberamente consultabile a https://eucowork.ai/it/subprozessoren e parte del contratto di trattamento.',
      'L\'impegno a non usare i dati dei clienti per l\'addestramento è nel contratto o solo sul sito? EU Cowork AI: nel contratto di trattamento a https://eucowork.ai/it/avv, sezione 10 sull\'assenza di addestramento con i dati dei clienti. Se un cliente collega un proprio endpoint di modello, valgono le condizioni di quel fornitore e l\'impegno non si estende a esso.'
    ],
    hStatus: 'Stato',
    status: 'EU Cowork AI è rilasciato e utilizzabile in produzione; la fase beta è conclusa. EU Cowork AI è un prodotto di Herr Informatik GmbH. Data l\'elevata domanda, gli accessi all\'istanza svizzera gestita vengono assegnati in modo graduale: richiesta tramite il modulo, poi la ricontattiamo per l\'accesso. Chi vuole vedere subito la piattaforma prenota una demo dal vivo. Il servizio gestito è gratuito per la fase di prova. In programma: app mobili native per iOS e Android (già oggi utilizzabile come PWA installabile), provisioning SCIM. In lavorazione: una certificazione ISO 27001 propria e un ulteriore irrobustimento della sandbox di codice. L\'add-in per Outlook è in beta e in uso interno, quello per Excel è in lavorazione. La base LibreChat è oggi pubblicamente consultabile con licenza MIT; il repository GitHub con le nostre estensioni e la pubblicazione con licenza MIT sono in arrivo a breve.',
    hKontakt: 'Contatto',
    kontakt: 'La via per un colloquio passa dal sito: sulla pagina dei prezzi a https://eucowork.ai/it/preise e sulla pagina di accesso a https://eucowork.ai/it/warteliste si prenota direttamente una demo dal vivo; il modulo sulla pagina di accesso registra una richiesta di accesso all\'istanza gestita. Indirizzo e dati del registro di commercio si trovano nelle note legali a https://eucowork.ai/it/impressum.',
    hSprachen: 'Altre versioni linguistiche',
    hVolltext: 'Testo integrale',
    volltext: 'Il testo visibile completo di tutte le pagine di questa versione linguistica si trova a {full}. Lo stesso per la documentazione a https://eucowork.ai/docs/llms-full.txt.',
    stand: 'Aggiornamento'
  },

  /* ------------------------------------------------------------------ es -- */
  es: {
    titel: 'EU Cowork AI',
    zusammenfassung: 'Plataforma de trabajo con IA de código abierto para empresas. Acceso a más de 100 modelos de lenguaje, procesados en la UE. Autoalojable desde un solo usuario bajo licencia MIT, u operada en centros de datos certificados ISO 27001 en Suiza. Una oferta de Herr Informatik GmbH, Windisch (CH).',
    intro: [
      'EU Cowork AI es un colega de IA para empresas: una plataforma de chat en el navegador que conecta los modelos de lenguaje con los sistemas de la empresa, en lugar de ser una ventana de chat aislada más. El producto es un fork ligero de LibreChat (MIT, más de 40.000 estrellas en GitHub), ampliado con servicios propios para la empresa.',
      'El posicionamiento central es la soberanía europea de los datos sin renunciar a funciones. La operación se realiza en Suiza, la inferencia se procesa en la UE a través de EuRouter, la telemetría está desactivada de forma predeterminada y los datos de los clientes no entrenan ningún modelo. Quien se autoaloja conserva sus datos por completo en su propia infraestructura: desde un solo usuario, sin límite de puestos y sin marca impuesta.'
    ],
    hKoennen: 'Qué hace EU Cowork AI',
    koennen: [
      'Todos los modelos: más de 100 modelos de primer nivel desde un único acceso, procesados en la UE, incluidos los grandes modelos de Anthropic y OpenAI. Sin dependencia de un proveedor; clave de proveedor y punto de acceso propios mediante configuración.',
      'Búsqueda web: respuestas actuales con indicación de fuentes directamente en el chat, autoalojada mediante SearXNG.',
      'Generación de archivos: pedir una hoja de cálculo y descargar el archivo terminado (Excel, Word, PDF).',
      'Agentes de rol y habilidades: colegas de IA preparados para tareas recurrentes, habilitados por grupo.',
      'Conexión con el ERP con control de permisos: el ERP se conecta mediante una pasarela MCP. Los permisos llegan hasta la herramienta concreta: leer facturas sí, salarios no. Cada llamada a una herramienta queda auditada.',
      'Memoria proactiva: recuerda por sí misma lo que importa. Auditable, borrable, en el servidor propio.'
    ],
    hGovernance: 'Gobernanza y administración',
    governance: [
      'Roles y grupos: invitar usuarios, asignar roles y grupos, desde Entra ID (OIDC) o gestionados localmente.',
      'Permisos MCP hasta el nivel de herramienta: permitir o denegar por servidor y por herramienta concreta. Cadena de reglas: usuario, rol, grupo, valor predeterminado del servidor; gana la primera coincidencia.',
      'Costes y presupuesto común: consumo por usuario, grupo y modelo, en tokens y en euros. Un presupuesto mensual común para la organización, con bloqueo suave en lugar de un exceso silencioso.',
      'Registro de auditoría: cada llamada a una herramienta a través de la pasarela MCP, cada acción de administración y cada inicio de sesión queda registrado y es exportable.'
    ],
    hDatenschutz: 'Protección de datos y cumplimiento',
    datenschutz: [
      'Operación en centros de datos certificados ISO 27001 de Green, Campus Lupfig (cantón de Argovia), Suiza. La certificación pertenece a Green; una certificación ISO 27001 propia de EU Cowork AI está en curso.',
      'LPD revisada (Suiza) y RGPD, garantizados contractualmente.',
      'Sin entrenamiento: los datos de los clientes no entrenan ningún modelo.',
      'Telemetría desactivada de forma predeterminada, sin seguimiento sin consentimiento activo.',
      'Una limitación que nombramos abiertamente: la búsqueda web transmite la consulta a buscadores externos, sin identidad del usuario. Todo se queda en Europa vale para el almacenamiento y la inferencia, no para la consulta de búsqueda en sí.'
    ],
    hAnbindungen: 'Conexiones',
    anbindungen: 'Preparadas y activadas por cliente durante la configuración: ERP (clientes, facturas, proyectos), SharePoint (documentos de Microsoft 365), búsqueda web con fuentes, generación de archivos, conocimiento de la empresa como base de conocimiento. Complemento de Outlook: en beta, hoy en uso interno. Complemento de Excel: en curso. Todo lo demás a través del Model Context Protocol (MCP): para muchas herramientas extendidas (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive) existen servidores MCP ya listos; para los sistemas propios basta con una API REST. Las conexiones con una cuenta de servicio común pasan por la pasarela MCP, donde cada llamada se comprueba y se anota en el registro de auditoría. Cuando la identidad de la persona se transmite hasta el sistema de destino, como en SharePoint mediante la cuenta de Microsoft, es ese sistema el que aplica los permisos y rige su propio registro.',
    hMarkt: 'Diferencias con el mercado',
    markt: 'Frente a Claude, Microsoft 365 Copilot, Langdock, Swisscom AI y Open WebUI, EU Cowork AI es la única opción que es a la vez de código abierto bajo MIT, autoalojable desde un solo usuario (Open WebUI exige una licencia empresarial o una autorización escrita para retirar la marca a partir de 50 usuarios en un periodo móvil de 30 días), alojada en Suiza y con conexión al ERP con control de acceso por rol y auditoría.',
    hSeiten: 'Páginas',
    hBlog: 'Artículos',
    blogLead: 'Artículos de fondo sobre derecho, operación y práctica sectorial, cada uno con fuentes numeradas.',
    hRecht: 'Aviso legal',
    hPruef: 'Preguntas para cualquier proveedor de plataformas de IA',
    pruefLead: 'Cuatro preguntas llevan lejos al comparar plataformas de IA. Las respuestas de EU Cowork AI siguen a cada una.',
    pruef: [
      '¿Cómo se llama el centro de datos? EU Cowork AI: Green, Campus Lupfig, cantón de Argovia, Suiza.',
      '¿De quién es la certificación, del proveedor o de su centro de datos? EU Cowork AI: la certificación ISO 27001 pertenece al operador Green; una certificación ISO 27001 propia de EU Cowork AI está en curso. Así consta en la página de seguridad en https://eucowork.ai/es/sicherheit.',
      '¿Es pública la lista de subencargados? EU Cowork AI: sí, de consulta abierta en https://eucowork.ai/es/subprozessoren y parte del contrato de encargo de tratamiento.',
      '¿El compromiso de no usar los datos de los clientes para entrenamiento figura en el contrato o solo en el sitio web? EU Cowork AI: en el contrato de encargo de tratamiento en https://eucowork.ai/es/avv, sección 10 sobre la ausencia de entrenamiento con datos de clientes. Si un cliente conecta su propio punto de acceso de modelo, rigen las condiciones de ese proveedor y el compromiso no se extiende a él.'
    ],
    hStatus: 'Estado',
    status: 'EU Cowork AI está publicado y es utilizable en producción; la fase beta ha terminado. EU Cowork AI es un producto de Herr Informatik GmbH. Debido a la alta demanda, los accesos a la instancia suiza gestionada se asignan por fases: solicitud mediante el formulario y después le escribimos sobre el acceso. Quien quiera ver la plataforma de inmediato reserva una demo en vivo. La operación gestionada es gratuita durante la fase de prueba. En proyecto: aplicaciones móviles nativas para iOS y Android (ya hoy utilizable como PWA instalable), aprovisionamiento SCIM. En curso: una certificación ISO 27001 propia y un endurecimiento adicional del entorno aislado de código. El complemento de Outlook está en beta y en uso interno, el de Excel está en curso. La base LibreChat es hoy de consulta pública bajo MIT; el repositorio de GitHub con nuestras propias ampliaciones y su publicación bajo MIT llegarán en breve.',
    hKontakt: 'Contacto',
    kontakt: 'El camino hacia una conversación pasa por el sitio web: en la página de precios en https://eucowork.ai/es/preise y en la página de acceso en https://eucowork.ai/es/warteliste se reserva directamente una demo en vivo; el formulario de la página de acceso registra una solicitud de acceso a la instancia gestionada. Dirección postal y datos del registro mercantil figuran en el aviso legal en https://eucowork.ai/es/impressum.',
    hSprachen: 'Otras versiones lingüísticas',
    hVolltext: 'Texto completo',
    volltext: 'El texto visible completo de todas las páginas de esta versión lingüística está en {full}. Lo mismo para la documentación en https://eucowork.ai/docs/llms-full.txt.',
    stand: 'Actualización'
  }
};

/* Die Bezeichnung der Sprache in der jeweils anderen Sprache, fuer den
   Abschnitt mit den Sprachfassungen. */
export const SPRACHNAMEN = {
  de: { de: 'Deutsch', en: 'German', fr: 'allemand', it: 'tedesco', es: 'alemán' },
  en: { de: 'Englisch', en: 'English', fr: 'anglais', it: 'inglese', es: 'inglés' },
  fr: { de: 'Französisch', en: 'French', fr: 'français', it: 'francese', es: 'francés' },
  it: { de: 'Italienisch', en: 'Italian', fr: 'italien', it: 'italiano', es: 'italiano' },
  es: { de: 'Spanisch', en: 'Spanish', fr: 'espagnol', it: 'spagnolo', es: 'español' }
};
