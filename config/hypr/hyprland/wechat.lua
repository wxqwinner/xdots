-- ~/.config/hypr/wechat.lua
-- 微信 special workspace 悬浮呼出/收起
-- 用法：在 hyprland.lua 里 require("wechat")

local WECHAT_CLASS = "wechat"
local WECHAT_LAUNCH_CMD = "flatpak run com.tencent.WeChat"
local WECHAT_SPECIAL = "special:wechat"
local TOGGLE_KEY = "SUPER + W"

-- 微信一旦打开，始终保持 floating
hl.window_rule({
    name = "wechat-float",
    match = { class = WECHAT_CLASS },
    float = true,
})

local function findWechat()
    for _, w in pairs(hl.get_windows()) do
        if w.class == WECHAT_CLASS then
            return w
        end
    end
    return nil
end

-- 铺满当前显示器（不告诉客户端进入全屏，只是尺寸铺满）
local function fillCurrentMonitor(addr)
    hl.dispatch(hl.dsp.window.fullscreen_state({
        internal = 1,
        client = 0,
        window = "address:" .. addr,
    }))
end

local function toggleWechat()
    local w = findWechat()

    -- 还没启动过，直接拉起来
    if w == nil then
        hl.exec_cmd(WECHAT_LAUNCH_CMD)
        return
    end

    if w.workspace.name == WECHAT_SPECIAL then
        -- 隐藏状态 -> 显示：挪到当前工作区，聚焦，铺满显示器
        local active = hl.get_active_workspace()
        hl.dispatch(hl.dsp.window.move({ workspace = active.name, window = "address:" .. w.address }))
        hl.dispatch(hl.dsp.focus({ window = "address:" .. w.address }))
        fillCurrentMonitor(w.address)
    else
        -- 显示状态 -> 隐藏：挪回 special，再显式关掉（挪进去会自动打开 special workspace）
        hl.dispatch(hl.dsp.window.move({ workspace = WECHAT_SPECIAL, window = "address:" .. w.address, silent = true }))
        hl.dispatch(hl.dsp.workspace.toggle_special("wechat"))
    end
end

hl.bind(TOGGLE_KEY, toggleWechat)