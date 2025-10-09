import TitleBar from './components/TitleBar';
import FileTree from './components/FileTree';
import Editor from './components/Editor';
import ChatPanel from './components/ChatPanel';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 标题栏 */}
      <TitleBar />

      {/* 主内容区 - 三栏布局 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 左侧：文件树 */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <FileTree />
        </aside>

        {/* 中间：编辑器 */}
        <section className="flex-1 bg-white">
          <Editor />
        </section>

        {/* 右侧：AI 对话 */}
        <aside className="w-96 bg-gray-50 border-l border-gray-200">
          <ChatPanel />
        </aside>
      </main>
    </div>
  );
}

export default App;
