import { createBinding, For } from "ags"
import AstalHyprland from "gi://AstalHyprland"
import GioUnix from "gi://GioUnix"
import Gio from "gi://Gio"

function getIconForClass(appClass: string): Gio.Icon | null {
  if (!appClass) return null

  const candidates = [
    `${appClass}.desktop`,
    `${appClass.toLowerCase()}.desktop`,
    `${appClass.replace(/\./g, "-")}.desktop`,
    `${appClass.toLowerCase().replace(/\./g, "-")}.desktop`,
  ]

  for (const id of candidates) {
    const appInfo = GioUnix.DesktopAppInfo.new(id)
    if (appInfo) {
      const icon = appInfo.get_icon()
      if (icon) return icon
    }
  }

  return Gio.ThemedIcon.new(appClass.toLowerCase())
}

export default function Clients({ monitorName }: { monitorName: string }) {
  const hypr = AstalHyprland.get_default()
  const clients = createBinding(hypr, "clients")
  const focused = createBinding(hypr, "focusedClient")

  const monitorClients = clients((cls: any[]) => {
    const hyprMonitor = hypr.get_monitors().find((m: any) => m.name === monitorName)
    if (!hyprMonitor) return []
    const activeWsId = hyprMonitor.activeWorkspace?.id
    if (!activeWsId) return []
    return cls.filter((c) => c.workspace?.id === activeWsId).slice(0, 8)
  })

  return (
    <box cssClasses={["clients"]}>
      <For each={monitorClients}>
        {(client: any) => (
          <button
            cssClasses={focused((fc: any) =>
              fc?.address === client.address ? ["client", "focused"] : ["client"]
            )}
            tooltipText={client.title || client.class}
            onClicked={() => hypr.dispatch("focuswindow", `address:${client.address}`)}
          >
            <image cssClasses={["client-icon"]} gicon={getIconForClass(client.class)} pixelSize={18} />
          </button>
        )}
      </For>
    </box>
  )
}
