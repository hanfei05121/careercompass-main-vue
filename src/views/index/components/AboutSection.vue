<script setup lang="ts">
/**
 * AboutSection —— 关于我。
 *
 * 版式对齐参考站点：`mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]`
 * - 左列：CssLiquidGlass 的 --media 变体，玻璃卡片里放三维光缆特效（LightRibbons），
 *   左下角压标题 / 副标题。卡片自身用 aspect-ratio 定高：
 *   媒体层是 absolute 定位，不给定高的话卡片会被内容撑成 0 高（这正是「放进卡片
 *   什么也看不见」的根因），移动端单列时尤其明显。
 * - 右列：三条竖排要点。左侧一条 primary 竖线自上而下渐隐，首条挂一个圆点。
 *   标题用无衬线（参考图里「前端工程」是等线宽黑体），衬线只留给卡片里的拉丁文案。
 */
import { BlurReveal, CssLiquidGlass, LightRibbons, SectionHeader } from '@/components/portfolio'

const pillars = [
  {
    title: '前端工程',
    desc: 'Vue 自定义指令、UnoCSS 图标热更新、Vite 远程类型插件与 OpenAPI 请求生成。把中后台里反复出现的摩擦，收敛成一次配置、长期复用的工具链。',
  },
  {
    title: 'Agent 基础设施',
    desc: 'Skill 不是 README 的另一种写法，而是可版本化的约束与流程：触发条件、硬性规则、assets 模板与合规边界，上架 skills.sh 后安装即可执行。',
  },
  {
    title: '交付原则',
    desc: '先把问题抽象成工具，再把边界写清楚：它解决什么，以及明确不解决什么。',
  },
]
</script>

<template>
  <section id="about" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <SectionHeader eyebrow="About" title="把工程判断，写成可安装的工具与 Skill">
        <template #desc>
          Vue / Nuxt 方向前端工程师，工作重心在工程化、开发者体验与 Agent 工作流。已发布 vite-plugin-fetch-dts
          等 npm 包，并在 skills.sh 上架可安装 Skill，把远程类型同步、Mock 联调与配置驱动采集固化为可版本化工具。
        </template>
      </SectionHeader>

      <div class="mt-10 grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <BlurReveal :amount="0.15">
          <CssLiquidGlass container-class="aspect-[5/4] w-full">
            <template #media>
              <LightRibbons />
            </template>

            <div class="media-caption">
              <p class="media-caption__title font-display">DX to Agent Skills</p>
              <p class="media-caption__desc">从远程类型同步，到可安装的 Agent 工作流</p>
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
/* ---- 左列：玻璃媒体卡的文案层 ---- */
.media-caption {
  position: relative;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.25rem;
  padding: 1.5rem;
}

/* 底部压暗，保证光缆再亮也压得住文字 */
.media-caption::before {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 55%;
  pointer-events: none;
  background: linear-gradient(to top, rgb(10 6 16 / 0.62), rgb(10 6 16 / 0.2) 45%, transparent);
}

.media-caption__title {
  position: relative;
  font-size: 1.125rem;
  line-height: 1.3;
  color: hsl(var(--foreground));
}

.media-caption__desc {
  position: relative;
  font-size: 0.875rem;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

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
