import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: string;

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

  async chat(userMessage: string, history: Message[] = []): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.model });

    const systemPrompt = `你是老大的人生管理助手。
当老大描述做了什么时，你需要记录并给出建议。
保持简洁直接，称呼用"老大"。`;

    const chatHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    chatHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    try {
      const chat = model.startChat({
        history: chatHistory,
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemPrompt }]
        }
      });
      const result = await chat.sendMessage(userMessage);
      const text = result.response?.text();
      if (typeof text !== 'string' || !text.trim()) {
        console.warn('AIService.chat: empty response text, returning fallback.');
        return '抱歉老大，我暂时没有获取到有效回复，请稍后再试。';
      }
      return text;
    } catch (error) {
      console.error('AIService.chat: 调用 Gemini 失败', error);
      return '抱歉老大，我暂时无法连接到 AI 服务，请稍后再试。';
    }
  }
}
