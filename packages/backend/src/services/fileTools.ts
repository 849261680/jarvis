import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

/**
 * 文件工具定义（OpenAI Function Calling 格式）
 */
export const fileTools = [
  {
    type: 'function' as const,
    function: {
      name: 'read_md_file',
      description: '读取指定路径的Markdown文件内容',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: '要读取的MD文件路径（相对于项目根目录）'
          }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_md_file',
      description: '创建新的Markdown文件',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: '要创建的MD文件路径（相对于项目根目录）'
          },
          content: {
            type: 'string',
            description: '文件内容'
          }
        },
        required: ['path', 'content']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'edit_md_file',
      description: '编辑已存在的Markdown文件内容',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: '要编辑的MD文件路径（相对于项目根目录）'
          },
          content: {
            type: 'string',
            description: '新的文件内容（会完全替换原内容）'
          }
        },
        required: ['path', 'content']
      }
    }
  }
];

export async function executeFileTool(toolName: string, args: any): Promise<string> {
  const basePath = process.cwd();
  const filePath = join(basePath, args.path);

  try {
    switch (toolName) {
      case 'read_md_file':
        if (!existsSync(filePath)) {
          return `错误：文件 ${args.path} 不存在`;
        }
        const content = await readFile(filePath, 'utf-8');
        return content;

      case 'create_md_file':
        if (existsSync(filePath)) {
          return `错误：文件 ${args.path} 已存在，请使用 edit_md_file 进行编辑`;
        }
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, args.content, 'utf-8');
        return `成功创建文件 ${args.path}`;

      case 'edit_md_file':
        if (!existsSync(filePath)) {
          return `错误：文件 ${args.path} 不存在，请使用 create_md_file 创建`;
        }
        await writeFile(filePath, args.content, 'utf-8');
        return `成功编辑文件 ${args.path}`;

      default:
        return `未知工具：${toolName}`;
    }
  } catch (error) {
    return `执行工具时出错：${error instanceof Error ? error.message : String(error)}`;
  }
}
