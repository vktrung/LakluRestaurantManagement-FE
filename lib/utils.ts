import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString)
    return format(date, "dd/MM/yyyy", { locale: vi })
  } catch (error) {
    console.error("Error formatting date:", error)
    return dateString
  }
}
