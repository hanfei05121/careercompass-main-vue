/** 求职洞察模块类型 */

/** 洞察图表数据点 */
export interface InsightDataPoint {
  label: string
  value: number
}

/** 洞察图表配置 */
export interface InsightChart {
  key: string
  title: string
  data: InsightDataPoint[]
}
