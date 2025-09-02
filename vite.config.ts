import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    rollupOptions: {
      external: ['@rollup/rollup-linux-x64-gnu', '@rollup/rollup-linux-arm64-gnu'],
      output: {
        manualChunks: undefined
      }
    },
    target: 'esnext'
  },
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu', '@rollup/rollup-linux-arm64-gnu']
  },
  ssr: {
    noExternal: ['@rollup/rollup-linux-x64-gnu', '@rollup/rollup-linux-arm64-gnu']
  }
});