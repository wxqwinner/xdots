import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import GLib from "gi://GLib"
import AstalWp from "gi://AstalWp"
import { closeAllPopups } from "../../../lib/popup-manager"
import { getMediaInfo, formatTime, getPlayerctlIgnoreFlags } from "../media/media-utils"

// Enhanced Audio popup with dropdown device selection and media controls
export function AudioPopup() {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const wp = AstalWp.get_default()
  const audio = wp?.audio

  if (!audio) {
    return null
  }

  // Track expanded state for each dropdown
  let outputExpanded = false
  let profileExpanded = false
  let inputExpanded = false

  // Current speaker reference
  let currentSpeaker: AstalWp.Endpoint | null = null

  // Window reference for dynamic resizing
  let winRef: Astal.Window | null = null

  // Helper: Force window to recalculate size (needed for layer shell windows)
  function triggerWindowResize() {
    if (winRef) winRef.set_default_size(-1, -1)
  }

  // Main content container
  const contentBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 0,
    hexpand: false,
  })
  contentBox.add_css_class("audio-popup-content")
  contentBox.set_size_request(255, -1)  // Fixed width (~1.7x of 150)

  // Header
  const header = new Gtk.Box({ spacing: 8 })
  header.add_css_class("audio-header")
  const headerTitle = new Gtk.Label({ label: "󰕾 Sound", hexpand: true, xalign: 0 })
  headerTitle.add_css_class("popup-title")
  header.append(headerTitle)
  contentBox.append(header)

  // Volume section container (slider only)
  const volumeSection = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  })
  volumeSection.add_css_class("volume-section")
  contentBox.append(volumeSection)

  // Media section container (NOW PLAYING - between slider and mute)
  const mediaSection = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  })
  mediaSection.add_css_class("media-section")
  contentBox.append(mediaSection)

  // Mute section container (separate from volume)
  const muteSection = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  })
  muteSection.add_css_class("mute-section")
  contentBox.append(muteSection)

  // Output device dropdown container
  const outputDropdown = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 0,
  })
  outputDropdown.add_css_class("dropdown-section")
  contentBox.append(outputDropdown)

  // Profile dropdown container
  const profileDropdown = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 0,
  })
  profileDropdown.add_css_class("dropdown-section")
  contentBox.append(profileDropdown)

  // Input device dropdown container
  const inputDropdown = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 0,
  })
  inputDropdown.add_css_class("dropdown-section")
  contentBox.append(inputDropdown)

  // Settings button
  const controlsSection = new Gtk.Box({ spacing: 8 })
  controlsSection.add_css_class("controls-section")
  const settingsBtn = new Gtk.Button()
  settingsBtn.add_css_class("settings-btn")
  settingsBtn.hexpand = true
  const settingsLabel = new Gtk.Label({ label: " Settings" })
  settingsBtn.set_child(settingsLabel)
  settingsBtn.connect("clicked", () => {
    GLib.spawn_command_line_async("pavucontrol")
    closeAllPopups()
  })
  controlsSection.append(settingsBtn)
  contentBox.append(controlsSection)

  // Helper to clear a container
  function clearContainer(container: Gtk.Box) {
    let child = container.get_first_child()
    while (child) {
      const next = child.get_next_sibling()
      container.remove(child)
      child = next
    }
  }

  // Build volume controls (slider only - mute is separate)
  function buildVolumeSection(speaker: AstalWp.Endpoint) {
    clearContainer(volumeSection)
    clearContainer(muteSection)
    currentSpeaker = speaker

    // Volume row
    const volumeRow = new Gtk.Box({ spacing: 8 })
    volumeRow.add_css_class("volume-row")

    const volLabel = new Gtk.Label({ label: "Volume", hexpand: true, xalign: 0 })
    volumeRow.append(volLabel)

    const volumeValue = new Gtk.Label({ label: `${Math.round(speaker.volume * 100)}%` })
    volumeValue.add_css_class("volume-value")
    volumeRow.append(volumeValue)
    volumeSection.append(volumeRow)

    // Volume slider
    const volumeScale = new Gtk.Scale({
      orientation: Gtk.Orientation.HORIZONTAL,
      drawValue: false,
      hexpand: true,
    })
    volumeScale.set_range(0, 100)
    volumeScale.set_increments(1, 5)
    volumeScale.add_css_class("volume-slider")
    volumeScale.set_value(speaker.volume * 100)

    let updatingFromBinding = false
    speaker.connect("notify::volume", () => {
      updatingFromBinding = true
      volumeScale.set_value(speaker.volume * 100)
      volumeValue.label = `${Math.round(speaker.volume * 100)}%`
      updatingFromBinding = false
    })

    volumeScale.connect("value-changed", () => {
      if (!updatingFromBinding && currentSpeaker) {
        currentSpeaker.volume = volumeScale.get_value() / 100
      }
    })
    volumeSection.append(volumeScale)

    // Mute button (now in separate section below media)
    const muteBtn = new Gtk.Button()
    muteBtn.add_css_class("mute-btn")
    if (speaker.mute) muteBtn.add_css_class("active")

    const muteBtnLabel = new Gtk.Label({ label: speaker.mute ? "󰖁 Unmute" : "󰕾 Mute" })
    muteBtn.set_child(muteBtnLabel)

    speaker.connect("notify::mute", () => {
      muteBtnLabel.label = speaker.mute ? "󰖁 Unmute" : "󰕾 Mute"
      if (speaker.mute) {
        muteBtn.add_css_class("active")
      } else {
        muteBtn.remove_css_class("active")
      }
    })

    muteBtn.connect("clicked", () => {
      if (currentSpeaker) currentSpeaker.mute = !currentSpeaker.mute
    })
    muteSection.append(muteBtn)
  }

  // Build output device dropdown
  function buildOutputDropdown() {
    clearContainer(outputDropdown)

    const speakerList = audio.get_speakers()
    if (!speakerList || speakerList.length <= 1) return

    const defaultSpeaker = audio.get_default_speaker()
    const currentName = defaultSpeaker?.description || defaultSpeaker?.name || "Select Output"

    // Dropdown header (clickable)
    const dropdownHeader = new Gtk.Button()
    dropdownHeader.add_css_class("dropdown-header")

    const headerContent = new Gtk.Box({ spacing: 8 })
    const icon = new Gtk.Label({ label: "󰓃" })
    icon.add_css_class("dropdown-icon")
    headerContent.append(icon)

    const labelBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, hexpand: true })
    const titleLabel = new Gtk.Label({ label: "Output", xalign: 0 })
    titleLabel.add_css_class("dropdown-title")
    labelBox.append(titleLabel)
    const valueLabel = new Gtk.Label({ label: currentName, xalign: 0, ellipsize: 3, maxWidthChars: 34 })
    valueLabel.add_css_class("dropdown-value")
    labelBox.append(valueLabel)
    headerContent.append(labelBox)

    const arrow = new Gtk.Label({ label: outputExpanded ? "󰅀" : "󰅂" })
    arrow.add_css_class("dropdown-arrow")
    headerContent.append(arrow)

    dropdownHeader.set_child(headerContent)
    outputDropdown.append(dropdownHeader)

    // Dropdown options (hidden by default via visible property)
    const optionsBox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 2,
      visible: outputExpanded,  // Use visible instead of CSS for proper layout
    })
    optionsBox.add_css_class("dropdown-options")

    speakerList.forEach(speaker => {
      const fullName = speaker.description || speaker.name || "Unknown"
      const optionBtn = new Gtk.Button()
      optionBtn.add_css_class("dropdown-option")
      optionBtn.set_tooltip_text(fullName)  // Show full name on hover
      if (speaker.is_default) optionBtn.add_css_class("active")

      const optionRow = new Gtk.Box({ spacing: 8 })
      const optionName = new Gtk.Label({
        label: fullName,
        xalign: 0,
        hexpand: true,
        ellipsize: 3,
        maxWidthChars: 34,
      })
      optionRow.append(optionName)

      if (speaker.is_default) {
        const check = new Gtk.Label({ label: "󰄬" })
        check.add_css_class("option-check")
        optionRow.append(check)
      }

      optionBtn.set_child(optionRow)
      optionBtn.connect("clicked", () => {
        speaker.set_is_default(true)
        outputExpanded = false
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
          const newSpeaker = audio.get_default_speaker()
          if (newSpeaker) {
            buildVolumeSection(newSpeaker)
            buildOutputDropdown()
            buildProfileDropdown()
          }
          return GLib.SOURCE_REMOVE
        })
      })
      optionsBox.append(optionBtn)
    })

    outputDropdown.append(optionsBox)

    // Toggle dropdown on header click
    dropdownHeader.connect("clicked", () => {
      outputExpanded = !outputExpanded
      arrow.label = outputExpanded ? "󰅀" : "󰅂"
      optionsBox.visible = outputExpanded
      // Collapse other dropdowns
      if (outputExpanded) {
        profileExpanded = false
        inputExpanded = false
        buildProfileDropdown()
        buildInputDropdown()
      }
      triggerWindowResize()
    })
  }

  // Build profile dropdown
  function buildProfileDropdown() {
    clearContainer(profileDropdown)

    const speaker = audio.get_default_speaker()
    if (!speaker) return

    const device = speaker.get_device()
    if (!device) return

    const profiles = device.get_profiles()
    if (!profiles || profiles.length <= 1) return

    const activeProfileId = device.get_active_profile_id()
    const activeProfile = profiles.find(p => p.index === activeProfileId)
    const currentName = activeProfile?.description || activeProfile?.name || "Select Profile"

    // Dropdown header
    const dropdownHeader = new Gtk.Button()
    dropdownHeader.add_css_class("dropdown-header")

    const headerContent = new Gtk.Box({ spacing: 8 })
    const icon = new Gtk.Label({ label: "󰗀" })
    icon.add_css_class("dropdown-icon")
    headerContent.append(icon)

    const labelBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, hexpand: true })
    const titleLabel = new Gtk.Label({ label: "Profile", xalign: 0 })
    titleLabel.add_css_class("dropdown-title")
    labelBox.append(titleLabel)
    const valueLabel = new Gtk.Label({ label: currentName, xalign: 0, ellipsize: 3, maxWidthChars: 34 })
    valueLabel.add_css_class("dropdown-value")
    labelBox.append(valueLabel)
    headerContent.append(labelBox)

    const arrow = new Gtk.Label({ label: profileExpanded ? "󰅀" : "󰅂" })
    arrow.add_css_class("dropdown-arrow")
    headerContent.append(arrow)

    dropdownHeader.set_child(headerContent)
    profileDropdown.append(dropdownHeader)

    // Dropdown options
    const optionsBox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 2,
      visible: profileExpanded,
    })
    optionsBox.add_css_class("dropdown-options")

    profiles.forEach(profile => {
      if (profile.name === "off") return

      const fullName = profile.description || profile.name
      const optionBtn = new Gtk.Button()
      optionBtn.add_css_class("dropdown-option")
      optionBtn.set_tooltip_text(fullName)  // Show full name on hover
      if (profile.index === activeProfileId) optionBtn.add_css_class("active")

      const optionRow = new Gtk.Box({ spacing: 8 })
      const optionName = new Gtk.Label({
        label: fullName,
        xalign: 0,
        hexpand: true,
        ellipsize: 3,
        maxWidthChars: 34,
      })
      optionRow.append(optionName)

      if (profile.index === activeProfileId) {
        const check = new Gtk.Label({ label: "󰄬" })
        check.add_css_class("option-check")
        optionRow.append(check)
      }

      optionBtn.set_child(optionRow)
      optionBtn.connect("clicked", () => {
        device.set_active_profile_id(profile.index)
        profileExpanded = false
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
          buildProfileDropdown()
          return GLib.SOURCE_REMOVE
        })
      })
      optionsBox.append(optionBtn)
    })

    profileDropdown.append(optionsBox)

    dropdownHeader.connect("clicked", () => {
      profileExpanded = !profileExpanded
      arrow.label = profileExpanded ? "󰅀" : "󰅂"
      optionsBox.visible = profileExpanded
      if (profileExpanded) {
        outputExpanded = false
        inputExpanded = false
        buildOutputDropdown()
        buildInputDropdown()
      }
      triggerWindowResize()
    })
  }

  // Build input device dropdown
  function buildInputDropdown() {
    clearContainer(inputDropdown)

    const micList = audio.get_microphones()
    if (!micList || micList.length === 0) return

    const defaultMic = audio.get_default_microphone()
    const currentName = defaultMic?.description || defaultMic?.name || "Select Input"

    // Dropdown header
    const dropdownHeader = new Gtk.Button()
    dropdownHeader.add_css_class("dropdown-header")

    const headerContent = new Gtk.Box({ spacing: 8 })
    const icon = new Gtk.Label({ label: "󰍬" })
    icon.add_css_class("dropdown-icon")
    headerContent.append(icon)

    const labelBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, hexpand: true })
    const titleLabel = new Gtk.Label({ label: "Input", xalign: 0 })
    titleLabel.add_css_class("dropdown-title")
    labelBox.append(titleLabel)
    const valueLabel = new Gtk.Label({ label: currentName, xalign: 0, ellipsize: 3, maxWidthChars: 34 })
    valueLabel.add_css_class("dropdown-value")
    labelBox.append(valueLabel)
    headerContent.append(labelBox)

    const arrow = new Gtk.Label({ label: inputExpanded ? "󰅀" : "󰅂" })
    arrow.add_css_class("dropdown-arrow")
    headerContent.append(arrow)

    dropdownHeader.set_child(headerContent)
    inputDropdown.append(dropdownHeader)

    // Dropdown options
    const optionsBox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 2,
      visible: inputExpanded,
    })
    optionsBox.add_css_class("dropdown-options")

    micList.forEach(mic => {
      const fullName = mic.description || mic.name || "Unknown"
      const optionBtn = new Gtk.Button()
      optionBtn.add_css_class("dropdown-option")
      optionBtn.set_tooltip_text(fullName)  // Show full name on hover
      if (mic.is_default) optionBtn.add_css_class("active")

      const optionRow = new Gtk.Box({ spacing: 8 })
      const optionName = new Gtk.Label({
        label: fullName,
        xalign: 0,
        hexpand: true,
        ellipsize: 3,
        maxWidthChars: 34,
      })
      optionRow.append(optionName)

      if (mic.is_default) {
        const check = new Gtk.Label({ label: "󰄬" })
        check.add_css_class("option-check")
        optionRow.append(check)
      }

      optionBtn.set_child(optionRow)
      optionBtn.connect("clicked", () => {
        mic.set_is_default(true)
        inputExpanded = false
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
          buildInputDropdown()
          return GLib.SOURCE_REMOVE
        })
      })
      optionsBox.append(optionBtn)
    })

    inputDropdown.append(optionsBox)

    dropdownHeader.connect("clicked", () => {
      inputExpanded = !inputExpanded
      arrow.label = inputExpanded ? "󰅀" : "󰅂"
      optionsBox.visible = inputExpanded
      if (inputExpanded) {
        outputExpanded = false
        profileExpanded = false
        buildOutputDropdown()
        buildProfileDropdown()
      }
      triggerWindowResize()
    })
  }

  // Build media controls section
  let mediaPollingId: number | null = null

  function buildMediaSection() {
    clearContainer(mediaSection)

    const mediaInfo = getMediaInfo()

    // Section title
    const sectionTitle = new Gtk.Label({ label: "NOW PLAYING", xalign: 0 })
    sectionTitle.add_css_class("section-title")
    mediaSection.append(sectionTitle)

    const mediaContent = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 8,
    })
    mediaContent.add_css_class("media-content")

    if (mediaInfo.status === "Stopped" && !mediaInfo.title) {
      const noMedia = new Gtk.Label({ label: "No media playing" })
      noMedia.add_css_class("no-media-label")
      mediaContent.append(noMedia)
    } else {
      // Track info
      const trackInfo = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 2,
      })
      trackInfo.add_css_class("track-info")

      const title = new Gtk.Label({
        label: mediaInfo.title || "Unknown",
        xalign: 0,
        ellipsize: 3,
        hexpand: true,
        maxWidthChars: 34,
      })
      title.add_css_class("track-title")
      trackInfo.append(title)

      if (mediaInfo.artist && mediaInfo.artist !== "Unknown Artist") {
        const artist = new Gtk.Label({
          label: mediaInfo.artist,
          xalign: 0,
          ellipsize: 3,
          maxWidthChars: 34,
        })
        artist.add_css_class("track-artist")
        trackInfo.append(artist)
      }
      mediaContent.append(trackInfo)

      // Progress info
      if (mediaInfo.length > 0) {
        const progressInfo = new Gtk.Box({ spacing: 4 })
        progressInfo.add_css_class("progress-info")

        const posLabel = new Gtk.Label({ label: formatTime(mediaInfo.position) })
        posLabel.add_css_class("time-label")
        progressInfo.append(posLabel)

        const sep = new Gtk.Label({ label: "/" })
        sep.add_css_class("time-separator")
        progressInfo.append(sep)

        const lenLabel = new Gtk.Label({ label: formatTime(mediaInfo.length) })
        lenLabel.add_css_class("time-label")
        progressInfo.append(lenLabel)

        mediaContent.append(progressInfo)
      }

      // Playback controls
      const controls = new Gtk.Box({ spacing: 12, halign: Gtk.Align.CENTER })
      controls.add_css_class("playback-controls")

      const ignoreFlags = getPlayerctlIgnoreFlags()

      const prevBtn = new Gtk.Button({ label: "󰒮" })
      prevBtn.add_css_class("control-btn")
      prevBtn.connect("clicked", () => {
        GLib.spawn_command_line_async(`playerctl ${ignoreFlags} previous`)
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
          buildMediaSection()
          return GLib.SOURCE_REMOVE
        })
      })
      controls.append(prevBtn)

      const playPauseBtn = new Gtk.Button({
        label: mediaInfo.status === "Playing" ? "󰏤" : "󰐊"
      })
      playPauseBtn.add_css_class("control-btn")
      playPauseBtn.add_css_class("play-pause")
      playPauseBtn.connect("clicked", () => {
        GLib.spawn_command_line_async(`playerctl ${ignoreFlags} play-pause`)
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
          buildMediaSection()
          return GLib.SOURCE_REMOVE
        })
      })
      controls.append(playPauseBtn)

      const nextBtn = new Gtk.Button({ label: "󰒭" })
      nextBtn.add_css_class("control-btn")
      nextBtn.connect("clicked", () => {
        GLib.spawn_command_line_async(`playerctl ${ignoreFlags} next`)
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 300, () => {
          buildMediaSection()
          return GLib.SOURCE_REMOVE
        })
      })
      controls.append(nextBtn)

      mediaContent.append(controls)
    }

    mediaSection.append(mediaContent)
  }

  function startMediaPolling() {
    if (mediaPollingId) return
    mediaPollingId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
      buildMediaSection()
      return GLib.SOURCE_CONTINUE
    })
  }

  function stopMediaPolling() {
    if (mediaPollingId) {
      GLib.source_remove(mediaPollingId)
      mediaPollingId = null
    }
  }

  // Build the popup window
  const win = (
    <window
      visible={false}
      namespace="ags-audio-popup"
      name="audio-popup"
      cssClasses={["AudioPopup"]}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      {contentBox}
    </window>
  ) as Astal.Window

  // Store window reference for queue_resize in dropdown toggles
  winRef = win

  // Initialize on visibility
  win.connect("notify::visible", () => {
    if (win.visible) {
      // Reset dropdown states
      outputExpanded = false
      profileExpanded = false
      inputExpanded = false

      const speaker = audio.get_default_speaker()
      if (speaker) {
        buildVolumeSection(speaker)
        buildOutputDropdown()
        buildProfileDropdown()
        buildInputDropdown()
        buildMediaSection()
        startMediaPolling()
      }
    } else {
      stopMediaPolling()
    }
  })

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
