/** AI 工具模块类型 */
import type { AiToolType } from '@/api/types'

/** 工具卡片 */
export interface AiToolItem {
  /** 与后端 AiToolType 对应 */
  type: AiToolType
  title: string
  description: string
  icon?: string
}

/** 工具列表 */
export const AI_TOOL_LIST: AiToolItem[] = [
  {
    type: 'resume-review',
    title: '简历诊断',
    description: '上传简历，获取结构、关键词与匹配度优化建议。',
  },
  {
    type: 'interview-coach',
    title: '模拟面试',
    description: '按岗位生成面试问题并给出回答点评。',
  },
  {
    type: 'job-match',
    title: '岗位匹配',
    description: '根据技能与经历推荐匹配度最高的职位。',
  },
  {
    type: 'career-plan',
    title: '职业规划',
    description: '结合目标岗位生成分阶段成长路径。',
  },
]
