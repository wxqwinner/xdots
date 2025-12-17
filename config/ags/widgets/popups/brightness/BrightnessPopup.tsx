import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import GLib from "gi://GLib"
import { closeAllPopups } from "../../../lib/popup-manager"
import { addEscapeHandler } from "../../../lib/ui-components"
import {
  currentBrightnessValue,
  getSunTimes,
  formatSunTime,
  applyNightLight,
  setBrightness,
  isNightTime,
  getNightLightAuto,
  getNightLightState,
  setNightLightAuto
} from "./night-light"

export function BrightnessPopup() {
  const { TOP, RIGHT } = Astal.WindowAnchor

  const win = (
    <window
      visible={false}
      namespace="ags-brightness-popup"
      name="brightness-popup"
      cssClasses={["BrightnessPopup"]}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      <box cssClasses={["brightness-popup-content"]} orientation={Gtk.Orientation.VERTICAL}>
        <box cssClasses={["brightness-header"]}>
          <label label="󰃟 Brightness" cssClasses={["popup-title"]} />
        </box>

        {(() => {
          // Create brightness label so we can update it
          const brightnessLabel = new Gtk.Label({ label: `${currentBrightnessValue}%` })
          brightnessLabel.add_css_class("brightness-value")

          const scale = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            drawValue: false,
            hexpand: true,
          })
          scale.set_range(5, 100)
          scale.set_increments(5, 10)
          scale.add_css_class("brightness-slider")
          scale.set_value(currentBrightnessValue)

          // Instant shader-based brightness - no debounce needed!
          scale.connect("value-changed", () => {
            const value = Math.round(scale.get_value())
            setBrightness(value)
            brightnessLabel.label = `${value}%`
          })

          const section = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 8,
          })
          section.add_css_class("brightness-section")

          const row = new Gtk.Box({ spacing: 8 })
          row.add_css_class("brightness-row")
          row.append(new Gtk.Label({ label: "All Monitors", hexpand: true, xalign: 0 }))
          row.append(brightnessLabel)

          section.append(row)
          section.append(scale)

          return section
        })()}

        <box cssClasses={["nightlight-section"]}>
          <box cssClasses={["nightlight-info"]} hexpand orientation={Gtk.Orientation.VERTICAL}>
            <box>
              <label cssClasses={["nightlight-icon"]} label="󰖔 " />
              <label label="Night Light" cssClasses={["nightlight-label"]} />
            </box>
            {(() => {
              const { sunrise, sunset } = getSunTimes()
              const desc = getNightLightAuto()
                ? `Auto: ${formatSunTime(sunset)} - ${formatSunTime(sunrise)}`
                : "Manual mode"
              return <label label={desc} cssClasses={["nightlight-description"]} />
            })()}
          </box>
          {(() => {
            const btn = new Gtk.Button()
            btn.add_css_class("toggle-btn")
            if (getNightLightState()) btn.add_css_class("active")
            const lbl = new Gtk.Label({ label: getNightLightState() ? "ON" : "OFF" })
            btn.set_child(lbl)
            btn.connect("clicked", () => {
              // Manual toggle disables auto mode
              setNightLightAuto(false)
              const newState = !getNightLightState()
              if (newState) {
                btn.add_css_class("active")
                lbl.label = "ON"
              } else {
                btn.remove_css_class("active")
                lbl.label = "OFF"
              }
              applyNightLight(newState)
            })
            return btn
          })()}
        </box>

        <box cssClasses={["auto-section"]}>
          <label label="Auto (sunrise/sunset)" hexpand />
          {(() => {
            const btn = new Gtk.Button()
            btn.add_css_class("toggle-btn")
            if (getNightLightAuto()) btn.add_css_class("active")
            const lbl = new Gtk.Label({ label: getNightLightAuto() ? "ON" : "OFF" })
            btn.set_child(lbl)
            btn.connect("clicked", () => {
              const newAutoState = !getNightLightAuto()
              setNightLightAuto(newAutoState)
              if (newAutoState) {
                btn.add_css_class("active")
                lbl.label = "ON"
                // Immediately apply based on time
                const shouldBeOn = isNightTime()
                applyNightLight(shouldBeOn)
              } else {
                btn.remove_css_class("active")
                lbl.label = "OFF"
              }
            })
            return btn
          })()}
        </box>
      </box>
    </window>
  ) as Astal.Window

  // Escape key to close
  addEscapeHandler(win)

  return win
}
