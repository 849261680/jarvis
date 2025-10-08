import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '@jarvis/shared';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model = 'gemini-pro') {
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

    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  }
}
