<script setup lang="ts">
import { BlurReveal, CssLiquidGlass, SectionHeader } from '@/components/portfolio'

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

      <BlurReveal class="mt-7">
        <div class="pill-line">
          <span class="arrow">→</span>
          <span>从远程类型同步，到可安装的 Agent 工作流</span>
        </div>
      </BlurReveal>

      <div class="pillars">
        <BlurReveal
          v-for="(p, i) in pillars"
          :key="p.title"
          :delay="Math.min(i * 0.08, 0.2)"
          :amount="0.15"
        >
          <CssLiquidGlass class="h-full" container-class="h-full">
            <article class="pillar">
              <h3 class="pillar-title font-display">{{ p.title }}</h3>
              <p class="pillar-desc">{{ p.desc }}</p>
            </article>
          </CssLiquidGlass>
        </BlurReveal>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pillars {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.pill-line {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  border: 0.8px solid color-mix(in oklch, hsl(var(--primary)) 25%, transparent);
  color: hsl(var(--muted-foreground));
  font-size: 0.92rem;
}

.arrow {
  color: hsl(var(--primary));
}

.pillar {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
  border-radius: 1.5rem;
}

.pillar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.pillar-desc {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.75;
  color: hsl(var(--muted-foreground));
}
</style>
