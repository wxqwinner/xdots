import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import GLib from "gi://GLib"
import { createPoll } from "ags/time"
import { closeAllPopups } from "../../../lib/popup-manager"
import { addEscapeHandler } from "../../../lib/ui-components"
import { spawnAsync } from "../../../lib/system-commands"
import { getMediaInfo, formatTime } from "./media-utils"

export function MediaPopup() {
  const { TOP, RIGHT } = Astal.WindowAnchor

  // Poll media info every 1 second
  const mediaInfo = createPoll(
    { title: "", artist: "", status: "Stopped" as const, position: 0, length: 0 },
    1000,
    () => getMediaInfo()
  )

  // Container for track info - we'll update this dynamically
  const trackInfoBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 4,
  })
  trackInfoBox.add_css_class("track-info")

  // Container for progress info
  const progressInfoBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 8,
  })
  progressInfoBox.add_css_class("progress-info")

  // Container for control buttons
  const controlsBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 12,
    halign: Gtk.Align.CENTER,
  })
  controlsBox.add_css_class("playback-controls")

  // Function to update track info display
  function updateTrackInfo() {
    const info = mediaInfo.get()

    // Clear track info
    let child = trackInfoBox.get_first_child()
    while (child) {
      const next = child.get_next_sibling()
      trackInfoBox.remove(child)
      child = next
    }

    // Clear progress info
    child = progressInfoBox.get_first_child()
    while (child) {
      const next = child.get_next_sibling()
      progressInfoBox.remove(child)
      child = next
    }

    if (info.status === "Stopped" || !info.title) {
      // No media playing
      const noMediaLabel = new Gtk.Label({ label: "No media playing" })
      noMediaLabel.add_css_class("no-media-label")
      trackInfoBox.append(noMediaLabel)
    } else {
      // Title
      const titleLabel = new Gtk.Label({
        label: info.title,
        xalign: 0,
        ellipsize: 3, // PANGO_ELLIPSIZE_END
      })
      titleLabel.add_css_class("track-title")
      trackInfoBox.append(titleLabel)

      // Artist
      const artistLabel = new Gtk.Label({
        label: info.artist,
        xalign: 0,
      })
      artistLabel.add_css_class("track-artist")
      trackInfoBox.append(artistLabel)

      // Progress info (position / length)
      if (info.length > 0) {
        const posLabel = new Gtk.Label({ label: formatTime(info.position) })
        posLabel.add_css_class("time-label")
        progressInfoBox.append(posLabel)

        const separator = new Gtk.Label({ label: "/" })
        separator.add_css_class("time-separator")
        progressInfoBox.append(separator)

        const lenLabel = new Gtk.Label({ label: formatTime(info.length) })
        lenLabel.add_css_class("time-label")
        progressInfoBox.append(lenLabel)
      }
    }

    // Update play/pause button icon
    const playPauseBtn = controlsBox.get_first_child()?.get_next_sibling() as Gtk.Button | null
    if (playPauseBtn) {
      const label = playPauseBtn.get_child() as Gtk.Label
      if (label) {
        label.label = info.status === "Playing" ? "󰏤" : "󰐊"
      }
    }
  }

  // Create control buttons
  const prevBtn = new Gtk.Button()
  prevBtn.add_css_class("control-btn")
  const prevLabel = new Gtk.Label({ label: "󰒮" })
  prevBtn.set_child(prevLabel)
  prevBtn.connect("clicked", () => {
    spawnAsync("playerctl previous")
    // Delay update to allow playerctl to switch
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
      updateTrackInfo()
      return GLib.SOURCE_REMOVE
    })
  })
  controlsBox.append(prevBtn)

  const playPauseBtn = new Gtk.Button()
  playPauseBtn.add_css_class("control-btn")
  playPauseBtn.add_css_class("play-pause")
  const playPauseLabel = new Gtk.Label({ label: "󰐊" })
  playPauseBtn.set_child(playPauseLabel)
  playPauseBtn.connect("clicked", () => {
    spawnAsync("playerctl play-pause")
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
      updateTrackInfo()
      return GLib.SOURCE_REMOVE
    })
  })
  controlsBox.append(playPauseBtn)

  const nextBtn = new Gtk.Button()
  nextBtn.add_css_class("control-btn")
  const nextLabel = new Gtk.Label({ label: "󰒭" })
  nextBtn.set_child(nextLabel)
  nextBtn.connect("clicked", () => {
    spawnAsync("playerctl next")
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
      updateTrackInfo()
      return GLib.SOURCE_REMOVE
    })
  })
  controlsBox.append(nextBtn)

  // Initial population
  updateTrackInfo()

  // Set up polling to update display
  let pollTimer: number | null = null
  function startPolling() {
    if (pollTimer) return
    pollTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
      updateTrackInfo()
      return GLib.SOURCE_CONTINUE
    })
  }

  function stopPolling() {
    if (pollTimer) {
      GLib.source_remove(pollTimer)
      pollTimer = null
    }
  }

  const win = (
    <window
      visible={false}
      namespace="ags-media-popup"
      name="media-popup"
      cssClasses={["MediaPopup"]}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      <box cssClasses={["media-popup-content"]} orientation={Gtk.Orientation.VERTICAL}>
        <box cssClasses={["media-header"]}>
          <label label="󰎆 Media" cssClasses={["popup-title"]} hexpand />
        </box>

        <box cssClasses={["track-section"]} orientation={Gtk.Orientation.VERTICAL}>
          {trackInfoBox}
        </box>

        <box cssClasses={["progress-section"]} orientation={Gtk.Orientation.VERTICAL}>
          {progressInfoBox}
        </box>

        <box cssClasses={["controls-section"]}>
          {controlsBox}
        </box>
      </box>
    </window>
  ) as Astal.Window

  // Update when popup becomes visible and start polling
  win.connect("notify::visible", () => {
    if (win.visible) {
      updateTrackInfo()
      startPolling()
    } else {
      stopPolling()
    }
  })

  // Escape key to close
  addEscapeHandler(win)

  return win
}
