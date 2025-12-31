import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import GLib from "gi://GLib"
import Astal from "gi://Astal?version=4.0"
import AstalApps from "gi://AstalApps?version=0.1"
import app from "ags/gtk4/app"

const MAX_RESULTS = 5
const ROW_HEIGHT = 40
const usageCount = new Map<string, number>()
const USAGE_FILE = GLib.build_filenamev([
  GLib.get_user_cache_dir(),
  "ags",
  "launcher-usage.json",
])

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

function loadUsage() {
  try {
    const [ok, content] = GLib.file_get_contents(USAGE_FILE)
    if (!ok) return

    const obj = JSON.parse(new TextDecoder().decode(content))
    for (const [id, count] of Object.entries(obj)) {
      usageCount.set(id, count as number)
    }
  } catch {

  }
}

function saveUsage() {
  try {
    const dir = GLib.path_get_dirname(USAGE_FILE)
    GLib.mkdir_with_parents(dir, 0o755)

    const obj: Record<string, number> = {}
    for (const [id, count] of usageCount) {
      obj[id] = count
    }

    GLib.file_set_contents(
      USAGE_FILE,
      JSON.stringify(obj),
    )
  } catch {
    // 忽略写失败
  }
}


function updateResults() {
  if (!listBox) return

  // 清空 listBox
  let child = listBox.get_first_child()
  while (child) {
    const next = child.get_next_sibling()
    listBox.remove(child)
    child = next
  }

  if (searchText.length === 0) {
    results = getDefaultApps()
  } else {
    results = getApps().fuzzy_query(searchText).slice(0, MAX_RESULTS)
  }

  selectedIndex = 0

  // 实际结果行
  results.forEach((appItem) => {
    const row = new Gtk.ListBoxRow({ canFocus: false })
    row.set_size_request(-1, ROW_HEIGHT)

    const box = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 10,
      marginStart: 12,
      marginEnd: 12,
    })

    const icon = new Gtk.Image({ pixelSize: 22 })
    const iconName = appItem.iconName
    if (iconName) {
      iconName.startsWith("/")
        ? icon.set_from_file(iconName)
        : icon.set_from_icon_name(iconName)
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

  // 🔑 占位行：补齐高度，防止收缩
  const fillers = MAX_RESULTS - results.length
  for (let i = 0; i < fillers; i++) {
    const filler = new Gtk.ListBoxRow({ canFocus: false })
    filler.set_size_request(-1, ROW_HEIGHT)
    filler.set_opacity(0)
    listBox.append(filler)
  }

  const firstRow = listBox.get_row_at_index(0)
  if (firstRow) listBox.select_row(firstRow)
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
    const appItem = results[selectedIndex]
    const id = appItem.name

    usageCount.set(id, (usageCount.get(id) ?? 0) + 1)
    saveUsage()

    appItem.launch()
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
      if (debounceTimer) {
      GLib.source_remove(debounceTimer)
      debounceTimer = null
    }
    if (searchEntry) {
      searchEntry.set_text("")
    }

    updateResults()
    win.show()

    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      searchEntry?.grab_focus()
      return GLib.SOURCE_REMOVE
    })
  }
}

function getDefaultApps(): AstalApps.Application[] {
  const all = getApps().get_list()

  return all
    // 只保留有可执行文件的应用
    .filter(app => app.executable)
    .map(app => ({
      app,
      count: usageCount.get(app.name) ?? 0,
    }))
    // 按使用次数降序排序，次数相同时按名称排序
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }
      return a.app.name.localeCompare(b.app.name)
    })
    .slice(0, MAX_RESULTS)
    .map(x => x.app)
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
  loadUsage()
  getApps()
  launcherWindow = new Astal.Window({
    name: "launcher",
    namespace: "ags-launcher",
    application: app,
    anchor: Astal.WindowAnchor.TOP,
    exclusivity: Astal.Exclusivity.IGNORE,
    // keymode: Astal.Keymode.ON_DEMAND,
    keymode: Astal.Keymode.EXCLUSIVE,
    visible: false,
    marginTop: 180,
  })
  launcherWindow.add_css_class("launcher-window")
  launcherWindow.set_opacity(0.999)

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
    visible: true,
    vexpand: false,
    valign: Gtk.Align.START,
  })
  resultsBox.set_size_request(-1, MAX_RESULTS * ROW_HEIGHT)
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

  const scrolled = new Gtk.ScrolledWindow({
    vexpand: true,
    hscrollbar_policy: Gtk.PolicyType.NEVER,
  })
  scrolled.set_child(listBox)
  resultsBox.append(scrolled)

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
  updateResults()
  return launcherWindow
}

export function initLauncher() {
  loadUsage()
  getApps()
}