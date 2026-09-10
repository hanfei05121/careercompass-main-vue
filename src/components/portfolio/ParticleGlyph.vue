<script setup lang="ts">
/**
 * ParticleGlyph —— 粒子字形。
 *
 * 参考站点首屏右栏是一张由粒子构成的品牌图形（参考站用 ParticleImage 采样 PNG）。
 * 这里把「采样源」换成一段文字：先把字形画到离屏 canvas，再按像素采样生成粒子，
 * 物理与渲染逐行对齐参考站点的 InspiraImageParticle：
 * - 回位：向原点施加与距离成正比的加速度（f = dist * 0.01）
 * - 阻尼：v *= 1 - gravity * speed，speed = ln(粒子数)/10
 * - 鼠标：进入后在 1px 半径内按 mouseForce / dist 施加斥力 —— 粒子像油渍遇到洗洁精一样散开；
 *        移出（mouseout）清空触点，粒子被回位力拉回原处复原
 * - 渲染：2D canvas + putImageData 方形笔刷（参考站默认走这条路径，比 WebGL 更省）
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useSiteReady } from '@/composables/useSiteReady'
import { useTheme } from '@/composables/useTheme'
import { cn } from '@/utils'

const props = withDefaults(
  defineProps<{
    /** 组成粒子的字形 / 文字（暂以「韩」占位） */
    text?: string
    /** 字形字体 */
    fontFamily?: string
    /** 字号相对容器短边的比例 */
    fontScale?: number
    /** 采样间隔（px） */
    particleGap?: number
    /** 粒子方块边长 */
    particleSize?: number
    /** 阻尼系数，越大回位越慢 */
    gravity?: number
    /** 鼠标斥力强度 */
    mouseForce?: number
    /** 初始位置随机抖动 */
    noise?: number
    /** 初始位置分布 */
    initPosition?: 'misplaced' | 'random' | 'center'
    /** 强调色出现概率 */
    accentChance?: number
    /** 暗色主题的强调色板 */
    accentPalette?: string[]
    /** 浅色主题的强调色板 */
    accentPaletteLight?: string[]
    class?: string
  }>(),
  {
    text: '韩',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif',
    fontScale: 0.82,
    particleGap: 5,
    particleSize: 2.5,
    gravity: 0.06,
    mouseForce: 32,
    noise: 1.5,
    initPosition: 'misplaced',
    accentChance: 0.18,
    accentPalette: () => ['#e8c4d4', '#f0d8e4', '#edd8c8'],
    accentPaletteLight: () => ['#b44868', '#c45d78', '#a83d5c'],
    class: '',
  },
)

interface Origin {
  x: number
  y: number
  z: number
  /** 当前生效的颜色（随主题变化） */
  color: [number, number, number, number]
  /** 原始像素色，切主题时由它推导 */
  baseColor: [number, number, number, number]
  accentT: number
  accentIndex: number
}

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

interface Touch {
  x: number
  y: number
  z: number
  force: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { isDark } = useTheme()
const { reduced } = useReducedMotion()
const { markParticlesReady } = useSiteReady()

let ctx: CanvasRenderingContext2D | null = null
let rafId = 0
let resizeRaf = 0
let origins: Origin[] = []
let particles: Particle[] = []
let imageData: ImageData | null = null
let imageU32: Uint32Array | null = null
let width = 0
let height = 0
let speed = 1
let gravityFactor = 1
let brush = 3
let brushRadiusSq = 0
let brushCenter = 0

let touches: Touch[] = []
let started = false
let inView = true
let pageVisible = true
let observer: IntersectionObserver | null = null
let themeObserver: MutationObserver | null = null

function parseColor(input: string): [number, number, number] | null {
  const value = input.replace(/\s/g, '')

  let m = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(value)
  if (m) return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]

  m = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(value)
  if (m) return [parseInt(m[1], 16) * 17, parseInt(m[2], 16) * 17, parseInt(m[3], 16) * 17]

  m = /^rgb\((\d+),(\d+),(\d+)\)/.exec(value)
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])]

  return null
}

/** 按主题给粒子上色：暗色保留原色，浅色按亮度推导并混入强调色 */
function tintOrigin(origin: Origin) {
  const [r, g, b, a] = origin.baseColor
  const luma = (r + g + b) / 765

  let outR = r
  let outG = g
  let outB = b

  if (!isDark.value) {
    outR = Math.round(48 + 128 * luma)
    outG = Math.round(32 + 80 * luma)
    outB = Math.round(38 + 84 * luma)
  }

  const palette = isDark.value ? props.accentPalette : props.accentPaletteLight
  if (origin.accentT > 0 && palette.length > 0) {
    const acc = parseColor(palette[origin.accentIndex % palette.length])
    if (acc) {
      const t = isDark.value ? origin.accentT : Math.min(0.42, origin.accentT * 1.65)
      outR = Math.round(outR * (1 - t) + acc[0] * t)
      outG = Math.round(outG * (1 - t) + acc[1] * t)
      outB = Math.round(outB * (1 - t) + acc[2] * t)
    }
  }

  origin.color = [outR, outG, outB, a]
}

