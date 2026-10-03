import { liveQuery } from 'dexie'
import { onScopeDispose, ref, type Ref } from 'vue'

/**
 * Verbindet eine Dexie-Abfrage mit Vue: die Ansicht aktualisiert sich
 * automatisch, sobald sich die Daten in der Datenbank ändern.
 */
export function useLiveQuery<T>(query: () => T | Promise<T>, initial: T): Ref<T> {
  const result = ref(initial) as Ref<T>
  const subscription = liveQuery(query).subscribe({
    next: (value) => (result.value = value),
    error: (err) => console.error('[useLiveQuery]', err)
  })
  onScopeDispose(() => subscription.unsubscribe())
  return result
}

/** true/false je nach Netzverbindung – für Hinweise in der Oberfläche. */
export function useOnline(): Ref<boolean> {
  const online = ref(navigator.onLine)
  const update = () => (online.value = navigator.onLine)
  window.addEventListener('online', update)
  window.addEventListener('offline', update)
  onScopeDispose(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })
  return online
}
