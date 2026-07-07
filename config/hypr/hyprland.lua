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
    name = "tenacity",
    class = "tenacity",
    launch_cmd = "tenacity",
    key = "SUPER + D",
    fill = true,
})