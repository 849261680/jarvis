import { Router } from 'express';
import { LoggerService } from '../services/logger';
import { CreateLogRequest, CreateLogResponse, GetLogResponse } from '@jarvis/shared';

export function createLogsRouter(loggerService: LoggerService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { date, content } = req.body as CreateLogRequest;

      if (!date || !content) {
        return res.status(400).json({ error: 'Date and content are required' });
      }

      const filePath = await loggerService.createLog(date, content);

      const response: CreateLogResponse = {
        success: true,
        filePath
      };

      res.json(response);
    } catch (error: any) {
      console.error('Create log error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/list', async (_req, res) => {
    try {
      const files = await loggerService.listLogs();
      res.json({ success: true, files });
    } catch (error: any) {
      console.error('List logs error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:date', async (req, res) => {
    try {
      const { date } = req.params;
      const content = await loggerService.readLog(date);

      const response: GetLogResponse = content
        ? { success: true, content }
        : { success: true, notFound: true };

      res.json(response);
    } catch (error: any) {
      console.error('Get log error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
