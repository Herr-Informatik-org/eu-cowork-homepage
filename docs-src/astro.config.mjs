// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

/**
 * Dokumentation von EU Cowork AI.
 *
 * Ausgabe geht nach ../docs, also website/docs. Die Website selbst ist eine
 * reine Sammlung statischer Dateien ohne Build-Schritt und wird per Vercel-CLI
 * hochgeladen. Damit das zusammenpasst, erzeugt dieses Projekt ebenfalls nur
 * statische Dateien und legt sie direkt an der richtigen Stelle im Website-Baum ab.
 *
 * trailingSlash 'never' passt zu "trailingSlash": false in website/vercel.json:
 * Astro schreibt interne Links ohne Schrägstrich am Ende, Vercel liefert dafür
 * die index.html aus dem Ordner aus. Ohne diese Einstellung würde jeder interne
 * Klick eine Weiterleitung auslösen.
 */
export default defineConfig({
  site: 'https://eucowork.ai',
  base: '/docs',
  outDir: '../docs',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [
    // Eigene Sitemap unter /docs/sitemap-index.xml. Die Haupt-sitemap.xml der
    // Website bleibt handgepflegt; beide sind in robots.txt eingetragen.
    sitemap({
      i18n: { defaultLocale: 'de', locales: { de: 'de-CH', en: 'en' } },
    }),
    starlight({
      title: 'EU Cowork AI',
      description:
        'Dokumentation von EU Cowork AI: Installation, Betrieb, Administration und eigene Konnektoren.',
      tagline: 'Dokumentation',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
      },
      favicon: '/favicon.ico',
      customCss: ['./src/styles/eucowork.css'],
      expressiveCode: {
        // Lange Befehlszeilen umbrechen statt waagrecht scrollen. Eine Zeile,
        // die man erst scrollen muss, wird beim Kopieren gern halbiert.
        defaultProps: { wrap: true },
        styleOverrides: { borderRadius: '12px' },
      },
      lastUpdated: false,
      pagination: true,
      credits: false,
      // Sobald das Repository öffentlich ist, hier eintragen. Bis dahin
      // bewusst weggelassen, damit kein Link ins Leere zeigt.
      // editLink: { baseUrl: 'https://github.com/<org>/<repo>/edit/main/website/docs-src/' },
      // social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/<org>/<repo>' }],
      defaultLocale: 'root',
      locales: {
        root: { label: 'Deutsch', lang: 'de-CH' },
        en: { label: 'English', lang: 'en' },
      },
      // Bewusst keine überschriebenen Komponenten. Die Kopfleiste, die
      // Seitenleiste und das Suchfeld kommen unverändert von Starlight;
      // eigene Nachbauten sehen schnell zusammengesetzt aus.
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: 'https://eucowork.ai/og/eucowork-og.png' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:card', content: 'summary_large_image' },
        },
        {
          tag: 'link',
          attrs: { rel: 'preload', href: '/fonts/inter-400-latin.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
        },
      ],
      sidebar: [
        {
          label: 'Erste Schritte',
          translations: { en: 'Getting started' },
          items: [{ autogenerate: { directory: 'erste-schritte' } }],
        },
        {
          label: 'Installation und Betrieb',
          translations: { en: 'Install and operate' },
          items: [{ autogenerate: { directory: 'betrieb' } }],
        },
        {
          label: 'Für Mitarbeitende',
          translations: { en: 'For your team' },
          items: [{ autogenerate: { directory: 'funktionen' } }],
        },
        {
          label: 'Administration',
          translations: { en: 'Administration' },
          items: [{ autogenerate: { directory: 'administration' } }],
        },
        {
          label: 'Konnektoren und MCP',
          translations: { en: 'Connectors and MCP' },
          items: [{ autogenerate: { directory: 'konnektoren' } }],
        },
        {
          label: 'Referenz',
          translations: { en: 'Reference' },
          items: [{ autogenerate: { directory: 'referenz' } }],
        },
      ],
    }),
  ],
});
