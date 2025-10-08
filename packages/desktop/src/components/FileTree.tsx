import React, { useState, useEffect } from 'react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

const FileTree: React.FC = () => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    // TODO: 从后端或本地读取文件列表
    // 模拟数据
    const mockFiles: FileNode[] = [
      {
        name: '2025',
        path: '2025',
        type: 'directory',
        children: [
          {
            name: '10',
            path: '2025/10',
            type: 'directory',
            children: [
              { name: '2025-10-08.md', path: '2025/10/2025-10-08.md', type: 'file' },
              { name: '2025-10-07.md', path: '2025/10/2025-10-07.md', type: 'file' },
              { name: '2025-10-06.md', path: '2025/10/2025-10-06.md', type: 'file' },
            ]
          }
        ]
      }
    ];
    setFiles(mockFiles);
  }, []);

  const handleFileClick = (path: string) => {
    setSelectedFile(path);
    // TODO: 触发加载文件内容
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path} style={{ paddingLeft: `${level * 12}px` }}>
        {node.type === 'directory' ? (
          <div className="py-1 px-2 hover:bg-gray-100 cursor-pointer flex items-center">
            <span className="mr-1">📁</span>
            <span className="text-sm font-medium text-gray-700">{node.name}</span>
          </div>
        ) : (
          <div
            className={`py-1 px-2 hover:bg-blue-50 cursor-pointer flex items-center ${
              selectedFile === node.path ? 'bg-blue-100' : ''
            }`}
            onClick={() => handleFileClick(node.path)}
          >
            <span className="mr-1">📄</span>
            <span className="text-sm text-gray-600">{node.name}</span>
          </div>
        )}
        {node.children && renderTree(node.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="h-12 border-b border-gray-200 flex items-center justify-between px-3">
        <h2 className="text-sm font-semibold text-gray-700">日志文件</h2>
        <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
          新建
        </button>
      </div>

      {/* 文件列表 */}
      <div className="flex-1 overflow-y-auto py-2">
        {renderTree(files)}
      </div>
    </div>
  );
};

export default FileTree;
