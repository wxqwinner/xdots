import * as Generic from '../lib/utils.js';
import { createState } from "ags"
import { Gtk } from "ags/gtk4"

export default function LanIPAddress() {
    const [lanip, setLanip] = createState("")

    setInterval(() => {
        const ip = Generic.getLanIp()
        if (ip) setLanip(ip)
    }, 1000)

    return (
        <button
            class="lan-ipaddress"
            label={lanip}
        />
    )
}
