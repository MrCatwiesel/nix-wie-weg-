/**
 * Durchspiel mit dem echten Server: drei Geräte (Handy, Birgits Handy, Tablet) mit eigenen Daten,
 * gleiche Regeln wie die App (hochladen, abholen, neuere gewinnt, Löschungen).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Server } from 'node:http'
import { createSyncServer } from '../../../../server/server.mjs'
import { applyAction, uploadStamp, type RemoteChange } from '../logic'

const KEY = 'test-schluessel-fuer-familie-1234'
let server: Server
let base = ''
let dir = ''

type Row = Record<string, unknown> & { id: string }

/** Ein simuliertes Gerät: Tabellen im Speicher, Änderungsprotokoll, letzter Abholstand. */
class Device {
  tables = new Map<string, Map<string, Row>>()
  outbox = new Map<string, { tbl: string; id: string; at: string }>()
  lastSeq = 0

  private table(t: string) {
    if (!this.tables.has(t)) this.tables.set(t, new Map())
    return this.tables.get(t)!
  }
  put(tbl: string, row: Row) {
    this.table(tbl).set(row.id, row)
    this.outbox.set(`${tbl}|${row.id}`, { tbl, id: row.id, at: String(row.updatedAt) })
  }
  remove(tbl: string, id: string, at: string) {
    this.table(tbl).delete(id)
    this.outbox.set(`${tbl}|${id}`, { tbl, id, at })
  }
  get(tbl: string, id: string) {
    return this.table(tbl).get(id)
  }
  async sync() {
    const changes: RemoteChange[] = [...this.outbox.values()].map((e) => {
      const row = this.get(e.tbl, e.id)
      return row
        ? { tbl: e.tbl, id: e.id, stamp: uploadStamp(row, e.at), deleted: false, data: row }
        : { tbl: e.tbl, id: e.id, stamp: e.at, deleted: true, data: null }
    })
    if (changes.length) {
      const r = await fetch(`${base}/api/push`, { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ changes }) })
      expect(r.status).toBe(200)
    }
    this.outbox.clear()
    for (;;) {
      const page = (await (await fetch(`${base}/api/pull?since=${this.lastSeq}`, { headers: { Authorization: `Bearer ${KEY}` } })).json()) as {
        changes: RemoteChange[]
        more: boolean
        seq: number
      }
      for (const c of page.changes) {
        const action = applyAction(this.get(c.tbl, c.id), c)
        if (action === 'put') this.table(c.tbl).set(c.id, c.data as Row)
        if (action === 'delete') this.table(c.tbl).delete(c.id)
      }
      this.lastSeq = page.seq
      if (!page.more) break
    }
  }
}

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), 'nww-dev-'))
  server = createSyncServer({ keys: [KEY], dataDir: dir })
  await new Promise<void>((r) => server.listen(0, () => r()))
  const addr = server.address()
  base = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`
})

afterAll(async () => {
  await new Promise<void>((r) => server.close(() => r()))
  rmSync(dir, { recursive: true, force: true })
})

describe('mehrere Geräte', () => {
  const handy = new Device()
  const birgit = new Device()
  const tablet = new Device()

  it('alle bekommen dieselben Daten', async () => {
    handy.put('trips', { id: 't1', title: 'Gardasee', updatedAt: '2026-07-01T10:00:00Z' })
    birgit.put('packingItems', { id: 'p1', tripId: 't1', name: 'Sonnencreme', updatedAt: '2026-07-01T11:00:00Z' })
    await handy.sync()
    await birgit.sync()
    await tablet.sync()
    await handy.sync()
    for (const d of [handy, birgit, tablet]) {
      expect(d.get('trips', 't1')?.title).toBe('Gardasee')
      expect(d.get('packingItems', 'p1')?.name).toBe('Sonnencreme')
    }
  })

  it('gleichzeitige Änderung: die neuere gewinnt überall', async () => {
    handy.put('trips', { id: 't1', title: 'Gardasee (Handy)', updatedAt: '2026-07-02T09:00:00Z' })
    tablet.put('trips', { id: 't1', title: 'Gardasee (Tablet)', updatedAt: '2026-07-02T10:00:00Z' })
    await tablet.sync()
    await handy.sync()
    await birgit.sync()
    await tablet.sync()
    for (const d of [handy, birgit, tablet]) expect(d.get('trips', 't1')?.title).toBe('Gardasee (Tablet)')
  })

  it('Löschung kommt auf allen Geräten an', async () => {
    birgit.remove('packingItems', 'p1', '2026-07-03T08:00:00Z')
    await birgit.sync()
    await handy.sync()
    await tablet.sync()
    for (const d of [handy, birgit, tablet]) expect(d.get('packingItems', 'p1')).toBeUndefined()
  })

  it('offline geänderter Eintrag, der woanders schon gelöscht wurde: neuere Änderung gewinnt', async () => {
    handy.put('expenses', { id: 'e1', amount: 10, updatedAt: '2026-07-04T08:00:00Z' })
    await handy.sync()
    await tablet.sync()
    tablet.remove('expenses', 'e1', '2026-07-04T09:00:00Z')
    handy.put('expenses', { id: 'e1', amount: 12, updatedAt: '2026-07-04T10:00:00Z' }) // später geändert
    await tablet.sync()
    await handy.sync()
    await tablet.sync()
    await birgit.sync()
    for (const d of [handy, birgit, tablet]) expect(d.get('expenses', 'e1')?.amount).toBe(12)
  })
})
