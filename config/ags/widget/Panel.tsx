import Apps from "gi://AstalApps"
import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import { Variable, bind } from "astal"
import Wp from "gi://AstalWp"

function hide() {
    App.get_window("panel")!.hide()
}

function AudioSlider() {
    const speaker = Wp.get_default()?.audio.defaultSpeaker!

    return <box className="AudioSlider" css="min-width: 140px">
        <icon icon={bind(speaker, "volumeIcon")} />
        <slider
            hexpand
            onDragged={({ value }) => speaker.volume = value}
            value={bind(speaker, "volume")}
        />
    </box>
}

export default function Panel() {
    const slider = new AudioSlider()
    const text = Variable("")

    return <window
        name="panel"
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.ON_DEMAND}
        application={App}
        visible={false}
        onShow={() => text.set("")}
        onKeyPressEvent={function (self, event: Gdk.Event) {
            if (event.get_keyval()[1] === Gdk.KEY_Escape)
                self.hide()
        }}>
        <box>
            <eventbox widthRequest={4000} heightRequest={50} expand onClick={hide} />
                <box wexpand={true} horizontal>
                    <eventbox heightRequest={4000} onClick={hide} />
                    <box hexpand={false} vertical>
                        <eventbox heightRequest={50} onClick={hide} />
                        <box widthRequest={400} className="Panel" vertical>
                            <label label="No match found" />
                            {slider}
                        </box>
                        <eventbox expand onClick={hide} />
                    </box>
            </box>
        </box>
    </window>
}