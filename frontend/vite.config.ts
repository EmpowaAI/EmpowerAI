import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apiBaseUrl = process.env.VITE_API_BASE_URL || process.env.VITE_API_URL || 'http://localhost:8000/api'
const derivedProxyTarget = apiBaseUrl.replace(/\/api\/?$/, '')
const devProxyTarget = process.env.VITE_API_TARGET || derivedProxyTarget

const chunkGroups: Record<string, string[]> = {
  // Split vendor chunks for better caching and smaller initial bundle
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'chart-vendor': ['recharts'],
  'ui-vendor': ['lucide-react'],
  'motion-vendor': ['framer-motion'],
  'ai-vendor': ['@google/genai', 'react-markdown', 'microsoft-cognitiveservices-speech-sdk'],
  'utils-vendor': ['axios', 'clsx', 'tailwind-merge'],
}

function getManualChunk(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/')
  if (!normalizedId.includes('node_modules')) return undefined

  for (const [chunkName, packages] of Object.entries(chunkGroups)) {
    for (const pkg of packages) {
      const pkgPath = `/node_modules/${pkg}/`
      if (normalizedId.includes(pkgPath)) return chunkName
    }
  }

  return 'vendor'
}

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
        rewrite: (pathname) => pathname,
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Vite 8 uses Rolldown for dep optimization which currently expects manualChunks to be a function.
        manualChunks: getManualChunk,
      },
    },
    // Enable source maps for debugging but keep them external
    sourcemap: false, // Disable sourcemaps in production for smaller files
  },
})
