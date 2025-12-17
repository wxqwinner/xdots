# AGS Desktop Shell Configuration

Custom AGS (Aylur's GTK Shell) v3 configuration for Hyprland desktop environment with a macOS-inspired dark purple aesthetic.

## Stack

| Component | Technology |
|-----------|------------|
| Shell Framework | AGS v3 (GTK4 + TypeScript) |
| Window Manager | Hyprland |
| Display Protocol | Wayland |
| Type Definitions | `@girs/` (auto-generated) |
| Runtime | GJS (GNOME JavaScript) |

## Running AGS

```bash
# Standard run (from this directory)
GI_TYPELIB_PATH=/usr/local/lib64/girepository-1.0 ags run

# Kill and restart
pkill -9 gjs && GI_TYPELIB_PATH=/usr/local/lib64/girepository-1.0 ags run

# Toggle launcher via hyprctl
ags toggle launcher
```

## Design Philosophy

### Visual Style
- **macOS Spotlight-inspired**: Clean, minimal, pill-shaped elements
- **Dark theme with purple accents**: Deep backgrounds with vibrant purple highlights
- **Modern opacity**: Semi-transparent backgrounds (~85%) for depth
- **Blur effects**: Hyprland layer blur for glass-like appearance

### Color Palette

| Variable | Hex | Usage |
|----------|-----|-------|
| `$purple-primary` | `#9d4edd` | Primary accent, borders, highlights |
| `$purple-secondary` | `#7b2cbf` | Secondary accent, hover states |
| `$purple-dark` | `#5a189a` | Deep accent |
| `$bg-darker` | `#0d0d0d` | Darkest background |
| `$bg-dark` | `#121218` | Primary background |
| `$bg-medium` | `#1a1a2e` | Secondary background |
| `$text-primary` | `#e0e0e0` | Primary text |
| `$text-secondary` | `#a0a0a0` | Muted text |
| `$text-dim` | `#666` | Placeholder, disabled |

### Design Decisions

1. **Launcher**: macOS Spotlight-style search
   - Pill-shaped (24px border-radius)
   - 2px solid purple border
   - Dynamic height (shrinks with fewer results)
   - Debounced search (50ms) to prevent lag
   - Lazy app initialization to avoid startup cost

2. **Status Bar**: Minimal top bar
   - Workspace indicators per-monitor
   - Client icons for current workspace
   - System tray with popups (audio, brightness, wifi, bluetooth)
   - Click-outside-to-close for popups via backdrop layer

3. **Popups**: Consistent control panels
   - Rounded corners (16px)
   - Purple accent colors
   - Toggle switches with ON/OFF states
   - Settings buttons linking to KDE system settings

## File Structure

```
.
├── app.tsx                 # Minimal entry point (~44 lines)
├── launcher.tsx            # Spotlight-style app launcher
├── style.scss              # All styles (SCSS with variables)
├── lib/                    # Shared utilities
│   ├── constants.ts        # Workspace mapping, icons, location
│   ├── system-commands.ts  # GLib wrappers (spawn, file ops)
│   ├── popup-manager.ts    # Popup state management
│   └── ui-components.ts    # Reusable UI (toggle buttons, escape handlers)
├── widgets/
│   ├── bar/                # Status bar components
│   │   ├── index.tsx       # Bar window composition
│   │   ├── Workspaces.tsx  # Per-monitor workspace indicators
│   │   ├── Clients.tsx     # Active window icons
│   │   └── Clock.tsx       # Time and date display
│   ├── system-tray/        # Tray button components
│   │   ├── index.tsx       # SystemTray composition
│   │   ├── Audio.tsx       # Volume button
│   │   ├── Brightness.tsx  # Brightness button
│   │   ├── Network.tsx     # WiFi status button
│   │   ├── Bluetooth.tsx   # Bluetooth status button
│   │   └── Caffeine.tsx    # Screen sleep toggle
│   └── popups/             # Popup windows
│       ├── backdrop.tsx    # Click-outside-to-close layer (non-ags namespace to avoid blur)
│       ├── audio/AudioPopup.tsx  # Volume, device selection, media controls
│       ├── media/
│       │   └── media-utils.ts    # playerctl wrapper with ignored players filter
│       ├── brightness/
│       │   ├── BrightnessPopup.tsx
│       │   └── night-light.ts  # Sunrise/sunset calculation
│       ├── network/
│       │   ├── WifiPopup.tsx
│       │   └── network-utils.ts
│       └── bluetooth/
│           ├── BluetoothPopup.tsx
│           └── bluetooth-utils.ts
├── @girs/                  # Type definitions (gitignored)
├── screenshots/            # Reference screenshots
└── CLAUDE.md               # This file
```

## Key Patterns

### Window Creation (Layer Shell)
```typescript
const window = new Astal.Window({
  name: "unique-name",
  namespace: "ags-unique-name",  // For Hyprland layer rules
  application: app,
  anchor: Astal.WindowAnchor.TOP,
  exclusivity: Astal.Exclusivity.IGNORE,
  keymode: Astal.Keymode.ON_DEMAND,
  visible: false,
})
```

### Reactive Bindings
```typescript
const value = createBinding(object, "property")
// Use in JSX:
<label label={value((v) => `${v}%`)} />
```

### Polling
```typescript
const data = createPoll(initialValue, intervalMs, () => fetchData())
```

### Debouncing with GLib
```typescript
let timer: number | null = null
function debouncedFn() {
  if (timer) GLib.source_remove(timer)
  timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
    doWork()
    timer = null
    return GLib.SOURCE_REMOVE
  })
}
```

### Dynamic Window Resize (Layer Shell)
Layer shell windows don't auto-shrink when content is hidden. Use `set_default_size(-1, -1)` to force recalculation:
```typescript
// Store window reference
let winRef: Astal.Window | null = null

function triggerWindowResize() {
  if (winRef) winRef.set_default_size(-1, -1)
}

// Call after visibility changes (e.g., dropdown toggle)
optionsBox.visible = !optionsBox.visible
triggerWindowResize()
```

## Hyprland Integration

### Keybinds (in hyprland.conf)
```
bind = $mainMod, D, exec, ags toggle launcher
bind = ALT, SPACE, exec, ags toggle launcher
```

### Layer Rules (for blur effects)
```
layerrule = blur, ags-.*
layerrule = ignorezero, ags-.*
layerrule = noanim, ags-launcher  # Disable animation for dynamic resize
```

**Note:** The backdrop uses namespace `popup-backdrop` (not `ags-*`) to avoid blur.
The `ignorezero` rule ignores transparent areas for input - backdrop needs minimal alpha (0.01) to receive clicks.

### Workspace-to-Monitor Mapping
```typescript
const WORKSPACE_MONITOR_MAP: Record<string, number[]> = {
  "DP-3": [1, 2, 3, 10],      // Center (primary)
  "DP-1": [4, 5, 6],          // Left
  "HDMI-A-1": [7, 8, 9],      // Right
}
```

## Future Work

- [ ] Add window representation to bar (like macOS dock highlighting)
- [ ] Notification center
- [ ] VPN toggle in network popup
- [x] Power menu widget
- [x] Calendar popup for clock
- [x] Media controls in audio popup (with playerctl ignore for wallpaper players)

## Coding Style

- TypeScript with strict null checks
- Functional components where possible
- Avoid unnecessary abstractions
- CSS classes over inline styles
- Keep popup logic self-contained
- Use GLib for timers, not setTimeout (GJS limitation)

## Testing Changes

1. Make edits to source files
2. Restart AGS: `pkill -9 gjs && ags run`
3. Test functionality (keybinds, popups, etc.)
4. Check for console errors in AGS output

## Dependencies

- `ags` CLI (AGS v3)
- `astal` libraries (Apps, Hyprland, WirePlumber)
- `nmcli` for WiFi management
- `bluetoothctl` for Bluetooth
- `playerctl` for media controls (uses `-i` flag to ignore wallpaper players like mpv)
- Nerd Fonts for icons (Symbols Nerd Font)
