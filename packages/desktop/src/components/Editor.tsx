import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EditorProps {
  filePath: string | null;
}

const Editor: React.FC<EditorProps> = ({ filePath }) => {
  const [content, setContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (!filePath) {
      setContent('');
      setFileName('');
      return;
    }

    const loadFile = async () => {
      try {
        const match = filePath.match(/(\d{4}-\d{2}-\d{2})\.md$/);
        if (match) {
          const date = match[1];
          setFileName(`${date}.md`);
          
          const response = await fetch(`http://localhost:3000/api/logs/${date}`);
          const data = await response.json();
          
          if (data.success && data.content) {
            setContent(data.content);
          } else if (data.notFound) {
            setContent(`# ${date}\n\n文件不存在或为空`);
          }
        }
      } catch (error) {
        console.error('加载文件失败:', error);
        setContent('加载文件失败');
      }
    };

    loadFile();
    
    // 每3秒自动刷新文件内容
    const interval = setInterval(loadFile, 3000);
    
    return () => clearInterval(interval);
  }, [filePath]);

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>请从左侧选择一个文件</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部工具栏 */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4">
        <h2 className="text-sm font-semibold text-gray-700">{fileName}</h2>
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
      <div className="flex-1 overflow-hidden bg-white">
        {isPreview ? (
          <div className="h-full overflow-y-auto p-6">
            <article className="prose prose-slate max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </article>
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
