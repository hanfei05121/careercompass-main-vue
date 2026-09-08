import type { Job, JobQuery } from '@/api/types'
import { ok, paginate, withMock } from '../mock'

const mockJobs: Job[] = Array.from({ length: 23 }, (_, i) => ({
  id: `job-${String(i + 1).padStart(3, '0')}`,
  title: ['前端开发工程师', '后端开发工程师', '产品经理', '数据分析师', 'UI 设计师'][i % 5],
  companyName: ['星辰科技', '云帆网络', '远见智能', '未来出行'][i % 4],
  companyId: `company-${(i % 4) + 1}`,
  location: ['北京', '上海', '深圳', '杭州'][i % 4],
  salaryMin: 10 + (i % 5) * 5,
  salaryMax: 20 + (i % 5) * 8,
  type: (['full-time', 'part-time', 'internship', 'remote'] as const)[i % 4],
  experience: `${(i % 3) + 1}-${(i % 3) + 3} 年`,
  education: ['本科', '硕士', '不限'][i % 3],
  tags: ['Vue', 'TypeScript', 'Node.js', 'AI'].slice(0, (i % 3) + 1),
  status: 'open',
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export const mockJobList = (query?: JobQuery) =>
  withMock(async () => {
    let list = [...mockJobs]
    if (query?.keyword) {
      const kw = query.keyword.toLowerCase()
      list = list.filter(
        (job) => job.title.toLowerCase().includes(kw) || job.companyName.toLowerCase().includes(kw)
      )
    }
    if (query?.type) list = list.filter((job) => job.type === query.type)
    if (query?.location) list = list.filter((job) => job.location === query.location)
    return ok(paginate(list, query))
  })

export const mockJobDetail = (id: string) =>
  withMock(async () => ok(mockJobs.find((job) => job.id === id) ?? mockJobs[0]))
