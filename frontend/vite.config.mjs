import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const apiBaseUrl =
  process.env.VITE_API_BASE_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:8000/api';

const derivedProxyTarget = apiBaseUrl.replace(/\/api\/?$/, '');
const devProxyTarget = process.env.VITE_API_TARGET || derivedProxyTarget;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: devProxyTarget,
        changeOrigin: true,
        rewrite: (pathname) => pathname,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
});

