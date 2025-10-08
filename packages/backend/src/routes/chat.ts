import { Router } from 'express';
import { AIService } from '../services/ai';
import { ChatRequest, ChatResponse } from '@jarvis/shared';

export function createChatRouter(aiService: AIService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { message, history = [] } = req.body as ChatRequest;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await aiService.chat(message, history);

      const chatResponse: ChatResponse = {
        message: response
      };

      res.json(chatResponse);
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
