"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, Save, X } from "lucide-react"
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
import { cn } from "@/lib/utils"

interface UserDialogProps {
  user: any
  mode: "view" | "edit" | "add"
  isOpen: boolean
  onClose: () => void
}

export function UserDialog({ user, mode, isOpen, onClose }: UserDialogProps) {
    const [formData, setFormData] = useState(
      user || {
        username: "",
        email: "",
        roles: [],
        nameSalaryRate: "",
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
          salary: "",
        },
      },
    )
  
    const [activeTab, setActiveTab] = useState("info")
    const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
      user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : undefined,
    )
    const [hireDate, setHireDate] = useState<Date | undefined>(
      user?.profile?.hireDate ? new Date(user.profile.hireDate) : undefined,
    )
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      if (name.includes(".")) {
        const [parent, child] = name.split(".")
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value,
          },
        })
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
        setFormData({
          ...formData,
          [parent]: {
            ...formData[parent],
            [child]: value,
          },
        })
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
  
    const handleSave = () => {
      // Here you would typically send the data to your API
      console.log("Saving user data:", formData)
      onClose()
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
        case "ON_LEAVE":
          return "Nghỉ phép"
        case "TERMINATED":
          return "Đã nghỉ việc"
        default:
          return status
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
              <AvatarImage src={user?.profile?.avatar || undefined} alt={formData.profile?.fullName || "User"} />
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
                    disabled={isViewMode}
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
                  <Input
                    id="department"
                    name="profile.department"
                    value={formData.profile?.department || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameSalaryRate">Chức vụ</Label>
                  <Input
                    id="nameSalaryRate"
                    name="nameSalaryRate"
                    value={formData.nameSalaryRate || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Mức lương</Label>
                  <Input
                    id="salary"
                    name="profile.salary"
                    value={formData.profile?.salary || ""}
                    onChange={handleInputChange}
                    disabled={isViewMode}
                  />
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
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WORKING">Đang làm việc</SelectItem>
                        <SelectItem value="ON_LEAVE">Nghỉ phép</SelectItem>
                        <SelectItem value="TERMINATED">Đã nghỉ việc</SelectItem>
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
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Quản trị viên hệ thống">Quản trị viên hệ thống</SelectItem>
                        <SelectItem value="Nhân viên">Nhân viên</SelectItem>
                        <SelectItem value="Quản lý">Quản lý</SelectItem>
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
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Lưu
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

