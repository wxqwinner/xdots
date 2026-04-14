#!/usr/bin/env python3
"""
WeChat SNI tray icon proxy

启动顺序：必须在 Waybar 之前启动。
hyprland.conf：
  exec-once = ~/.local/bin/wechat-tray-proxy.py
  exec-once = waybar

功能：
  1. 接管 StatusNotifierWatcher，过滤原始 WeChat
  2. 代理 WeChat SNI，所有图标替换为自定义图标名
  3. 收到 NewIcon → 进入 NeedsAttention，持续闪烁（由 Waybar CSS animation 驱动）
     只有用户点击图标后才恢复 Active
"""

import sys
import time

import dbus
import dbus.mainloop.glib
import dbus.service
from gi.repository import GLib

# ── 配置 ──────────────────────────────────────────────────────────
CUSTOM_ICON = "com.tencent.WeChat.Patch"

# ── 常量 ──────────────────────────────────────────────────────────
WATCHER_BUS = "org.kde.StatusNotifierWatcher"
WATCHER_IFACE = "org.kde.StatusNotifierWatcher"
WATCHER_PATH = "/StatusNotifierWatcher"
PROPS_IFACE = "org.freedesktop.DBus.Properties"
SNI_IFACE = "org.kde.StatusNotifierItem"
PROXY_BUS = "com.tencent.WeChatProxy"
EMPTY_PIXMAP = dbus.Array([], signature="(iiay)")

ICON_PROPS = {
    "IconName",
    "AttentionIconName",
    "OverlayIconName",
    "IconPixmap",
    "AttentionIconPixmap",
    "OverlayIconPixmap",
}


# ══════════════════════════════════════════════════════════════════
# Watcher
# ══════════════════════════════════════════════════════════════════


class TrayWatcher(dbus.service.Object):

    def __init__(self, bus):
        self.bus = bus
        self._items = []
        self._hosts = []

        bus_name = dbus.service.BusName(WATCHER_BUS, bus)
        super().__init__(conn=bus, object_path=WATCHER_PATH, bus_name=bus_name)
        print("[watcher] acquired org.kde.StatusNotifierWatcher")

    @dbus.service.signal(WATCHER_IFACE, signature="s")
    def StatusNotifierItemRegistered(self, service):
        pass

    @dbus.service.signal(WATCHER_IFACE, signature="s")
    def StatusNotifierItemUnregistered(self, service):
        pass

    @dbus.service.signal(WATCHER_IFACE)
    def StatusNotifierHostRegistered(self):
        pass

    @dbus.service.method(
        WATCHER_IFACE,
        in_signature="s",
        out_signature="",
        sender_keyword="sender",
    )
    def RegisterStatusNotifierItem(self, service, sender=None):
        service = str(service)
        sender = str(sender) if sender else ""

        if service.startswith("/"):
            bus_name = sender
            service_full = f"{sender}{service}"
        elif "/" not in service:
            bus_name = service
            service_full = service
        else:
            bus_name = service.split("/")[0]
            service_full = service

        if not bus_name:
            print(f"[watcher] empty bus_name, skip: {service!r}")
            return

        if self._is_wechat(bus_name):
            print(f"[watcher] blocked wechat: {service_full!r}")
            self._watch_owner(bus_name, service_full, blocked=True)
            return

        if service_full not in self._items:
            self._items.append(service_full)
            print(f"[watcher] registered: {service_full!r}")
            self.StatusNotifierItemRegistered(service_full)
            self._watch_owner(bus_name, service_full)

    @dbus.service.method(WATCHER_IFACE, in_signature="s", out_signature="")
    def RegisterStatusNotifierHost(self, service):
        is_new = service not in self._hosts
        if is_new:
            self._hosts.append(service)
        self.StatusNotifierHostRegistered()
        print(
            f"[watcher] host {'registered' if is_new else 're-registered'}: {service!r}"
        )
        print(f"[watcher] announcing {len(self._items)} items")
        for item in list(self._items):
            self.StatusNotifierItemRegistered(item)

    def _is_wechat(self, bus_name):
        if bus_name == PROXY_BUS:
            return False
        try:
            obj = self.bus.get_object(bus_name, "/StatusNotifierItem")
            props = dbus.Interface(obj, PROPS_IFACE)
            title = str(props.Get(SNI_IFACE, "Title"))
            return "wechat" in title.lower() or "weixin" in title.lower()
        except Exception:
            return False

    def _watch_owner(self, bus_name, service, blocked=False):
        def on_owner_changed(new_owner):
            if new_owner:
                return
            if not blocked and service in self._items:
                self._items.remove(service)
                self.StatusNotifierItemUnregistered(service)
                print(f"[watcher] unregistered: {service!r}")

        self.bus.watch_name_owner(bus_name, on_owner_changed)

    @dbus.service.method(PROPS_IFACE, in_signature="ss", out_signature="v")
    def Get(self, iface, prop):
        if prop == "RegisteredStatusNotifierItems":
            return dbus.Array(self._items, signature="s")
        if prop == "IsStatusNotifierHostRegistered":
            return dbus.Boolean(bool(self._hosts))
        if prop == "ProtocolVersion":
            return dbus.Int32(0)
        raise dbus.exceptions.DBusException(f"Unknown property: {prop}")

    @dbus.service.method(PROPS_IFACE, in_signature="s", out_signature="a{sv}")
    def GetAll(self, iface):
        return {
            "RegisteredStatusNotifierItems": dbus.Array(self._items, signature="s"),
            "IsStatusNotifierHostRegistered": dbus.Boolean(bool(self._hosts)),
            "ProtocolVersion": dbus.Int32(0),
        }


