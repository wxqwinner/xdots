import app from "ags/gtk4/app"
import Astal from "gi://Astal?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import { addEscapeHandler } from "../../../lib/ui-components"

// Calendar popup - displays a GTK Calendar widget
export function CalendarPopup() {
  const { TOP } = Astal.WindowAnchor

  // Create the calendar widget
  const calendar = new Gtk.Calendar({
    showDayNames: true,
    showHeading: true,
    showWeekNumbers: false,
  })
  calendar.add_css_class("calendar-widget")

  // Create popup window - OVERLAY layer to be above backdrop
  const win = (
    <window
      visible={false}
      namespace="ags-calendar-popup"
      name="calendar-popup"
      cssClasses={["CalendarPopup"]}
      anchor={TOP}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
    >
      <box cssClasses={["calendar-popup-content"]}>
        {calendar}
      </box>
    </window>
  ) as Astal.Window

  // Add escape key handler
  addEscapeHandler(win)

  return win
}
