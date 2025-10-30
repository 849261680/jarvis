import OpenAI from 'openai';
import { fileTools, executeFileTool } from './fileTools';
import { getSystemPrompt } from '../prompts/system';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * AI 服务类
 * 功能：与 DeepSeek API 交互，处理对话和工具调用
 * 输入：API key 和模型名称
 * 输出：对话结果和日志创建状态
 */
export class AIService {
  private client: OpenAI;
  private model: string;
  private logCreated = false;

  constructor(apiKey: string, model = 'deepseek-chat') {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.deepseek.com',
    });
    this.model = model;
  }

  /**
   * 与 AI 对话（流式）
   * 输入：用户消息、历史对话记录、流式回调函数
   * 输出：通过回调函数流式返回内容，返回是否创建了日志的状态
   */
  async chatStream(
    userMessage: string,
    history: Message[] = [],
    onChunk: (chunk: string) => void
  ): Promise<{ logCreated: boolean }> {
    this.logCreated = false;

    const today = new Date().toISOString().split('T')[0];
    const [year, month] = today.split('-');
    const todayLogPath = `logs/${year}/${month}/${today}.md`;
    const systemPrompt = getSystemPrompt(today, todayLogPath);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    try {
      let maxRounds = 5;

      while (maxRounds-- > 0) {
        const stream = await this.client.chat.completions.create({
          model: this.model,
          messages,
          tools: fileTools,
          stream: true,
        });

        let fullContent = '';
        let toolCalls: OpenAI.Chat.ChatCompletionMessageToolCall[] = [];
        const toolCallsMap = new Map<number, { id: string; name: string; arguments: string }>();

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta;
          if (!delta) continue;

          // 处理文本内容
          if (delta.content) {
            fullContent += delta.content;
            onChunk(delta.content);
          }

          // 处理工具调用
          if (delta.tool_calls) {
            for (const toolCall of delta.tool_calls) {
              const index = toolCall.index;
              if (!toolCallsMap.has(index)) {
                toolCallsMap.set(index, {
                  id: toolCall.id || '',
                  name: toolCall.function?.name || '',
                  arguments: ''
                });
              }
              const existing = toolCallsMap.get(index)!;
              if (toolCall.id) existing.id = toolCall.id;
              if (toolCall.function?.name) existing.name = toolCall.function.name;
              if (toolCall.function?.arguments) existing.arguments += toolCall.function.arguments;
            }
          }
        }

        // 转换工具调用
        toolCalls = Array.from(toolCallsMap.entries()).map(([index, call]) => ({
          id: call.id,
          type: 'function' as const,
          function: {
            name: call.name,
            arguments: call.arguments
          }
        }));

        // 如果没有工具调用，返回结果
        if (toolCalls.length === 0) {
          if (!fullContent.trim()) {
            onChunk('抱歉老大，我暂时没有获取到有效回复，请稍后再试。');
          }
          return { logCreated: this.logCreated };
        }

        // 添加助手消息到历史
        messages.push({
          role: 'assistant',
          content: fullContent || null,
          tool_calls: toolCalls
        });

        console.log('🔧 工具调用:', toolCalls.map(c => ({ name: c.function.name, args: c.function.arguments })));

        // 执行工具调用
        for (const toolCall of toolCalls) {
          const args = JSON.parse(toolCall.function.arguments);
          const toolResult = await executeFileTool(toolCall.function.name, args);
          console.log(`✅ ${toolCall.function.name} 结果:`, toolResult);

          if (toolCall.function.name === 'create_md_file' || toolCall.function.name === 'edit_md_file') {
            this.logCreated = true;
          }

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: toolResult
          });
        }
      }

      onChunk('抱歉老大，处理请求超出了最大轮次限制。');
      return { logCreated: this.logCreated };
    } catch (error) {
      console.error('AIService.chatStream: 调用失败', error);
      onChunk('抱歉老大，我暂时无法连接到 AI 服务，请稍后再试。');
      return { logCreated: false };
    }
  }
}
