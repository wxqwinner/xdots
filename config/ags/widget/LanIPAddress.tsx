import * as Generic from '../lib/utils.js';
import { Variable, GLib, bind } from "astal"

export default function LanIPAddress() {
    const lanip = Variable<string>("").poll(1000, () =>
        Generic.getLanIp()!)

    return <label
        className="lan-ipaddress"
        label={lanip()}
    />
}