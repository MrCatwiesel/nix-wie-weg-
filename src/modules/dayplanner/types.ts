import type { DailyWeather, Place } from '../../services/weather'

/** Zuletzt geladene Wettervorhersage einer Reise – bleibt offline verfügbar. */
export interface WeatherCache {
  tripId: string
  place: Place
  /** Zeitpunkt des Abrufs (ISO) */
  fetchedAt: string
  days: DailyWeather[]
}
