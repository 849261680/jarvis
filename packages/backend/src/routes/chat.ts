import { Router } from 'express';
import { AIService } from '../services/ai';

interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/**
 * 创建聊天路由
 * 功能：处理 AI 对话请求，支持 SSE 流式输出
 * 输入：AIService 实例
 * 输出：Express Router
 */
export function createChatRouter(aiService: AIService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { message, history = [] } = req.body as ChatRequest;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      // 设置 SSE 响应头
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // 流式返回内容
      await aiService.chatStream(message, history, (chunk) => {
        res.write(`data: ${JSON.stringify({ type: 'content', content: chunk })}\n\n`);
      });

      // 发送完成信号
      res.write(`data: ${JSON.stringify({ type: 'done', logCreated: aiService['logCreated'] })}\n\n`);
      res.end();
    } catch (error: any) {
      console.error('Chat error:', error);
      console.error('Error details:', error.cause || error.stack);
      res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
      res.end();
    }
  });

  return router;
}
