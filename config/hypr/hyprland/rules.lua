-- Goldendict
hl.window_rule({match={class="GoldenDict-ng"}, float=true, size={800, 600}, center=true})

-- Safeeyes
hl.window_rule({
    match = { class = "Safeeyes" },
    float = true,
})

hl.window_rule({
    match = { title = "SafeEyes-0" },
    monitor = "0",
})

hl.window_rule({
    match = { title = "SafeEyes-1" },
    monitor = "1",
})

-- Flameshot rules
hl.window_rule({
    name = "proper-flameshot-handling",
    match = { class = "flameshot" },

    animation = "fade",
    rounding = 0,
    border_size = 0,
    fullscreen_state = "0 0",
    float = true,
    pin = true,
    monitor = "HDMI-A-1",
    move = { 0, 0 },
    size = { "monitor_w*2", "monitor_h" },
})
-- fcitx5
hl.window_rule({match={class="fcitxfcit"}, float=true, no_anim=true, no_blur=true, pin=true, immediate=true, stay_focused=true, keep_aspect_ratio=true})

-- QQ
hl.window_rule({match={class="QQ"}, float=true})

-- Zeal
hl.window_rule({match={class="org.zealdocs.zeal"}, float=true})

-- boxes
hl.window_rule({match={title="Boxes"}, workspace=7})

-- tabby
hl.window_rule({match={class="tabby"}, workspace=8})

-- tenacity
hl.window_rule({match={title="Tenacity"}, workspace=9})

-- firefox
hl.window_rule({match={class="firefox"}, workspace=10})

-- show me the key
hl.window_rule({match={title="Floating Window - Show Me The Key"}, float=true, pin=true, size={1920, 100}, move={0, 1080*0.83}, no_focus=true, border_size=0, no_blur=true, no_dim=true, no_shadow=true})

-- xpad
hl.window_rule({match={class="xpad"}, float=true, size={800, 600}, center=true})

-- rustdesk
hl.window_rule({match={class="RustDesk"}, float=true})

-- SwitchHosts
hl.window_rule({match={title="SwitchHosts"}, float=true})

-- Thunar
-- Float and center Thunar rename dialogs
hl.window_rule({match={title=".*Rename.*"}, float=true})
hl.window_rule({match={title=".*Rename.*"}, center=true})
hl.window_rule({match={class="xarchiver"}, float=true})
-- Float File Operation Progress dialogs
hl.window_rule({match={title="File Operation Progress"}, float=true})
hl.window_rule({match={title="Audio Information"}, float=true})
hl.window_rule({match={title="Audio Information"}, center=true})

-- dropterm
hl.window_rule({match={class="dropterm"}, no_anim=true})

-- Meld
hl.window_rule({match={class="org.gnome.Meld"}, float=true, center=true, size={1600, 900}})

-- gopeed
hl.window_rule({match={class="gopeed"}, float=true, center=true, size={800, 450}})

-- FLCLASH
hl.window_rule({match={class="com.follow.clash"}, float=true, center=true, size={1000, 600}})

-- bettercontrol
hl.window_rule({match={class="better_control.py"}, float=true, size={1000, 600}})

-- Hide XWayland helper windows that have an empty title (common for Wine tray/menu helpers)
hl.window_rule({match={xwayland=true, title="^$", class="^$", initial_class="^$", initial_title="^$"}, opacity=0.0, float=true, no_blur=true})

-- wine
hl.window_rule({match={class="wine"}, float=true, no_anim=true, no_blur=true, pin=true, immediate=true, stay_focused=true})

hl.window_rule({match={class="winecfg.exe"}, float=true, no_anim=true, no_blur=true, pin=true, immediate=true, stay_focused=true})

hl.layer_rule({match={class="waybar"}, blur=0})
hl.workspace_rule({workspace=1, monitor="HDMI-A-1"})
hl.workspace_rule({workspace=2, monitor="HDMI-A-1"})
hl.workspace_rule({workspace=3, monitor="HDMI-A-1"})
hl.workspace_rule({workspace=4, monitor="HDMI-A-1"})
hl.workspace_rule({workspace=5, monitor="HDMI-A-1"})

hl.workspace_rule({workspace=6, monitor="DP-1"})
hl.workspace_rule({workspace=7, monitor="DP-1"})
hl.workspace_rule({workspace=8, monitor="DP-1"})
hl.workspace_rule({workspace=9, monitor="DP-1"})
hl.workspace_rule({workspace=10, monitor="DP-1"})

hl.workspace_rule({
    workspace = "special:dropterm",
    on_created_empty = "[float; size 1912 500; move 4 44] alacritty --class dropterm -e bash -c 'tmux attach-session -t tmux 2>/dev/null || tmux new-session -s tmux'"
})

hl.window_rule({
    match = { class = "wechat" },
    float = true,
    workspace = "special:wechat",
})

hl.workspace_rule({
    workspace = "special:wechat",
    on_created_empty = "flatpak run com.tencent.WeChat"
})
