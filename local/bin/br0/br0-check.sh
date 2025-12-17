#!/usr/bin/env bash

echo "===== bridge ====="
ip a show br0

echo
echo "===== routes ====="
ip route

echo
echo "===== NAT ====="
iptables -t nat -L -n -v

echo
echo "===== FORWARD ====="
iptables -L FORWARD -n -v

echo
echo "===== devices ====="
nmcli device status
