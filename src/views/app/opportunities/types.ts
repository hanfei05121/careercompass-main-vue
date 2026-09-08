/** 职位机会模块类型 */

/** 职位机会 */
export interface Opportunity {
  id: string
  title: string
  employerName: string
  location: string
  /** 工作类型：Internship / Volunteer / Full-time / Part-time / Contract */
  type: string
  skills?: string[] | string
  status?: string
  createdAt?: string
  [key: string]: unknown
}

/** 列表筛选条件 */
export interface OpportunityFilters {
  keyword: string
  location: string
  type: string
}

/** 可选的工作类型 */
export const OPPORTUNITY_TYPES = [
  { label: 'Internship', value: 'Internship' },
  { label: 'Volunteer', value: 'Volunteer' },
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Contract', value: 'Contract' },
] as const

/** Firebase 未配置时的演示数据，保证页面可正常浏览 */
export const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'demo-1',
    title: 'Software Engineer Intern',
    employerName: 'TechNova Labs',
    location: 'Remote',
    type: 'Internship',
    skills: ['JavaScript', 'TypeScript', 'Vue'],
    status: 'Active',
  },
  {
    id: 'demo-2',
    title: 'UX Design Volunteer',
    employerName: 'Bright Future NGO',
    location: 'New York',
    type: 'Volunteer',
    skills: ['Figma', 'Prototyping'],
    status: 'Active',
  },
  {
    id: 'demo-3',
    title: 'Data Analyst',
    employerName: 'FinData Solutions',
    location: 'Remote',
    type: 'Full-time',
    skills: ['SQL', 'Python', 'Tableau'],
    status: 'Active',
  },
  {
    id: 'demo-4',
    title: 'Community Outreach Coordinator',
    employerName: 'CityServe',
    location: 'Chicago',
    type: 'Part-time',
    skills: ['Communication', 'Event Planning'],
    status: 'Active',
  },
  {
    id: 'demo-5',
    title: 'Frontend Developer (Contract)',
    employerName: 'PixelForge',
    location: 'Remote',
    type: 'Contract',
    skills: ['React', 'CSS', 'Node.js'],
    status: 'Active',
  },
  {
    id: 'demo-6',
    title: 'Marketing Associate',
    employerName: 'GreenLeaf Media',
    location: 'Austin',
    type: 'Full-time',
    skills: ['SEO', 'Content', 'Analytics'],
    status: 'Active',
  },
]
