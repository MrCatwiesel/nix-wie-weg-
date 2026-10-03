/**
 * Zentrale Einstellungen der App – hier anpassen, nicht im Code verteilt.
 */
export const APP_CONFIG = {
  name: 'Nix wie weg',
  /** Quellcode (öffentlich) */
  repositoryUrl: 'https://github.com/MrCatwiesel/nix-wie-weg-',
  /**
   * Spendenlink, z. B. https://ko-fi.com/<name>, https://liberapay.com/<name> oder https://github.com/sponsors/<name>.
   * Leer lassen = Spenden-Hinweise werden nicht angezeigt.
   */
  donationUrl: '',
  /** Anzeigename der Spendenplattform */
  donationLabel: 'Ko-fi'
} as const

/** Versionsnummer aus package.json (wird beim Bauen eingesetzt). */
export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev'
