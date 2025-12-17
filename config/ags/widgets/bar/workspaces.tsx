import { createBinding, For } from "ags"
import AstalHyprland from "gi://AstalHyprland"

export default function Workspaces({ monitorName }: { monitorName: string }) {
    const hypr = AstalHyprland.get_default()
    const workspaces = createBinding(hypr, "workspaces")
    const focused = createBinding(hypr, "focusedWorkspace")


    return (
        <box cssClasses={["workspaces"]}>
            <For each={workspaces((wss) =>
                wss
                    .filter(ws => !(ws.id >= -99 && ws.id <= -2))
                    .sort((a, b) => a.id - b.id)
            )}>
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
