<script setup lang="ts">
import { BlurReveal, CssLiquidGlass, SectionHeader } from '@/components/portfolio'
import InteractiveHoverButton from '@/components/ui/interactive-hover-button.vue'

const packages = [
  {
    name: 'vite-plugin-fetch-dts',
    role: '作者',
    version: 'v0.7.0',
    desc: 'Vite 构建期自动拉取远程 Vue / Web Components 类型声明，让微前端与 CDN 组件在本地拥有完整 TypeScript 检查、跳转与补全。',
    points: ['扫描远程 import，并行拉取类型并生成全局组件声明', '热更新、source map、多正则匹配与 Web Components 事件类型转换', '面向微前端 / CDN 场景，补齐本地类型检查与编辑器体验'],
    href: 'https://npmx.dev/package/vite-plugin-fetch-dts',
  },
  {
    name: 'openapi-v3-request-generator',
    role: '贡献者',
    version: 'v4.0.2',
    desc: '基于 OpenAPI v3 生成可高度定制的请求层代码，覆盖多项目文档与大型 API 面，降低手写请求层的维护成本。',
    points: ['ts/js 双模式、多项目文档、include/exclude 与 mock 生成', 'onGenRequestFnHook 定制请求函数形态与调用约定', 'sourceMap 与 CLI 定位，降低大型 API 面的变更成本'],
    href: 'https://npmx.dev/package/openapi-v3-request-generator',
  },
  {
    name: 'dsh-Karot-theme',
    role: '作者',
    version: 'v0.2.0',
    desc: 'DeepSeek Harness Web GUI 的部署级主题插件：液态玻璃界面与 Silk WebGL 背景，安装后重启即可在生产环境生效。',
    points: ['部署级 bundle，装上重启即生效，无需 GUI 审批', '液态玻璃输入栏与 Silk WebGL2 丝绸背景', '稳定 DOM 锚点覆盖；减少透明 / 减少动效时自动降级'],
    href: 'https://npmx.dev/package/dsh-Karot-theme',
  },
]

/** 参考站点的 bento 布局：首张卡跨 7 列 2 行，其余各占 5 列 */
function cardClass(index: number) {
  return index === 0 ? 'lg:col-span-7 lg:row-span-2' : 'lg:col-span-5'
}

/** 首卡内容更多，给更宽松的内边距 */
function bodyClass(index: number) {
  return index === 0 ? 'p-6 md:p-8 lg:p-9' : 'p-6 md:p-7'
}
</script>

<template>
  <section id="open-source" class="section-pad scroll-anchor">
    <div class="mx-auto max-w-6xl">
      <SectionHeader eyebrow="Open Source" title="开源工具链">
        <template #desc>自研 Vite 插件与部署级主题，并参与维护面向大型 API 面的 OpenAPI 请求生成器。</template>
      </SectionHeader>

      <div class="grid">
        <BlurReveal
          v-for="(p, i) in packages"
          :key="p.name"
          :class="cardClass(i)"
          :delay="Math.min(i * 0.08, 0.2)"
          :amount="0.2"
        >
          <CssLiquidGlass class="h-full rounded-[1.75rem]" container-class="h-full rounded-[1.75rem]">
            <div class="pkg-body" :class="bodyClass(i)">
              <div class="pkg-meta-row">
                <span class="pkg-role">{{ p.role }}</span>
                <span class="pkg-version">{{ p.version }}</span>
              </div>

              <h3 class="pkg-name" :class="i === 0 ? 'text-2xl md:text-3xl' : 'text-2xl'">
                <a :href="p.href" target="_blank" rel="noopener noreferrer" class="pkg-name-link">
                  {{ p.name }}
                </a>
              </h3>

              <p class="pkg-desc">{{ p.desc }}</p>

              <ul class="pkg-points">
                <li v-for="point in p.points" :key="point">
                  <span class="dot" aria-hidden="true" />
                  <span>{{ point }}</span>
                </li>
              </ul>

              <div class="pkg-cta-row" :class="i === 0 ? 'pt-8' : 'pt-6'">
                <a :href="p.href" target="_blank" rel="noopener noreferrer" class="pkg-cta-link">
                  <InteractiveHoverButton text="查看包详情" />
                </a>
              </div>
            </div>
          </CssLiquidGlass>
        </BlurReveal>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid {
  margin-top: 2.5rem;
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 64rem) {
  .grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }
}

.pkg-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 1.5rem;
}

.pkg-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.pkg-role {
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: color-mix(in oklch, hsl(var(--primary)) 15%, transparent);
  color: hsl(var(--primary));
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.pkg-version {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

.pkg-name {
  margin-top: 1rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  word-break: break-all;
}

.pkg-name-link {
  color: hsl(var(--foreground));
  text-decoration: underline;
  text-decoration-color: color-mix(in oklch, hsl(var(--primary)) 35%, transparent);
  text-underline-offset: 4px;
  transition:
    color 0.3s ease,
    text-decoration-color 0.3s ease;
}

.pkg-name-link:hover {
  color: hsl(var(--primary));
  text-decoration-color: hsl(var(--primary));
}

.pkg-desc {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.625;
  color: hsl(var(--muted-foreground));
}

.pkg-points {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
}

.pkg-points li {
  display: flex;
  gap: 0.5rem;
}

.dot {
  margin-top: 0.5rem;
  width: 0.375rem;
  height: 0.375rem;
  flex-shrink: 0;
  border-radius: 9999px;
  background: hsl(var(--primary));
}

.pkg-cta-row {
  margin-top: auto;
}

.pkg-cta-link {
  display: inline-flex;
  border-radius: 9999px;
}
</style>
