<script setup lang="ts">
/**
 * LightRibbons —— 卡片媒体层特效：水平俯视的「蜿蜒赛道 + 你追我赶的光粒」。
 *
 * 版式要求（对齐参考站点录屏）：
 * - 镜头是**俯视**的：机位在赛道正上方，始终水平地俯视整条赛道，
 *   只随弯道做很轻微的左右扭头（yaw）与极小的横向漂移，不做贴地飞行。
 * - 整条赛道**完整入画**：赛道两端都在卡片里，近端不会被卡片边缘整齐切掉。
 * - 粒子**稀疏**：几十颗，不是一片稠密的线；速度差异明显，快的能追上并超过慢的。
 *
 * 实现（three.js，单次 draw call）：
 * - 静态几何两类：3 条护栏线 + N 颗粒子（每颗是一小段带拖尾的管）。
 *   位置、速度、拖尾、配色、亮度全在顶点着色器里按时间解析求值 ——
 *   赛道在水平面内蜿蜒，形状带时间项，于是弯道会缓慢地从远到近「流」过去。
 * - 粒子沿赛道前进：sHead 随 t 递减，拖尾铺在 sHead 之后（更远处），
 *   片元沿拖尾做指数衰减 —— 就是录屏里那种「光点 + 残影」的高速线条。
 * - 快慢靠每颗粒子独立的 sp（0.5~1.9 倍速）：同一条道上跑，快的自然追上前面的慢车。
 * - 粗细细用世界坐标半径；两端亮度归零，粒子循环时看不出接缝。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'

const hostRef = ref<HTMLDivElement | null>(null)
const { reduced } = useReducedMotion()

/** 赛道全长（世界单位） */
const TRACK_LEN = 11.0
/** 赛道中心线的横向振幅 */
const BEND_A = 3.60
const BEND_B = 1.05
/** 赛道半宽：护栏铺在 ±RAIL_HALF，粒子跑在护栏以内 */
const RAIL_HALF = 1.75
/** 护栏线条数（左 / 中 / 右） */
const RAIL_COUNT = 3
/** 护栏采样段数 */
const RAIL_SEG = 96
/** 粒子数量（稀疏，看得清谁在超谁） */
const PARTICLE_COUNT = 68
/** 每颗粒子沿拖尾的采样段数 */
const TRAIL_SEG = 6
/** 管的截面边数 */
const RING = 4
/** 粒子基础速度（倍速区间 0.5~1.9） */
const BASE_SPEED = 0.085

const VERTEX_SHADER = /* glsl */ `
  attribute float aKind;    // 0 = 护栏，1 = 粒子
  attribute float aId;      // 护栏序号 / 粒子序号
  attribute float aAlong;   // 0..1：护栏沿全长 / 粒子沿拖尾
  attribute float aRing;

  uniform float uTime;
  uniform float uSpeed;

  varying vec3  vColor;
  varying vec3  vNormal;
  varying vec3  vView;
  varying float vBright;

  // 赛道中心线：水平面内蜿蜒，带时间项 → 弯道缓慢流过
  vec3 trackCenter(float s, float t) {
    float x = ${BEND_A.toFixed(2)} * sin(s * 0.46 + t * 0.30)
            + ${BEND_B.toFixed(2)} * sin(s * 0.21 - t * 0.19);
    return vec3(x, 0.07 * sin(s * 0.35 + t * 0.40), -s);
  }

  vec3 trackRight(float s, float t) {
    float e = 0.05;
    vec3 tangent = normalize(trackCenter(s + e, t) - trackCenter(s - e, t));
    return normalize(cross(tangent, vec3(0.0, 1.0, 0.0)));
  }

  void main() {
    float t = uTime;
    float isParticle = step(0.5, aKind);

    // ---- 护栏：铺满整条赛道 ----
    float railU = (aId - 1.0) * ${RAIL_HALF.toFixed(2)};
    float railS = aAlong * ${TRACK_LEN.toFixed(2)};

    // ---- 粒子：沿赛道前进，速度分档 → 你追我赶 ----
    float seed = fract(aId * 0.6180339887);
    float sp = 0.45 + 1.70 * fract(seed * 5.19);            // 0.45 ~ 2.15 倍速
    float trailLen = 0.70 + 2.20 * sp;                       // 拖尾长度随速度变长
    float headS = ${TRACK_LEN.toFixed(2)}
                * fract(fract(seed * 9.31) + t * sp * ${BASE_SPEED.toFixed(3)} * uSpeed);
    float partS = headS - aAlong * trailLen;                 // 拖尾落在身后（靠近镜头一侧）
    float partU = (fract(seed * 3.77) * 2.0 - 1.0) * (${RAIL_HALF.toFixed(2)} - 0.12);

    float s = mix(railS, partS, isParticle);
    float u = mix(railU, partU, isParticle);
    float along = isParticle * aAlong;

    vec3 center = trackCenter(s, t);
    vec3 right = trackRight(s, t);

    // 世界坐标半径：粒子略粗、护栏细
    float radius = mix(0.022, 0.055 + 0.030 * fract(seed * 4.71), isParticle);
    vec3 nrm = vec3(cos(aRing), sin(aRing), 0.0);
    vec3 pos = center + right * (u + nrm.x * radius) + vec3(0.0, nrm.y * radius, 0.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * (right * nrm.x + vec3(0.0, nrm.y, 0.0)));
    vView = -mv.xyz;

    // ---- 配色：青 + 粉紫 ----
    float pick = fract(seed * 6.31);
    vec3 partColor = pick < 0.46
      ? vec3(0.38, 0.95, 1.00)
      : (pick < 0.80 ? vec3(1.00, 0.38, 0.88) : vec3(0.66, 0.48, 1.00));
    vec3 railColor = vec3(0.72, 0.62, 1.00);
    vColor = mix(railColor, partColor, isParticle);

    // ---- 亮度 ----
    // 护栏：整条淡淡的灯带，两端略收
    float railFade = smoothstep(0.0, 0.06, aAlong) * (1.0 - smoothstep(0.90, 1.0, aAlong));
    float railBright = 0.30 * railFade;
    // 粒子：头部亮、拖尾指数衰减；赛道两端淡出，循环处看不出接缝
    float head = exp(-along * 3.1);
    float endFade = smoothstep(0.0, 0.9, s) * (1.0 - smoothstep(${(TRACK_LEN * 0.86).toFixed(2)}, ${TRACK_LEN.toFixed(2)}, s));
    float partBright = head * endFade * (0.60 + 0.40 * fract(seed * 3.31));

    vBright = mix(railBright, partBright, isParticle);

    gl_Position = projectionMatrix * mv;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform float uOpacity;

  varying vec3  vColor;
  varying vec3  vNormal;
  varying vec3  vView;
  varying float vBright;

  void main() {
    float f = abs(dot(normalize(vNormal), normalize(vView)));
    // 管芯亮、边缘柔，加色混合后就是发光灯带 / 光点
    float radial = pow(f, 2.0) * 0.88 + pow(1.0 - f, 2.0) * 0.14;
    float alpha = radial * vBright * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`

