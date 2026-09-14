# 视觉特效复用指南

本项目把常用的视觉特效收敛为「全局 CSS 工具类 + 可配置组件」两种形态。
给新元素加特效时，优先按下表选型：

| 想要的效果 | 用什么 | 形态 |
| --- | --- | --- |
| 任意元素加玻璃质感（导航同款） | `.glass-panel` | 全局 CSS 类 |
| 大面积玻璃卡片（多层描边 + 高光，成本低） | `<CssLiquidGlass>` | 组件 |
| 边缘折射弯曲的液态玻璃（导航药丸同款） | `<LiquidGlass>` | 组件 |
| 整页 / 局部丝绸流动背景 | `<SilkBackground>` | 组件 |
| 玻璃媒体卡左下角标题文案 | `.media-caption` | 全局 CSS 类 |
| 职位 / 标语形变轮播 | `<RoleRotator>` | 组件 |
| 光标聚光卡片 | `.card-spotlight-glow` | 全局 CSS 类 |

所有特效样式的唯一来源是 [effects.css](file:///e:/studying/careercompass-main-vue/src/styles/components/effects.css)，
已在 [styles/index.ts](file:///e:/studying/careercompass-main-vue/src/styles/index.ts) 全局引入，**无需在组件里再 import**。

---

## 1. 通用玻璃面板 `.glass-panel`

导航药丸同款观感的纯 CSS 版：半透明底色 + 背景模糊 + 内描边高光 + 外投影。
任意元素加一个类即可，不依赖组件：

```html
<!-- 普通圆角面板 -->
<div class="glass-panel p-4">内容</div>

<!-- 药丸形（导航同款）：圆角给到 999px -->
<header class="glass-panel" style="--glass-radius: 999px">导航内容</header>
```

### 可调 CSS 变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `--glass-radius` | `16px` | 圆角。药丸传 `999px`，卡片传 `24px` 等 |
| `--glass-frost` | `0.1` | 底色不透明度（0~1），越大越「实」、越不透明 |
| `--glass-blur` | `12px` | 背景模糊半径 |

示例（更实的卡片玻璃）：

```html
<aside class="glass-panel p-6" style="--glass-radius: 24px; --glass-frost: 0.18; --glass-blur: 18px">
  ...
</aside>
```

### 注意事项

- 玻璃效果靠 `backdrop-filter` 透出**身后的内容**，所以父级背景不能是实心遮挡层；
  放在 `<SilkBackground>` 这类背景特效之上观感最佳。
- 用户开启「减少透明 / 减少动效」时自动退回较实底色、关闭模糊，无需额外处理。
- 需要边缘折射弯曲（导航那种「液态」感）时，`.glass-panel` 做不到，
  请使用下面的 `<LiquidGlass>` 组件。

---

## 2. 液态玻璃组件（两种实现）

### 2.1 `<LiquidGlass>` —— 位移折射版（导航同款）

原理：生成法线贴图 SVG + `feDisplacementMap` 对 R/G/B 三通道做不同强度位移，
得到边缘折射、中间平滑的玻璃质感。成本较高，适合导航条、悬浮药丸等小面积元素。

[LiquidGlass.vue](file:///e:/studying/careercompass-main-vue/src/components/portfolio/LiquidGlass.vue)，
从 `@/components/portfolio` 导入：

```html
<script setup lang="ts">
import { LiquidGlass } from '@/components/portfolio'
</script>

<template>
  <LiquidGlass
    :radius="999"
    :frost="0.1"
    :border="0.35"
    :scale="-80"
    :blur="6"
    :g-offset="2"
    :b-offset="4"
    container-class="mx-auto max-w-6xl"
  >
    导航内容
  </LiquidGlass>
</template>
```

常用 props（完整列表见组件源码）：

| prop | 默认值 | 说明 |
| --- | --- | --- |
| `radius` | `16` | 圆角（px） |
| `frost` | `0.05` | 玻璃底色占比（0~1） |
| `border` | `0.07` | 边缘折射带宽度比例 |
| `scale` | `-180` | 基础位移强度（负值向内折射），绝对值越大折射越强 |
| `blur` | `11` | 贴图内层模糊半径 |
| `rOffset` / `gOffset` / `bOffset` | `0/10/20` | 三通道位移偏移，任一非 0 时启用分通道滤镜 |
| `displace` | `0` | 附加高斯模糊 |
| `containerClass` | `''` | 外层容器附加类名 |

导航药丸的推荐参数就是上面示例那一组（`radius:999, frost:0.1, border:0.35, scale:-80, blur:6, gOffset:2, bOffset:4`）。

### 2.2 `<CssLiquidGlass>` —— 纯 CSS 版（大面积卡片）

多层描边 + 高光渐变 + 模糊内缘模拟玻璃厚度与反光，无 WebGL/SVG 滤镜开销，
适合内容卡片、媒体卡等大面积场景。

[CssLiquidGlass.vue](file:///e:/studying/careercompass-main-vue/src/components/portfolio/CssLiquidGlass.vue)：

```html
<script setup lang="ts">
import { CssLiquidGlass } from '@/components/portfolio'
</script>

<template>
  <!-- 普通玻璃卡片：内容放默认插槽 -->
  <CssLiquidGlass :radius="28" container-class="p-6">卡片内容</CssLiquidGlass>

  <!-- 媒体变体：提供 #media 插槽，玻璃层覆盖在媒体之上 -->
  <CssLiquidGlass container-class="aspect-[5/4] w-full">
    <template #media>
      <YourVisualEffect />
    </template>
    <div class="media-caption">
      <p class="media-caption__title font-display">标题</p>
      <p class="media-caption__desc">副标题</p>
    </div>
  </CssLiquidGlass>
</template>
```

| prop | 默认值 | 说明 |
| --- | --- | --- |
| `radius` | `28` | 圆角（px） |
| `containerClass` | `''` | 外层附加类名（**需要定高**，见下） |
| `class` | `''` | 内容槽附加类名 |

**注意**：`#media` 插槽内容是 `absolute` 定位，不给容器定高的话卡片会被撑成 0 高。
用 `aspect-[5/4]`、`h-64` 等方式显式给高。

微调玻璃质感可直接覆写 `--lg-*` 变量（`--lg-blur`、`--lg-tint`、`--lg-brightness` 等，
清单见 effects.css 第 4 节）。

---

## 3. 丝绸背景 `<SilkBackground>`

WebGL2 丝绸流动背景（ShaderToy X3yXRd，MIT）。已内置：
弱 GPU 自动降档、离屏 / 页面隐藏时暂停、`prefers-reduced-motion` 时只画一帧。

[SilkBackground.vue](file:///e:/studying/careercompass-main-vue/src/components/canvas/SilkBackground.vue)，
从 `@/components/canvas` 导入。

### 3.1 整页背景（默认用法）

```html
<SilkBackground />
```

`fixed inset-0 z-0` 全屏铺底，内容元素需要自己的层叠上下文（如 `position: relative; z-index: 1`）。
App.vue 中即此用法。

### 3.2 局部背景（卡片 / 分区内）

```html
<div class="relative h-64 overflow-hidden rounded-3xl">
  <SilkBackground :fill="false" hue="210" :speed="0.6" :opacity="0.8" />
  <div class="relative z-10 p-6">上层内容</div>
</div>
```

`:fill="false"` 后组件改为 `absolute` 填满**最近的定位父级**，
父级需 `position: relative`（或 absolute/fixed）且有自身高度。

### props

| prop | 默认值 | 说明 |
| --- | --- | --- |
| `hue` | `300` | 色相 0~360（300 紫红 / 210 蓝 / 150 青绿） |
| `saturation` | `0.5` | 饱和度 0~1 |
| `brightness` | `1` | 明度 0~1 |
| `speed` | `1` | 流动速度倍率 |
| `opacity` | `0.55` | 暗色主题整体透明度 |
| `lightOpacity` | `0.36` | 浅色主题整体透明度 |
| `fill` | `true` | `true` = fixed 全屏；`false` = absolute 填满定位父级 |

配色 / 速度 props 支持响应式实时更新，无需重建上下文。

### 性能提示

- 同屏多个实例时每个都是一份 WebGL 上下文，建议整页背景 1 个 + 局部小面积至多 1~2 个。
- 放进 `<CssLiquidGlass>` 的 `#media` 插槽时，配合 `--media` 变体（玻璃只留描边高光、不蒙灰）。

---

## 4. 媒体卡文案层 `.media-caption`

叠在玻璃媒体卡（`<CssLiquidGlass>` + `#media`）之上，把标题 / 副标题压到左下角，
自带底部压暗渐变，保证背景特效再亮也压得住文字。

```html
<div class="media-caption">
  <p class="media-caption__title font-display">DX to Agent Skills</p>
  <p class="media-caption__desc">从远程类型同步，到可安装的 Agent 工作流</p>
</div>
```

结构约定（三个类名固定搭配）：

| 类名 | 作用 |
| --- | --- |
| `.media-caption` | 定位容器：`height:100%` 弹性布局，内容贴底 |
| `.media-caption__title` | 标题，1.125rem，`--foreground` 色 |
| `.media-caption__desc` | 副标题，0.875rem，`--muted-foreground` 色 |

标题想用衬线拉丁字时加 `font-display`。完整用法参考
[AboutSection.vue](file:///e:/studying/careercompass-main-vue/src/views/index/components/AboutSection.vue)。

---

## 5. 职位 / 标语形变轮播 `<RoleRotator>`

文字「融成一团再凝回下一条」的形变轮播（内部封装 `<MorphingText>`，
已内置左对齐、响应式字号与容器宽度）。导入后只传数据即可：

```html
<script setup lang="ts">
import { RoleRotator } from '@/components/portfolio'

const roles = ['Frontend Engineer', 'Agent Infrastructure', 'Open Source Author']
</script>

<template>
  <RoleRotator :texts="roles" class="mt-5" />
</template>
```

| prop | 默认值 | 说明 |
| --- | --- | --- |
| `texts` | — | 轮播文案数组，逐条形变切换 |
| `morphTime` | `1.5` | 单次形变时长（秒） |
| `coolDownTime` | `0.5` | 形变之间的停顿（秒） |
| `class` | `''` | 外层附加类名，控制外边距等布局间距 |

需要完全自定义排版（居中、超大字号）时，直接用底层的
[MorphingText.vue](file:///e:/studying/careercompass-main-vue/src/components/portfolio/MorphingText.vue)。

实际用例见 [Hero.vue](file:///e:/studying/careercompass-main-vue/src/views/index/components/Hero.vue)。

---

## 6. 光标聚光卡片 `.card-spotlight-glow`

鼠标悬停时跟随光标的高光圈。宿主元素需要 `class="group relative"`，
并通过 CSS 变量传参：

```html
<div class="group relative" style="--spot-color: #e8a4b8; --spot-size: 240px; --spot-opacity: 0.5">
  卡片内容
  <div class="card-spotlight-glow" aria-hidden="true" />
</div>
```

`--spot-x` / `--spot-y` 由 JS 在 `pointermove` 时写入、`pointerleave` 时甩到画布外（参考
[SpotlightCard.vue](file:///e:/studying/careercompass-main-vue/src/components/portfolio/SpotlightCard.vue) 的实现）。

---

## 7. 选型速查

- **导航 / 悬浮药丸** → `<LiquidGlass>`（折射感）或 `.glass-panel` + `--glass-radius:999px`（轻量）
- **内容卡片 / 面板** → `.glass-panel`（一行搞定）或 `<CssLiquidGlass>`（更厚的玻璃边）
- **卡片里放动画 / WebGL 视觉** → `<CssLiquidGlass>` 的 `#media` 插槽 + `.media-caption` 文案
- **页面氛围背景** → `<SilkBackground>`（整页默认 / 局部 `:fill="false"`）
- **职位 / 标语轮播** → `<RoleRotator :texts="[...]" />`
- **hover 互动光斑** → `.card-spotlight-glow`

新增特效请统一写进 [effects.css](file:///e:/studying/careercompass-main-vue/src/styles/components/effects.css)
并同步更新本文档，不要在业务组件里散落复制粘贴样式。
