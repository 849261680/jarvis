"""
文件工具模块
提供 Markdown 文件的读写操作
"""

import os
from pathlib import Path
from typing import Any

# 工具定义
FILE_TOOLS = [
    {
        "function_declarations": [
            {
                "name": "read_md_file",
                "description": "读取指定路径的Markdown文件内容",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "要读取的MD文件路径（相对于项目根目录）",
                        }
                    },
                    "required": ["path"],
                },
            },
            {
                "name": "create_md_file",
                "description": "创建新的Markdown文件",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "要创建的MD文件路径（相对于项目根目录）",
                        },
                        "content": {"type": "string", "description": "文件内容"},
                    },
                    "required": ["path", "content"],
                },
            },
            {
                "name": "edit_md_file",
                "description": "编辑已存在的Markdown文件内容",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "要编辑的MD文件路径（相对于项目根目录）",
                        },
                        "content": {
                            "type": "string",
                            "description": "新的文件内容（会完全替换原内容）",
                        },
                    },
                    "required": ["path", "content"],
                },
            },
        ]
    }
]


async def execute_file_tool(tool_name: str, args: dict[str, Any]) -> str:
    """
    执行文件工具

    参数:
        tool_name: 工具名称
        args: 工具参数

    返回:
        str: 执行结果消息
    """
    base_path = os.getcwd()
    file_path = os.path.join(base_path, args["path"])

    try:
        if tool_name == "read_md_file":
            if not os.path.exists(file_path):
                return f"错误：文件 {args['path']} 不存在"
            with open(file_path, encoding="utf-8") as f:
                return f.read()

        elif tool_name == "create_md_file":
            if os.path.exists(file_path):
                return f"错误：文件 {args['path']} 已存在，请使用 edit_md_file 进行编辑"
            Path(file_path).parent.mkdir(parents=True, exist_ok=True)
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(args["content"])
            return f"成功创建文件 {args['path']}"

        elif tool_name == "edit_md_file":
            if not os.path.exists(file_path):
                return f"错误：文件 {args['path']} 不存在，请使用 create_md_file 创建"
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(args["content"])
            return f"成功编辑文件 {args['path']}"

        else:
            return f"未知工具：{tool_name}"

    except Exception as e:
        return f"执行工具时出错：{str(e)}"
