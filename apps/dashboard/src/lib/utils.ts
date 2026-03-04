import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function resolveStorageUrl(url: string) {
  if (url.startsWith("/storage/")) {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${url}`
  }
  return url
}

