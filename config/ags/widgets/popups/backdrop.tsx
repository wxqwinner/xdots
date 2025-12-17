import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import { closeAllPopups } from "../../lib/popup-manager"

// Transparent backdrop that covers screen to catch outside clicks
export default function PopupBackdrop() {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor

  const win = (
    <window
      visible={false}
      namespace="popup-backdrop"
      name="popup-backdrop"
      cssClasses={["PopupBackdrop"]}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.TOP}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      <box hexpand vexpand />
    </window>
  ) as Astal.Window

  // Click anywhere on backdrop closes all popups
  const clickController = new Gtk.GestureClick()
  clickController.connect("released", () => {
    closeAllPopups()
  })
  win.add_controller(clickController)

  return win
}
