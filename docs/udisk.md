#udisk

U盘写文件进度条不真实
每次都要sudo ntfsfix -d /dev/sdc1

sudo nano /etc/udev/rules.d/99-ntfs-sync.rules

ENV{ID_FS_TYPE}=="ntfs", ENV{UDISKS_MOUNT_OPTIONS_DEFAULTS}="sync,flush"

sudo udevadm control --reload
sudo udevadm trigger

sudo nano /usr/local/bin/auto-ntfsfix.sh

#!/bin/bash

DEV="$1"

[[ "$DEV" =~ [0-9]$ ]] || exit 0

FS_TYPE=$(blkid -o value -s TYPE "$DEV" 2>/dev/null)
[ "$FS_TYPE" = "ntfs" ] || exit 0

mount | grep -q "^$DEV " && exit 0

/usr/bin/ntfsfix -d "$DEV" >/dev/null 2>&1

sudo chmod +x /usr/local/bin/auto-ntfsfix.sh

sudo nano /etc/udev/rules.d/98-ntfsfix.rules
ACTION=="add", SUBSYSTEM=="block", ENV{DEVTYPE}=="partition", RUN+="/usr/local/bin/auto-ntfsfix.sh %E{DEVNAME}"
sudo udevadm control --reload
sudo udevadm trigger
