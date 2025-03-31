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
interface FormatPriceOptions {
    currency?: boolean
    separator?: string
    minLength?: number
  }
export function formatPrice(price: number | null | undefined, options: FormatPriceOptions = {}): string {
  if (price === null || price === undefined) {
    return "—"
  }

  const { currency = true, separator = ".", minLength = 15 } = options

  const formatted = new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(price)

  const paddedNumber = formatted.padStart(minLength, ' ')

  return currency ? `${paddedNumber}VND` : paddedNumber
}
