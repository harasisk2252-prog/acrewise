import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.API_PROXY_TARGET || 'http://127.0.0.1:8000';
  const proxy = { target, changeOrigin: true, ...(env.API_KEY ? { headers: { 'X-API-Key': env.API_KEY } } : {}) };
  return { plugins: [react()], server: { proxy: { '/api': proxy, '/health': proxy } } };
});
