import Audio from "./Audio"
import Brightness from "./Brightness"
import Bluetooth from "./Bluetooth"
import Caffeine from "./Caffeine"
import Power from "./Power"
import Notifications from "./Notifications"

export default function SystemTray() {
  return (
    <box cssClasses={["systray"]}>
      <Notifications />
      <Caffeine />
      <Audio />
      <Brightness />
      <Bluetooth />
      <Power />
    </box>
  )
}
