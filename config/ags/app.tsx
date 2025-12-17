import app from "ags/gtk4/app"
import Gdk from "gi://Gdk?version=4.0"
import style from "./style.scss"

// Bar component (includes workspaces, clients, clock, system tray)
import Bar from "./widgets/bar"

// Launcher
import { Launcher, toggleLauncher } from "./launcher"

// Popup windows
import PopupBackdrop from "./widgets/popups/backdrop"
import { AudioPopup } from "./widgets/popups/audio/AudioPopup"
import { BrightnessPopup } from "./widgets/popups/brightness/BrightnessPopup"
import { WifiPopup } from "./widgets/popups/network/WifiPopup"
import BluetoothPopup from "./widgets/popups/bluetooth/BluetoothPopup"
import { PowerPopup } from "./widgets/popups/power/PowerPopup"
import { CalendarPopup } from "./widgets/popups/calendar/CalendarPopup"
// MediaPopup removed - media controls now integrated into AudioPopup
import { NotificationPopup } from "./widgets/popups/notifications/NotificationPopup"
import { NotificationOSD } from "./widgets/popups/notifications/NotificationOSD"

// Export toggleLauncher for hyprctl access
;(globalThis as any).toggleLauncher = toggleLauncher

app.start({
  css: style,
  requestHandler(request: string, res: (response: any) => void) {
    if (request === "toggle-launcher") {
      toggleLauncher()
      res("ok")
    } else {
      res("unknown command")
    }
  },
  main() {
    const monitors = app.get_monitors()
    print(`Found ${monitors.length} monitors`)
    return [
      ...monitors.map((monitor: Gdk.Monitor) => <Bar monitor={monitor} />),
      <PopupBackdrop />,
      <AudioPopup />,
      <BrightnessPopup />,
      <WifiPopup />,
      <BluetoothPopup />,
      <PowerPopup />,
      <CalendarPopup />,
      <NotificationPopup />,
      <NotificationOSD />,
      Launcher(),
    ]
  },
})
