import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      host: true,
      proxy: {
          // Proxy API requests to your Laravel backend
          '/api': {
            target: process.env.PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
          }
      }
    },
    envPrefix: 'PUBLIC_',
    resolve: {
      alias: {
        '@': '/src'
      },
      alias: {
        '@': '/src'
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    esbuild: {
      target: 'es2020'
    },
    build: {
      rollupOptions: {
        external: []
      }
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  },

  integrations: [react()],
  
  // Disable TypeScript checking during build
  typescript: {
    strict: false
  },
  
  // Disable TypeScript checking
  build: {
    inlineStylesheets: 'auto'
  }
});