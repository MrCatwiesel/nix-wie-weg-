import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSyncServer, spaceOf } from './server.mjs'

const KEY = 'familie-test-schluessel-123'
const OTHER = 'andere-gruppe-schluessel-456'
let server
let base
let dir

const auth = (key = KEY) => ({ Authorization: `Bearer ${key}` })
const json = (key = KEY) => ({ ...auth(key), 'Content-Type': 'application/json' })
const push = (changes, key = KEY) => fetch(`${base}/api/push`, { method: 'POST', headers: json(key), body: JSON.stringify({ changes }) })
const pull = (since = 0, key = KEY) => fetch(`${base}/api/pull?since=${since}`, { headers: auth(key) }).then((r) => r.json())

before(async () => {
  dir = mkdtempSync(join(tmpdir(), 'nww-'))
  server = createSyncServer({ keys: [KEY, OTHER], dataDir: dir })
  await new Promise((r) => server.listen(0, r))
  base = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((r) => server.close(r))
  rmSync(dir, { recursive: true, force: true })
})

test('Gesundheitscheck ohne Schlüssel', async () => {
  const r = await fetch(`${base}/api/health`)
  assert.equal(r.status, 200)
  assert.equal((await r.json()).ok, true)
})

test('ohne oder mit falschem Schlüssel abgelehnt', async () => {
  assert.equal((await fetch(`${base}/api/info`)).status, 401)
  assert.equal((await fetch(`${base}/api/info`, { headers: auth('falsch-falsch-falsch-1') })).status, 401)
})

test('kurze Schlüssel werden beim Start abgelehnt', () => {
  assert.throws(() => createSyncServer({ keys: ['kurz'], dataDir: dir }), /16 Zeichen/)
  assert.throws(() => createSyncServer({ keys: [], dataDir: dir }), /Kein Schlüssel/)
})

test('CORS-Vorabanfrage', async () => {
  const r = await fetch(`${base}/api/push`, { method: 'OPTIONS', headers: { Origin: 'https://example.github.io' } })
  assert.equal(r.status, 204)
  assert.equal(r.headers.get('access-control-allow-origin'), '*')
  assert.match(r.headers.get('access-control-allow-headers') ?? '', /Authorization/)
})

test('hochladen und abholen, neuere Änderung gewinnt', async () => {
  let r = await (await push([{ tbl: 'trips', id: 't1', stamp: '2026-07-01T10:00:00Z', data: { id: 't1', title: 'Gardasee' } }])).json()
  assert.equal(r.accepted, 1)
  // ältere Fassung wird ignoriert
  r = await (await push([{ tbl: 'trips', id: 't1', stamp: '2026-07-01T09:00:00Z', data: { id: 't1', title: 'ALT' } }])).json()
  assert.equal(r.ignored, 1)
  // neuere ersetzt
  r = await (await push([{ tbl: 'trips', id: 't1', stamp: '2026-07-02T10:00:00Z', data: { id: 't1', title: 'Gardasee 2026' } }])).json()
  assert.equal(r.accepted, 1)
  const p = await pull(0)
  assert.equal(p.changes.length, 1)
  assert.equal(p.changes[0].data.title, 'Gardasee 2026')
  assert.equal(p.more, false)
})

test('nur Änderungen seit dem letzten Abholen', async () => {
  const first = await pull(0)
  await push([{ tbl: 'packingItems', id: 'p1', stamp: '2026-07-03T00:00:00Z', data: { id: 'p1', name: 'Socken' } }])
  const next = await pull(first.seq)
  assert.deepEqual(next.changes.map((c) => c.id), ['p1'])
})

test('Löschungen werden übertragen', async () => {
  await push([{ tbl: 'packingItems', id: 'p1', stamp: '2026-07-04T00:00:00Z', deleted: true }])
  const all = await pull(0)
  const p1 = all.changes.find((c) => c.id === 'p1')
  assert.equal(p1.deleted, true)
  assert.equal(p1.data, null)
})

test('Reisegruppen sind getrennt', async () => {
  const other = await pull(0, OTHER)
  assert.equal(other.changes.length, 0)
  assert.notEqual(spaceOf(KEY), spaceOf(OTHER))
})

test('ungültige Änderungen werden abgelehnt (alles oder nichts)', async () => {
  const before = (await pull(0)).seq
  const r = await push([
    { tbl: 'trips', id: 'ok', stamp: '2026-08-01T00:00:00Z', data: {} },
    { tbl: 'drop table;', id: 'x', stamp: '2026-08-01T00:00:00Z', data: {} }
  ])
  assert.equal(r.status, 400)
  assert.equal((await pull(0)).seq, before)
})

test('Fotos: hochladen mit Prüfsumme, abrufen, doppelt ist ok', async () => {
  const body = Buffer.from('JPEG-DATEN-TEST')
  const hash = createHash('sha256').update(body).digest('hex')
  const url = `${base}/api/blob/${hash}`
  assert.equal((await fetch(url, { method: 'HEAD', headers: auth() })).status, 404)
  const put = await fetch(url, { method: 'PUT', headers: { ...auth(), 'Content-Type': 'image/jpeg' }, body })
  assert.equal(put.status, 201)
  assert.equal((await fetch(url, { method: 'PUT', headers: { ...auth(), 'Content-Type': 'image/jpeg' }, body })).status, 200)
  const get = await fetch(url, { headers: auth() })
  assert.equal(get.status, 200)
  assert.equal(get.headers.get('content-type'), 'image/jpeg')
  assert.equal(Buffer.from(await get.arrayBuffer()).toString(), 'JPEG-DATEN-TEST')
  // andere Gruppe sieht das Foto nicht
  assert.equal((await fetch(url, { headers: auth(OTHER) })).status, 404)
})

test('Foto mit falscher Prüfsumme abgelehnt', async () => {
  const wrong = 'a'.repeat(64)
  const r = await fetch(`${base}/api/blob/${wrong}`, { method: 'PUT', headers: { ...auth(), 'Content-Type': 'image/jpeg' }, body: 'x' })
  assert.equal(r.status, 400)
})

test('Info zählt vorhandene Datensätze', async () => {
  const info = await (await fetch(`${base}/api/info`, { headers: auth() })).json()
  assert.equal(info.ok, true)
  assert.ok(info.records >= 1)
})
