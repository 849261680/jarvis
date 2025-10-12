"""
聊天路由模块
处理 /api/chat 相关请求
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.ai import AIService


class Message(BaseModel):
    """消息模型"""

    role: str  # 'user' 或 'assistant'
    content: str


class ChatRequest(BaseModel):
    """聊天请求模型"""

    message: str
    history: list[Message] | None = []


class ChatResponse(BaseModel):
    """聊天响应模型"""

    message: str
    logCreated: bool | None = False


def create_chat_router(ai_service: AIService) -> APIRouter:
    """
    创建聊天路由

    参数:
        ai_service: AI 服务实例

    返回:
        APIRouter: 路由实例
    """
    router = APIRouter()

    @router.post("/", response_model=ChatResponse)
    async def chat(request: ChatRequest):
        """处理聊天请求"""
        if not request.message:
            raise HTTPException(status_code=400, detail="Message is required")

        try:
            history = [msg.dict() for msg in request.history]
            response = await ai_service.chat(request.message, history)
            return response
        except Exception as e:
            print(f"Chat error: {e}")
            raise HTTPException(status_code=500, detail=str(e)) from e

    return router
