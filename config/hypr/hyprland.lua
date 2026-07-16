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
    ignored_titles = { "wechat" },
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
    key = "SUPER + Z",
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
