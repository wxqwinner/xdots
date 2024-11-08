import Widget from 'resource:///com/github/Aylur/ags/widget.js';

const WINDOW_NAME = "resttime"

// 检测键盘鼠标活动，连续活动50分钟，休息10分钟
// 

export const resttime = Widget.Window({
    name: WINDOW_NAME,
    class_name: "resttime",
    layer: 'overlay',
    setup: self => self.keybind("Escape", () => {
        App.closeWindow(WINDOW_NAME)
    }),
    visible: false,
    keymode: "exclusive",
    child:  Widget.Label( {label:"休息一会儿吧"} ),
})