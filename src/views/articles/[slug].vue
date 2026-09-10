<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import NavBar from '@/views/index/components/NavBar.vue'
import { ARTICLES, getArticleBySlug } from '@/data/articles'

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
const article = computed(() => getArticleBySlug(slug.value))

const others = computed(() =>
  ARTICLES.filter((a) => a.slug !== slug.value).slice(0, 4)
)
</script>

<template>
  <div class="page">
    <NavBar />

    <template v-if="article">
      <main class="content">
        <span class="tag">{{ article.tag }}</span>
        <h1 class="title font-display">{{ article.title }}</h1>
        <p class="desc">{{ article.desc }}</p>
        <time class="date">{{ article.date }}</time>

        <article class="prose">
          <p v-for="(para, i) in article.body" :key="i">{{ para }}</p>
        </article>
      </main>

      <nav class="others">
        <h2 class="others-title">更多文章</h2>
        <RouterLink
          v-for="a in others"
          :key="a.slug"
          :to="`/articles/${a.slug}`"
          class="other-row"
        >
          <span class="other-tag">{{ a.tag }}</span>
          <span class="other-text">{{ a.title }}</span>
          <span class="other-arrow">→</span>
        </RouterLink>
      </nav>
    </template>

    <div v-else class="empty">
      <p>未找到这篇文章。</p>
      <RouterLink to="/" class="home">返回首页</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

.content {
  max-width: 48rem;
  margin: 0 auto;
  padding: 8rem 1.5rem 3rem;
}
.tag {
  display: inline-block;
  padding: 0.2rem 0.7rem;
  border-radius: 9999px;
  border: 0.8px solid color-mix(in oklch, hsl(var(--primary)) 25%, transparent);
  color: hsl(var(--primary));
  font-size: 0.78rem;
}
.title {
  margin-top: 1.25rem;
  font-size: clamp(1.8rem, 4.5vw, 2.6rem);
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: hsl(var(--foreground));
}
.desc {
  margin-top: 1rem;
  font-size: 1.05rem;
  line-height: 1.75;
  color: hsl(var(--muted-foreground));
}
.date {
  display: block;
  margin-top: 0.9rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.78rem;
  color: hsl(var(--muted-foreground));
}

.prose {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid hsl(var(--border) / 0.5);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.prose p {
  font-size: 1.05rem;
  line-height: 2;
  color: hsl(var(--foreground) / 0.9);
}

.others {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2rem 1.5rem 5rem;
}
.others-title {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  margin-bottom: 1rem;
}
.other-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 0;
  border-top: 1px solid hsl(var(--border) / 0.5);
}
.other-tag {
  flex-shrink: 0;
  font-size: 0.72rem;
  color: hsl(var(--primary));
}
.other-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: hsl(var(--foreground));
  font-size: 0.98rem;
  transition: color 0.3s ease;
}
.other-arrow {
  color: hsl(var(--muted-foreground));
  transition: transform 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}
.other-row:hover .other-text {
  color: hsl(var(--primary));
}
.other-row:hover .other-arrow {
  transform: translateX(3px);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 6rem 1.5rem;
  color: hsl(var(--muted-foreground));
}
.home {
  color: hsl(var(--primary));
}
</style>