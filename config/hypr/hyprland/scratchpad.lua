-- ~/.config/hypr/scratchpad.lua

Scratchpad = {}
Scratchpad._instances = Scratchpad._instances or {}

-- 记录每台显示器当前显示的是哪个 scratchpad 应用
local activeOnMonitor = {}

function Scratchpad.register(opts)
    local name = opts.name
    local class = opts.class
    local launchCmd = opts.launch_cmd
    local key = opts.key
    local fill = opts.fill
    if fill == nil then fill = true end
    local width = opts.width or 950
    local height = opts.height or 1030

    local ignoredTitles = {}
    for _, t in ipairs(opts.ignored_titles or {}) do
        ignoredTitles[t] = true
    end
    local function isIgnored(w)
        return ignoredTitles[w.title] == true
    end

    local specialWs = "special:" .. name

    hl.window_rule({
        name = name .. "-float",
        match = { class = class },
        float = true,
    })

    local function findWindow()
        for _, w in pairs(hl.get_windows()) do
            if w.class == class and not isIgnored(w) then
                return w
            end
        end
        return nil
    end

    local function positionWindow(addr)
        if fill then
            hl.dispatch(hl.dsp.window.fullscreen_state({
                internal = 1,
                client = 0,
                window = "address:" .. addr,
            }))
        else
            hl.dispatch(hl.dsp.window.resize({ x = width, y = height, window = "address:" .. addr }))
        end
    end

    local function hide(w)
        hl.dispatch(hl.dsp.window.move({ workspace = specialWs, window = "address:" .. w.address, silent = true }))
        hl.dispatch(hl.dsp.workspace.toggle_special(name))
    end

    -- 供其他 scratchpad 应用调用：如果我当前是显示状态，把我藏起来
    local function hideIfVisible()
        local w = findWindow()
        if w ~= nil and w.workspace.name ~= specialWs then
            hide(w)
        end
    end

    local function toggle()
        local w = findWindow()

        if w == nil then
            hl.exec_cmd(launchCmd)
            return
        end

        local mon = hl.get_active_monitor()
        local active = hl.get_active_workspace()
        local isShownHere = (w.workspace.name == active.name) and (activeOnMonitor[mon.name] == name)

        if isShownHere then
            -- 已经在这台显示器显示 -> 隐藏
            hide(w)
            activeOnMonitor[mon.name] = nil
        else
            -- 关键：先把这台显示器上之前显示的那个应用完全藏起来，
            -- 确保它先离开这个 workspace，再让当前应用进来，
            -- 两者不会有共存于同一 workspace 的时刻，避免 fullscreen 槽位争抢
            local prevName = activeOnMonitor[mon.name]
            if prevName and prevName ~= name and Scratchpad._instances[prevName] then
                Scratchpad._instances[prevName].hideIfVisible()
            end

            hl.dispatch(hl.dsp.window.move({ workspace = active.name, window = "address:" .. w.address }))
            hl.dispatch(hl.dsp.focus({ window = "address:" .. w.address }))
            positionWindow(w.address)

            activeOnMonitor[mon.name] = name
        end
    end

    hl.on("window.open", function(w)
        if w.class ~= class then return end
        if isIgnored(w) then return end

        positionWindow(w.address)
        hl.dispatch(hl.dsp.focus({ window = "address:" .. w.address }))
    end)

    hl.bind(key, toggle)

    Scratchpad._instances[name] = {
        toggle = toggle,
        find = findWindow,
        hideIfVisible = hideIfVisible,
    }

    return Scratchpad._instances[name]
end

return Scratchpad