# br0
桥接网络，使用有线网卡桥接网络，确保物理机和虚拟机始终在一个局域网下，另外用wifi上无线网时，将wifi和br0放在nat下就可以了。

这里使用的是[text](../../../etc/NetworkManager/dispatcher.d/90-br0-auto-nat)，当前目录的脚本只有安装[text](br0-setup-once.sh) 用了

另外br0配置了静态ip，虚拟机也使用静态ip，配置如下

物理机
BR_IP="192.168.1.111/24"
GW="192.168.1.1"
DNS="8.8.8.8"

虚拟机
win10
IP:      192.168.1.113
Mask:    255.255.255.0
Gateway: 192.168.1.111
DNS:     8.8.8.8

win7
IP:      192.168.1.112
Mask:    255.255.255.0
Gateway: 192.168.1.111
DNS:     8.8.8.8
