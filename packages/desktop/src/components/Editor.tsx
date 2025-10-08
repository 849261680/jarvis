import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Editor: React.FC = () => {
  const [content, setContent] = useState('# 2025-10-08\n\n## 工作\n- 写代码 2h\n\n## 学习\n- 看文档 1h\n\n## 反思\n今天效率不错，继续保持！');
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* 头部工具栏 */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-gray-700">2025-10-08.md</h2>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 text-xs rounded ${
              !isPreview ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
            onClick={() => setIsPreview(false)}
          >
            编辑
          </button>
          <button
            className={`px-3 py-1 text-xs rounded ${
              isPreview ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}
            onClick={() => setIsPreview(true)}
          >
            预览
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-hidden">
        {isPreview ? (
          <div className="h-full overflow-y-auto p-6 prose prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="w-full h-full p-6 font-mono text-sm resize-none focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始记录今天的活动..."
          />
        )}
      </div>
    </div>
  );
};

export default Editor;
