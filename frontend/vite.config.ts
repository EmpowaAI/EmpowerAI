import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apiBaseUrl = process.env.VITE_API_BASE_URL || process.env.VITE_API_URL || 'http://localhost:5000/api'
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
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: devProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    minify: 'terser', // Better minification than esbuild
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching and smaller initial bundle
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'ui-vendor': ['lucide-react'],
        },
      },
    },
    // Enable source maps for debugging but keep them external
    sourcemap: false, // Disable sourcemaps in production for smaller files
  },
})
