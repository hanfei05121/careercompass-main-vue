import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

const require = createRequire(import.meta.url)

/**
 * unplugin-auto-import 生成的全局变量（未显式 import 的 API）。
 * 文件由 vite 启动时生成，若不存在则降级为空对象。
 */
const autoImportFile = './.eslintrc-auto-import.json'
const autoImportGlobals = existsSync(autoImportFile) ? require(autoImportFile).globals : {}

export default defineConfigWithVueTs(
  {
    name: 'app/ignores',
    ignores: [
      'dist/**',
      'node_modules/**',
      '.workbuddy/**',
      'src/types/auto-imports.d.ts',
      'src/types/components.d.ts',
    ],
  },

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    name: 'app/globals',
    languageOptions: {
      globals: {
        ...autoImportGlobals,
      },
    },
  },

  {
    name: 'app/rules',
    files: ['**/*.{ts,tsx,js,mjs,vue}'],
    rules: {
      // 文件路由下存在 index.vue 等单文件命名
      'vue/multi-word-component-names': 'off',
      'vue/component-api-style': ['warn', ['script-setup']],
      'vue/block-order': ['warn', { order: ['script', 'template', 'style'] }],
      'vue/attributes-order': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'debug'] }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },

  skipFormatting,
)
