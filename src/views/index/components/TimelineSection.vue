<script setup lang="ts">
import { BlurReveal, SectionHeader } from '@/components/portfolio'

const milestones = [
  {
    year: '2026',
    title: 'Agent 工作流上架 skills.sh',
    desc: '发布 faker-mock-setup 与 scrapling-config-crawl，把团队 Mock 联调与配置驱动采集封装为可安装 Skill。将触发条件、硬性规则、模板与合规边界写成 Agent 可执行、可版本化的工作流。',
  },
  {
    year: '2025',
    title: '类型系统与工程工具链',
    desc: '发布并维护 vite-plugin-fetch-dts，在 Vite 构建期为远程 Vue / Web Components 补齐完整 TypeScript 体验。同时把 Vue 指令体系与 UnoCSS 图标热更新做成可复用工具链。',
  },
  {
    year: '2024',
    title: '同时面向人与 Agent 的抽象',
    desc: '以类型系统、开发者体验与中后台性能为轴，开始把可复用能力同时写成给人读的工具，以及给 Agent 执行的上下文。',
  },
  {
    year: '2023',
    title: '中后台交互原语',
    desc: '在 Vue 3 中后台交付中，将溢出提示、一键复制、自适应导航等高频交互抽成指令与组件。按需创建 Tooltip，拿掉表格页里成批无效实例，形成第一层可复用的交互语言。',
  },
]
</script>

<template>
  <section id="trajectory" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <SectionHeader eyebrow="轨迹" title="轨迹">
        <template #desc>从 Vue 指令与中后台性能，到 Vite 插件、OpenAPI 工具链，以及上架 skills.sh 的可安装 Agent Skill。</template>
      </SectionHeader>

      <ol class="timeline">
        <BlurReveal
          v-for="(m, i) in milestones"
          :key="m.year"
          :delay="Math.min(i * 0.08, 0.2)"
          :amount="0.15"
          class="ti-wrap"
        >
          <li class="ti">
            <div class="ti-marker">
              <span class="ti-dot" />
              <span class="ti-year font-display">{{ m.year }}</span>
            </div>
            <div class="ti-body">
              <h3 class="ti-title font-display">{{ m.title }}</h3>
              <p class="ti-desc">{{ m.desc }}</p>
            </div>
          </li>
        </BlurReveal>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  margin-top: 2.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: linear-gradient(to bottom, transparent, hsl(var(--border)), transparent);
}

.ti-wrap {
  list-style: none;
}

.ti {
  position: relative;
  display: flex;
  gap: 1.5rem;
  padding-left: 0.5rem;
}

.ti-marker {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 3.5rem;
}

.ti-dot {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: hsl(var(--primary));
  box-shadow: 0 0 14px 2px hsl(var(--primary) / 0.55);
}

.ti-year {
  margin-top: 0.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: color-mix(in oklch, hsl(var(--primary)) 70%, transparent);
}

.ti-body {
  flex: 1;
  padding-bottom: 1rem;
}

.ti-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.ti-desc {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.75;
  color: hsl(var(--muted-foreground));
}
</style>
