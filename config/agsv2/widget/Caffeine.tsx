import { Astal, Gtk, Gdk } from "astal/gtk3"
import { exec, execAsync } from "astal/process"

export default function Caffeine() {
    let isCaffeineOn = false;
    let statusIcon = <icon icon={"caffeine_off"} />;

    execAsync(`hyprctl dispatch exec hypridle`);

    function updateCaffeineStatus() {
        if (isCaffeineOn) {
            statusIcon.icon = 'caffeine_on'
            execAsync(`killall hypridle`);
        } else {
            statusIcon.icon = 'caffeine_off'
            execAsync(`hyprctl dispatch exec hypridle`);
        }
    }

    return <box>
        <button onClicked={() => {isCaffeineOn = !isCaffeineOn;updateCaffeineStatus();}}>
            {statusIcon}
        </button>
    </box>
}