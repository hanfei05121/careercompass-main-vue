<script setup lang="ts">
import { BlurReveal, CssLiquidGlass, SectionHeader } from '@/components/portfolio'

const contacts = [
  {
    id: 'email',
    label: '邮箱',
    value: 'hello@Karot.dev',
    href: 'mailto:hello@Karot.dev',
    hint: '项目合作与深度技术交流',
  },
  {
    id: 'github',
    label: 'GitHub',
    value: 'github.com/Karot',
    href: 'https://github.com/Karot',
    hint: '开源仓库、Vite 插件与 Skill',
  },
  {
    id: 'juejin',
    label: '掘金',
    value: 'juejin.cn',
    href: 'https://juejin.cn',
    hint: '工程实践与工具设计记录',
  },
  {
    id: 'skills',
    label: 'skills.sh',
    value: 'skills.sh/Karot',
    href: 'https://skills.sh/Karot',
    hint: '已上架的可安装 Agent Skill',
  },
]

const isExternal = (href: string) => href.startsWith('http')
</script>

<template>
  <footer id="contact" class="footer section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <BlurReveal :delay="0.05">
        <SectionHeader eyebrow="Connect" title="开源合作与技术交流">
          <template #desc>前端工程化、Agent Skill 与开源工具链。邮箱直接联系，仓库与 Skill 可公开查阅。</template>
        </SectionHeader>
      </BlurReveal>

      <BlurReveal :delay="0.12">
        <CssLiquidGlass class="h-full" container-class="mt-10 rounded-[2rem]" :radius="32">
          <div class="contact-block">
            <div class="orb orb-tr" aria-hidden="true" />
            <div class="orb orb-bl" aria-hidden="true" />

            <div class="contact-copy">
              <p class="contact-eyebrow">Contact</p>
              <h3 class="contact-title font-display">联系方式</h3>
              <p class="contact-hint">
                邮箱用于项目合作与技术交流。开源仓库、文章与可安装 Skill 分别在 GitHub、掘金与 skills.sh。
              </p>
            </div>

            <ul class="contact-list">
              <li v-for="c in contacts" :key="c.id">
                <a
                  class="contact-row"
                  :href="c.href"
                  :target="isExternal(c.href) ? '_blank' : undefined"
                  :rel="isExternal(c.href) ? 'noopener noreferrer' : undefined"
                >
                  <span class="contact-row-label">
                    <span class="dot" aria-hidden="true" />
                    {{ c.label }}
                  </span>
                  <span class="contact-row-value">{{ c.value }}</span>
                  <span class="contact-row-hint">{{ c.hint }}</span>
                </a>
              </li>
            </ul>
          </div>
        </CssLiquidGlass>
      </BlurReveal>

      <p class="copy">© {{ new Date().getFullYear() }} Karot · Frontend · Agent · DX</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 2rem;
}

.contact-block {
  position: relative;
  display: grid;
  gap: 2rem;
  padding: 1.75rem;
  overflow: hidden;
}

.orb {
  position: absolute;
  pointer-events: none;
  border-radius: 9999px;
  filter: blur(64px);
}

.orb-tr {
  top: -5rem;
  right: -4rem;
  width: 14rem;
  height: 14rem;
  background: color-mix(in oklch, hsl(var(--primary)) 15%, transparent);
}

.orb-bl {
  bottom: -6rem;
  left: 33%;
  width: 16rem;
  height: 16rem;
  background: color-mix(in oklch, hsl(var(--accent)) 40%, transparent);
}

.contact-copy {
  position: relative;
}

.contact-eyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: hsl(var(--muted-foreground));
}

.contact-title {
  margin-top: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.contact-hint {
  margin-top: 1rem;
  max-width: 36rem;
  font-size: 0.875rem;
  line-height: 1.625;
  color: hsl(var(--muted-foreground));
}

.contact-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  border: 1px solid transparent;
  transition:
    background-color 0.5s cubic-bezier(0.32, 0.72, 0, 1),
    border-color 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.contact-row:hover {
  background: color-mix(in oklch, hsl(var(--accent)) 60%, transparent);
  border-color: color-mix(in oklch, hsl(var(--primary)) 25%, transparent);
}

.contact-row-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.dot {
  width: 0.375rem;
  height: 0.375rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: hsl(var(--primary));
}

.contact-row-value {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.75rem;
  color: hsl(var(--primary));
}

.contact-row-hint {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.copy {
  margin-top: 3rem;
  text-align: center;
  font-size: 0.82rem;
  color: hsl(var(--muted-foreground));
}

@media (min-width: 48rem) {
  .contact-block {
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 3rem;
    padding: 2.5rem;
  }

  .contact-title {
    font-size: 2.25rem;
  }

  .contact-row {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .contact-row-label {
    width: 6rem;
    flex-shrink: 0;
  }

  .contact-row-value {
    flex: 1;
  }
}
</style>
