import { createBinding, For } from "ags"
import AstalHyprland from "gi://AstalHyprland"
import { getMonitorWorkspaces } from "../../lib/constants"

export default function Workspaces({ monitorName }: { monitorName: string }) {
  const hypr = AstalHyprland.get_default()
  const workspaces = createBinding(hypr, "workspaces")
  const focused = createBinding(hypr, "focusedWorkspace")
  const monitorWorkspaceIds = getMonitorWorkspaces(monitorName)

  const filteredWorkspaces = workspaces((wss: any[]) =>
    wss
      .filter((ws) => monitorWorkspaceIds.includes(ws.id))
      .sort((a, b) => a.id - b.id)
  )

  return (
    <box cssClasses={["workspaces"]}>
      <For each={filteredWorkspaces}>
        {(ws: any) => (
          <button
            cssClasses={focused((fw: any) =>
              fw?.id === ws.id ? ["active"] : ws.get_clients().length > 0 ? ["occupied"] : []
            )}
            onClicked={() => hypr.dispatch("workspace", String(ws.id))}
          >
            <label label={String(ws.id)} />
          </button>
        )}
      </For>
    </box>
  )
}
