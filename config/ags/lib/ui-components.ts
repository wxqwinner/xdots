import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import Astal from "gi://Astal?version=4.0"
import { closeAllPopups } from "./popup-manager"

/**
 * Adds an Escape key handler to a window that closes all popups.
 * Used by popup windows to allow quick dismissal.
 *
 * @param window - The Astal.Window to add the escape handler to
 */
export function addEscapeHandler(window: Astal.Window): void {
  const keyController = new Gtk.EventControllerKey()
  keyController.connect("key-pressed", (_ctrl: any, keyval: number) => {
    if (keyval === Gdk.KEY_Escape) {
      closeAllPopups()
      return true
    }
    return false
  })
  window.add_controller(keyController)
}

/**
 * Creates a toggle button with ON/OFF states.
 * Used for controls like WiFi, Bluetooth, Night Light, etc.
 *
 * @param initialState - Whether the button should start in the "on" state
 * @param onToggle - Callback fired when the button is clicked with the new state
 * @returns A GTK Button configured as a toggle
 */
export function createToggleButton(
  initialState: boolean,
  onToggle: (state: boolean) => void
): Gtk.Button {
  const btn = new Gtk.Button()
  btn.add_css_class("toggle-btn")
  if (initialState) btn.add_css_class("active")

  const label = new Gtk.Label({ label: initialState ? "ON" : "OFF" })
  btn.set_child(label)

  btn.connect("clicked", () => {
    const newState = !btn.has_css_class("active")
    if (newState) {
      btn.add_css_class("active")
      label.label = "ON"
    } else {
      btn.remove_css_class("active")
      label.label = "OFF"
    }
    onToggle(newState)
  })

  return btn
}
