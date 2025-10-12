# Jarvis Backend - Python

基于 FastAPI 的 AI 助手后端服务

## 快速开始（使用 uv）

### 1. 安装依赖

```bash
cd packages/backend-py
uv sync
```

### 2. 配置环境变量

创建 `.env` 文件（手动或复制模板）:

```bash
# .env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
```

### 3. 启动服务器

```bash
# 开发模式（推荐，支持热重载）
uv run uvicorn src.main:app --reload --port 3000

# 或直接运行
uv run python -m src.main

# 生产模式
uv run uvicorn src.main:app --host 0.0.0.0 --port 3000
```

## 传统方式启动

```bash
# 使用 pip
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --port 3000
```

## API 端点

访问自动生成的 API 文档:
- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

接口列表:
- `GET /health` - 健康检查
- `POST /api/chat` - AI 对话
- `POST /api/logs` - 创建日志
- `GET /api/logs/list` - 获取日志列表
- `GET /api/logs/{date}` - 获取指定日期日志

## 项目结构

```
backend-py/
├── src/
│   ├── main.py           # 主服务器
│   ├── routes/           # 路由
│   │   ├── chat.py
│   │   └── logs.py
│   ├── services/         # 服务
│   │   ├── ai.py
│   │   ├── logger.py
│   │   └── file_tools.py
│   └── prompts/          # 提示词
│       └── system.py
├── pyproject.toml        # uv 项目配置
├── requirements.txt      # pip 依赖（兼容）
└── .env                  # 环境变量
```

## 技术栈

- **FastAPI** - 现代、快速的 Web 框架
- **Uvicorn** - ASGI 服务器
- **Google Generative AI** - Gemini API SDK
- **Pydantic** - 数据验证
- **uv** - 快速的 Python 包管理器
