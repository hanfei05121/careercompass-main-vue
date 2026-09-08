<script setup lang="ts">
/**
 * BaseTable —— 列表页骨架：工具栏 + 表格 + 分页
 * columns 描述列定义；单元格可通过与 prop 同名的插槽自定义渲染
 */
import { ref, watch } from 'vue'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/constants'
import type { PageParams } from '@/api/types'

export interface TableColumn {
  /** 字段名（插槽名与 prop 相同时优先使用插槽） */
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
}

interface ListResult {
  list: Record<string, unknown>[]
  total: number
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    request: (params: PageParams) => Promise<ListResult>
    immediate?: boolean
    rowKey?: string
  }>(),
  { immediate: true, rowKey: 'id' }
)

const loading = ref(false)
const list = ref<Record<string, unknown>[]>([])
const total = ref(0)
const pageParams = ref<PageParams>({ page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE })

const fetchData = async () => {
  loading.value = true
  try {
    const result = await props.request(pageParams.value)
    list.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  pageParams.value.page = page
  fetchData()
}

const handleSizeChange = (size: number) => {
  pageParams.value = { page: DEFAULT_PAGE, pageSize: size }
  fetchData()
}

watch(() => props.request, () => handlePageChange(DEFAULT_PAGE))

if (props.immediate) fetchData()

defineExpose({ refresh: fetchData, list })
</script>

<template>
  <div class="rounded-2xl border border-border/60 bg-card p-4 md:p-6">
    <!-- 工具栏：左侧标题/筛选，右侧操作 -->
    <div v-if="$slots.toolbar || $slots['toolbar-actions']" class="table-toolbar">
      <div class="flex items-center gap-2">
        <slot name="toolbar" />
      </div>
      <div class="flex items-center gap-2">
        <slot name="toolbar-actions" />
      </div>
    </div>

    <el-table :data="list" v-loading="loading" :row-key="rowKey" stripe>
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align"
        :fixed="col.fixed"
      >
        <template #default="scope">
          <slot :name="col.prop" :row="scope.row" :index="scope.$index">
            {{ scope.row?.[col.prop] ?? '-' }}
          </slot>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="table-pagination">
      <el-pagination
        :current-page="Number(pageParams.page)"
        :page-size="Number(pageParams.pageSize)"
        :total="total"
        :page-sizes="PAGE_SIZE_OPTIONS"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>
