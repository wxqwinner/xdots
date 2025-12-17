import { For, With, createBinding, onCleanup } from "ags"
import AstalTray from "gi://AstalTray"
import { Astal, Gtk, Gdk } from "ags/gtk4"


export default function Tray() {
    const tray = AstalTray.get_default()
    const items = createBinding(tray, "items")

    const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
        // btn.add_css_class("systray-btn")
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