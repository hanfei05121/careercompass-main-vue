import type { Job } from './job'

/** 企业（招聘方） */
export interface Company {
  id: string
  name: string
  logo?: string
  industry?: string
  size?: string
  website?: string
  description?: string
  address?: string
  createdAt: string
}

/** 企业发布的职位统计 */
export interface CompanyStats {
  totalJobs: number
  openJobs: number
  totalApplications: number
  weeklyViews: number
}

/** 企业查询参数 */
export interface CompanyQuery {
  keyword?: string
  industry?: string
  page?: number
  pageSize?: number
  [key: string]: unknown
}

export type JobWithCompany = Job & { company?: Company }
