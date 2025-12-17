#!/usr/bin/env bash
set -e

BRIDGE="br0"
ETH="enp8s0"

BR_IP="192.168.1.111/24"
GW="192.168.1.1"
DNS="8.8.8.8"

echo "[*] 初始化桥接网络 $BRIDGE"

# 1. 创建 bridge（如果不存在）
if ! nmcli connection show "$BRIDGE" >/dev/null 2>&1; then
    echo "[+] 创建 bridge $BRIDGE"
    nmcli connection add type bridge ifname $BRIDGE con-name $BRIDGE
else
    echo "[=] bridge $BRIDGE 已存在"
fi

# 2. 设置 br0 静态 IP
echo "[+] 配置 $BRIDGE 静态 IP: $BR_IP"
nmcli connection modify $BRIDGE \
    ipv4.method manual \
    ipv4.addresses "$BR_IP" \
    ipv4.gateway "$GW" \
    ipv4.dns "$DNS" \
    ipv6.method ignore

# 3. 将有线网卡加入 bridge
SLAVE="bridge-slave-$ETH"
if ! nmcli connection show "$SLAVE" >/dev/null 2>&1; then
    echo "[+] 添加 $ETH 到 bridge $BRIDGE"
    nmcli connection add type bridge-slave ifname $ETH master $BRIDGE con-name $SLAVE
else
    echo "[=] $ETH 已是 bridge slave"
fi

# 4. 启动 bridge
nmcli connection up $BRIDGE || true

echo "[✓] bridge $BRIDGE 初始化完成"
