# CareerCompass Vue

CareerCompass 的 Vue3 + Vite + TypeScript 版本。

## 技术栈

- **框架**: Vue 3.5+ (Composition API)
- **构建工具**: Vite 6
- **语言**: TypeScript
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI 组件**: 自定义组件 (受 shadcn/ui 启发)
- **样式**: Tailwind CSS 3
- **后端服务**: Firebase (Auth, Firestore, Storage)
- **表单验证**: VeeValidate + Zod
- **图标**: Lucide Vue

## 项目结构

```
careercompass-main-vue/
├── src/
│   ├── components/       # 可复用组件
│   │   └── ui/          # UI 基础组件
│   ├── composables/     # Vue 组合式函数
│   ├── layouts/         # 页面布局
│   ├── lib/             # 工具函数和配置
│   ├── router/          # 路由配置
│   ├── stores/          # Pinia 状态管理
│   ├── styles/          # 全局样式
│   ├── views/           # 页面视图
│   │   ├── auth/        # 认证相关页面
│   │   ├── employer/    # 雇主页面
│   │   └── admin/       # 管理员页面
│   ├── App.vue          # 根组件
│   ├── main.ts          # 入口文件
│   └── env.d.ts         # 环境变量类型定义
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── .env.example         # 环境变量示例
```

## 安装依赖

```bash
npm install
```

## 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 Firebase 配置：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，填入你的 Firebase 项目配置信息。

## 开发

```bash
npm run dev
```

应用将在 `http://localhost:9002` 启动。

## 构建

```bash
npm run build
```

## 预览构建结果

```bash
npm run preview
```

## 类型检查

```bash
npm run typecheck
```

## 代码检查

```bash
npm run lint
```

## 主要功能

- ✅ 用户认证 (邮箱/密码、Google 登录)
- ✅ 角色路由 (员工、雇主、管理员)
- ✅ 响应式侧边栏导航
- ✅ 机会浏览和筛选
- ✅ 深色模式支持
- ✅ 表单验证
- ✅ Toast 通知系统

## 与原 Next.js 项目的区别

1. **路由**: 使用 Vue Router 替代 Next.js 文件系统路由
2. **状态管理**: 使用 Pinia 替代 React Context
3. **组件**: 使用 `.vue` 单文件组件替代 `.tsx`
4. **环境变量**: 使用 `VITE_` 前缀替代 `NEXT_PUBLIC_`
5. **构建工具**: 使用 Vite 替代 Next.js 内置构建系统
6. **SSR**: 当前版本为纯客户端渲染 (CSR)，不包含 SSR

## 待完成功能

- [ ] 完善所有页面内容
- [ ] 实现 AI 工具集成
- [ ] 添加聊天功能
- [ ] 实现通知系统
- [ ] 添加文件上传功能
- [ ] 实现支付集成 (Stripe)
- [ ] 添加 PWA 支持

## 许可证

与原项目保持一致。
