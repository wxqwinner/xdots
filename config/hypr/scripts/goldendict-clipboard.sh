#!/usr/bin/env bash

goldendict_class="io.github.xiaoyifang.goldendict_ng"

mapfile -t windows < <(
    hyprctl clients -j 2>/dev/null |
        jq -r --arg class "$goldendict_class" \
            '.[] | select(.class == $class) | .address'
)

if (( ${#windows[@]} > 0 )); then
    for address in "${windows[@]}"; do
        hyprctl dispatch \
            "hl.dsp.window.close('address:$address')" >/dev/null
    done
    exit 0
fi

text="$(wl-paste --primary --no-newline --type text 2>/dev/null)"
text="${text//$'\r'/}"

[[ -n "${text//[[:space:]]/}" ]] || exit 0

goldendict "$text" >/dev/null 2>&1 &
