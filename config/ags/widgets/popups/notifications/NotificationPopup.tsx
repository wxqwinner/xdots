import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import GLib from "gi://GLib"
import Gdk from "gi://Gdk?version=4.0"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import { closeAllPopups } from "../../../lib/popup-manager"
import { addEscapeHandler } from "../../../lib/ui-components"

// ---------- helpers ----------
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

// ---------- main ----------
export function NotificationPopup() {
    const { TOP, RIGHT } = Astal.WindowAnchor
    const notifd = AstalNotifd.get_default()

    // notification list box
    const notificationListBox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 8,
    })
    notificationListBox.add_css_class("notification-list")

    const countBadgeContainer = new Gtk.Box()

    function refreshNotifications() {
        const notifications = notifd
            .get_notifications()
            .filter(n => !n.transient)
            .sort((a, b) => b.time - a.time)

        // clear
        let child = notificationListBox.get_first_child()
        while (child) {
            const next = child.get_next_sibling()
            notificationListBox.remove(child)
            child = next
        }

        // badge
        const oldBadge = countBadgeContainer.get_first_child()
        if (oldBadge) countBadgeContainer.remove(oldBadge)

        if (notifications.length > 0) {
            const badge = new Gtk.Label({ label: `${notifications.length}` })
            badge.add_css_class("count-badge")
            countBadgeContainer.append(badge)
        }

        if (notifications.length === 0) {
            const emptyLabel = new Gtk.Label({ label: "No notifications" })
            emptyLabel.add_css_class("empty-label")
            notificationListBox.append(emptyLabel)
            return
        }

        notifications.forEach(notification => {
            const notificationBox = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 6,
            })
            notificationBox.add_css_class("notification-item")
            notificationBox.add_css_class(getUrgencyClass(notification.urgency))

            const headerRow = new Gtk.Box({ spacing: 8, hexpand: true })
            headerRow.add_css_class("notification-header")

            if (notification.app_icon) {
                const appIcon = new Gtk.Label({ label: "󰀻" })
                appIcon.add_css_class("app-icon")
                headerRow.append(appIcon)
            }

            const appNameLabel = new Gtk.Label({
                label: notification.app_name || "Unknown",
                xalign: 0,
            })
            appNameLabel.add_css_class("app-name")
            headerRow.append(appNameLabel)

            const timeLabel = new Gtk.Label({
                label: timeAgo(notification.time),
                hexpand: true,
                xalign: 0,
            })
            timeLabel.add_css_class("time-ago")
            headerRow.append(timeLabel)

            const dismissBtn = new Gtk.Button({ label: "󰅖" })
            dismissBtn.add_css_class("dismiss-btn")
            dismissBtn.connect("clicked", () => {
                notification.dismiss()
                const remaining = notifd.get_notifications().filter(n => !n.transient).length
                remaining <= 1 ? closeAllPopups() : refreshNotifications()
            })
            headerRow.append(dismissBtn)

            notificationBox.append(headerRow)

            const summaryLabel = new Gtk.Label({
                label: notification.summary || notification.app_name || "Notification",
                wrap: true,
                xalign: 0,
            })
            summaryLabel.add_css_class("notification-summary")
            notificationBox.append(summaryLabel)

            if (notification.body) {
                const bodyLabel = new Gtk.Label({
                    label: notification.body,
                    wrap: true,
                    xalign: 0,
                    lines: 3,
                    ellipsize: 3,
                })
                bodyLabel.add_css_class("notification-body")
                notificationBox.append(bodyLabel)
            }

            const actions = notification.get_actions() || []
            if (actions.length > 0) {
                const actionsRow = new Gtk.Box({ spacing: 8 })
                actionsRow.add_css_class("notification-actions")

                actions.forEach(action => {
                    const btn = new Gtk.Button({ label: action.label || action.id })
                    btn.add_css_class("notification-action-btn")
                    btn.connect("clicked", () => {
                        notification.invoke(action.id)
                        refreshNotifications()
                    })
                    actionsRow.append(btn)
                })

                notificationBox.append(actionsRow)
            }

            notificationListBox.append(notificationBox)
        })
    }

    refreshNotifications()
    notifd.connect("notified", refreshNotifications)
    notifd.connect("resolved", refreshNotifications)

    // ---------- ⭐ ScrolledWindow（关键） ----------
    const scrolledWindow = new Gtk.ScrolledWindow({
        hscrollbarPolicy: Gtk.PolicyType.NEVER,
        vscrollbarPolicy: Gtk.PolicyType.AUTOMATIC,
        vexpand: true,
        hexpand: true,
    })
    scrolledWindow.set_child(notificationListBox)

    // ---------- window ----------
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
            <box
                cssClasses={["notification-popup-content"]}
                orientation={Gtk.Orientation.VERTICAL}
                vexpand
                hexpand
            >
                <box
                    cssClasses={["notification-popup-header"]}
                    vexpand={false}
                >
                    <label label="󰂚 Notifications" cssClasses={["popup-title"]} hexpand />
                    {countBadgeContainer}
                    <button
                        cssClasses={["clear-all-btn"]}
                        onClicked={() => {
                            notifd.get_notifications()
                                .filter(n => !n.transient)
                                .forEach(n => n.dismiss())
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

    win.connect("notify::visible", () => {
        if (win.visible) refreshNotifications()
    })

    addEscapeHandler(win)
    return win
}
