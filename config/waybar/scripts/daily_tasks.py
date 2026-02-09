#!/usr/bin/env python3
import json
import os
import sys
from datetime import datetime
from pathlib import Path

DATA_FILE = Path.home() / ".config/waybar/daily-tasks.json"
TODAY = datetime.now().strftime("%Y-%m-%d")


class DailyTasks:
    def __init__(self):
        self.data_file = DATA_FILE
        self.today = TODAY
        self.init_data()

    def init_data(self):
        """初始化或重置每日数据"""
        if not self.data_file.exists() or self.get_date() != self.today:
            self.data = {
                "date": self.today,
                "tasks": [
                    {"text": "任务 1", "done": False},
                    {"text": "任务 2", "done": False},
                    {"text": "任务 3", "done": False},
                ],
            }
            self.save_data()
        else:
            self.load_data()

    def load_data(self):
        """加载数据"""
        with open(self.data_file, "r", encoding="utf-8") as f:
            self.data = json.load(f)

    def save_data(self):
        """保存数据"""
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)

    def get_date(self):
        """获取数据文件中的日期"""
        if self.data_file.exists():
            with open(self.data_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("date", "")
        return ""

    def get_remaining(self):
        """获取未完成任务数"""
        return sum(1 for task in self.data["tasks"] if not task["done"])

    def get_done_count(self):
        """获取已完成任务数"""
        return sum(1 for task in self.data["tasks"] if task["done"])

    def toggle_task(self, index):
        """切换任务完成状态"""
        if 0 <= index < len(self.data["tasks"]):
            self.data["tasks"][index]["done"] = not self.data["tasks"][index]["done"]
            self.save_data()

    def update_task(self, index, text):
        """更新任务文本"""
        if 0 <= index < len(self.data["tasks"]):
            self.data["tasks"][index]["text"] = text
            self.save_data()

    def output_waybar(self):
        """输出 Waybar JSON 格式"""
        remaining = self.get_remaining()
        done_count = self.get_done_count()
        current_time = datetime.now().strftime("%H:%M")

        # 根据完成情况选择图标
        if remaining == 0:
            icon = "✓"
            css_class = "completed"
        elif done_count > 0:
            icon = "📝"
            css_class = "in-progress"
        else:
            icon = "📋"
            css_class = "not-started"

        # 生成美化的 tooltip
        tooltip_lines = []
        tooltip_lines.append(f"╭─ 📅 今日三件事 ─╮")
        tooltip_lines.append(f"│ {self.today} {current_time} │")
        tooltip_lines.append(f"╰{'─' * 20}╯")
        tooltip_lines.append("")

        for i, task in enumerate(self.data["tasks"], 1):
            if task["done"]:
                status = "✅"
            else:
                status = "⬜"

            # 限制任务文本长度，避免 tooltip 过宽
            text = task["text"][:30] + "..." if len(task["text"]) > 30 else task["text"]
            tooltip_lines.append(f"{status} {i}. {text}")

        tooltip_lines.append("")

        # 进度条
        progress_bar = "█" * done_count + "░" * remaining
        tooltip_lines.append(f"进度: [{progress_bar}] {done_count * 100 // 3}%")

        # 根据时间和进度显示提示
        hour = datetime.now().hour
        if remaining == 0:
            tooltip_lines.append("🎉 太棒了！全部完成！")
        elif hour < 12:
            tooltip_lines.append("☀️ 早安！今天也要加油哦")
        elif hour < 18:
            tooltip_lines.append(f"💪 已完成 {done_count} 件，继续保持")
        else:
            tooltip_lines.append(f"🌙 还剩 {remaining} 件，加把劲")

        tooltip = "\n".join(tooltip_lines)

        output = {
            "text": f"{icon} {done_count}/3",
            "tooltip": tooltip,
            "class": css_class,
            "percentage": done_count * 33,
        }

        print(json.dumps(output, ensure_ascii=False))


def main():
    tasks = DailyTasks()

    if len(sys.argv) == 1:
        tasks.output_waybar()
    elif sys.argv[1] == "toggle" and len(sys.argv) > 2:
        index = int(sys.argv[2]) - 1
        tasks.toggle_task(index)
        tasks.output_waybar()
    elif sys.argv[1] == "update" and len(sys.argv) > 3:
        index = int(sys.argv[2]) - 1
        text = sys.argv[3]
        tasks.update_task(index, text)
        tasks.output_waybar()
    elif sys.argv[1] == "list":
        for i, task in enumerate(tasks.data["tasks"], 1):
            status = "✓" if task["done"] else "○"
            print(f"{i}|{status}|{task['text']}|{task['done']}")


if __name__ == "__main__":
    main()
