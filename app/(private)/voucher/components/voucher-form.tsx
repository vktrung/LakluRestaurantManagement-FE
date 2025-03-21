"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Voucher, VoucherRequest } from "@/features/voucher/type"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  code: z
    .string()
    .min(3, {
      message: "Mã voucher phải có ít nhất 3 ký tự.",
    })
    .max(20, {
      message: "Mã voucher không được vượt quá 20 ký tự.",
    }),
  discountType: z.enum(["PERCENTAGE", "FIXEDAMOUNT"]),
  discountValue: z.coerce.number().positive({
    message: "Giá trị giảm giá phải là số dương.",
  }),
  validFrom: z.date(),
  validUntil: z.date(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

interface VoucherFormProps {
  voucher?: Voucher
  onSubmit: (data: VoucherRequest) => Promise<void>
  onCancel?: () => void
}

export function VoucherForm({ voucher, onSubmit, onCancel }: VoucherFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: voucher?.code ?? "",
      discountType: voucher?.discountType ?? "PERCENTAGE",
      discountValue: voucher?.discountValue ?? 10,
      validFrom: voucher?.validFrom ? new Date(voucher.validFrom) : new Date(),
      validUntil: voucher?.validUntil 
        ? new Date(voucher.validUntil) 
        : new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: voucher?.status ?? "ACTIVE",
    },
  })

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true)
      await onSubmit({
        ...values,
        validFrom: values.validFrom.toISOString(),
        validUntil: values.validUntil.toISOString(),
      })
      form.reset()
    } catch (error) {
      console.error('Form submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when voucher changes
  useEffect(() => {
    if (voucher) {
      form.reset({
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        validFrom: new Date(voucher.validFrom),
        validUntil: new Date(voucher.validUntil),
        status: voucher.status,
      })
    }
  }, [voucher, form])

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.reset()
    onCancel?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã Voucher</FormLabel>
              <FormControl>
                <Input placeholder="SUMMER25" {...field} />
              </FormControl>
              <FormDescription>Đây là mã khách hàng sẽ sử dụng để áp dụng giảm giá.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại Giảm Giá</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại giảm giá" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                    <SelectItem value="FIXEDAMOUNT">Số tiền cố định (đ)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá Trị Giảm Giá</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="validFrom"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Có Hiệu Lực Từ</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="validUntil"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Có Hiệu Lực Đến</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trạng Thái</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : voucher ? "Cập Nhật" : "Tạo Voucher"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
} 