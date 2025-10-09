import { Router } from 'express';
import { AIService } from '../services/ai';

interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface ChatResponse {
  message: string;
}

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
      console.error('Error details:', error.cause || error.stack);
      res.status(500).json({ error: error.message, details: error.cause?.message });
    }
  });

  return router;
}
