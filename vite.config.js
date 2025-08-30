// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: './web',        // 告诉 vite 入口在 web 目录
  build: {
    outDir: '../dist',  // 输出到根目录的 dist
    emptyOutDir: true
  }
});