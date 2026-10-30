<script setup lang="ts">
import { BlurReveal, CssLiquidGlass, SectionHeader } from '@/components/portfolio'

const skills = [
  {
    name: '中后台页面范式',
    index: '01',
    desc: '把「搜索区 + ProTable + 操作弹窗」沉淀为配置驱动的页面范式：列表列、表单项、操作按钮全部声明式配置，一个 hook 接管请求、分页与刷新。',
    points: ['config-list-hook / config-form-hook 声明式配置', '字典与 LOV 数据驱动渲染', '按钮级权限码统一挂载'],
    install: 'ProTable + useDict + useAuthorize',
  },
  {
    name: 'H5 交互与实时通信',
    index: '02',
    desc: '移动端社区的一整套交互资产：可拖拽悬浮球、下拉刷新 + 无限加载、contenteditable 富文本发帖，以及 WebSocket 直播间的弹幕与红包雨。',
    points: ['useLoadMore 分页加载与刷新', 'useDraggableFab 可拖拽悬浮球', 'WebSocket 断线重连与消息分发'],
    install: 'Vant + vue3-danmaku + WebSocket',
  },
]
</script>

<template>
  <section id="skills" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <BlurReveal :delay="0.05">
        <SectionHeader eyebrow="Skills" title="沉淀下来的可复用能力">
          <template #desc>三个项目里反复出现的模式，最终都收敛成了 hooks、组件与配置范式，新页面接入只需声明数据。</template>
        </SectionHeader>
      </BlurReveal>

      <div class="grid">
        <BlurReveal
          v-for="(s, i) in skills"
          :key="s.name"
          :delay="Math.min(i * 0.08, 0.2)"
          :amount="0.2"
        >
          <CssLiquidGlass class="h-full rounded-[1.75rem]" container-class="h-full rounded-[1.75rem]">
            <article class="skill-body">
              <div class="skill-index-row">
                <span class="skill-source">复用资产</span>
                <span class="skill-index">{{ s.index }}</span>
              </div>

              <h3 class="skill-name">
                {{ s.name }}
              </h3>

              <p class="skill-desc">{{ s.desc }}</p>

              <ul class="skill-points">
                <li v-for="point in s.points" :key="point">
                  <span class="dot" aria-hidden="true" />
                  <span>{{ point }}</span>
                </li>
              </ul>

              <code class="skill-install">{{ s.install }}</code>
            </article>
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.skill-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.5rem;
  border-radius: 1.5rem;
}

.skill-index-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.skill-source {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: hsl(var(--primary));
}

.skill-index {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.skill-name {
  margin-top: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground));
}

.skill-desc {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.625;
  color: hsl(var(--muted-foreground));
}

.skill-points {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.4;
  color: hsl(var(--muted-foreground));
}

.skill-points li {
  display: flex;
  gap: 0.625rem;
}

.dot {
  margin-top: 0.375rem;
  width: 0.375rem;
  height: 0.375rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: hsl(var(--primary));
}

.skill-install {
  display: block;
  margin-top: 1.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.625rem;
  background: color-mix(in oklch, hsl(var(--background)) 60%, transparent);
  border: 1px solid hsl(var(--border) / 0.6);
  color: hsl(var(--muted-foreground));
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.72rem;
  overflow-x: auto;
  white-space: nowrap;
}
</style>
