import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import types


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
                thinking_config=types.ThinkingConfig(thinking_budget=128),
            )

            response = ""
            first_chunk = True
            try:
                for chunk in client.models.generate_content_stream(
                    model=model, contents=history, config=config
                ):
                    if chunk.text:
                        if first_chunk:
                            print(f"{role_name}: ", end="", flush=True)
                            first_chunk = False
                        print(chunk.text, end="", flush=True)
                        response += chunk.text
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
