// Workspace-to-monitor mapping (from hyprland.conf)
export const WORKSPACE_MONITOR_MAP: Record<string, number[]> = {
  "DP-3": [1, 2, 3, 10],      // Center (primary)
  "DP-1": [4, 5, 6],          // Left
  "HDMI-A-1": [7, 8, 9],      // Right
}

// Location for sunrise/sunset calculation (Austin, TX area)
// To change: update these coordinates for your location
export const LATITUDE = 30.27  // degrees North
export const LONGITUDE = -97.74  // degrees West (negative)

// Popup window names for management
export const POPUP_NAMES = ["audio-popup", "brightness-popup", "wifi-popup", "bluetooth-popup", "power-popup", "calendar-popup", "notification-popup"] as const

// Volume icon based on level and mute state
export function getVolumeIcon(volume: number, muted: boolean): string {
  if (muted) return "󰖁"
  if (volume > 0.66) return "󰕾"
  if (volume > 0.33) return "󰖀"
  if (volume > 0) return "󰕿"
  return "󰖁"
}

// WiFi signal strength icon
export function getWifiSignalIcon(strength: number): string {
  if (strength >= 80) return "󰤨"
  if (strength >= 60) return "󰤥"
  if (strength >= 40) return "󰤢"
  if (strength >= 20) return "󰤟"
  return "󰤯"
}

// Bluetooth device icon based on device name
export function getBluetoothDeviceIcon(deviceName: string): string {
  const name = deviceName.toLowerCase()
  if (name.includes("headphone") || name.includes("earbuds") || name.includes("buds") || name.includes("airpod")) {
    return "󰋋"
  }
  if (name.includes("keyboard")) {
    return "󰍽"
  }
  if (name.includes("mouse")) {
    return "󰦏"
  }
  if (name.includes("controller") || name.includes("gamepad")) {
    return "󰊴"
  }
  if (name.includes("speaker")) {
    return "󰓃"
  }
  return "󰂱"
}

// Get workspaces for a specific monitor
export function getMonitorWorkspaces(monitorName: string): number[] {
  return WORKSPACE_MONITOR_MAP[monitorName] || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
