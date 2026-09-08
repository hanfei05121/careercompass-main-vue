import { httpGet, httpPost } from '../request'
import type { ApiResponse, Application, ApplicationListResult, ApplicationQuery, ApplicationStatus } from '../types'

/** 我的申请列表 */
export const apiApplicationList = (query?: ApplicationQuery) =>
  httpGet<ApiResponse<ApplicationListResult>>('/applications', query)

/** 投递简历 */
export const apiApply = (jobId: string, coverLetter?: string) =>
  httpPost<ApiResponse<Application>>('/applications', { jobId, coverLetter })

/** 更新申请状态（企业端） */
export const apiUpdateApplicationStatus = (id: string, status: ApplicationStatus) =>
  httpPost<ApiResponse<Application>>(`/applications/${id}/status`, { status })
