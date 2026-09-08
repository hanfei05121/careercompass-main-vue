/** 企业（求职者视角）模块类型 */

/** 企业列表项 */
export interface CompanyItem {
  id: string
  name: string
  logo?: string
  industry?: string
  /** 在招职位数 */
  openJobs?: number
  location?: string
}

/** 企业详情页查询参数 */
export interface CompanyDetailParams {
  id: string
}
