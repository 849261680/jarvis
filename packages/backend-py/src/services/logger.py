"""
日志服务模块
管理日志文件的创建、更新和读取
"""

import os
from pathlib import Path
from typing import Any


class LoggerService:
    """日志服务类"""

    def __init__(self, base_dir: str = "logs"):
        """
        初始化日志服务

        参数:
            base_dir: 日志文件的基础目录
        """
        self.base_dir = base_dir

    async def create_log(self, date: str, content: str) -> str:
        """
        创建新日志

        参数:
            date: 日期 (YYYY-MM-DD)
            content: 日志内容

        返回:
            str: 创建的文件路径
        """
        year, month, _ = date.split("-")
        dir_path = os.path.join(self.base_dir, year, month)
        Path(dir_path).mkdir(parents=True, exist_ok=True)

        file_path = os.path.join(dir_path, f"{date}.md")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"# {date}\n\n{content}")

        return file_path

    async def update_log(self, date: str, content: str) -> str:
        """
        更新已存在的日志

        参数:
            date: 日期 (YYYY-MM-DD)
            content: 要追加的内容

        返回:
            str: 文件路径
        """
        year, month, _ = date.split("-")
        file_path = os.path.join(self.base_dir, year, month, f"{date}.md")

        try:
            with open(file_path, "a", encoding="utf-8") as f:
                f.write(f"\n{content}")
            return file_path
        except FileNotFoundError:
            return await self.create_log(date, content)

    async def read_log(self, date: str) -> str | None:
        """
        读取指定日期的日志

        参数:
            date: 日期 (YYYY-MM-DD)

        返回:
            Optional[str]: 日志内容，不存在则返回 None
        """
        year, month, _ = date.split("-")
        file_path = os.path.join(self.base_dir, year, month, f"{date}.md")

        try:
            with open(file_path, encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return None

    async def list_logs(self) -> list[dict[str, Any]]:
        """
        列出所有日志文件

        返回:
            List[Dict]: 日志文件树形结构
        """
        year_map: dict[str, dict[str, list[dict[str, Any]]]] = {}

        try:
            if not os.path.exists(self.base_dir):
                return []

            entries = os.listdir(self.base_dir)

            for entry in entries:
                entry_path = os.path.join(self.base_dir, entry)

                # 处理年份目录
                if os.path.isdir(entry_path):
                    months = os.listdir(entry_path)

                    for month in months:
                        month_path = os.path.join(entry_path, month)

                        if os.path.isdir(month_path):
                            log_files = os.listdir(month_path)

                            for file in log_files:
                                if file.endswith(".md"):
                                    if entry not in year_map:
                                        year_map[entry] = {}
                                    if month not in year_map[entry]:
                                        year_map[entry][month] = []

                                    year_map[entry][month].append(
                                        {
                                            "name": file,
                                            "path": f"{entry}/{month}/{file}",
                                            "type": "file",
                                        }
                                    )

                # 处理平铺的文件
                elif entry.endswith(".md"):
                    parts = entry.replace(".md", "").split("-")
                    if len(parts) == 3:
                        year, month = parts[0], parts[1]
                        if year not in year_map:
                            year_map[year] = {}
                        if month not in year_map[year]:
                            year_map[year][month] = []

                        year_map[year][month].append({"name": entry, "path": entry, "type": "file"})

            # 构建树形结构
            result = []
            for year in sorted(year_map.keys(), reverse=True):
                year_node = {
                    "name": year,
                    "path": year,
                    "type": "directory",
                    "children": [],
                }

                for month in sorted(year_map[year].keys(), reverse=True):
                    files = sorted(year_map[year][month], key=lambda x: x["name"], reverse=True)
                    month_node = {
                        "name": month,
                        "path": f"{year}/{month}",
                        "type": "directory",
                        "children": files,
                    }
                    year_node["children"].append(month_node)

                result.append(year_node)

            return result

        except Exception as e:
            print(f"List logs error: {e}")
            return []
