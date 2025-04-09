"use client"

import { useState } from "react"
import { ChevronDown, Filter, Pencil, Save, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

// Import các component từ thư mục components
import { PermissionSearch } from "./components/permission-search"
import { PermissionFilter } from "./components/permission-filter"
import { PermissionGroupComponent } from "./components/permission-group"

// Import API slice
import { useGetPermissionQuery, useUpdatePermissionMutation } from "@/features/permission/permissionApiSlice"

// Types for our permission data
interface Permission {
  id: number
  alias: string
  name: string
  description: string | null
}

interface PermissionGroup {
  groupName: string
  groupAlias: string
  groupDescription: string
  permissions: Permission[]
}

// Sample data cho trường hợp API chưa load xong (fallback)
const fallbackPermissionsData: PermissionGroup[] = [
  {
    groupName: "Menu Permissions",
    groupAlias: "MENU",
    groupDescription: "Quyền liên quan đến menu",
    permissions: [
      {
        id: 33,
        alias: "menus:create",
        name: "Thêm menu",
        description: null,
      },
      {
        id: 34,
        alias: "menus:update",
        name: "Sửa menu",
        description: null,
      },
      {
        id: 35,
        alias: "menus:list",
        name: "Danh sách menu",
        description: null,
      },
      {
        id: 36,
        alias: "menus:delete",
        name: "Xóa menu",
        description: null,
      },
    ],
  }
]

export default function PermissionsPage() {
  // Sử dụng RTK Query hooks để gọi API
  const { data: permissionResponse, isLoading, isError } = useGetPermissionQuery()
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [editDescription, setEditDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Lấy dữ liệu permissions từ API response hoặc fallback nếu chưa load xong
  const permissionsData = permissionResponse?.data || fallbackPermissionsData

  // Filter permissions based on search term and selected groups
  const filteredPermissions = permissionsData.filter((group) => {
    // Filter by selected groups if any are selected
    if (selectedGroups.length > 0 && !selectedGroups.includes(group.groupAlias)) {
      return false
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        group.groupName.toLowerCase().includes(searchLower) ||
        group.groupDescription.toLowerCase().includes(searchLower) ||
        group.permissions.some(
          (permission) =>
            permission.name.toLowerCase().includes(searchLower) || permission.alias.toLowerCase().includes(searchLower),
        )
      )
    }

    return true
  })

  // Toggle group expansion
  const toggleGroup = (groupAlias: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupAlias) ? prev.filter((g) => g !== groupAlias) : [...prev, groupAlias],
    )
  }

  // Open edit dialog
  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission)
    setEditDescription(permission.description || "")
    setIsDialogOpen(true)
  }

  // Save description
  const saveDescription = async () => {
    if (editingPermission) {
      try {
        await updatePermission({
          id: editingPermission.id,
          description: editDescription
        }).unwrap()
        
        toast.success(`Mô tả cho quyền "${editingPermission.name}" đã được cập nhật thành công.`)
        setIsDialogOpen(false)
        setEditingPermission(null)
      } catch (error) {
        toast.error("Có lỗi xảy ra khi cập nhật mô tả quyền")
        console.error("Lỗi cập nhật quyền:", error)
      }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý quyền hệ thống</h1>
          <p className="text-muted-foreground mt-1">Xem và cập nhật mô tả cho các quyền trong hệ thống</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Danh sách quyền hệ thống</CardTitle>
          <CardDescription>
            Tổng cộng {permissionsData.reduce((acc, group) => acc + group.permissions.length, 0)} quyền trong{" "}
            {permissionsData.length} nhóm
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 gap-4">
            <PermissionSearch 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            <PermissionFilter 
              groups={permissionsData} 
              selectedGroups={selectedGroups}
              onGroupSelectionChange={(groupAlias, checked) => {
                if (checked) {
                  setSelectedGroups([...selectedGroups, groupAlias])
                } else {
                  setSelectedGroups(selectedGroups.filter((g) => g !== groupAlias))
                }
              }}
            />
          </div>

          <ScrollArea className="h-[600px] pr-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Đang tải danh sách quyền...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-destructive">Có lỗi xảy ra khi tải danh sách quyền</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Tải lại trang
                </Button>
              </div>
            ) : filteredPermissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">Không tìm thấy quyền nào phù hợp</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredPermissions.map((group) => (
                  <PermissionGroupComponent
                    key={group.groupAlias}
                    group={group}
                    expanded={expandedGroups.includes(group.groupAlias)}
                    onToggleExpand={() => toggleGroup(group.groupAlias)}
                    onEditPermission={openEditDialog}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Description Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cập nhật mô tả quyền</DialogTitle>
            <DialogDescription>
              {editingPermission && (
                <>
                  Cập nhật mô tả cho quyền <span className="font-medium">{editingPermission.name}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {editingPermission && (
              <div className="grid gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Tên quyền:</p>
                  <p className="text-sm">{editingPermission.name}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Mã quyền:</p>
                  <p className="text-sm text-muted-foreground">{editingPermission.alias}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Mô tả:</p>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Nhập mô tả cho quyền này..."
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUpdating}>
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button onClick={saveDescription} disabled={isUpdating}>
              {isUpdating ? (
                <>Đang lưu...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu mô tả
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

