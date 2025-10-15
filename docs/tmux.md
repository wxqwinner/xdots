# tmux

1.  配合tabby在远程服务器上鼠标选中自动复制到剪切板

在服务器上新建脚本~/.local/bin/osc52.sh，内容如下
```shell
#!/bin/sh
# osc52.sh - copy stdin to local clipboard using OSC52 escape sequence

buf=$(cat)

b64=$(printf "%s" "$buf" | base64 | tr -d '\r\n')

printf "\033]52;c;%s\a" "$b64"
```

在服务器~/.tmux.conf中添加下面的配置
```conf
set -g mouse on

set -g mode-keys vi
set -sg escape-time 100

bind -T copy-mode-vi MouseDragEnd1Pane send -X copy-pipe-and-cancel "~/.local/bin/osc52.sh"
bind -T copy-mode-vi y send -X copy-pipe-and-cancel "~/.local/bin/osc52.sh"
```

tmux source ~/.tmux.conf生效