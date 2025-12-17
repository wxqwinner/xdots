import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widgets/Bar"
import Applauncher from "./widgets/Applauncher"
import GLib from "gi://GLib"
import Gtk from "gi://Gtk?version=4.0"
import NotificationPopups from "./widgets/NotificationPopups"

let applauncher: Gtk.Window

app.start({
    css: style,
    requestHandler(request, res) {
        const [, argv] = GLib.shell_parse_argv(request)
        if (!argv) return res("argv parse error")

        switch (argv[0]) {
            case "toggle":
                applauncher.visible = !applauncher.visible
                return res("ok")
            default:
                return res("unknown command")
        }
    },
    icons: `${SRC}/assets/icons`,
    main() {
        for (const monitor of app.get_monitors()) {
            if (monitor.model == "0x08DF") {
                Bar(monitor)
            }
        }
        NotificationPopups()
        applauncher = Applauncher() as Gtk.Window
        app.add_window(applauncher)
        applauncher.present()
    }
})
