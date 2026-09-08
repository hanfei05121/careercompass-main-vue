/** 深拷贝（JSON 可序列化对象够用的场景） */
export const deepClone = <T>(value: T): T => {
  if (value === null || typeof value !== 'object') return value
  return JSON.parse(JSON.stringify(value)) as T
}

/** 防抖 */
export const debounce = <T extends (...args: never[]) => void>(fn: T, delay = 300) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** 节流 */
export const throttle = <T extends (...args: never[]) => void>(fn: T, interval = 300) => {
  let last = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn(...args)
    }
  }
}

/** 随机字符串（默认 8 位） */
export const randomId = (length = 8): string =>
  Math.random()
    .toString(36)
    .slice(2, 2 + length)

/** 睡眠（配合 async/await 使用） */
export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** 树形结构扁平化 */
export interface TreeNode {
  children?: TreeNode[]
  [key: string]: unknown
}

export const flattenTree = <T extends TreeNode>(tree: T[]): Omit<T, 'children'>[] => {
  const result: Omit<T, 'children'>[] = []
  const walk = (nodes: T[]) => {
    nodes.forEach((node) => {
      const { children, ...rest } = node
      result.push(rest as Omit<T, 'children'>)
      if (children?.length) walk(children as T[])
    })
  }
  walk(tree)
  return result
}

/** 根据路径安全取值 */
export const get = (obj: unknown, path: string, defaultValue?: unknown): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (acc, key) => (acc != null && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
      obj
    ) ?? defaultValue
