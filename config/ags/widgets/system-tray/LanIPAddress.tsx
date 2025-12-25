import * as Generic from '../../lib/utils.js';
import { createPoll } from "ags/time"

export default function LanIPAddress() {
    let last = ""

    const lanip = createPoll("", 1000, () => {
        const ip = Generic.getLanIp()
        if (ip && ip !== last) {
            last = ip
            return ip
        }
        return last
    })

    return (
        <button
            class="lan-ipaddress"
            label={lanip}
        />
    )
}
