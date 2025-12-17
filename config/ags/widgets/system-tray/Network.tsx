import GLib from "gi://GLib"
import { createPoll } from "ags/time"
import { togglePopup } from "../../lib/popup-manager"
import { getWifiSignalIcon } from "../../lib/constants"

// Check if WiFi is enabled
function isWifiEnabled(): boolean {
  const [ok, stdout] = GLib.spawn_command_line_sync("nmcli radio wifi")
  if (!ok) return false
  return new TextDecoder().decode(stdout).trim() === "enabled"
}

// Get current WiFi connection
function getCurrentWifiConnection(): string {
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

export default function Network() {
  // Poll wifi status every 2 seconds
  const wifiStatus = createPoll({ enabled: false, connected: false, signal: 0 }, 2000, () => {
    const enabled = isWifiEnabled()
    let connected = false
    let signal = 0
    if (enabled) {
      const connName = getCurrentWifiConnection()
      connected = connName.length > 0
      if (connected) {
        // Get signal strength of active connection
        const [ok, stdout] = GLib.spawn_command_line_sync("nmcli -t -f SIGNAL device wifi list")
        if (ok) {
          const output = new TextDecoder().decode(stdout)
          const lines = output.trim().split("\n")
          // First active network's signal
          for (const line of lines) {
            const sig = parseInt(line)
            if (!isNaN(sig) && sig > 0) {
              signal = sig
              break
            }
          }
        }
      }
    }
    return { enabled, connected, signal }
  })

  // Icons based on state
  const getIcon = (status: { enabled: boolean; connected: boolean; signal: number }) => {
    if (!status.enabled) return "󰤭"  // WiFi disabled
    if (!status.connected) return "󰤯"  // WiFi on but not connected
    // Connected - show signal strength
    return getWifiSignalIcon(status.signal)
  }

  const getTooltip = (status: { enabled: boolean; connected: boolean; signal: number }) => {
    if (!status.enabled) return "WiFi Disabled"
    if (!status.connected) return "WiFi Not Connected"
    return `WiFi ${status.signal}%`
  }

  return (
    <button
      cssClasses={["systray-btn"]}
      tooltipText={wifiStatus(getTooltip)}
      onClicked={() => togglePopup("wifi-popup")}
    >
      <label cssClasses={["icon"]} label={wifiStatus(getIcon)} />
    </button>
  )
}
