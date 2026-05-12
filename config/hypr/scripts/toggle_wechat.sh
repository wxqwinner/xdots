#!/usr/bin/env bash

CLASS="wechat"
SPECIAL_WS="special:wechat"

# 找微信窗口
ADDR=$(hyprctl clients -j | jq -r \
  --arg c "$CLASS" \
  '.[] | select(.class == $c) | .address' | head -n1)

# 没启动微信
if [[ -z "$ADDR" ]]; then
    wechat &
    exit 0
fi

# 当前 workspace
CURRENT_WS=$(hyprctl activeworkspace -j | jq -r '.name')

# 微信所在 workspace
WX_WS=$(hyprctl clients -j | jq -r \
  --arg addr "$ADDR" \
  '.[] | select(.address == $addr) | .workspace.name')

if [[ "$WX_WS" == "$SPECIAL_WS" ]]; then
    # 从 special 拉回当前 workspace
    hyprctl dispatch movetoworkspacesilent "$CURRENT_WS,address:$ADDR"
    hyprctl dispatch focuswindow "address:$ADDR"
    hyprctl dispatch set fullscreenstate 1 1 "address:$ADDR"
else
    # 丢进 special workspace
    hyprctl dispatch movetoworkspacesilent "$SPECIAL_WS,address:$ADDR"
fi