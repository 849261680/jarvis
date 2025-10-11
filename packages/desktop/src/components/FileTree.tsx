import React, { useState, useEffect } from 'react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  refreshTrigger?: number;
}

const FileTree: React.FC<FileTreeProps> = ({ onFileSelect, refreshTrigger }) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/logs/list');
        const data = await response.json();
        if (data.success && data.files) {
          setFiles(data.files);
          // 默认展开所有目录
          const allDirs = new Set<string>();
          const expandAll = (nodes: FileNode[]) => {
            nodes.forEach(node => {
              if (node.type === 'directory') {
                allDirs.add(node.path);
                if (node.children) expandAll(node.children);
              }
            });
          };
          expandAll(data.files);
          setExpandedDirs(allDirs);
        }
      } catch (error) {
        console.error('获取文件列表失败:', error);
      }
    };
    
    fetchFiles();
  }, [refreshTrigger]);

  const handleFileClick = (path: string) => {
    setSelectedFile(path);
    onFileSelect(path);
  };

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const renderTree = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        {node.type === 'directory' ? (
          <>
            <div 
              className="py-1 px-2 hover:bg-gray-100 cursor-pointer flex items-center"
              style={{ paddingLeft: `${level * 12}px` }}
              onClick={() => toggleDir(node.path)}
            >
              <span className="mr-1">{expandedDirs.has(node.path) ? '📂' : '📁'}</span>
              <span className="text-sm font-medium text-gray-700">{node.name}</span>
            </div>
            {expandedDirs.has(node.path) && node.children && renderTree(node.children, level + 1)}
          </>
        ) : (
          <div
            className={`py-1 px-2 hover:bg-blue-50 cursor-pointer flex items-center ${
              selectedFile === node.path ? 'bg-blue-100' : ''
            }`}
            style={{ paddingLeft: `${level * 12}px` }}
            onClick={() => handleFileClick(node.path)}
          >
            <span className="mr-1">📄</span>
            <span className="text-sm text-gray-600">{node.name}</span>
          </div>
        )}
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
        {files.length > 0 ? renderTree(files) : <div className="px-3 text-gray-500">加载中...</div>}
      </div>
    </div>
  );
};

export default FileTree;
