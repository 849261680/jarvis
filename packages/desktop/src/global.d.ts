export interface ElectronAPI {
  fs: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    readDir: (path: string) => Promise<string[]>;
    exists: (path: string) => Promise<boolean>;
  };
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
  platform: string;
  version: string;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
