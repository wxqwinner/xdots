import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { Volume } from './volume.js'
import { Battery } from './battery.js'
import { Brightness } from './brightness.js'
import { clickCloseRegion } from '../.widgets/clickcloseregion.js';
const WINDOW_NAME = "panel"

// Widget.Scrollable({
//     hscroll: "never",
//     css: `min-width: ${width}px;`
//         + `min-height: ${height}px;`,
//     child: Widget.Label('Lorem ipsum dolor sit amet, \n' +
//         'officia excepteur ex fugiat reprehenderit enim \n' +
//         'labore culpa sint ad nisi Lorem pariatur mollit\n'), }),

// reference https://github.com/Rayzeq/quick-settings-audio-panel?tab=readme-ov-file
const Panel = () => {

    const child = Widget.Label({label: "or any other Widget"});
    const content = Widget.Box({
        vertical: true,
        css: `min-width: 400px; margin:10px`,
        children: [
            Battery(),
            Volume(),
            Brightness(),
        ],
    })


    return Widget.Box({
        children:[Widget.EventBox({
        child: content,
        onHover: event => {
            print("hover");
        },
        onHoverLost: event => {
            print("lost");
        }
    }),]})
}

export const panel = Widget.Window({
    name: WINDOW_NAME,
    class_name: "panel",
    monitor: 0,
    layer: 'overlay',
    anchor: ['top', 'right'],
    // setup: self => self.keybind("Escape", () => {
    //     App.closeWindow(WINDOW_NAME)
    // }),
    visible: false,
    keymode: "exclusive",
    child:  Panel(),
})

