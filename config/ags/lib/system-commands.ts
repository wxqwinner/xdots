import GLib from "gi://GLib"

export function spawnAsync(command: string): void {
  GLib.spawn_command_line_async(command)
}

export function spawnSync(command: string): [boolean, Uint8Array] {
  return GLib.spawn_command_line_sync(command)
}

export function fileExists(path: string): boolean {
  return GLib.file_test(path, GLib.FileTest.EXISTS)
}

export function touchFile(path: string): void {
  spawnAsync(`touch ${path}`)
}

export function removeFile(path: string): void {
  spawnAsync(`rm -f ${path}`)
}

export function getHomeDir(): string {
  return GLib.get_home_dir()
}
