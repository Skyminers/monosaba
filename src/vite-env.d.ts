/// <reference types="vite/client" />

interface Window {
  __TAURI__?: {
    convertFileSrc: (filePath: string, protocol?: string) => string;
  };
}
