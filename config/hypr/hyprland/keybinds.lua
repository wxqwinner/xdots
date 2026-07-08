require("hyprland.default")

hl.bind("SUPER + Delete", hl.dsp.exit())
hl.bind("SUPER + T", hl.dsp.exec_cmd(terminal))
-- hl.bind("SUPER + E", hl.dsp.exec_cmd(files))
hl.bind("SUPER + SPACE", hl.dsp.exec_cmd("$HOME/.config/hypr/scripts/rofi_apps.sh"))
hl.bind("SUPER + L", hl.dsp.exec_cmd("hyprlock"))

hl.bind("SUPER + V", hl.dsp.window.float({ action = "toggle" }))
hl.bind("SUPER + F", hl.dsp.window.fullscreen({"fullscreen", "toggle"}))
hl.bind("SUPER + Z", hl.dsp.window.close())

-- cliphist
hl.bind("SUPER + X", hl.dsp.exec_cmd("rofi -modi clipboard:~/.config/rofi/cliphist-rofi-img -show clipboard -show-icons"))

-- dropterm
hl.bind("ALT + GRAVE", hl.dsp.workspace.toggle_special("dropterm"))


-- Move focus
hl.bind("SUPER + left",  hl.dsp.focus({ direction = "l" }))
hl.bind("SUPER + right", hl.dsp.focus({ direction = "r" }))
hl.bind("SUPER + up",    hl.dsp.focus({ direction = "u" }))
hl.bind("SUPER + down",  hl.dsp.focus({ direction = "d" }))

-- Move window
hl.bind("SUPER + SHIFT + left",  hl.dsp.window.move({ direction = "l" }))
hl.bind("SUPER + SHIFT + right", hl.dsp.window.move({ direction = "r" }))
hl.bind("SUPER + SHIFT + up",    hl.dsp.window.move({ direction = "u" }))
hl.bind("SUPER + SHIFT + down",  hl.dsp.window.move({ direction = "d" }))


hl.bind("SUPER + TAB", hl.dsp.workspace.toggle_special("magic"))
hl.bind("SUPER + SHIFT + TAB", hl.dsp.window.move({ workspace = "special:magic" }))

for i = 1, 10 do
    local key = i % 10
    hl.bind("SUPER + " .. key, hl.dsp.focus({ workspace = i }))
    hl.bind("SUPER + SHIFT + " .. key, hl.dsp.window.move({ workspace = i }))
end

hl.bind("SUPER + SPACE", hl.dsp.exec_cmd("~/.config/hypr/scripts/rofi_apps.sh"))

hl.bind("SUPER + mouse:272", hl.dsp.window.drag(),   { mouse = true })
hl.bind("SUPER + mouse:273", hl.dsp.window.resize(), { mouse = true })


local wechatTrayProxy = "~/.local/bin/wechat-tray-proxy.py"
local function restart()
    hl.exec_cmd("pkill -9 waybar")
    hl.exec_cmd("pkill -9 -f wechat-tray-proxy.py")
    hl.exec_cmd("pkill safeeyes")

    hl.timer(function()
        hl.exec_cmd(wechatTrayProxy)

        hl.timer(function()
            hl.exec_cmd("waybar")
            hl.exec_cmd("safeeyes")
        end, { timeout = 1000, type = "oneshot" })

    end, { timeout = 300, type = "oneshot" })
end

hl.bind("SUPER + SHIFT + R", restart)

-- flameshot
hl.bind("CTRL + ALT + A", hl.dsp.exec_cmd("QT_QPA_PLATFORM=wayland;flameshot gui"))

-- toggle xpad
hl.bind("SUPER + N", hl.dsp.exec_cmd("xpad -t"))

-- toggle dpms
local dpmsOn = true

hl.bind("SUPER + F12", function()
    dpmsOn = not dpmsOn
    hl.timer(function()
        hl.dispatch(hl.dsp.dpms({ action = dpmsOn and "enable" or "disable" }))
    end, { timeout = 500, type = "oneshot" })
end)

hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd("amixer set Master 5%+"))
hl.bind("XF86AudioLowerVolume", hl.dsp.exec_cmd("amixer set Master 5%-"))
hl.bind("XF86AudioMicMute",     hl.dsp.exec_cmd("amixer set Capture toggle"))
hl.bind("XF86AudioMute",        hl.dsp.exec_cmd("amixer set Master toggle"))
hl.bind("XF86AudioPlay",        hl.dsp.exec_cmd("playerctl play-pause"))
hl.bind("XF86AudioPause",       hl.dsp.exec_cmd("playerctl play-pause"))
hl.bind("XF86AudioNext",        hl.dsp.exec_cmd("playerctl next"))
hl.bind("XF86AudioPrev",        hl.dsp.exec_cmd("playerctl previous"))

hl.bind("SUPER + ALT + R",         hl.dsp.exec_cmd("~/.config/hypr/scripts/record-script.sh"))                       -- 录制区域（无声音）
hl.bind("CTRL + ALT + R",          hl.dsp.exec_cmd("~/.config/hypr/scripts/record-script.sh --fullscreen"))          -- [隐藏] 录制屏幕（无声音）
hl.bind("SUPER + SHIFT + ALT + R", hl.dsp.exec_cmd("~/.config/hypr/scripts/record-script.sh --fullscreen-sound"))    -- 录制屏幕（带声音）

hl.bind("SUPER + SHIFT + O", hl.dsp.exec_cmd('rofi -show rofi-sound -modi "rofi-sound:~/.config/hypr/scripts/rofi-sound-output-chooser.sh"'))
hl.bind("SUPER + SHIFT + I", hl.dsp.exec_cmd('rofi -show rofi-sound -modi "rofi-sound:~/.config/hypr/scripts/rofi-sound-input-chooser.sh"'))


local function zoomBy(factor, minVal)
    local cur = hl.get_config("cursor.zoom_factor")
    local newVal = cur * factor
    if minVal and newVal < minVal then
        newVal = minVal
    end
    hl.config({ cursor = { zoom_factor = newVal } })
end

hl.bind("SUPER + mouse_down", function() zoomBy(1.1) end)
hl.bind("SUPER + mouse_up",   function() zoomBy(0.9, 1) end)
