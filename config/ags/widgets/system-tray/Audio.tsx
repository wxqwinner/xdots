import { createBinding } from "ags"
import AstalWp from "gi://AstalWp"
import { togglePopup } from "../../lib/popup-manager"
import { getVolumeIcon } from "../../lib/constants"

export default function Audio() {
  const wp = AstalWp.get_default()
  const speaker = wp?.audio?.defaultSpeaker

  if (!speaker) {
    return <button cssClasses={["systray-btn"]}><label cssClasses={["icon"]} label="󰖁" /></button>
  }

  const volume = createBinding(speaker, "volume")
  const muted = createBinding(speaker, "mute")

  return (
    <button
      cssClasses={muted((m: boolean) => m ? ["systray-btn", "muted"] : ["systray-btn"])}
      onClicked={() => togglePopup("audio-popup")}
      tooltipText={volume((v: number) => `Volume: ${Math.round(v * 100)}%`)}
    >
      <label
        cssClasses={["icon"]}
        label={volume((v: number) => getVolumeIcon(v, speaker.mute))}
      />
    </button>
  )
}
