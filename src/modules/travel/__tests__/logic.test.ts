import { describe, expect, it } from 'vitest'
import {
  appleMapsUrl, brokenConnections, durationMinutes, emptyLegDraft, formatDuration, fuelCost, googleMapsUrl,
  legCost, legsOf, recommendedBreaks, reverseLegs, summarize, validateLeg
} from '../logic'
import type { TravelLeg } from '../types'

let pos = 0
const leg = (over: Partial<TravelLeg>): TravelLeg => ({
  ...emptyLegDraft({ from: 'A', to: 'B' }),
  id: Math.random().toString(36),
  tripId: 't1',
  position: pos++,
  createdAt: '',
  updatedAt: '',
  ...over
})

describe('Dauer', () => {
  it('rechnet Abfahrt bis Ankunft', () => {
    expect(durationMinutes('08:15', '12:45')).toBe(270)
  })
  it('nimmt bei früherer Ankunft den Folgetag an', () => {
    expect(durationMinutes('22:30', '06:00')).toBe(450)
  })
  it('liefert null bei fehlender Zeit', () => {
    expect(durationMinutes('', '10:00')).toBeNull()
  })
  it('formatiert lesbar', () => {
    expect(formatDuration(45)).toBe('45 Min.')
    expect(formatDuration(485)).toBe('8:05 Std.')
  })
})

describe('Kosten', () => {
  it('berechnet Sprit', () => {
    expect(fuelCost({ distanceKm: 600, consumption: 6.5, fuelPrice: 1.8 })).toBe(70.2)
  })
  it('Auto ohne Preis: Sprit plus Maut', () => {
    expect(legCost(leg({ mode: 'auto', distanceKm: 600, consumption: 6.5, fuelPrice: 1.8, tolls: 10.5 }))).toBe(80.7)
  })
  it('eingetragener Preis hat Vorrang', () => {
    expect(legCost(leg({ mode: 'auto', cost: 50, distanceKm: 600, consumption: 6.5, fuelPrice: 1.8 }))).toBe(50)
  })
  it('Bahn ohne Preis hat keine Kosten', () => {
    expect(legCost(leg({ mode: 'bahn', distanceKm: 300 }))).toBeNull()
  })
})

describe('Pausen', () => {
  it('empfiehlt beim Auto alle 2 Stunden eine Pause', () => {
    expect(recommendedBreaks('auto', 110)).toBe(0)
    expect(recommendedBreaks('auto', 125)).toBe(1)
    expect(recommendedBreaks('auto', 480)).toBe(3)
    expect(recommendedBreaks('bahn', 480)).toBe(0)
  })
})

describe('Etappen', () => {
  const hin = [
    leg({ id: 'h2', position: 1, from: 'Innsbruck', to: 'Riva', distanceKm: 250, departTime: '13:00', arriveTime: '16:00' }),
    leg({ id: 'h1', position: 0, from: 'München', to: 'Innsbruck', distanceKm: 160, departTime: '08:00', arriveTime: '10:00' }),
    leg({ id: 'r1', direction: 'rueck', position: 0, from: 'Riva', to: 'München', cost: 40 })
  ]
  it('sortiert nach Position', () => {
    expect(legsOf(hin, 'hin').map((l) => l.id)).toEqual(['h1', 'h2'])
  })
  it('fasst eine Richtung zusammen', () => {
    expect(summarize(hin, 'hin', 'EUR')).toEqual({ legs: 2, distanceKm: 410, travelMinutes: 300, legsWithoutTime: 0, cost: 0 })
    expect(summarize(hin, 'rueck', 'EUR').cost).toBe(40)
  })
  it('erkennt Lücken zwischen Etappen (Groß-/Kleinschreibung egal)', () => {
    const ordered = [leg({ id: 'a', to: 'Innsbruck' }), leg({ id: 'b', from: 'innsbruck ' }), leg({ id: 'c', from: 'Bozen' })]
    expect(brokenConnections(ordered)).toEqual(['c'])
  })
  it('erzeugt die Rückreise umgekehrt', () => {
    const back = reverseLegs(legsOf(hin, 'hin'), '2026-07-14')
    expect(back.map((b) => `${b.from}>${b.to}`)).toEqual(['Riva>Innsbruck', 'Innsbruck>München'])
    expect(back.every((b) => b.direction === 'rueck' && b.date === '2026-07-14' && b.departTime === '')).toBe(true)
  })
})

describe('Prüfung und Links', () => {
  it('verlangt Start und Ziel', () => {
    const e = validateLeg(emptyLegDraft())
    expect(e.from).toBeDefined()
    expect(e.to).toBeDefined()
  })
  it('baut Karten-Links mit kodierten Orten', () => {
    expect(googleMapsUrl('München Hbf', 'Riva del Garda', 'auto')).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=M%C3%BCnchen+Hbf&destination=Riva+del+Garda&travelmode=driving'
    )
    expect(appleMapsUrl('A', 'B', 'bahn')).toBe('https://maps.apple.com/?saddr=A&daddr=B&dirflg=r')
  })
})
