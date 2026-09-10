<script setup lang="ts">
/** PillLink —— 药丸圆角描边链接：带 hover 文字错位滑动与小圆点光晕。 */
</script>

<template>
  <a class="pill-link group">
    <span class="pill-dot" aria-hidden="true" />
    <span class="pill-label">
      <slot />
    </span>
    <span class="pill-arrow" aria-hidden="true">↗</span>
  </a>
</template>

<style scoped>
.pill-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  border: 0.8px solid oklab(0.82 0.098 -0.017 / 0.25);
  color: hsl(var(--foreground));
  background: color-mix(in oklch, hsl(var(--card)) 40%, transparent);
  transition:
    border-color 0.5s cubic-bezier(0.32, 0.72, 0, 1),
    background-color 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.pill-link:hover {
  border-color: hsl(var(--ring) / 0.55);
  background: color-mix(in oklch, hsl(var(--card)) 70%, transparent);
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: hsl(var(--primary));
  box-shadow: 0 0 8px 1px hsl(var(--primary) / 0.6);
}

.pill-label {
  transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}

.pill-arrow {
  opacity: 0.6;
  font-size: 0.8em;
  transition:
    transform 0.5s cubic-bezier(0.32, 0.72, 0, 1),
    opacity 0.3s ease;
}

.group:hover .pill-label {
  transform: translateX(3px);
}

.group:hover .pill-arrow {
  transform: translate(2px, -2px);
  opacity: 1;
}
</style>