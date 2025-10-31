import app from "ags/gtk4/app"
import GLib from "gi://GLib"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import AstalBattery from "gi://AstalBattery"
import AstalPowerProfiles from "gi://AstalPowerProfiles"
import AstalWp from "gi://AstalWp"
import AstalNetwork from "gi://AstalNetwork"
import AstalTray from "gi://AstalTray"
import AstalMpris from "gi://AstalMpris"
import AstalApps from "gi://AstalApps"
import { For, With, createBinding, onCleanup } from "ags"
import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import Hyprland from "gi://AstalHyprland"

function Tray() {
    const tray = AstalTray.get_default()
    const items = createBinding(tray, "items")

    const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
        btn.menuModel = item.menuModel
        btn.insert_action_group("dbusmenu", item.actionGroup)
        item.connect("notify::action-group", () => {
            btn.insert_action_group("dbusmenu", item.actionGroup)
        })
    }

    return (
        <box>
            <For each={items}>
                {(item) => (
                    <menubutton $={(self) => init(self, item)}>
                        <image gicon={createBinding(item, "gicon")} />
                    </menubutton>
                )}
            </For>
        </box>
    )
}

function Wireless() {
    const network = AstalNetwork.get_default()
    const wifi = createBinding(network, "wifi")

    const sorted = (arr: Array<AstalNetwork.AccessPoint>) => {
        return arr.filter((ap) => !!ap.ssid).sort((a, b) => b.strength - a.strength)
    }

    async function connect(ap: AstalNetwork.AccessPoint) {
        // connecting to ap is not yet supported
        // https://github.com/Aylur/astal/pull/13
        try {
            await execAsync(`nmcli d wifi connect ${ap.bssid}`)
        } catch (error) {
            // you can implement a popup asking for password here
            console.error(error)
        }
    }

    return (
        <box visible={wifi(Boolean)}>
            <With value={wifi}>
                {(wifi) =>
                    wifi && (
                        <menubutton>
                            <image iconName={createBinding(wifi, "iconName")} />
                            <popover>
                                <box orientation={Gtk.Orientation.VERTICAL}>
                                    <For each={createBinding(wifi, "accessPoints")(sorted)}>
                                        {(ap: AstalNetwork.AccessPoint) => (
                                            <button onClicked={() => connect(ap)}>
                                                <box spacing={4}>
                                                    <image iconName={createBinding(ap, "iconName")} />
                                                    <label label={createBinding(ap, "ssid")} />
                                                    <image
                                                        iconName="object-select-symbolic"
                                                        visible={createBinding(
                                                            wifi,
                                                            "activeAccessPoint",
                                                        )((active) => active === ap)}
                                                    />
                                                </box>
                                            </button>
                                        )}
                                    </For>
                                </box>
                            </popover>
                        </menubutton>
                    )
                }
            </With>
        </box>
    )
}

function AudioOutput() {
    const { defaultSpeaker: speaker } = AstalWp.get_default()!

    return (
        <menubutton>
            <image iconName={createBinding(speaker, "volumeIcon")} />
            <popover>
                <box>
                    <slider
                        widthRequest={260}
                        onChangeValue={({ value }) => speaker.set_volume(value)}
                        value={createBinding(speaker, "volume")}
                    />
                </box>
            </popover>
        </menubutton>
    )
}

function Battery() {
    const battery = AstalBattery.get_default()
    const powerprofiles = AstalPowerProfiles.get_default()

    const percent = createBinding(
        battery,
        "percentage",
    )((p) => `${Math.floor(p * 100)}%`)

    const setProfile = (profile: string) => {
        powerprofiles.set_active_profile(profile)
    }

    return (
        <menubutton visible={createBinding(battery, "isPresent")}>
            <box>
                <image iconName={createBinding(battery, "iconName")} />
                <label label={percent} />
            </box>
            <popover>
                <box orientation={Gtk.Orientation.VERTICAL}>
                    {powerprofiles.get_profiles().map(({ profile }) => (
                        <button onClicked={() => setProfile(profile)}>
                            <label label={profile} xalign={0} />
                        </button>
                    ))}
                </box>
            </popover>
        </menubutton>
    )
}

function Clock({ format = "%a. %e-%h %H:%M " }) {
    const time = createPoll("", 1000, () => {
        return GLib.DateTime.new_now_local().format(format)!
    })

    return (
        <menubutton>
            <label label={time} />
            <popover>
                <Gtk.Calendar />
            </popover>
        </menubutton>
    )
}

function Workspaces() {
    const hypr = Hyprland.get_default()

    return <box class="Workspaces">
        {createBinding(hypr, "workspaces").as(wss => wss
            .filter(ws => !(ws.id >= -99 && ws.id <= -2))
            .sort((a, b) => a.id - b.id)
            .map(ws => (
                <button
                    class={createBinding(hypr, "focusedWorkspace").as(fw =>
                        ws === fw ? "focused" : "")}
                    onClicked={() => ws.focus()}>
                    {ws.id}
                </button>
            ))
        ).get()}
    </box>
}


function FocusedClient() {
    const hypr = Hyprland.get_default()

    const focused = createBinding(hypr, "focusedClient")

    const title = focused.as(client => {
        if (!client) return ""
        const t = client.title ?? ""
        return t.length > 40 ? t.slice(0, 40) + "..." : t
    })

    return (
        <box
            class="FocusedClient"
            visible={focused.as(Boolean)}
        >
            <label label={title} />
        </box>
    )
}

export default function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    let win: Astal.Window
    const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

    onCleanup(() => {
        // Root components (windows) are not automatically destroyed.
        // When the monitor is disconnected from the system, this callback
        // is run from the parent <For> which allows us to destroy the window
        win.destroy()
    })

    return (
        <window
            $={(self) => (win = self)}
            visible
            name="bar"
            class="Bar"
            namespace="my-bar"
            gdkmonitor={gdkmonitor}
            margin-top={4}
            margin-left={4}
            margin-right={4}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={TOP | LEFT | RIGHT}
            application={app}
        >
            <centerbox>
                <box $type="start">
                    <Workspaces />
                    <FocusedClient />
                </box>
                <box $type="end">
                    <Tray />
                    <Wireless />
                    <AudioOutput />
                    <Battery />
                    <Clock />
                </box>
            </centerbox>
        </window>
    )
}