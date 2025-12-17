import Hyprland from "gi://AstalHyprland"
import { For, With, createBinding, onCleanup } from "ags"


export default function FocusedClient() {
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