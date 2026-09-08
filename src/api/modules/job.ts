import { httpDelete, httpGet, httpPost, httpPut } from '../request'
import type { ApiResponse, Job, JobQuery, JobSaveParams, PageResult } from '../types'
import { mockJobDetail, mockJobList } from '../mock/job.mock'
import { appEnv } from '@/config'

/** 职位列表 */
export const apiJobList = (query?: JobQuery) =>
  appEnv.useMock ? mockJobList(query) : httpGet<ApiResponse<PageResult<Job>>>('/jobs', query)

/** 职位详情 */
export const apiJobDetail = (id: string) =>
  appEnv.useMock ? mockJobDetail(id) : httpGet<ApiResponse<Job>>(`/jobs/${id}`)

/** 创建职位（企业端） */
export const apiJobCreate = (params: JobSaveParams) => httpPost<ApiResponse<Job>>('/jobs', params)

/** 更新职位（企业端） */
export const apiJobUpdate = (id: string, params: JobSaveParams) =>
  httpPut<ApiResponse<Job>>(`/jobs/${id}`, params)

/** 下架职位（企业端） */
export const apiJobClose = (id: string) => httpDelete<ApiResponse<null>>(`/jobs/${id}`)
