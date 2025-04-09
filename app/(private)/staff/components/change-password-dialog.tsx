"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, KeyRound, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { z } from "zod"
import { DialogFooter } from "@/components/ui/dialog"
import { useAdminChangePasswordMutation } from "@/features/staff/staffApiSlice"

// Schema validation
const pinSchema = z.object({
  newPassword: z.string().length(4, "Mã PIN mới phải có đúng 4 số").regex(/^\d{4}$/, "Mã PIN chỉ được chứa số")
});

interface ChangePasswordDialogProps {
  userId: number
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ChangePasswordDialog({ userId, isOpen, onClose, onSuccess }: ChangePasswordDialogProps) {
  const { toast } = useToast()
  const [adminChangePassword, { isLoading }] = useAdminChangePasswordMutation()
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    
    // Clear API error when user types
    if (error) {
      setError(null)
    }
    
    // Chỉ cho phép nhập số và tối đa 4 ký tự
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPassword(value)
    }
  }

  const validateForm = () => {
    try {
      pinSchema.parse({ newPassword: password })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message)
      }
      return false
    }
  }

  const resetForm = () => {
    setPassword("")
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      // Sử dụng mutation để thay đổi mật khẩu
      await adminChangePassword({
        userId,
        payload: { newPassword: password }
      }).unwrap()
      
      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công",
      })
      resetForm()
      onSuccess?.()
      onClose()
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.data?.error || "Có lỗi xảy ra khi đổi mật khẩu"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: errorMessage,
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đổi mã PIN</DialogTitle>
          <DialogDescription>Nhập mã PIN mới (4 số) cho người dùng</DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
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
              value={password}
              onChange={handleInputChange}
              className="text-center text-lg tracking-widest"
              placeholder="• • • •"
            />
            <p className="text-xs text-muted-foreground">Mã PIN phải có đúng 4 chữ số.</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Đổi mã PIN
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 