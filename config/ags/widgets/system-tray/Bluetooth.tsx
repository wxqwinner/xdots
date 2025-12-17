import GLib from "gi://GLib"
import { createPoll } from "ags/time"
import { togglePopup } from "../../lib/popup-manager"
import { isBluetoothPowered } from "../../widgets/popups/bluetooth/bluetooth-utils"

export default function Bluetooth() {
  // Poll bluetooth status every 2 seconds
  const btStatus = createPoll({ powered: false, connected: false }, 2000, () => {
    const powered = isBluetoothPowered()
    let connected = false
    if (powered) {
      const [ok, stdout] = GLib.spawn_command_line_sync("bluetoothctl devices Connected")
      if (ok) {
        const output = new TextDecoder().decode(stdout).trim()
        connected = output.length > 0 && output.includes("Device")
      }
    }
    return { powered, connected }
  })

  // Icons: 󰂲 off, 󰂯 on/disconnected, 󰂱 connected
  const getIcon = (status: { powered: boolean; connected: boolean }) => {
    if (!status.powered) return "󰂲"
    if (status.connected) return "󰂱"
    return "󰂯"
  }

  const getTooltip = (status: { powered: boolean; connected: boolean }) => {
    if (!status.powered) return "Bluetooth Off"
    if (status.connected) return "Bluetooth Connected"
    return "Bluetooth On"
  }

  return (
    <button
      cssClasses={["systray-btn"]}
      tooltipText={btStatus(getTooltip)}
      onClicked={() => togglePopup("bluetooth-popup")}
    >
      <label cssClasses={["icon"]} label={btStatus(getIcon)} />
    </button>
  )
}
