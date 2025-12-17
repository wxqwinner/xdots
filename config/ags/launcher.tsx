import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import GLib from "gi://GLib"
import Astal from "gi://Astal?version=4.0"
import AstalApps from "gi://AstalApps?version=0.1"
import app from "ags/gtk4/app"

const MAX_RESULTS = 5
let apps: AstalApps.Apps | null = null

let searchText = ""
let results: AstalApps.Application[] = []
let selectedIndex = 0
let listBox: Gtk.ListBox | null = null
let searchEntry: Gtk.Entry | null = null
let resultsBox: Gtk.Box | null = null
let mainBox: Gtk.Box | null = null
let launcherWindow: Astal.Window | null = null
let debounceTimer: number | null = null

// Lazy init apps to avoid startup lag
function getApps() {
  if (!apps) {
    apps = AstalApps.Apps.new()
  }
  return apps
}

function updateResults() {
  if (!listBox || !resultsBox || !mainBox || !launcherWindow) return

  // Clear existing children
  let child = listBox.get_first_child()
  while (child) {
    const next = child.get_next_sibling()
    listBox.remove(child)
    child = next
  }

  if (searchText.length === 0) {
    results = []
    resultsBox.visible = false
    // Force window to shrink by setting minimal default size
    launcherWindow.set_default_size(1, 1)
    return
  }

  results = getApps().fuzzy_query(searchText).slice(0, MAX_RESULTS)

  if (results.length === 0) {
    resultsBox.visible = false
    launcherWindow.set_default_size(1, 1)
    return
  }

  resultsBox.visible = true
  selectedIndex = 0

  results.forEach((appItem) => {
    const row = new Gtk.ListBoxRow({ canFocus: false })

    const box = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 10,
      marginTop: 5,
      marginBottom: 5,
      marginStart: 12,
      marginEnd: 12,
    })

    const icon = new Gtk.Image({ pixelSize: 22 })
    const iconName = appItem.iconName
    if (iconName) {
      if (iconName.startsWith("/")) {
        icon.set_from_file(iconName)
      } else {
        icon.set_from_icon_name(iconName)
      }
    } else {
      icon.set_from_icon_name("application-x-executable")
    }

    const label = new Gtk.Label({
      label: appItem.name,
      halign: Gtk.Align.START,
      hexpand: true,
      ellipsize: 3,
    })
    label.add_css_class("app-name")

    box.append(icon)
    box.append(label)
    row.set_child(box)
    listBox.append(row)
  })

  // Select first
  const firstRow = listBox.get_row_at_index(0)
  if (firstRow) listBox.select_row(firstRow)

  // Force window to recalculate size
  launcherWindow.set_default_size(1, 1)
}

function debouncedUpdate() {
  if (debounceTimer) {
    GLib.source_remove(debounceTimer)
  }
  debounceTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
    updateResults()
    debounceTimer = null
    return GLib.SOURCE_REMOVE
  })
}

function selectNext() {
  if (!listBox || results.length === 0) return
  if (selectedIndex < results.length - 1) {
    selectedIndex++
    const row = listBox.get_row_at_index(selectedIndex)
    if (row) listBox.select_row(row)
  }
}

function selectPrev() {
  if (!listBox || results.length === 0) return
  if (selectedIndex > 0) {
    selectedIndex--
    const row = listBox.get_row_at_index(selectedIndex)
    if (row) listBox.select_row(row)
  }
}

function launchSelected() {
  if (results.length > 0 && selectedIndex < results.length) {
    results[selectedIndex].launch()
    hideWindow()
  }
}

function hideWindow() {
  const win = app.get_window("launcher")
  if (win) win.hide()
}

function showWindow() {
  const win = app.get_window("launcher")
  if (win) {
    searchText = ""
    if (searchEntry) searchEntry.set_text("")
    updateResults()
    win.show()
    if (searchEntry) searchEntry.grab_focus()
  }
}

export function toggleLauncher() {
  const win = app.get_window("launcher")
  if (win) {
    if (win.visible) {
      hideWindow()
    } else {
      showWindow()
    }
  }
}

export function Launcher() {
  launcherWindow = new Astal.Window({
    name: "launcher",
    namespace: "ags-launcher",
    application: app,
    anchor: Astal.WindowAnchor.TOP,
    exclusivity: Astal.Exclusivity.IGNORE,
    keymode: Astal.Keymode.ON_DEMAND,
    visible: false,
    marginTop: 180,
  })
  launcherWindow.add_css_class("launcher-window")

  mainBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    vexpand: false,
    valign: Gtk.Align.START,
  })
  mainBox.add_css_class("launcher")

  const searchBox = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 10,
  })
  searchBox.add_css_class("search-box")

  const searchIcon = new Gtk.Image({
    iconName: "system-search-symbolic",
    pixelSize: 18,
  })
  searchIcon.add_css_class("search-icon")

  searchEntry = new Gtk.Entry({
    hexpand: true,
    placeholderText: "Search...",
    hasFrame: false,
  })
  searchEntry.add_css_class("search-entry")

  searchEntry.connect("changed", () => {
    searchText = searchEntry!.get_text()
    debouncedUpdate()
  })

  searchEntry.connect("activate", () => {
    launchSelected()
  })

  const entryKeyController = new Gtk.EventControllerKey()
  entryKeyController.connect("key-pressed", (_: Gtk.EventControllerKey, keyval: number) => {
    if (keyval === Gdk.KEY_Down) {
      selectNext()
      return true
    }
    if (keyval === Gdk.KEY_Up) {
      selectPrev()
      return true
    }
    if (keyval === Gdk.KEY_Escape) {
      hideWindow()
      return true
    }
    return false
  })
  searchEntry.add_controller(entryKeyController)

  searchBox.append(searchIcon)
  searchBox.append(searchEntry)

  resultsBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    visible: false,
    vexpand: false,
    valign: Gtk.Align.START,
  })
  resultsBox.add_css_class("results-box")

  const separator = new Gtk.Separator({
    orientation: Gtk.Orientation.HORIZONTAL,
  })
  separator.add_css_class("results-separator")

  listBox = new Gtk.ListBox({
    selectionMode: Gtk.SelectionMode.SINGLE,
    vexpand: false,
    valign: Gtk.Align.START,
    canFocus: false,
  })
  listBox.add_css_class("results-list")

  listBox.connect("row-activated", (_: Gtk.ListBox, row: Gtk.ListBoxRow) => {
    selectedIndex = row.get_index()
    launchSelected()
  })

  resultsBox.append(separator)
  resultsBox.append(listBox)

  mainBox.append(searchBox)
  mainBox.append(resultsBox)

  launcherWindow.connect("notify::visible", () => {
    if (!launcherWindow.visible) {
      searchText = ""
      if (searchEntry) searchEntry.set_text("")
      if (debounceTimer) {
        GLib.source_remove(debounceTimer)
        debounceTimer = null
      }
      updateResults()
    }
  })

  launcherWindow.set_child(mainBox)
  return launcherWindow
}
