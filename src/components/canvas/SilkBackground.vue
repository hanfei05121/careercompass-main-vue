<script setup lang="ts">
/**
 * SilkBackground —— 丝绸 WebGL2 背景（可全局或局部复用）。
 *
 * 逐条对齐参考站点：
 * - 着色器：`silkShader.ts`（ShaderToy X3yXRd，MIT）
 * - 性能档位：GPU 较弱、核心数 ≤ 4 或 DPR ≥ 3 时降到 0.3 渲染倍率 / 24fps，否则 0.4 / 30fps
 * - 生命周期：页面不可见或不在视口内时暂停；减少动效时只画一帧
 *
 * 复用方式：
 * - 默认作为整页背景：`<SilkBackground />`（fixed 全屏，叠在内容之下）
 * - 放进卡片 / 分区里：`<SilkBackground :fill="false" hue="210" :speed="0.6" />`，
 *   外层容器需要 `position: relative` 且有自身高度，组件会 absolute 铺满
 * - 配色与动效通过 props 调整（hue / saturation / brightness / speed / opacity）
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useSiteReady } from '@/composables/useSiteReady'
import { SILK_FRAGMENT_SHADER, SILK_VERTEX_SHADER } from './silkShader'

const props = withDefaults(
  defineProps<{
    /** 色相 0~360（默认 300 紫红，与首页一致） */
    hue?: number
    /** 饱和度 0~1 */
    saturation?: number
    /** 明度 0~1 */
    brightness?: number
    /** 流动速度倍率 */
    speed?: number
    /** 暗色主题下的整体透明度 */
    opacity?: number
    /** 浅色主题下的整体透明度 */
    lightOpacity?: number
    /** true = fixed 全屏铺底（默认）；false = absolute 填满最近的定位父级 */
    fill?: boolean
  }>(),
  {
    hue: 300,
    saturation: 0.5,
    brightness: 1,
    speed: 1,
    opacity: 0.55,
    lightOpacity: 0.36,
    fill: true,
  },
)

/** 参考站点的两档 GPU 配置 */
const NORMAL_PROFILE = { pixelRatio: 0.4, frameRate: 30 }
const WEAK_PROFILE = { pixelRatio: 0.3, frameRate: 24 }

/** 探测结果缓存，避免重复创建 canvas 探测开销 */
let cachedProfile: { pixelRatio: number; frameRate: number } | null = null

