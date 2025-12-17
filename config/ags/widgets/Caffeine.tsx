import { Astal, Gtk, Gdk } from "ags/gtk4"
import { exec, execAsync } from "ags/process"
import { For, With, createBinding, onCleanup } from "ags"

export default function Caffeine() {
    let isCaffeineOn = false;
    let statusIcon = new Gtk.Image({
        iconName: "caffeine_off",
    })


    execAsync(`hyprctl dispatch exec hypridle`);

    function updateCaffeineStatus() {
        if (isCaffeineOn) {
            statusIcon.iconName = 'caffeine_on'
            execAsync(`killall hypridle`);
        } else {
            statusIcon.iconName = 'caffeine_off'
            execAsync(`hyprctl dispatch exec hypridle`);
        }
    }

    return <box>
        <button onClicked={() => { isCaffeineOn = !isCaffeineOn; updateCaffeineStatus(); }}>
            {statusIcon}
        </button>
    </box>
}