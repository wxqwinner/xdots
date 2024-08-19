import { LanIPAddress } from "./lanip.js";
import { Caffeine } from "./caffeine.js"
import { panel } from "../panel/main.js"
import { Battery } from "./battery.js";

const hyprland = await Service.import("hyprland")
const mpris = await Service.import("mpris")
const audio = await Service.import("audio")
// const battery = await Service.import("battery")
const systemtray = await Service.import("systemtray")

const date = Variable("", {
    poll: [1000, 'date "+%H:%M %A %b %e."'],
})

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, make it a function
// then you can simply instantiate one by calling it

function Workspaces() {
    const activeId = hyprland.active.workspace.bind("id")
    const workspaces = hyprland.bind("workspaces").as(ws => 
        ws
        .filter(({ id }) => id > 0)
        .sort((a, b) => a.id - b.id)
        .map(({ id }) => Widget.Button({
            on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
            child: Widget.Label(`${id}`),
            class_name: activeId.as(i => `${i === id ? "focused" : ""}`),
        })))

    return Widget.Box({
        class_name: "workspaces",
        children: workspaces,
    })
}


function ClientTitle() {
    return Widget.Label({
        class_name: "client-title",
        label: hyprland.active.client.bind("title"),
        justification: 'left',
        truncate: 'end',
        xalign: 0,
        maxWidthChars: 50,
        wrap: true,
        useMarkup: true,
    })
}


function Clock() {
    return Widget.Label({
        class_name: "clock",
        label: date.bind(),
    })
}


function Media() {
    const label = Utils.watch("", mpris, "player-changed", () => {
        if (mpris.players[0]) {
            const { track_artists, track_title } = mpris.players[0]
            return `${track_artists.join(", ")} - ${track_title}`
        } else {
            return "Nothing is playing"
        }
    })

    return Widget.Button({
        class_name: "media",
        on_primary_click: () => mpris.getPlayer("")?.playPause(),
        on_scroll_up: () => mpris.getPlayer("")?.next(),
        on_scroll_down: () => mpris.getPlayer("")?.previous(),
        child: Widget.Label({ label }),
    })
}

function Micophone() {
    const icons = {
        100: "micphone_100",
        80: "micphone_80",
        50: "micphone_50",
        30: "micphone_30",
        10: "micphone_10",
        1: "micphone_1",
        0: "micphone_mute",
    }

    function getIcon() {
        const icon = audio.microphone.is_muted ? 0 : [100, 80, 50, 30, 10, 1, 0].find(
            threshold => threshold <= audio.microphone.volume * 100)

        return `${icons[icon]}`
    }

    const icon = Widget.Icon({
        icon: Utils.watch(getIcon(), audio.microphone, getIcon),
    })

    return Widget.Box({
        class_name: "volume",
        // css: "min-width: 180px",
        children: [icon],
    })
}


function Volume() {
    const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    }

    function getIcon() {
        const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
            threshold => threshold <= audio.speaker.volume * 100)

        return `audio-volume-${icons[icon]}-symbolic`
    }

    const icon = Widget.Icon({
        icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    })

    const slider = Widget.Slider({
        hexpand: true,
        draw_value: false,
        on_change: ({ value }) => audio.speaker.volume = value,
        setup: self => self.hook(audio.speaker, () => {
            self.value = audio.speaker.volume || 0
        }),
    })


    return Widget.Box({
        class_name: "volume",
        // css: "min-width: 180px",
        children: [icon],
    })
}


function Potato() {
    return Widget.Box({
        css: "min-width: 100px",
        children: [Widget.Slider({
            hexpand: true,
            draw_value: false,
            on_change: ({ value }) => audio.speaker.volume = value,
            setup: self => self.hook(audio.speaker, () => {
                self.value = audio.speaker.volume || 0
        }),
        })],
    });
}


function SysTray() {
    const items = systemtray.bind("items")
        .as(items => items.map(item => Widget.Button({
            child: Widget.Icon({ icon: item.bind("icon") }),
            on_primary_click: (_, event) => item.activate(event),
            on_secondary_click: (_, event) => item.openMenu(event),
            tooltip_markup: item.bind("tooltip_markup"),
        })))

    return Widget.Box({
        children: items,
    })
}


// layout of the bar
function Left() {
    return Widget.Box({
        spacing: 8,
        children: [
            Workspaces(),
            ClientTitle(),
        ],
    })
}

function Center() {
    return Widget.Box({
        spacing: 8,
        children: [
            Clock(),
            // Media(),
        ],
    })
}

function Indicator() {
    const indicator =  Widget.Box({
        hpack: "end",
        spacing: 8,
        children: [
            Micophone(),
            Volume(),
            Battery(),
            // battery.Indicator(),
        ]
    })

    return Widget.Button({
        child: indicator,
        onClicked: () => {
            App.toggleWindow('panel');
        },
    });
}

function Right() {
    return Widget.Box({
        hpack: "end",
        spacing: 8,
        children: [
            SysTray(),
            Caffeine(),
            // Potato(),
            LanIPAddress(),
            Indicator(),
        ],
    })
}

export function Bar(monitor = 0) {
    return Widget.Window({
        name: `bar-${monitor}`, // name has to be unique
        class_name: "bar",
        monitor,
        layer: "top",
        margins: [8, 8, 0, 8],
        anchor: ["top", "left", "right"],
        exclusivity: "exclusive",
        child: Widget.CenterBox({
            start_widget: Left(),
            center_widget: Center(),
            end_widget: Right(),
        }),
    })
}


