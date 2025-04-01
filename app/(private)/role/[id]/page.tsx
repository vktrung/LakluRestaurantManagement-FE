"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Users, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useGetRoleByIdQuery, useGetRolesQuery, useUpdateRolePermissionsMutation } from "@/features/role/roleApiSlice"
import { useGetPermissionQuery } from "@/features/permission/permissionApiSlice"
import { Skeleton } from "@/components/ui/skeleton"
import { Permission, User } from "@/features/role/types"

// Types
interface PermissionGroup {
  groupName: string
  groupAlias: string
  groupDescription: string
  permissions: Permission[]
}

export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  // Lấy thông tin vai trò từ API
  const roleId = parseInt(params.id)
  const { 
    data: roleDetailResponse, 
    isLoading: isLoadingRole, 
    error: roleError, 
    refetch 
  } = useGetRoleByIdQuery(roleId, {
    skip: isNaN(roleId)
  })

  // Lấy danh sách permission từ API
  const { 
    data: permissionResponse, 
    isLoading: isLoadingPermissions, 
    error: permissionError 
  } = useGetPermissionQuery()

  // Mutation để cập nhật quyền cho vai trò
  const [updateRolePermissions, { isLoading: isUpdating }] = useUpdateRolePermissionsMutation()

  // Dữ liệu vai trò từ API
  const roleDetail = roleDetailResponse?.data
  
  // Danh sách người dùng từ API
  const users = roleDetail?.users || []

  // Dữ liệu permission từ API
  const permissionGroups = permissionResponse?.data || []

  // Cập nhật state khi có dữ liệu từ API
  useEffect(() => {
    if (roleDetail) {
      const permissionIds = roleDetail.permissions.map(p => p.id)
      setSelectedPermissions(permissionIds)
    }
  }, [roleDetail])

  // Toggle permission selection
  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]

      // Check if permissions have changed from the original
      const originalPermissions = roleDetail?.permissions.map(p => p.id) || []
      setHasChanges(JSON.stringify(newPermissions.sort()) !== JSON.stringify(originalPermissions.sort()))

      return newPermissions
    })
  }

  // Toggle all permissions in a group
  const toggleGroupPermissions = (permissions: Permission[]) => {
    const permissionIds = permissions.map((p) => p.id)
    const allSelected = permissions.every((p) => selectedPermissions.includes(p.id))

    setSelectedPermissions((prev) => {
      let newPermissions
      if (allSelected) {
        // Remove all permissions in this group
        newPermissions = prev.filter((id) => !permissionIds.includes(id))
      } else {
        // Add all permissions in this group
        const permissionsToAdd = permissionIds.filter((id) => !prev.includes(id))
        newPermissions = [...prev, ...permissionsToAdd]
      }

      // Check if permissions have changed from the original
      const originalPermissions = roleDetail?.permissions.map(p => p.id) || []
      setHasChanges(JSON.stringify(newPermissions.sort()) !== JSON.stringify(originalPermissions.sort()))

      return newPermissions
    })
  }

  // Save changes
  const saveChanges = async () => {
    if (!roleDetail) return

    try {
      // Gọi API để cập nhật quyền cho vai trò
      await updateRolePermissions({
        id: roleDetail.id,
        name: roleDetail.name,
        description: roleDetail.description,
        permissions: selectedPermissions
      }).unwrap()

      // Hiển thị thông báo thành công
      toast.success(`Quyền cho vai trò "${roleDetail.name}" đã được cập nhật thành công.`)

      // Cập nhật lại dữ liệu từ API
      refetch()

      // Tắt chế độ chỉnh sửa
      setIsEditing(false)
      setHasChanges(false)
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền:", error)
      toast.error("Không thể cập nhật quyền. Vui lòng thử lại sau.")
    }
  }

  // Check if a permission is selected
  const isPermissionSelected = (permissionId: number) => {
    return selectedPermissions.includes(permissionId)
  }

  // Check if all permissions in a group are selected
  const areAllGroupPermissionsSelected = (permissions: Permission[]) => {
    return permissions.every((p) => isPermissionSelected(p.id))
  }

  // Check if some permissions in a group are selected
  const areSomeGroupPermissionsSelected = (permissions: Permission[]) => {
    return permissions.some((p) => isPermissionSelected(p.id))
  }

  // Chuyển đổi tên phòng ban từ tiếng Anh sang tiếng Việt
  const getDepartmentName = (department: string) => {
    const departmentMap: Record<string, string> = {
      'MANAGER': 'Quản lý',
      'SERVICE': 'Phục vụ',
      'KITCHEN': 'Nhà bếp',
      'CASHIER': 'Thu ngân',
      'OTHER': 'Khác'
    }
    return departmentMap[department] || department
  }

  // Chuyển đổi trạng thái làm việc từ tiếng Anh sang tiếng Việt và xác định variant của Badge
  const getEmploymentStatusInfo = (status: string) => {
    const statusMap: Record<string, {name: string, variant: "default" | "secondary" | "outline"}> = {
      'WORKING': {name: 'Đang làm việc', variant: 'default'},
      'ON_LEAVE': {name: 'Đang nghỉ phép', variant: 'secondary'},
      'RESIGNED': {name: 'Đã nghỉ việc', variant: 'outline'}
    }
    return statusMap[status] || {name: status, variant: 'outline'}
  }

  // Handle if role not found
  if (roleError) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <h2 className="text-2xl font-semibold mb-2">Không tìm thấy vai trò</h2>
          <p className="text-muted-foreground mb-4">Vai trò bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Button asChild>
            <Link href="/role">Quay lại danh sách vai trò</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/role">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Quay lại</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết vai trò</h1>
            {isLoadingRole ? (
              <Skeleton className="h-4 w-48 mt-1" />
            ) : (
              <p className="text-muted-foreground mt-1">{roleDetail?.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  // Reset permissions to original state
                  setSelectedPermissions(roleDetail?.permissions.map(p => p.id) || [])
                  setHasChanges(false)
                }}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button 
                onClick={saveChanges} 
                disabled={!hasChanges || isUpdating}
              >
                {isUpdating ? (
                  <>Đang lưu...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa quyền
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin vai trò</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingRole ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                    <Skeleton className="h-4 w-8 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tên vai trò</h3>
                    <Skeleton className="h-4 w-48 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Mô tả</h3>
                    <Skeleton className="h-4 w-full mt-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Số người dùng</h3>
                    <Skeleton className="h-6 w-16 mt-1" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                    <p>{roleDetail?.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Tên vai trò</h3>
                    <p>{roleDetail?.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Mô tả</h3>
                    <p>{roleDetail?.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Số người dùng</h3>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Users className="h-3 w-3" />
                      {roleDetail?.userCount || 0}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="permissions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="permissions">Quyền</TabsTrigger>
              <TabsTrigger value="users">Người dùng</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách quyền</CardTitle>
                  <CardDescription>
                    {isEditing
                      ? "Chọn các quyền cho vai trò này"
                      : `Vai trò này có ${selectedPermissions.length} quyền`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRole || isLoadingPermissions ? (
                    <div className="space-y-4 py-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : permissionError ? (
                    <div className="text-center py-6 text-destructive">
                      Không thể tải dữ liệu quyền. Vui lòng thử lại sau.
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {permissionGroups.map((group) => (
                          <div key={group.groupAlias} className="border rounded-lg">
                            <div className="flex items-center justify-between w-full p-4 text-left">
                              <div className="flex items-center gap-3">
                                {isEditing ? (
                                  <Checkbox
                                    checked={areAllGroupPermissionsSelected(group.permissions)}
                                    onCheckedChange={() => toggleGroupPermissions(group.permissions)}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                  />
                                ) : (
                                  <div
                                    className={`w-5 h-5 rounded-full ${
                                      areAllGroupPermissionsSelected(group.permissions)
                                        ? "bg-primary"
                                        : areSomeGroupPermissionsSelected(group.permissions)
                                          ? "bg-primary/50"
                                          : "bg-muted"
                                    }`}
                                  />
                                )}
                                <div>
                                  <h3 className="font-medium">{group.groupName}</h3>
                                  <p className="text-sm text-muted-foreground">{group.groupDescription}</p>
                                </div>
                              </div>
                              <Badge variant="outline">
                                {group.permissions.filter((p) => isPermissionSelected(p.id)).length} /{" "}
                                {group.permissions.length}
                              </Badge>
                            </div>
                            <Separator />
                            <div className="p-4 space-y-2">
                              {group.permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center gap-3 py-2">
                                  {isEditing ? (
                                    <Checkbox
                                      id={`permission-${permission.id}`}
                                      checked={isPermissionSelected(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                    />
                                  ) : (
                                    <div
                                      className={`w-5 h-5 rounded-full ${
                                        isPermissionSelected(permission.id) ? "bg-primary" : "bg-muted"
                                      }`}
                                    />
                                  )}
                                  <div className="grid gap-0.5">
                                    <label
                                      htmlFor={`permission-${permission.id}`}
                                      className={`text-sm font-medium ${isEditing ? "cursor-pointer" : ""}`}
                                    >
                                      {permission.name}
                                    </label>
                                    <p className="text-xs text-muted-foreground">{permission.alias}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Người dùng có vai trò này</CardTitle>
                  <CardDescription>Danh sách người dùng được gán vai trò "{roleDetail?.name}"</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">ID</TableHead>
                          <TableHead>Tên người dùng</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phòng ban</TableHead>
                          <TableHead className="text-center">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingRole ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Skeleton className="h-4 w-full max-w-md" />
                                <Skeleton className="h-4 w-full max-w-md" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              Không có người dùng nào có vai trò này
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user: User) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.id}</TableCell>
                              <TableCell>{user.fullName}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{getDepartmentName(user.department)}</TableCell>
                              <TableCell className="text-center">
                                {(() => {
                                  const status = getEmploymentStatusInfo(user.employmentStatus)
                                  return (
                                    <Badge
                                      variant={status.variant}
                                      className="capitalize"
                                    >
                                      {status.name}
                                    </Badge>
                                  )
                                })()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

