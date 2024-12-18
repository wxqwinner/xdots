import { App } from "astal/gtk3"
import style from "./style.scss"
import Applauncher from "./widget/Applauncher"
import Bar from "./widget/Bar"

function main() {
    for (const monitor of App.get_monitors()) {
        if (monitor.model == "0x08DF") {
            Bar(monitor)
        }
    }
    Applauncher()
}


App.start({
    css: style,
    instanceName: "astal",
    requestHandler(request, res) {
        res("ok")
    },
    icons: `${SRC}/assets/icons`,
    main
})
