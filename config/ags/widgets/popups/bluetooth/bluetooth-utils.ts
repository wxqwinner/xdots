import GLib from "gi://GLib"

export interface BluetoothDevice {
  mac: string
  name: string
  connected: boolean
}

export function parseBluetoothDevices(): BluetoothDevice[] {
  const [ok, stdout] = GLib.spawn_command_line_sync("bluetoothctl devices Paired")
  if (!ok) return []

  const output = new TextDecoder().decode(stdout)
  const lines = output.trim().split("\n").filter(l => l.startsWith("Device "))

  return lines.map(line => {
    // Format: "Device XX:XX:XX:XX:XX:XX DeviceName"
    const parts = line.substring(7) // Remove "Device "
    const spaceIndex = parts.indexOf(" ")
    if (spaceIndex === -1) return null

    const mac = parts.substring(0, spaceIndex)
    const name = parts.substring(spaceIndex + 1)

    // Check connection status
    const [connOk, connStdout] = GLib.spawn_command_line_sync(`bluetoothctl info ${mac}`)
    const connected = connOk && new TextDecoder().decode(connStdout).includes("Connected: yes")

    return { mac, name, connected }
  }).filter((d): d is BluetoothDevice => d !== null)
}

export function isBluetoothPowered(): boolean {
  const [ok, stdout] = GLib.spawn_command_line_sync("bluetoothctl show")
  if (!ok) return false
  const output = new TextDecoder().decode(stdout)
  return output.includes("Powered: yes")
}
