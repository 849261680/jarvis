"""
日志路由模块
处理 /api/logs 相关请求
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..services.logger import LoggerService

class CreateLogRequest(BaseModel):
    """创建日志请求模型"""
    date: str
    content: str

class CreateLogResponse(BaseModel):
    """创建日志响应模型"""
    success: bool
    filePath: str

class GetLogResponse(BaseModel):
    """获取日志响应模型"""
    success: bool
    content: Optional[str] = None
    notFound: Optional[bool] = False

class ListLogsResponse(BaseModel):
    """日志列表响应模型"""
    success: bool
    files: List[Dict[str, Any]]

def create_logs_router(logger_service: LoggerService) -> APIRouter:
    """
    创建日志路由
    
    参数:
        logger_service: 日志服务实例
        
    返回:
        APIRouter: 路由实例
    """
    router = APIRouter()
    
    @router.post("/", response_model=CreateLogResponse)
    async def create_log(request: CreateLogRequest):
        """创建新日志"""
        if not request.date or not request.content:
            raise HTTPException(status_code=400, detail="Date and content are required")
        
        try:
            file_path = await logger_service.create_log(request.date, request.content)
            return CreateLogResponse(success=True, filePath=file_path)
        except Exception as e:
            print(f"Create log error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/list", response_model=ListLogsResponse)
    async def list_logs():
        """获取日志文件列表"""
        try:
            files = await logger_service.list_logs()
            return ListLogsResponse(success=True, files=files)
        except Exception as e:
            print(f"List logs error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.get("/{date}", response_model=GetLogResponse)
    async def get_log(date: str):
        """获取指定日期的日志"""
        try:
            content = await logger_service.read_log(date)
            if content:
                return GetLogResponse(success=True, content=content)
            else:
                return GetLogResponse(success=True, notFound=True)
        except Exception as e:
            print(f"Get log error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    return router

