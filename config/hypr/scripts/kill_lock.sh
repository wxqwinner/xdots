#!/bin/bash

pids=$(ps aux | grep "[h]yprlock" | awk '{print $2}')
ps aux | grep "[h]yprlock"
if [ -z "$pids" ]; then
  echo "No hyprlock processes found."
else
  for pid in $pids; do
    echo "Found hyprlock process with PID $pid. Killing it..."
    kill -9 "$pid"
  done
  echo "All hyprlock processes have been killed."
fi