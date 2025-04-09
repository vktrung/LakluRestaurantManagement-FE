"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Edit, Trash2, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useGetRolesQuery, useAddRoleMutation, useDeleteRoleByIdMutation } from "@/features/role/roleApiSlice"
import { useGetPermissionQuery } from "@/features/permission/permissionApiSlice"
import { Skeleton } from "@/components/ui/skeleton"

// Types từ permission types
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

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Fetch roles using RTK Query
  const { data: rolesResponse, isLoading, error } = useGetRolesQuery()
  const [addRole, { isLoading: isAddingRole }] = useAddRoleMutation()
  const [deleteRole, { isLoading: isDeletingRole }] = useDeleteRoleByIdMutation()
  
  // Fetch permissions using RTK Query
  const { 
    data: permissionResponse, 
    isLoading: isLoadingPermissions, 
    error: permissionError 
  } = useGetPermissionQuery()

  // Lấy danh sách permission từ response API
  const permissionGroups = permissionResponse?.data || []

  // Lấy danh sách vai trò từ response API
  const roles = rolesResponse?.data || []

  // Filter roles based on search term
  const filteredRoles = roles.filter((role) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return role.name.toLowerCase().includes(searchLower) || role.description.toLowerCase().includes(searchLower)
    }
    return true
  })

  // Toggle group expansion
  const toggleGroup = (groupAlias: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupAlias) ? prev.filter((g) => g !== groupAlias) : [...prev, groupAlias],
    )
  }

  // Toggle permission selection
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    )
  }

  // Toggle all permissions in a group
  const toggleGroupPermissions = (permissions: Permission[]) => {
    const permissionIds = permissions.map((p) => p.id)
    const allSelected = permissions.every((p) => selectedPermissions.includes(p.id))

    if (allSelected) {
      // Remove all permissions in this group
      setSelectedPermissions((prev) => prev.filter((id) => !permissionIds.includes(id)))
    } else {
      // Add all permissions in this group
      setSelectedPermissions((prev) => {
        const newPermissions = permissionIds.filter((id) => !prev.includes(id))
        return [...prev, ...newPermissions]
      })
    }
  }

  // Create new role
  const createRole = async () => {
    // Validate form
    if (!newRoleName.trim()) {
      toast.error("Vui lòng nhập tên vai trò")
      return
    }

    if (selectedPermissions.length === 0) {
      toast.error("Vui lòng chọn ít nhất một quyền cho vai trò")
      return
    }

    try {
      // Gọi API thêm vai trò
      await addRole({
        name: newRoleName,
        description: newRoleDescription,
        permissions: selectedPermissions,
      }).unwrap()

      // Show success message
      toast.success(`Vai trò "${newRoleName}" đã được tạo thành công với ${selectedPermissions.length} quyền.`)

      // Reset form
      setNewRoleName("")
      setNewRoleDescription("")
      setSelectedPermissions([])
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create role:", error)
      toast.error("Không thể tạo vai trò. Vui lòng thử lại sau.")
    }
  }

  // Delete role
  const handleDeleteRole = async (id: number) => {
    try {
      // Call API to delete role
      await deleteRole(id).unwrap()
      toast.success("Vai trò đã được xóa thành công")
    } catch (error) {
      console.error("Failed to delete role:", error)
      toast.error("Không thể xóa vai trò. Vui lòng thử lại sau.")
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý vai trò</h1>
          <p className="text-muted-foreground mt-1">Tạo và quản lý các vai trò trong hệ thống</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo vai trò mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Tạo vai trò mới</DialogTitle>
              <DialogDescription>Nhập thông tin và chọn quyền cho vai trò mới</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Tên vai trò
                </Label>
                <Input
                  id="name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="col-span-3"
                  placeholder="Nhập tên vai trò"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Nhập mô tả cho vai trò này"
                  rows={3}
                />
              </div>
              <Separator className="my-2" />
              <div className="grid grid-cols-4 items-start gap-4">
                <div className="text-right pt-2">
                  <Label>Quyền</Label>
                  <p className="text-xs text-muted-foreground mt-1">Đã chọn {selectedPermissions.length} quyền</p>
                </div>
                <div className="col-span-3">
                  <ScrollArea className="h-[300px] pr-4 border rounded-md p-4">
                    {isLoadingPermissions ? (
                      <div className="space-y-4">
                        <Skeleton className="h-[60px] w-full" />
                        <Skeleton className="h-[60px] w-full" />
                        <Skeleton className="h-[60px] w-full" />
                      </div>
                    ) : permissionError ? (
                      <div className="text-center py-4 text-destructive">
                        Không thể tải quyền. Vui lòng thử lại sau.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {permissionGroups.map((group: PermissionGroup) => (
                          <Collapsible
                            key={group.groupAlias}
                            open={expandedGroups.includes(group.groupAlias)}
                            onOpenChange={() => toggleGroup(group.groupAlias)}
                            className="border rounded-lg"
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-left">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={group.permissions.every((p: Permission) => selectedPermissions.includes(p.id))}
                                  onCheckedChange={() => toggleGroupPermissions(group.permissions)}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                                <div>
                                  <h3 className="font-medium">{group.groupName}</h3>
                                  <p className="text-sm text-muted-foreground">{group.groupDescription}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{group.permissions.length}</Badge>
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform ${
                                    expandedGroups.includes(group.groupAlias) ? "transform rotate-90" : ""
                                  }`}
                                />
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <Separator />
                              <div className="p-4 space-y-2">
                                {group.permissions.map((permission: Permission) => (
                                  <div key={permission.id} className="flex items-center gap-3 py-2">
                                    <Checkbox
                                      id={`permission-${permission.id}`}
                                      checked={selectedPermissions.includes(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                    <div className="grid gap-0.5">
                                      <label
                                        htmlFor={`permission-${permission.id}`}
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        {permission.name}
                                      </label>
                                      <p className="text-xs text-muted-foreground">{permission.alias}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={createRole} disabled={isAddingRole}>
                {isAddingRole ? "Đang tạo..." : "Tạo vai trò"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách vai trò</CardTitle>
          <CardDescription>Quản lý các vai trò và phân quyền trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm vai trò..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div> */}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Tên vai trò</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead className="text-center">Số người dùng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-destructive">
                      Có lỗi xảy ra khi tải dữ liệu, vui lòng thử lại sau.
                    </TableCell>
                  </TableRow>
                ) : filteredRoles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Không tìm thấy vai trò nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.id}</TableCell>
                      <TableCell>
                        <div className="font-medium">{role.name}</div>
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="flex items-center justify-center gap-1 w-fit mx-auto">
                          <Users className="h-3 w-3" />
                          {role.userCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/role/${role.id}`}>
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">Chi tiết</span>
                            </Link>
                          </Button>
                          <Button variant="outline" size="icon" asChild>
                            <Link href={`/role/${role.id}`}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Sửa</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={isDeletingRole}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

