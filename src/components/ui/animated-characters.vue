<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import EyeBall from './eye-ball.vue'
import Pupil from './pupil.vue'

interface Props {
  /** 用户正在输入（原版：邮箱输入框聚焦时） */
  isTyping?: boolean
  /** 密码是否明文可见 */
  showPassword?: boolean
  /** 当前已输入的密码长度 */
  passwordLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  isTyping: false,
  showPassword: false,
  passwordLength: 0,
})

/* ------------------------------------------------------------------ *
 * 鼠标位置（用于身体倾斜 + 眼球跟随）
 * ------------------------------------------------------------------ */
const mouseX = ref(0)
const mouseY = ref(0)

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

/* ------------------------------------------------------------------ *
 * 角色状态
 * ------------------------------------------------------------------ */
const isPurpleBlinking = ref(false)
const isBlackBlinking = ref(false)
const isLookingAtEachOther = ref(false)
const isPurplePeeking = ref(false)

const purpleRef = ref<HTMLDivElement | null>(null)
const blackRef = ref<HTMLDivElement | null>(null)
const yellowRef = ref<HTMLDivElement | null>(null)
const orangeRef = ref<HTMLDivElement | null>(null)

/* ------------------------------------------------------------------ *
 * 派生状态
 * ------------------------------------------------------------------ */
/** 正在输入密码且密码是隐藏的（圆点）——紫色长条会"站起来探头" */
const isHidingPassword = computed(() => props.passwordLength > 0 && !props.showPassword)
/** 正在输入密码且密码明文可见——四个角色集体把视线移向左上角 */
const isPasswordVisible = computed(() => props.passwordLength > 0 && props.showPassword)

const calculatePosition = (el: HTMLDivElement | null) => {
  if (!el) return { faceX: 0, faceY: 0, bodySkew: 0 }

  const rect = el.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 3

  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY

  const faceX = Math.max(-15, Math.min(15, deltaX / 20))
  const faceY = Math.max(-10, Math.min(10, deltaY / 30))
  const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120))

  return { faceX, faceY, bodySkew }
}

const purplePos = computed(() => calculatePosition(purpleRef.value))
const blackPos = computed(() => calculatePosition(blackRef.value))
const yellowPos = computed(() => calculatePosition(yellowRef.value))
const orangePos = computed(() => calculatePosition(orangeRef.value))

/* ------------------------------------------------------------------ *
 * 定时器句柄（统一清理，避免切换 Tab / 卸载后残留）
 * ------------------------------------------------------------------ */
let purpleBlinkTimer: number | undefined
let blackBlinkTimer: number | undefined
let lookTimer: number | undefined
let peekTimer: number | undefined
let peekResetTimer: number | undefined

const clearTimer = (id: number | undefined) => {
  if (id !== undefined) window.clearTimeout(id)
}

/* ------------------------------------------------------------------ *
 * 眨眼：紫色 / 黑色角色各自独立，随机间隔 3~7 秒，闭眼 150ms
 * ------------------------------------------------------------------ */
