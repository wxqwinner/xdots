#!/bin/bash

DEV="$1"

[[ "$DEV" =~ [0-9]$ ]] || exit 0

FS_TYPE=$(blkid -o value -s TYPE "$DEV" 2>/dev/null)
[ "$FS_TYPE" = "ntfs" ] || exit 0

mount | grep -q "^$DEV " && exit 0

/usr/bin/ntfsfix -d "$DEV" >/dev/null 2>&1
