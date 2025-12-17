import { togglePopup } from "../../lib/popup-manager"

export default function Brightness() {
  return (
    <button
      cssClasses={["systray-btn"]}
      tooltipText="Brightness (software)"
      onClicked={() => togglePopup("brightness-popup")}
    >
      <label cssClasses={["icon"]} label="󰃟" />
    </button>
  )
}
