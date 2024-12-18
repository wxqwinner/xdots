import { App } from "astal/gtk3"
import style from "./style.scss"
import Applauncher from "./widget/Applauncher"
import Bar from "./widget/Bar"


App.start({
    css: style,
    instanceName: "js",
    requestHandler(request, res) {
        print(request)
        res("ok")
    },
    main: () => App.get_monitors().map(Bar),
})


// App.start({
//     instanceName: "launcher",
//     css: style,
//     main: Applauncher,
// })
