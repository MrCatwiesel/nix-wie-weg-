/**
 * Wetterdienst (Open-Meteo, https://open-meteo.com) – kostenlos, ohne API-Schlüssel.
 * Hinweis: Die freie Nutzung ist für nicht-kommerzielle Zwecke gedacht; bei kommerzieller
 * Nutzung die Bedingungen von Open-Meteo prüfen.
 *
 * Diese Datei enthält nur Netzwerkzugriff und Umwandlung – keine Speicherung.
 */

export interface Place {
  name: string
  /** z. B. "Venetien, Italien" */
  region: string
  latitude: number
  longitude: number
}

export interface DailyWeather {
  /** ISO-Datum */
  date: string
  /** WMO-Wettercode */
  code: number
  tempMax: number
  tempMin: number
  /** Niederschlag in mm */
  precipitation: number
  /** Regenwahrscheinlichkeit in % (oder null, wenn nicht geliefert) */
  precipitationProbability: number | null
  /** max. Windgeschwindigkeit km/h */
  windMax: number | null
}

/** Längster Vorhersagezeitraum, den Open-Meteo liefert. */
export const FORECAST_DAYS = 16

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

/** Ort suchen, z. B. "Riva del Garda". */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const url = `${GEO_URL}?${new URLSearchParams({ name: q, count: '6', language: 'de', format: 'json' })}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Ortssuche fehlgeschlagen (${res.status})`)
  return parsePlaces(await res.json())
}

export function parsePlaces(json: unknown): Place[] {
  const results = (json as { results?: Record<string, unknown>[] })?.results ?? []
  return results
    .filter((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number')
    .map((r) => ({
      name: String(r.name ?? ''),
      region: [r.admin1, r.country].filter(Boolean).join(', '),
      latitude: r.latitude as number,
      longitude: r.longitude as number
    }))
}

/** Tagesvorhersage für einen Ort (heute + bis zu 16 Tage, Ortszeit). */
export async function fetchDailyForecast(latitude: number, longitude: number, signal?: AbortSignal): Promise<DailyWeather[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'auto',
    forecast_days: String(FORECAST_DAYS)
  })
  const res = await fetch(`${FORECAST_URL}?${params}`, { signal })
  if (!res.ok) throw new Error(`Wetter konnte nicht geladen werden (${res.status})`)
  return parseDaily(await res.json())
}

/** Wandelt die Open-Meteo-Antwort (Spalten je Variable) in eine Liste von Tagen um. */
export function parseDaily(json: unknown): DailyWeather[] {
  const d = (json as { daily?: Record<string, unknown[]> })?.daily
  if (!d || !Array.isArray(d.time)) return []
  const num = (arr: unknown[] | undefined, i: number): number | null => {
    const v = arr?.[i]
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  }
  return d.time.map((t, i) => ({
    date: String(t),
    code: num(d.weather_code, i) ?? 0,
    tempMax: num(d.temperature_2m_max, i) ?? 0,
    tempMin: num(d.temperature_2m_min, i) ?? 0,
    precipitation: num(d.precipitation_sum, i) ?? 0,
    precipitationProbability: num(d.precipitation_probability_max, i),
    windMax: num(d.wind_speed_10m_max, i)
  }))
}

export type WeatherKind = 'sonnig' | 'wolkig' | 'nebel' | 'niesel' | 'regen' | 'schnee' | 'gewitter'

/** WMO-Wettercode → Art, Text und Bootstrap-Icon. */
export function describeCode(code: number): { kind: WeatherKind; label: string; icon: string } {
  if (code === 0) return { kind: 'sonnig', label: 'Sonnig', icon: 'sun' }
  if (code <= 2) return { kind: 'sonnig', label: 'Heiter', icon: 'cloud-sun' }
  if (code === 3) return { kind: 'wolkig', label: 'Bewölkt', icon: 'cloud' }
  if (code === 45 || code === 48) return { kind: 'nebel', label: 'Nebel', icon: 'cloud-fog' }
  if (code >= 51 && code <= 57) return { kind: 'niesel', label: 'Nieselregen', icon: 'cloud-drizzle' }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { kind: 'regen', label: code >= 80 ? 'Regenschauer' : 'Regen', icon: 'cloud-rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { kind: 'schnee', label: 'Schnee', icon: 'cloud-snow' }
  if (code >= 95) return { kind: 'gewitter', label: 'Gewitter', icon: 'cloud-lightning-rain' }
  return { kind: 'wolkig', label: 'Wechselhaft', icon: 'cloud-sun' }
}
