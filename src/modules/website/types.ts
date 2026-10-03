export type TemplateId = 'klassisch' | 'magazin' | 'galerie'
export type FontChoice = 'modern' | 'serif' | 'rund'
export type ImageSize = 'klein' | 'mittel' | 'gross'

/** Einstellungen der Reise-Webseite (eine pro Reise). */
export interface WebsiteSettings {
  tripId: string
  template: TemplateId
  /** Akzentfarbe als #rrggbb */
  accent: string
  font: FontChoice
  dark: boolean
  title: string
  subtitle: string
  /** Einleitungstext oben auf der Seite */
  intro: string
  author: string
  onlyHighlights: boolean
  showMood: boolean
  showLocation: boolean
  imageSize: ImageSize
  updatedAt: string
}

export type WebsiteSettingsDraft = Omit<WebsiteSettings, 'tripId' | 'updatedAt'>

/** Ein Foto, wie es die Vorlage bekommt. */
export interface SitePhoto {
  src: string
  caption: string
  width: number
  height: number
}

export interface SiteEntry {
  title: string
  text: string
  mood: number
  location: string
  photos: SitePhoto[]
}

export interface SiteDay {
  date: string
  dayNumber: number | null
  entries: SiteEntry[]
}

/** Alles, was eine Vorlage zum Zeichnen braucht – ohne Datenbank, ohne Browser. */
export interface SiteData {
  title: string
  subtitle: string
  intro: string
  author: string
  destination: string
  startDate: string
  endDate: string
  participants: string[]
  cover: SitePhoto | null
  days: SiteDay[]
  stats: { days: number; entries: number; photos: number }
  generatedAt: string
}

export const TEMPLATE_INFO: Record<TemplateId, { title: string; description: string; icon: string }> = {
  klassisch: { title: 'Klassisch', description: 'Titelbild, dann Tag für Tag als Karten', icon: 'journal-richtext' },
  magazin: { title: 'Magazin', description: 'Große Bilder, Text daneben – wie eine Reisereportage', icon: 'newspaper' },
  galerie: { title: 'Galerie', description: 'Fotos im Vordergrund, kurze Texte', icon: 'grid-3x3-gap' }
}

export const FONT_INFO: Record<FontChoice, { label: string; css: string }> = {
  modern: { label: 'Modern', css: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" },
  serif: { label: 'Klassisch (Serif)', css: "Georgia, 'Times New Roman', serif" },
  rund: { label: 'Rund', css: "ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, sans-serif" }
}

export const IMAGE_EDGE: Record<ImageSize, { edge: number; label: string }> = {
  klein: { edge: 1024, label: 'Klein (schnell zu teilen)' },
  mittel: { edge: 1600, label: 'Mittel' },
  gross: { edge: 2048, label: 'Groß (beste Qualität)' }
}

export const ACCENT_PRESETS = ['#0d6efd', '#0f766e', '#c2410c', '#be123c', '#7c3aed', '#334155']
