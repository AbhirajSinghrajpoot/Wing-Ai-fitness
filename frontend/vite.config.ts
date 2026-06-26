import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// Project root is one level above this file (d:/arogyamitra)
const projectRoot = path.resolve(__dirname, '..');

export default defineConfig(({ mode }) => {
  // Load env from the project root so VITE_* vars from root .env are found
  const env = loadEnv(mode, projectRoot, '');
  return {
    plugins: [react(), tailwindcss()],
    // Tell Vite where to look for .env files (project root, not /frontend)
    envDir: projectRoot,
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      emptyOutDir: true,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify — file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: `http://localhost:${env.PORT || 3000}`,
          changeOrigin: true,
          secure: false,
        }
      }
    },
  };
});
