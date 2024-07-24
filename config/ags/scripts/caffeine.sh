#!/bin/bash

# caffeine.sh: A script to control system sleep using Scroll Lock key

if [ "$1" == "on" ]; then
    echo "Turning caffeine on. Preventing system sleep..."
    while true; do
        xdotool key Scroll_Lock
        sleep 55
    done &
    echo $! > /tmp/caffeine.pid
elif [ "$1" == "off" ]; then
    echo "Turning caffeine off. Allowing system sleep..."
    if [ -f /tmp/caffeine.pid ]; then
        kill $(cat /tmp/caffeine.pid)
        rm /tmp/caffeine.pid
    else
        echo "Caffeine is not running."
    fi
else
    echo "Usage: caffeine.sh {on|off}"
fi
