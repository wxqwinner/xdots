const battery = await Service.import("battery")

export function Battery() {
    // const value = battery.bind("percent").as(p => p > 0 ? p / 100 : 0)
    const value = battery.bind("percent").as(p => p > 0 ? `${p}%` : "0%");
    const icon = battery.bind("percent").as(p =>
        `battery-level-${Math.floor(p / 10) * 10}-symbolic`)


    return Widget.Button({
            class_name: "button",
            child: Widget.Box({
                visible: battery.bind("available"),
                children: [
                    Widget.Icon({ icon }),
                    Widget.Label( {label:value} ),
                ],
            })
        })
}