import { togglePopup } from "../../lib/popup-manager"

export default function Power() {
  return (
    <button
      cssClasses={["systray-btn", "power-btn"]}
      onClicked={() => togglePopup("power-popup")}
      tooltipText="Power"
    >
      <label cssClasses={["icon"]} label="⏻" />
    </button>
  )
}
