import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import GLib from "gi://GLib"
import { closeAllPopups } from "../../../lib/popup-manager"
import { addEscapeHandler } from "../../../lib/ui-components"
import { getBluetoothDeviceIcon } from "../../../lib/constants"
import { spawnAsync } from "../../../lib/system-commands"
import {
  BluetoothDevice,
  parseBluetoothDevices,
  isBluetoothPowered
} from "./bluetooth-utils"

export default function BluetoothPopup() {
  const { TOP, RIGHT } = Astal.WindowAnchor

  // State for bluetooth power and devices
  let bluetoothPowered = isBluetoothPowered()
  let devices = parseBluetoothDevices()

  // Container for device list - we'll update this dynamically
  const deviceListBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  })
  deviceListBox.add_css_class("device-list")

  // Container for power toggle button (we'll update it)
  const toggleBtnContainer = new Gtk.Box()

  // Function to refresh device list
  function refreshDevices() {
    bluetoothPowered = isBluetoothPowered()
    devices = parseBluetoothDevices()

    // Clear device list
    let child = deviceListBox.get_first_child()
    while (child) {
      const next = child.get_next_sibling()
      deviceListBox.remove(child)
      child = next
    }

    // Rebuild device list
    if (bluetoothPowered && devices.length > 0) {
      devices.forEach(device => {
        const deviceBox = new Gtk.Box({
          spacing: 12,
          hexpand: true,
        })
        deviceBox.add_css_class("device-row")

        // Device icon and name
        const iconLabel = new Gtk.Label({ label: getBluetoothDeviceIcon(device.name) })
        iconLabel.add_css_class("device-icon")
        deviceBox.append(iconLabel)

        const nameLabel = new Gtk.Label({ label: device.name, hexpand: true, xalign: 0 })
        nameLabel.add_css_class("device-name")
        deviceBox.append(nameLabel)

        // Connect/Disconnect button
        const actionBtn = new Gtk.Button()
        actionBtn.add_css_class("device-action-btn")
        if (device.connected) {
          actionBtn.add_css_class("disconnect")
          actionBtn.label = "Disconnect"
        } else {
          actionBtn.add_css_class("connect")
          actionBtn.label = "Connect"
        }
        actionBtn.connect("clicked", () => {
          if (device.connected) {
            spawnAsync(`bluetoothctl disconnect ${device.mac}`)
          } else {
            spawnAsync(`bluetoothctl connect ${device.mac}`)
          }
          // Refresh after a short delay to allow connection to complete
          GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
            refreshDevices()
            return GLib.SOURCE_REMOVE
          })
        })
        deviceBox.append(actionBtn)

        deviceListBox.append(deviceBox)
      })
    } else if (bluetoothPowered) {
      const emptyLabel = new Gtk.Label({ label: "No paired devices" })
      emptyLabel.add_css_class("empty-label")
      deviceListBox.append(emptyLabel)
    } else {
      const offLabel = new Gtk.Label({ label: "Bluetooth is off" })
      offLabel.add_css_class("empty-label")
      deviceListBox.append(offLabel)
    }

    // Update power toggle button
    const oldBtn = toggleBtnContainer.get_first_child()
    if (oldBtn) toggleBtnContainer.remove(oldBtn)

    const toggleBtn = new Gtk.Button()
    toggleBtn.add_css_class("toggle-btn")
    if (bluetoothPowered) toggleBtn.add_css_class("active")
    toggleBtn.label = bluetoothPowered ? "ON" : "OFF"
    toggleBtn.connect("clicked", () => {
      if (bluetoothPowered) {
        spawnAsync("bluetoothctl power off")
      } else {
        spawnAsync("bluetoothctl power on")
      }
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        refreshDevices()
        return GLib.SOURCE_REMOVE
      })
    })
    toggleBtnContainer.append(toggleBtn)
  }

  // Initial population
  refreshDevices()

  const win = (
    <window
      visible={false}
      namespace="ags-bluetooth-popup"
      name="bluetooth-popup"
      cssClasses={["BluetoothPopup"]}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      <box cssClasses={["bluetooth-popup-content"]} orientation={Gtk.Orientation.VERTICAL}>
        <box cssClasses={["bluetooth-header"]}>
          <label label="󰂯 Bluetooth" cssClasses={["popup-title"]} hexpand />
          {toggleBtnContainer}
        </box>

        <box cssClasses={["devices-section"]} orientation={Gtk.Orientation.VERTICAL}>
          <label label="Paired Devices" cssClasses={["section-title"]} xalign={0} />
          {deviceListBox}
        </box>

        <box cssClasses={["controls-section"]}>
          <button
            cssClasses={["settings-btn"]}
            hexpand
            onClicked={() => {
              spawnAsync("plasma-open-settings kcm_bluetooth")
              closeAllPopups()
            }}
          >
            <label label=" Open Settings" />
          </button>
        </box>
      </box>
    </window>
  ) as Astal.Window

  // Refresh devices when popup becomes visible
  win.connect("notify::visible", () => {
    if (win.visible) {
      refreshDevices()
    }
  })

  // Escape key to close
  addEscapeHandler(win)

  return win
}
