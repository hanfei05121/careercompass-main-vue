<script setup lang="ts">
/**
 * Hero —— 首屏。
 * `lg:grid-cols-[1.15fr_0.85fr]` 左文右图：
 * 左侧眉标药丸 + Fraunces 大标题 + 形变轮播的职位文案 + 简介 + 两个交互按钮，
 * 右侧是由粒子构成的字形（鼠标进入散开、移出复原）。
 * 首屏内容等启动遮罩结束后由 BlurReveal 错峰入场。
 */
import { BlurReveal, ParticleGlyph, RoleRotator } from '@/components/portfolio'
import InteractiveHoverButton from '@/components/ui/interactive-hover-button.vue'

/** 形变轮播的职位文案 */
const ROLES = ['Vue 3 前端工程师', '中后台业务系统', '社区 / 直播 H5', '工程化与联调提效']

/** 粒子字形：姓氏「韩」 */
const GLYPH = '韩'
</script>

<template>
  <section class="hero section-pad">
    <div class="hero-grid">
      <div class="hero-copy">
        <BlurReveal mode="ready" :delay="0.08" :duration="0.9">
          <p class="eyebrow">Vue · 中后台 · H5 · 工程化</p>
        </BlurReveal>

        <BlurReveal mode="ready" :delay="0.16" :duration="0.95">
          <h1 class="hero-name font-display">韩</h1>
        </BlurReveal>

        <RoleRotator :texts="ROLES" class="mt-5" />

        <BlurReveal mode="ready" :delay="0.28" :duration="1">
          <p class="hero-intro">
            今年先后交付应收管理中后台、企业社区论坛（H5 + PC）与外包资源管理平台三套系统。擅长把重复的表格、表单、联调流程沉淀成可复用的组件与工具，让业务页面写得更少、跑得更稳。
          </p>
        </BlurReveal>

        <BlurReveal mode="ready" :delay="0.36" :duration="1">
          <div class="hero-actions">
            <a href="#projects" class="hero-link">
              <InteractiveHoverButton text="看看项目" />
            </a>
            <a href="#writing" class="hero-link">
              <InteractiveHoverButton
                text="阅读文章"
                class="border-primary/30 bg-primary text-primary-foreground"
              />
            </a>
          </div>
        </BlurReveal>
      </div>

      <BlurReveal
        mode="ready"
        :delay="0.18"
        :duration="1.1"
        :y-offset="24"
        class="hero-particle-wrap"
      >
        <div class="hero-particle-field">
          <ParticleGlyph
            :text="GLYPH"
            class="absolute inset-0"
            :particle-gap="5"
            :particle-size="2.5"
            :gravity="0.06"
            :mouse-force="32"
            init-position="misplaced"
            :noise="1.5"
            :accent-chance="0.18"
          />
        </div>
      </BlurReveal>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  min-height: 100dvh;
  /* 悬浮导航占位，避免内容顶到药丸下面 */
  padding-top: 8rem;
  padding-bottom: 4rem;
}

.hero-grid {
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.hero-copy {
  position: relative;
  z-index: 10;
}

.hero-name {
  margin-top: 1.5rem;
  font-size: clamp(2.75rem, 9vw, 3rem);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.04em;
  color: hsl(var(--foreground));
}

.hero-intro {
  margin-top: 1.5rem;
  max-width: 36rem;
  font-size: 1rem;
  line-height: 1.625;
  color: hsl(var(--muted-foreground));
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}

.hero-link {
  display: inline-flex;
  border-radius: 9999px;
}

.hero-particle-wrap {
  display: flex;
  justify-content: center;
  width: 100%;
}

.hero-particle-field {
  position: relative;
  height: 20rem;
  aspect-ratio: 431 / 425;
  width: auto;
}

@media (min-width: 40rem) {
  .hero-particle-field {
    height: 24rem;
  }
}

@media (min-width: 48rem) {
  .hero-name {
    font-size: 3rem;
  }

  .hero-intro {
    font-size: 1.125rem;
  }
}

@media (min-width: 64rem) {
  .hero {
    padding-block: 6rem 4rem;
  }

  .hero-grid {
    grid-template-columns: 1.15fr 0.85fr;
    align-items: center;
    gap: 2rem;
  }

  .hero-name {
    font-size: 4.5rem;
  }

  .hero-particle-wrap {
    justify-content: flex-end;
  }

  .hero-particle-field {
    height: 28rem;
  }
}
</style>
