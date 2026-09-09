<script setup lang="ts">
/** iOS 液态玻璃按钮：高透明玻璃底 + 背景透出色彩 + 顶部镜面高光 + 按压回弹 */
</script>

<template>
  <button type="button" class="liquid-glass-btn">
    <span class="lg-content"><slot /></span>
  </button>
</template>

<style scoped>
.liquid-glass-btn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 999px;
  padding: 0.55rem 1.3rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  /* 浅色主题：白色磨砂玻璃 + 深色文字 */
  color: hsl(var(--foreground));
  border: 1px solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.38);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.8),
    inset 0 -1px 1px rgba(255, 255, 255, 0.35),
    0 8px 24px rgba(0, 0, 0, 0.1);
  /* 松手时用带回弹的曲线放大回去 */
  transition:
    transform 0.35s cubic-bezier(0.34, 1.8, 0.64, 1),
    box-shadow 0.25s ease,
    background 0.25s ease;
}

/* 深色主题：透明深色玻璃 + 白色文字 */
:global(.dark) .liquid-glass-btn {
  color: hsl(var(--foreground));
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.08);
}

/* 顶部镜面高光：从上往下的镜面反光层 */
.liquid-glass-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.55) 0%,
    rgba(255, 255, 255, 0.14) 34%,
    rgba(255, 255, 255, 0) 60%,
    rgba(255, 255, 255, 0.1) 100%
  );
  pointer-events: none;
}

.lg-content {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.52);
}

:global(.dark) .liquid-glass-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* 按下快速缩小，松手靠上面的回弹曲线弹回 */
.liquid-glass-btn:active {
  transform: scale(0.93);
  transition: transform 0.08s ease;
}

.liquid-glass-btn:focus-visible {
  outline: 2px solid hsl(var(--ring) / 0.6);
  outline-offset: 2px;
}
</style>
