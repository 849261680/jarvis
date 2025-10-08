import os
import sys
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types
from tools import create_md_file, update_md_file, read_md_file


def load_system_prompts(path="system_prompts"):
    """加载角色提示词 | 输入: 文件夹路径 | 输出: 角色字典"""
    if not os.path.exists(path):
        return {}

    prompts = {}
    i = 1
    for filename in os.listdir(path):
        if filename.endswith(".md"):
            role = filename[:-3]
            with open(os.path.join(path, filename), "r", encoding="utf-8") as f:
                prompts[str(i)] = {"name": role, "prompt": f.read().strip()}
            i += 1
    return prompts


def save_log(log_file, role, text):
    """保存对话日志 | 输入: 文件路径,角色,内容 | 输出: 写入文件"""
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(f"{role}: {text}\n\n")


def chat(api_key, model, system_prompt, role_name):
    """对话循环 | 输入: API密钥,模型,提示词,角色名 | 输出: 交互式聊天"""
    client = genai.Client(api_key=api_key)
    history = []
    MAX_HISTORY = 20
    os.makedirs("chat_history", exist_ok=True)
    log_file = f"chat_history/chat_{role_name}.md"

    tools = [
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(
                    name="create_md_file",
                    description="创建或覆盖用户的每日活动日志MD文件，用于记录当天的活动、反思和总结",
                    parameters={
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "日期，格式 YYYY-MM-DD，默认为今天"
                            },
                            "content": {
                                "type": "string",
                                "description": "日志内容，应包含活动记录、时长、分类等结构化信息"
                            }
                        },
                        "required": ["date", "content"]
                    }
                ),
                types.FunctionDeclaration(
                    name="update_md_file",
                    description="追加内容到已有的日志MD文件中，用于补充记录",
                    parameters={
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "日期，格式 YYYY-MM-DD"
                            },
                            "content": {
                                "type": "string",
                                "description": "要追加的内容"
                            }
                        },
                        "required": ["date", "content"]
                    }
                ),
                types.FunctionDeclaration(
                    name="read_md_file",
                    description="读取指定日期的日志MD文件内容",
                    parameters={
                        "type": "object",
                        "properties": {
                            "date": {
                                "type": "string",
                                "description": "日期，格式 YYYY-MM-DD"
                            }
                        },
                        "required": ["date"]
                    }
                )
            ]
        )
    ]

    print(f"[{role_name}] ChatBot 已启动，输入 'quit' 退出.")

    while True:
        try:
            user_input = input("你: ").strip()
            if user_input.lower() in {"quit", "exit", "bye", "退出"}:
                print("再见.")
                break
            if not user_input:
                continue

            history.append(types.Content(role="user", parts=[types.Part(text=user_input)]))
            save_log(log_file, "user", user_input)

            if len(history) > MAX_HISTORY:
                history = history[-MAX_HISTORY:]

            config = types.GenerateContentConfig(
                system_instruction=system_prompt,
                tools=tools,
                thinking_config=types.ThinkingConfig(thinking_budget=128),
            )

            response = ""
            first_chunk = True
            try:
                for chunk in client.models.generate_content_stream(
                    model=model, contents=history, config=config
                ):
                    if chunk.candidates and len(chunk.candidates) > 0:
                        candidate = chunk.candidates[0]
                        if candidate.content and candidate.content.parts:
                            for part in candidate.content.parts:
                                if part.text:
                                    if first_chunk:
                                        print(f"{role_name}: ", end="", flush=True)
                                        first_chunk = False
                                    print(part.text, end="", flush=True)
                                    response += part.text
                                elif part.function_call:
                                    func_name = part.function_call.name
                                    func_args = dict(part.function_call.args)

                                    print(f"\n[调用工具: {func_name}]", flush=True)

                                    if func_name == "create_md_file":
                                        result = create_md_file(func_args["date"], func_args["content"])
                                        func_response = f"已创建文件: {result}"
                                        print(f"[文件已创建: {result}]", flush=True)
                                    elif func_name == "update_md_file":
                                        result = update_md_file(func_args["date"], func_args["content"])
                                        func_response = f"已更新文件: {result}"
                                        print(f"[文件已更新: {result}]", flush=True)
                                    elif func_name == "read_md_file":
                                        result = read_md_file(func_args["date"])
                                        func_response = result if result else "文件不存在"
                                        print(f"[文件已读取]", flush=True)

                                    history.append(types.Content(
                                        role="model",
                                        parts=[types.Part(function_call=part.function_call)]
                                    ))
                                    history.append(types.Content(
                                        role="user",
                                        parts=[types.Part(function_response=types.FunctionResponse(
                                            name=func_name,
                                            response={"result": func_response}
                                        ))]
                                    ))

                                    for chunk2 in client.models.generate_content_stream(
                                        model=model, contents=history, config=config
                                    ):
                                        if chunk2.text:
                                            if first_chunk:
                                                print(f"{role_name}: ", end="", flush=True)
                                                first_chunk = False
                                            print(chunk2.text, end="", flush=True)
                                            response += chunk2.text
            except Exception as e:
                print(f"\n[错误] {e}")

            if response:
                history.append(types.Content(role="model", parts=[types.Part(text=response)]))
                save_log(log_file, role_name, response)

            print()

        except (KeyboardInterrupt, EOFError):
            print("\n退出.")
            break


def main():
    """主函数 | 输入: 环境变量和用户选择 | 输出: 启动程序"""
    load_dotenv()
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("错误: 未设置 GEMINI_API_KEY")
        sys.exit(1)

    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro")

    prompts = load_system_prompts()
    if not prompts:
        prompts = {"1": {"name": "默认助手", "prompt": "你是一个简洁高效的 AI 助手"}}

    print("可选角色:")
    for k, v in prompts.items():
        print(f"{k}. {v['name']}")
    print(f"{len(prompts) + 1}. 无系统提示词")

    choice = input("选择角色: ").strip()
    if choice in prompts:
        role_name, system_prompt = prompts[choice]["name"], prompts[choice]["prompt"]
    elif choice == str(len(prompts) + 1):
        role_name, system_prompt = "无角色", None
    else:
        role_name, system_prompt = "默认", None

    chat(api_key, model, system_prompt, role_name)


if __name__ == "__main__":
    main()
