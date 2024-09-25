import { Bar } from "./widgets/bar/bar.js";
import { launcher } from "./widgets/launcher/launcher.js";
import { panel } from "./widgets/panel/main.js";
const { Gdk, Gtk } = imports.gi;
import App from 'resource:///com/github/Aylur/ags/app.js'
import userOptions from './widgets/.widgets/option.js';
import * as Generic from './lib/utils.js';

Gtk.IconTheme.get_default().append_search_path(`${App.configDir}/assets/icons`);


App.config({
    style: "./styles/main.css",
    windows: [
        Bar(Generic.getMonitorIDByName("eDP-1")),
        launcher,
        panel,
        // NotificationPopups(),
        // you can call it, for each monitor
        // Bar(0),
        // Bar(1)
    ],
})