function detectProfile() {
  if (cachedProfile) return cachedProfile

  let renderer = ''
  let cores = 4
  let dpr = 1

  try {
    dpr = window.devicePixelRatio || 1
    cores = navigator.hardwareConcurrency || 4
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2', { powerPreference: 'high-performance' })
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    if (gl && ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    canvas.remove()
  } catch {
    /* 探测失败就用默认档位 */
  }

  const weak = /intel|uhd|iris|hd graphics|adreno [1-6]|mali|swiftshader|llvmpipe/i.test(renderer)
  cachedProfile = weak || cores <= 4 || dpr >= 3 ? WEAK_PROFILE : NORMAL_PROFILE
  return cachedProfile
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const hostRef = ref<HTMLDivElement | null>(null)
const { reduced } = useReducedMotion()
const { markSilkReady } = useSiteReady()

let gl: WebGL2RenderingContext | null = null
let program: WebGLProgram | null = null
let uniforms: Record<string, WebGLUniformLocation | null> = {}
let rafId = 0
let resizeRaf = 0
let frameIndex = 0
let firstDrawTime = 0
let prevDrawTime = 0
let lastFrameTime = 0
let targetFPS = 30
let frameInterval = 1000 / 30
let pixelRatio = 0.4
let playing = false
let inViewport = true
let pageVisible = true

const resolution = new Float32Array([1, 1, 1])
const mouse = new Float32Array([0, 0, 0, 0])
const date = new Float32Array([0, 0, 0, 0])
const hsv = new Float32Array([props.hue, props.saturation, props.brightness])

/** 把当前 props 写入 HSV uniform（speed 在 draw 时实时读取） */
function syncHsv() {
  if (!gl || !uniforms.iHSV) return
  hsv[0] = props.hue
  hsv[1] = props.saturation
  hsv[2] = props.brightness
  gl.uniform3fv(uniforms.iHSV, hsv)
}

const layerStyle = computed(() => ({
  '--silk-opacity-dark': `${props.opacity}`,
  '--silk-opacity-light': `${props.lightOpacity}`,
}))

function compileShader(type: number, source: string) {
  if (!gl) return null
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('[SilkBackground] shader compile failed:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function init() {
  const canvas = canvasRef.value
  if (!canvas) return false

  gl = canvas.getContext('webgl2', {
    alpha: false,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  })
  if (!gl) return false

  const vertex = compileShader(gl.VERTEX_SHADER, SILK_VERTEX_SHADER)
  const fragment = compileShader(gl.FRAGMENT_SHADER, SILK_FRAGMENT_SHADER)
  if (!vertex || !fragment) return false

  program = gl.createProgram()
  if (!program) return false
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[SilkBackground] program link failed:', gl.getProgramInfoLog(program))
    return false
  }
  gl.useProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)

  // 覆盖全屏的两个三角形
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1, -1, 1, 1, -1]),
    gl.STATIC_DRAW,
  )
  const positionLoc = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionLoc)
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

  uniforms = {
    iResolution: gl.getUniformLocation(program, 'iResolution'),
    iTime: gl.getUniformLocation(program, 'iTime'),
    iTimeDelta: gl.getUniformLocation(program, 'iTimeDelta'),
    iFrameRate: gl.getUniformLocation(program, 'iFrameRate'),
    iFrame: gl.getUniformLocation(program, 'iFrame'),
    iMouse: gl.getUniformLocation(program, 'iMouse'),
    iDate: gl.getUniformLocation(program, 'iDate'),
    iHSV: gl.getUniformLocation(program, 'iHSV'),
    iSpeed: gl.getUniformLocation(program, 'iSpeed'),
  }

  gl.clearColor(0, 0, 0, 1)
  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.BLEND)
  gl.uniform3fv(uniforms.iResolution!, resolution)
  gl.uniform3fv(uniforms.iHSV!, hsv)
  gl.uniform1f(uniforms.iSpeed!, props.speed)
  gl.uniform1f(uniforms.iFrameRate!, targetFPS)
  gl.uniform1f(uniforms.iTime!, 0)
  gl.uniform1f(uniforms.iTimeDelta!, 0)
  gl.uniform1i(uniforms.iFrame!, 0)
  gl.uniform4fv(uniforms.iMouse!, mouse)
  gl.uniform4fv(uniforms.iDate!, date)

  return true
}

