<script setup lang="ts">
/**
 * NavBar —— 顶部悬浮导航。
 * 结构对齐参考站点 SiteHeader：
 * fixed 顶部 → section-pad 竖向内边距 → 药丸形液态玻璃容器（max-w-6xl）
 *   → 品牌（图形标 + Fraunces 字标） / 导航项（hover 药丸底色） / 主题切换
 * 差异：本项目是单页落地页，导航项指向分区锚点，并额外做了当前分区高亮。
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LiquidGlass, ThemeToggle } from '@/components/portfolio'

const links = [
  { id: 'about', label: '关于' },
  { id: 'open-source', label: '开源' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'writing', label: '文章' },
  { id: 'trajectory', label: '轨迹' },
]

const route = useRoute()
const router = useRouter()

/** 当前处于视口中的分区 id，用于导航项高亮 */
const activeId = ref('')

function updateActive() {
  // 仅首页（落地页）做分区高亮
  if (route.path !== '/') {
    activeId.value = ''
    return
  }

  const line = window.innerHeight * 0.32
  let current = ''

  for (const link of links) {
    const el = document.getElementById(link.id)
    if (!el) continue
    if (el.getBoundingClientRect().top <= line) current = link.id
  }

  // 触底时高亮最后一项，避免末尾分区过短无法激活
  const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
  activeId.value = atBottom ? (links[links.length - 1]?.id ?? current) : current
}

function go(event: MouseEvent, id: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()

  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
    return
  }

  // 在文章详情页等非落地页时，回到首页对应分区
  router.push({ path: '/', hash: `#${id}` })
}

/** 回到顶部：落地页平滑滚动，其它页面回首页 */
function backToTop(event: MouseEvent) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()

  if (route.path === '/') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.history.replaceState(null, '', window.location.pathname)
    return
  }

  router.push('/')
}

onMounted(() => {
  updateActive()
  window.addEventListener('scroll', updateActive, { passive: true })
  window.addEventListener('resize', updateActive)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActive)
  window.removeEventListener('resize', updateActive)
})
</script>

<template>
  <header class="site-header">
    <div class="section-pad !py-4 md:!py-5">
      <LiquidGlass
        :radius="999"
        :frost="0.1"
        :border="0.35"
        :scale="-80"
        :blur="6"
        :g-offset="2"
        :b-offset="4"
        container-class="pointer-events-auto mx-auto max-w-6xl"
      >
        <div class="nav-inner">
          <a
            href="#top"
            class="brand"
            aria-label="回到顶部"
            @click="backToTop"
          >
            <span class="brand-mark" aria-hidden="true">
              <span class="brand-mark-inner">H</span>
            </span>
            <span class="brand-name font-display">Karot</span>
          </a>

          <nav class="nav-links">
            <a
              v-for="link in links"
              :key="link.id"
              :href="`#${link.id}`"
              class="nav-link"
              :class="{ 'is-active': activeId === link.id }"
              :aria-current="activeId === link.id ? 'page' : undefined"
              @click="go($event, link.id)"
            >
              {{ link.label }}
            </a>
          </nav>

          <div class="nav-actions">
            <ThemeToggle />
          </div>
        </div>
      </LiquidGlass>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: 50;
  pointer-events: none;
}

.nav-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  border-radius: 9999px;
  outline: none;
  transition: opacity 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.brand:focus-visible {
  box-shadow: 0 0 0 2px color-mix(in oklch, hsl(var(--primary)) 40%, transparent);
}

.brand-mark {
  position: relative;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 9999px;
  background:
    radial-gradient(120% 120% at 25% 20%, hsl(var(--primary)) 0%, transparent 62%),
    linear-gradient(140deg, hsl(335 70% 60%), hsl(270 55% 45%));
  color: hsl(var(--primary-foreground));
  font-family: 'Fraunces', ui-serif, serif;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 2px 10px hsl(var(--primary) / 0.35);
}

.brand-mark-inner {
  transform: translateY(0.5px);
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
  color: hsl(var(--foreground));
}

.nav-links {
  display: none;
  align-items: center;
  gap: 0.375rem;
}

.nav-link {
  border-radius: 9999px;
  padding: 0.5rem 0.875rem;
  font-size: 15px;
  color: hsl(var(--muted-foreground));
  transition:
    background-color 0.5s cubic-bezier(0.32, 0.72, 0, 1),
    color 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.nav-link:hover {
  background: color-mix(in oklch, hsl(var(--accent)) 70%, transparent);
  color: hsl(var(--foreground));
}

.nav-link.is-active {
  color: hsl(var(--foreground));
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

@media (min-width: 48rem) {
  .nav-inner {
    padding: 0.75rem 1.5rem;
  }

  .brand-mark {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1rem;
  }

  .nav-links {
    display: flex;
  }
}
</style>
