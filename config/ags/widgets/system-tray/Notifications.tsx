import { createBinding } from "ags"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import { togglePopup } from "../../lib/popup-manager"

export default function Notifications() {
  const notifd = AstalNotifd.get_default()

  // Create binding for notifications to get reactive updates
  const notifications = createBinding(notifd, "notifications")

  // Icons: 󰂚 has notifications, 󰂜 empty
  const getIcon = (notifs: AstalNotifd.Notification[]) => {
    const count = notifs.filter(n => !n.transient).length
    return count > 0 ? "󰂚" : "󰂜"
  }

  const getTooltip = (notifs: AstalNotifd.Notification[]) => {
    const count = notifs.filter(n => !n.transient).length
    if (count === 0) return "No notifications"
    if (count === 1) return "1 notification"
    return `${count} notifications`
  }

  const getCount = (notifs: AstalNotifd.Notification[]) => {
    return notifs.filter(n => !n.transient).length
  }

  return (
    <button
      cssClasses={["systray-btn"]}
      tooltipText={notifications(getTooltip)}
      onClicked={() => togglePopup("notification-popup")}
    >
      <label cssClasses={["icon"]} label={notifications(getIcon)} />
    </button>
  )
}
