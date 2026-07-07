-- ~/.config/hypr/scratchpad.lua
-- 通用的悬浮应用（scratchpad）管理器
-- 用法：在 hyprland.lua 里 require("scratchpad")，
-- 然后调用 Scratchpad.register({...}) 注册每一个应用

Scratchpad = {}

-- opts 字段说明：
--   name        字符串，唯一标识，用作 special workspace 名字（special:<name>）
--   class       窗口 class，用来查找/匹配这个应用的窗口
--   launch_cmd  找不到窗口时用来启动这个应用的命令
--   key         绑定的快捷键，如 "SUPER + W"
--   fill        (可选) 是否铺满当前显示器，默认 true
--   width/height (可选) fill=false 时使用的固定悬浮尺寸，默认 950x1030
function Scratchpad.register(opts)
    local name = opts.name
    local class = opts.class
    local launchCmd = opts.launch_cmd
    local key = opts.key
    local fill = opts.fill
    if fill == nil then fill = true end
    local width = opts.width or 950
    local height = opts.height or 1030

    local specialWs = "special:" .. name

    -- 窗口一旦打开，始终保持 floating
    hl.window_rule({
        name = name .. "-float",
        match = { class = class },
        float = true,
    })

    local function findWindow()
        for _, w in pairs(hl.get_windows()) do
            if w.class == class then
                return w
            end
        end
        return nil
    end

    local function positionWindow(addr)
        if fill then
            -- 铺满当前显示器，不通知客户端进入全屏
            hl.dispatch(hl.dsp.window.fullscreen_state({
                internal = 1,
                client = 0,
                window = "address:" .. addr,
            }))
        else
            hl.dispatch(hl.dsp.window.resize({ x = width, y = height, window = "address:" .. addr }))
        end
    end

    local function toggle()
        local w = findWindow()

        if w == nil then
            hl.exec_cmd(launchCmd)
            return
        end

        if w.workspace.name == specialWs then
            -- 隐藏 -> 显示
            local active = hl.get_active_workspace()
            hl.dispatch(hl.dsp.window.move({ workspace = active.name, window = "address:" .. w.address }))
            hl.dispatch(hl.dsp.focus({ window = "address:" .. w.address }))
            positionWindow(w.address)
        else
            -- 显示 -> 隐藏
            hl.dispatch(hl.dsp.window.move({ workspace = specialWs, window = "address:" .. w.address, silent = true }))
            hl.dispatch(hl.dsp.workspace.toggle_special(name))
        end
    end

    hl.bind(key, toggle)

    -- 返回句柄，方便需要时手动调用/调试
    return {
        toggle = toggle,
        find = findWindow,
    }
end

return Scratchpad