import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables
  const env = loadEnv(mode, process.cwd());
  
  // Get API URL from environment or use default
  const apiUrl = env.VITE_API_URL || 'http://localhost:3002/api';
  console.log(`Using API URL: ${apiUrl}`);
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api': {
          target: apiUrl.endsWith('/api') ? apiUrl.substring(0, apiUrl.length - 4) : apiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    }
  };
});