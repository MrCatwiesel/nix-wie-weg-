import { describe, expect, it } from 'vitest'
import { boundsOf, buildQuery, navLinks, placeId, splitByLocation, type MapItem } from '../logic'
import { distanceKm, formatDistance, parseNominatim } from '../../../services/geocoding'
import type { MapPlace } from '../types'

const item = (over: Partial<MapItem>): MapItem => ({ kind: 'activity', refId: 'x', title: 'X', subtitle: '', where: '', date: '', done: false, ...over })
const place = (kind: MapPlace['kind'], refId: string, lat = 45, lon = 10): MapPlace => ({
  id: placeId(kind, refId), tripId: 't', kind, refId, lat, lon, label: '', updatedAt: ''
})

describe('Karte – Logik', () => {
  it('baut den Suchtext mit Reiseziel', () => {
    expect(buildQuery('Via Roma 5', 'Hotel', 'Riva del Garda, Italien')).toBe('Via Roma 5, Riva del Garda')
    expect(buildQuery('', 'Castello Scaligero', 'Malcesine')).toBe('Castello Scaligero, Malcesine')
    expect(buildQuery('Hafen Malcesine', 'x', 'Malcesine')).toBe('Hafen Malcesine')
    expect(buildQuery('', '', 'Malcesine')).toBe('Malcesine')
  })
  it('trennt verortete und fehlende Einträge', () => {
    const items = [item({ refId: 'a' }), item({ refId: 'b' }), item({ kind: 'accommodation', refId: 'a' })]
    const r = splitByLocation(items, [place('activity', 'a'), place('accommodation', 'a')])
    expect(r.located.map((l) => `${l.kind}:${l.refId}`)).toEqual(['activity:a', 'accommodation:a'])
    expect(r.missing.map((m) => m.refId)).toEqual(['b'])
  })
  it('berechnet den Kartenausschnitt', () => {
    expect(boundsOf([])).toBeNull()
    expect(boundsOf([{ lat: 45, lon: 10 }, { lat: 46, lon: 9 }])).toEqual([[45, 9], [46, 10]])
  })
  it('baut Navigationslinks', () => {
    const l = navLinks(45.5, 10.75, 'Castello')
    expect(l.apple).toBe('https://maps.apple.com/?daddr=45.500000%2C10.750000&q=Castello')
    expect(l.google).toBe('https://www.google.com/maps/dir/?api=1&destination=45.500000%2C10.750000')
  })
})

describe('Geocoding', () => {
  it('liest Nominatim-Ergebnisse und verwirft Unsinn', () => {
    expect(parseNominatim([{ display_name: 'Riva', lat: '45.88', lon: '10.84' }, { display_name: 'kaputt', lat: 'x', lon: '1' }]))
      .toEqual([{ label: 'Riva', lat: 45.88, lon: 10.84 }])
    expect(parseNominatim({})).toEqual([])
  })
  it('misst Entfernungen', () => {
    // München – Innsbruck ca. 100 km Luftlinie
    const km = distanceKm({ lat: 48.137, lon: 11.575 }, { lat: 47.269, lon: 11.404 })
    expect(Math.round(km)).toBe(97)
    expect(formatDistance(0.35)).toBe('350 m')
    expect(formatDistance(4.26)).toBe('4,3 km')
    expect(formatDistance(97.3)).toBe('97 km')
  })
})
