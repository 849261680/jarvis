"""
Jarvis 后端主服务器 - Python + FastAPI
"""

import os
import warnings

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.chat import create_chat_router
from .routes.logs import create_logs_router
from .services.ai import AIService
from .services.logger import LoggerService

# 屏蔽 gRPC ALTS 警告
os.environ.setdefault("GRPC_ENABLE_FORK_SUPPORT", "0")
warnings.filterwarnings("ignore", category=UserWarning, module="google.auth")

# 加载环境变量
load_dotenv()

# 创建 FastAPI 应用
app = FastAPI(title="Jarvis Backend API", version="1.0.0", redirect_slashes=False)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 检查 API Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("错误: 未设置 GEMINI_API_KEY")
    exit(1)

# 初始化服务
model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
ai_service = AIService(api_key, model)
logger_service = LoggerService("logs")

# 注册路由
app.include_router(create_chat_router(ai_service), prefix="/api/chat", tags=["chat"])
app.include_router(create_logs_router(logger_service), prefix="/api/logs", tags=["logs"])


@app.get("/health")
async def health():
    """健康检查接口"""
    from datetime import datetime

    return {"status": "ok", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "3000"))
    print(f"✅ Jarvis Backend 运行在 http://localhost:{port}")
    print("📡 API 端点:")
    print("   POST /api/chat - AI 对话")
    print("   POST /api/logs - 创建日志")
    print("   GET  /api/logs/list - 获取日志文件列表")
    print("   GET  /api/logs/:date - 获取日志")
    print(f"📚 API 文档: http://localhost:{port}/docs")

    uvicorn.run(app, host="0.0.0.0", port=port)
