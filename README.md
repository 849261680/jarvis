# Jarvis 人生管理系统

Jarvis 是一款基于 Google Gemini API 的全栈 TypeScript 应用，旨在通过 AI 助手帮助您管理日常生活记录。

## 功能特性

- **AI 驱动的日志管理**: 与智能助手对话，自动记录您的日常活动到 Markdown 日志中。
- **三栏式桌面应用**: 使用 Electron 和 React 构建，集成了文件浏览器、Markdown 编辑器和 AI 聊天面板。
- **自动化的文件操作**: AI 具备读、写、改本地日志文件的能力，简化记录流程。
- **清晰的日志组织**: 日志文件按 `年/月/日` 的结构自动组织和存储。

## 技术栈

- **Monorepo**: 使用 `pnpm workspace` 管理的多包项目。
- **后端**: Node.js, Express, TypeScript, Google Gemini API
- **桌面端**: Electron, React, Vite, TypeScript, Tailwind CSS
- **共享库**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置 API 密钥

在 `packages/backend` 目录下创建 `.env` 文件，并添加您的 Gemini API 密钥：

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. 运行开发环境

您需要打开两个终端来分别运行后端和桌面端：

**终端 1: 启动后端服务**
```bash
pnpm dev:backend
```

**终端 2: 启动桌面应用**
```bash
pnpm dev:desktop
```

现在，Jarvis 桌面应用将会启动，您可以开始通过与 AI 对话来管理您的生活了。
