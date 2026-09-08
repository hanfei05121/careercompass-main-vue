import type { PageParams, PageResult } from './index'

/** 申请状态 */
export type ApplicationStatus =
  | 'submitted'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'rejected'

/** 职位申请 */
export interface Application {
  id: string
  jobId: string
  jobTitle: string
  companyName: string
  uid: string
  status: ApplicationStatus
  resumeUrl?: string
  coverLetter?: string
  createdAt: string
  updatedAt?: string
}

export interface ApplicationQuery extends PageParams {
  status?: ApplicationStatus
  uid?: string
}

export type ApplicationListResult = PageResult<Application>
