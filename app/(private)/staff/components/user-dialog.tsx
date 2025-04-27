"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CalendarIcon, Save, X, Loader2 } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGetStaffByIdQuery, useUpdateEmploymentStatusMutation, useUpdateUserProfileMutation } from "@/features/staff/staffApiSlice"
import { Staff, Profile } from "@/features/staff/types"
import { useGetSalaryRatesQuery } from "@/features/salary/salaryApiSlice"
import { useGetRolesQuery } from "@/features/role/roleApiSlice"
import { useToast } from "@/components/ui/use-toast"

// Định nghĩa interface cho formData để mở rộng từ Staff và Profile
interface UserFormData {
  id?: number
  username: string
  email: string
  phone?: string | null
  avatar?: string | null
  roles: string[]
  salaryRateName: string
  salaryAmount: number
  salaryType: string
  profile: {
    id?: number
    userId?: number
    username?: string
    email?: string
    fullName: string
    gender: string
    dateOfBirth: string
    phoneNumber: string
    address: string
    avatar?: string | null
    employmentStatus: string
    hireDate: string
    bankAccount: string
    bankNumber: string
    avatarImages?: string | null
    department: string
  }
}

interface UserDialogProps {
  user: Staff | null
  mode: "view" | "edit" | "add"
  isOpen: boolean
  onClose: () => void
}

