<script setup lang="ts">
/**
 * ArticleSection —— 文章列表。
 * 版式对齐参考站点：标题行右侧为文章总数，列表每行是一张聚光卡片，
 * 序号用 Fraunces 大号字、tags 用 primary 12% 药丸、日期用等宽字，
 * 行内标题在 hover 时转为 primary，其余内容轻微淡入。
 */
import { BlurReveal, SectionHeader, SpotlightCard } from '@/components/portfolio'
import { ARTICLES } from '@/data/articles'
import { RouterLink } from 'vue-router'
</script>

<template>
  <section id="writing" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <BlurReveal :blur="0" :y-offset="16" :delay="0.05">
        <div class="writing-head">
          <SectionHeader eyebrow="Writing" title="文章">
            <template #desc>工程实践记录。覆盖 Vue 指令体系、中后台性能、图标工具链，以及 Agent Skill 的设计与上架。</template>
          </SectionHeader>
          <p class="writing-count font-display">{{ ARTICLES.length }}</p>
        </div>
      </BlurReveal>

      <div class="article-list">
        <BlurReveal
          v-for="(a, i) in ARTICLES"
          :key="a.slug"
          :y-offset="16"
          :duration="0.65"
          :delay="Math.min(i * 0.04, 0.32)"
          :amount="0.15"
        >
          <SpotlightCard :gradient-size="320">
            <RouterLink :to="`/articles/${a.slug}`" class="article-row">
              <span class="row-no font-display">{{ a.no }}</span>

              <div class="row-main">
                <div class="row-tags">
                  <span class="row-tag">{{ a.tag }}</span>
                </div>
                <h3 class="row-title font-display">{{ a.title }}</h3>
                <p class="row-desc">{{ a.desc }}</p>
              </div>

              <div class="row-side">
                <time class="row-date">{{ a.date }}</time>
                <span class="row-arrow" aria-hidden="true">→</span>
              </div>
            </RouterLink>
          </SpotlightCard>
        </BlurReveal>
      </div>
    </div>
  </section>
</template>

<style scoped>
.writing-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
}

.writing-count {
  font-size: 3rem;
  line-height: 1;
  color: color-mix(in oklch, hsl(var(--primary)) 25%, transparent);
}

.article-list {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (min-width: 48rem) {
  .article-list {
    margin-top: 2rem;
  }

  .writing-count {
    font-size: 3.75rem;
  }
}

.article-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
}

.row-no {
  font-size: 1.875rem;
  line-height: 1;
  color: color-mix(in oklch, hsl(var(--primary)) 45%, transparent);
  transition: color 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.row-main {
  min-width: 0;
  flex: 1;
}

.row-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.row-tag {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: color-mix(in oklch, hsl(var(--primary)) 12%, transparent);
  color: color-mix(in oklch, hsl(var(--foreground)) 75%, transparent);
  font-size: 11px;
}

.row-title {
  margin-top: 0.625rem;
  font-size: 1.125rem;
  line-height: 1.375;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground));
  transition: color 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.row-desc {
  margin-top: 0.5rem;
  max-width: 42rem;
  font-size: 0.875rem;
  line-height: 1.625;
  color: hsl(var(--muted-foreground));
  transition: opacity 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.row-side {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.row-date {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  color: hsl(var(--muted-foreground));
}

.row-arrow {
  color: hsl(var(--primary));
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

/* hover：标题转 primary、日期列放大字号、摘要补齐不透明度 */
.article-row:hover .row-title {
  color: hsl(var(--primary));
}

.article-row:hover .row-no {
  color: color-mix(in oklch, hsl(var(--primary)) 70%, transparent);
}

.article-row:hover .row-arrow {
  transform: translateX(4px);
}

@media (min-width: 48rem) {
  .article-row {
    flex-direction: row;
    align-items: center;
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .row-no {
    width: 3.5rem;
    flex-shrink: 0;
    font-size: 2.25rem;
  }

  .row-desc {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    opacity: 0.7;
  }

  .article-row:hover .row-desc {
    opacity: 1;
  }

  .row-side {
    width: 9rem;
    flex-shrink: 0;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
  }
}
</style>
