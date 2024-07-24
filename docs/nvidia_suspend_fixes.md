# nvidia suspend fixes

我的环境
发行版 archlinux
桌面或其他 hyprland / gnome(wayland)
显卡 rtx 2060 
驱动版本 NVIDIA-SMI 555.58.02
内核版本 Linux arch 6.9.8-arch1-1

1.  Create file /etc/modprobe.d/nvidia.conf with the following contents
    ```conf
    options nvidia_drm modeset=1
    options nvidia_drm fbdev=1
    options nvidia NVreg_EnableGpuFirmware=0
    options nvidia NVreg_PreserveVideoMemoryAllocations=1 NVreg_TemporaryFilePath=/var/tmp
    ```

    Warning
    Ensure /var/tmp has enough space to store your temporary file (total VRAM of all cards + 5% margin)

2.  Edit /etc/default/grub and add the following lines inside line GRUB_CMDLINE_LINUX_DEFAULT as followed:

    第二步骤和第一步重复了，但是我忘了用啥命令更新了
    ```conf
    nvidia.NVreg_PreserveVideoMemoryAllocations=1 nvidia.NVreg_EnableGpuFirmware=0
    ```
    so for example it should look something like this: GRUB_CMDLINE_LINUX_DEFAULT="nowatchdog quiet nvidia.NVreg_PreserveVideoMemoryAllocations=1 nvidia.NVreg_EnableGpuFirmware=0 nvme_load=YES nvidia_drm.modeset=1 loglevel=3 nvidia-drm.modeset=1"

    update grub
    ```bash
    sudo grub-mkconfig -o /boot/grub/grub.cfg
    ```

3.  启用相关服务
sudo systemctl enable nvidia-suspend.service
sudo systemctl enable nvidia-hibernate.service
sudo systemctl enable nvidia-resume.service

4.  重启

## references

1.  https://gist.github.com/jstarcher/abdac9c2c0b5de8b073d527870b73a19