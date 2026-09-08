/** 雇主数据分析模块类型 */

/** 数据指标卡片 */
export interface AnalyticsMetric {
  key: string
  label: string
  value: number
  /** 环比变化，正数为增长 */
  delta?: number
}

/** 图表数据点 */
export interface AnalyticsDataPoint {
  label: string
  value: number
}
