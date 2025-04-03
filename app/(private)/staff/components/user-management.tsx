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
  KeyRound
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
import { useGetStaffQuery } from "@/features/staff/staffApiSlice"
import { Staff } from "@/features/staff/types"
import { CreateUserDialog } from "./create-user-dialog"
import { ChangePasswordDialog } from "./change-password-dialog"
import { useToast } from "@/components/ui/use-toast"

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
      case "ON_LEAVE":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "TERMINATED":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case "WORKING":
        return "Đang làm việc"
      case "ON_LEAVE":
        return "Nghỉ phép"
      case "TERMINATED":
        return "Đã nghỉ việc"
      default:
        return status
    }
  }

  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="admin">Quản trị viên</TabsTrigger>
            <TabsTrigger value="staff">Nhân viên</TabsTrigger>
          </TabsList>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm người dùng..."
                className="w-full md:w-[250px] pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Lọc theo</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Phòng ban</DropdownMenuItem>
                <DropdownMenuItem>Trạng thái</DropdownMenuItem>
                <DropdownMenuItem>Vai trò</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" /> Thêm người dùng
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh sách người dùng</CardTitle>
                  <CardDescription>Quản lý tất cả tài khoản người dùng trong hệ thống</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Xuất
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
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
                          <TableCell>{user.nameSalaryRate}</TableCell>
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
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Hiển thị <strong>{filteredUsers.length}</strong> trên tổng số <strong>{staffResponse?.data?.totalItems || 0}</strong> người
                  dùng
                </div>
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                          className={currentPage === 0 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <PaginationItem key={index}>
                          <PaginationLink 
                            onClick={() => handlePageChange(index)}
                            isActive={currentPage === index}
                          >
                            {index + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
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
        </TabsContent>

        <TabsContent value="admin" className="m-0">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">Danh sách quản trị viên</h3>
                <p className="text-muted-foreground mt-2">Hiển thị người dùng có vai trò quản trị viên</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="m-0">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">Danh sách nhân viên</h3>
                <p className="text-muted-foreground mt-2">Hiển thị người dùng có vai trò nhân viên</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </>
  )
}

