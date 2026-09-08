/** 字典类型统一收口，业务里禁止散落魔法值 */

/** 用户角色 */
export const USER_ROLE_OPTIONS = [
  { label: '求职者', value: 'employee' },
  { label: '招聘方', value: 'employer' },
  { label: '管理员', value: 'admin' },
] as const

/** 会员计划 */
export const PLAN_OPTIONS = [
  { label: '免费版', value: 'free' },
  { label: '专业版', value: 'pro' },
  { label: '企业版', value: 'enterprise' },
] as const

/** 申请状态 */
export const APPLICATION_STATUS_OPTIONS = [
  { label: '已投递', value: 'submitted' },
  { label: '简历通过', value: 'screening' },
  { label: '面试中', value: 'interviewing' },
  { label: '已录用', value: 'offer' },
  { label: '已拒绝', value: 'rejected' },
] as const

/** 职位类型 */
export const JOB_TYPE_OPTIONS = [
  { label: '全职', value: 'full-time' },
  { label: '兼职', value: 'part-time' },
  { label: '实习', value: 'internship' },
  { label: '远程', value: 'remote' },
] as const

/** 根据 value 取字典 label */
export const labelByValue = (
  options: ReadonlyArray<{ label: string; value: string }>,
  value?: string | null
): string => options.find((item) => item.value === value)?.label ?? value ?? '-'
