import GLib from "gi://GLib"
import { createPoll } from "ags/time"
import { togglePopup } from "../../lib/popup-manager"

export default function Clock() {
  const time = createPoll("--:--", 1000, () => {
    const now = GLib.DateTime.new_now_local()
    return now ? now.format("%I:%M %p") || "--:--" : "--:--"
  })

  const date = createPoll("", 60000, () => {
    const now = GLib.DateTime.new_now_local()
    return now ? now.format("%a, %b %d") || "" : ""
  })

  return (
    <button
      cssClasses={["clock"]}
      onClicked={() => togglePopup("calendar-popup")}
    >
      <box>
        <label cssClasses={["time"]} label={time} />
        <label cssClasses={["date"]} label={date} />
      </box>
    </button>
  )
}
