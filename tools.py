import os
from datetime import datetime


def create_md_file(date, content):
    """创建日志 MD 文件 | 输入: 日期,内容 | 输出: 文件路径"""
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    year = date_obj.strftime("%Y")
    month = date_obj.strftime("%m")

    dir_path = f"life_logs/{year}/{month}"
    os.makedirs(dir_path, exist_ok=True)

    file_path = f"{dir_path}/{date}.md"

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(f"# {date}\n\n")
        f.write(content)

    return file_path


def update_md_file(date, content):
    """更新已有 MD 文件 | 输入: 日期,追加内容 | 输出: 文件路径"""
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    year = date_obj.strftime("%Y")
    month = date_obj.strftime("%m")

    file_path = f"life_logs/{year}/{month}/{date}.md"

    if not os.path.exists(file_path):
        return create_md_file(date, content)

    with open(file_path, "a", encoding="utf-8") as f:
        f.write(f"\n{content}")

    return file_path


def read_md_file(date):
    """读取 MD 文件 | 输入: 日期 | 输出: 文件内容"""
    date_obj = datetime.strptime(date, "%Y-%m-%d")
    year = date_obj.strftime("%Y")
    month = date_obj.strftime("%m")

    file_path = f"life_logs/{year}/{month}/{date}.md"

    if not os.path.exists(file_path):
        return None

    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()