export function UserDialog({ user, mode, isOpen, onClose }: UserDialogProps) {
  const toast = useToast()
  const userId = user?.id.toString() || ""
  const { data: staffResponse, isLoading, error } = useGetStaffByIdQuery(userId, {
    skip: mode === "add" || !isOpen || !userId,
  })
  
  const [updateEmploymentStatus, { isLoading: isUpdatingStatus }] = useUpdateEmploymentStatusMutation()
  const [updateUserProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation()
  
  // Lấy danh sách mức lương từ API
  const { data: salaryRatesResponse, isLoading: isLoadingSalaryRates } = useGetSalaryRatesQuery()
  
  // Lấy danh sách vai trò từ API
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRolesQuery()
  
  // Danh sách phòng ban cố định
  const departments = [
    { value: 'CASHIER', label: 'Thu ngân' },
    { value: 'KITCHEN', label: 'Nhà bếp' },
    { value: 'MANAGER', label: 'Quản lý' },
    { value: 'SERVICE', label: 'Phục vụ' }
  ]

  // Định dạng tiền tệ
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }
  
  // Dịch loại lương
  const translateSalaryType = (type: string) => {
    switch (type) {
      case 'MONTHLY': return 'Tháng'
      case 'HOURLY': return 'Giờ'
      case 'SHIFTLY': return 'Ca'
      default: return type
    }
  }

  // Khởi tạo với giá trị mặc định
  const defaultFormData: UserFormData = {
    username: "",
    email: "",
    roles: [],
    salaryRateName: "",
    salaryAmount: 0,
    salaryType: "",
    profile: {
      fullName: "",
      gender: "MALE",
      dateOfBirth: new Date().toISOString(),
      phoneNumber: "",
      address: "",
      employmentStatus: "WORKING",
      hireDate: new Date().toISOString(),
      bankAccount: "",
      bankNumber: "",
      department: "",
    },
  }

  // Tạo state formData với kiểu dữ liệu cụ thể
  const [formData, setFormData] = useState<UserFormData>(defaultFormData)

  // Cập nhật formData khi có dữ liệu từ props hoặc API
  useEffect(() => {
    if (staffResponse?.data) {
      // Convert từ Staff sang UserFormData
      const userData: UserFormData = {
        ...staffResponse.data,
        profile: {
          ...staffResponse.data.profile,
        }
      }
      
      setFormData(userData)
      
      // Cập nhật các state date
      if (staffResponse.data.profile?.dateOfBirth) {
        setDateOfBirth(new Date(staffResponse.data.profile.dateOfBirth))
      }
      
      if (staffResponse.data.profile?.hireDate) {
        setHireDate(new Date(staffResponse.data.profile.hireDate))
      }
    } else if (user) {
      // Nếu không có dữ liệu từ API nhưng có user từ props
      const userData: UserFormData = {
        ...user,
        profile: {
          ...user.profile,
        }
      }
      
      setFormData(userData)
      
      // Cập nhật các state date
      if (user.profile?.dateOfBirth) {
        setDateOfBirth(new Date(user.profile.dateOfBirth))
      }
      
      if (user.profile?.hireDate) {
        setHireDate(new Date(user.profile.hireDate))
      }
    }
  }, [staffResponse, user])
  
  const [activeTab, setActiveTab] = useState("info")
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined)
  const [hireDate, setHireDate] = useState<Date | undefined>(undefined)
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      if (parent === "profile") {
        setFormData({
          ...formData,
          profile: {
            ...formData.profile,
            [child]: value,
          },
        })
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      if (parent === "profile") {
        setFormData({
          ...formData,
          profile: {
            ...formData.profile,
            [child]: value,
          },
        })
        
        // Nếu thay đổi trạng thái làm việc và không ở chế độ xem
        if (child === "employmentStatus" && mode === "edit" && userId) {
          const validStatuses = ['RESIGNED', 'TEMPORARY_LEAVE', 'WORKING']
          if (validStatuses.includes(value)) {
            // Gọi API cập nhật trạng thái
            updateEmploymentStatus({
              userId: parseInt(userId),
              payload: {
                employmentStatus: value as 'RESIGNED' | 'TEMPORARY_LEAVE' | 'WORKING'
              }
            }).unwrap()
              .then(() => {
                // Thông báo thành công đã bị xóa
              })
              .catch(err => {
                // Xử lý lỗi đã bị xóa
              })
          }
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleDateChange = (field: string, date: Date | undefined) => {
    if (field === "dateOfBirth") {
      setDateOfBirth(date)
    } else if (field === "hireDate") {
      setHireDate(date)
    }

    if (date) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [field]: date.toISOString(),
        },
      })
    }
  }

  const handleSave = async () => {
    if (mode !== "edit" || !userId) {
      onClose()
      return
    }

    try {
      // Lấy ID của salary rate từ các options nếu có
      let salaryRateId: number | undefined
      if (salaryRatesResponse?.data && salaryRatesResponse.data.length > 0) {
        const selectedRate = salaryRatesResponse.data.find(rate => rate.levelName === formData.salaryRateName)
        if (selectedRate) {
          salaryRateId = selectedRate.id
        }
      }

      // Lấy role IDs từ roleResponse nếu có
      let roleIds: number[] | undefined
      if (rolesResponse?.data && rolesResponse.data.length > 0 && formData.roles && formData.roles.length > 0) {
        const roleNames = formData.roles
        roleIds = roleNames.map(roleName => {
          const foundRole = rolesResponse.data.find(r => r.name === roleName)
          return foundRole ? foundRole.id : 0
        }).filter(id => id !== 0)
      }

      // Chuẩn bị dữ liệu gửi lên API
      const payload = {
        email: formData.email,
        phone: formData.profile.phoneNumber,
        roleIds: roleIds,
        salaryRateId: salaryRateId,
        fullName: formData.profile.fullName,
        gender: formData.profile.gender,
        dateOfBirth: formData.profile.dateOfBirth,
        phoneNumber: formData.profile.phoneNumber,
        address: formData.profile.address,
        department: formData.profile.department as 'CASHIER' | 'KITCHEN' | 'MANAGER' | 'SERVICE' | undefined,
        employmentStatus: formData.profile.employmentStatus as 'WORKING' | 'RESIGNED' | 'TEMPORARY_LEAVE',
        hireDate: formData.profile.hireDate,
        bankAccount: formData.profile.bankAccount,
        bankNumber: formData.profile.bankNumber
      }

      // Kiểm tra và lọc bỏ các trường không hợp lệ trước khi gửi
      if (payload.department && !['CASHIER', 'KITCHEN', 'MANAGER', 'SERVICE'].includes(payload.department)) {
        delete payload.department;
      }

      // Gọi API cập nhật thông tin
      await updateUserProfile({
        userId: parseInt(userId),
        payload
      }).unwrap()

      toast.toast({
        title: "Thành công",
        description: "Cập nhật thông tin người dùng thành công",
      })
      onClose()
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err)
      toast.toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật thông tin người dùng",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((part) => part[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "NN"
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case "WORKING":
        return "Đang làm việc"
      case "RESIGNED":
        return "Đã nghỉ việc"
      case "TEMPORARY_LEAVE":
        return "Tạm nghỉ"
      default:
        return status
    }
  }

  const translateDepartment = (department: string) => {
    switch (department) {
      case "CASHIER":
        return "Thu ngân"
      case "KITCHEN":
        return "Nhà bếp"
      case "MANAGER":
        return "Quản lý"
      case "SERVICE":
        return "Phục vụ"
      default:
        return department
    }
  }

  const translateGender = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "Nam"
      case "FEMALE":
        return "Nữ"
      case "OTHER":
        return "Khác"
      default:
        return gender
    }
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

  const isViewMode = mode === "view"
  const dialogTitle =
    mode === "add" ? "Thêm người dùng mới" : mode === "edit" ? "Chỉnh sửa thông tin người dùng" : "Thông tin người dùng"

  // Khởi tạo giá trị khi chuyển từ chế độ xem sang chỉnh sửa
  useEffect(() => {
    // Đảm bảo khi chuyển sang edit mode, formData đã được khởi tạo
  }, [isOpen, mode, formData]);

  // Loading state
  if (isLoading && mode !== "add") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải thông tin người dùng...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Error state
  if (error && mode !== "add") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Có lỗi xảy ra khi tải thông tin người dùng. Vui lòng thử lại sau.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Nhập thông tin để tạo người dùng mới"
              : mode === "edit"
                ? "Chỉnh sửa thông tin người dùng"
                : "Xem chi tiết thông tin người dùng"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src={formData.profile?.avatar || undefined} alt={formData.profile?.fullName || "User"} />
            <AvatarFallback className="text-lg">{getInitials(formData.profile?.fullName || "")}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-medium">{formData.profile?.fullName}</h3>
          <p className="text-sm text-muted-foreground">{formData.email}</p>
          {formData.profile?.employmentStatus && (
            <Badge className={`mt-2 ${getStatusColor(formData.profile.employmentStatus)}`}>
              {translateStatus(formData.profile.employmentStatus)}
            </Badge>
          )}
        </div>
  
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="work">Công việc</TabsTrigger>
            <TabsTrigger value="bank">Tài khoản ngân hàng</TabsTrigger>
          </TabsList>
  
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  disabled={true}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <Input
                  id="fullName"
                  name="profile.fullName"
                  value={formData.profile?.fullName || ""}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                {isViewMode ? (
                  <Input id="gender" value={translateGender(formData.profile?.gender || "")} disabled />
                ) : (
                  <Select
                    value={formData.profile?.gender || "MALE"}
                    onValueChange={(value) => handleSelectChange("profile.gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                {isViewMode ? (
                  <Input id="dateOfBirth" value={dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : ""} disabled />
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateOfBirth && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateOfBirth ? format(dateOfBirth, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={(date) => handleDateChange("dateOfBirth", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <Input
                  id="phoneNumber"
                  name="profile.phoneNumber"
                  value={formData.profile?.phoneNumber || ""}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  name="profile.address"
                  value={formData.profile?.address || ""}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="resize-none"
                />
              </div>
            </div>
          </TabsContent>
  
          <TabsContent value="work" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Phòng ban</Label>
                {isViewMode ? (
                  <Input
                    id="department"
                    value={translateDepartment(formData.profile?.department || "")}
                    disabled
                  />
                ) : (
                  <Select
                    value={formData.profile?.department || ""}
                    onValueChange={(value) => {
                      handleSelectChange("profile.department", value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn phòng ban">
                        {translateDepartment(formData.profile?.department || "")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.value} value={department.value}>
                          {department.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryRateName">Mức lương</Label>
                {isViewMode ? (
                  <Input
                    id="salaryRateName"
                    value={formData.salaryRateName || ""}
                    disabled
                  />
                ) : (
                  <Select
                    value={formData.salaryRateName || ""}
                    onValueChange={(value) => handleSelectChange("salaryRateName", value)}
                    disabled={isLoadingSalaryRates}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn mức lương">
                        {formData.salaryRateName || ""}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSalaryRates ? (
                        <SelectItem value="loading">Đang tải...</SelectItem>
                      ) : salaryRatesResponse?.data && salaryRatesResponse.data.length > 0 ? (
                        salaryRatesResponse.data.map((rate) => (
                          <SelectItem key={rate.id} value={rate.levelName}>
                            {rate.levelName} - {formatCurrency(rate.amount)} ({translateSalaryType(rate.type)})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none">Không có dữ liệu</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="employmentStatus">Trạng thái làm việc</Label>
                {isViewMode ? (
                  <Input
                    id="employmentStatus"
                    value={translateStatus(formData.profile?.employmentStatus || "")}
                    disabled
                  />
                ) : (
                  <Select
                    value={formData.profile?.employmentStatus || "WORKING"}
                    onValueChange={(value) => handleSelectChange("profile.employmentStatus", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn trạng thái">
                        {translateStatus(formData.profile?.employmentStatus || "WORKING")}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WORKING">Đang làm việc</SelectItem>
                      <SelectItem value="TEMPORARY_LEAVE">Tạm nghỉ</SelectItem>
                      <SelectItem value="RESIGNED">Đã nghỉ việc</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Ngày vào làm</Label>
                {isViewMode ? (
                  <Input id="hireDate" value={hireDate ? format(hireDate, "dd/MM/yyyy") : ""} disabled />
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !hireDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {hireDate ? format(hireDate, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={hireDate}
                        onSelect={(date) => handleDateChange("hireDate", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="roles">Vai trò</Label>
                {isViewMode ? (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.roles && formData.roles.length > 0 ? (
                      formData.roles.map((role: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="bg-gray-100">
                        Không có vai trò
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Select
                    value={formData.roles && formData.roles.length > 0 ? formData.roles[0] : ""}
                    onValueChange={(value) => setFormData({ ...formData, roles: [value] })}
                    disabled={isLoadingRoles}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn vai trò">
                        {formData.roles && formData.roles.length > 0 ? formData.roles[0] : ""}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingRoles ? (
                        <SelectItem value="loading">Đang tải...</SelectItem>
                      ) : rolesResponse?.data && rolesResponse.data.length > 0 ? (
                        rolesResponse.data.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none">Không có dữ liệu</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </TabsContent>
  
          <TabsContent value="bank" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Tên tài khoản ngân hàng</Label>
                <Input
                  id="bankAccount"
                  name="profile.bankAccount"
                  value={formData.profile?.bankAccount || ""}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankNumber">Số tài khoản</Label>
                <Input
                  id="bankNumber"
                  name="profile.bankNumber"
                  value={formData.profile?.bankNumber || ""}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
  
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            {isViewMode ? "Đóng" : "Hủy"}
          </Button>
          {!isViewMode && (
            <Button 
              onClick={handleSave} 
              disabled={isUpdatingProfile || isUpdatingStatus}
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

