<script setup lang="ts">
/**
 * LightRibbons —— LightSpeed 光速公路特效（复现 cerrda.github.io About 卡片）。
 *
 * 第一人称视角沿湍流扭曲的公路前进：
 * - 左右两条深色路面 + 中间隔离带（原站把车道线 mix 注释掉了，路面纯黑）
 * - 两侧车灯光带（左侧远离 = 橙/紫暖色，右侧靠近 = 绿/蓝冷色），TubeGeometry 实例化
 * - 左侧光柱（sticks）
 * - turbulentDistortion 让整条公路在空间中蜿蜒，相机 lookAt 同步跟随
 * - 雾效 + UnrealBloom + SMAA + OutputPass 后处理
 * - 按住鼠标 / 触摸加速（FOV 90→150 + 速度倍增）
 * - 离屏 / 隐藏 / 减少动效时暂停或只渲一帧
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'

const hostRef = ref<HTMLDivElement | null>(null)
const { reduced } = useReducedMotion()

/* ===================== 配置（对齐原站） ===================== */
const OPTIONS = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5] as [number, number],
  lightStickHeight: [1.3, 1.7] as [number, number],
  movingAwaySpeed: [60, 80] as [number, number],
  movingCloserSpeed: [-120, -160] as [number, number],
  carLightsLength: [12, 80] as [number, number],
  carLightsRadius: [0.05, 0.14] as [number, number],
  carWidthPercentage: [0.3, 0.5] as [number, number],
  carShiftX: [-0.8, 0.8] as [number, number],
  carFloorSeparation: [0, 5] as [number, number],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars: [0xd85a3f, 0x6750a2, 0xc247ac],
    rightCars: [0x03b343, 0x0e5ea5, 0x3245d5],
    sticks: 0x03b343,
  },
  pixelRatio: 1.25,
}

/* ===================== 着色器 ===================== */

// 湍流扭曲（turbulentDistortion）。注意：uTime 由引用方各自声明，避免重复声明
const DISTORTION_GLSL = /* glsl */ `
  uniform vec4 uFreq;
  uniform vec4 uAmp;
  #define PI 3.14159265358979
  float nsin(float val){ return sin(val) * 0.5 + 0.5; }
  float getDistortionX(float progress){
    return (
      cos(PI * progress * uFreq.r + uTime) * uAmp.r +
      pow(cos(PI * progress * uFreq.g + uTime * (uFreq.g / uFreq.r)), 2.) * uAmp.g
    );
  }
  float getDistortionY(float progress){
    return (
      -nsin(PI * progress * uFreq.b + uTime) * uAmp.b +
      -pow(nsin(PI * progress * uFreq.a + uTime / (uFreq.b / uFreq.a)), 5.) * uAmp.a
    );
  }
  vec3 getDistortion(float progress){
    return vec3(
      getDistortionX(progress) - getDistortionX(0.0125),
      getDistortionY(progress) - getDistortionY(0.0125),
      0.
    );
  }
`

// 路面顶点着色器
const ROAD_VERTEX = /* glsl */ `
  uniform float uTravelLength;
  uniform float uTime;
  varying vec2 vUv;
  ${DISTORTION_GLSL}
  void main() {
    vec3 transformed = position.xyz;
    vec3 distortion = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
    transformed.x += distortion.x;
    transformed.z += distortion.y;
    transformed.y += -1. * distortion.z;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
  }
`

// 路面片元（原站把车道线 mix 注释掉了，路面为纯色，视觉主体是车灯光带）
const ROAD_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  void main() {
    vec3 color = vec3(uColor);
    gl_FragColor = vec4(color, 1.);
  }
`

// 车灯顶点着色器
const CAR_LIGHTS_VERTEX = /* glsl */ `
  attribute vec3 aOffset;
  attribute vec3 aMetrics;
  attribute vec3 aColor;
  uniform float uTravelLength;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vColor;
  ${DISTORTION_GLSL}
  void main() {
    vec3 transformed = position.xyz;
    float radius = aMetrics.r;
    float myLength = aMetrics.g;
    float speed = aMetrics.b;
    transformed.xy *= radius;
    transformed.z *= myLength;
    transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
    transformed.xy += aOffset.xy;
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vColor = aColor;
  }
`

// 车灯片元（沿 x 渐隐）
const CAR_LIGHTS_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying vec2 vUv;
  uniform vec2 uFade;
  void main() {
    vec3 color = vec3(vColor);
    float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
    gl_FragColor = vec4(color, alpha);
    if (gl_FragColor.a < 0.0001) discard;
  }
`

