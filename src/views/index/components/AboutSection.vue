<script setup lang="ts">
/**
 * AboutSection —— 关于我。
 *
 * `mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]`
 * - 左列：CssLiquidGlass 的 --media 变体，玻璃卡片里放三维光缆特效（LightRibbons），
 *   左下角压标题 / 副标题。卡片自身用 aspect-ratio 定高：
 *   媒体层是 absolute 定位，不给定高的话卡片会被内容撑成 0 高，移动端单列时尤其明显。
 * - 右列：三条竖排要点。左侧一条 primary 竖线自上而下渐隐，首条挂一个圆点。
 */
import { BlurReveal, CssLiquidGlass, LightRibbons, SectionHeader } from '@/components/portfolio'

const pillars = [
  {
    title: '中后台业务系统',
    desc: '应收管理、外包资源管理这类重表单、重表格的系统：动态路由 + 按钮级权限码、字典 / LOV 数据驱动渲染、ProTable 配置化列表，把上百个业务页面收敛成一套可复用的页面范式。',
  },
  {
    title: '社区与直播 H5',
    desc: '企业社区论坛的移动端：发帖富文本、WebSocket 直播弹幕、红包雨 / 抽奖互动、可拖拽悬浮球。在 Vant + rem 适配的约束下，把交互体验做到与原生 App 一致。',
  },
  {
    title: '交付原则',
    desc: '先抽公共组件和 hooks，再写业务页面；联调先定数据契约。重复出现三次的逻辑，一定值得被收敛成一次配置、长期复用的工具。',
  },
]
</script>

<template>
  <section id="about" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <SectionHeader eyebrow="About" title="把业务系统里重复的部分，收敛成可复用的前端资产">
        <template #desc>
          Vue 3 + TypeScript 前端工程师。今年先后在应收管理中后台、企业社区论坛（H5 / PC 双端）与外包资源管理平台三个项目中交付核心模块，覆盖动态权限、配置化表格表单、WebSocket 实时互动、多语言与 SSO 集成。
        </template>
      </SectionHeader>

      <div class="mt-10 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <BlurReveal :amount="0.15">
          <CssLiquidGlass container-class="aspect-[5/4] w-full">
            <template #media>
              <LightRibbons />
            </template>

            <div class="media-caption">
              <p class="media-caption__title font-display">3 Systems · 1 Stack</p>
              <p class="media-caption__desc">三套业务系统，同一套可复用的前端范式</p>
            </div>
          </CssLiquidGlass>
        </BlurReveal>

        <BlurReveal :delay="0.08" :amount="0.15">
          <ol class="pillars">
            <li v-for="p in pillars" :key="p.title" class="pillar">
              <h3 class="pillar-title">{{ p.title }}</h3>
              <p class="pillar-desc">{{ p.desc }}</p>
            </li>
          </ol>
        </BlurReveal>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* media-caption 系列样式已提升为全局类，见 src/styles/components/effects.css 第 7 节 */

/* ---- 右列：三条竖排要点 ---- */
.pillars {
  position: relative;
  display: grid;
  gap: 2rem;
  padding-left: 3rem;
}

/* 竖线：primary 起笔，向下渐隐 */
.pillars::before {
  content: '';
  position: absolute;
  left: 0.375rem;
  top: 0.625rem;
  bottom: 16%;
  width: 1px;
  background: linear-gradient(
    to bottom,
    hsl(var(--primary)) 0%,
    hsl(var(--primary) / 0.5) 40%,
    transparent 78%
  );
}

.pillar {
  position: relative;
}

/* 圆点：只挂在第一条，作为竖线的起点 */
.pillar:first-child::before {
  content: '';
  position: absolute;
  left: -2.875rem;
  top: 0.5rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: hsl(var(--foreground));
}

.pillar-title {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  color: hsl(var(--foreground));
}

.pillar-desc {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.75;
  color: hsl(var(--muted-foreground));
}
</style>
