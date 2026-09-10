<script setup lang="ts">
/**
 * LiquidGlass —— 液态玻璃容器，逐参数对齐参考站点 Karot 的 LiquidGlass 组件。
 *
 * 原理：生成一张「法线贴图」SVG（红/蓝渐变 + 内层模糊实心块，混合模式 difference），
 * 作为 feImage 输入；再用三条 feDisplacementMap 分别对 R/G/B 通道做不同强度的位移，
 * 最后 screen 混合 —— 得到边缘折射、中间平滑的玻璃质感，通过 backdrop-filter 应用。
 * 容器尺寸变化时重建贴图，并只在进入视口时挂载滤镜，避免无谓开销。
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** 圆角（px） */
    radius?: number
    /** 边缘折射带宽度比例 */
    border?: number
    /** 贴图内层灰度 */
    lightness?: number
    /** 红蓝混合模式 */
    blend?: string
    xChannel?: string
    yChannel?: string
    /** 内层实心透明度 */
    alpha?: number
    /** 内层模糊半径 */
    blur?: number
    rOffset?: number
    gOffset?: number
    bOffset?: number
    /** 基础位移强度（负值向内折射） */
    scale?: number
    /** 玻璃底色占比 */
    frost?: number
    /** 附加高斯模糊 */
    displace?: number
    class?: string
    containerClass?: string
  }>(),
  {
    radius: 16,
    border: 0.07,
    lightness: 50,
    blend: 'difference',
    xChannel: 'R',
    yChannel: 'B',
    alpha: 0.93,
    blur: 11,
    rOffset: 0,
    gOffset: 10,
    bOffset: 20,
    scale: -180,
    frost: 0.05,
    displace: 0,
    class: '',
    containerClass: '',
  },
)

let uidSeed = 0
const filterId = `liquid-glass-${(uidSeed += 1)}-${Math.random().toString(36).slice(2, 7)}`

const rootRef = ref<HTMLElement | null>(null)
const size = ref({ width: 0, height: 0 })
const enabled = ref(true)

let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

/** 分通道位移只有在三通道偏移不一致时才需要，否则用单条滤镜更省 */
const perChannel = computed(() => props.rOffset !== 0 || props.gOffset !== 0 || props.bOffset !== 0)

const backdropFilter = computed(() => (enabled.value ? `url(#${filterId})` : 'none'))

/** 内容槽类名：class 作为 prop 传入，需在脚本侧拼接（模板里 :class="class" 会与保留属性冲突） */
const slotClass = computed(() => `liquid-glass__slot slot-container ${props.class}`.trim())

const rootStyle = computed(() => ({
  '--frost': props.frost,
  borderRadius: `${props.radius}px`,
  backdropFilter: backdropFilter.value,
  WebkitBackdropFilter: backdropFilter.value,
}))

/** 法线贴图：黑底 + 红/蓝渐变圆角矩形（差值混合） + 中心模糊的灰色实心块 */
const mapSvg = computed(() => {
  const w = size.value.width
  const h = size.value.height
  if (w <= 0 || h <= 0) return ''

  const edge = Math.min(w, h) * (props.border * 0.5)
  const r = Math.min(props.radius, w / 2, h / 2)
  const innerRadius = Math.max(0, r - edge)
  const innerW = Math.max(0, w - edge * 2)
  const innerH = Math.max(0, h - edge * 2)

  return `
    <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="red"/>
        </linearGradient>
        <linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0000"/>
          <stop offset="100%" stop-color="blue"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${w}" height="${h}" fill="black"></rect>
      <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="url(#red)" />
      <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="url(#blue)" style="mix-blend-mode: ${props.blend}" />
      <rect
        x="${edge}"
        y="${edge}"
        width="${innerW}"
        height="${innerH}"
        rx="${innerRadius}"
        fill="hsl(0 0% ${props.lightness}% / ${props.alpha})"
        style="filter:blur(${props.blur}px)"
      />
    </svg>
  `
})

const mapUrl = computed(() => `data:image/svg+xml,${encodeURIComponent(mapSvg.value)}`)

/** 读取真实尺寸：优先 borderBoxSize，回落 contentRect */
function measure(entry?: ResizeObserverEntry) {
  if (!enabled.value) return
  let w = 0
  let h = 0
  if (entry) {
    if (entry.borderBoxSize?.length) {
      w = entry.borderBoxSize[0].inlineSize
      h = entry.borderBoxSize[0].blockSize
    } else if (entry.contentRect) {
      w = entry.contentRect.width
      h = entry.contentRect.height
    }
  } else if (rootRef.value) {
    const rect = rootRef.value.getBoundingClientRect()
    w = rect.width
    h = rect.height
  }
  w = Math.round(w)
  h = Math.round(h)
  if (w > 0 && h > 0 && (w !== size.value.width || h !== size.value.height)) {
    size.value = { width: w, height: h }
  }
}

onMounted(() => {
  const node = rootRef.value
  if (!node) return

  resizeObserver = new ResizeObserver((entries) => measure(entries[0]))
  resizeObserver.observe(node)

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      enabled.value = entries[0]?.isIntersecting ?? true
      if (enabled.value) measure()
    },
    { rootMargin: '40px' },
  )
  intersectionObserver.observe(node)

  measure()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  resizeObserver = null
  intersectionObserver = null
})

// 结构性参数变化时重绘贴图
watch(
  () => [props.border, props.radius, props.lightness, props.alpha, props.blur, props.blend],
  () => measure(),
)
</script>

<template>
  <div
    ref="rootRef"
    class="liquid-glass effect"
    :class="containerClass"
    :style="rootStyle"
  >
    <div :class="slotClass">
      <slot />
    </div>

    <svg v-show="enabled" class="liquid-glass__filter" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter :id="filterId" color-interpolation-filters="sRGB">
          <feImage
            x="0"
            y="0"
            width="100%"
            height="100%"
            :href="mapUrl"
            result="map"
          />
          <template v-if="perChannel">
            <feDisplacementMap
              id="redchannel"
              in="SourceGraphic"
              in2="map"
              :xChannelSelector="xChannel"
              :yChannelSelector="yChannel"
              :scale="scale + rOffset"
              result="dispRed"
            />
            <feColorMatrix
              in="dispRed"
              type="matrix"
              values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="red"
            />
            <feDisplacementMap
              id="greenchannel"
              in="SourceGraphic"
              in2="map"
              :xChannelSelector="xChannel"
              :yChannelSelector="yChannel"
              :scale="scale + gOffset"
              result="dispGreen"
            />
            <feColorMatrix
              in="dispGreen"
              type="matrix"
              values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="green"
            />
            <feDisplacementMap
              id="bluechannel"
              in="SourceGraphic"
              in2="map"
              :xChannelSelector="xChannel"
              :yChannelSelector="yChannel"
              :scale="scale + bOffset"
              result="dispBlue"
            />
            <feColorMatrix
              in="dispBlue"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
              result="blue"
            />
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="output" />
          </template>
          <feDisplacementMap
            v-else
            in="SourceGraphic"
            in2="map"
            :xChannelSelector="xChannel"
            :yChannelSelector="yChannel"
            :scale="scale"
          />
          <feGaussianBlur v-if="displace > 0" :stdDeviation="displace" />
        </filter>
      </defs>
    </svg>
  </div>
</template>
