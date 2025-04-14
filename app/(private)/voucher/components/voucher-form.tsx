"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { vi } from "date-fns/locale"

// Interface cho VoucherRequest
interface VoucherRequest {
  code: string;
  discountType: "PERCENTAGE" | "FIXEDAMOUNT";
  discountValue: number;
  validFrom: string;
  validUntil: string;
  status: "ACTIVE" | "INACTIVE";
}

interface VoucherFormProps {
  voucher?: VoucherRequest
  onSubmit: (data: VoucherRequest) => Promise<void>
  onCancel: () => void
}

// Schema để validate form
const voucherSchema = z.object({
  code: z.string()
    .min(3, "Mã voucher phải có ít nhất 3 ký tự")
    .max(20, "Mã voucher không được vượt quá 20 ký tự")
    .refine(value => /^[A-Z0-9_-]+$/.test(value), {
      message: "Mã voucher chỉ được chứa chữ cái in hoa, số và ký tự _ -"
    }),
  discountType: z.enum(["PERCENTAGE", "FIXEDAMOUNT"]),
  discountValue: z.number()
    .positive("Giá trị giảm giá phải lớn hơn 0"),
  validFrom: z.string({
    required_error: "Ngày bắt đầu hiệu lực là bắt buộc"
  }),
  validUntil: z.string({
    required_error: "Ngày kết thúc hiệu lực là bắt buộc"
  }),
  status: z.enum(["ACTIVE", "INACTIVE"])
}).superRefine((data, ctx) => {
  // Kiểm tra giá trị discount dựa trên loại discount
  if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Giảm giá theo phần trăm không được vượt quá 100%",
      path: ["discountValue"]
    });
  }
  if (data.discountType === "FIXEDAMOUNT" && data.discountValue < 1000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Giảm giá cố định phải từ 1,000đ trở lên",
      path: ["discountValue"]
    });
  }
  if (data.discountType === "FIXEDAMOUNT" && data.discountValue > 10000000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Giảm giá cố định không được vượt quá 10,000,000đ",
      path: ["discountValue"]
    });
  }
  
  // Kiểm tra ngày hết hạn phải sau ngày bắt đầu
  const from = new Date(data.validFrom);
  const until = new Date(data.validUntil);
  
  if (isNaN(from.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày bắt đầu không hợp lệ",
      path: ["validFrom"]
    });
  }
  
  if (isNaN(until.getTime())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày kết thúc không hợp lệ",
      path: ["validUntil"]
    });
  }
  
  if (!isNaN(from.getTime()) && !isNaN(until.getTime()) && until < from) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày hết hạn phải sau ngày bắt đầu",
      path: ["validUntil"]
    });
  }
});

