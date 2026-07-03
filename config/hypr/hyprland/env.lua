hl.env("__GLX_VENDOR_LIBRARY_NAME", "nvidia")
hl.env("LIBVA_DRIVER_NAME", "nvidia")
hl.env("XDG_SESSION_TYPE", "wayland")
hl.env("NVD_BACKEND", "direct")

hl.env("XDG_CURRENT_DESKTOP", "Hyprland")
hl.env("XDG_SESSION_DESKTOP", "Hyprland")
hl.env("XDG_SESSION_TYPE", "wayland")

-- qt
hl.env("QT_WAYLAND_FORCE_DPI", "96")
hl.env("QT_AUTO_SCREEN_SCALE_FACTOR", "1")
hl.env("QT_QPA_PLATFORM", "wayland;xcb")
hl.env("QT_QPA_PLATFORMTHEME", "qt5ct")
hl.env("QT_WAYLAND_DISABLE_WINDOWDECORATION", "1")
hl.env("MOZ_ENABLE_WAYLAND", "1")

-- gtk
hl.env("GDK_SCALE", "1.2")
hl.env("GDK_BACKEND", "wayland,x11,*")

hl.env("SDL_VIDEODRIVER", "wayland")
hl.env("CLUTTER_BACKEND", "wayland")

-- xdg
hl.env("XDG_CURRENT_DESKTOP", "Hyprland")
hl.env("XDG_SESSION_TYPE", "wayland")
hl.env("XDG_SESSION_DESKTOP", "Hyprland")

-- cursor
hl.env("XCURSOR_SIZE", "24")
hl.env("HYPRCURSOR_THEME", "MyLayan")
hl.env("HYPRCURSOR_SIZE", "24")

-- electron
hl.env("ELECTRON_OZONE_PLATFORM_HINT", "auto")
-- hl.env("AQ_DRM_DEVICES", "/dev/dri/card2")

-- fcitx5
hl.env("XIM", "fcitx")
hl.env("XIM_PROGRAM", "fcitx")
hl.env("INPUT_METHOD", "fcitx")
hl.env("GTK_IM_MODULE", "fcitx")
hl.env("QT_IM_MODULE", "fcitx")
hl.env("XMODIFIERS", "@im=fcitx")
hl.env("SDL_IM_MODULE", "fcitx")

hl.env("TERMINAL", "alacritty")
