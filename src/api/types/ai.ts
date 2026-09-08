/** AI 工具类型 */
export type AiToolType = 'resume-review' | 'interview-coach' | 'job-match' | 'career-plan'

/** AI 请求 */
export interface AiRequest {
  tool: AiToolType
  input: string
  /** 上下文（如简历内容、JD） */
  context?: string
}

/** AI 响应 */
export interface AiResult {
  id: string
  tool: AiToolType
  content: string
  suggestions?: string[]
  createdAt: string
}
