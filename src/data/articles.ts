/**
 * 文章数据：复现 Karot 作品集的 10 篇文章（文案沿用原站中文）。
 * slug 与原站 /articles/<slug> 保持一致。
 */

export interface ArticleType {
  /** 路由段：/articles/:slug */
  slug: string
  /** 序号（01-10） */
  no: string
  /** 分类 tag */
  tag: string
  /** 标题 */
  title: string
  /** 摘要（列表卡片与详情页引言使用） */
  desc: string
  /** 日期 YYYY-MM-DD */
  date: string
  /** 所属年份（文章库按年份分组） */
  year: string
  /** 详情页正文段落 */
  body: string[]
}

export const ARTICLES: ArticleType[] = [
  {
    slug: 'dsh-Karot-theme',
    no: '01',
    tag: '前端设计',
    title: '给 DeepSeek Harness（DSH） 换上液态玻璃丝绸暗色主题',
    desc: '把 Karot 玫瑰深紫液态玻璃主题做成 DSH 部署级插件，装上重启即可生效。',
    date: '2026-08-18',
    year: '2026',
    body: [
      'DeepSeek Harness（DSH） 是一个面向大模型工程化的 Web 控制台。本文将 Karot 的玫瑰深紫液态玻璃视觉语言，做成 DSH 的部署级主题插件。',
      '整个主题以液态玻璃为核心：`color-mix(in oklch, var(--card) 58%, transparent)` 构造半透明面板，配合白描边与对角高光，让界面在深紫背景上呈现丝滑透亮的质感。',
      '为了保证生产可用，主题被打包为部署级 bundle，装进节点后重启即可在全局生效，无需在 Web GUI 中逐项审批。',
      '同时实现了无障碍降级：当系统开启“减少透明 / 减少动效”时，主题自动切换为更实的卡片底色并关闭动画，兼顾观感与可访问性。',
    ],
  },
  {
    slug: 'scrapling-config-crawl-skill',
    no: '02',
    tag: '爬虫 · Agent Skill',
    title: '把配置驱动爬虫做成可安装 Skill：scrapling-config-crawl',
    desc: '按 config.py 的 id 生成 scrapling 脚本并写入 SQLite，把翻页校验与增量采集固化成 Agent Skill。',
    date: '2026-08-12',
    year: '2026',
    body: [
      '爬虫脚本最怕“一人一版、互不相同”。这个 Skill 以 config.py 的 id 作为唯一入口，自动生成对应的 scrapling 采集脚本。',
      '增量写入与附件分流被固化为默认行为：主表按 id 做 upsert，附件单独落盘，避免重复抓取。翻页边界与合规范围由配置驱动，脚本只是配置的投影。',
      '所有脚本强制复用项目内公共 utils，避免各自为政。平台仅对依法公开的数据开放，合规边界写进了 Skill 的硬性规则。',
    ],
  },
  {
    slug: 'faker-mock-setup-skill',
    no: '03',
    tag: 'AI 编程 · Cursor',
    title: '把团队 Mock 工作流做成可安装 Skill：faker-mock-setup 上架 skills.sh 实践',
    desc: '把「按 OpenAPI 生成页面级 Faker Mock」固化为可安装 Skill，改善前端联调体验。',
    date: '2026-08-11',
    year: '2026',
    body: [
      '前端联调最大的摩擦，是把接口定义与 Mock 数据这两份事实对齐。这个 Skill 面向 Vue / Vite + MSW 的联调场景，把整个流程自动化。',
      '它由函数名或 URL 反推 ApiId，自动生成页面级 `setup{ApiId}MockHandler`，并按 OpenAPI 生成符合接口形状的 Faker overrideResponse 数据。',
      '团队约定由此变成一份可安装、可复用的 Agent 工作流：触发条件、生成模板与边界都写进 Skill，任何成员随装随用。',
    ],
  },
  {
    slug: 'unocss-svg-hmr',
    no: '04',
    tag: '架构 · 前端框架',
    title: '开发体验升级：UnoCSS 自定义 SVG 图标热更新方案',
    desc: '用 chokidar + @iconify/tools + configDeps 实现图标热更新，无需重启开发服务器。',
    date: '2026-07-01',
    year: '2026',
    body: [
      '在 UnoCSS 体系中，新增一枚自定义 SVG 图标往往需要重启开发服务器才能被新绑定解析，非常打断心流。',
      '本方案用 chokidar 监听图标目录，变更时通过 @iconify/tools 把 SVG 转换成 presetIcons 可用的集合，再用 configDeps 触发 uno 配置热更。',
      '于是：拖入一张 SVG，编辑器与页面在同一秒内完成补全与刷新，无需任何重启。',
    ],
  },
  {
    slug: 'vue3-vcopy',
    no: '05',
    tag: '前端代码规范',
    title: '一行指令搞定复制：Vue 3 vCopy 实现解析',
    desc: '基于 VueUse useClipboard 与 Element Plus 虚拟 Tooltip 的复制指令实现。',
    date: '2026-06-01',
    year: '2026',
    body: [
      '复制反馈是表格与代码块里的高频交互。vCopy 把整套逻辑收进一个指令：绑定后点击即可复制，并轻量提示结果。',
      '借助 VueUse 的 useClipboard 处理剪贴板兼容；反馈提示使用 Element Plus 的虚拟 Tooltip，不额外新增真实 DOM 实例。',
      '最终调用方只需一行 `v-copy="text"`，行为与交出一致且可复用。',
    ],
  },
  {
    slug: 'unocss-icons',
    no: '06',
    tag: '前端代码规范',
    title: '从 uno.config.ts 看懂 UnoCSS 图标方案',
    desc: 'presetIcons 与 Iconify 工具链：本地 SVG 到原子类与 VS Code 补全。',
    date: '2026-06-01',
    year: '2026',
    body: [
      'UnoCSS 的图标方案把“引图标”这条链路彻底简化：用原子类即用即取，不再靠 JS 显式 import。',
      'presetIcons 负责把 Iconify 集合或本地 SVG 解析成 CSS 类；配合 VS Code 扩展，输入前缀即可获得图标补全。',
      '本文从 uno.config.ts 出发，逐步拆解 presetIcons 的加载顺序、本地 collection 的注册方式以及构建期的体积优化。',
    ],
  },
  {
    slug: 'tooltip-perf',
    no: '07',
    tag: '设计 · 前端',
    title: '性能提升 satisfying！一个 Vue3 指令干掉页面上 200 个无用 Tooltip 实例',
    desc: '按需创建虚拟 Tooltip，消灭中后台表格中的无效 Tooltip 实例。',
    date: '2026-05-01',
    year: '2026',
    body: [
      '中后台表格动辄上千行，如果每行都常驻一个 Tooltip 组件，实例数以百记，卡顿随之而来。',
      'v-ellipsis-tooltip 只在“文本真正溢出”时才创建虚拟 Tooltip，用 Element Plus 的虚拟容器按需挂载，极大压低常驻实例数。',
      '配合单一指令调用，把性能收益和代码可读性同时拿到手。',
    ],
  },
  {
    slug: 'v-ellipsis-tooltip',
    no: '08',
    tag: '前端 · Vue.js',
    title: '一行代码解决文本溢出提示：Vue 3 + Element Plus 打造智能 v-ellipsis-tooltip 指令',
    desc: '仅在文本真正溢出时展示 Tooltip 的自定义指令。',
    date: '2026-02-01',
    year: '2026',
    body: [
      '表格里最常见的需求：文本过长时省略号展示，悬浮时给出完整 Tooltip。难点在于“未溢出就不该出现提示”。',
      '该指令在 mounted 与 resize 时测量 `scrollWidth` 与 `clientWidth`，只有真正溢出才实例化 Tooltip。',
      '最终调用方只需一行 `v-ellipsis-tooltip`，溢出判定与提示逻辑完全黑盒化。',
    ],
  },
  {
    slug: 'uniapp-nav-bar',
    no: '09',
    tag: 'uni-app',
    title: 'uni-app 自适应透明导航栏组件',
    desc: '支持滚动渐变透明的现代导航栏交互体验。',
    date: '2025-12-01',
    year: '2025',
    body: [
      '在现代 App 中，导航栏跟随滚动从透明切入实体底色已是标配交互。本组件把这段体验封装为 uni-app 可复用组件。',
      '组件监听页面滚动距离，动态插值背景透明度与文字对比度，同时适配不同平台的状态栏高度差异。',
      '接入成本被压缩到“引入 + 一个透明度绑定”，页面间风格天然统一。',
    ],
  },
  {
    slug: 'fnm-windows',
    no: '10',
    tag: '前端',
    title: 'Windows 系统中使用 fnm 自动管理 node 版本',
    desc: '打开项目时自动切换到项目所需的 Node 版本。',
    date: '2025-12-01',
    year: '2025',
    body: [
      '开发机上的 Node 版本经常随项目波切换，手动切换既慢又容易踩坑。fnm 是跨平台的原生版本管理器，天生的 Shell Hook 支持自动切换。',
      '配置好 fnm 的 `use-on-cd`（或通过 Vite 侧接入）后，进入目录即自动切换到 `.node-version` / `package.json` engines 指定的版本。',
      '本文给出在 Windows + PowerShell 下的完整配置步骤，让团队每个成员开箱即用、版本一致。',
    ],
  },
]

export const getArticleBySlug = (slug: string): ArticleType | undefined =>
  ARTICLES.find((a) => a.slug === slug)

/** 文章库按年份分组（倒序） */
export const groupArticlesByYear = (): Array<{ year: string; items: ArticleType[] }> => {
  const map = new Map<string, ArticleType[]>()
  for (const a of ARTICLES) {
    const list = map.get(a.year) ?? []
    list.push(a)
    map.set(a.year, list)
  }
  return Array.from(map.entries())
    .sort((x, y) => (x[0] > y[0] ? -1 : 1))
    .map(([year, items]) => ({ year, items }))
}