import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatPanelProps {
  onLogCreated?: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onLogCreated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '老大好！我是你的人生管理助手，有什么可以帮你的？',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) throw new Error('API 调用失败');

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
      
      // 如果 AI 创建了日志，触发刷新
      if (data.logCreated) {
        onLogCreated?.();
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉老大，我遇到了一些问题，请确保后端服务已启动。',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部 */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-gray-700">AI 助手</h2>
        <button className="text-xs text-gray-500 hover:text-gray-700">清空</button>
      </div>

      {/* 快捷操作 */}
      <div className="p-3 border-b border-gray-200 flex gap-2">
        <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
          总结今天
        </button>
        <button className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100">
          给我建议
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-500">正在思考...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <textarea
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-sm"
            rows={3}
            placeholder="说点什么..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
