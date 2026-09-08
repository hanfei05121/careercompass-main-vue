# CareerCompass Vue

CareerCompass 的 Vue3 + Vite + TypeScript 版本。

## 技术栈

- **框架**: Vue 3.5+ (Composition API)
- **构建工具**: Vite 6
- **语言**: TypeScript
- **路由**: Vue Router 4（基于文件目录自动生成）
- **状态管理**: Pinia
- **UI 组件**: Element Plus（按需引入）+ 自定义组件 (受 shadcn/ui 启发)
- **样式**: Tailwind CSS 3 + 统一 CSS 目录
- **国际化**: Vue I18n（简体中文 / English）
- **请求**: Axios（统一封装 + 按模块组织）
- **后端服务**: Firebase (Auth, Firestore, Storage)
- **表单验证**: VeeValidate + Zod / Element Plus 表单规则
- **图标**: Lucide Vue + Element Plus Icons

## 目录结构与约定

```
careercompass-main-vue/
├── src/
│   ├── api/                 # 接口层
│   │   ├── request.ts       #   axios 实例 / 拦截器 / 统一响应
│   │   ├── types/           #   按模块拆分的 TS 类型
│   │   ├── modules/         #   按模块拆分的接口（文件名 = 模块名，导出 xxxApi）
│   │   └── mock/            #   本地 mock（文件名 = 模块名 + .mock.ts）
│   ├── components/
│   │   ├── common/          # 业务公共组件（BasePage / BaseTable / BaseForm / BaseDialog）
│   │   └── ui/              # 基础 UI 组件
│   ├── composables/         # Vue 组合式函数
│   ├── config/              # 环境变量统一出口（禁止业务直接读 import.meta.env）
│   ├── constants/           # 全局常量与业务字典
│   ├── layouts/             # 页面布局（*Layout.vue）
│   ├── locales/             # 国际化
│   │   └── lang/            #   按语言 → 按业务域拆分语言包
│   ├── lib/                 # 第三方服务初始化（firebase 等）
│   ├── router/              # 路由
│   │   ├── auto-routes.ts   #   基于 src/views 自动生成路由
│   │   ├── meta.ts          #   路由元信息补充（标题 / 权限 / 通配）
│   │   └── guard.ts         #   路由守卫
│   ├── stores/              # Pinia 状态管理
│   ├── styles/              # 全部样式（唯一 CSS 目录）
│   │   ├── base/            #   变量 / 重置 / 排版 / 滚动条
│   │   ├── layout/          #   布局 / 过渡
│   │   ├── components/      #   组件库覆盖（element / form / table）
│   │   └── utils/           #   工具类
│   ├── utils/               # 通用函数（date / validate / rules / format / storage / common）
│   ├── views/               # 页面（文件地址即路由地址）
│   │   ├── app/             #   需登录区域：自动套用 AppLayout，URL 中不含 app
│   │   └── auth/            #   登录 / 注册 / 找回密码
│   └── main.ts
├── .env / .env.development / .env.test / .env.production
├── eslint.config.js / .prettierrc.json / .editorconfig
└── vite.config.ts
```

### 路由约定（文件地址即路由地址）

| 文件 | 路由 | name | 说明 |
| --- | --- | --- | --- |
| `views/index.vue` | `/` | `home` | index.vue 映射为目录根路径 |
| `views/auth/Login.vue` | `/auth/login` | `auth-login` | 文件名 PascalCase → 路径 kebab-case |
| `views/Pricing.vue` | `/pricing` | `pricing` | 公共页，无需登录 |
| `views/app/Dashboard.vue` | `/dashboard` | `dashboard` | app 目录下自动套用 AppLayout 且需登录 |
| `views/app/opportunities/[id].vue` | `/opportunities/:id` | `opportunities-id` | `[param]` 为动态段，`[[param]]` 为可选段 |
| `views/app/admin/index.vue` | `/admin` | `admin` | |

自动生成之外的信息（标题 i18n key、角色权限、通配路由）统一配置在 `src/router/meta.ts`。

### 样式约定

- 所有 CSS 必须放在 `src/styles` 下，按 `base / layout / components / utils` 分模块；
- 入口为 `src/styles/index.ts`，按「变量 → tailwind → 重置 → 布局 → 工具类 → 组件覆盖」顺序引入；
- `src/styles/tailwind.css` 是全项目唯一出现 `@tailwind` 指令的文件；
- 业务组件只允许写 `scoped` 样式，禁止全局样式与硬编码色值（统一使用 CSS 变量）。

### 接口约定

- 后端统一返回 `{ code, data, message }`，`code === 0` 为成功，业务里直接拿到 `data`；
- 新增模块：在 `api/modules/` 新建 `模块名.ts`（导出 `模块名Api`），类型放 `api/types/模块名.ts`；
- `VITE_USE_MOCK=true` 时走 `api/mock/`，后端未就绪也能联调。

### 国际化约定

- 语言包放在 `locales/lang/{语言}/{业务域}.ts`，新增模块后在同级 `index.ts` 注册；
- `en-US` 作为 schema 基准，`zh-CN` 缺 key 会触发类型报错，保证双语同步；
- 组件内用 `useI18n()` 的 `t`，组件外（工具函数、路由守卫）用 `@/locales` 导出的 `t()`。

## 环境配置

| 文件 | 说明 |
| --- | --- |
| `.env` | 通用变量（所有环境共享） |
| `.env.development` | 开发环境：走本地代理、默认开启 mock、关闭鉴权 |
| `.env.test` | 测试环境：连测试后端、保留 sourcemap |
| `.env.production` | 生产环境：关闭 mock / devtools，移除 console |

新增变量需同步维护 `src/env.d.ts` 与 `src/config/env.ts`。

## 命令

```bash
npm run dev           # 开发环境（.env.development）
npm run dev:test      # 以 test 环境启动开发服务
npm run build         # 生产构建（含类型检查）
npm run build:test    # 测试环境构建
npm run preview       # 预览构建产物
npm run typecheck     # 类型检查
npm run lint          # 代码检查
npm run lint:fix      # 代码检查并修复
npm run format        # Prettier 格式化
```

## 主要功能

- ✅ 用户认证 (邮箱/密码、Google 登录、本地模拟登录)
- ✅ 角色路由 (求职者、雇主、管理员)
- ✅ 响应式侧边栏导航
- ✅ 机会浏览和筛选
- ✅ 深色模式支持
- ✅ 中英双语切换
- ✅ 表单验证 + 统一校验规则
- ✅ Toast / Message 通知

## 待完成功能

- [ ] 完善所有页面内容
- [ ] 页面业务文案的 i18n 全量迁移
- [ ] 实现 AI 工具集成
- [ ] 添加聊天功能
- [ ] 实现通知系统
- [ ] 实现支付集成 (Stripe)
- [ ] 添加 PWA 支持

## 许可证

与原项目保持一致。
