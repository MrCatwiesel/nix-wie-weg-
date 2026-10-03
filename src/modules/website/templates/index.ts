import type { TemplateId } from '../types'
import type { SiteTemplate } from './types'
import { klassisch } from './klassisch'
import { magazin } from './magazin'
import { galerie } from './galerie'

/** Alle verfügbaren Vorlagen. Neue Vorlage hier eintragen. */
export const TEMPLATES: Record<TemplateId, SiteTemplate> = { klassisch, magazin, galerie }