export function VoucherForm({ voucher, onSubmit, onCancel }: VoucherFormProps) {
  // State cho form
  const [code, setCode] = useState(voucher?.code || "")
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXEDAMOUNT">(voucher?.discountType || "PERCENTAGE")
  const [discountValue, setDiscountValue] = useState(voucher?.discountValue?.toString() || "")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: voucher?.validFrom ? new Date(voucher.validFrom) : new Date(),
    to: voucher?.validUntil ? new Date(voucher.validUntil) : addDays(new Date(), 30),
  })
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(voucher?.status || "ACTIVE")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format tiền Việt Nam
  const formatCurrency = (value: string) => {
    const numberValue = parseFloat(value.replace(/[,.]/g, ""));
    if (isNaN(numberValue)) return "";
    return new Intl.NumberFormat('vi-VN').format(numberValue);
  }

  // Xử lý nhập số tiền
  const handleCurrencyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[,.]/g, "");
    if (/^\d*$/.test(value)) {
      setDiscountValue(value);
    }
  }

  // Xóa một trường lỗi
  const clearError = (field: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Validate form
  const validateForm = () => {
    try {
      if (!dateRange?.from || !dateRange?.to) {
        setErrors({ dateRange: "Vui lòng chọn khoảng thời gian hiệu lực" });
        return null;
      }

      const formData = {
        code,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        validFrom: dateRange.from.toISOString(),
        validUntil: dateRange.to.toISOString(),
        status
      };

      // Kiểm tra giá trị discountValue trước
      // Validate số tiền cố định phải >= 1000
      if (discountType === "FIXEDAMOUNT" && parseInt(discountValue) < 1000) {
        setErrors({ discountValue: "Giảm giá cố định phải từ 1,000đ trở lên" });
        return null;
      }
      
      // Validate số tiền cố định không vượt quá 10 triệu
      if (discountType === "FIXEDAMOUNT" && parseInt(discountValue) > 10000000) {
        setErrors({ discountValue: "Giảm giá cố định không được vượt quá 10,000,000đ" });
        return null;
      }

      // Kiểm tra phần trăm không vượt quá 100%
      if (discountType === "PERCENTAGE" && parseInt(discountValue) > 100) {
        setErrors({ discountValue: "Giảm giá theo phần trăm không được vượt quá 100%" });
        return null;
      }

      // Validate ngày tháng hợp lệ
      try {
        voucherSchema.parse(formData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const newErrors: Record<string, string> = {};
          error.errors.forEach(err => {
            if (err.path.length > 0) {
              newErrors[err.path[0].toString()] = err.message;
            }
          });
          setErrors(newErrors);
          return null;
        }
        throw error;
      }

      setErrors({});
      return formData;
    } catch (error) {
      console.error("Lỗi xác thực form:", error);
      toast.error("Có lỗi xảy ra khi xác thực form");
      return null;
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validatedData = validateForm();
    if (!validatedData) {
      toast.error("Vui lòng kiểm tra lại thông tin voucher");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(validatedData);
      // Form sẽ được đóng tự động bởi component cha (VoucherDashboard)
      // Không cần gọi onCancel() ở đây để tránh conflict
    } catch (error) {
      console.error("Lỗi khi lưu voucher:", error);
      toast.error("Không thể lưu voucher. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">
            Mã Voucher
          </Label>
          <Input
            id="code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              clearError('code');
            }}
            placeholder="SUMMER25"
            className={errors.code ? "border-red-500" : ""}
            maxLength={20}
          />
          {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
          <p className="text-xs text-muted-foreground">
            Đây là mã khách hàng sẽ sử dụng để áp dụng giảm giá.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discountType">
              Loại Giảm Giá
            </Label>
            <Select
              value={discountType}
              onValueChange={(value: "PERCENTAGE" | "FIXEDAMOUNT") => {
                setDiscountType(value);
                setDiscountValue(""); // Reset giá trị khi đổi loại
                clearError('discountType');
                clearError('discountValue');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại giảm giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Phần trăm (%)</SelectItem>
                <SelectItem value="FIXEDAMOUNT">Số tiền cố định (VNĐ)</SelectItem>
              </SelectContent>
            </Select>
            {errors.discountType && <p className="text-sm text-red-500">{errors.discountType}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountValue">
              Giá Trị Giảm Giá
            </Label>
            <div className="relative">
              <Input
                id="discountValue"
                value={discountType === "FIXEDAMOUNT" ? formatCurrency(discountValue) : discountValue}
                onChange={(e) => {
                  if (discountType === "FIXEDAMOUNT") {
                    const value = e.target.value.replace(/[,.]/g, "");
                    // Giới hạn giá trị tối đa là 10 triệu
                    if (/^\d*$/.test(value) && (parseInt(value || "0") <= 10000000 || value === "")) {
                      setDiscountValue(value);
                    }
                  } else {
                    // Chỉ cho phép nhập số từ 0-100 cho phần trăm
                    const value = e.target.value;
                    if (/^\d*$/.test(value) && (parseInt(value) <= 100 || value === "")) {
                      setDiscountValue(value);
                    }
                  }
                  clearError('discountValue');
                }}
                placeholder={discountType === "PERCENTAGE" ? "10" : "10000"}
                className={errors.discountValue ? "border-red-500 pr-10" : "pr-10"}
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                {discountType === "FIXEDAMOUNT" ? "VNĐ" : "%"}
              </div>
            </div>
            {errors.discountValue && <p className="text-sm text-red-500">{errors.discountValue}</p>}
            {discountType === "FIXEDAMOUNT" && (
              <p className="text-xs text-muted-foreground">
                Giá trị từ 1,000đ đến 10,000,000đ
              </p>
            )}
            {discountType === "PERCENTAGE" && (
              <p className="text-xs text-muted-foreground">
                Giá trị từ 1% đến 100%
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Thời Gian Hiệu Lực
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-range"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground",
                  errors.dateRange || errors.validFrom || errors.validUntil ? "border-red-500" : ""
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                  )
                ) : (
                  <span>Chọn thời gian hiệu lực</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  clearError('dateRange');
                  clearError('validFrom');
                  clearError('validUntil');
                }}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>
          {(errors.dateRange || errors.validFrom || errors.validUntil) && (
            <p className="text-sm text-red-500">
              {errors.dateRange || errors.validFrom || errors.validUntil}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            Trạng Thái
          </Label>
          <Select
            value={status}
            onValueChange={(value: "ACTIVE" | "INACTIVE") => {
              setStatus(value);
              clearError('status');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Đang hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang xử lý..." : voucher ? "Cập nhật" : "Tạo Voucher"}
        </Button>
      </div>
    </form>
  )
} 