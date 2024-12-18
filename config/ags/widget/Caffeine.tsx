import { Astal, Gtk, Gdk } from "astal/gtk3"
import { exec, execAsync } from "astal/process"

export default function Caffeine() {
    let isCaffeineOn = false;
    // let status = Gtk.Widget.Icon({
    //         icon: "caffeine_off"
    //     })

    execAsync(`hyprctl dispatch exec hypridle`);

    function updateCaffeineStatus() {
        if (isCaffeineOn) {
            // icon.icon = 'caffeine_on'
            execAsync(`killall hypridle`);
        } else {
            // icon.icon = 'caffeine_off'
            execAsync(`hyprctl dispatch exec hypridle`);
        }
    }

    return <box>
        <icon icon={"caffeine_off"} />
        <button
            onClicked={() => {isCaffeineOn = !isCaffeineOn;updateCaffeineStatus();}}
        >
        </button>
    </box>
}