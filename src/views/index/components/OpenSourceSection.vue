<script setup lang="ts">
/**
 * OpenSourceSection —— 项目实践（原开源区块，改为今年交付的三个真实项目）。
 * 保留 bento 布局与液态玻璃卡片特效，仅替换内容数据。
 */
import { BlurReveal, CssLiquidGlass, SectionHeader } from '@/components/portfolio'
import InteractiveHoverButton from '@/components/ui/interactive-hover-button.vue'

const packages = [
  {
    name: '应收账款管理系统',
    role: '中后台 · Vue 3 + Element Plus',
    version: 'Trina Solar',
    desc: '面向光伏企业的应收 / 回款管理中后台：收款条款登记、里程碑树形表格、客户回款跟踪看板，以及基于 OnlyOffice + pdf.js 的合同双栏比对。',
    points: [
      '动态路由 + 权限码按钮级控制，菜单由权限服务下发',
      '里程碑 / 批次两级树形表格，行内编辑与金额校验',
      'pdf.js 抽取行坐标 + Myers diff，合同差异在 PDF 画布上高亮',
    ],
  },
  {
    name: 'tpdtalk 社区论坛',
    role: 'H5 + PC 双端 · Vue 3',
    version: 'Trina Solar',
    desc: '企业内部社区论坛，H5（Vant）与 PC（Element Plus）双端并行开发：发帖、话题、圈子、直播弹幕、红包雨与抽奖互动。',
    points: [
      'WebSocket 直播间：弹幕、红包雨、抽奖转盘实时联动',
      'contenteditable 富文本发帖：@提及、表情、图片视频上传',
      'useLoadMore 分页 hook 统一双端列表加载与刷新',
    ],
  },
  {
    name: '外包资源管理平台',
    role: '中后台 · Vue 3 + Ant Design Vue',
    version: 'Outsource',
    desc: '供应商 / 专家 / 简历 / 结算一体的外包管理系统：多页签布局、OAuth2 单点登录、四类行为验证码与全站字典数据驱动。',
    points: [
      'MultiTab 多页签 + keepAlive 缓存，页签级权限与刷新',
      '滑动 / 旋转 / 点选 / 拼接四类验证码，轨迹采集防机器',
      'Dict 组件族：字典缓存 + 类型转换 + 国际化展示',
    ],
  },
]

/** bento 布局：首张卡跨 7 列 2 行，其余各占 5 列 */
function cardClass(index: number) {
  return index === 0 ? 'lg:col-span-7 lg:row-span-2' : 'lg:col-span-5'
}

/** 首卡内容更多，给更宽松的内边距 */
function bodyClass(index: number) {
  return index === 0 ? 'p-6 md:p-8 lg:p-9' : 'p-6 md:p-7'
}
</script>

<template>
  <section id="projects" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <SectionHeader eyebrow="Projects" title="今年交付的项目">
        <template #desc>三套在产系统：应收管理中后台、社区论坛双端、外包资源管理平台。同一套 Vue 3 + TypeScript 技术栈，覆盖中后台、H5 与实时互动三类场景。</template>
      </SectionHeader>

      <div class="grid">
        <BlurReveal
          v-for="(p, i) in packages"
          :key="p.name"
          :class="cardClass(i)"
          :delay="Math.min(i * 0.08, 0.2)"
          :amount="0.2"
        >
          <CssLiquidGlass class="h-full rounded-[1.75rem]" container-class="h-full rounded-[1.75rem]">
            <div class="pkg-body" :class="bodyClass(i)">
              <div class="pkg-meta-row">
                <span class="pkg-role">{{ p.role }}</span>
                <span class="pkg-version">{{ p.version }}</span>
              </div>

              <h3 class="pkg-name" :class="i === 0 ? 'text-2xl md:text-3xl' : 'text-2xl'">
                {{ p.name }}
              </h3>

              <p class="pkg-desc">{{ p.desc }}</p>

              <ul class="pkg-points">
                <li v-for="point in p.points" :key="point">
                  <span class="dot" aria-hidden="true" />
                  <span>{{ point }}</span>
                </li>
              </ul>

              <div class="pkg-cta-row" :class="i === 0 ? 'pt-8' : 'pt-6'">
                <a href="#writing" class="pkg-cta-link">
                  <InteractiveHoverButton text="看实现细节" />
                </a>
              </div>
            </div>
          </CssLiquidGlass>
        </BlurReveal>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid {
  margin-top: 2.5rem;
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 64rem) {
  .grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
}

.pkg-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 1.5rem;
}

.pkg-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.pkg-role {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: color-mix(in oklch, hsl(var(--primary)) 15%, transparent);
  color: hsl(var(--primary));
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.pkg-version {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.pkg-name {
  margin-top: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground));
}

.pkg-desc {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.625;
  color: hsl(var(--muted-foreground));
}

.pkg-points {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.pkg-points li {
  display: flex;
  gap: 0.5rem;
}

.dot {
  margin-top: 0.5rem;
  width: 0.375rem;
  height: 0.375rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: hsl(var(--primary));
}

.pkg-cta-row {
  margin-top: auto;
}

.pkg-cta-link {
  display: inline-flex;
  border-radius: 9999px;
}
</style>
