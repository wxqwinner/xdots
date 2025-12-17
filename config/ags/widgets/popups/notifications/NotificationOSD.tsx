import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import GLib from "gi://GLib"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import AstalHyprland from "gi://AstalHyprland?version=0.1"

const NOTIFICATION_TIMEOUT = 5000 // 5 seconds

// Get urgency CSS class
function getUrgencyClass(urgency: AstalNotifd.Urgency): string {
  switch (urgency) {
    case AstalNotifd.Urgency.CRITICAL:
      return "urgency-critical"
    case AstalNotifd.Urgency.NORMAL:
      return "urgency-normal"
    case AstalNotifd.Urgency.LOW:
      return "urgency-low"
    default:
      return "urgency-normal"
  }
}

export function NotificationOSD() {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const notifd = AstalNotifd.get_default()
  const hyprland = AstalHyprland.get_default()

  // Container for notification toasts
  const toastContainer = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  })
  toastContainer.add_css_class("notification-osd-container")

  // Track active toasts and their timeouts
  const activeTimeouts: Map<number, number> = new Map()

  // Create a toast widget for a notification
  function createToast(notification: AstalNotifd.Notification): Gtk.Box {
    const toast = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 4,
    })
    toast.add_css_class("notification-toast")
    toast.add_css_class(getUrgencyClass(notification.urgency))

    // Header: app name + dismiss
    const header = new Gtk.Box({ spacing: 8 })
    header.add_css_class("toast-header")

    const appName = new Gtk.Label({
      label: notification.app_name || "Notification",
      xalign: 0,
      hexpand: true,
    })
    appName.add_css_class("toast-app-name")
    header.append(appName)

    const dismissBtn = new Gtk.Button({ label: "󰅖" })
    dismissBtn.add_css_class("toast-dismiss")
    dismissBtn.connect("clicked", () => {
      removeToast(notification.id, toast)
      notification.dismiss()
    })
    header.append(dismissBtn)
    toast.append(header)

    // Summary
    const summaryText = notification.summary || notification.app_name || "Notification"
    const summary = new Gtk.Label({
      label: summaryText,
      xalign: 0,
      wrap: true,
      hexpand: true,
    })
    summary.add_css_class("toast-summary")
    toast.append(summary)

    // Body (if present)
    if (notification.body) {
      const body = new Gtk.Label({
        label: notification.body,
        xalign: 0,
        wrap: true,
        hexpand: true,
        lines: 2,
        ellipsize: 3, // ELLIPSIZE_END
      })
      body.add_css_class("toast-body")
      toast.append(body)
    }

    return toast
  }

  // Remove a toast
  function removeToast(notificationId: number, toast: Gtk.Box) {
    // Clear timeout if exists
    const timeoutId = activeTimeouts.get(notificationId)
    if (timeoutId) {
      GLib.source_remove(timeoutId)
      activeTimeouts.delete(notificationId)
    }

    // Remove from container
    toastContainer.remove(toast)

    // Hide window if no toasts left
    if (!toastContainer.get_first_child()) {
      const win = app.get_window("notification-osd")
      if (win) win.visible = false
    }
  }

  // Show a notification toast
  function showToast(notification: AstalNotifd.Notification) {
    // Skip transient notifications that shouldn't persist
    // But we still show them as OSD

    const toast = createToast(notification)
    toastContainer.prepend(toast) // Newest at top

    // Show the window
    const win = app.get_window("notification-osd")
    if (win) win.visible = true

    // Set auto-dismiss timeout
    const timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, NOTIFICATION_TIMEOUT, () => {
      removeToast(notification.id, toast)
      activeTimeouts.delete(notification.id)
      return GLib.SOURCE_REMOVE
    })
    activeTimeouts.set(notification.id, timeoutId)
  }

  // Listen for new notifications
  notifd.connect("notified", (_notifd, id: number) => {
    const notification = notifd.get_notification(id)
    if (notification) {
      showToast(notification)
    }
  })

  // Also remove toast if notification is resolved externally
  notifd.connect("resolved", (_notifd, id: number) => {
    const timeoutId = activeTimeouts.get(id)
    if (timeoutId) {
      GLib.source_remove(timeoutId)
      activeTimeouts.delete(id)
    }
    // Find and remove the toast widget
    let child = toastContainer.get_first_child()
    while (child) {
      const next = child.get_next_sibling()
      // We can't easily match by ID, so just refresh all
      child = next
    }
  })

  // Get focused monitor or fallback to primary
  function getFocusedMonitor() {
    try {
      const focusedMonitor = hyprland.get_focused_monitor()
      if (focusedMonitor) {
        // Find the GDK monitor that matches
        const monitors = app.get_monitors()
        for (const monitor of monitors) {
          if (monitor.get_connector() === focusedMonitor.name) {
            return monitor
          }
        }
      }
    } catch (e) {
      // Fallback to first monitor
    }
    return app.get_monitors()[0]
  }

  const win = (
    <window
      visible={false}
      namespace="ags-notification-osd"
      name="notification-osd"
      cssClasses={["NotificationOSD"]}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.NONE}
      application={app}
      gdkmonitor={getFocusedMonitor()}
    >
      {toastContainer}
    </window>
  ) as Astal.Window

  // Update monitor when focus changes
  hyprland.connect("notify::focused-monitor", () => {
    const monitor = getFocusedMonitor()
    if (monitor && win.gdkmonitor !== monitor) {
      win.gdkmonitor = monitor
    }
  })

  return win
}
