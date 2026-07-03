-- General
hl.config({
    general = {
        gaps_in = 2,
        gaps_out = 4,
        resize_on_border = false,
        allow_tearing = false,

        layout = "dwindle",

        col = {
            active_border            = "rgba(cba6f7ff)",
            inactive_border          = "rgba(bd93f900)",
            nogroup_border           = "rgba(282a36dd)",
            nogroup_border_active = { colors = { "rgb(bd93f9)", "rgb(44475a)" }, angle = 90 },
        },
        border_size = 2,
    },

    decoration = {
        rounding = 10,
        active_opacity     = 0.9,
        inactive_opacity   = 0.9,
        fullscreen_opacity = 1.0,

        shadow = {
            range        = 4,
            render_power = 3,
            offset       = { 1, 2 },
            color        = "rgba(1E202966)",
            enabled      = true,
            scale        = 0.97,
        },

        blur = {
            enabled  = true,
            size     = 10,
            passes   = 1,
            vibrancy = 0.1696,
        },
    },

    group = {
        groupbar = {
            col = {
                active   = { colors = { "rgb(bd93f9)", "rgb(44475a)" }, angle = 90 },
                inactive = "rgba(282a36dd)",
            },
        },
    },

    dwindle = {
        preserve_split = true,
    },

    master = {
        new_status = "master",
    },
})