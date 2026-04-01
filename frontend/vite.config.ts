import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const apiBaseUrl =
    env.VITE_API_BASE_URL ||
    env.VITE_API_URL ||
    'http://localhost:8000/api'

  const derivedProxyTarget = apiBaseUrl.replace(/\/api\/?$/, '')
  const devProxyTarget = env.VITE_API_TARGET || derivedProxyTarget

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
  host: '0.0.0.0',
  port: 5173,
  strictPort: true,

  hmr: {
    clientPort: 5173,
  },

      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path,
        },
      },
    },

    build: {
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor': ['recharts'],
            'ui-vendor': ['lucide-react'],
            'motion-vendor': ['framer-motion'],
            'ai-vendor': [
              '@google/genai',
              'react-markdown',
              'microsoft-cognitiveservices-speech-sdk',
            ],
            'utils-vendor': ['axios', 'clsx', 'tailwind-merge'],
          },
        },
      },

      sourcemap: false,
    },
  }
})