function resize() {
  const canvas = canvasRef.value
  const host = hostRef.value
  if (!gl || !canvas || !host) return

  // 按宿主元素实际尺寸测量：fixed 全屏时即视口，嵌入卡片时即卡片大小
  const rect = host.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width))
  const h = Math.max(1, Math.round(rect.height))
  const nextW = Math.floor(w * pixelRatio)
  const nextH = Math.floor(h * pixelRatio)
  if (canvas.width === nextW && canvas.height === nextH) return

  canvas.width = nextW
  canvas.height = nextH
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`

  resolution[0] = nextW
  resolution[1] = nextH
  resolution[2] = pixelRatio

  gl.viewport(0, 0, nextW, nextH)
  gl.uniform3fv(uniforms.iResolution!, resolution)
}

function draw() {
  if (!gl || !uniforms.iTime) return

  const now = playing ? performance.now() : prevDrawTime
  if (firstDrawTime === 0) firstDrawTime = now

  const delta = (now - prevDrawTime) * 0.001 * props.speed
  const elapsed = (now - firstDrawTime) * 0.001 * props.speed

  date[3] = now * 0.001

  gl.uniform1f(uniforms.iTime!, elapsed)
  gl.uniform1f(uniforms.iTimeDelta!, delta)
  gl.uniform1i(uniforms.iFrame!, frameIndex)
  gl.uniform4fv(uniforms.iDate!, date)

  gl.drawArrays(gl.TRIANGLES, 0, 6)

  prevDrawTime = now
  frameIndex += 1
}

function animate() {
  rafId = 0
  if (!playing) return

  let shouldDraw = true
  if (targetFPS < 60) {
    const now = performance.now()
    const since = now - lastFrameTime
    if (since < frameInterval) shouldDraw = false
    else lastFrameTime = now - (since % frameInterval)
  }

  if (shouldDraw) draw()
  rafId = requestAnimationFrame(animate)
}

function play() {
  if (playing) return
  playing = true
  const now = performance.now()
  const advanced = prevDrawTime - firstDrawTime
  firstDrawTime = now - advanced
  prevDrawTime = now
  lastFrameTime = now
  draw()
  if (!reduced.value) rafId = requestAnimationFrame(animate)
}

function pause() {
  playing = false
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function sync() {
  const runnable = inViewport && pageVisible && !reduced.value && !document.hidden
  if (runnable) {
    play()
    return
  }
  pause()
  // 减少动效时保留一张静态画面
  if (reduced.value) draw()
}

function onResize() {
  if (resizeRaf) return
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0
    resize()
    if (!playing) draw()
  })
}

function onVisibility() {
  pageVisible = document.visibilityState === 'visible'
  sync()
}

let intersectionObserver: IntersectionObserver | null = null
let hostResizeObserver: ResizeObserver | null = null

onMounted(() => {
  const profile = detectProfile()
  pixelRatio = profile.pixelRatio
  targetFPS = profile.frameRate
  frameInterval = 1000 / targetFPS

  if (!init()) {
    // 不支持 WebGL2 时也要放行启动序列，避免遮罩一直等下去
    markSilkReady()
    return
  }

  resize()
  firstDrawTime = performance.now()
  prevDrawTime = firstDrawTime
  lastFrameTime = firstDrawTime
  markSilkReady()

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      inViewport = entries[0]?.isIntersecting ?? true
      sync()
    },
    { rootMargin: '80px' },
  )
  if (canvasRef.value) intersectionObserver.observe(canvasRef.value)

  // 监听宿主尺寸变化：fixed 全屏时跟随窗口，嵌入卡片时跟随容器
  if (hostRef.value) {
    hostResizeObserver = new ResizeObserver(() => onResize())
    hostResizeObserver.observe(hostRef.value)
  }

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', onResize)

  sync()
})

watch(reduced, () => sync())

// 配色 / 速度 props 变化时实时写回 uniform
watch(
  () => [props.hue, props.saturation, props.brightness],
  () => {
    syncHsv()
    if (!playing) draw()
  },
)
watch(
  () => props.speed,
  (v) => {
    if (gl && uniforms.iSpeed) gl.uniform1f(uniforms.iSpeed, v)
  },
)

onBeforeUnmount(() => {
  pause()
  if (resizeRaf) cancelAnimationFrame(resizeRaf)
  intersectionObserver?.disconnect()
  intersectionObserver = null
  hostResizeObserver?.disconnect()
  hostResizeObserver = null
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('resize', onResize)
  if (gl && program) gl.deleteProgram(program)
  program = null
  gl = null
})
</script>

<template>
  <div class="silk-layer" :class="{ 'silk-layer--local': !fill }" :style="layerStyle" aria-hidden="true">
    <div ref="hostRef" class="silk-host">
      <canvas ref="canvasRef" class="silk-canvas" />
    </div>
  </div>
</template>

<style scoped>
.silk-layer {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* 透明度由 props 驱动：暗色 --silk-opacity-dark / 浅色 --silk-opacity-light，
     深色丝绸叠在浅粉底上就是浅色丝绒，两个主题共用同一套 shader */
  opacity: var(--silk-opacity-dark, 0.55);
}

.silk-layer--local {
  position: absolute;
}

html.light .silk-layer {
  opacity: var(--silk-opacity-light, 0.36);
}

.silk-host {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  background: #1a1520;
}

.silk-canvas {
  display: block;
  width: 100%;
  height: 100%;
  max-width: 100%;
}
</style>
