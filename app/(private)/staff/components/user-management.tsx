"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCog,
  KeyRound,
  Loader2,
  LockOpen,
  UserX
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { UserDialog } from "./user-dialog"
import { useGetStaffQuery, useUpdateProfileStatusMutation } from "@/features/staff/staffApiSlice"
import { Staff } from "@/features/staff/types"
import { CreateUserDialog } from "./create-user-dialog"
import { ChangePasswordDialog } from "./change-password-dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function UserManagement() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<Staff | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "add">("view")
  const [currentPage, setCurrentPage] = useState(0)
  const [userToDeactivate, setUserToDeactivate] = useState<Staff | null>(null)
  const [isConfirmDeactivateOpen, setIsConfirmDeactivateOpen] = useState(false)
  const [updateProfileStatus, { isLoading: isDeactivating }] = useUpdateProfileStatusMutation()
  const [userToActivate, setUserToActivate] = useState<Staff | null>(null)
  const [isConfirmActivateOpen, setIsConfirmActivateOpen] = useState(false)
  const [userToResign, setUserToResign] = useState<Staff | null>(null)
  const [isConfirmResignOpen, setIsConfirmResignOpen] = useState(false)

  // Gọi API với tham số currentPage
  const { data: staffResponse, isLoading, refetch } = useGetStaffQuery(
    { page: currentPage },
    { refetchOnMountOrArgChange: true }
  )
  
  // Xử lý dữ liệu trả về từ API
  const users = staffResponse?.data?.users || []
  const totalPages = staffResponse?.data?.totalPages || 1

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleAddUser = () => {
    setIsCreateDialogOpen(true)
  }

  const handleViewUser = (user: Staff) => {
    setSelectedUser(user)
    setDialogMode("view")
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: Staff) => {
    setSelectedUser(user)
    setDialogMode("edit")
    setIsDialogOpen(true)
  }
  
  const handleChangePassword = (user: Staff) => {
    setSelectedUser(user)
    setIsChangePasswordDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false)
  }
  
  const handleCloseChangePasswordDialog = () => {
    setIsChangePasswordDialogOpen(false)
  }

  const handleCreateSuccess = () => {
    refetch()
  }
  
  const handleChangePasswordSuccess = () => {
    toast({
      title: "Thành công",
      description: `Đổi mật khẩu thành công cho tài khoản ${selectedUser?.username}`,
    })
  }

  const handleRefresh = () => {
    refetch()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getInitials = (name: string) => {
    if (!name) return "NN";
    return name
      .split(" ")
      .map((part) => part?.[0] || "")
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WORKING":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "TEMPORARY_LEAVE":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "RESIGNED":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case "WORKING":
        return "Đang làm việc"
      case "TEMPORARY_LEAVE":
        return "Tạm nghỉ"
      case "RESIGNED":
        return "Đã nghỉ việc"
      default:
        return status
    }
  }

  const handleDeleteUser = (user: Staff) => {
    setUserToDeactivate(user)
    setIsConfirmDeactivateOpen(true)
  }

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return
    
    try {
      await updateProfileStatus({
        profileId: userToDeactivate.profile.id,
        payload: {
          employmentStatus: 'TEMPORARY_LEAVE'
        }
      }).unwrap()
      
      toast({
        title: "Thành công",
        description: `Đã tạm khóa tài khoản ${userToDeactivate.username}`,
      })
      
      refetch()
    } catch (error) {
      console.error("Lỗi khi tạm khóa tài khoản:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạm khóa tài khoản",
      })
    } finally {
      setIsConfirmDeactivateOpen(false)
      setUserToDeactivate(null)
    }
  }

  const handleActivateUser = (user: Staff) => {
    setUserToActivate(user)
    setIsConfirmActivateOpen(true)
  }

  const handleConfirmActivate = async () => {
    if (!userToActivate) return
    
    try {
      await updateProfileStatus({
        profileId: userToActivate.profile.id,
        payload: {
          employmentStatus: 'WORKING'
        }
      }).unwrap()
      
      toast({
        title: "Thành công",
        description: `Đã kích hoạt lại tài khoản ${userToActivate.username}`,
      })
      
      refetch()
    } catch (error) {
      console.error("Lỗi khi kích hoạt lại tài khoản:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi kích hoạt lại tài khoản",
      })
    } finally {
      setIsConfirmActivateOpen(false)
      setUserToActivate(null)
    }
  }

  const handleResignUser = (user: Staff) => {
    setUserToResign(user)
    setIsConfirmResignOpen(true)
  }

  const handleConfirmResign = async () => {
    if (!userToResign) return
    
    try {
      await updateProfileStatus({
        profileId: userToResign.profile.id,
        payload: {
          employmentStatus: 'RESIGNED'
        }
      }).unwrap()
      
      toast({
        title: "Thành công",
        description: `Đã khóa vĩnh viễn tài khoản ${userToResign.username}`,
      })
      
      refetch()
    } catch (error) {
      console.error("Lỗi khi khóa vĩnh viễn tài khoản:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi khóa vĩnh viễn tài khoản",
      })
    } finally {
      setIsConfirmResignOpen(false)
      setUserToResign(null)
    }
  }

  const isUserTemporaryLeave = (user: Staff) => {
    return user.profile.employmentStatus === 'TEMPORARY_LEAVE'
  }

  const isUserResigned = (user: Staff) => {
    return user.profile.employmentStatus === 'RESIGNED'
  }

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
            </Button>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm người dùng..."
              className="pl-8 w-full"
              onChange={handleSearch}
            />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách người dùng</CardTitle>
                <CardDescription>Quản lý tất cả tài khoản người dùng trong hệ thống</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* DESKTOP VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead className="min-w-[200px]">Người dùng</TableHead>
                    <TableHead className="min-w-[150px]">Phòng ban</TableHead>
                    <TableHead className="min-w-[150px]">Vai trò</TableHead>
                    <TableHead className="min-w-[150px]">Trạng thái</TableHead>
                    <TableHead className="min-w-[150px]">Mức lương</TableHead>
                    <TableHead className="min-w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={7} className="h-14">
                          <div className="w-full h-4 bg-gray-200 animate-pulse rounded"></div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24">
                        Không tìm thấy người dùng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profile.avatar || undefined} alt={user.profile.fullName} />
                              <AvatarFallback>{user?.profile?.fullName ? getInitials(user.profile.fullName) : "NN"}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.profile.fullName}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.profile.department}</TableCell>
                        <TableCell>
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((role: string, index: number) => (
                              <Badge key={index} variant="outline" className="mr-1">
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline" className="bg-gray-100">
                              Không có vai trò
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.profile.employmentStatus)}>
                            {translateStatus(user.profile.employmentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.salaryRateName}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Mở menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                <FileText className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <UserCog className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChangePassword(user)}>
                                <KeyRound className="mr-2 h-4 w-4" />
                                Đổi mật khẩu
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {isUserTemporaryLeave(user) ? (
                                <>
                                  <DropdownMenuItem onClick={() => handleActivateUser(user)} className="text-green-600">
                                    <LockOpen className="mr-2 h-4 w-4" />
                                    Kích hoạt lại
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResignUser(user)} className="text-red-600">
                                    <UserX className="mr-2 h-4 w-4" />
                                    Khóa vĩnh viễn
                                  </DropdownMenuItem>
                                </>
                              ) : isUserResigned(user) ? (
                                <DropdownMenuItem onClick={() => handleActivateUser(user)} className="text-green-600">
                                  <LockOpen className="mr-2 h-4 w-4" />
                                  Kích hoạt lại
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-yellow-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Tạm khóa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResignUser(user)} className="text-red-600">
                                    <UserX className="mr-2 h-4 w-4" />
                                    Khóa vĩnh viễn
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* MOBILE VIEW */}
            <div className="md:hidden">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="p-4 border-b animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  Không tìm thấy người dùng nào
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.profile.avatar || undefined} alt={user.profile.fullName} />
                          <AvatarFallback>{user?.profile?.fullName ? getInitials(user.profile.fullName) : "NN"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.profile.fullName}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge className="mb-1 mr-1">ID: {user.id}</Badge>
                            <Badge variant="outline" className="mb-1 mr-1">{user.profile.department}</Badge>
                            <Badge className={getStatusColor(user.profile.employmentStatus) + " mb-1"}>
                              {translateStatus(user.profile.employmentStatus)}
                            </Badge>
                          </div>
                          <div className="mt-1 text-sm">
                            <span className="font-medium">Lương:</span> {user.salaryRateName}
                          </div>
                          <div className="mt-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role: string, index: number) => (
                                <Badge key={index} variant="outline" className="mr-1 mb-1">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="bg-gray-100">
                                Không có vai trò
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Mở menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangePassword(user)}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Đổi mật khẩu
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {isUserTemporaryLeave(user) ? (
                            <>
                              <DropdownMenuItem onClick={() => handleActivateUser(user)} className="text-green-600">
                                <LockOpen className="mr-2 h-4 w-4" />
                                Kích hoạt lại
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResignUser(user)} className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Khóa vĩnh viễn
                              </DropdownMenuItem>
                            </>
                          ) : isUserResigned(user) ? (
                            <DropdownMenuItem onClick={() => handleActivateUser(user)} className="text-green-600">
                              <LockOpen className="mr-2 h-4 w-4" />
                              Kích hoạt lại
                            </DropdownMenuItem>
                          ) : (
                            <>
                              <DropdownMenuItem onClick={() => handleDeleteUser(user)} className="text-yellow-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Tạm khóa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleResignUser(user)} className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Khóa vĩnh viễn
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground mb-3 sm:mb-0">
                Hiển thị <strong>{filteredUsers.length}</strong> trên tổng số <strong>{staffResponse?.data?.totalItems || 0}</strong> người
                dùng
              </div>
              {totalPages > 1 && (
                <Pagination className="mx-auto sm:mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      // Chỉ hiển thị trang đầu, trang cuối và trang hiện tại +/- 1 trên mobile
                      if (
                        index === 0 || 
                        index === totalPages - 1 || 
                        Math.abs(index - currentPage) <= 1
                      ) {
                        return (
                          <PaginationItem key={index} className="hidden sm:inline-block">
                            <PaginationLink 
                              onClick={() => handlePageChange(index)}
                              isActive={currentPage === index}
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      }
                      
                      // Thêm dấu ba chấm nếu bị nhảy trang
                      if (
                        (index === currentPage - 2 && currentPage > 2) ||
                        (index === currentPage + 2 && currentPage < totalPages - 3)
                      ) {
                        return <PaginationEllipsis key={index} className="hidden sm:inline-block" />
                      }
                      
                      return null
                    })}
                    {/* Hiển thị đơn giản trên mobile */}
                    <PaginationItem className="sm:hidden">
                      <PaginationLink isActive={true}>
                        {currentPage + 1} / {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isDialogOpen && (
        <UserDialog user={selectedUser} mode={dialogMode} isOpen={isDialogOpen} onClose={handleCloseDialog} />
      )}

      <CreateUserDialog 
        isOpen={isCreateDialogOpen} 
        onClose={handleCloseCreateDialog} 
        onSuccess={handleCreateSuccess} 
      />
      
      {selectedUser && isChangePasswordDialogOpen && (
        <ChangePasswordDialog
          userId={selectedUser.id}
          isOpen={isChangePasswordDialogOpen}
          onClose={handleCloseChangePasswordDialog}
          onSuccess={handleChangePasswordSuccess}
        />
      )}

      {/* Dialog xác nhận tạm khóa tài khoản */}
      <AlertDialog open={isConfirmDeactivateOpen} onOpenChange={setIsConfirmDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận tạm khóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn tạm khóa tài khoản <strong>{userToDeactivate?.username}</strong>?
              <br />
              Người dùng này sẽ không thể đăng nhập vào hệ thống cho đến khi được kích hoạt lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeactivate}
              disabled={isDeactivating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận tạm khóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog xác nhận kích hoạt lại tài khoản */}
      <AlertDialog open={isConfirmActivateOpen} onOpenChange={setIsConfirmActivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận kích hoạt lại tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn kích hoạt lại tài khoản <strong>{userToActivate?.username}</strong>?
              <br />
              Người dùng này sẽ có thể đăng nhập và sử dụng hệ thống bình thường.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmActivate}
              disabled={isDeactivating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isDeactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận kích hoạt"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog xác nhận khóa vĩnh viễn tài khoản */}
      <AlertDialog open={isConfirmResignOpen} onOpenChange={setIsConfirmResignOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khóa vĩnh viễn tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khóa vĩnh viễn tài khoản <strong>{userToResign?.username}</strong>?
              <br />
              Người dùng này sẽ không thể đăng nhập vào hệ thống và được đánh dấu đã nghỉ việc.
              <br />
              <span className="text-red-600 font-semibold">Lưu ý: Hành động này vẫn có thể được hoàn tác nếu cần.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmResign}
              disabled={isDeactivating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận khóa vĩnh viễn"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

