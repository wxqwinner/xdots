import app from "ags/gtk4/app"
import { POPUP_NAMES } from "./constants"

export function closeAllPopups(): void {
  POPUP_NAMES.forEach(name => {
    const popup = app.get_window(name)
    if (popup && popup.visible) popup.visible = false
  })

  const backdrop = app.get_window("popup-backdrop")
  if (backdrop) backdrop.visible = false
}

export function togglePopup(name: string): void {
  const popup = app.get_window(name)
  if (!popup) return

  const wasVisible = popup.visible
  closeAllPopups()

  if (!wasVisible) {
    const backdrop = app.get_window("popup-backdrop")
    if (backdrop) backdrop.visible = true
    popup.visible = true
  }
}