# ══════════════════════════════════════════════════════════════════
# WeChat SNI Proxy
# ══════════════════════════════════════════════════════════════════


class WeChatProxy(dbus.service.Object):

    @dbus.service.signal(SNI_IFACE)
    def NewIcon(self):
        pass

    @dbus.service.signal(SNI_IFACE)
    def NewAttentionIcon(self):
        pass

    @dbus.service.signal(SNI_IFACE, signature="s")
    def NewStatus(self, status):
        pass

    def __init__(self, bus, real_name):
        self.bus = bus
        self.real_obj = bus.get_object(real_name, "/StatusNotifierItem")
        self.real_props = dbus.Interface(self.real_obj, PROPS_IFACE)
        self._status = "Active"

        proxy_name = dbus.service.BusName(PROXY_BUS, bus)
        super().__init__(
            conn=bus, object_path="/StatusNotifierItem", bus_name=proxy_name
        )

        self.real_obj.connect_to_signal(
            "NewIcon", self._on_new_icon, dbus_interface=SNI_IFACE
        )
        self.real_obj.connect_to_signal(
            "NewAttentionIcon", self._on_new_attention_icon, dbus_interface=SNI_IFACE
        )
        self.real_obj.connect_to_signal(
            "NewStatus", self._on_new_status, dbus_interface=SNI_IFACE
        )

        print(f"[proxy] ready, proxying {real_name!r}")

    def register_to(self, watcher):
        watcher.RegisterStatusNotifierItem(PROXY_BUS)
        print("[proxy] registered to watcher")

    # ── 信号处理 ──────────────────────────────────────────────────

    def _on_new_icon(self):
        # WeChat 有新消息时发 NewIcon+pixmap 触发闪烁
        # 我们进入 NeedsAttention，闪烁由 Waybar CSS animation 持续驱动
        # 不设超时——只有用户点击后才恢复 Active
        self.NewIcon()
        self._set_status("NeedsAttention")

    def _on_new_attention_icon(self):
        self.NewAttentionIcon()
        self._set_status("NeedsAttention")

    def _on_new_status(self, status):
        # WeChat 偶尔发 NewStatus，直接透传
        self._set_status(str(status))

    def _set_status(self, status):
        if status != self._status:
            print(f"[proxy] status: {self._status!r} -> {status!r}")
            self._status = status
            self.NewStatus(status)

    # ── 属性拦截 ──────────────────────────────────────────────────

    def _patch(self, props):
        for k in ICON_PROPS:
            if k not in props:
                continue
            props[k] = EMPTY_PIXMAP if k.endswith("Pixmap") else CUSTOM_ICON
        props["Status"] = self._status
        return props

    @dbus.service.method(PROPS_IFACE, in_signature="ss", out_signature="v")
    def Get(self, iface, prop):
        if prop in ICON_PROPS:
            return EMPTY_PIXMAP if prop.endswith("Pixmap") else CUSTOM_ICON
        if prop == "Status":
            return self._status
        return self.real_props.Get(iface, prop)

    @dbus.service.method(PROPS_IFACE, in_signature="s", out_signature="a{sv}")
    def GetAll(self, iface):
        return self._patch(dict(self.real_props.GetAll(iface)))

    # ── 交互转发 ──────────────────────────────────────────────────

    @dbus.service.method(SNI_IFACE, in_signature="ii", out_signature="")
    def Activate(self, x, y):
        # 用户点击 → 清除未读状态
        self._set_status("Active")
        dbus.Interface(self.real_obj, SNI_IFACE).Activate(x, y)

    @dbus.service.method(SNI_IFACE, in_signature="ii", out_signature="")
    def SecondaryActivate(self, x, y):
        dbus.Interface(self.real_obj, SNI_IFACE).SecondaryActivate(x, y)


# ══════════════════════════════════════════════════════════════════
# Main
# ══════════════════════════════════════════════════════════════════


def find_wechat(bus):
    for name in [str(n) for n in bus.list_names() if "StatusNotifierItem" in str(n)]:
        try:
            obj = bus.get_object(name, "/StatusNotifierItem")
            props = dbus.Interface(obj, PROPS_IFACE)
            title = str(props.Get(SNI_IFACE, "Title"))
            if (
                "wechat" in title.lower()
                or "weixin" in title.lower()
                or "微信" in title
            ):
                print(f"[main] found wechat: {name!r}")
                return name
        except Exception:
            pass
    return None


def main():
    dbus.mainloop.glib.DBusGMainLoop(set_as_default=True)
    bus = dbus.SessionBus()

    watcher = TrayWatcher(bus)

    print("[main] waiting for WeChat...")
    real_name = None
    for _ in range(60):
        real_name = find_wechat(bus)
        if real_name:
            break
        time.sleep(1)

    if not real_name:
        print("[main] WeChat not found after 60s, exiting")
        sys.exit(1)

    proxy = WeChatProxy(bus, real_name)
    proxy.register_to(watcher)

    GLib.MainLoop().run()


if __name__ == "__main__":
    main()
