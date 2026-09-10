<script setup lang="ts">
/**
 * Hero —— 首屏。
 * 版式对齐参考站点：`lg:grid-cols-[1.15fr_0.85fr]` 左文右图，
 * 左侧眉标药丸 + Fraunces 大标题 + 形变轮播的职位文案 + 简介 + 两个交互按钮，
 * 右侧是由粒子构成的字形（鼠标进入散开、移出复原）。
 * 首屏内容等启动遮罩结束后由 BlurReveal 错峰入场。
 */
import { BlurReveal, MorphingText, ParticleGlyph } from '@/components/portfolio'
import InteractiveHoverButton from '@/components/ui/interactive-hover-button.vue'

/** 形变轮播的职位文案，对齐参考站点 */
const ROLES = ['Frontend Engineer', 'Agent Infrastructure', 'Open Source Author', 'Vue / Nuxt Engineer']

/** 粒子字形，暂以「韩」占位 */
const GLYPH = '韩'
</script>

<template>
  <section class="hero section-pad">
    <div class="hero-grid">
      <div class="hero-copy">
        <BlurReveal mode="ready" :delay="0.08" :duration="0.9">
          <p class="eyebrow">Frontend · Agent · DX</p>
        </BlurReveal>

        <BlurReveal mode="ready" :delay="0.16" :duration="0.95">
          <h1 class="hero-name font-display">Karot</h1>
        </BlurReveal>

        <div class="hero-roles">
          <MorphingText
            :texts="ROLES"
            class="!mx-0 !h-12 !max-w-full !text-left !text-2xl !leading-tight md:!h-14 md:!text-3xl lg:!text-3xl"
          />
        </div>

        <BlurReveal mode="ready" :delay="0.28" :duration="1">
          <p class="hero-intro">
            发布 Vite 插件与可安装 Agent Skill。把类型同步、Mock 联调和采集流程做成可复用的工程基础设施。
          </p>
        </BlurReveal>

        <BlurReveal mode="ready" :delay="0.36" :duration="1">
          <div class="hero-actions">
            <a href="#open-source" class="hero-link">
              <InteractiveHoverButton text="查看开源" />
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

.hero-roles {
  position: relative;
  margin-top: 1.25rem;
  max-width: 36rem;
  overflow: hidden;
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
