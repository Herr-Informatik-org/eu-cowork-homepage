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
    titel: 'Kisuno',
    zusammenfassung: 'KI-Arbeitsplattform für Unternehmen, die demnächst unter der MIT-Lizenz erscheint. Zugang zu den aktuellen Modellen von OpenAI (ChatGPT) und Anthropic (Claude), die im AWS-Rechenzentrum in Frankfurt rechnen, und zu offenen Spitzenmodellen wie GLM, Kimi und DeepSeek, die europäische Unternehmen auf Servern in Europa betreiben. Self-hostbar ab einem Nutzer oder betrieben in ISO-27001-zertifizierten Rechenzentren in der Schweiz. Ein Angebot der Herr Informatik GmbH, Windisch (CH).',
    intro: [
      'Kisuno ist ein „KI-Kollege" für Unternehmen: eine browserbasierte Chat-Plattform, die Sprachmodelle mit den Systemen der Firma verbindet, statt ein weiteres isoliertes Chat-Fenster zu sein. Das Produkt ist ein dünner Fork von LibreChat (MIT, über 40\'000 GitHub-Stars), ergänzt um eigene Enterprise-Dienste. Kisuno hiess bis September 2026 EU Cowork AI; Anbieter, Produkt und Betrieb sind dieselben geblieben.',
      'Zentrale Positionierung: europäische Datensouveränität ohne Funktionsverzicht. Der Betrieb erfolgt in der Schweiz, die Modelle rechnen im AWS-Rechenzentrum in Frankfurt oder bei europäischen Unternehmen auf Servern in Europa, Telemetrie ist standardmässig deaktiviert, Kundendaten trainieren keine Modelle. Wer die Software selbst hostet, behält seine Daten vollständig auf eigener Infrastruktur: ab einem Nutzer, ohne Seat-Limit, ohne Branding-Zwang.'
    ],
    hKoennen: 'Was Kisuno kann',
    koennen: [
      'Alle Modelle: die aktuellen Modelle von OpenAI (ChatGPT) und Anthropic (Claude) über einen Zugang, dazu offene Spitzenmodelle wie GLM, Kimi und DeepSeek. Kein Vendor-Lock-in; eigener Anbieter-Schlüssel und eigener Endpunkt per Konfiguration.',
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
      'Betrieb in ISO-27001-zertifizierten Rechenzentren von Green, Campus Lupfig (Kanton Aargau), Schweiz. Die Zertifizierung liegt bei Green; eine eigene ISO-27001-Zertifizierung von Kisuno ist in Arbeit.',
      'Wo die Modelle rechnen: Kisuno bietet die aktuellen Modelle von OpenAI (ChatGPT) und Anthropic (Claude) an; sie rechnen im AWS-Rechenzentrum in Frankfurt. AWS ist ein US-Unternehmen, der US CLOUD Act greift deshalb auch bei Servern in Frankfurt, und wir sagen das offen. Für Kunden mit erhöhten Datenschutzanforderungen stehen offene Spitzenmodelle wie GLM, Kimi und DeepSeek bereit, betrieben von europäischen Unternehmen auf Servern in Europa; dort greift der CLOUD Act nicht.',
      'revDSG (Schweiz) und DSGVO, vertraglich zugesichert.',
      'Kein Training mit Kundendaten: Unabhängig vom gewählten Modell gilt, dass Eingaben und hochgeladene Daten vom Modellanbieter weder gespeichert noch für Training verwendet werden. Verankert ist das im Auftragsverarbeitungsvertrag, Abschnitt „Kein Training mit Kundendaten".',
      'Eine Ausnahme nennen wir offen: Die Missbrauchserkennung von AWS kann Nachrichten markieren, etwa bei Hinweisen auf Angriffe, Schadcode oder verbotene Inhalte. AWS bewahrt bei den GPT-Modellen markierte Nachrichten und bei Claude Fable 5 und 5.1 sämtliche Anfragen bis zu 30 Tage auf, um Missbrauch zu prüfen und zu unterbinden; an die Modellanbieter geht davon nichts, für Training wird es nicht verwendet. Quelle: https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html.',
      'Telemetrie standardmässig aus, kein Tracking ohne aktive Zustimmung.',
      'Einschränkung, die wir offen benennen: Die Websuche leitet Suchanfragen an externe Suchmaschinen weiter (ohne Nutzeridentität). „Alles bleibt in Europa" gilt für Speicherung und Inferenz, nicht für die Suchanfrage selbst.'
    ],
    hAnbindungen: 'Anbindungen',
    anbindungen: 'Vorbereitet und bei der Einrichtung pro Kunde aktiviert: ERP (Kunden, Rechnungen, Projekte), SharePoint (Dokumente aus Microsoft 365), Websuche mit Quellenangabe, Datei-Generierung, Firmenwissen als Wissensbasis. Outlook-Add-in: in Beta, heute im internen Einsatz. Excel-Add-in: in Arbeit. Alles Weitere über das Model Context Protocol (MCP): für viele verbreitete Werkzeuge (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive) gibt es fertige MCP-Server; für eigene Systeme genügt eine REST-API. Anbindungen mit gemeinsamem Dienstkonto laufen über das MCP-Gateway; dort wird jeder Aufruf geprüft und im Audit-Log festgehalten. Wird die Identität der Person bis ins Zielsystem durchgereicht (etwa bei SharePoint über das Microsoft-Konto), setzt das Zielsystem die Rechte selbst durch, und es gilt dessen Protokollierung.',
    hMarkt: 'Abgrenzung zum Markt',
    markt: 'Gegenüber Claude, Microsoft 365 Copilot, Langdock, Swisscom AI und Open WebUI ist Kisuno die einzige Option, die gleichzeitig demnächst quelloffen unter MIT erscheint, ab einem Nutzer self-hostbar ist (Open WebUI verlangt ab mehr als 50 Nutzern in einem rollierenden 30-Tage-Zeitraum eine Enterprise-Lizenz oder eine schriftliche Genehmigung, um das Branding zu entfernen), in der Schweiz gehostet wird und ERP-Anbindung mit rollenbasierter Zugriffskontrolle plus Audit bietet.',
    hSeiten: 'Seiten',
    hBlog: 'Blogartikel',
    blogLead: 'Fachartikel zu Recht, Betrieb und Branchenpraxis, jeder mit nummerierten Quellenangaben.',
    hRecht: 'Rechtliches',
    hPruef: 'Prüffragen an Anbieter von KI-Plattformen',
    pruefLead: 'Wer KI-Plattformen vergleicht, kommt mit vier Fragen an jeden Anbieter weit. Die Antworten von Kisuno stehen jeweils dahinter.',
    pruef: [
      'Wie heisst das Rechenzentrum? Kisuno: Green, Campus Lupfig (Kanton Aargau), Schweiz.',
      'Wem gehört die Zertifizierung, dem Anbieter oder seinem Rechenzentrum? Kisuno: Die ISO-27001-Zertifizierung liegt beim Rechenzentrumsbetreiber Green, eine eigene ISO-27001-Zertifizierung von Kisuno ist in Arbeit. So steht es auf der Sicherheitsseite unter https://kisuno.ai/sicherheit.',
      'Ist die Subprozessorenliste öffentlich? Kisuno: ja, offen einsehbar unter https://kisuno.ai/subprozessoren und Teil des AVV.',
      'Steht die Zusage, dass Kundendaten nicht für Training verwendet werden, im Vertrag oder nur auf der Website? Kisuno: im Auftragsverarbeitungsvertrag unter https://kisuno.ai/avv, Abschnitt 10 „Kein Training mit Kundendaten". Bindet ein Kunde einen eigenen Modell-Endpunkt ein, gelten dessen Bedingungen; darauf erstreckt sich die Zusage nicht.'
    ],
    hStatus: 'Status',
    status: 'Kisuno ist freigegeben und produktiv einsetzbar; die Beta-Phase ist abgeschlossen. „Kisuno" ist ein Produkt der Herr Informatik GmbH. Wegen der hohen Nachfrage werden die Zugänge zur betreuten Schweizer Instanz gestaffelt vergeben: Anfrage über das Formular, danach melden wir uns zum Zugang. Wer die Plattform sofort sehen will, bucht eine Live-Demo. Die betreute Instanz kostet 7 Franken (7.50 Euro) pro Person und Monat. Bis auf weiteres gilt: 50 Prozent Rabatt bei einer Laufzeit von zwölf Monaten, also 3.50 Franken (3.75 Euro) pro Person und Monat. Testen ist kostenlos und zeitlich unbefristet: Jeder neue Zugang startet mit einem Startguthaben von 50 Franken (55 Euro) für die Modellnutzung, ohne dass Sie Zahlungsdaten hinterlegen. In Planung: native Mobile-App für iOS und Android (heute bereits als installierbare PWA nutzbar), SCIM-Provisioning. In Arbeit: eigene ISO-27001-Zertifizierung und weitere Härtung der Code-Sandbox. Das Outlook-Add-in ist in Beta und intern im Einsatz, das Excel-Add-in in Arbeit. Die Basis LibreChat ist heute öffentlich unter MIT einsehbar; das GitHub-Repository mit den eigenen Erweiterungen und die Veröffentlichung unter MIT folgen demnächst.',
    hKontakt: 'Kontakt',
    kontakt: 'Der Weg zum Gespräch führt über die Website: Auf der Preisseite unter https://kisuno.ai/preise und auf der Zugangsseite unter https://kisuno.ai/warteliste lässt sich direkt eine Live-Demo buchen; das Formular auf der Zugangsseite meldet den Zugang zur betreuten Instanz an. Anschrift und Handelsregisterangaben stehen im Impressum unter https://kisuno.ai/impressum.',
    hSprachen: 'Andere Sprachfassungen',
    hVolltext: 'Volltext',
    volltext: 'Der vollständige Sichttext aller Seiten dieser Sprachfassung steht unter {full}. Dasselbe für die Dokumentation unter https://kisuno.ai/docs/llms-full.txt.',
    stand: 'Stand'
  },

  /* ------------------------------------------------------------------ en -- */
  en: {
    titel: 'Kisuno',
    zusammenfassung: 'AI work platform for companies, coming soon under the MIT licence. Access to the current models from OpenAI (ChatGPT) and Anthropic (Claude), which run in the AWS data centre in Frankfurt, and to open frontier models such as GLM, Kimi and DeepSeek, operated by European companies on servers in Europe. Self-hostable from a single user, or operated in ISO 27001 certified data centres in Switzerland. An offering of Herr Informatik GmbH, Windisch, Switzerland.',
    intro: [
      'Kisuno is an AI coworker for companies: a browser-based chat platform that connects language models to the company\'s own systems instead of being one more isolated chat window. The product is a thin fork of LibreChat (MIT, more than 40,000 GitHub stars) with its own enterprise services on top. Kisuno was called EU Cowork AI until September 2026; the vendor, the product and the operation are unchanged.',
      'The central position is European data sovereignty without giving up features. Operation is in Switzerland, the models run in the AWS data centre in Frankfurt or at European companies on servers in Europe, telemetry is off by default, and customer data does not train models. Anyone self-hosting keeps their data entirely on their own infrastructure: from a single user, with no seat limit and no forced branding.'
    ],
    hKoennen: 'What Kisuno does',
    koennen: [
      'All models: the current models from OpenAI (ChatGPT) and Anthropic (Claude) through one access point, plus open frontier models such as GLM, Kimi and DeepSeek. No vendor lock-in; your own provider key and your own endpoint by configuration.',
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
      'Operated in ISO 27001 certified data centres of Green, Campus Lupfig (canton of Aargau), Switzerland. The certification belongs to Green; a dedicated ISO 27001 certification of Kisuno is in progress.',
      'Where the models run: Kisuno offers the current models from OpenAI (ChatGPT) and Anthropic (Claude); they run in the AWS data centre in Frankfurt. AWS is a US company, so the US CLOUD Act applies even with servers in Frankfurt, and we say so openly. For customers with higher data-protection requirements, open frontier models such as GLM, Kimi and DeepSeek are available, operated by European companies on servers in Europe; the CLOUD Act does not apply there.',
      'Swiss FADP (revDSG) and GDPR, contractually assured.',
      'No training with customer data: whatever model you choose, inputs and uploaded data are neither stored by the model provider nor used for training. This is anchored in the data processing agreement, in the section on no training with customer data.',
      'One exception we state openly: AWS abuse detection can flag messages, for instance on signs of attacks, malicious code or prohibited content. AWS retains flagged messages with the GPT models, and all requests with Claude Fable 5 and 5.1, for up to 30 days to review and stop misuse; none of it is shared with the model providers or used for training. Source: https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html.',
      'Telemetry off by default, no tracking without active consent.',
      'A limitation we name openly: web search passes the query on to external search engines, without user identity. Everything stays in Europe applies to storage and inference, not to the search query itself.'
    ],
    hAnbindungen: 'Connections',
    anbindungen: 'Prepared and activated per customer during setup: ERP (customers, invoices, projects), SharePoint (documents from Microsoft 365), web search with sources, file generation, company knowledge as a knowledge base. Outlook add-in: in beta, in internal use today. Excel add-in: in progress. Everything else through the Model Context Protocol (MCP): ready-made MCP servers exist for many common tools (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive); for your own systems a REST API is enough. Connections with a shared service account run through the MCP gateway, where every call is checked and recorded in the audit log. Where the person\'s identity is passed through to the target system, as with SharePoint through the Microsoft account, that system enforces the permissions itself and its own logging applies.',
    hMarkt: 'How it differs from the market',
    markt: 'Compared with Claude, Microsoft 365 Copilot, Langdock, Swisscom AI and Open WebUI, Kisuno is the only option that is at once soon to be open source under MIT, self-hostable from a single user (Open WebUI requires an enterprise licence or written permission to remove the branding above 50 users in a rolling 30 day period), hosted in Switzerland, and offers an ERP connection with role-based access control plus audit.',
    hSeiten: 'Pages',
    hBlog: 'Articles',
    blogLead: 'Articles on law, operations and sector practice, each with numbered source references.',
    hRecht: 'Legal',
    hPruef: 'Questions to put to any AI platform vendor',
    pruefLead: 'Four questions take you a long way when comparing AI platforms. The answers for Kisuno follow each one.',
    pruef: [
      'What is the data centre called? Kisuno: Green, Campus Lupfig, canton of Aargau, Switzerland.',
      'Who holds the certification, the vendor or its data centre? Kisuno: the ISO 27001 certification belongs to the data centre operator Green; a dedicated ISO 27001 certification of Kisuno is in progress. It says so on the security page at https://kisuno.ai/en/sicherheit.',
      'Is the sub-processor list public? Kisuno: yes, openly available at https://kisuno.ai/en/subprozessoren and part of the data processing agreement.',
      'Is the assurance that customer data is not used for training in the contract, or only on the website? Kisuno: in the data processing agreement at https://kisuno.ai/en/avv, section 10 on no training with customer data. Where a customer connects their own model endpoint, that provider\'s terms apply and the assurance does not extend to it.'
    ],
    hStatus: 'Status',
    status: 'Kisuno is released and ready for production use; the beta phase is over. Kisuno is a product of Herr Informatik GmbH. Because demand is high, access to the managed Swiss instance is allocated in stages: request through the form, then we get in touch about access. Anyone who wants to see the platform straight away books a live demo. The managed instance costs CHF 7 (EUR 7.50) per person per month. Until further notice: 50 percent off with a twelve-month term, that is CHF 3.50 (EUR 3.75) per person per month. Testing is free and not limited in time: every new account starts with a starting credit of CHF 50 (EUR 55) for model usage, with no payment details required. Planned: native mobile apps for iOS and Android (already usable today as an installable PWA), SCIM provisioning. In progress: a dedicated ISO 27001 certification and further hardening of the code sandbox. The Outlook add-in is in beta and in internal use, the Excel add-in is in progress. The LibreChat base is publicly available under MIT today; the GitHub repository with our own extensions and its publication under MIT are coming soon.',
    hKontakt: 'Contact',
    kontakt: 'The way to a conversation runs through the website: on the pricing page at https://kisuno.ai/en/preise and on the access page at https://kisuno.ai/en/warteliste a live demo can be booked directly; the form on the access page registers a request for access to the managed instance. Postal address and commercial register details are in the imprint at https://kisuno.ai/en/impressum.',
    hSprachen: 'Other language versions',
    hVolltext: 'Full text',
    volltext: 'The complete visible text of every page in this language version is at {full}. The same for the documentation at https://kisuno.ai/docs/llms-full.txt.',
    stand: 'Last updated'
  },

  /* ------------------------------------------------------------------ fr -- */
  fr: {
    titel: 'Kisuno',
    zusammenfassung: 'Plateforme de travail IA pour les entreprises, qui paraîtra prochainement sous licence MIT. Accès aux modèles actuels d\'OpenAI (ChatGPT) et d\'Anthropic (Claude), exécutés dans le centre de données AWS de Francfort, et à des modèles ouverts de premier plan comme GLM, Kimi et DeepSeek, exploités par des entreprises européennes sur des serveurs en Europe. Auto-hébergeable dès un utilisateur, ou exploitée dans des centres de données certifiés ISO 27001 en Suisse. Une offre de Herr Informatik GmbH, Windisch (CH).',
    intro: [
      'Kisuno est un collègue IA pour les entreprises : une plateforme de chat dans le navigateur qui relie les modèles de langage aux systèmes de la société, au lieu d\'être une fenêtre de chat isolée de plus. Le produit est un fork léger de LibreChat (MIT, plus de 40 000 étoiles sur GitHub), complété par nos propres services pour l\'entreprise. Kisuno s\'appelait EU Cowork AI jusqu\'en septembre 2026 ; l\'éditeur, le produit et l\'exploitation restent les mêmes.',
      'Le positionnement central est la souveraineté européenne des données sans renoncer aux fonctions. L\'exploitation a lieu en Suisse, les modèles sont exécutés dans le centre de données AWS de Francfort ou chez des entreprises européennes sur des serveurs en Europe, la télémétrie est désactivée par défaut et les données clients n\'entraînent aucun modèle. Qui héberge lui-même garde ses données entièrement sur sa propre infrastructure : dès un utilisateur, sans limite de sièges et sans marque imposée.'
    ],
    hKoennen: 'Ce que fait Kisuno',
    koennen: [
      'Tous les modèles : les modèles actuels d\'OpenAI (ChatGPT) et d\'Anthropic (Claude) par un seul accès, ainsi que des modèles ouverts de premier plan comme GLM, Kimi et DeepSeek. Aucun enfermement propriétaire ; clé de fournisseur et point de terminaison propres par configuration.',
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
      'Exploitation dans des centres de données certifiés ISO 27001 de Green, Campus Lupfig (canton d\'Argovie), Suisse. La certification appartient à Green ; une certification ISO 27001 propre à Kisuno est en cours.',
      'Où les modèles calculent : Kisuno propose les modèles actuels d\'OpenAI (ChatGPT) et d\'Anthropic (Claude) ; ils sont exécutés dans le centre de données AWS de Francfort. AWS est une entreprise américaine, le US CLOUD Act s\'applique donc même avec des serveurs à Francfort, et nous le disons ouvertement. Pour les clients aux exigences élevées en matière de protection des données, des modèles ouverts de premier plan comme GLM, Kimi et DeepSeek sont disponibles, exploités par des entreprises européennes sur des serveurs en Europe ; le CLOUD Act ne s\'y applique pas.',
      'LPD révisée (Suisse) et RGPD, garantis contractuellement.',
      'Aucun entraînement avec les données clients : quel que soit le modèle choisi, les saisies et les données téléversées ne sont ni conservées par le fournisseur de modèle ni utilisées pour l\'entraînement. C\'est inscrit au contrat de sous-traitance, section sur l\'absence d\'entraînement avec les données clients.',
      'Une exception que nous nommons ouvertement : la détection d\'abus d\'AWS peut marquer des messages, par exemple en cas d\'indices d\'attaques, de code malveillant ou de contenus interdits. AWS conserve jusqu\'à 30 jours les messages marqués des modèles GPT et l\'ensemble des requêtes de Claude Fable 5 et 5.1, pour examiner et stopper les abus ; rien n\'est transmis aux fournisseurs de modèles ni utilisé pour l\'entraînement. Source : https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html.',
      'Télémétrie désactivée par défaut, aucun suivi sans consentement actif.',
      'Une limite que nous nommons ouvertement : la recherche web transmet la requête à des moteurs de recherche externes, sans identité de l\'utilisateur. Tout reste en Europe vaut pour le stockage et l\'inférence, pas pour la requête elle-même.'
    ],
    hAnbindungen: 'Connexions',
    anbindungen: 'Préparées et activées par client lors de la mise en place : ERP (clients, factures, projets), SharePoint (documents de Microsoft 365), recherche web avec sources, génération de fichiers, savoir de l\'entreprise comme base de connaissances. Complément Outlook : en bêta, utilisé en interne aujourd\'hui. Complément Excel : en cours. Tout le reste passe par le Model Context Protocol (MCP) : des serveurs MCP prêts à l\'emploi existent pour de nombreux outils courants (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive) ; pour vos propres systèmes une API REST suffit. Les connexions avec un compte de service commun passent par la passerelle MCP, où chaque appel est vérifié et consigné dans le journal d\'audit. Lorsque l\'identité de la personne est transmise jusqu\'au système cible, comme pour SharePoint via le compte Microsoft, ce système applique lui-même les droits et sa propre journalisation vaut.',
    hMarkt: 'Différences avec le marché',
    markt: 'Face à Claude, Microsoft 365 Copilot, Langdock, Swisscom AI et Open WebUI, Kisuno est la seule option qui soit à la fois bientôt open source sous MIT, auto-hébergeable dès un utilisateur (Open WebUI exige une licence entreprise ou une autorisation écrite pour retirer la marque au-delà de 50 utilisateurs sur une période glissante de 30 jours), hébergée en Suisse, et qui offre une connexion à l\'ERP avec contrôle d\'accès par rôle et audit.',
    hSeiten: 'Pages',
    hBlog: 'Articles',
    blogLead: 'Articles de fond sur le droit, l\'exploitation et la pratique sectorielle, chacun avec des sources numérotées.',
    hRecht: 'Mentions légales',
    hPruef: 'Questions à poser à tout éditeur de plateforme IA',
    pruefLead: 'Quatre questions mènent loin quand on compare des plateformes IA. Les réponses de Kisuno suivent chacune d\'elles.',
    pruef: [
      'Comment s\'appelle le centre de données ? Kisuno : Green, Campus Lupfig, canton d\'Argovie, Suisse.',
      'À qui appartient la certification, à l\'éditeur ou à son centre de données ? Kisuno : la certification ISO 27001 appartient à l\'exploitant Green ; une certification ISO 27001 propre à Kisuno est en cours. C\'est écrit sur la page sécurité à https://kisuno.ai/fr/sicherheit.',
      'La liste des sous-traitants est-elle publique ? Kisuno : oui, consultable librement à https://kisuno.ai/fr/subprozessoren et partie intégrante du contrat de sous-traitance.',
      'L\'engagement de ne pas utiliser les données clients pour l\'entraînement figure-t-il au contrat ou seulement sur le site ? Kisuno : dans le contrat de sous-traitance à https://kisuno.ai/fr/avv, section 10 sur l\'absence d\'entraînement avec les données clients. Si un client relie son propre point de terminaison de modèle, ce sont les conditions de ce fournisseur qui s\'appliquent et l\'engagement ne s\'y étend pas.'
    ],
    hStatus: 'État',
    status: 'Kisuno est publié et utilisable en production ; la phase bêta est terminée. Kisuno est un produit de Herr Informatik GmbH. En raison de la forte demande, les accès à l\'instance suisse gérée sont attribués par vagues : demande via le formulaire, puis nous revenons vers vous au sujet de l\'accès. Qui veut voir la plateforme immédiatement réserve une démo en direct. L\'instance gérée coûte 7 francs suisses (7,50 euros) par personne et par mois. Jusqu\'à nouvel ordre : 50 pour cent de rabais pour une durée de douze mois, soit 3,50 francs (3,75 euros) par personne et par mois. L\'essai est gratuit et sans limite de durée : chaque nouvel accès démarre avec un crédit de démarrage de 50 francs (55 euros) pour l\'utilisation des modèles, sans aucune donnée de paiement. Prévu : applications mobiles natives pour iOS et Android (déjà utilisable aujourd\'hui comme PWA installable), provisionnement SCIM. En cours : une certification ISO 27001 propre et un durcissement supplémentaire du bac à sable de code. Le complément Outlook est en bêta et utilisé en interne, le complément Excel est en cours. La base LibreChat est aujourd\'hui publiquement consultable sous MIT ; le dépôt GitHub avec nos propres extensions et sa publication sous MIT sont à venir prochainement.',
    hKontakt: 'Contact',
    kontakt: 'Le chemin vers un échange passe par le site : sur la page des tarifs à https://kisuno.ai/fr/preise et sur la page d\'accès à https://kisuno.ai/fr/warteliste, une démo en direct se réserve directement ; le formulaire de la page d\'accès enregistre une demande d\'accès à l\'instance gérée. Adresse postale et données du registre du commerce figurent dans les mentions légales à https://kisuno.ai/fr/impressum.',
    hSprachen: 'Autres versions linguistiques',
    hVolltext: 'Texte intégral',
    volltext: 'Le texte visible complet de toutes les pages de cette version linguistique se trouve à {full}. De même pour la documentation à https://kisuno.ai/docs/llms-full.txt.',
    stand: 'Mise à jour'
  },

  /* ------------------------------------------------------------------ it -- */
  it: {
    titel: 'Kisuno',
    zusammenfassung: 'Piattaforma di lavoro IA per le imprese, che sarà rilasciata a breve con licenza MIT. Accesso ai modelli attuali di OpenAI (ChatGPT) e Anthropic (Claude), eseguiti nel data center AWS di Francoforte, e a modelli aperti di punta come GLM, Kimi e DeepSeek, gestiti da aziende europee su server in Europa. Ospitabile in proprio già da un utente, oppure gestita in data center certificati ISO 27001 in Svizzera. Un\'offerta di Herr Informatik GmbH, Windisch (CH).',
    intro: [
      'Kisuno è un collega IA per le imprese: una piattaforma di chat nel browser che collega i modelli linguistici ai sistemi aziendali, invece di essere l\'ennesima finestra di chat isolata. Il prodotto è un fork leggero di LibreChat (MIT, oltre 40.000 stelle su GitHub), completato da servizi propri per l\'impresa. Kisuno si chiamava EU Cowork AI fino a settembre 2026; fornitore, prodotto ed esercizio sono rimasti gli stessi.',
      'Il posizionamento centrale è la sovranità europea dei dati senza rinunciare alle funzioni. L\'esercizio avviene in Svizzera, i modelli vengono eseguiti nel data center AWS di Francoforte oppure presso aziende europee su server in Europa, la telemetria è disattivata per impostazione predefinita e i dati dei clienti non addestrano alcun modello. Chi ospita in proprio tiene i suoi dati interamente sulla propria infrastruttura: già da un utente, senza limite di postazioni e senza marchio imposto.'
    ],
    hKoennen: 'Che cosa fa Kisuno',
    koennen: [
      'Tutti i modelli: i modelli attuali di OpenAI (ChatGPT) e Anthropic (Claude) da un unico accesso, oltre a modelli aperti di punta come GLM, Kimi e DeepSeek. Nessun vincolo con il fornitore; chiave del fornitore e endpoint propri tramite configurazione.',
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
      'Esercizio in data center certificati ISO 27001 di Green, Campus Lupfig (Canton Argovia), Svizzera. La certificazione appartiene a Green; una certificazione ISO 27001 propria di Kisuno è in corso.',
      'Dove vengono eseguiti i modelli: Kisuno offre i modelli attuali di OpenAI (ChatGPT) e Anthropic (Claude); vengono eseguiti nel data center AWS di Francoforte. AWS è un\'azienda statunitense, quindi lo US CLOUD Act si applica anche con server a Francoforte, e lo diciamo apertamente. Per i clienti con requisiti elevati di protezione dei dati sono disponibili modelli aperti di punta come GLM, Kimi e DeepSeek, gestiti da aziende europee su server in Europa; lì il CLOUD Act non si applica.',
      'LPD riveduta (Svizzera) e GDPR, garantiti contrattualmente.',
      'Nessun addestramento con i dati dei clienti: qualunque sia il modello scelto, gli input e i dati caricati non vengono né conservati dal fornitore del modello né utilizzati per l\'addestramento. È fissato nel contratto di trattamento, sezione sull\'assenza di addestramento con i dati dei clienti.',
      'Un\'eccezione che dichiariamo apertamente: il rilevamento degli abusi di AWS può contrassegnare messaggi, ad esempio in presenza di indizi di attacchi, codice dannoso o contenuti vietati. AWS conserva fino a 30 giorni i messaggi contrassegnati dei modelli GPT e tutte le richieste di Claude Fable 5 e 5.1, per verificare e fermare gli abusi; nulla viene trasmesso ai fornitori dei modelli né usato per l\'addestramento. Fonte: https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html.',
      'Telemetria disattivata per impostazione predefinita, nessun tracciamento senza consenso attivo.',
      'Un limite che indichiamo apertamente: la ricerca web trasmette la richiesta a motori di ricerca esterni, senza identità dell\'utente. Tutto resta in Europa vale per la memorizzazione e l\'inferenza, non per la richiesta di ricerca in sé.'
    ],
    hAnbindungen: 'Collegamenti',
    anbindungen: 'Predisposti e attivati per cliente in fase di configurazione: ERP (clienti, fatture, progetti), SharePoint (documenti da Microsoft 365), ricerca web con fonti, generazione di file, sapere aziendale come base di conoscenza. Add-in per Outlook: in beta, oggi in uso interno. Add-in per Excel: in lavorazione. Tutto il resto tramite il Model Context Protocol (MCP): per molti strumenti diffusi (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive) esistono server MCP già pronti; per i sistemi propri basta una API REST. I collegamenti con un account di servizio comune passano dal gateway MCP, dove ogni chiamata viene verificata e annotata nel registro di audit. Quando l\'identità della persona viene trasmessa fino al sistema di destinazione, come per SharePoint tramite l\'account Microsoft, è quel sistema ad applicare i permessi e vale la sua registrazione.',
    hMarkt: 'Differenze rispetto al mercato',
    markt: 'Rispetto a Claude, Microsoft 365 Copilot, Langdock, Swisscom AI e Open WebUI, Kisuno è l\'unica opzione che sia allo stesso tempo presto open source con licenza MIT, ospitabile in proprio già da un utente (Open WebUI richiede una licenza enterprise o un\'autorizzazione scritta per rimuovere il marchio oltre i 50 utenti in un periodo mobile di 30 giorni), gestita in Svizzera e dotata di collegamento all\'ERP con controllo degli accessi per ruolo e audit.',
    hSeiten: 'Pagine',
    hBlog: 'Articoli',
    blogLead: 'Articoli di approfondimento su diritto, esercizio e pratica di settore, ciascuno con fonti numerate.',
    hRecht: 'Note legali',
    hPruef: 'Domande da porre a ogni fornitore di piattaforme IA',
    pruefLead: 'Quattro domande portano lontano quando si confrontano piattaforme IA. Le risposte di Kisuno seguono ciascuna di esse.',
    pruef: [
      'Come si chiama il data center? Kisuno: Green, Campus Lupfig, Canton Argovia, Svizzera.',
      'A chi appartiene la certificazione, al fornitore o al suo data center? Kisuno: la certificazione ISO 27001 appartiene al gestore Green; una certificazione ISO 27001 propria di Kisuno è in corso. Così è scritto sulla pagina della sicurezza a https://kisuno.ai/it/sicherheit.',
      'L\'elenco dei subresponsabili è pubblico? Kisuno: sì, liberamente consultabile a https://kisuno.ai/it/subprozessoren e parte del contratto di trattamento.',
      'L\'impegno a non usare i dati dei clienti per l\'addestramento è nel contratto o solo sul sito? Kisuno: nel contratto di trattamento a https://kisuno.ai/it/avv, sezione 10 sull\'assenza di addestramento con i dati dei clienti. Se un cliente collega un proprio endpoint di modello, valgono le condizioni di quel fornitore e l\'impegno non si estende a esso.'
    ],
    hStatus: 'Stato',
    status: 'Kisuno è rilasciato e utilizzabile in produzione; la fase beta è conclusa. Kisuno è un prodotto di Herr Informatik GmbH. Data l\'elevata domanda, gli accessi all\'istanza svizzera gestita vengono assegnati in modo graduale: richiesta tramite il modulo, poi la ricontattiamo per l\'accesso. Chi vuole vedere subito la piattaforma prenota una demo dal vivo. L\'istanza gestita costa 7 franchi (7,50 euro) a persona al mese. Fino a nuovo avviso: sconto del 50 per cento con una durata di dodici mesi, quindi 3,50 franchi (3,75 euro) a persona al mese. La prova è gratuita e senza limiti di tempo: ogni nuovo accesso parte con un credito iniziale di 50 franchi (55 euro) per l\'uso dei modelli, senza alcun dato di pagamento. In programma: app mobili native per iOS e Android (già oggi utilizzabile come PWA installabile), provisioning SCIM. In lavorazione: una certificazione ISO 27001 propria e un ulteriore irrobustimento della sandbox di codice. L\'add-in per Outlook è in beta e in uso interno, quello per Excel è in lavorazione. La base LibreChat è oggi pubblicamente consultabile con licenza MIT; il repository GitHub con le nostre estensioni e la pubblicazione con licenza MIT sono in arrivo a breve.',
    hKontakt: 'Contatto',
    kontakt: 'La via per un colloquio passa dal sito: sulla pagina dei prezzi a https://kisuno.ai/it/preise e sulla pagina di accesso a https://kisuno.ai/it/warteliste si prenota direttamente una demo dal vivo; il modulo sulla pagina di accesso registra una richiesta di accesso all\'istanza gestita. Indirizzo e dati del registro di commercio si trovano nelle note legali a https://kisuno.ai/it/impressum.',
    hSprachen: 'Altre versioni linguistiche',
    hVolltext: 'Testo integrale',
    volltext: 'Il testo visibile completo di tutte le pagine di questa versione linguistica si trova a {full}. Lo stesso per la documentazione a https://kisuno.ai/docs/llms-full.txt.',
    stand: 'Aggiornamento'
  },

  /* ------------------------------------------------------------------ es -- */
  es: {
    titel: 'Kisuno',
    zusammenfassung: 'Plataforma de trabajo con IA para empresas, que se publicará en breve bajo licencia MIT. Acceso a los modelos actuales de OpenAI (ChatGPT) y Anthropic (Claude), que se ejecutan en el centro de datos de AWS en Fráncfort, y a modelos abiertos de primer nivel como GLM, Kimi y DeepSeek, operados por empresas europeas en servidores en Europa. Autoalojable desde un solo usuario, u operada en centros de datos certificados ISO 27001 en Suiza. Una oferta de Herr Informatik GmbH, Windisch (CH).',
    intro: [
      'Kisuno es un colega de IA para empresas: una plataforma de chat en el navegador que conecta los modelos de lenguaje con los sistemas de la empresa, en lugar de ser una ventana de chat aislada más. El producto es un fork ligero de LibreChat (MIT, más de 40.000 estrellas en GitHub), ampliado con servicios propios para la empresa. Kisuno se llamaba EU Cowork AI hasta septiembre de 2026; el proveedor, el producto y la operación siguen siendo los mismos.',
      'El posicionamiento central es la soberanía europea de los datos sin renunciar a funciones. La operación se realiza en Suiza, los modelos se ejecutan en el centro de datos de AWS en Fráncfort o en empresas europeas con servidores en Europa, la telemetría está desactivada de forma predeterminada y los datos de los clientes no entrenan ningún modelo. Quien se autoaloja conserva sus datos por completo en su propia infraestructura: desde un solo usuario, sin límite de puestos y sin marca impuesta.'
    ],
    hKoennen: 'Qué hace Kisuno',
    koennen: [
      'Todos los modelos: los modelos actuales de OpenAI (ChatGPT) y Anthropic (Claude) desde un único acceso, además de modelos abiertos de primer nivel como GLM, Kimi y DeepSeek. Sin dependencia de un proveedor; clave de proveedor y punto de acceso propios mediante configuración.',
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
      'Operación en centros de datos certificados ISO 27001 de Green, Campus Lupfig (cantón de Argovia), Suiza. La certificación pertenece a Green; una certificación ISO 27001 propia de Kisuno está en curso.',
      'Dónde se ejecutan los modelos: Kisuno ofrece los modelos actuales de OpenAI (ChatGPT) y Anthropic (Claude); se ejecutan en el centro de datos de AWS en Fráncfort. AWS es una empresa estadounidense, por lo que el US CLOUD Act se aplica incluso con servidores en Fráncfort, y lo decimos abiertamente. Para clientes con altos requisitos de protección de datos están disponibles modelos abiertos de primer nivel como GLM, Kimi y DeepSeek, operados por empresas europeas en servidores en Europa; allí el CLOUD Act no se aplica.',
      'LPD revisada (Suiza) y RGPD, garantizados contractualmente.',
      'Sin entrenamiento con datos de clientes: sea cual sea el modelo elegido, las entradas y los datos subidos no son almacenados por el proveedor del modelo ni utilizados para el entrenamiento. Está fijado en el contrato de encargo de tratamiento, sección sobre la ausencia de entrenamiento con datos de clientes.',
      'Una excepción que nombramos abiertamente: la detección de abusos de AWS puede marcar mensajes, por ejemplo ante indicios de ataques, código malicioso o contenidos prohibidos. AWS conserva hasta 30 días los mensajes marcados de los modelos GPT y todas las solicitudes de Claude Fable 5 y 5.1, para examinar y detener los abusos; nada se transmite a los proveedores de modelos ni se utiliza para el entrenamiento. Fuente: https://docs.aws.amazon.com/bedrock/latest/userguide/abuse-detection.html.',
      'Telemetría desactivada de forma predeterminada, sin seguimiento sin consentimiento activo.',
      'Una limitación que nombramos abiertamente: la búsqueda web transmite la consulta a buscadores externos, sin identidad del usuario. Todo se queda en Europa vale para el almacenamiento y la inferencia, no para la consulta de búsqueda en sí.'
    ],
    hAnbindungen: 'Conexiones',
    anbindungen: 'Preparadas y activadas por cliente durante la configuración: ERP (clientes, facturas, proyectos), SharePoint (documentos de Microsoft 365), búsqueda web con fuentes, generación de archivos, conocimiento de la empresa como base de conocimiento. Complemento de Outlook: en beta, hoy en uso interno. Complemento de Excel: en curso. Todo lo demás a través del Model Context Protocol (MCP): para muchas herramientas extendidas (HubSpot, Slack, Jira, Confluence, Notion, Linear, GitHub, Sentry, PostgreSQL, Stripe, Google Drive) existen servidores MCP ya listos; para los sistemas propios basta con una API REST. Las conexiones con una cuenta de servicio común pasan por la pasarela MCP, donde cada llamada se comprueba y se anota en el registro de auditoría. Cuando la identidad de la persona se transmite hasta el sistema de destino, como en SharePoint mediante la cuenta de Microsoft, es ese sistema el que aplica los permisos y rige su propio registro.',
    hMarkt: 'Diferencias con el mercado',
    markt: 'Frente a Claude, Microsoft 365 Copilot, Langdock, Swisscom AI y Open WebUI, Kisuno es la única opción que pronto será de código abierto bajo MIT y que a la vez es autoalojable desde un solo usuario (Open WebUI exige una licencia empresarial o una autorización escrita para retirar la marca a partir de 50 usuarios en un periodo móvil de 30 días), está alojada en Suiza y ofrece conexión al ERP con control de acceso por rol y auditoría.',
    hSeiten: 'Páginas',
    hBlog: 'Artículos',
    blogLead: 'Artículos de fondo sobre derecho, operación y práctica sectorial, cada uno con fuentes numeradas.',
    hRecht: 'Aviso legal',
    hPruef: 'Preguntas para cualquier proveedor de plataformas de IA',
    pruefLead: 'Cuatro preguntas llevan lejos al comparar plataformas de IA. Las respuestas de Kisuno siguen a cada una.',
    pruef: [
      '¿Cómo se llama el centro de datos? Kisuno: Green, Campus Lupfig, cantón de Argovia, Suiza.',
      '¿De quién es la certificación, del proveedor o de su centro de datos? Kisuno: la certificación ISO 27001 pertenece al operador Green; una certificación ISO 27001 propia de Kisuno está en curso. Así consta en la página de seguridad en https://kisuno.ai/es/sicherheit.',
      '¿Es pública la lista de subencargados? Kisuno: sí, de consulta abierta en https://kisuno.ai/es/subprozessoren y parte del contrato de encargo de tratamiento.',
      '¿El compromiso de no usar los datos de los clientes para entrenamiento figura en el contrato o solo en el sitio web? Kisuno: en el contrato de encargo de tratamiento en https://kisuno.ai/es/avv, sección 10 sobre la ausencia de entrenamiento con datos de clientes. Si un cliente conecta su propio punto de acceso de modelo, rigen las condiciones de ese proveedor y el compromiso no se extiende a él.'
    ],
    hStatus: 'Estado',
    status: 'Kisuno está publicado y es utilizable en producción; la fase beta ha terminado. Kisuno es un producto de Herr Informatik GmbH. Debido a la alta demanda, los accesos a la instancia suiza gestionada se asignan por fases: solicitud mediante el formulario y después le escribimos sobre el acceso. Quien quiera ver la plataforma de inmediato reserva una demo en vivo. La instancia gestionada cuesta 7 francos (7,50 euros) por persona al mes. Hasta nuevo aviso: 50 por ciento de descuento con una duración de doce meses, es decir 3,50 francos (3,75 euros) por persona al mes. Probar es gratuito y sin límite de tiempo: cada nuevo acceso comienza con un crédito inicial de 50 francos (55 euros) para el uso de los modelos, sin datos de pago. En proyecto: aplicaciones móviles nativas para iOS y Android (ya hoy utilizable como PWA instalable), aprovisionamiento SCIM. En curso: una certificación ISO 27001 propia y un endurecimiento adicional del entorno aislado de código. El complemento de Outlook está en beta y en uso interno, el de Excel está en curso. La base LibreChat es hoy de consulta pública bajo MIT; el repositorio de GitHub con nuestras propias ampliaciones y su publicación bajo MIT llegarán en breve.',
    hKontakt: 'Contacto',
    kontakt: 'El camino hacia una conversación pasa por el sitio web: en la página de precios en https://kisuno.ai/es/preise y en la página de acceso en https://kisuno.ai/es/warteliste se reserva directamente una demo en vivo; el formulario de la página de acceso registra una solicitud de acceso a la instancia gestionada. Dirección postal y datos del registro mercantil figuran en el aviso legal en https://kisuno.ai/es/impressum.',
    hSprachen: 'Otras versiones lingüísticas',
    hVolltext: 'Texto completo',
    volltext: 'El texto visible completo de todas las páginas de esta versión lingüística está en {full}. Lo mismo para la documentación en https://kisuno.ai/docs/llms-full.txt.',
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
