import { httpPost } from '../request'
import type { AiRequest, AiResult, ApiResponse } from '../types'

/** AI 工具调用（简历优化 / 模拟面试 / 岗位匹配） */
export const apiAiInvoke = (params: AiRequest) => httpPost<ApiResponse<AiResult>>('/ai/invoke', params)

/** AI 结果反馈 */
export const apiAiFeedback = (id: string, useful: boolean) =>
  httpPost<ApiResponse<null>>(`/ai/${id}/feedback`, { useful })
