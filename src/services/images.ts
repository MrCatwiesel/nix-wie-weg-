/**
 * Bildverarbeitung im Browser: Fotos verkleinern, bevor sie gespeichert werden.
 * Spart Speicher auf dem Gerät (ein Handyfoto hat oft 3–6 MB, verkleinert ca. 0,3–0,6 MB).
 */

/** Große Fassung (lange Kante) – reicht für Vollbild und Webseite. */
export const FULL_EDGE = 2048
/** Vorschaubild (lange Kante). */
export const THUMB_EDGE = 480

/** Neue Größe, die in eine Kantenlänge passt (nie vergrößern). */
export function fitWithin(width: number, height: number, maxEdge: number): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= maxEdge || longest === 0) return { width, height }
  const f = maxEdge / longest
  return { width: Math.round(width * f), height: Math.round(height * f) }
}

export interface ProcessedImage {
  full: Blob
  thumb: Blob
  width: number
  height: number
}

async function decode(file: Blob): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  // createImageBitmap berücksichtigt die EXIF-Drehung (Hochformat-Fotos vom Handy)
  if ('createImageBitmap' in window) {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() }
    } catch {
      /* Fallback unten */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) }
  } catch (e) {
    URL.revokeObjectURL(url)
    throw new Error('Dieses Bild kann nicht gelesen werden.')
  }
}

function render(source: CanvasImageSource, width: number, height: number, quality: number): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Zeichnen nicht möglich.'))
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, width, height)
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Bild konnte nicht gespeichert werden.'))), 'image/jpeg', quality)
  )
}

/** Liest ein Foto, verkleinert es und erzeugt ein Vorschaubild (beides JPEG). */
export async function processImage(file: Blob): Promise<ProcessedImage> {
  const img = await decode(file)
  try {
    const full = fitWithin(img.width, img.height, FULL_EDGE)
    const thumb = fitWithin(img.width, img.height, THUMB_EDGE)
    const [fullBlob, thumbBlob] = await Promise.all([
      render(img.source, full.width, full.height, 0.85),
      render(img.source, thumb.width, thumb.height, 0.75)
    ])
    return { full: fullBlob, thumb: thumbBlob, width: full.width, height: full.height }
  } finally {
    img.close()
  }
}
