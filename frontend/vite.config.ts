import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apiBaseUrl = process.env.VITE_API_BASE_URL || process.env.VITE_API_URL || 'http://localhost:8000/api'
const derivedProxyTarget = apiBaseUrl.replace(/\/api\/?$/, '')
const devProxyTarget = process.env.VITE_API_TARGET || derivedProxyTarget

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: devProxyTarget,
        changeOrigin: true,
        rewrite: (pathname) => pathname,
      }
    }
  },
  optimizeDeps: {
    include: ['react-is'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress unresolved-import warnings for known recharts peer deps
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.source === 'react-is') return;
        warn(warning);
      },
    },
  },
})
