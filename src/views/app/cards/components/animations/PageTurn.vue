<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import DeckCardFace from '../DeckCardFace.vue'
import { usePointerDrag } from '../../composables/usePointerDrag'
import { DECK_CARDS, type DeckCard } from '../../types'

/**
 * 13. 双页翻书（真书页弧度翻起）
 * 以右侧书页为主：把右半页切成 5 条竖条，绕书脊链式连续转动，
 * 各条转角逐级递增形成圆弧弯曲，模拟真实纸张翻起的弧度。
 * 角度全程由 rAF 驱动（不用 CSS transition），弯曲量、纸面明暗、
 * 底层换页都跟随真实角度实时更新：翻过 90°（书页侧立）时底层无缝切换。
 */
const props = withDefaults(defineProps<{ cards?: DeckCard[] }>(), { cards: () => DECK_CARDS })

/** 右半页竖条数 / 每条宽度 / 相邻竖条最大夹角 */
const STRIPS = 5
const SHEET_W = 100
const STRIP_W = SHEET_W / STRIPS
/** 竖条间少量重叠，避免弯曲时出现发丝缝 */
const OVERLAP = 0.6
const BEND_MAX = 13
const FLIP_MS = 650

const total = computed(() => props.cards.length)
const index = ref(0)
/** 1 下一张，-1 上一张（都以右侧书页向前翻的方式呈现） */
const dir = ref<1 | -1>(1)
/** 翻页角度（deg）：0 平放，-180 翻完（书页向观察者方向掀起） */
const angle = ref(0)
const busy = ref(false)

const current = computed(() => props.cards[index.value])
const revealed = computed(
  () => props.cards[(index.value + dir.value + total.value) % total.value],
)
/** 翻过 90°（书脊侧竖条正好侧立不可见）后，底层整页切换为下一页 */
const baseCard = computed(() => (Math.abs(angle.value) >= 90 ? revealed.value : current.value))

let raf = 0

const stopRaf = () => {
  if (raf) cancelAnimationFrame(raf)
  raf = 0
}
onBeforeUnmount(stopRaf)

/** 缓入缓出插值 */
const ease = (t: number) => t * t * (3 - 2 * t)

/** rAF 驱动翻页：角度逐帧变化，弯曲 / 明暗 / 底层切换全部同步 */
const animateTo = (target: number) => {
  stopRaf()
  const from = angle.value
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / FLIP_MS)
    angle.value = from + (target - from) * ease(t)
    if (t < 1) {
      raf = requestAnimationFrame(tick)
      return
    }
    raf = 0
    if (target === -180) {
      // 翻完：换索引并静默复位（此时两侧内容一致，复位无痕）
      index.value = (index.value + dir.value + total.value) % total.value
      angle.value = 0
    }
    busy.value = false
  }
  raf = requestAnimationFrame(tick)
}

const flip = (d: 1 | -1) => {
  if (busy.value) return
  busy.value = true
  dir.value = d
  animateTo(-180)
}

interface StripInfo {
  i: number
  style: Record<string, string>
  faceStyle: Record<string, string>
  frontLeft: string
  backLeft: string
}

/**
 * 竖条链：第 i 条累计转角 a - i·bend（自由端领先、书脊端滞后），
 * 位置为前面各条旋转后端点的累加，天然连成一条圆弧。
 */
const strips = computed<StripInfo[]>(() => {
  const a = angle.value
  const p = Math.min(1, Math.abs(a) / 180)
  // 弯曲量起止为 0，翻到一半（90°）最大
  const bend = BEND_MAX * Math.sin(Math.PI * p)
  const list: StripInfo[] = []
  let sx = 0
  let sz = 0
  for (let i = 0; i < STRIPS; i++) {
    if (i > 0) {
      const prev = ((a - (i - 1) * bend) * Math.PI) / 180
      sx += STRIP_W * Math.cos(prev)
      sz += -STRIP_W * Math.sin(prev)
    }
    const theta = a - i * bend
    // 纸面受光：正对观察者亮，侧立时偏暗
    const bright = 0.72 + 0.28 * Math.abs(Math.cos((theta * Math.PI) / 180))
    list.push({
      i,
      style: {
        width: `${STRIP_W + OVERLAP}px`,
        transform: `translate3d(${sx}px, 0, ${sz}px) rotateY(${theta}deg)`,
      },
      faceStyle: { filter: `brightness(${bright.toFixed(3)})` },
      // 正面：当前卡右半的第 i 段；背面：下一卡左半的镜像段
      frontLeft: `${-(SHEET_W + i * STRIP_W)}px`,
      backLeft: `${(i + 1) * STRIP_W - SHEET_W}px`,
    })
  }
  return list
})

const { onPointerDown } = usePointerDrag({
  axis: 'x',
  onMove: ({ dx }) => {
    if (busy.value) return
    dir.value = dx < 0 ? 1 : -1
    angle.value = -Math.min(Math.abs(dx) / 240, 1) * 180
  },
  onRelease: ({ dx, velocityX }) => {
    if (busy.value) return
    // 轻点无拖动：直接翻下一张
    if (Math.abs(dx) < 4) {
      flip(1)
      return
    }
    const passed = Math.abs(angle.value) > 55 || Math.abs(velocityX) > 0.5
    busy.value = true
    animateTo(passed ? -180 : 0)
  },
})

defineExpose({
  next: () => flip(1),
  prev: () => flip(-1),
})
</script>

<template>
  <div
    class="relative h-full w-full touch-none select-none"
    style="perspective: 1500px"
    @pointerdown="onPointerDown"
  >
    <div class="spread">
      <!-- 底层整页：翻过 90°（书页侧立）时无缝切换为下一页 -->
      <div class="base-card">
        <DeckCardFace :key="baseCard.id" :card="baseCard" :index="baseCard.id" :total="total" />
      </div>

      <!-- 右侧书页：5 条竖条链式弯曲，像真纸一样拱起再落下 -->
      <div class="sheet">
        <div v-for="s in strips" :key="s.i" class="strip" :style="s.style">
          <div class="strip-face" :style="s.faceStyle">
            <div class="fullcard" :style="{ left: s.frontLeft }">
              <DeckCardFace :card="current" :index="current.id" :total="total" />
            </div>
          </div>
          <div class="strip-face strip-face--back" :style="s.faceStyle">
            <div class="fullcard" :style="{ left: s.backLeft }">
              <DeckCardFace :card="revealed" :index="revealed.id" :total="total" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <p
      class="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground"
    >
      拖动掀起右页：纸张带弧度翻过去，轻点也可翻页
    </p>
  </div>
</template>

<style scoped>
.spread {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 200px;
  height: 270px;
  margin: -135px 0 0 -100px;
  transform-style: preserve-3d;
}

.base-card {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  overflow: hidden;
}

/* 右半页容器：略微抬离底层，避免翻平瞬间 z-fighting */
.sheet {
  position: absolute;
  left: 100px;
  top: 0;
  width: 100px;
  height: 270px;
  transform-style: preserve-3d;
  transform: translateZ(1px);
}

.strip {
  position: absolute;
  left: 0;
  top: 0;
  height: 270px;
  transform-origin: left center;
  transform-style: preserve-3d;
}

.strip-face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
}

.strip-face--back {
  transform: rotateY(180deg);
}

.fullcard {
  position: absolute;
  top: 0;
  width: 200px;
  height: 270px;
}
</style>