// 光柱顶点着色器
const STICKS_VERTEX = /* glsl */ `
  attribute float aOffset;
  attribute vec3 aColor;
  attribute vec2 aMetrics;
  uniform float uTravelLength;
  uniform float uTime;
  varying vec3 vColor;
  mat4 rotationY(float angle) {
    return mat4(
      cos(angle), 0., sin(angle), 0.,
      0., 1., 0., 0.,
      -sin(angle), 0., cos(angle), 0.,
      0., 0., 0., 1.
    );
  }
  ${DISTORTION_GLSL}
  void main(){
    vec3 transformed = position.xyz;
    float width = aMetrics.x;
    float height = aMetrics.y;
    transformed.xy *= vec2(width, height);
    float time = mod(uTime * 60. * 2. + aOffset, uTravelLength);
    transformed = (rotationY(3.14159265 / 2.) * vec4(transformed, 1.)).xyz;
    transformed.z += -uTravelLength + time;
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    transformed.y += height / 2.;
    transformed.x += -width / 2.;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
  }
`

// 光柱片元
const STICKS_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  void main(){
    gl_FragColor = vec4(vec3(vColor), 1.);
  }
`

/* ===================== 工具函数 ===================== */
function randRange(range: [number, number]): number {
  return Math.random() * (range[1] - range[0]) + range[0]
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
function lerp(current: number, target: number, t: number, threshold = 0.001): number {
  let delta = (target - current) * t
  if (Math.abs(delta) < threshold) delta = target - current
  return delta
}

/* ===================== 生命周期 ===================== */
let disposed = false
let rafId = 0
let resizeObserver: ResizeObserver | null = null
let intersectionObserver: IntersectionObserver | null = null
let inViewport = true
let paused = false

async function setup() {
  const hostMaybe = hostRef.value
  if (!hostMaybe) return
  // 显式标注非空类型，保证嵌套闭包（applySize 等）里 TS 收窄不丢失
  const host: HTMLDivElement = hostMaybe

  try {
    const THREE = await import('three')
    // 用 three 自带的后处理（addons），避免新增 npm 依赖导致旧 dev server 缓存失效
    const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js')
    const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js')
    const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js')
    const { SMAAPass } = await import('three/addons/postprocessing/SMAAPass.js')
    const { OutputPass } = await import('three/addons/postprocessing/OutputPass.js')

    if (disposed) return

    const opt = OPTIONS
    const width = host.offsetWidth || 1
    const height = host.offsetHeight || 1

    // ---- 渲染器 ----
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
    })
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(Math.min(opt.pixelRatio, window.devicePixelRatio || 1))
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    host.appendChild(renderer.domElement)

    // ---- 场景 & 相机 ----
    const scene = new THREE.Scene()
    scene.background = null
    const fog = new THREE.Fog(new THREE.Color(opt.colors.background), opt.length * 0.2, opt.length * 500)
    scene.fog = fog

    const camera = new THREE.PerspectiveCamera(opt.fov, width / height, 0.1, 10000)
    camera.position.set(0, 8, -5)

    // ---- 后处理：Bloom（发光）+ SMAA（抗锯齿），对齐原站 ----
    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 1.0, 0.0, 0.2)
    const smaaPass = new SMAAPass(
      width * renderer.getPixelRatio(),
      height * renderer.getPixelRatio(),
    )
    composer.addPass(renderPass)
    composer.addPass(bloomPass)
    composer.addPass(smaaPass)
    // 最后做 sRGB / tone mapping 转换，否则画面发灰发暗
    composer.addPass(new OutputPass())

    // ---- 扭曲 uniforms ----
    const distortionUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) },
      uTime: { value: 0 },
    }

    // ---- 路面 ----
    function createRoadPlane(xDir: number, isRoad: boolean) {
      const planeWidth = isRoad ? opt.roadWidth : opt.islandWidth
      const geo = new THREE.PlaneGeometry(planeWidth, opt.length, 20, 100)
      const uniforms: Record<string, { value: unknown }> = {
        uTravelLength: { value: opt.length },
        uColor: { value: new THREE.Color(isRoad ? opt.colors.roadColor : opt.colors.islandColor) },
        ...distortionUniforms,
      }
      const mat = new THREE.ShaderMaterial({
        vertexShader: ROAD_VERTEX,
        fragmentShader: ROAD_FRAGMENT,
        side: THREE.DoubleSide,
        uniforms,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.z = -opt.length / 2
      mesh.position.x += (opt.islandWidth / 2 + opt.roadWidth / 2) * xDir
      scene.add(mesh)
      return mesh
    }
    createRoadPlane(-1, true)
    createRoadPlane(1, true)
    createRoadPlane(0, false)

    // ---- 车灯 ----
    function createCarLights(
      colors: number[],
      speedRange: [number, number],
      fade: [number, number],
    ) {
      // 原站用 TubeGeometry（沿 z 轴的单位管），着色器里按 aMetrics 缩放
      const curve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1))
      const tubeGeo = new THREE.TubeGeometry(curve, 40, 1, 8, false)
      const geo = new THREE.InstancedBufferGeometry()
      geo.index = tubeGeo.index
      geo.attributes.position = tubeGeo.attributes.position
      geo.attributes.uv = tubeGeo.attributes.uv
      geo.instanceCount = opt.lightPairsPerRoadWay * 2

      const laneWidth = opt.roadWidth / opt.lanesPerRoad
      const offsets: number[] = []
      const metrics: number[] = []
      const colorsArr: number[] = []

      for (let i = 0; i < opt.lightPairsPerRoadWay; i++) {
        const radius = randRange(opt.carLightsRadius)
        const carLen = randRange(opt.carLightsLength)
        const speed = randRange(speedRange)
        const lane = (i % opt.lanesPerRoad) * laneWidth - opt.roadWidth / 2 + laneWidth / 2
        const carWidth = randRange(opt.carWidthPercentage) * laneWidth
        const shift = randRange(opt.carShiftX) * laneWidth
        const x = lane + shift
        const y = randRange(opt.carFloorSeparation) + radius * 1.3
        const z = -randRange([0, opt.length] as [number, number])

        // 两个灯（左右）
        offsets.push(x - carWidth / 2, y, z, x + carWidth / 2, y, z)
        metrics.push(radius, carLen, speed, radius, carLen, speed)
        const c = new THREE.Color(pick(colors))
        colorsArr.push(c.r, c.g, c.b, c.r, c.g, c.b)
      }

      geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3))
      geo.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(metrics), 3))
      geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(colorsArr), 3))

      const mat = new THREE.ShaderMaterial({
        vertexShader: CAR_LIGHTS_VERTEX,
        fragmentShader: CAR_LIGHTS_FRAGMENT,
        transparent: true,
        uniforms: {
          uTravelLength: { value: opt.length },
          uFade: { value: new THREE.Vector2(...fade) },
          ...distortionUniforms,
        },
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.frustumCulled = false
      scene.add(mesh)
      return mesh
    }

    const leftLights = createCarLights(opt.colors.leftCars, opt.movingAwaySpeed, [0, 1 - opt.carLightsFade])
    leftLights.position.setX(-opt.roadWidth / 2 - opt.islandWidth / 2)
    const rightLights = createCarLights(opt.colors.rightCars, opt.movingCloserSpeed, [1, 0 + opt.carLightsFade])
    rightLights.position.setX(opt.roadWidth / 2 + opt.islandWidth / 2)

    // ---- 光柱 ----
    function createSticks() {
      const baseGeo = new THREE.PlaneGeometry(1, 1)
      const geo = new THREE.InstancedBufferGeometry()
      geo.index = baseGeo.index
      geo.attributes.position = baseGeo.attributes.position
      geo.attributes.uv = baseGeo.attributes.uv
      geo.instanceCount = opt.totalSideLightSticks

      const spacing = opt.length / (opt.totalSideLightSticks - 1)
      const offsets: number[] = []
      const colorsArr: number[] = []
      const metricsArr: number[] = []
      const stickColor = new THREE.Color(opt.colors.sticks)

      for (let i = 0; i < opt.totalSideLightSticks; i++) {
        offsets.push((i - 1) * spacing * 2 + spacing * Math.random())
        colorsArr.push(stickColor.r, stickColor.g, stickColor.b)
        metricsArr.push(randRange(opt.lightStickWidth), randRange(opt.lightStickHeight))
      }

      geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 1))
      geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(new Float32Array(colorsArr), 3))
      geo.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(metricsArr), 2))

      const mat = new THREE.ShaderMaterial({
        vertexShader: STICKS_VERTEX,
        fragmentShader: STICKS_FRAGMENT,
        side: THREE.DoubleSide,
        uniforms: {
          uTravelLength: { value: opt.length },
          ...distortionUniforms,
        },
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.frustumCulled = false
      scene.add(mesh)
      return mesh
    }
    const sticks = createSticks()
    sticks.position.setX(-(opt.roadWidth + opt.islandWidth / 2))

    // ---- 交互：按住加速 ----
    let fovTarget = opt.fov
    let speedUpTarget = 0
    let speedUp = 0
    let timeOffset = 0

    function onPointerDown() {
      fovTarget = opt.fovSpeedUp
      speedUpTarget = opt.speedUp
    }
    function onPointerUp() {
      fovTarget = opt.fov
      speedUpTarget = 0
    }
    host.addEventListener('mousedown', onPointerDown)
    host.addEventListener('mouseup', onPointerUp)
    host.addEventListener('mouseleave', onPointerUp)
    host.addEventListener('touchstart', onPointerDown, { passive: true })
    host.addEventListener('touchend', onPointerUp)

    // ---- 动画循环 ----
    const clock = new THREE.Clock()
    const lookAtTarget = new THREE.Vector3()

    // turbulentDistortion 的 JS 版本（用于相机 lookAt）
    function getDistortionJS(progress: number, time: number) {
      const freq = distortionUniforms.uFreq.value
      const amp = distortionUniforms.uAmp.value
      const nsin = (v: number) => Math.sin(v) * 0.5 + 0.5
      const getX = (p: number) =>
        Math.cos(Math.PI * p * freq.x + time) * amp.x +
        Math.cos(Math.PI * p * freq.y + time * (freq.y / freq.x)) ** 2 * amp.y
      const getY = (p: number) =>
        -nsin(Math.PI * p * freq.z + time) * amp.z -
        nsin(Math.PI * p * freq.w + time / (freq.z / freq.w)) ** 5 * amp.w
      return new THREE.Vector3(
        (getX(progress) - getX(progress + 0.007)) * -2,
        (getY(progress) - getY(progress + 0.007)) * -5,
        -10,
      )
    }

    function update(delta: number) {
      const t = Math.exp(-(-60 * Math.log2(0.9)) * delta)
      speedUp += lerp(speedUp, speedUpTarget, t, 0.00001)
      timeOffset += speedUp * delta
      const time = clock.elapsedTime + timeOffset

      // 更新 uniforms（所有材质共享同一个 distortionUniforms.uTime 引用）
      distortionUniforms.uTime.value = time

      // 相机 FOV
      const fovDelta = lerp(camera.fov, fovTarget, t)
      if (fovDelta !== 0) {
        camera.fov += fovDelta * delta * 6
        camera.updateProjectionMatrix()
      }

      // 相机 lookAt 跟随扭曲
      const lookOffset = getDistortionJS(0.025, time)
      lookAtTarget.set(
        camera.position.x + lookOffset.x,
        camera.position.y + lookOffset.y,
        camera.position.z + lookOffset.z,
      )
      camera.lookAt(lookAtTarget)
    }

    function tick() {
      if (disposed || paused) return
      const delta = clock.getDelta()
      update(delta)
      composer.render(delta)
      rafId = requestAnimationFrame(tick)
    }

    // ---- 尺寸自适应 ----
    function applySize() {
      const w = host.offsetWidth
      const h = host.offsetHeight
      if (w < 1 || h < 1) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      composer.setSize(w, h)
    }

    resizeObserver = new ResizeObserver(() => applySize())
    resizeObserver.observe(host)

    intersectionObserver = new IntersectionObserver(
      (entries) => {
        inViewport = entries[0]?.isIntersecting ?? true
        syncPlay()
      },
      { rootMargin: '80px' },
    )
    intersectionObserver.observe(host)

    function syncPlay() {
      if (inViewport && !document.hidden && !reduced.value && !disposed) {
        if (paused) {
          paused = false
          clock.start()
          tick()
        }
      } else {
        paused = true
        clock.stop()
        if (rafId) {
          cancelAnimationFrame(rafId)
          rafId = 0
        }
      }
    }

    // 减少动效：只渲染一帧
    if (reduced.value) {
      update(0.016)
      composer.render(0.016)
      return
    }

    applySize()
    tick()

    // ---- 清理函数挂到外部 ----
    cleanupFn = () => {
      disposed = true
      paused = true
      if (rafId) cancelAnimationFrame(rafId)
      host.removeEventListener('mousedown', onPointerDown)
      host.removeEventListener('mouseup', onPointerUp)
      host.removeEventListener('mouseleave', onPointerUp)
      host.removeEventListener('touchstart', onPointerDown)
      host.removeEventListener('touchend', onPointerUp)
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      composer.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
    }
  } catch (error) {
    console.warn('[LightRibbons] WebGL 初始化失败，降级为静态卡片：', error)
  }
}

let cleanupFn: (() => void) | null = null

onMounted(() => {
  void setup()
})

onBeforeUnmount(() => {
  disposed = true
  cleanupFn?.()
  cleanupFn = null
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
  cursor: pointer;
  /* 兜底：WebGL 不可用时卡片也不能是空白 */
  background: linear-gradient(160deg, rgb(12 8 20 / 0.9), rgb(4 2 8 / 0.95));
}
</style>
