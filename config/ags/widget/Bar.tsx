import { App } from "astal/gtk3"
import { Variable, GLib, bind } from "astal"
import { Astal, Gtk, Gdk } from "astal/gtk3"
import Hyprland from "gi://AstalHyprland"
import Mpris from "gi://AstalMpris"
import Battery from "gi://AstalBattery"
import Wp from "gi://AstalWp"
import Network from "gi://AstalNetwork"
import Tray from "gi://AstalTray"
import LanIPAddress from "./LanIPAddress"
import Caffeine from "./Caffeine"

function SysTray() {
    const tray = Tray.get_default()

    return <box className="SysTray">
        {bind(tray, "items").as(items => items.map(item => (
            <menubutton
                tooltipMarkup={bind(item, "tooltipMarkup")}
                usePopover={false}
                actionGroup={bind(item, "action-group").as(ag => ["dbusmenu", ag])}
                menuModel={bind(item, "menu-model")}>
                <icon gIcon={bind(item, "gicon")} />
            </menubutton>
        )))}
    </box>
}

function Wifi() {
    const { wifi } = Network.get_default()

    return <icon
        tooltipText={bind(wifi, "ssid").as(String)}
        className="Wifi"
        icon={bind(wifi, "iconName")}
    />
}

function SpeakerLevel() {
    const speaker = Wp.get_default()?.audio.default_speaker!

    return <icon icon={bind(speaker, "volumeIcon")} />

}

function MicrophoneLevel() {
    const microphone = Wp.get_default()?.audio.default_microphone!

    return <icon icon={"microphone_30"} />

}

function BatteryLevel() {
    const bat = Battery.get_default()

    return <box visible={bind(bat, "isPresent")}>
        <icon icon={bind(bat, "batteryIconName")} />
        {/* <label label={bind(bat, "percentage").as(p =>
            `${Math.floor(p * 100)}%`
        )} /> */}
    </box>
}

function Media() {
    const mpris = Mpris.get_default()

    return <box className="Media">
        {bind(mpris, "players").as(ps => ps[0] ? (
            <box>
                <box
                    className="Cover"
                    valign={Gtk.Align.CENTER}
                    css={bind(ps[0], "coverArt").as(cover =>
                        `background-image: url('${cover}');`
                    )}
                />
                <label
                    label={bind(ps[0], "title").as(() =>
                        `${ps[0].title} - ${ps[0].artist}`
                    )}
                />
            </box>
        ) : (
            "Nothing Playing"
        ))}
    </box>
}

function Workspaces() {
    const hypr = Hyprland.get_default()
    return <box className="Workspaces">
        {bind(hypr, "workspaces").as(wss => wss
            .filter(ws => !(ws.id >= -99 && ws.id <= -2))
            .sort((a, b) => a.id - b.id)
            .map(ws => (
                <button
                    className={bind(hypr, "focusedWorkspace").as(fw =>
                        ws === fw ? "focused" : "")}
                    onClicked={() => ws.focus()}>
                    {ws.id}
                </button>
            ))
        )}
    </box>
}

function FocusedClient() {
    const hypr = Hyprland.get_default();
    const focused = bind(hypr, "focusedClient");

    return (
        <box
            className="FocusedClient"
            visible={focused.as(Boolean)}
        >
            {focused.as(client => {
                if (!client) return null;

                const title = bind(client, "title").as(String).get(); // 获取绑定值
                const truncatedTitle = title.length > 40
                    ? title.substring(0, 40) + "..."
                    : title;

                return <label label={truncatedTitle} />;
            })}
        </box>
    );
}



function Time({ format = "%a. %e %H:%M " }) {
    const time = Variable<string>("").poll(1000, () =>
        GLib.DateTime.new_now_local().format(format)!)

    return <label
        className="Time"
        onDestroy={() => time.drop()}
        label={time()}
    />
}


function Menu() {
    return <box className="Indicator">
        <button onClicked={() => {App.toggle_window('panel')}}>
            <box>
            <icon className="LeftIcon" icon={"search"} />
            <icon className="MiddleIcon" icon={"chatgpt"} />
            <icon className="RightIcon" icon={"menu"} />
            </box>
        </button>
    </box>
}

export default function Bar(monitor: Gdk.Monitor) {
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    return <window
        className="Bar"
        gdkmonitor={monitor}
        margin-top={4}
        margin-left={4}
        margin-right={4}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | LEFT | RIGHT}>
        <centerbox>
            <box hexpand halign={Gtk.Align.START}>
                <Workspaces />
                <FocusedClient />
            </box>
            <box>
                <Media />
            </box>
            <box hexpand halign={Gtk.Align.END} >
                <SysTray />
                <Wifi />
                <Caffeine/>
                {/* <LanIPAddress /> */}
                <MicrophoneLevel />
                <SpeakerLevel />
                <BatteryLevel />
                <Time />
                <Menu />
            </box>
        </centerbox>
    </window>
}
