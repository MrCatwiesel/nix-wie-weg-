import { formatDate } from '../../../core/format'
import { esc } from '../logic'
import type { SiteData } from '../types'

/** Gemeinsame Bausteine aller Vorlagen. */

export function statsLine(s: SiteData): string {
  const parts = [
    `${s.stats.days} ${s.stats.days === 1 ? 'Tag' : 'Tage'}`,
    s.stats.photos ? `${s.stats.photos} Fotos` : '',
    s.participants.length ? `mit ${esc(s.participants.join(', '))}` : ''
  ].filter(Boolean)
  return `<p class="text-body-secondary small mb-4 stats">${parts.join(' · ')}</p>`
}

export function footer(s: SiteData): string {
  const by = s.author ? `${esc(s.author)} · ` : ''
  return `
  <footer class="border-top py-4 mt-4">
    <div class="container small text-body-secondary text-center">
      ${by}${esc(s.destination)}, ${formatDate(s.startDate)} – ${formatDate(s.endDate)}<br>
      Erstellt mit „Nix wie weg“ am ${formatDate(s.generatedAt.slice(0, 10))}
    </div>
  </footer>`
}
