import { httpGet } from '../request'
import type { ApiResponse, Company, CompanyQuery, CompanyStats, JobWithCompany, PageResult } from '../types'

/** 企业列表 */
export const apiCompanyList = (query?: CompanyQuery) =>
  httpGet<ApiResponse<PageResult<Company>>>('/companies', query)

/** 企业详情 */
export const apiCompanyDetail = (id: string) => httpGet<ApiResponse<Company>>(`/companies/${id}`)

/** 企业详情（含在招职位） */
export const apiCompanyJobs = (id: string) =>
  httpGet<ApiResponse<PageResult<JobWithCompany>>>(`/companies/${id}/jobs`)

/** 企业数据看板 */
export const apiCompanyStats = (id: string) => httpGet<ApiResponse<CompanyStats>>(`/companies/${id}/stats`)
