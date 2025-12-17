import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import GLib from "gi://GLib"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import { closeAllPopups } from "../../../lib/popup-manager"
import { addEscapeHandler } from "../../../lib/ui-components"

// Helper to format time ago
function timeAgo(timestamp: number): string {
  const now = GLib.DateTime.new_now_local()
  const then = GLib.DateTime.new_from_unix_local(timestamp)
  if (!now || !then) return ""
  const diff = now.to_unix() - then.to_unix()
  if (diff < 60) return "Just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return then.format("%b %d") || ""
}

// Helper to get urgency CSS class
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

export function NotificationPopup() {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const notifd = AstalNotifd.get_default()

  // Container for notification list - we'll update this dynamically
  const notificationListBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  })
  notificationListBox.add_css_class("notification-list")

  // Container for the count badge
  const countBadgeContainer = new Gtk.Box()

  // Function to refresh notification list
  function refreshNotifications() {
    // Get non-transient notifications, sorted by time (newest first)
    const notifications = notifd
      .get_notifications()
      .filter(n => !n.transient)
      .sort((a, b) => b.time - a.time)

    // Clear notification list
    let child = notificationListBox.get_first_child()
    while (child) {
      const next = child.get_next_sibling()
      notificationListBox.remove(child)
      child = next
    }

    // Update count badge
    const oldBadge = countBadgeContainer.get_first_child()
    if (oldBadge) countBadgeContainer.remove(oldBadge)

    if (notifications.length > 0) {
      const badge = new Gtk.Label({ label: `${notifications.length}` })
      badge.add_css_class("count-badge")
      countBadgeContainer.append(badge)
    }

    // Rebuild notification list
    if (notifications.length > 0) {
      notifications.forEach(notification => {
        const notificationBox = new Gtk.Box({
          orientation: Gtk.Orientation.VERTICAL,
          spacing: 6,
        })
        notificationBox.add_css_class("notification-item")
        notificationBox.add_css_class(getUrgencyClass(notification.urgency))

        // Header row: app icon + app name + time + dismiss button
        const headerRow = new Gtk.Box({
          spacing: 8,
          hexpand: true,
        })
        headerRow.add_css_class("notification-header")

        // App icon (if available)
        if (notification.app_icon) {
          const appIcon = new Gtk.Label({ label: "󰀻" }) // Default app icon
          appIcon.add_css_class("app-icon")
          headerRow.append(appIcon)
        }

        // App name
        const appNameLabel = new Gtk.Label({
          label: notification.app_name || "Unknown",
          xalign: 0,
        })
        appNameLabel.add_css_class("app-name")
        headerRow.append(appNameLabel)

        // Time ago
        const timeLabel = new Gtk.Label({
          label: timeAgo(notification.time),
          xalign: 0,
          hexpand: true,
        })
        timeLabel.add_css_class("time-ago")
        headerRow.append(timeLabel)

        // Dismiss button
        const dismissBtn = new Gtk.Button({ label: "󰅖" })
        dismissBtn.add_css_class("dismiss-btn")
        dismissBtn.connect("clicked", () => {
          notification.dismiss()
          // Check if this was the last notification
          const remaining = notifd.get_notifications().filter(n => !n.transient).length
          if (remaining <= 1) {
            // This was the last one (or will be after dismiss)
            closeAllPopups()
          } else {
            refreshNotifications()
          }
        })
        headerRow.append(dismissBtn)

        notificationBox.append(headerRow)

        // Summary (bold) - use summary if available, otherwise use app_name
        const summaryText = notification.summary || notification.app_name || "Notification"
        const summaryLabel = new Gtk.Label({
          label: summaryText,
          xalign: 0,
          wrap: true,
          hexpand: true,
        })
        summaryLabel.add_css_class("notification-summary")
        notificationBox.append(summaryLabel)

        // Body (secondary text, possibly truncated)
        if (notification.body) {
          const bodyLabel = new Gtk.Label({
            label: notification.body,
            xalign: 0,
            wrap: true,
            hexpand: true,
            lines: 3,
            ellipsize: 3, // ELLIPSIZE_END
          })
          bodyLabel.add_css_class("notification-body")
          notificationBox.append(bodyLabel)
        }

        // Actions row (if notification has actions)
        const actions = notification.get_actions() || []
        if (actions.length > 0) {
          const actionsRow = new Gtk.Box({
            spacing: 8,
            hexpand: true,
          })
          actionsRow.add_css_class("notification-actions")

          actions.forEach(action => {
            // Action has id and label properties - use label or fallback to id
            const actionLabel = action.label || action.id || "Action"
            const actionBtn = new Gtk.Button({ label: actionLabel })
            actionBtn.add_css_class("notification-action-btn")
            actionBtn.connect("clicked", () => {
              notification.invoke(action.id)
              refreshNotifications()
            })
            actionsRow.append(actionBtn)
          })

          notificationBox.append(actionsRow)
        }

        notificationListBox.append(notificationBox)
      })
    } else {
      // Empty state
      const emptyLabel = new Gtk.Label({ label: "No notifications" })
      emptyLabel.add_css_class("empty-label")
      notificationListBox.append(emptyLabel)
    }
  }

  // Initial population
  refreshNotifications()

  // Connect to notifd signals to refresh when notifications change
  notifd.connect("notified", () => refreshNotifications())
  notifd.connect("resolved", () => refreshNotifications())

  // Scrolled window for notification list
  const scrolledWindow = new Gtk.ScrolledWindow({
    hscrollbarPolicy: Gtk.PolicyType.NEVER,
    vscrollbarPolicy: Gtk.PolicyType.AUTOMATIC,
    minContentHeight: 100,
    maxContentHeight: 500,
  })
  scrolledWindow.set_child(notificationListBox)

  const win = (
    <window
      visible={false}
      namespace="ags-notification-popup"
      name="notification-popup"
      cssClasses={["NotificationPopup"]}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      <box cssClasses={["notification-popup-content"]} orientation={Gtk.Orientation.VERTICAL}>
        <box cssClasses={["notification-popup-header"]}>
          <label label="󰂚 Notifications" cssClasses={["popup-title"]} hexpand />
          {countBadgeContainer}
          <button
            cssClasses={["clear-all-btn"]}
            onClicked={() => {
              const notifications = notifd.get_notifications().filter(n => !n.transient)
              notifications.forEach(n => n.dismiss())
              closeAllPopups()
            }}
          >
            <label label="Clear All" />
          </button>
        </box>

        {scrolledWindow}
      </box>
    </window>
  ) as Astal.Window

  // Refresh notifications when popup becomes visible
  win.connect("notify::visible", () => {
    if (win.visible) {
      refreshNotifications()
    }
  })

  // Escape key to close
  addEscapeHandler(win)

  return win
}
