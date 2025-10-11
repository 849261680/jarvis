import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import { fileTools, executeFileTool } from './fileTools';
import { getSystemPrompt } from '../prompts/system';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private logCreated = false;

  constructor(apiKey: string, model = 'gemini-pro') {
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (proxy) {
      const proxyAgent = new ProxyAgent(proxy);
      setGlobalDispatcher(proxyAgent);
      console.log('使用代理:', proxy);
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async chat(userMessage: string, history: Message[] = []): Promise<{ message: string; logCreated: boolean }> {
    this.logCreated = false;
    const model = this.genAI.getGenerativeModel({ 
      model: this.model,
      tools: [{ functionDeclarations: fileTools }]
    });

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const [year, month] = today.split('-');
    const todayLogPath = `logs/${year}/${month}/${today}.md`;
    const systemPrompt = getSystemPrompt(today, todayLogPath);

    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    try {
      const chat = model.startChat({
        history: chatHistory,
        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] }
      });

      let result = await chat.sendMessage(userMessage);
      let response = result.response;

      // 循环处理多轮工具调用
      let maxRounds = 5;
      while (maxRounds-- > 0) {
        const functionCalls = response.functionCalls();
        if (!functionCalls || functionCalls.length === 0) break;

        console.log('🔧 工具调用:', functionCalls.map(c => ({ name: c.name, args: c.args })));
        const functionResponses = await Promise.all(
          functionCalls.map(async (call) => {
            const toolResult = await executeFileTool(call.name, call.args);
            console.log(`✅ ${call.name} 结果:`, toolResult);
            
            // 检查是否创建或更新了日志
            if (call.name === 'create_log' || call.name === 'update_log') {
              this.logCreated = true;
            }
            
            return {
              functionResponse: {
                name: call.name,
                response: { result: toolResult }
              }
            };
          })
        );

        result = await chat.sendMessage(functionResponses);
        response = result.response;
      }

      const text = response?.text();
      if (!text?.trim()) {
        console.warn('AIService.chat: empty response');
        return { message: '抱歉老大，我暂时没有获取到有效回复，请稍后再试。', logCreated: false };
      }
      return { message: text, logCreated: this.logCreated };
    } catch (error) {
      console.error('AIService.chat: 调用失败', error);
      return { message: '抱歉老大，我暂时无法连接到 AI 服务，请稍后再试。', logCreated: false };
    }
  }
}
