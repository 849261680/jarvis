# Jarvis AI 

     一个基于 Google Gemini API 的简单对话 AI
     助手，支持多角色系统提示词和自动对话记录保存。

     ## 功能特性

     - 🤖 支持多种 AI 角色（默认助手、马斯克等）
     - 💬 流式对话响应
     - 📝 自动保存对话记录到 Markdown 文件
     - 🎭 可自定义系统提示词

     ## 快速开始

     ### 1. 安装依赖

     ```bash
     pip install google-genai python-dotenv
     ```

     ### 2. 配置 API 密钥

     创建 `.env` 文件并添加你的 Gemini API 密钥：

     ```env
     GEMINI_API_KEY=your_api_key_here
     ```

     ### 3. 运行程序

     ```bash
     python main.py
     ```

     ## 使用说明

     1. 启动程序后选择 AI 角色
     2. 开始对话，输入 `quit`、`exit` 或 `bye` 退出
     3. 对话记录自动保存在 `chat_history/` 文件夹中

     ## 文件结构

     ```
     jarvis/
     ├── main.py           # 主程序
     ├── .env              # API 密钥配置
     ├── chat_history/     # 对话记录文件夹
     │   ├── chat_默认助手.md
     │   └── chat_马斯克.md
     └── README.md         # 说明文档
     ```

     ## 自定义角色

     在 `main.py` 的 `system_prompts` 字典中添加新角色：

     ```python
     "3": {
         "name": "你的角色名",
         "prompt": "你的系统提示词"
     }
     ```
