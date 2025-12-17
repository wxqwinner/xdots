import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import GLib from "gi://GLib"
import { closeAllPopups } from "../../../lib/popup-manager"

interface PowerAction {
  icon: string
  label: string
  command: string
  cssClass?: string
}

const POWER_ACTIONS: PowerAction[] = [
  { icon: "󰍃", label: "Log Out", command: "hyprctl dispatch exit", cssClass: "logout" },
  { icon: "󰒲", label: "Suspend", command: "systemctl suspend" },
  { icon: "󰜉", label: "Restart", command: "systemctl reboot", cssClass: "restart" },
  { icon: "󰐥", label: "Shut Down", command: "systemctl poweroff", cssClass: "shutdown" },
]

export function PowerPopup() {
  const { TOP, RIGHT } = Astal.WindowAnchor

  const win = (
    <window
      visible={false}
      namespace="ags-power-popup"
      name="power-popup"
      cssClasses={["PowerPopup"]}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      <box cssClasses={["power-popup-content"]} orientation={Gtk.Orientation.VERTICAL}>
        <box cssClasses={["power-header"]}>
          <label label="⏻ Power" cssClasses={["popup-title"]} />
        </box>

        <box cssClasses={["power-actions"]} orientation={Gtk.Orientation.VERTICAL}>
          {POWER_ACTIONS.map(action => (
            <button
              cssClasses={["power-action", action.cssClass || ""]}
              onClicked={() => {
                closeAllPopups()
                GLib.spawn_command_line_async(action.command)
              }}
            >
              <box spacing={12}>
                <label cssClasses={["action-icon"]} label={action.icon} />
                <label cssClasses={["action-label"]} label={action.label} hexpand xalign={0} />
              </box>
            </button>
          ))}
        </box>
      </box>
    </window>
  ) as Astal.Window

  // Escape key to close
  const keyController = new Gtk.EventControllerKey()
  keyController.connect("key-pressed", (_ctrl: any, keyval: number) => {
    if (keyval === Gdk.KEY_Escape) {
      closeAllPopups()
      return true
    }
    return false
  })
  win.add_controller(keyController)

  return win
}
