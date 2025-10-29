#!/usr/bin/env python3
import os
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from collections import Counter

# # 重新加载用户级 systemd 配置
# systemctl --user daemon-reload

# # 启用定时器开机自启
# systemctl --user enable update_bookmarks.timer

# # 立即启动定时器
# systemctl --user start update_bookmarks.timer

# # 查看状态
# systemctl --user status update_bookmarks.timer


BOOKMARK_FILE = os.path.expanduser("~/.config/gtk-3.0/bookmarks")
RECENT_FILE = os.path.expanduser("~/.local/share/recently-used.xbel")
TOP_N = 5
INIT = "--init" in sys.argv
MERGE_LEVEL = 3  # 合并前几级目录
AUTO_PREFIX = "⭐"  # 特殊符号前缀
RECENT_LIMIT = 10
FILTER_DIRS = ["Downloads"]

# 检查 recently-used.xbel 是否存在
if not os.path.isfile(RECENT_FILE):
    print("未找到 recently-used.xbel，跳过书签更新")
    sys.exit(0)

# 提取所有文件路径的目录
dirs = []
tree = ET.parse(RECENT_FILE)
root = tree.getroot()
for bookmark in root.findall(".//bookmark"):
    href = bookmark.get("href")
    if href and href.startswith("file://"):
        path = urllib.parse.unquote(href[7:])  # 去掉 file:// 并解码 URI
        dir_path = path if os.path.isdir(path) else os.path.dirname(path)
        if os.path.isdir(dir_path):
            dirs.append(dir_path)


# # 合并目录层级~/.config/gtk-3.0/bookmarks
# def merge_dir(path, level=3):
#     parts = path.strip("/").split("/")
#     merged = (
#         "/" + "/".join(parts[:level]) if len(parts) >= level else "/" + "/".join(parts)
#     )
#     return merged


# merged_dirs = [merge_dir(os.path.dirname(p), MERGE_LEVEL) for p in dirs]

# 统计访问次数最多的 TOP_N 个目录
# counter = Counter(merged_dirs)
dirs = [d for d in dirs if not any(f in d for f in FILTER_DIRS)]
dirs = dirs[-RECENT_LIMIT:]
counter = Counter(dirs)
top_items = counter.most_common(TOP_N)
top_items = sorted(top_items, key=lambda x: os.path.basename(x[0]).lower())
top_dirs = [f"file://{d} {AUTO_PREFIX} {os.path.basename(d)}" for d, _ in top_items]

# 确保书签文件目录存在
os.makedirs(os.path.dirname(BOOKMARK_FILE), exist_ok=True)

# 如果书签文件不存在，创建空文件
if not os.path.isfile(BOOKMARK_FILE):
    open(BOOKMARK_FILE, "w").close()

# 读取原书签
with open(BOOKMARK_FILE, "r", encoding="utf-8") as f:
    bookmarks = [line.strip() for line in f if line.strip()]

# 删除旧的自动标记行
bookmarks = [b for b in bookmarks if "⭐" not in b]

bookmarks = top_dirs + [""] + bookmarks
print(f"已更新书签顶部 {TOP_N} 个最近访问目录")

# 写回文件
with open(BOOKMARK_FILE, "w", encoding="utf-8") as f:
    for line in bookmarks:
        f.write(line + "\n")

for line in bookmarks:
    print(line)
