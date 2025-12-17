import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import GLib from "gi://GLib"
import { closeAllPopups } from "../../../lib/popup-manager"
import { addEscapeHandler } from "../../../lib/ui-components"
import { getWifiSignalIcon } from "../../../lib/constants"
import { spawnAsync } from "../../../lib/system-commands"
import {
  WifiNetwork,
  parseWifiNetworks,
  getCurrentWifiConnection,
  isWifiEnabled
} from "./network-utils"

// WiFi popup using nmcli with dynamic polling and password dialog
export function WifiPopup() {
  const { TOP, RIGHT } = Astal.WindowAnchor

  // Polling state
  let pollSourceId: number | null = null
  let isScanning = false
  let selectedNetwork: string | null = null

  // Containers for dynamic content
  const connectionLabel = new Gtk.Label({ xalign: 0 })
  connectionLabel.add_css_class("connection-status")

  // Scanning indicator
  const scanningBox = new Gtk.Box({ spacing: 8, halign: Gtk.Align.CENTER })
  scanningBox.add_css_class("scanning-indicator")
  const scanningSpinner = new Gtk.Spinner()
  const scanningLabel = new Gtk.Label({ label: "Scanning..." })
  scanningLabel.add_css_class("scanning-text")
  scanningBox.append(scanningSpinner)
  scanningBox.append(scanningLabel)
  scanningBox.visible = false

  // Password entry dialog (hidden by default)
  const passwordBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  })
  passwordBox.add_css_class("password-dialog")
  passwordBox.visible = false

  const passwordHeader = new Gtk.Box({ spacing: 8 })
  const passwordNetworkLabel = new Gtk.Label({ label: "", xalign: 0, hexpand: true })
  passwordNetworkLabel.add_css_class("password-network-name")
  const passwordBackBtn = new Gtk.Button({ label: "✕" })
  passwordBackBtn.add_css_class("password-back-btn")
  passwordHeader.append(passwordNetworkLabel)
  passwordHeader.append(passwordBackBtn)
  passwordBox.append(passwordHeader)

  const passwordEntry = new Gtk.PasswordEntry({
    showPeekIcon: true,
    placeholderText: "Enter WiFi password",
  })
  passwordEntry.add_css_class("password-entry")
  passwordBox.append(passwordEntry)

  const passwordConnectBtn = new Gtk.Button({ label: "Connect" })
  passwordConnectBtn.add_css_class("password-connect-btn")
  passwordBox.append(passwordConnectBtn)

  const passwordErrorLabel = new Gtk.Label({ label: "", xalign: 0 })
  passwordErrorLabel.add_css_class("password-error")
  passwordErrorLabel.visible = false
  passwordBox.append(passwordErrorLabel)

  // Show password dialog for a network
  function showPasswordDialog(ssid: string) {
    selectedNetwork = ssid
    passwordNetworkLabel.label = `Connect to "${ssid}"`
    passwordEntry.set_text("")
    passwordErrorLabel.visible = false
    passwordBox.visible = true
    networksListBox.visible = false
    passwordEntry.grab_focus()
  }

  // Hide password dialog
  function hidePasswordDialog() {
    selectedNetwork = null
    passwordBox.visible = false
    networksListBox.visible = true
  }

  // Connect with password
  function connectWithPassword() {
    if (!selectedNetwork) return
    const password = passwordEntry.get_text()
    if (!password || password.length < 8) {
      passwordErrorLabel.label = "Password must be at least 8 characters"
      passwordErrorLabel.visible = true
      return
    }

    passwordErrorLabel.visible = false
    passwordConnectBtn.label = "Connecting..."
    passwordConnectBtn.sensitive = false

    // Show auth hint
    passwordErrorLabel.label = "System auth may be required..."
    passwordErrorLabel.add_css_class("info")
    passwordErrorLabel.visible = true

    // Use nmcli with password - escape special chars in password
    const escapedPass = password.replace(/'/g, "'\\''")
    const cmd = `nmcli device wifi connect '${selectedNetwork}' password '${escapedPass}'`

    // Run connection attempt
    GLib.spawn_command_line_async(cmd)

    // Check result multiple times (polkit auth can take a while)
    let attempts = 0
    const maxAttempts = 5
    const checkConnection = () => {
      attempts++
      const currentConn = getCurrentWifiConnection()
      if (currentConn === selectedNetwork) {
        // Success!
        passwordErrorLabel.remove_css_class("info")
        hidePasswordDialog()
        refreshWifi()
        passwordConnectBtn.label = "Connect"
        passwordConnectBtn.sensitive = true
        return GLib.SOURCE_REMOVE
      } else if (attempts >= maxAttempts) {
        // Failed after all attempts
        passwordErrorLabel.remove_css_class("info")
        passwordErrorLabel.label = "Connection failed. Check password."
        passwordErrorLabel.visible = true
        passwordConnectBtn.label = "Connect"
        passwordConnectBtn.sensitive = true
        return GLib.SOURCE_REMOVE
      }
      // Keep checking
      return GLib.SOURCE_CONTINUE
    }

    // Check every 2 seconds for up to 10 seconds total
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, checkConnection)
  }

  passwordBackBtn.connect("clicked", hidePasswordDialog)
  passwordConnectBtn.connect("clicked", connectWithPassword)
  passwordEntry.connect("activate", connectWithPassword) // Enter key

  const networksListBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 4,
  })
  networksListBox.add_css_class("networks-list")

  const toggleBtnContainer = new Gtk.Box()

  // Show scanning animation
  function showScanning(show: boolean) {
    isScanning = show
    scanningBox.visible = show
    if (show) {
      scanningSpinner.start()
    } else {
      scanningSpinner.stop()
    }
  }

  // Refresh function
  function refreshWifi() {
    const wifiEnabled = isWifiEnabled()
    const currentConn = getCurrentWifiConnection()
    const networks = parseWifiNetworks()

    // Update connection label
    connectionLabel.label = currentConn ? `Connected: ${currentConn}` : "Not connected"

    // Clear networks list
    let child = networksListBox.get_first_child()
    while (child) {
      const next = child.get_next_sibling()
      networksListBox.remove(child)
      child = next
    }

    // Rebuild networks list
    if (wifiEnabled && networks.length > 0) {
      networks.forEach(network => {
        const btn = new Gtk.Button()
        btn.add_css_class("network-item")
        if (network.active) btn.add_css_class("active")
        if (network.saved) btn.add_css_class("saved")

        const box = new Gtk.Box({ spacing: 8 })

        const nameLabel = new Gtk.Label({
          label: `${getWifiSignalIcon(network.signal)} ${network.ssid}`,
          xalign: 0,
          hexpand: true,
        })
        nameLabel.add_css_class("network-name")
        box.append(nameLabel)

        // Show saved indicator
        if (network.saved && !network.active) {
          const savedLabel = new Gtk.Label({ label: "󰄬" })
          savedLabel.add_css_class("network-saved")
          savedLabel.tooltipText = "Saved"
          box.append(savedLabel)
        }

        if (network.security && !network.saved) {
          const secLabel = new Gtk.Label({ label: "󰌾" })
          secLabel.add_css_class("network-security")
          box.append(secLabel)
        }

        const signalLabel = new Gtk.Label({ label: `${network.signal}%` })
        signalLabel.add_css_class("network-signal")
        box.append(signalLabel)

        btn.set_child(box)

        // Left click: connect or disconnect
        btn.connect("clicked", () => {
          if (network.active) {
            // Disconnect from current network (get wifi device dynamically)
            const [, devOut] = GLib.spawn_command_line_sync("nmcli -t -f DEVICE,TYPE device status")
            const devLines = new TextDecoder().decode(devOut).split("\n")
            const wifiDev = devLines.find(l => l.includes(":wifi"))?.split(":")[0] || "wlp5s0"
            GLib.spawn_command_line_async(`nmcli device disconnect ${wifiDev}`)
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
              refreshWifi()
              return GLib.SOURCE_REMOVE
            })
          } else if (network.saved) {
            // Try to connect - if it fails due to missing password, show dialog
            GLib.spawn_command_line_async(`nmcli connection up "${network.ssid}"`)
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
              const currentConn = getCurrentWifiConnection()
              if (currentConn !== network.ssid) {
                // Connection failed, probably needs password
                showPasswordDialog(network.ssid)
              } else {
                refreshWifi()
              }
              return GLib.SOURCE_REMOVE
            })
          } else if (network.security) {
            // New secured network - show password dialog
            showPasswordDialog(network.ssid)
          } else {
            // Open network - connect directly
            GLib.spawn_command_line_async(`nmcli device wifi connect "${network.ssid}"`)
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
              refreshWifi()
              return GLib.SOURCE_REMOVE
            })
          }
        })

        // Right click: forget saved network
        const rightClickCtrl = new Gtk.GestureClick({ button: 3 }) // Button 3 = right click
        rightClickCtrl.connect("pressed", () => {
          if (network.saved) {
            // Delete the saved connection
            GLib.spawn_command_line_async(`nmcli connection delete "${network.ssid}"`)
            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
              refreshWifi()
              return GLib.SOURCE_REMOVE
            })
          }
        })
        btn.add_controller(rightClickCtrl)

        networksListBox.append(btn)
      })
      showScanning(false)
    } else if (wifiEnabled) {
      if (!isScanning) {
        const emptyLabel = new Gtk.Label({ label: "No networks found" })
        emptyLabel.add_css_class("empty-label")
        networksListBox.append(emptyLabel)
      }
    } else {
      showScanning(false)
      const offLabel = new Gtk.Label({ label: "WiFi is disabled" })
      offLabel.add_css_class("empty-label")
      networksListBox.append(offLabel)
    }

    // Update toggle button
    const oldBtn = toggleBtnContainer.get_first_child()
    if (oldBtn) toggleBtnContainer.remove(oldBtn)

    const toggleBtn = new Gtk.Button()
    toggleBtn.add_css_class("toggle-btn")
    if (wifiEnabled) toggleBtn.add_css_class("active")
    toggleBtn.label = wifiEnabled ? "ON" : "OFF"
    toggleBtn.connect("clicked", () => {
      if (wifiEnabled) {
        GLib.spawn_command_line_async("nmcli radio wifi off")
        stopPolling()
      } else {
        GLib.spawn_command_line_async("nmcli radio wifi on")
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
          startPolling()
          return GLib.SOURCE_REMOVE
        })
      }
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
        refreshWifi()
        return GLib.SOURCE_REMOVE
      })
    })
    toggleBtnContainer.append(toggleBtn)
  }

  // Start dynamic polling while popup is open
  function startPolling() {
    if (pollSourceId !== null) return
    if (!isWifiEnabled()) return

    // Initial scan with animation
    showScanning(true)
    GLib.spawn_command_line_async("nmcli device wifi rescan")

    // Refresh after initial scan
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1500, () => {
      refreshWifi()
      return GLib.SOURCE_REMOVE
    })

    // Poll every 5 seconds while popup is open
    pollSourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
      if (!isWifiEnabled()) {
        stopPolling()
        return GLib.SOURCE_REMOVE
      }
      // Rescan and refresh
      GLib.spawn_command_line_async("nmcli device wifi rescan")
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000, () => {
        refreshWifi()
        return GLib.SOURCE_REMOVE
      })
      return GLib.SOURCE_CONTINUE
    })
  }

  // Stop polling when popup closes
  function stopPolling() {
    if (pollSourceId !== null) {
      GLib.source_remove(pollSourceId)
      pollSourceId = null
    }
    showScanning(false)
  }

  // Initial population
  refreshWifi()

  const win = (
    <window
      visible={false}
      namespace="ags-wifi-popup"
      name="wifi-popup"
      cssClasses={["WifiPopup"]}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      <box cssClasses={["wifi-popup-content"]} orientation={Gtk.Orientation.VERTICAL}>
        <box cssClasses={["wifi-header"]}>
          <label label="󰤨 WiFi" cssClasses={["popup-title"]} hexpand />
          {toggleBtnContainer}
        </box>

        <box cssClasses={["current-connection"]}>
          {connectionLabel}
        </box>

        {scanningBox}
        {networksListBox}
        {passwordBox}

        <box cssClasses={["controls-section"]}>
          <button
            cssClasses={["settings-btn"]}
            hexpand
            onClicked={() => {
              GLib.spawn_command_line_async("plasma-open-settings kcm_networkmanagement")
              closeAllPopups()
            }}
          >
            <label label=" Open Settings" />
          </button>
        </box>
      </box>
    </window>
  ) as Astal.Window

  // Start/stop polling when popup visibility changes
  win.connect("notify::visible", () => {
    if (win.visible) {
      refreshWifi()
      startPolling()
    } else {
      stopPolling()
    }
  })

  // Escape key to close
  addEscapeHandler(win)

  return win
}
