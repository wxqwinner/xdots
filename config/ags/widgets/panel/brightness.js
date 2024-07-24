import brightness from '../../services/brightness.js';

export function Brightness() {
    const icons = {
        80: "brightness_80",
        50: "brightness_50",
        30: "brightness_30",
        0: "brightness_0",
    }

    function getIcon() {
        const icon = (brightness.screen_value=="undefined") ? 0 : [80, 50, 30, 0].find(
            threshold => threshold <= brightness.screen_value * 100)

        return `${icons[icon]}`
    }

    const slider = Widget.Slider({
        hexpand: true,
        draw_value: false,
        min:0.1,
        on_change: self => brightness.screen_value = self.value,
        value: brightness.bind('screen-value'),
    })

    const icon = Widget.Icon({
        icon: Utils.watch(getIcon(), brightness, getIcon),
    })

    return Widget.Box({
        class_name: "brightness",
        css: "min-width: 180px",
        children: [icon, slider],
    })
}