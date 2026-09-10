<script setup lang="ts">
import { BlurReveal, CssLiquidGlass, SectionHeader } from '@/components/portfolio'

const skills = [
  {
    name: 'faker-mock-setup',
    index: '01',
    desc: '按 OpenAPI 或函数名生成页面级 Faker overrideResponse Mock，把前端联调从口头约定变成可安装、可复用的 Agent 工作流。',
    points: ['由函数名或 URL 推导 ApiId', '生成页面级 setup{ApiId}MockHandler', '面向 Vue / Vite + MSW 联调'],
    install: 'npx skills add https://github.com/Karot/skills --skill faker-mock-setup',
    href: 'https://skills.sh/Karot/skills/faker-mock-setup',
  },
  {
    name: 'scrapling-config-crawl',
    index: '02',
    desc: '按 config.py 的 id 生成 scrapling 采集脚本，将增量写入、翻页校验与合规边界固化为可安装 Skill。仅面向依法公开数据。',
    points: ['list / data 增量写入与附件分流', '强制复用项目 utils，避免脚本各自为政', '仅面向依法公开数据'],
    install: 'npx skills add https://github.com/Karot/skills --skill scrapling-config-crawl',
    href: 'https://skills.sh/Karot/skills/scrapling-config-crawl',
  },
]
</script>

<template>
  <section id="skills" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <BlurReveal :delay="0.05">
        <SectionHeader eyebrow="Agent Skills" title="上架 skills.sh 的工程化 Skill">
          <template #desc>把 Mock 联调与配置驱动采集写成可安装、可版本化的 Agent 工作流，含触发条件、硬性规则与合规边界。</template>
        </SectionHeader>

        <a
          class="profile-link"
          href="https://skills.sh/Karot"
          target="_blank"
          rel="noopener noreferrer"
        >
          skills.sh<wbr />/Karot
        </a>
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
                <span class="skill-source">skills.sh</span>
                <span class="skill-index">{{ s.index }}</span>
              </div>

              <h3 class="skill-name">
                <a :href="s.href" target="_blank" rel="noopener noreferrer" class="skill-name-link">
                  {{ s.name }}
                </a>
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
.profile-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 1.25rem;
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  border: 0.8px solid color-mix(in oklch, hsl(var(--primary)) 25%, transparent);
  color: hsl(var(--primary));
  font-weight: 600;
  transition: border-color 0.4s ease;
}

.profile-link:hover {
  border-color: hsl(var(--ring) / 0.5);
}

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
  word-break: break-all;
}

.skill-name-link {
  color: hsl(var(--foreground));
  text-decoration: underline;
  text-decoration-color: color-mix(in oklch, hsl(var(--primary)) 35%, transparent);
  text-underline-offset: 4px;
  transition:
    color 0.3s ease,
    text-decoration-color 0.3s ease;
}

.skill-name-link:hover {
  color: hsl(var(--primary));
  text-decoration-color: hsl(var(--primary));
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