function retintAll() {
  for (const origin of origins) tintOrigin(origin)
  if (!started) return
  renderFrame()
}

/** 把字形画到离屏 canvas 并采样成粒子原点 */
function buildOrigins() {
  const canvas = canvasRef.value
  if (!canvas) return

  width = Math.max(1, Math.round(canvas.width))
  height = Math.max(1, Math.round(canvas.height))

  const off = document.createElement('canvas')
  off.width = width
  off.height = height
  const octx = off.getContext('2d')
  if (!octx) return

  octx.clearRect(0, 0, width, height)
  const fontSize = Math.min(width, height) * props.fontScale
  octx.font = `700 ${fontSize}px ${props.fontFamily}`
  octx.textAlign = 'center'
  octx.textBaseline = 'middle'
  octx.fillStyle = '#ffffff'
  octx.fillText(props.text, width / 2, height / 2)

  const pixels = octx.getImageData(0, 0, width, height).data
  const gap = Math.max(1, Math.round(props.particleGap))
  const jitter = gap * 0.4

  origins = []

  for (let dx = 0; dx < width; dx += gap) {
    for (let dy = 0; dy < height; dy += gap) {
      const idx = (dx + dy * width) * 4
      const alpha = pixels[idx + 3] ?? 0
      if (alpha <= 24) continue

      const r = pixels[idx] ?? 0
      const g = pixels[idx + 1] ?? 0
      const b = pixels[idx + 2] ?? 0

      let accentT = 0
      let accentIndex = 0
      if (props.accentChance > 0) {
        const luma = (r + g + b) / 765
        const chance = luma > 0.42 ? props.accentChance * (0.4 + 0.6 * luma) : 0
        if (Math.random() < chance) {
          accentT = 0.14 + Math.random() * 0.12
          accentIndex = Math.floor(Math.random() * 64)
        }
      }

      const origin: Origin = {
        x: dx + (Math.random() - 0.5) * jitter,
        y: dy + (Math.random() - 0.5) * jitter,
        z: 50,
        color: [r, g, b, alpha],
        baseColor: [r, g, b, alpha],
        accentT,
        accentIndex,
      }
      tintOrigin(origin)
      origins.push(origin)
    }
  }

  // 浅色主题的强调色兜底由 props 的默认值保证
  speed = Math.max(0.05, Math.log(Math.max(2, origins.length)) / 10)
  gravityFactor = 1 - props.gravity * speed

  // 初始化粒子
  particles = origins.map((origin) => {
    const p: Particle = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 }
    if (props.initPosition === 'random') {
      p.x = Math.random() * width
      p.y = Math.random() * height
    } else if (props.initPosition === 'misplaced') {
      p.x = origin.x + Math.random() * width * 0.3 - width * 0.1
      p.y = origin.y + Math.random() * height * 0.3 - height * 0.1
    } else {
      p.x = origin.x
      p.y = origin.y
    }
    return p
  })
}

function prepareCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))
  if (w < 8 || h < 8) return

  const changed = canvas.width !== w || canvas.height !== h
  canvas.width = w
  canvas.height = h
  ctx = canvas.getContext('2d')
  if (!ctx) return

  imageData = ctx.createImageData(w, h)
  imageU32 = new Uint32Array(imageData.data.buffer)

  brush = Math.max(1, Math.round(props.particleSize))
  brushCenter = (brush - 1) / 2
  brushRadiusSq = (brush / 2) * (brush / 2)

  if (changed || origins.length === 0) buildOrigins()
}

/** 一帧物理积分：回位力 + 鼠标斥力 + 阻尼 */
function calculate() {
  const noise = props.noise
  const n = origins.length

  for (let i = 0; i < n; i += 1) {
    const origin = origins[i]
    const p = particles[i]
    if (!origin || !p) continue

    let dx = origin.x - p.x + (Math.random() - 0.5) * noise
    let dy = origin.y - p.y + (Math.random() - 0.5) * noise
    let dz = origin.z - p.z + ((Math.random() - 0.5) * noise) / 1000

    let dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001
    let force = dist * 0.01
    p.vx += (dx / dist) * force * speed
    p.vy += (dy / dist) * force * speed
    p.vz += (dz / dist) * force * speed

    for (const touch of touches) {
      dx = p.x - touch.x
      dy = p.y - touch.y
      dz = p.z - touch.z
      dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001
      force = (props.mouseForce * touch.force) / dist
      p.vx += (dx / dist) * force * speed
      p.vy += (dy / dist) * force * speed
      p.vz += (dz / dist) * force * speed
    }

    p.vx *= gravityFactor
    p.vy *= gravityFactor
    p.vz *= gravityFactor
    p.x += p.vx
    p.y += p.vy
    p.z += p.vz
  }
}

