#!/usr/bin/env bash

STATE_FILE="/tmp/ags-caffeine-active"

case "$1" in
  status)
    if [[ -f "$STATE_FILE" ]]; then
      echo '{"text":"󰅶","class":"active","tooltip":"Caffeine ON"}'
    else
      echo '{"text":"󰛊","class":"inactive","tooltip":"Caffeine OFF"}'
    fi
    ;;
  toggle)
    if [[ -f "$STATE_FILE" ]]; then
      # OFF
      rm -f "$STATE_FILE"
      hyprctl dispatch exec hypridle >/dev/null 2>&1
    else
      # ON
      touch "$STATE_FILE"
      killall hypridle >/dev/null 2>&1
    fi
    ;;
esac
