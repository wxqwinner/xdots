hl.config({

    -- debug = {
    --     -- enable_stdout_logs = true,
    --     disable_logs = false,
    -- },

    input = {
        kb_layout = "us",
        kb_variant = "",
        kb_model = "",
        kb_options = "caps:escape",
        kb_rules = "",

        follow_mouse = 1,
        float_switch_override_focus = 0,
        mouse_refocus = true,
        sensitivity = 0,
        touchpad = {
            natural_scroll = false
        }
    },

    misc = {
        force_default_wallpaper = -1,
        disable_hyprland_logo = true,
        allow_session_lock_restore = true,
        vrr = 0,
        focus_on_activate = true,
        animate_manual_resizes = false,
        enable_swallow = false,
        disable_splash_rendering = true
    },

    binds = {
        scroll_event_delay = 0
    },

    cursor = {
        no_warps = true
    },

    xwayland = {
        force_zero_scaling = true,
        create_abstract_socket = true,
    },

})
