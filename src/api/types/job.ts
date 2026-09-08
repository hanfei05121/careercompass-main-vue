/** 职位 */
export interface Job {
  id: string
  title: string
  companyName: string
  companyId: string
  location: string
  /** 薪资下限（K） */
  salaryMin?: number
  /** 薪资上限（K） */
  salaryMax?: number
  type: 'full-time' | 'part-time' | 'internship' | 'remote'
  experience?: string
  education?: string
  description?: string
  tags?: string[]
  status: 'open' | 'closed' | 'draft'
  createdAt: string
  updatedAt?: string
}

/** 职位查询参数 */
export interface JobQuery {
  keyword?: string
  location?: string
  type?: Job['type']
  page?: number
  pageSize?: number
  [key: string]: unknown
}

/** 职位创建/更新参数 */
export type JobSaveParams = Partial<Omit<Job, 'id' | 'createdAt' | 'updatedAt'>> & { id?: string }
