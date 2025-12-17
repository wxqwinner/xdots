import Audio from "./Audio"
import Brightness from "./Brightness"
import Bluetooth from "./Bluetooth"
import Caffeine from "./Caffeine"
import Power from "./Power"
import Notifications from "./Notifications"
import Tray from "./Tray"
import LanIPAddress from "./LanIPAddress"
import Battery from "./Battery"


export default function SystemTray() {
    return (
        <box cssClasses={["systray"]}>
            <Tray />
            <LanIPAddress />
            <Caffeine />
            <Audio />
            <Brightness />
            <Bluetooth />
            <Battery />
            {/* <Power /> */}
            <Notifications />
        </box>
    )
}
