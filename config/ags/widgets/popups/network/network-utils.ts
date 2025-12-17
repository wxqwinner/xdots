import GLib from "gi://GLib"

// WiFi network interface
export interface WifiNetwork {
  ssid: string
  signal: number
  security: string
  active: boolean
  saved: boolean  // Whether this network has a saved connection profile
}

// Get list of saved WiFi connection names
export function getSavedWifiConnections(): Set<string> {
  const [ok, stdout] = GLib.spawn_command_line_sync("nmcli -t -f NAME,TYPE connection show")
  if (!ok) return new Set()
  const output = new TextDecoder().decode(stdout)
  const saved = new Set<string>()
  for (const line of output.trim().split("\n")) {
    const parts = line.split(":")
    if (parts[1] === "802-11-wireless" && parts[0]) {
      saved.add(parts[0])
    }
  }
  return saved
}

// Parse nmcli wifi list output
export function parseWifiNetworks(): WifiNetwork[] {
  const [ok, stdout] = GLib.spawn_command_line_sync("nmcli -t -f SSID,SIGNAL,SECURITY,ACTIVE device wifi list")
  if (!ok) return []

  const savedConnections = getSavedWifiConnections()
  const output = new TextDecoder().decode(stdout)
  const lines = output.trim().split("\n").filter(l => l.length > 0)
  const seen = new Set<string>()

  return lines.map(line => {
    const parts = line.split(":")
    if (parts.length < 4) return null
    const ssid = parts[0]
    if (!ssid || seen.has(ssid)) return null
    seen.add(ssid)

    return {
      ssid,
      signal: parseInt(parts[1]) || 0,
      security: parts[2] || "",
      active: parts[3] === "yes",
      saved: savedConnections.has(ssid),
    }
  }).filter((n): n is WifiNetwork => n !== null)
    .sort((a, b) => b.signal - a.signal)
    .slice(0, 8)
}

// Get current WiFi connection
export function getCurrentWifiConnection(): string {
  const [ok, stdout] = GLib.spawn_command_line_sync("nmcli -t -f NAME,TYPE,DEVICE connection show --active")
  if (!ok) return ""
  const output = new TextDecoder().decode(stdout)
  const lines = output.trim().split("\n")
  for (const line of lines) {
    const parts = line.split(":")
    if (parts[1] === "802-11-wireless" && parts[2]) {
      return parts[0]
    }
  }
  return ""
}

// Check if WiFi is enabled
export function isWifiEnabled(): boolean {
  const [ok, stdout] = GLib.spawn_command_line_sync("nmcli radio wifi")
  if (!ok) return false
  return new TextDecoder().decode(stdout).trim() === "enabled"
}
