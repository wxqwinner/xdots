#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path

SCRIPT_PATH = Path.home() / ".config/waybar/scripts/daily_tasks.py"


def show_menu_wofi():
    """使用 wofi 显示菜单"""
    # 获取任务列表
    result = subprocess.run([SCRIPT_PATH, "list"], capture_output=True, text=True)
    tasks = result.stdout.strip().split("\n")

    # 构建菜单
    menu_items = []
    for task in tasks:
        if task:
            num, status, text, done = task.split("|")
            menu_items.append(f"{status} {text}||{num}")

    menu_items.append("---||separator")
    menu_items.append("✏️  编辑任务||edit")
    menu_items.append("🔄 刷新||refresh")

    menu_text = "\n".join([item.split("||")[0] for item in menu_items])

    # 显示 wofi 菜单
    try:
        result = subprocess.run(
            ["wofi", "--dmenu", "--prompt", "今日三件事", "--lines", "6", "-i"],
            input=menu_text,
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            selection = result.stdout.strip()
            # 找到对应的操作
            for item in menu_items:
                display, action = item.split("||")
                if display == selection:
                    handle_action(action)
                    break
    except FileNotFoundError:
        print("请安装 wofi: sudo pacman -S wofi", file=sys.stderr)
        sys.exit(1)


def show_menu_rofi():
    """使用 rofi 显示菜单"""
    result = subprocess.run([SCRIPT_PATH, "list"], capture_output=True, text=True)
    tasks = result.stdout.strip().split("\n")

    menu_items = []
    for task in tasks:
        if task:
            num, status, text, done = task.split("|")
            menu_items.append(f"{status} {text}||{num}")

    menu_items.append("---||separator")
    menu_items.append("✏️  编辑任务||edit")
    menu_items.append("🔄 刷新||refresh")

    menu_text = "\n".join([item.split("||")[0] for item in menu_items])

    try:
        result = subprocess.run(
            ["rofi", "-dmenu", "-p", "今日三件事", "-i", "-lines", "6"],
            input=menu_text,
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            selection = result.stdout.strip()
            for item in menu_items:
                display, action = item.split("||")
                if display == selection:
                    handle_action(action)
                    break
    except FileNotFoundError:
        print("请安装 rofi: sudo pacman -S rofi", file=sys.stderr)
        sys.exit(1)


def handle_action(action):
    """处理菜单选择"""
    if action.isdigit():
        # 切换任务状态
        subprocess.run([SCRIPT_PATH, "toggle", action])
        refresh_waybar()
    elif action == "edit":
        edit_tasks()
    elif action == "refresh":
        refresh_waybar()


def edit_tasks():
    """编辑任务"""
    result = subprocess.run([SCRIPT_PATH, "list"], capture_output=True, text=True)
    tasks = result.stdout.strip().split("\n")

    current_tasks = []
    for task in tasks:
        if task:
            _, _, text, _ = task.split("|")
            current_tasks.append(text)

    # 使用 zenity 编辑
    try:
        result = subprocess.run(
            [
                "zenity",
                "--forms",
                "--title=今日三件事",
                "--text=设置今天要完成的三件事",
                "--add-entry=任务 1",
                "--add-entry=任务 2",
                "--add-entry=任务 3",
                "--separator=|",
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode == 0:
            new_tasks = result.stdout.strip().split("|")
            for i, text in enumerate(new_tasks, 1):
                if text.strip():
                    subprocess.run([SCRIPT_PATH, "update", str(i), text.strip()])
            refresh_waybar()
    except FileNotFoundError:
        # 如果没有 zenity，使用简单的文本编辑器
        print("请安装 zenity 或使用命令行编辑", file=sys.stderr)


def refresh_waybar():
    """刷新 Waybar"""
    subprocess.run(["pkill", "-RTMIN+8", "waybar"])


def main():
    # 优先使用 wofi，其次使用 rofi
    if subprocess.run(["which", "wofi"], capture_output=True).returncode == 0:
        show_menu_wofi()
    elif subprocess.run(["which", "rofi"], capture_output=True).returncode == 0:
        show_menu_rofi()
    else:
        print("请安装 wofi 或 rofi", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
