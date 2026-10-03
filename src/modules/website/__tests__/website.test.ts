import { describe, expect, it } from 'vitest'
import { buildSiteData, defaultSettings, esc, fileNameFor, paragraphs, rgbOf, safeColor, type EntryInput } from '../logic'
import { renderSite } from '../render'
import type { SitePhoto, WebsiteSettingsDraft } from '../types'

const trip = { title: 'Sommer am Gardasee', destination: 'Gardasee', startDate: '2026-07-01', endDate: '2026-07-07', participants: ['Ich', 'Anna'] }
const photo = (w: number, h: number, caption = ''): SitePhoto => ({ src: 'data:image/jpeg;base64,AAAA', caption, width: w, height: h })
const entry = (over: Partial<EntryInput>): EntryInput => ({
  date: '2026-07-02', title: 'Tag am See', text: 'Schön.', mood: 5, location: 'Riva', highlight: true, photos: [], createdAt: '2026-07-02T10:00:00Z', ...over
})

describe('Hilfen', () => {
  it('maskiert HTML', () => {
    expect(esc(`<script>alert("x")</script> & 'y'`)).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;')
  })
  it('macht Absätze und Zeilenumbrüche', () => {
    expect(paragraphs('Eins\nZwei\n\nDrei <b>')).toBe('<p>Eins<br>Zwei</p>\n<p>Drei &lt;b&gt;</p>')
    expect(paragraphs('   ')).toBe('')
  })
  it('lässt nur gültige Farben zu', () => {
    expect(safeColor('#AABBCC')).toBe('#aabbcc')
    expect(safeColor('red;}</style><script>')).toBe('#0d6efd')
    expect(rgbOf('#ff8000')).toBe('255, 128, 0')
  })
  it('Dateiname ohne Umlaute und Sonderzeichen', () => {
    expect(fileNameFor('Sommer am Gardasee 2026!')).toBe('sommer-am-gardasee-2026.html')
    expect(fileNameFor('Grüße aus Köln & Düsseldorf')).toBe('gruesse-aus-koeln-duesseldorf.html')
    expect(fileNameFor('???')).toBe('reise.html')
  })
})

describe('buildSiteData', () => {
  const entries = [
    entry({ date: '2026-07-03', title: 'B', photos: [photo(600, 800)] }),
    entry({ date: '2026-07-02', title: 'A', photos: [photo(800, 600, 'See')] }),
    entry({ date: '2026-07-02', title: 'Kein Highlight', highlight: false })
  ]
  it('filtert Highlights, sortiert und gruppiert nach Tag', () => {
    const s = buildSiteData(trip, { ...defaultSettings(trip), onlyHighlights: true }, entries)
    expect(s.days.map((d) => [d.date, d.dayNumber, d.entries.map((e) => e.title)])).toEqual([
      ['2026-07-02', 2, ['A']],
      ['2026-07-03', 3, ['B']]
    ])
    expect(s.stats).toEqual({ days: 7, entries: 2, photos: 2 })
  })
  it('alle Einträge, wenn gewünscht', () => {
    const s = buildSiteData(trip, { ...defaultSettings(trip), onlyHighlights: false }, entries)
    expect(s.stats.entries).toBe(3)
  })
  it('Titelbild: erstes Querformat', () => {
    const s = buildSiteData(trip, defaultSettings(trip), entries)
    expect(s.cover?.caption).toBe('See')
  })
})

describe('renderSite', () => {
  const base: WebsiteSettingsDraft = { ...defaultSettings(trip), title: 'Unser <Sommer>', accent: '#be123c' }
  const site = () => buildSiteData(trip, base, [entry({ text: 'Text mit </script>', photos: [photo(800, 600, 'Blick "aufs" Wasser')] })], '2026-08-01T00:00:00Z')

  it('erzeugt ein vollständiges, sicheres Dokument', () => {
    const html = renderSite(site(), base, '/*bootstrap*/')
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('<title>Unser &lt;Sommer&gt;</title>')
    expect(html).toContain('/*bootstrap*/')
    expect(html).toContain('--accent: #be123c')
    expect(html).toContain('Text mit &lt;/script&gt;')
    expect(html).toContain('alt="Blick &quot;aufs&quot; Wasser"')
    expect(html).toContain('data-bs-theme="light"')
    // Nur ein echtes </script> – das der Fotoansicht
    expect(html.split('</script>').length).toBe(2)
  })

  it('alle Vorlagen zeichnen Titel und Eintrag', () => {
    for (const template of ['klassisch', 'magazin', 'galerie'] as const) {
      const html = renderSite(site(), { ...base, template, dark: true }, '')
      expect(html).toContain('Unser &lt;Sommer&gt;')
      expect(html).toContain('Tag am See')
      expect(html).toContain('data-bs-theme="dark"')
      expect(html).toContain('Erstellt mit „Nix wie weg“')
    }
  })

  it('Stimmung und Ort lassen sich ausblenden', () => {
    const shown = renderSite(site(), base, '')
    expect(shown).toContain('😍')
    expect(shown).toContain('Riva')
    const hidden = renderSite(site(), { ...base, showMood: false, showLocation: false }, '')
    expect(hidden).not.toContain('😍')
    expect(hidden).not.toContain('📍 Riva')
  })
})
