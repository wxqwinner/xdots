require("hyprland.env")
require("hyprland.default")
require("hyprland.autostart")
require("hyprland.general")
require("hyprland.theme")
require("hyprland.animations")
require("hyprland.keybinds")
require("hyprland.rules")

require("hyprland.scratchpad").register({
    name = "wechat",
    class = "wechat",
    launch_cmd = "flatpak run com.tencent.WeChat",
    key = "SUPER + W",
    fill = true,
})

require("hyprland.scratchpad").register({
    name = "QQ",
    class = "QQ",
    launch_cmd = "linuxqq",
    key = "SUPER + Q",
    fill = true,
})

require("hyprland.scratchpad").register({
    name = "tenacity",
    class = "tenacity",
    launch_cmd = "tenacity",
    key = "SUPER + D",
    fill = true,
})

require("hyprland.scratchpad").register({
    name = "code",
    class = "code",
    launch_cmd = "code",
    key = "SUPER + C",
    fill = true,
})

require("hyprland.scratchpad").register({
    name = "thunar",
    class = "thunar",
    launch_cmd = "thunar -w",
    key = "SUPER + E",
    fill = true,
})

require("hyprland.scratchpad").register({
    name = "firefox",
    class = "firefox",
    launch_cmd = "firefox",
    key = "SUPER + S",
    fill = true,
})

require("hyprland.scratchpad").register({
    name = "tabby",
    class = "tabby",
    launch_cmd = "tabby --disable-gpu-compositing",
    key = "SUPER + A",
    fill = true,
})