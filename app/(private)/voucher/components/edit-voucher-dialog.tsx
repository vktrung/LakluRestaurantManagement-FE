"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VoucherForm } from "./voucher-form"
import type { Voucher, VoucherRequest } from "@/features/voucher/type"

interface EditVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  voucher: Voucher
  onUpdate: (data: VoucherRequest) => Promise<void>
}

export function EditVoucherDialog({ open, onOpenChange, voucher, onUpdate }: EditVoucherDialogProps) {
  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Voucher</DialogTitle>
        </DialogHeader>
        <VoucherForm 
          voucher={voucher}
          onSubmit={onUpdate}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}