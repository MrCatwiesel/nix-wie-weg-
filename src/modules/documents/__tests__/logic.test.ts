import { describe, expect, it } from 'vitest'
import {
  addMonths, emptyContactDraft, emptyDocumentDraft, maskNumber, needsRenewalSoon, sortDocs, suggestDocuments,
  summarizeDocs, telHref, validateContact, validateDocument, validity
} from '../logic'
import type { TravelDocument } from '../types'

const doc = (over: Partial<TravelDocument>): TravelDocument => ({
  ...emptyDocumentDraft({ title: 'Dok' }),
  id: Math.random().toString(36),
  tripId: 't1',
  createdAt: '',
  updatedAt: '',
  ...over
})

const today = new Date(2026, 9, 3) // 03.10.2026

describe('addMonths', () => {
  it('addiert Monate und kürzt aufs Monatsende', () => {
    expect(addMonths('2026-07-15', 6)).toBe('2027-01-15')
    expect(addMonths('2026-08-31', 6)).toBe('2027-02-28')
  })
})

describe('validity', () => {
  const end = '2026-11-10'
  it('erkennt abgelaufen, Ende vor Reiseende und ok', () => {
    expect(validity({ type: 'ausweis', validUntil: '2026-09-01' }, end, today)).toBe('abgelaufen')
    expect(validity({ type: 'ausweis', validUntil: '2026-11-05' }, end, today)).toBe('reise')
    expect(validity({ type: 'ausweis', validUntil: '2027-01-01' }, end, today)).toBe('ok')
    expect(validity({ type: 'ausweis', validUntil: '' }, end, today)).toBe('unbekannt')
  })
  it('Reisepass braucht 6 Monate Puffer', () => {
    expect(validity({ type: 'reisepass', validUntil: '2027-03-01' }, end, today)).toBe('knapp')
    expect(validity({ type: 'reisepass', validUntil: '2027-06-01' }, end, today)).toBe('ok')
  })
})

describe('needsRenewalSoon', () => {
  it('warnt bei Ausweis-Problemen innerhalb von 8 Wochen vor Reise', () => {
    expect(needsRenewalSoon({ type: 'reisepass', validUntil: '2026-10-20', status: 'vorhanden' }, '2026-11-01', '2026-11-10', today)).toBe(true)
    expect(needsRenewalSoon({ type: 'reisepass', validUntil: '2026-10-20', status: 'vorhanden' }, '2027-06-01', '2027-06-10', today)).toBe(false)
    expect(needsRenewalSoon({ type: 'ticket', validUntil: '', status: 'fehlt' }, '2026-11-01', '2026-11-10', today)).toBe(false)
    expect(needsRenewalSoon({ type: 'visum', validUntil: '', status: 'fehlt' }, '2026-11-01', '2026-11-10', today)).toBe(true)
  })
})

describe('Übersicht', () => {
  const list = [
    doc({ title: 'Ticket', type: 'ticket', packed: true }),
    doc({ title: 'Pass', type: 'reisepass', validUntil: '2026-09-01' }),
    doc({ title: 'Visum', type: 'visum', status: 'beantragt' }),
    doc({ title: 'Ausweis', type: 'ausweis', validUntil: '2030-01-01' })
  ]
  it('zählt fehlende, Probleme und nicht Eingepacktes', () => {
    expect(summarizeDocs(list, '2026-11-10', today)).toEqual({ total: 4, missing: 1, problems: 1, notPacked: 2 })
  })
  it('sortiert Probleme nach oben', () => {
    expect(sortDocs(list, '2026-11-10', today).map((d) => d.title)).toEqual(['Pass', 'Visum', 'Ausweis', 'Ticket'])
  })
})

describe('Vorschläge', () => {
  it('passt zur Anreise und überspringt Vorhandenes', () => {
    const auto = suggestDocuments('auto', [{ title: 'Impfpass', person: '' }]).map((d) => d.title)
    expect(auto).toContain('Führerschein')
    expect(auto).not.toContain('Impfpass')
    expect(suggestDocuments('flug').map((d) => d.title)).toContain('Flugtickets / Bordkarten')
    expect(suggestDocuments('flug').map((d) => d.title)).not.toContain('Führerschein')
  })
})

describe('Telefon und Nummern', () => {
  it('baut tel:-Links', () => {
    expect(telHref('112')).toBe('tel:112')
    expect(telHref('+49 (0) 89 123 456')).toBe('tel:+4989123456')
    expect(telHref('abc')).toBeNull()
  })
  it('verbirgt Nummern teilweise', () => {
    expect(maskNumber('L01X00T47')).toBe('L01•••••7')
    expect(maskNumber('123')).toBe('••••')
    expect(maskNumber('')).toBe('')
  })
  it('prüft Pflichtfelder', () => {
    expect(validateDocument(emptyDocumentDraft()).title).toBeDefined()
    expect(validateContact(emptyContactDraft({ label: 'X', phone: '12' })).phone).toBeDefined()
    expect(validateContact(emptyContactDraft({ label: 'X', phone: '+49 30 1234' }))).toEqual({})
  })
})

describe('Vorschläge mit Teilnehmern', () => {
  it('persönliche Dokumente je Person, gemeinsame einmal', () => {
    const d = suggestDocuments('auto', [{ title: 'Impfpass', person: 'Ich' }], ['Ich', 'Anna'])
    const ausweise = d.filter((x) => x.type === 'ausweis').map((x) => x.person)
    expect(ausweise).toEqual(['Ich', 'Anna'])
    expect(d.filter((x) => x.title === 'Impfpass').map((x) => x.person)).toEqual(['Anna'])
    expect(d.filter((x) => x.title === 'Führerschein').map((x) => x.person)).toEqual([''])
  })
})
