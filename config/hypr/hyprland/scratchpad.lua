-- ~/.config/hypr/scratchpad.lua
Scratchpad = {}
Scratchpad._instances = Scratchpad._instances or {}
local activeOnMonitor = {}
local classToName = {}
local IGNORED_CLASSES = { fcitx5=true, fcitx=true, fcitx5qt=true }

function Scratchpad.ignore_class(class)
    IGNORED_CLASSES[class] = true
end

function Scratchpad.register(opts)
    local name = opts.name
    local class = opts.class
    local launchCmd = opts.launch_cmd
    local key = opts.key
    local fill = opts.fill ~= false
    local width = opts.width or 950
    local height = opts.height or 1030

    classToName[class] = name

    local ignoredTitles = {}
    for _, t in ipairs(opts.ignored_titles or {}) do ignoredTitles[t] = true end
    local function isIgnored(w) return ignoredTitles[w.title] end

    local specialWs = "special:" .. name

    hl.workspace_rule({ workspace = specialWs, persistent = true })
    hl.window_rule({ name = name.."-float", match = { class = class }, float = true })

    local function findWindow()
        for _, w in pairs(hl.get_windows()) do
            if w.class == class and not isIgnored(w) then return w end
        end
        return nil
    end

    local function getCursorMonitor()
        local pos = hl.get_cursor_pos()
        return pos and hl.get_monitor_at({ x = pos.x, y = pos.y }) or hl.get_active_monitor()
    end

    local function positionWindow(w)
        if not w then return end
        if fill then
            hl.dispatch(hl.dsp.window.fullscreen_state({internal=1, client=0, window="address:"..w.address}))
        else
            hl.dispatch(hl.dsp.window.resize({x=width, y=height, window="address:"..w.address}))
        end
    end

    local function hide(w)
        if not w then return end
        local mon = getCursorMonitor()

        -- 最佳防闪烁方式：使用 silent move + 避免不必要的 toggle
        hl.dispatch(hl.dsp.window.move({
            workspace = specialWs,
            window = "address:" .. w.address,
            silent = true
        }))

        -- 只在需要时 toggle（如果 special 没打开）
        hl.dispatch(hl.dsp.workspace.toggle_special(name))

        activeOnMonitor[mon.name] = nil
    end

    local function show(w)
        if not w then return end
        local mon = getCursorMonitor()

        hl.dispatch(hl.dsp.window.move({
            workspace = mon.active_workspace.name,
            window = "address:" .. w.address
        }))

        hl.dispatch(hl.dsp.focus({ window = "address:" .. w.address }))
        positionWindow(w)

        activeOnMonitor[mon.name] = name
    end

    local function toggle()
        local w = findWindow()
        if not w then
            hl.exec_cmd(launchCmd)
            return
        end

        local mon = getCursorMonitor()
        local isShownHere = (w.workspace.name ~= specialWs) and (activeOnMonitor[mon.name] == name)

        if isShownHere then
            hide(w)
        else
            local prev = activeOnMonitor[mon.name]
            if prev and prev ~= name and Scratchpad._instances[prev] then
                Scratchpad._instances[prev].hideIfVisible()
            end
            show(w)
        end
    end

    hl.on("window.open", function(w)
        if w.class ~= class or isIgnored(w) then return end
        local mon = getCursorMonitor()
        positionWindow(w)
        hl.dispatch(hl.dsp.focus({ window = "address:" .. w.address }))
        activeOnMonitor[mon.name] = name
    end)

    hl.bind(key, toggle)

    Scratchpad._instances[name] = {
        toggle = toggle,
        find = findWindow,
        hideIfVisible = function()
            local w = findWindow()
            if w and w.workspace.name ~= specialWs then hide(w) end
        end,
    }
    return Scratchpad._instances[name]
end

-- 全局
hl.on("window.open", function(w)
    if classToName[w.class] or IGNORED_CLASSES[w.class] then return end
    local mon = w.monitor or getCursorMonitor and getCursorMonitor() or hl.get_active_monitor()
    if not mon then return end
    local activeName = activeOnMonitor[mon.name]
    if activeName and Scratchpad._instances[activeName] then
        Scratchpad._instances[activeName].hideIfVisible()
        activeOnMonitor[mon.name] = nil
    end
end)

return Scratchpad