import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_DEV_PROXY_TARGET
  const httpsKeyPath = env.VITE_HTTPS_KEY
  const httpsCertPath = env.VITE_HTTPS_CERT
  const httpsAvailable =
    httpsKeyPath && httpsCertPath &&
    fs.existsSync(path.resolve(__dirname, httpsKeyPath)) &&
    fs.existsSync(path.resolve(__dirname, httpsCertPath))

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      host: true,
      port: 8080,
      https: httpsAvailable ? {
        key: fs.readFileSync(path.resolve(__dirname, httpsKeyPath)),
        cert: fs.readFileSync(path.resolve(__dirname, httpsCertPath)),
      } : undefined,
      proxy: proxyTarget ? {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: proxyTarget.replace(/^http/, 'ws'),
          changeOrigin: true,
          ws: true,
        },
      } : undefined,
    },
  }
})
