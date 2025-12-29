import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import Workspaces from "./Workspaces"
import Clients from "./Clients"
import FocusedClient from "./FocusedClient"
import Clock from "./Clock"
import SystemTray from "../system-tray"

export default function Bar({ monitor }: { monitor: Gdk.Monitor }) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor
    const monitorName = monitor.connector || "unknown"

    return (
        <window
            visible
            namespace={`ags-bar-${monitorName}`}
            name={`bar-${monitorName}`}
            cssClasses={["Bar"]}
            gdkmonitor={monitor}
            margin-top={4}
            margin-left={4}
            margin-right={4}
            layer={Astal.Layer.BOTTOM}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            application={app}
        >
            <centerbox cssClasses={["centerbox"]}>
                <box $type="start" halign={Gtk.Align.START}>
                    <Workspaces monitorName={monitorName} />
                    {/* <Clients monitorName={monitorName} /> */}
                    <FocusedClient monitorName={monitorName} />
                </box>
                <box $type="center">
                    <Clock />
                </box>
                <box $type="end" halign={Gtk.Align.END}>
                    <SystemTray />
                </box>
            </centerbox>
        </window>
    )
}
