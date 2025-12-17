import Gtk from "gi://Gtk?version=4.0"
import { fileExists, spawnAsync, touchFile, removeFile } from "../../lib/system-commands"

// Caffeine state
let caffeineState = fileExists("/tmp/ags-caffeine-active")

export default function Caffeine() {
  const btn = new Gtk.Button()
  btn.add_css_class("systray-btn")
  if (caffeineState) btn.add_css_class("active")
  btn.tooltipText = caffeineState ? "Caffeine ON" : "Caffeine OFF"

  const icon = new Gtk.Label({ label: caffeineState ? "󰅶" : "󰛊" })
  icon.add_css_class("icon")
  btn.set_child(icon)

  btn.connect("clicked", () => {
    caffeineState = !caffeineState
    if (caffeineState) {
      btn.add_css_class("active")
      icon.label = "󰅶"
      btn.tooltipText = "Caffeine ON"
      spawnAsync("bash -c 'systemd-inhibit --what=idle --who=ags-caffeine --why=\"Caffeine mode\" sleep infinity &'")
      touchFile("/tmp/ags-caffeine-active")
    } else {
      btn.remove_css_class("active")
      icon.label = "󰛊"
      btn.tooltipText = "Caffeine OFF"
      spawnAsync("pkill -f 'systemd-inhibit.*ags-caffeine'")
      removeFile("/tmp/ags-caffeine-active")
    }
  })

  return btn
}