let renderer: import('three').WebGLRenderer | null = null
let scene: import('three').Scene | null = null
let camera: import('three').PerspectiveCamera | null = null
let material: import('three').ShaderMaterial | null = null
let geometry: import('three').BufferGeometry | null = null

let elapsed = 0
let lastTime = 0
let running = false
let inViewport = true
let width = 0
let height = 0
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null

/** 静态几何：3 条护栏 + N 颗粒子（每颗 TRAIL_SEG 段拖尾），合成一个 mesh */
function buildGeometry(t: typeof import('three')) {
  const railVerts = RAIL_COUNT * RAIL_SEG * RING
  const partVerts = PARTICLE_COUNT * TRAIL_SEG * RING
  const vertCount = railVerts + partVerts

  const positions = new Float32Array(vertCount * 3)
  const kindAttr = new Float32Array(vertCount)
  const idAttr = new Float32Array(vertCount)
  const alongAttr = new Float32Array(vertCount)
  const ringAttr = new Float32Array(vertCount)

  const railTris = RAIL_COUNT * (RAIL_SEG - 1) * RING * 6
  const partTris = PARTICLE_COUNT * (TRAIL_SEG - 1) * RING * 6
  const indices = new Uint32Array(railTris + partTris)

  let v = 0
  let i = 0

  const emitSection = (
    kind: number,
    id: number,
    along: number,
  ) => {
    for (let r = 0; r < RING; r += 1) {
      kindAttr[v] = kind
      idAttr[v] = id
      alongAttr[v] = along
      ringAttr[v] = (r / RING) * Math.PI * 2
      v += 1
    }
  }
  const emitQuads = (segs: number, base: number) => {
    for (let k = 0; k < segs - 1; k += 1) {
      for (let r = 0; r < RING; r += 1) {
        const r2 = (r + 1) % RING
        const a = base + k * RING + r
        const b = base + k * RING + r2
        const c = base + (k + 1) * RING + r
        const d = base + (k + 1) * RING + r2
        indices[i] = a
        indices[i + 1] = c
        indices[i + 2] = b
        indices[i + 3] = b
        indices[i + 4] = c
        indices[i + 5] = d
        i += 6
      }
    }
  }

  // 护栏
  for (let l = 0; l < RAIL_COUNT; l += 1) {
    const base = v
    for (let k = 0; k < RAIL_SEG; k += 1) emitSection(0, l, k / (RAIL_SEG - 1))
    emitQuads(RAIL_SEG, base)
  }

  // 粒子
  for (let p = 0; p < PARTICLE_COUNT; p += 1) {
    const base = v
    for (let k = 0; k < TRAIL_SEG; k += 1) emitSection(1, p, k / (TRAIL_SEG - 1))
    emitQuads(TRAIL_SEG, base)
  }

  const geo = new t.BufferGeometry()
  geo.setAttribute('position', new t.BufferAttribute(positions, 3))
  geo.setAttribute('aKind', new t.BufferAttribute(kindAttr, 1))
  geo.setAttribute('aId', new t.BufferAttribute(idAttr, 1))
  geo.setAttribute('aAlong', new t.BufferAttribute(alongAttr, 1))
  geo.setAttribute('aRing', new t.BufferAttribute(ringAttr, 1))
  geo.setIndex(new t.BufferAttribute(indices, 1))
  geo.boundingSphere = new t.Sphere(new t.Vector3(0, 0, -TRACK_LEN / 2), TRACK_LEN * 2)
  return geo
}

