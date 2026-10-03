import type { SiteData, WebsiteSettingsDraft } from '../types'

/** Kontext, den jede Vorlage bekommt. */
export interface TemplateContext {
  site: SiteData
  settings: Pick<WebsiteSettingsDraft, 'showMood' | 'showLocation'>
}

/**
 * Eine Vorlage liefert nur den <body>-Inhalt und eigenes CSS.
 * Kopf, Bootstrap, Farben, Schrift und die Fotoansicht kommen aus render.ts.
 * Neue Vorlage: Datei anlegen, in templates/index.ts eintragen, in TEMPLATE_INFO beschreiben.
 */
export interface SiteTemplate {
  css: string
  body: (ctx: TemplateContext) => string
}
