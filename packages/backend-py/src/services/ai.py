"""
AI 服务模块
处理与 Google Gemini API 的交互
"""

import os
from typing import Any

import google.generativeai as genai

from ..prompts.system import get_system_prompt
from .file_tools import FILE_TOOLS, execute_file_tool


class AIService:
    """AI 服务类"""

    def __init__(self, api_key: str, model: str = "gemini-pro"):
        """
        初始化 AI 服务

        参数:
            api_key: Google API Key
            model: 模型名称
        """
        # 配置代理
        proxy = os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY")
        if proxy:
            os.environ["HTTP_PROXY"] = proxy
            os.environ["HTTPS_PROXY"] = proxy
            print(f"使用代理: {proxy}")

        genai.configure(api_key=api_key)
        self.model_name = model
        self.log_created = False

    async def chat(self, user_message: str, history: list[dict[str, str]] = None) -> dict[str, Any]:
        """
        处理聊天请求

        参数:
            user_message: 用户消息
            history: 聊天历史 [{"role": "user/assistant", "content": "..."}]

        返回:
            Dict: {"message": "回复内容", "logCreated": bool}
        """
        if history is None:
            history = []

        self.log_created = False

        # 获取今天的日期和路径
        from datetime import date

        today = date.today().isoformat()
        year, month = today.split("-")[:2]
        today_log_path = f"logs/{year}/{month}/{today}.md"

        # 获取系统提示
        system_prompt = get_system_prompt(today, today_log_path)

        # 转换历史记录格式
        chat_history = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            chat_history.append({"role": role, "parts": [msg["content"]]})

        try:
            # 创建模型实例
            model = genai.GenerativeModel(
                model_name=self.model_name,
                tools=FILE_TOOLS,
                system_instruction=system_prompt,
            )

            # 开始聊天
            chat = model.start_chat(history=chat_history)
            response = chat.send_message(user_message)

            # 处理工具调用（最多5轮）
            max_rounds = 5
            while max_rounds > 0 and response.candidates[0].content.parts:
                function_calls = []

                # 提取函数调用
                for part in response.candidates[0].content.parts:
                    if hasattr(part, "function_call") and part.function_call:
                        function_calls.append(part.function_call)

                if not function_calls:
                    break

                print(
                    f"🔧 工具调用: {[{'name': fc.name, 'args': dict(fc.args)} for fc in function_calls]}"
                )

                # 执行工具
                function_responses = []
                for fc in function_calls:
                    tool_result = await execute_file_tool(fc.name, dict(fc.args))
                    print(f"✅ {fc.name} 结果: {tool_result}")

                    # 检查是否创建/更新了日志
                    if fc.name in ["create_md_file", "edit_md_file"]:
                        self.log_created = True

                    function_responses.append(
                        genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=fc.name, response={"result": tool_result}
                            )
                        )
                    )

                # 发送工具响应
                response = chat.send_message(function_responses)
                max_rounds -= 1

            # 获取最终文本
            text = response.text if response.text else ""

            if not text.strip():
                print("AIService.chat: empty response")
                return {
                    "message": "抱歉老大，我暂时没有获取到有效回复，请稍后再试。",
                    "logCreated": False,
                }

            return {"message": text, "logCreated": self.log_created}

        except Exception as e:
            print(f"AIService.chat: 调用失败 {type(e).__name__}: {str(e)}")
            return {
                "message": "抱歉老大，我暂时无法连接到 AI 服务，请稍后再试。",
                "logCreated": False,
            }
