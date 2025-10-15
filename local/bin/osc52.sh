#!/bin/sh
# osc52.sh - copy stdin to local clipboard using OSC52 escape sequence

buf=$(cat)

b64=$(printf "%s" "$buf" | base64 | tr -d '\r\n')

printf "\033]52;c;%s\a" "$b64"
