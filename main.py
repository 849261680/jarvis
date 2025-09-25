# To run this code you need to install the following dependencies:
# pip install google-genai python-dotenv

import base64
import os
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import types

# 加载环境变量
load_dotenv()


def load_system_prompts():
    """从 system_prompts 文件夹加载所有 md 文件"""
    prompts = {}
    prompt_dir = "system_prompts"

    if not os.path.exists(prompt_dir):
        print("❌ 未找到 system_prompts 文件夹")
        return {}

    try:
        # 遍历文件夹中的所有 md 文件
        files = [f for f in os.listdir(prompt_dir) if f.endswith('.md')]

        for i, filename in enumerate(files, 1):
            # 获取角色名（去掉 .md 后缀）
            role_name = filename[:-3]

            # 读取文件内容
            with open(os.path.join(prompt_dir, filename), 'r', encoding='utf-8') as f:
                content = f.read().strip()

            prompts[str(i)] = {
                "name": role_name,
                "prompt": content
            }

        return prompts

    except Exception as e:
        print(f"❌ 加载配置文件时出错: {e}")
        return {}


class ChatBot:
    def __init__(self, system_prompt=None, role_name="default"):
        self.client = genai.Client(
            api_key=os.environ.get("GEMINI_API_KEY"),
        )
        self.model = "gemini-2.5-pro"
        self.conversation_history = []
        self.system_instruction = system_prompt  # 正确存储系统指令
        self.role_name = role_name
        # 创建 chat_history 文件夹（如果不存在）
        if not os.path.exists("chat_history"):
            os.makedirs("chat_history")
        # 简单的日志文件名，保存在 chat_history 文件夹中
        self.log_file = f"chat_history/chat_{role_name}.md"

    def save_to_file(self, role, text):
        """简单保存到文件"""
        with open(self.log_file, 'a', encoding='utf-8') as f:
            if role == "user":
                f.write(f"用户: {text}\n\n")
            else:
                f.write(f"{self.role_name}: {text}\n\n")

    def add_to_history(self, role, text):
        """添加消息到对话历史"""
        self.conversation_history.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=text)]
            )
        )

    def generate_response(self, user_input):
        """生成AI响应"""
        # 添加用户输入到历史并保存
        self.add_to_history("user", user_input)
        self.save_to_file("user", user_input)

        # 配置生成参数（正确设置系统指令）
        generate_content_config = types.GenerateContentConfig(
            system_instruction=self.system_instruction,  # 正确的系统指令设置方式
            thinking_config=types.ThinkingConfig(
                thinking_budget=200,
            ),
        )

        try:
            # 生成流式响应
            response_text = ""
            for chunk in self.client.models.generate_content_stream(
                model=self.model,
                contents=self.conversation_history,
                config=generate_content_config,
            ):
                if chunk.text:
                    print(chunk.text, end="", flush=True)
                    response_text += chunk.text

            print()  # 添加换行符

            # 添加AI响应到历史并保存
            if response_text:
                self.add_to_history("model", response_text)
                self.save_to_file("model", response_text)

        except Exception as e:
            print(f"\n错误: {e}")

    def chat(self):
        """开始对话循环"""
        print(f"🤖 {self.role_name} AI 已启动！")
        print("💡 输入 'quit', 'exit' 或 'bye' 来退出对话\n")

        while True:
            try:
                user_input = input("👤 你: ").strip()

                # 检查退出命令
                if user_input.lower() in ['quit', 'exit', 'bye', '退出']:
                    print("👋 再见！")
                    break

                # 检查空输入
                if not user_input:
                    print("请输入一些内容...")
                    continue

                print(f"🤖 {self.role_name}: ", end="")
                self.generate_response(user_input)
                print()

            except KeyboardInterrupt:
                print("\n👋 再见！")
                break
            except EOFError:
                print("\n👋 再见！")
                break


def main():
    # 检查API密钥
    if not os.environ.get("GEMINI_API_KEY"):
        print("❌ 错误: 请在 .env 文件中设置 GEMINI_API_KEY")
        sys.exit(1)

    # 加载系统提示词配置
    system_prompts = load_system_prompts()

    if not system_prompts:
        print("使用默认配置")
        system_prompts = {
            "1": {
                "name": "默认助手",
                "prompt": "你是一个友善的 AI 助手"
            }
        }

    print("🎭 请选择 AI 角色:")
    for key, value in system_prompts.items():
        print(f"{key}. {value['name']}")

    # 计算下一个可用编号作为"无系统提示词"选项
    max_num = max([int(k) for k in system_prompts.keys() if k.isdigit()], default=0)
    no_prompt_option = str(max_num + 1)
    print(f"{no_prompt_option}. 无系统提示词")
    print()

    choice = input("请输入角色编号: ")

    if choice in system_prompts:
        role_info = system_prompts[choice]
        system_prompt = role_info["prompt"]
        role_name = role_info["name"]
    elif choice == no_prompt_option:
        system_prompt = None
        role_name = "无角色"
    else:
        print("无效选择，使用默认设置")
        system_prompt = None
        role_name = "默认"

    # 启动聊天机器人
    bot = ChatBot(system_prompt, role_name)
    bot.chat()


if __name__ == "__main__":
    main()