function applySize() {
  const host = hostRef.value
  if (!host || !renderer || !camera) return

  const rect = host.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) return

  width = rect.width
  height = rect.height

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height, false)

  // 改尺寸必须同步 aspect，否则画面被拉伸
  camera.aspect = width / height
  camera.updateProjectionMatrix()

  if (!running) render(elapsed || 4)
}

function render(time: number) {
  if (!renderer || !scene || !camera || !material) return

  // 俯视机位：始终在赛道正上方水平俯视整条赛道；
  // 只做「跟随弯道的轻微扭头 + 极小横移 + 缓慢推拉」，不贴地、不翻滚
  const yaw = 0.085 * Math.sin(time * 0.21)
  const height = 13.4 + 0.55 * Math.sin(time * 0.13)
  const lookZ = -TRACK_LEN * 0.5

  camera.position.set(Math.sin(time * 0.17) * 0.35, height, lookZ + 1.6)
  camera.lookAt(Math.sin(time * 0.21) * 0.55, 0, lookZ)
  camera.rotation.y += yaw

  material.uniforms.uSpeed.value = 1 + 0.28 * Math.sin(time * 0.16)
  material.uniforms.uTime.value = time
  renderer.render(scene, camera)
}

function loop(timestamp: number) {
  if (!running) return
  const now = timestamp * 0.001
  const delta = lastTime === 0 ? 0.016 : Math.min(now - lastTime, 0.05)
  lastTime = now
  elapsed += delta
  render(elapsed)
}

function play() {
  if (running || reduced.value || !renderer) return
  running = true
  lastTime = 0
  renderer.setAnimationLoop(loop)
}

function pause() {
  running = false
  renderer?.setAnimationLoop(null)
}

function sync() {
  if (inViewport && !document.hidden && !reduced.value) play()
  else pause()
}

async function setup() {
  const host = hostRef.value
  if (!host) return

  try {
    // 动态加载：three 单独成 chunk，不拖首屏
    const mod = await import('three')

    renderer = new mod.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    renderer.setClearAlpha(0)
    renderer.domElement.classList.add('light-ribbons__canvas')
    host.appendChild(renderer.domElement)

    scene = new mod.Scene()
    camera = new mod.PerspectiveCamera(52, 1, 0.1, 80)
    camera.position.set(0, 13.4, -TRACK_LEN * 0.5 + 1.6)
    camera.lookAt(0, 0, -TRACK_LEN * 0.5)

    geometry = buildGeometry(mod)
    material = new mod.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 1 },
        uOpacity: { value: 0.95 },
      },
      transparent: true,
      blending: mod.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    })

    const mesh = new mod.Mesh(geometry, material)
    mesh.frustumCulled = false
    scene.add(mesh)

    applySize()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => applySize())
      resizeObserver.observe(host)
    }
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          inViewport = entries[0]?.isIntersecting ?? true
          sync()
        },
        { rootMargin: '80px' },
      )
      intersectionObserver.observe(host)
    }

    // 减少动效：只渲染一帧静态画面
    if (reduced.value) {
      elapsed = 4
      render(elapsed)
      return
    }
    sync()
  } catch (error) {
    // WebGL 不可用等：静默降级，卡片靠玻璃层与底色照样显示
    console.warn('[LightRibbons] WebGL 初始化失败，降级为静态卡片：', error)
  }
}

onMounted(() => {
  void setup()
})

onBeforeUnmount(() => {
  pause()
  resizeObserver?.disconnect()
  resizeObserver = null
  intersectionObserver?.disconnect()
  intersectionObserver = null

  geometry?.dispose()
  geometry = null
  material?.dispose()
  material = null
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
  scene = null
  camera = null
})
</script>

<template>
  <div ref="hostRef" class="light-ribbons" aria-hidden="true" />
</template>

<style scoped>
.light-ribbons {
  position: absolute;
  inset: 0;
  overflow: hidden;
  /* 兜底：WebGL 不可用时卡片也不能是空白 */
  background:
    radial-gradient(120% 90% at 50% 40%, rgb(74 28 86 / 0.30), transparent 66%),
    linear-gradient(160deg, rgb(20 12 28 / 0.5), rgb(8 6 14 / 0.66));
}

.light-ribbons :deep(.light-ribbons__canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
