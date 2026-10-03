import { describe, expect, it } from 'vitest'
import { dataUrlToBlob } from '../backup'

describe('Backup – Binärdaten', () => {
  it('wandelt data:-URLs offline in Blobs um', async () => {
    const b = dataUrlToBlob('data:text/plain;base64,SGFsbG8=')
    expect(b.type).toBe('text/plain')
    expect(await b.text()).toBe('Hallo')
  })
  it('auch ohne base64', async () => {
    const b = dataUrlToBlob('data:text/plain,Gr%C3%BC%C3%9Fe')
    expect(await b.text()).toBe('Grüße')
  })
})
