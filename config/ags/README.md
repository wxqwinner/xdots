# AGS Desktop Shell

A custom Wayland desktop shell built with [AGS v3](https://github.com/Aylur/ags) for Hyprland, featuring a macOS Spotlight-inspired launcher and modern purple-themed UI.

![Launcher](./screenshots/launcher-typing.png)

## Features

### 🚀 Spotlight-Style Launcher
- **Fuzzy search** across all installed applications
- **Keyboard navigation** (arrow keys, Enter to launch, Escape to close)
- **Dynamic sizing** - window height adjusts to result count
- **macOS-inspired design** - pill-shaped with purple accents
- **Lazy initialization** - apps load on first use to speed up startup
- **Debounced search** - smooth, lag-free typing experience

### 📊 Status Bar
- **Per-monitor workspace indicators** - shows only relevant workspaces for each display
- **Client icons** - displays running application icons for current workspace
- **System tray** - integrated with popup controls for audio, brightness, WiFi, and Bluetooth
- **Digital clock** - clean time display

### 🎵 Audio Control
- **Volume slider** with real-time feedback
- **Mute toggle** - quick audio on/off
- **WirePlumber integration** - native PipeWire support
- **Settings button** - quick access to KDE audio configuration

### 🌙 Brightness Control
- **Software brightness slider** (0-100%)
- **Auto night light** - automatically adjusts color temperature at sunrise/sunset
- **Persistent settings** - remembers brightness levels across sessions
- **Settings button** - opens KDE display configuration

### 📡 WiFi Manager
- **Network scanning** - discover available access points
- **Connection management** - connect to saved networks
- **Password entry** - secure WPA/WPA2 authentication
- **Signal strength indicators** - visual feedback for connection quality
- **Settings button** - opens KDE network settings

### 📱 Bluetooth Manager
- **Device discovery** - scan for nearby Bluetooth devices
- **Pairing workflow** - easy device pairing and connection
- **Device management** - connect/disconnect paired devices
- **Settings button** - quick access to KDE Bluetooth settings

### ☕ Caffeine Mode
- **Prevent screen sleep** - toggle to keep display active
- **Visual indicator** - shows active/inactive state
- **Persistent across sessions** - remembers caffeine state

## Screenshots

| Launcher with Results | Launcher Empty | System Tray |
|----------------------|----------------|-------------|
| ![Launcher Typing](./screenshots/launcher-typing.png) | ![Launcher](./screenshots/launcher2.png) | ![Launcher Test](./screenshots/launcher-test.png) |

## Requirements

### Core Dependencies
- **AGS v3** - Shell framework ([installation guide](https://aylur.github.io/ags-docs/))
- **Hyprland** - Wayland compositor
- **GTK4** - GUI toolkit
- **GJS** - GNOME JavaScript runtime

### Astal Libraries
- `astal` - Core AGS library
- `astalApps` - Application launcher support
- `astalHyprland` - Hyprland integration
- `astalWp` - WirePlumber (PipeWire) audio control

### System Utilities
- `nmcli` (NetworkManager) - WiFi management
- `bluetoothctl` (BlueZ) - Bluetooth management
- **Nerd Fonts** - For icon rendering (e.g., Symbols Nerd Font)

### Optional
- `ddcutil` - Hardware brightness control (fallback if software brightness isn't available)

## Installation

### 1. Install AGS v3
```bash
# Follow official installation instructions at:
# https://aylur.github.io/ags-docs/guide/install
```

### 2. Clone Configuration
```bash
git clone <your-repo-url> ~/.config/ags
cd ~/.config/ags
```

### 3. Install Dependencies
```bash
# Install required packages (example for openSUSE Tumbleweed)
sudo zypper install NetworkManager bluez gtk4 wireplumber
```

### 4. Generate Type Definitions
```bash
# AGS will auto-generate @girs/ types on first run
ags run
```

### 5. Configure Hyprland
Add to your `~/.config/hypr/hyprland.conf`:

```bash
# Keybinds
bind = $mainMod, D, exec, ags toggle launcher
bind = ALT, SPACE, exec, ags toggle launcher

# Layer rules (for blur effects)
layerrule = blur, ags-.*
layerrule = ignorezero, ags-.*

# Auto-start AGS
exec-once = GI_TYPELIB_PATH=/usr/local/lib64/girepository-1.0 ags run
```

### 6. Restart Hyprland
```bash
hyprctl reload
# or restart Hyprland completely
```

## Usage

### Keybindings

| Action | Keybind |
|--------|---------|
| Toggle Launcher | `Super + D` or `Alt + Space` |
| Navigate Results | `↑` / `↓` or `Ctrl+N` / `Ctrl+P` |
| Launch Application | `Enter` |
| Close Launcher | `Escape` |
| System Tray Popups | Click tray icons |

### CLI Commands

```bash
# Start AGS
GI_TYPELIB_PATH=/usr/local/lib64/girepository-1.0 ags run

# Restart AGS
pkill -9 gjs && GI_TYPELIB_PATH=/usr/local/lib64/girepository-1.0 ags run

# Toggle launcher externally
ags toggle launcher

# Check AGS logs
journalctl --user -u ags -f
```

### Runtime Commands
AGS provides IPC for external control:
```bash
ags toggle <window-name>  # Toggle window visibility
ags quit                  # Exit AGS
```

## Configuration

### Color Scheme
Edit `style.scss` to customize colors:

```scss
// Primary colors
$purple-primary: #9d4edd;
$purple-secondary: #7b2cbf;
$purple-dark: #5a189a;

// Backgrounds
$bg-darker: #0d0d0d;
$bg-dark: #121218;
$bg-medium: #1a1a2e;

// Text
$text-primary: #e0e0e0;
$text-secondary: #a0a0a0;
```

### Workspace-to-Monitor Mapping
Edit the mapping in `app.tsx` to match your monitor layout:

```typescript
const WORKSPACE_MONITOR_MAP: Record<string, number[]> = {
  "DP-3": [1, 2, 3, 10],      // Center (primary)
  "DP-1": [4, 5, 6],          // Left
  "HDMI-A-1": [7, 8, 9],      // Right
}
```

Find your monitor names with:
```bash
hyprctl monitors
```

### Launcher Behavior
Adjust search result count in `launcher.tsx`:
```typescript
const MAX_RESULTS = 5  // Change to show more/fewer results
```

### Brightness Auto Night Light
Configure sunrise/sunset times in `app.tsx`:
```typescript
const now = new Date()
const hour = now.getHours()
const shouldBeWarm = hour >= 20 || hour < 6  // 8pm-6am
```

## File Structure

```
.
├── app.tsx              # Main entry: bar, popups, system tray
├── launcher.tsx         # Spotlight-style app launcher
├── style.scss           # All styles (SCSS with CSS variables)
├── widget/
│   └── Bar.tsx          # Alternative bar widget (unused)
├── @girs/               # Auto-generated type definitions (gitignored)
├── screenshots/         # UI screenshots
├── package.json         # Dependencies and Prettier config
└── README.md            # This file
```

## Development

### Making Changes
1. Edit source files (`app.tsx`, `launcher.tsx`, `style.scss`)
2. Restart AGS: `pkill -9 gjs && ags run`
3. Test functionality (keybinds, popups, visual changes)
4. Check console output for errors

### Debugging
```bash
# Run AGS with debug output
G_MESSAGES_DEBUG=all ags run

# Check for TypeScript errors
# (AGS will show compilation errors on startup)
```

### Code Style
- **TypeScript** with strict null checks
- **Functional components** where possible
- **SCSS** for styling (variables for theme consistency)
- **GLib timers** instead of `setTimeout` (GJS compatibility)
- **Reactive bindings** for dynamic updates

## Troubleshooting

### Launcher doesn't appear
- Check keybind configuration in `hyprland.conf`
- Verify AGS is running: `pgrep -f gjs`
- Test manually: `ags toggle launcher`

### Blur effects not working
- Ensure Hyprland layer rules are configured
- Check if blur is enabled in Hyprland config
- Verify AGS windows use correct namespace

### WiFi/Bluetooth popups not working
- Ensure NetworkManager is running: `systemctl status NetworkManager`
- Ensure BlueZ is running: `systemctl status bluetooth`
- Check `nmcli` and `bluetoothctl` are in PATH

### Type definitions missing
- Delete `@girs/` directory and restart AGS
- AGS will regenerate type definitions automatically

### GI_TYPELIB_PATH error
- Adjust path based on your distribution:
  - Arch: `/usr/lib/girepository-1.0`
  - Fedora/openSUSE: `/usr/local/lib64/girepository-1.0`
  - Ubuntu: `/usr/lib/x86_64-linux-gnu/girepository-1.0`

## Future Enhancements

- [ ] Modular component structure (split `app.tsx`)
- [ ] Power menu widget
- [ ] Notification center
- [ ] Calendar popup for clock
- [ ] Media controls in audio popup
- [ ] VPN toggle in network popup
- [ ] Window representation in bar (like macOS dock)

## Contributing

Contributions welcome! Please:
1. Follow existing code style (Prettier config in `package.json`)
2. Test changes thoroughly on Hyprland
3. Update documentation for new features

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [Aylur's GTK Shell (AGS)](https://github.com/Aylur/ags) - Shell framework
- [Hyprland](https://hyprland.org/) - Wayland compositor
- Inspired by macOS Spotlight and modern desktop environments