/** 方形笔刷 raster 到 ImageData 后一次性 putImageData */
function renderFrame() {
  if (!ctx || !imageData || !imageU32) return

  imageU32.fill(0)

  const data = imageData.data
  const size = brush
  const radiusSq = brushRadiusSq
  const center = brushCenter

  for (let i = 0; i < origins.length; i += 1) {
    const origin = origins[i]
    const p = particles[i]
    if (!origin || !p) continue

    const px = Math.trunc(p.x)
    const py = Math.trunc(p.y)
    const [cr, cg, cb, ca] = origin.color

    for (let oy = 0; oy < size; oy += 1) {
      const y = py + oy
      if (y < 0 || y >= height) continue

      for (let ox = 0; ox < size; ox += 1) {
        if (size > 1) {
          const ddx = ox - center
          const ddy = oy - center
          if (ddx * ddx + ddy * ddy > radiusSq + 0.35) continue
        }
        const x = px + ox
        if (x < 0 || x >= width) continue

        const idx = (x + y * width) * 4
        data[idx] = cr
        data[idx + 1] = cg
        data[idx + 2] = cb
        data[idx + 3] = ca
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

function animate() {
  rafId = 0
  if (!started) return
  calculate()
  renderFrame()
  if (inView && pageVisible && !reduced.value) rafId = requestAnimationFrame(animate)
}

function start(attempt = 0) {
  if (started) return
  prepareCanvas()

  // 容器还没量出尺寸时重试，避免首次布局抖动导致空粒子
  if (origins.length === 0) {
    if (attempt < 40) requestAnimationFrame(() => start(attempt + 1))
    else markParticlesReady()
    return
  }

  started = true
  markParticlesReady()

  // 减少动效：直接画一张粒子归位后的静态画面
  if (reduced.value) {
    particles = origins.map((origin) => ({
      x: origin.x,
      y: origin.y,
      z: origin.z,
      vx: 0,
      vy: 0,
      vz: 0,
    }))
    renderFrame()
    return
  }

  rafId = requestAnimationFrame(animate)
}

function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function syncVisibility() {
  pageVisible = document.visibilityState === 'visible'
  if (started && inView && pageVisible && !reduced.value) {
    if (!rafId) rafId = requestAnimationFrame(animate)
    return
  }
  stopLoop()
}

function onResize() {
  if (resizeRaf) return
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    if (Math.round(rect.width) === canvas.width && Math.round(rect.height) === canvas.height) return
    prepareCanvas()
    if (reduced.value) {
      particles = origins.map((o) => ({ x: o.x, y: o.y, z: o.z, vx: 0, vy: 0, vz: 0 }))
      renderFrame()
    }
  })
}

function pointerToLocal(clientX: number, clientY: number) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return { x: clientX - rect.left, y: clientY - rect.top }
}

function onPointerMove(event: PointerEvent) {
  if (reduced.value) return
  const { x, y } = pointerToLocal(event.clientX, event.clientY)
  touches = [{ x, y, z: 49, force: 1 }]
}

function onPointerLeave() {
  touches = []
}

onMounted(() => {
  start()

  const canvas = canvasRef.value
  if (canvas) {
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerleave', onPointerLeave)
    canvas.addEventListener('pointercancel', onPointerLeave)

    observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true
        syncVisibility()
      },
      { rootMargin: '120px' },
    )
    observer.observe(canvas)
  }

  themeObserver = new MutationObserver(() => retintAll())
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  document.addEventListener('visibilitychange', syncVisibility)
  window.addEventListener('resize', onResize)
})

watch(reduced, () => syncVisibility())

onBeforeUnmount(() => {
  started = false
  stopLoop()
  if (resizeRaf) cancelAnimationFrame(resizeRaf)
  observer?.disconnect()
  observer = null
  themeObserver?.disconnect()
  themeObserver = null
  document.removeEventListener('visibilitychange', syncVisibility)
  window.removeEventListener('resize', onResize)
  const canvas = canvasRef.value
  if (canvas) {
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerleave', onPointerLeave)
    canvas.removeEventListener('pointercancel', onPointerLeave)
  }
  origins = []
  particles = []
  ctx = null
})
</script>

<template>
  <div :class="cn('relative overflow-visible', props.class)">
    <canvas
      ref="canvasRef"
      class="particle-glyph"
      role="img"
      :aria-label="props.text"
    />
  </div>
</template>

<style scoped>
.particle-glyph {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
}
</style>
