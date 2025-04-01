"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Permission {
  id: number
  alias: string
  name: string
  description: string | null
}

interface PermissionDetailsProps {
  permission: Permission | null
  isOpen: boolean
  onClose: () => void
  onSave: (permission: Permission, description: string) => Promise<void>
}

export function PermissionDetails({ permission, isOpen, onClose, onSave }: PermissionDetailsProps) {
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (permission) {
      setDescription(permission.description || "")
    }
  }, [permission])

  const handleSave = async () => {
    if (!permission) return

    try {
      await onSave(permission, description)
      toast.success("Đã cập nhật mô tả thành công")
      onClose()
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật mô tả")
    }
  }

  if (!permission) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa mô tả quyền</DialogTitle>
          <DialogDescription>
            Cập nhật mô tả chi tiết cho quyền {permission.name} ({permission.alias})
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Nhập mô tả chi tiết cho quyền..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 