import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** className 合并（clsx + tailwind-merge） */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
