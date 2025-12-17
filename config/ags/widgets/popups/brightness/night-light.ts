import GLib from "gi://GLib"
import { LATITUDE, LONGITUDE } from "../../../lib/constants"
import { spawnAsync, fileExists, getHomeDir } from "../../../lib/system-commands"

// State variables
export let currentBrightnessValue = 100
export let nightLightState = fileExists("/tmp/ags-nightlight-active")
export let nightLightAuto = true // Auto mode based on time

// Calculate sunrise/sunset times using astronomical formula
// Returns { sunrise: hour (decimal), sunset: hour (decimal) }
export function calculateSunTimes(): { sunrise: number; sunset: number } {
  const now = GLib.DateTime.new_now_local()
  if (!now) return { sunrise: 6, sunset: 18 }

  const dayOfYear = now.get_day_of_year()
  const lat = LATITUDE * Math.PI / 180  // Convert to radians

  // Solar declination angle (simplified formula)
  const declination = -23.45 * Math.cos(2 * Math.PI * (dayOfYear + 10) / 365) * Math.PI / 180

  // Hour angle at sunrise/sunset (when sun is at horizon, -0.83 degrees for refraction)
  const zenith = 90.833 * Math.PI / 180
  const cosHourAngle = (Math.cos(zenith) - Math.sin(lat) * Math.sin(declination)) /
                       (Math.cos(lat) * Math.cos(declination))

  // Clamp for polar regions
  const clampedCos = Math.max(-1, Math.min(1, cosHourAngle))
  const hourAngle = Math.acos(clampedCos) * 180 / Math.PI

  // Solar noon (approximate - ignoring equation of time for simplicity)
  const solarNoon = 12 - LONGITUDE / 15

  // Get timezone offset in hours
  const utcOffset = now.get_utc_offset() / 3600000000  // microseconds to hours

  // Calculate sunrise and sunset in local time
  const sunrise = solarNoon - hourAngle / 15 + utcOffset
  const sunset = solarNoon + hourAngle / 15 + utcOffset

  return { sunrise, sunset }
}

// Cached sun times (recalculated once per day)
let cachedSunTimes = calculateSunTimes()
let lastSunCalcDay = GLib.DateTime.new_now_local()?.get_day_of_year() || 0

export function getSunTimes(): { sunrise: number; sunset: number } {
  const now = GLib.DateTime.new_now_local()
  const today = now?.get_day_of_year() || 0
  if (today !== lastSunCalcDay) {
    cachedSunTimes = calculateSunTimes()
    lastSunCalcDay = today
  }
  return cachedSunTimes
}

// Check if current time is "night" (between sunset and sunrise)
export function isNightTime(): boolean {
  const now = GLib.DateTime.new_now_local()
  if (!now) return false
  const hour = now.get_hour() + now.get_minute() / 60
  const { sunrise, sunset } = getSunTimes()
  return hour >= sunset || hour < sunrise
}

// Format time for display (e.g., "6:45 AM")
export function formatSunTime(decimalHour: number): string {
  const hour = Math.floor(decimalHour)
  const minutes = Math.round((decimalHour - hour) * 60)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour)
  return `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`
}

// Helper to set brightness value
export function setBrightness(value: number): void {
  currentBrightnessValue = value
  spawnAsync(`${getHomeDir()}/.config/hypr/scripts/set-brightness.sh ${currentBrightnessValue}`)
}

// Getters for current state (since module vars are snapshotted on import)
export function getNightLightAuto(): boolean {
  return nightLightAuto
}

export function getNightLightState(): boolean {
  return nightLightState
}

// Helper to set auto mode
export function setNightLightAuto(enabled: boolean): void {
  nightLightAuto = enabled
}

// Apply night light based on current state
export function applyNightLight(enabled: boolean): void {
  nightLightState = enabled
  if (enabled) {
    spawnAsync("touch /tmp/ags-nightlight-active")
  } else {
    spawnAsync("rm -f /tmp/ags-nightlight-active")
  }
  spawnAsync(`${getHomeDir()}/.config/hypr/scripts/set-brightness.sh ${currentBrightnessValue}`)
}

// Auto night light check - runs every minute
export function setupAutoNightLight(): void {
  // Initial check
  if (nightLightAuto) {
    const shouldBeOn = isNightTime()
    if (shouldBeOn !== nightLightState) {
      applyNightLight(shouldBeOn)
    }
  }

  // Check every minute
  GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000, () => {
    if (nightLightAuto) {
      const shouldBeOn = isNightTime()
      if (shouldBeOn !== nightLightState) {
        applyNightLight(shouldBeOn)
        print(`Auto night light: ${shouldBeOn ? "enabled" : "disabled"}`)
      }
    }
    return GLib.SOURCE_CONTINUE
  })
}

// Start auto night light on module load
setupAutoNightLight()
