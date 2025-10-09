import React from 'react';

const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    console.log('minimize clicked', window.electron);
    window.electron?.window.minimize();
  };

  const handleMaximize = () => {
    console.log('maximize clicked', window.electron);
    window.electron?.window.maximize();
  };

  const handleClose = () => {
    console.log('close clicked', window.electron);
    window.electron?.window.close();
  };

  return (
    <div className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center px-4 shadow-md select-none"
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      {/* macOS 风格的窗口控制按钮 */}
      <div className="flex gap-2 mr-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={handleClose}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          aria-label="关闭"
        />
        <button
          onClick={handleMinimize}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
          aria-label="最小化"
        />
        <button
          onClick={handleMaximize}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
          aria-label="最大化"
        />
      </div>

      {/* 标题 */}
      <h1 className="text-lg font-semibold">Jarvis 人生管理</h1>
    </div>
  );
};

export default TitleBar;
