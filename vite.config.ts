import { defineConfig, loadEnv, type ConfigEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'node:path'

/** 字符串转布尔 */
const toBoolean = (value: unknown, fallback = false): boolean => {
  if (value === undefined || value === null || value === '') return fallback
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

export default defineConfig(({ mode }: ConfigEnv) => {
  // 读取当前模式下所有变量（含非 VITE_ 前缀）
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET
  const useProxy = toBoolean(env.VITE_USE_PROXY, true) && !!proxyTarget
  const sourcemap = toBoolean(env.VITE_SOURCEMAP, mode !== 'production')
  const dropConsole = toBoolean(env.VITE_DROP_CONSOLE, mode === 'production')
  const enableDevtools = toBoolean(env.VITE_ENABLE_DEVTOOLS, mode !== 'production')

  return {
    plugins: [
      vue(),
      // API 自动按需引入（ElMessage / ElMessageBox / Vue 组合式 API 等）
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      }),
      // 组件自动按需引入（ElButton / ElTable 等，无需手动 import 与注册）
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'css' })],
        dts: 'src/types/components.d.ts',
        // 排除 shadcn 风格本地组件目录，避免与 Element Plus 组件名混淆
        exclude: [/[\\/]node_modules[\\/]/, /[\\/]src[\\/]components[\\/]/],
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    define: {
      __VUE_PROD_DEVTOOLS__: enableDevtools,
    },

    server: {
      host: true,
      port: 9002,
      open: false,
      proxy: useProxy
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              // 本地开发把 /api 前缀转发到后端，后端无需感知 /api
              rewrite: (p: string) => p.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },

    preview: {
      host: true,
      port: 9003,
    },

    build: {
      outDir: 'dist',
      sourcemap,
      chunkSizeWarningLimit: 1500,
      // 生产构建压缩时移除 console / debugger
      minify: 'esbuild',
      esbuild: {
        drop: dropConsole ? ['console', 'debugger'] : [],
        pure: dropConsole ? ['console.log'] : [],
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus', '@element-plus/icons-vue'],
            vendor: ['axios', 'date-fns'],
          },
        },
      },
    },

    esbuild: {
      // 统一去掉源码中的调试语句之外的纯标记
      legalComments: 'none',
    },
  }
})