const schedulePurpleBlink = () => {
  clearTimer(purpleBlinkTimer)
  purpleBlinkTimer = window.setTimeout(() => {
    isPurpleBlinking.value = true
    purpleBlinkTimer = window.setTimeout(() => {
      isPurpleBlinking.value = false
      schedulePurpleBlink()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

const scheduleBlackBlink = () => {
  clearTimer(blackBlinkTimer)
  blackBlinkTimer = window.setTimeout(() => {
    isBlackBlinking.value = true
    blackBlinkTimer = window.setTimeout(() => {
      isBlackBlinking.value = false
      scheduleBlackBlink()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

/* ------------------------------------------------------------------ *
 * 对视：开始输入时，紫黑两只角色互相看一眼（持续 800ms）
 * ------------------------------------------------------------------ */
watch(
  () => props.isTyping,
  (typing) => {
    clearTimer(lookTimer)
    if (typing) {
      isLookingAtEachOther.value = true
      lookTimer = window.setTimeout(() => {
        isLookingAtEachOther.value = false
      }, 800)
    } else {
      isLookingAtEachOther.value = false
    }
  },
  { immediate: true },
)

/* ------------------------------------------------------------------ *
 * 偷瞄：密码明文可见时，紫色角色每隔 2~5 秒偷偷瞄一眼输入框（持续 800ms）
 * ------------------------------------------------------------------ */
const stopPeeking = () => {
  clearTimer(peekTimer)
  clearTimer(peekResetTimer)
  isPurplePeeking.value = false
}

const schedulePeek = () => {
  clearTimer(peekTimer)
  peekTimer = window.setTimeout(() => {
    isPurplePeeking.value = true
    clearTimer(peekResetTimer)
    peekResetTimer = window.setTimeout(() => {
      isPurplePeeking.value = false
      schedulePeek()
    }, 800)
  }, Math.random() * 3000 + 2000)
}

watch(
  [() => props.passwordLength, () => props.showPassword],
  () => {
    stopPeeking()
    if (props.passwordLength > 0 && props.showPassword) {
      schedulePeek()
    }
  },
  { immediate: true },
)

/* ------------------------------------------------------------------ *
 * 生命周期
 * ------------------------------------------------------------------ */
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  schedulePurpleBlink()
  scheduleBlackBlink()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  clearTimer(purpleBlinkTimer)
  clearTimer(blackBlinkTimer)
  clearTimer(lookTimer)
  clearTimer(peekTimer)
  clearTimer(peekResetTimer)
})

/* ------------------------------------------------------------------ *
 * 眼睛的强制注视方向
 * ------------------------------------------------------------------ */
const purpleForceLookX = computed(() => {
  if (isPasswordVisible.value) return isPurplePeeking.value ? 4 : -4
  if (isLookingAtEachOther.value) return 3
  return undefined
})
const purpleForceLookY = computed(() => {
  if (isPasswordVisible.value) return isPurplePeeking.value ? 5 : -4
  if (isLookingAtEachOther.value) return 4
  return undefined
})

const blackForceLookX = computed(() => {
  if (isPasswordVisible.value) return -4
  if (isLookingAtEachOther.value) return 0
  return undefined
})
const blackForceLookY = computed(() => {
  if (isPasswordVisible.value) return -4
  if (isLookingAtEachOther.value) return -4
  return undefined
})
</script>

<template>
  <div class="relative" style="width: 550px; height: 400px">
    <!-- 紫色高个子长方形 - 最底层 -->
    <div
      ref="purpleRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      :style="{
        left: '70px',
        width: '180px',
        height: isTyping || isHidingPassword ? '440px' : '400px',
        backgroundColor: '#6C3FF5',
        borderRadius: '10px 10px 0 0',
        zIndex: 1,
        transform: isPasswordVisible
          ? 'skewX(0deg)'
          : isTyping || isHidingPassword
            ? `skewX(${purplePos.bodySkew - 12}deg) translateX(40px)`
            : `skewX(${purplePos.bodySkew}deg)`,
        transformOrigin: 'bottom center',
      }"
    >
      <div
        class="absolute flex gap-8 transition-all duration-700 ease-in-out"
        :style="{
          left: isPasswordVisible ? '20px' : isLookingAtEachOther ? '55px' : `${45 + purplePos.faceX}px`,
          top: isPasswordVisible ? '35px' : isLookingAtEachOther ? '65px' : `${40 + purplePos.faceY}px`,
        }"
      >
        <EyeBall
          :size="18"
          :pupil-size="7"
          :max-distance="5"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isPurpleBlinking"
          :force-look-x="purpleForceLookX"
          :force-look-y="purpleForceLookY"
        />
        <EyeBall
          :size="18"
          :pupil-size="7"
          :max-distance="5"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isPurpleBlinking"
          :force-look-x="purpleForceLookX"
          :force-look-y="purpleForceLookY"
        />
      </div>
    </div>

    <!-- 黑色高个子长方形 - 中间层 -->
    <div
      ref="blackRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      :style="{
        left: '240px',
        width: '120px',
        height: '310px',
        backgroundColor: '#2D2D2D',
        borderRadius: '8px 8px 0 0',
        zIndex: 2,
        transform: isPasswordVisible
          ? 'skewX(0deg)'
          : isLookingAtEachOther
            ? `skewX(${blackPos.bodySkew * 1.5 + 10}deg) translateX(20px)`
            : isTyping || isHidingPassword
              ? `skewX(${blackPos.bodySkew * 1.5}deg)`
              : `skewX(${blackPos.bodySkew}deg)`,
        transformOrigin: 'bottom center',
      }"
    >
      <div
        class="absolute flex gap-6 transition-all duration-700 ease-in-out"
        :style="{
          left: isPasswordVisible ? '10px' : isLookingAtEachOther ? '32px' : `${26 + blackPos.faceX}px`,
          top: isPasswordVisible ? '28px' : isLookingAtEachOther ? '12px' : `${32 + blackPos.faceY}px`,
        }"
      >
        <EyeBall
          :size="16"
          :pupil-size="6"
          :max-distance="4"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isBlackBlinking"
          :force-look-x="blackForceLookX"
          :force-look-y="blackForceLookY"
        />
        <EyeBall
          :size="16"
          :pupil-size="6"
          :max-distance="4"
          eye-color="white"
          pupil-color="#2D2D2D"
          :is-blinking="isBlackBlinking"
          :force-look-x="blackForceLookX"
          :force-look-y="blackForceLookY"
        />
      </div>
    </div>

    <!-- 橙色半圆 - 左前 -->
    <div
      ref="orangeRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      :style="{
        left: '0px',
        width: '240px',
        height: '200px',
        zIndex: 3,
        backgroundColor: '#FF9B6B',
        borderRadius: '120px 120px 0 0',
        transform: isPasswordVisible ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew}deg)`,
        transformOrigin: 'bottom center',
      }"
    >
      <div
        class="absolute flex gap-8 transition-all duration-200 ease-out"
        :style="{
          left: isPasswordVisible ? '50px' : `${82 + orangePos.faceX}px`,
          top: isPasswordVisible ? '85px' : `${90 + orangePos.faceY}px`,
        }"
      >
        <Pupil
          :size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="isPasswordVisible ? -5 : undefined"
          :force-look-y="isPasswordVisible ? -4 : undefined"
        />
        <Pupil
          :size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="isPasswordVisible ? -5 : undefined"
          :force-look-y="isPasswordVisible ? -4 : undefined"
        />
      </div>
    </div>

    <!-- 黄色圆顶长方形 - 右前 -->
    <div
      ref="yellowRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      :style="{
        left: '310px',
        width: '140px',
        height: '230px',
        backgroundColor: '#E8D754',
        borderRadius: '70px 70px 0 0',
        zIndex: 4,
        transform: isPasswordVisible ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew}deg)`,
        transformOrigin: 'bottom center',
      }"
    >
      <div
        class="absolute flex gap-6 transition-all duration-200 ease-out"
        :style="{
          left: isPasswordVisible ? '20px' : `${52 + yellowPos.faceX}px`,
          top: isPasswordVisible ? '35px' : `${40 + yellowPos.faceY}px`,
        }"
      >
        <Pupil
          :size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="isPasswordVisible ? -5 : undefined"
          :force-look-y="isPasswordVisible ? -4 : undefined"
        />
        <Pupil
          :size="12"
          :max-distance="5"
          pupil-color="#2D2D2D"
          :force-look-x="isPasswordVisible ? -5 : undefined"
          :force-look-y="isPasswordVisible ? -4 : undefined"
        />
      </div>
      <!-- 嘴巴（一条横线） -->
      <div
        class="absolute w-20 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
        :style="{
          left: isPasswordVisible ? '10px' : `${40 + yellowPos.faceX}px`,
          top: isPasswordVisible ? '88px' : `${88 + yellowPos.faceY}px`,
        }"
      />
    </div>
  </div>
</template>
