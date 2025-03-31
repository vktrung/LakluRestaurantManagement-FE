"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { VoucherForm } from "./voucher-form"
import type { VoucherRequest } from "@/features/voucher/type"

interface AddVoucherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (data: VoucherRequest) => Promise<void>
}

export function AddVoucherDialog({ open, onOpenChange, onAdd }: AddVoucherDialogProps) {
  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Thêm Voucher Mới</DialogTitle>
        </DialogHeader>
        <VoucherForm 
          onSubmit={onAdd}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}

