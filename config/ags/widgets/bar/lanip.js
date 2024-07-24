import * as Generic from '../../lib/utils.js';

export function  LanIPAddress() {
    return Widget.Label({
        class_name: "lan-ipaddress", 
        label: Generic.getLanIp(),
        justification: 'left',
        truncate: 'end',
        xalign: 0,
        maxWidthChars: 50,
        wrap: true,
        useMarkup: true,
    })
}