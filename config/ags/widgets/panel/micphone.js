const audio = await Service.import("audio")

export function Micphone() {
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

    const slider = Widget.Slider({
        hexpand: true,
        draw_value: false,
        on_change: ({ value }) => audio.microphone.volume = value,
        setup: self => self.hook(audio.microphone, () => {
            self.value = audio.microphone.volume || 0
        }),
    })

    const icon = Widget.Icon({
        icon: Utils.watch(getIcon(), audio.microphone, getIcon),
    })

    return Widget.Box({
        class_name: "volume",
        css: "min-width: 180px",
        children: [icon, slider],
    })
}