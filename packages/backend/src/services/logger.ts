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
}
