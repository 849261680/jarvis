import fs from 'fs/promises';
import path from 'path';

export class LoggerService {
  private baseDir: string;

  constructor(baseDir = 'life_logs') {
    this.baseDir = baseDir;
  }

  async createLog(date: string, content: string): Promise<string> {
    const [year, month] = date.split('-');
    const dir = path.join(this.baseDir, year, month);
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, `${date}.md`);
    await fs.writeFile(filePath, `# ${date}\n\n${content}`, 'utf-8');
    return filePath;
  }

  async updateLog(date: string, content: string): Promise<string> {
    const [year, month] = date.split('-');
    const filePath = path.join(this.baseDir, year, month, `${date}.md`);

    try {
      await fs.access(filePath);
      await fs.appendFile(filePath, `\n${content}`, 'utf-8');
      return filePath;
    } catch {
      return this.createLog(date, content);
    }
  }

  async readLog(date: string): Promise<string | null> {
    const [year, month] = date.split('-');
    const filePath = path.join(this.baseDir, year, month, `${date}.md`);

    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  async listLogs(): Promise<any[]> {
    const yearMap = new Map<string, Map<string, any[]>>();
    
    try {
      const entries = await fs.readdir(this.baseDir);
      
      for (const entry of entries) {
        const entryPath = path.join(this.baseDir, entry);
        const stat = await fs.stat(entryPath);
        
        // 处理目录结构（年/月）
        if (stat.isDirectory()) {
          const months = await fs.readdir(entryPath);
          
          for (const month of months) {
            const monthPath = path.join(entryPath, month);
            const monthStat = await fs.stat(monthPath);
            
            if (monthStat.isDirectory()) {
              const logFiles = await fs.readdir(monthPath);
              
              for (const file of logFiles) {
                if (file.endsWith('.md')) {
                  if (!yearMap.has(entry)) {
                    yearMap.set(entry, new Map());
                  }
                  if (!yearMap.get(entry)!.has(month)) {
                    yearMap.get(entry)!.set(month, []);
                  }
                  yearMap.get(entry)!.get(month)!.push({
                    name: file,
                    path: `${entry}/${month}/${file}`,
                    type: 'file'
                  });
                }
              }
            }
          }
        }
        // 处理平铺的文件
        else if (entry.endsWith('.md')) {
          const match = entry.match(/^(\d{4})-(\d{2})-\d{2}\.md$/);
          if (match) {
            const [, year, month] = match;
            if (!yearMap.has(year)) {
              yearMap.set(year, new Map());
            }
            if (!yearMap.get(year)!.has(month)) {
              yearMap.get(year)!.set(month, []);
            }
            yearMap.get(year)!.get(month)!.push({
              name: entry,
              path: entry,
              type: 'file'
            });
          }
        }
      }
      
      // 构建树形结构
      const result: any[] = [];
      for (const [year, months] of Array.from(yearMap.entries()).sort().reverse()) {
        const yearNode: any = {
          name: year,
          path: year,
          type: 'directory',
          children: []
        };
        
        for (const [month, files] of Array.from(months.entries()).sort().reverse()) {
          const monthNode: any = {
            name: month,
            path: `${year}/${month}`,
            type: 'directory',
            children: files.sort((a, b) => b.name.localeCompare(a.name))
          };
          yearNode.children.push(monthNode);
        }
        
        result.push(yearNode);
      }
      
      return result;
    } catch (error) {
      console.error('List logs error:', error);
      return [];
    }
  }
}
