<script setup lang="ts">
import { BlurReveal, SectionHeader } from '@/components/portfolio'

const milestones = [
  {
    year: '2026',
    title: '应收账款管理系统',
    desc: '基于公司脚手架（Vue 3 + Element Plus + 权限服务）交付应收中后台：收款条款登记、里程碑树形表格、客户回款跟踪，以及 OnlyOffice + pdf.js 的合同双栏比对与差异高亮。',
  },
  {
    year: '2026',
    title: 'tpdtalk 社区论坛（H5 + PC）',
    desc: '企业内部社区双端开发。H5 端用 Vant + rem 适配完成发帖、话题、圈子等模块，直播间用 WebSocket 打通弹幕、红包雨与抽奖；PC 端同步开发论坛与后台管理。沉淀 useLoadMore、useDraggableFab 等通用 hooks。',
  },
  {
    year: '2026',
    title: '外包资源管理平台',
    desc: '供应商、专家、简历、结算一体的外包管理系统。基于 Ant Design Vue 搭建 MultiTab 多页签布局，接入 OAuth2 单点登录，自研滑动 / 旋转 / 点选 / 拼接四类行为验证码，并把全站字典做成数据驱动的 Dict 组件族。',
  },
]
</script>

<template>
  <section id="trajectory" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <SectionHeader eyebrow="轨迹" title="今年的项目轨迹">
        <template #desc>从应收管理中后台，到社区论坛双端，再到外包资源管理平台——三套系统，一套可复用的前端范式。</template>
      </SectionHeader>

      <ol class="timeline">
        <BlurReveal
          v-for="(m, i) in milestones"
          :key="m.title"
          :delay="Math.min(i * 0.08, 0.2)"
          :amount="0.15"
          class="ti-wrap"
        >
          <li class="ti">
            <div class="ti-marker">
              <span class="ti-dot" />
              <span class="ti-year font-display">{{ m.year }}</span>
            </div>
            <div class="ti-body">
              <h3 class="ti-title font-display">{{ m.title }}</h3>
              <p class="ti-desc">{{ m.desc }}</p>
            </div>
          </li>
        </BlurReveal>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.timeline {
  margin-top: 2.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: linear-gradient(to bottom, transparent, hsl(var(--border)), transparent);
}

.ti-wrap {
  list-style: none;
}

.ti {
  position: relative;
  display: flex;
  gap: 1.5rem;
  padding-left: 0.5rem;
}

.ti-marker {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 3.5rem;
}

.ti-dot {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background: hsl(var(--primary));
  box-shadow: 0 0 14px 2px hsl(var(--primary) / 0.55);
}

.ti-year {
  margin-top: 0.6rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: color-mix(in oklch, hsl(var(--primary)) 70%, transparent);
}

.ti-body {
  flex: 1;
  padding-bottom: 1rem;
}

.ti-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.ti-desc {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  line-height: 1.75;
  color: hsl(var(--muted-foreground));
}
</style>
