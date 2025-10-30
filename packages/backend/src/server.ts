import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AIService } from './services/ai';
import { LoggerService } from './services/logger';
import { createChatRouter } from './routes/chat';
import { createLogsRouter } from './routes/logs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const apiKey = process.env.DEEPSEEK_API_KEY;
if (!apiKey) {
  console.error('错误: 未设置 DEEPSEEK_API_KEY');
  process.exit(1);
}

const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const aiService = new AIService(apiKey, model);
const loggerService = new LoggerService('logs');

app.use('/api/chat', createChatRouter(aiService));
app.use('/api/logs', createLogsRouter(loggerService));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Jarvis Backend 运行在 http://localhost:${PORT}`);
  console.log(`📡 API 端点:`);
  console.log(`   POST /api/chat - AI 对话`);
  console.log(`   POST /api/logs - 创建日志`);
  console.log(`   GET  /api/logs/list - 获取日志文件列表`);
  console.log(`   GET  /api/logs/:date - 获取日志`);
});
