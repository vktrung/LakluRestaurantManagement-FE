"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useChangePasswordMutation } from "@/features/profile/profileApiSlice"
import { toast } from "sonner"
import { Loader2, KeyRound, XCircle } from "lucide-react"
import * as z from "zod"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Schema validation
const pinSchema = z.object({
  currentPassword: z.string().length(4, "Mã PIN phải có đúng 4 số").regex(/^\d{4}$/, "Mã PIN chỉ được chứa số"),
  newPassword: z.string().length(4, "Mã PIN mới phải có đúng 4 số").regex(/^\d{4}$/, "Mã PIN chỉ được chứa số"),
  confirmPassword: z.string().length(4, "Vui lòng xác nhận mã PIN mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mã PIN xác nhận không khớp",
  path: ["confirmPassword"],
});

export default function ChangePasswordForm() {
  const [changePassword, { isLoading }] = useChangePasswordMutation()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    
    // Clear API error when user types
    if (apiError) {
      setApiError(null)
    }
    
    // Chỉ cho phép nhập số và tối đa 4 ký tự
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setFormData({
        ...formData,
        [id]: value
      })
      
      // Clear error when user types
      if (errors[id]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[id]
          return newErrors
        })
      }
    }
  }

  const validateForm = () => {
    try {
      pinSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const resetForm = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setErrors({})
    setApiError(null)
  }

  const handleDialogChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap()
      
      toast.success("Đổi mã PIN thành công")
      resetForm()
      setOpen(false)
    } catch (error: any) {
      console.error('Change PIN error:', error)
      const errorMessage = error?.data?.error || error?.data?.message || 'Có lỗi xảy ra khi đổi mã PIN'
      
      // Xử lý lỗi cụ thể khi mật khẩu không chính xác
      if (errorMessage.includes("Mật khẩu hiện tại không chính xác") || 
          errorMessage.includes("không đúng")) {
        setApiError("Mã PIN hiện tại không chính xác")
      } else {
        setApiError(errorMessage)
      }
      
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <KeyRound className="mr-2 h-4 w-4" />
          Đổi mã PIN
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đổi mã PIN</DialogTitle>
          <DialogDescription>Thay đổi mã PIN đăng nhập của bạn (4 số)</DialogDescription>
        </DialogHeader>
        
        {apiError && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">
                Mã PIN hiện tại
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="currentPassword"
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={errors.currentPassword || apiError ? "border-red-500 text-center text-lg tracking-widest" : "text-center text-lg tracking-widest"}
                placeholder="• • • •"
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-500">{errors.currentPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">
                Mã PIN mới
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="newPassword"
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={errors.newPassword ? "border-red-500 text-center text-lg tracking-widest" : "text-center text-lg tracking-widest"}
                placeholder="• • • •"
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Xác nhận mã PIN mới
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                inputMode="numeric"
                maxLength={4}
                pattern="\d{4}"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? "border-red-500 text-center text-lg tracking-widest" : "text-center text-lg tracking-widest"}
                placeholder="• • • •"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đổi mã PIN"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 