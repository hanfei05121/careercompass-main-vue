/**
 * 文章数据：基于今年真实项目（cr-sys-web-ui / tpdtalk / outsource-web-ui）提炼的实践总结。
 */

export interface ArticleType {
  /** 路由段：/articles/:slug */
  slug: string
  /** 序号 */
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
    slug: 'contract-pdf-diff',
    no: '01',
    tag: '中后台 · 工具链',
    title: '在浏览器里给合同做「双栏比对」：pdf.js 抽行坐标 + Myers diff',
    desc: 'OnlyOffice 编辑器 iframe 跨域拿不到滚动同步 API，于是用 pdf.js 自渲染双栏，把差异高亮画回 PDF 画布。',
    date: '2026-09-20',
    year: '2026',
    body: [
      '应收管理系统里有个硬需求：两版合同要并排比对，差异行高亮，还要能点击跳转。OnlyOffice 编辑器本身有比对模式，但它跑在跨域 iframe 里，既没有滚动同步 API，也拿不到内部文档结构。',
      '最终方案是绕开编辑器：非 PDF 文件先走后端 convert-pdf 接口转成 PDF，前端用 pdf.js 自己渲染双栏。每栏缓存各页在滚动容器里的 offset 和 height，滚动时按「页序锚定」同步另一栏，而不是像素级同步——这样即使两版页数不同也能对齐。',
      '差异计算分两层：先用 pdf.js 的 getTextContent 抽出逐行文本，同时记录每行的 transform 坐标算出包围盒；再对两侧行数组跑 Myers 行级 diff，得到 same / del / add 三种行。',
      '最后把 del / add 行的包围盒换算成页面坐标，在 PDF 画布上叠加半透明色块（左栏红、右栏绿，VSCode 合并配色），点击差异块即可在两栏间跳转。整个过程不依赖任何服务端 diff 服务，纯前端完成。',
    ],
  },
  {
    slug: 'milestone-tree-table',
    no: '02',
    tag: '中后台 · 表格',
    title: '里程碑 / 批次两级树形表格：行内编辑与金额联动校验',
    desc: '收款条款登记页的核心交互：树形展开、行内编辑、父子金额上限校验，一个 helper 收敛全部数据变换。',
    date: '2026-09-02',
    year: '2026',
    body: [
      '收款条款的数据结构是「里程碑 → 批次」两级树。列表页要树形展开、详情页要行内编辑，两套页面共用同一份后端数据，但展示形态完全不同。',
      '做法是把数据变换全部收敛到 milestone-tree helper：buildListMilestoneTree 给列表页生成带 children 的树形行，buildDetailMilestoneTree 额外挂 _source 引用，行内编辑时直接改源对象，避免整树重建。',
      '金额校验是最容易出 bug 的部分：调整某里程碑的「预计应收」时，其下批次的预计应收之和不能超过新值与原值中较大者；未编辑的行要用原始值兜底而不是 0。这些规则全部写在 adjust-estimated-dialog 里，提交前统一计算 originalAmount / newAmount 交给后端留痕。',
      '经验：树形表格的行内编辑，关键是让「编辑态」和「源数据」之间有明确的双向通道。用 _source 引用比 deep clone 再 diff 回写稳定得多。',
    ],
  },
  {
    slug: 'live-websocket-room',
    no: '03',
    tag: 'H5 · 实时通信',
    title: 'WebSocket 直播间：弹幕、红包雨、抽奖转盘如何共用一条连接',
    desc: '一条 WebSocket 连接分发弹幕、红包、抽奖、公告四类消息，断线重连用锁防抖，弹幕高度按视频区实测。',
    date: '2026-08-15',
    year: '2026',
    body: [
      '社区论坛的直播间页面同时跑着四类实时逻辑：弹幕消息、红包雨触发、抽奖转盘状态、官方公告。如果每类各开一条 WebSocket，服务端压力和前端状态管理都会失控。',
      '方案是单连接 + 消息类型分发：messageHandle 里按消息 type 路由到对应的处理函数，弹幕进 vue3-danmaku 队列，红包雨触发 grabRedPacket 组件，抽奖更新 lotteryInfo 状态。',
      '断线重连用 lockReconnect 锁防抖：close 事件触发 reconnect，但同一时刻只允许一个重连定时器，延迟 2 秒避免请求风暴。重连后自动重新拉取历史评论补齐断线期间的消息。',
      '一个细节：聊天区高度不是写死的，而是在 computed 里实时用「视口高度 - 视频区实测高度」算出来，保证不同机型上视频区和聊天区正好填满屏幕。',
    ],
  },
  {
    slug: 'contenteditable-post',
    no: '04',
    tag: 'H5 · 富文本',
    title: 'contenteditable 发帖框：@提及、表情、字数上限的输入劫持方案',
    desc: '不用现成富文本编辑器，用 contenteditable + beforeinput 拦截，把字数上限、粘贴清洗、@联想全部收进一个组件。',
    date: '2026-08-01',
    year: '2026',
    body: [
      '移动端发帖框的需求看着简单：输入文字、插表情、@人、传图视频，上限 500 字。但用现成富文本编辑器要么太重，要么移动端体验差。',
      '最终用原生 contenteditable div + content-editable-extension-js 库自己搭。核心是 beforeinput 事件拦截：达到字数上限时直接 preventDefault 阻止插入，但放行删除、粘贴、撤销等操作——比 input 后再截断体验好得多，不会出现「打了字又消失」的闪烁。',
      '粘贴清洗用正则把非 img 标签全部剥掉，只留图片；光标位置在 paste 时同步记录，避免异步处理时 selection 丢失。@联想监听 compositionend（中文输入法）后取光标前文本匹配话题列表。',
      '这套逻辑 H5 和 PC 两端共用同一个组件，行为完全一致——这是双端并行开发时最省心的做法。',
    ],
  },
  {
    slug: 'use-load-more-hook',
    no: '05',
    tag: 'H5 · 组合式函数',
    title: 'useLoadMore：一个分页 hook 统一 H5 全站的列表加载',
    desc: '内部锁与 van-list 的 loading 分离，兼容 boolean 与 totalPages 两种返回约定，刷新重置一气呵成。',
    date: '2026-07-20',
    year: '2026',
    body: [
      'H5 项目里有十几个列表页：帖子流、评论、话题、圈子、消息……每个页面都要处理分页、加载中、没有更多、下拉刷新。最初各写各的，bug 层出不穷。',
      'useLoadMore 把这套状态收敛成一个 hook：currentPage / finished / loadingForList / refreshing 四个状态，loadMore 和 refreshHandle 两个方法。页面只需传入 getList 回调。',
      '两个关键设计：一是内部锁 isLoading 与 van-list 的 loading 属性分离——van-list 设置 loading 后会阻断自身的 load 事件，如果共用一个状态，快速滚动时会丢请求；二是 getList 返回值兼容 boolean 和 void 两种约定，旧页面返回 boolean 直接用，新页面用 totalPages 计算，渐进迁移不用一次性改完。',
      '刷新时 finished 重置为 false、页码归 1，再走一次 loadMore。整个 hook 65 行，替换掉了原先散落在各页面里约 400 行的重复逻辑。',
    ],
  },
  {
    slug: 'draggable-fab',
    no: '06',
    tag: 'H5 · 交互',
    title: '可拖拽悬浮球：touch 事件三段式与拖拽 / 点击的冲突消解',
    desc: 'touchstart 记录起点，touchmove 限位跟随，touchend 判断位移——拖拽和点击共存的关键是位移阈值。',
    date: '2026-07-05',
    year: '2026',
    body: [
      '首页右下角的发帖悬浮球，产品要求既能拖到任意位置，又能点击跳转发帖页。这两个手势天然冲突：拖动结束时手指抬起，click 事件也会触发。',
      'useDraggableFab 的解法是三段式 touch 事件：start 记录起点坐标和初始位置，move 里用 dx / dy 更新 bottom / right 并 clamp 到安全范围（不超出屏幕、不挡底部导航），end 时重置拖拽态。',
      '冲突消解靠 isDragging 标志：click 回调里先判断 isDragging，拖拽过就跳过跳转。同时拖拽期间关掉 transition，松手后恢复，避免位置回弹的视觉抖动。',
      '43 行代码，换来的是全站所有悬浮元素（发帖球、客服球、活动球）统一的手势行为。',
    ],
  },
  {
    slug: 'behavior-captcha',
    no: '07',
    tag: '中后台 · 安全',
    title: '四类行为验证码的前端实现：轨迹采集与防机器的本质',
    desc: '滑动、旋转、点选、拼接四类验证码共用一套轨迹采集逻辑，防的不是破解而是脚本。',
    date: '2026-06-18',
    year: '2026',
    body: [
      '外包平台的登录页要求接行为验证码。后端给了四种模式：滑动拼图、图片旋转、文字点选、图标拼接，前端要统一封装。',
      '核心是 useCaptcha 里的轨迹采集：down 时记录起点和时间戳，move 时持续 push {x, y, type, t}，up 时把完整轨迹数组连同耗时发给后端。四类验证码的差异只在「校验目标」——滑动要对齐缺口，旋转要转到正角度，点选要按序点击文字，拼接要拖到目标位。',
      '轨迹数据是防机器的关键：真人滑动有加速减速的曲线、有微小抖动，脚本生成的轨迹要么完全线性要么随机乱跳。后端拿轨迹做行为分析，前端只负责忠实采集。',
      '封装成 useCaptcha hook 后，四类验证码组件各自只写校验逻辑和渲染，采集、上报、刷新全部复用，新增一种验证模式只需实现校验部分。',
    ],
  },
  {
    slug: 'dict-driven-components',
    no: '08',
    tag: '中后台 · 组件设计',
    title: '字典驱动的一切：Dict 组件族如何吃掉全站的枚举渲染',
    desc: '一个 useDict hook 加七个组件，把下拉、单选、多选、标签、徽章的字典渲染全部数据驱动化。',
    date: '2026-06-01',
    year: '2026',
    body: [
      '中后台系统里到处是枚举：状态、类型、级别、渠道……最初每个页面自己拉字典、自己写映射，改一个枚举要动十几个文件。',
      'Dict 组件族的设计分两层：useDict hook 负责数据——从 dict-store 缓存取数、按 valueType 转换真实类型、按 itemFilter 过滤、按 itemDisabledChecker 置灰；组件层负责展示——DictSelect / DictRadioGroup / DictCheckboxGroup 覆盖输入场景，DictText / DictTag / DictBadge / DictTagGroup 覆盖展示场景。',
      '最值钱的是类型转换：字典项在接口里是字符串，但 valueType 声明它是 number 还是 boolean，hook 里统一 convertValueType，页面拿到的直接是可用值，不用每个地方再 Number() 一次。',
      '七个组件 + 一个 hook，全站枚举渲染收敛成「传 dictCode」一行。新增业务枚举时前端零代码，后端配好字典即可。',
    ],
  },
  {
    slug: 'multitab-keepalive',
    no: '09',
    tag: '中后台 · 布局',
    title: 'MultiTab 多页签：keepAlive 缓存与路由匹配组件的对应关系',
    desc: '页签切换不丢状态的关键：缓存的是「路由匹配链上所有组件的 name」，而不只是当前页组件。',
    date: '2026-05-12',
    year: '2026',
    body: [
      '外包平台用多页签布局：每个打开的页面是一个 tab，切换 tab 时前一个页面的搜索条件、表格数据要保留。Vue 的 keepAlive 天然适合，但坑在「缓存谁」。',
      '嵌套路由下一个页面往往由多个组件拼成（布局组件 + 页面组件 + 子组件）。如果只缓存页面组件，切 tab 时布局层的状态还是会丢。MultiTab 的 addCachedComponentNames 遍历路由匹配链 matchedRoutes，把每个 default 组件的 name 都加进缓存集合。',
      '另一个坑是组件 name 必须唯一且稳定：defineOptions({ name: "AttendanceMonthPage" }) 显式声明，不能依赖文件名推导——构建工具的 name 推导在压缩后会变。',
      '关闭页签时从缓存集合移除对应 name，下次打开重新挂载。整套机制跑在 multitab-store 里，页签的增删改查和缓存生命周期完全同步。',
    ],
  },
  {
    slug: 'oauth2-sso-flow',
    no: '10',
    tag: '中后台 · 认证',
    title: 'OAuth2 授权码模式的前端落地：URL 上的 code 要怎么洗掉',
    desc: '路由守卫里截获 iam code 换 token，再用 qs 重写 URL 抹掉敏感参数，刷新页面不会二次登录。',
    date: '2026-04-25',
    year: '2026',
    body: [
      '企业系统统一走 IAM 单点登录，授权码模式。回调时 URL 上会带 ?code=xxx，这个 code 只能用一次，留在地址栏里刷新页面就会报错。',
      '处理放在路由守卫 beforeEach：检测到 code 就调 login 接口换 token，成功后用 qs 把 search 参数里的 code 抹掉、保留其余参数，重新拼 URL 赋给 location.href——相当于一次无感刷新，用户完全察觉不到。',
      '没登录且不允许匿名访问时，直接整页跳到 IAM 的 authorize 地址，带上 client_id 和 redirect_uri；登录态失效则由 axios 拦截器统一 401 处理。',
      '另一个项目（应收系统）走的是 iframe 嵌入场景：父页面通过 postMessage 通知子页面 token 过期或刷新，useIframeAuth 统一监听 message 事件并校验 source，避免被任意窗口的消息劫持。',
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
