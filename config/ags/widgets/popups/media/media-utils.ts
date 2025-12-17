import GLib from "gi://GLib"

export interface MediaInfo {
  title: string
  artist: string
  status: "Playing" | "Paused" | "Stopped"
  position: number
  length: number
}

// Players to ignore (wallpaper players, etc.)
const IGNORED_PLAYERS = ["mpv", "mpvpaper"]

function safeSpawnSync(command: string): string {
  try {
    const [ok, stdout] = GLib.spawn_command_line_sync(command)
    if (ok && stdout) {
      return new TextDecoder().decode(stdout).trim()
    }
  } catch (e) {
    print(`[MediaUtils] playerctl error: ${e}`)
  }
  return ""
}

// Build ignore flags for playerctl (comma-separated list for -i flag)
function getIgnoreFlags(): string {
  return `-i "${IGNORED_PLAYERS.join(",")}"`
}

export function getMediaInfo(): MediaInfo {
  const ignoreFlags = getIgnoreFlags()
  const status = safeSpawnSync(`playerctl ${ignoreFlags} status`)

  // No player available
  if (!status || status.includes("No players found")) {
    return {
      title: "",
      artist: "",
      status: "Stopped",
      position: 0,
      length: 0
    }
  }

  const title = safeSpawnSync(`playerctl ${ignoreFlags} metadata title`) || "Unknown"
  const artist = safeSpawnSync(`playerctl ${ignoreFlags} metadata artist`) || "Unknown Artist"

  // Position in seconds
  const posStr = safeSpawnSync(`playerctl ${ignoreFlags} position`)
  const position = posStr ? parseFloat(posStr) : 0

  // Length in microseconds, convert to seconds
  const lenStr = safeSpawnSync(`playerctl ${ignoreFlags} metadata mpris:length`)
  const length = lenStr ? parseInt(lenStr) / 1000000 : 0

  // Validate status is one of the expected values
  const validStatus: MediaInfo["status"] =
    (status === "Playing" || status === "Paused" || status === "Stopped")
      ? status
      : "Stopped"

  return {
    title,
    artist,
    status: validStatus,
    position,
    length
  }
}

export function hasActivePlayer(): boolean {
  const ignoreFlags = getIgnoreFlags()
  const status = safeSpawnSync(`playerctl ${ignoreFlags} status`)
  return status.length > 0 && !status.includes("No players found")
}

// Export ignore flags for use in AudioPopup commands
export function getPlayerctlIgnoreFlags(): string {
  return getIgnoreFlags()
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
