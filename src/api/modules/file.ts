import { httpUpload } from '../request'
import type { ApiResponse } from '../types'
import { appEnv } from '@/config'

/** 上传结果 */
export interface UploadResult {
  url: string
  filename: string
  size: number
}

/** 上传文件（简历 / 头像等） */
export const apiUpload = (file: File, filename?: string) =>
  httpUpload<ApiResponse<UploadResult>>(appEnv.uploadUrl, file, filename)
