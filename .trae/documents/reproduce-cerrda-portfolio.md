# 复现 Karot 个人作品集站点

## Context（背景）
用户创建了 `master` 分支，要求把当前 Vue 3 + Vite + TS + Tailwind 的 careercompass 求职应用**删掉现有所有业务模块**，改为复现
`https://Karot.github.io/Karot/articles/` 这一页的个人作品集效果。

已确认范围：
- **主页 + 文章详情页**（主页复现 /articles/ 落地页；再建 10 个文章详情页 `/articles/:slug`）
- **文案用原站中文文案**
- **删除登录/鉴权，完全公开**

视觉要点（来自对参考站的样式级分析）：
- 深紫近黑背景 `#1A1520`，粉紫点缀，近白文字；圆角 `0.9rem`
- 字体 Sora + Outfit（CJK 走系统字体）
- 顶部固定导航（品牌小圆图 + 链接），单页长滚动、多分区、垂直居中，`max-w-6xl`
- 液态玻璃卡片（`color-mix` 半透明 + 半透明白边框 + 对角高光）、磨砂 chips、光标聚光 hover、药丸圆角链接
- **背景用 WebGL Canvas 动画（Silk 丝绸 shader + 粒子 + 光轨）**，入场/滚动峰值错峰动画
- 分区顺序：Hero → 统计/轴卡片 → 开源/Agent Skill → 文章库(按年份 2026/2025/2024/2023) → 轨迹 → 页脚 Connect/Contact

## 架构决策
- **删除** careercompass 结构：`src/views/{app,auth}/*`、`NotFound/Pricing/PrivacyPolicy/Terms`、`src/layouts/`、`src/stores/auth.ts`，及文件路由自动生成链路 `src/router/{auto-routes,guard,meta,types}.ts`
- **改显式路由**：`src/router/index.ts` 直接声明 `home`、`articles/:slug`、404 三条；保留守卫仅做页面标题
- **简化入口**：`main.ts` 去掉 i18n 与 auth 初始化；`App.vue` 去掉 Element ConfigProvider，仅保留 `RouterView`
- **复用**：Tailwind 构建、`src/styles`、`cn` 工具；`lucide-vue-next` 图标已在依赖中

## 设计令牌 / 主题
- 更新 `tailwind.config.ts` 的 color 映射与字体为紫色系；更新 `src/styles/base/variables.css` 的 CSS 变量（background `#1A1520`、primary 粉紫、ring、radius 等），统一由 Tailwind 复用
- `index.html`：站点标题、`theme-color`、Google Fonts 引入 Sora + Outfit

## Canvas 背景
- 新增 `src/components/canvas/SilkBackground.vue`：单 `canvas` + `requestAnimationFrame`，绘制缓慢流动的丝绸渐变 + 移动粒子，视差随滚动偏移，GPU-friendly；
  遵循 `prefers-reduced-motion`（减少动效时静止），随组件卸载清理 rAF

## 新增视图 / 数据
遵循项目工程约定（模块下一 index + 一个 types；有 detail 建 detail 文件夹；有组件建 components 文件夹）：
- `src/views/index.vue` —— 主页（复现落地页全部分区）
- `src/views/articles/[slug].vue` —— 文章详情页
- `src/data/articles.ts` —— 10 篇文章数据（slug、标题、分类 tag、日期、描述；详情正文用对应描述扩展的占位正文）
- `src/views/index/components/*` 与 `src/views/articles/components/*` 拆分子组件（SectionHeader、ArticleList、Timeline、NavBar、Footer、ArticleHeader 等）
- `src/views/articles/detail/`? 采用 `[slug].vue` 作为动态段即可，符合既有文件路由风格；detail 正文组件放 `articles/components/`

## 需要修改/删除的关键文件
- 删除：`src/views/app/**`、`src/views/auth/**`、`src/views/NotFound.vue`、`src/views/Pricing.vue`、`src/views/PrivacyPolicy.vue`、`src/views/Terms.vue`、`src/layouts/**`、`src/stores/auth.ts`、`src/router/{auto-routes,guard,meta,types}.ts`
- 修改：`src/main.ts`、`src/App.vue`、`src/router/index.ts`、`index.html`、`tailwind.config.ts`、`src/styles/base/variables.css`、`src/config/env.ts`(appTitle 改为站点名，可选)
- 新增：`src/views/index.vue`、`src/views/articles/[slug].vue`、`src/data/articles.ts`、`src/components/canvas/SilkBackground.vue` 及上述子组件、`src/views/index/types.ts`、`src/views/articles/types.ts`

## 验证
- `npm run dev` 启动，访问 `/`：
  - 背景 Canvas 动画正常、随滚动视差、reduce-motion 生效
  - 导航链接（关于/开源/文章/轨迹）锚点滚动到位
  - 文章条目可进入 `/articles/:slug` 详情页并正常返回
- `npm run build`（`vue-tsc --noEmit && vite build`）通过无类型错误
- 手动核对配色/圆角/药丸链接/液态玻璃/聚光 hover 接近参考站观感；在暗色背景下无白屏或 404