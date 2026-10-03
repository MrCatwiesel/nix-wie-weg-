import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * Erzeugt Anzeige-Adressen (blob:-URLs) für Bilder und gibt sie wieder frei,
 * sobald sie nicht mehr gebraucht werden – sonst würde Speicher volllaufen.
 */
export function useObjectUrls<T>(items: Ref<T[]>, key: (item: T) => string, blob: (item: T) => Blob): Ref<Map<string, string>> {
  const urls = ref(new Map<string, string>()) as Ref<Map<string, string>>

  watch(
    items,
    (list) => {
      const next = new Map<string, string>()
      for (const item of list) {
        const k = key(item)
        next.set(k, urls.value.get(k) ?? URL.createObjectURL(blob(item)))
      }
      for (const [k, u] of urls.value) if (!next.has(k)) URL.revokeObjectURL(u)
      urls.value = next
    },
    { immediate: true }
  )

  onScopeDispose(() => {
    for (const u of urls.value.values()) URL.revokeObjectURL(u)
  })
  return urls
}
