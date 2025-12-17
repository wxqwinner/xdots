#!/usr/bin/env bash
set -e

BRIDGE="br0"
WIFI="wlan0"

echo "[*] br0 auto NAT check..."

# 确保开启转发
sysctl -w net.ipv4.ip_forward=1 >/dev/null

# 清理旧 NAT（避免重复）
iptables -t nat -D POSTROUTING -o $WIFI -j MASQUERADE 2>/dev/null || true

# 检查 Wi-Fi 是否已连接
WIFI_STATE=$(nmcli -t -f DEVICE,STATE dev | grep "^$WIFI:" | cut -d: -f2)

if [[ "$WIFI_STATE" == "connected" ]]; then
    echo "[+] Wi-Fi 已连接，启用 NAT： $BRIDGE -> $WIFI"
    iptables -t nat -A POSTROUTING -o $WIFI -j MASQUERADE
else
    echo "[+] Wi-Fi 未连接，使用有线桥接直通（不启用 NAT）"
fi

echo "[✓] 网络状态处理完成"
