import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"


function main() {
    for (const monitor of app.get_monitors()) {
        if (monitor.model == "0x08DF") {
            Bar(monitor)
        }
    }
}

app.start({
    css: style,
    main
})
