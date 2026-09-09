/**
 * 卡片动效演示模块 —— 共享类型与静态数据
 * 所有动画组件共用同一套演示卡片，便于横向对比各种动效的差异。
 */

/** 演示用卡片 */
export interface DeckCard {
  id: number
  /** 卡片标题（示例职位） */
  title: string
  /** 副标题（示例公司） */
  subtitle: string
  /** 右上角标签 */
  tag: string
  /** tailwind 渐变类名（需以完整字符串出现，便于 JIT 扫描生成） */
  gradient: string
}

/** 10 种卡片滑动动画的类型标识（同时作为路由 /cards/:type 的参数） */
export type CardAnimationType =
  | 'stack-swipe'
  | 'coverflow'
  | 'snap-carousel'
  | 'fan-spread'
  | 'flip-swipe'
  | 'wheel-scroll'
  | 'cube-rotate'
  | 'peek-side'
  | 'explode-gather'
  | 'overshoot-slide'

/** 动画清单条目：列表页展示 + 详情页标题/说明 */
export interface CardAnimationMeta {
  type: CardAnimationType
  /** 中文名 */
  name: string
  /** 英文名 */
  enName: string
  /** 核心动作描述 */
  action: string
  /** 视觉特点描述 */
  visual: string
}

/** 演示卡片数据 */
export const DECK_CARDS: DeckCard[] = [
  {
    id: 1,
    title: '前端工程师',
    subtitle: '星海科技 · 远程',
    tag: '全职',
    gradient: 'from-rose-500 to-orange-400',
  },
  {
    id: 2,
    title: '产品经理',
    subtitle: '云图数据 · 上海',
    tag: '全职',
    gradient: 'from-sky-500 to-indigo-500',
  },
  {
    id: 3,
    title: 'UI 设计师',
    subtitle: '光年设计 · 杭州',
    tag: '合约',
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    id: 4,
    title: '数据分析师',
    subtitle: '潮汐金融 · 深圳',
    tag: '全职',
    gradient: 'from-emerald-500 to-teal-400',
  },
  {
    id: 5,
    title: '后端工程师',
    subtitle: '磐石云 · 北京',
    tag: '全职',
    gradient: 'from-amber-500 to-rose-500',
  },
  {
    id: 6,
    title: '增长运营',
    subtitle: '青藤传媒 · 成都',
    tag: '实习',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 7,
    title: '算法工程师',
    subtitle: '深蓝智能 · 广州',
    tag: '全职',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    id: 8,
    title: '项目助理',
    subtitle: '领航人力 · 南京',
    tag: '兼职',
    gradient: 'from-lime-500 to-emerald-500',
  },
]

/** 10 种卡片滑动动画清单（顺序即列表展示顺序） */
export const CARD_ANIMATIONS: CardAnimationMeta[] = [
  {
    type: 'stack-swipe',
    name: '层叠滑走',
    enName: 'Stack swipe',
    action: '顶部卡片带着旋转向画面外滑出飞远，下一张立刻从下方顶上来，对齐后回弹。',
    visual: '飞出时旋转明显，新卡入场有“顶上来”的力量感和弹性反馈。',
  },
  {
    type: 'coverflow',
    name: '封面流',
    enName: 'Coverflow',
    action: '当前卡片在中间最大，左右两侧卡片向外立起，形成翻书般的透视。',
    visual: '空间纵深明显，中间突出，两侧卡片透视缩小并立起。',
  },
  {
    type: 'snap-carousel',
    name: '横向吸附',
    enName: 'Snap carousel',
    action: '一排卡片横向排列，松手后自动“咬住”画面正中位置。',
    visual: '移动流畅，吸附归位精准，不会停在半中间。',
  },
  {
    type: 'fan-spread',
    name: '扇形展开',
    enName: 'Fan spread',
    action: '卡片如扑克牌先呈扇形散开，再把目标卡抽到最前，其余收回。',
    visual: '散开自然，抽牌动作有层次感，画面层次分明。',
  },
  {
    type: 'flip-swipe',
    name: '掀牌翻转',
    enName: 'Flip swipe',
    action: '卡片向一侧滑出的同时完成翻面，落下时已切换为下一张。',
    visual: '滑动与翻面同步进行，可见背面过渡，动作连贯。',
  },
  {
    type: 'wheel-scroll',
    name: '纵向滚轮',
    enName: 'Wheel scroll',
    action: '卡片像滚轮一样上下滚动切换，正对用户的卡片最大。',
    visual: '上下卡片向后弯曲，滚动的空间感强烈。',
  },
  {
    type: 'cube-rotate',
    name: '立方体面',
    enName: 'Cube rotate',
    action: '卡片贴在立方体面上，整块立方体转动，下一张从侧面转出覆盖当前位置。',
    visual: '3D 整块转动，立体空间感强。',
  },
  {
    type: 'peek-side',
    name: '侧边窥视',
    enName: 'Peek side',
    action: '后面的卡片只从侧边探出一小部分，滑到画面中间才完全展开。',
    visual: '未选中卡片仅露侧边，展开过渡自然。',
  },
  {
    type: 'explode-gather',
    name: '打散聚拢',
    enName: 'Explode and gather',
    action: '卡片先向四周炸开散开，再快速聚拢收回，新卡片显示在最上层。',
    visual: '“炸开—收回”的动态冲击感，新卡最终突出显示。',
  },
  {
    type: 'overshoot-slide',
    name: '过冲滑入',
    enName: 'Overshoot slide',
    action: '新卡片从一侧滑入，会冲过中线一点，再回弹到正中。',
    visual: '过冲后回弹，弹性反馈明显，动作有力量感。',
  },
]

/** 按路由参数查找动画条目 */
export const findAnimation = (type: string | undefined): CardAnimationMeta | undefined =>
  CARD_ANIMATIONS.find((item) => item.type === type)

/** 取某个动画在清单中的序号（1 起） */
export const animationOrder = (type: string | undefined): number => {
  const index = CARD_ANIMATIONS.findIndex((item) => item.type === type)
  return index < 0 ? 0 : index + 1
}
