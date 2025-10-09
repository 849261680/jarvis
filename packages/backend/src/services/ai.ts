import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import { fileTools, executeFileTool } from './fileTools';

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
    const model = this.genAI.getGenerativeModel({ 
      model: this.model,
      tools: [{ functionDeclarations: fileTools }]
    });

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayLogPath = `logs/${today}.md`;
    
    const systemPrompt = `你是老大的人生管理助手。
当老大描述做了什么时，你需要记录到今天的日志文件中。
保持简洁直接，称呼用"老大"。

今天的日期是 ${today}，日志文件路径是 ${todayLogPath}

记录流程：
1. 尝试用 read_md_file 读取 ${todayLogPath}
2. 如果返回"文件不存在"，用 create_md_file 创建文件并写入内容
3. 如果文件已存在，用 edit_md_file 追加新内容到文件末尾`;

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
        return '抱歉老大，我暂时没有获取到有效回复，请稍后再试。';
      }
      return text;
    } catch (error) {
      console.error('AIService.chat: 调用失败', error);
      return '抱歉老大，我暂时无法连接到 AI 服务，请稍后再试。';
    }
  }
}
