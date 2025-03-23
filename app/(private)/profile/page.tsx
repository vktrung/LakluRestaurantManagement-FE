"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import UserActivityLog from "./user-activity-log"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  CalendarIcon,
  BriefcaseIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  BanknoteIcon as BankIcon,
  MailIcon,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useGetMyProfileQuery } from "@/features/profile/profileApiSlice"
import ChangePasswordForm from "./components/change-password"

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetMyProfileQuery()

  if (isLoading || !profile) {
    return <div>Đang tải...</div>
  }

  // Định dạng ngày tháng
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa cung cấp"
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Chuyển đổi trạng thái làm việc sang tiếng Việt
  const translateEmploymentStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      WORKING: "Đang làm việc",
      TERMINATED: "Đã nghỉ việc",
      ON_LEAVE: "Đang nghỉ phép",
      SUSPENDED: "Tạm ngưng",
    }

    return statusMap[status] || status
  }

  // Chuyển đổi giới tính sang tiếng Việt
  const translateGender = (gender: string | null) => {
    if (!gender) return "Chưa cung cấp"
    const genderMap: Record<string, string> = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác",
    }
    return genderMap[gender] || gender
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thẻ tổng quan hồ sơ */}
        <Card className="w-full md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle>Hồ sơ cá nhân</CardTitle>
            <CardDescription>Thông tin cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={profile.avatar || ""} alt={profile.username} />
              <AvatarFallback className="text-4xl bg-primary/10">
                {profile.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{profile.fullName || profile.username}</h2>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="mt-6 w-full">
              <Link href="/profile/edit">
                <Button className="w-full">Chỉnh sửa hồ sơ</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Thẻ chi tiết */}
        <Card className="w-full md:w-2/3">
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Thông tin cá nhân và liên hệ của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Thông tin cá nhân */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Tên đăng nhập:</span>
                  <span>{profile.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Họ và tên:</span>
                  <span>{profile.fullName || "Chưa cung cấp"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Giới tính:</span>
                  <span>{translateGender(profile.gender)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Ngày sinh:</span>
                  <span>{profile.dateOfBirth ? formatDate(profile.dateOfBirth) : "Chưa cung cấp"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Số điện thoại:</span>
                  <span>{profile.phoneNumber || "Chưa cung cấp"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Địa chỉ:</span>
                  <span>{profile.address || "Chưa cung cấp"}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin công việc */}
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin công việc</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Vị trí:</span>
                  <span>{profile.department || "Chưa phân công"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Trạng thái:</span>
                  <span>{translateEmploymentStatus(profile.employmentStatus)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Ngày vào làm:</span>
                  <span>{formatDate(profile.hireDate)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin ngân hàng */}
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin ngân hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <BankIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Tên ngân hàng:</span>
                  <span>{profile.bankAccount || "Chưa cung cấp"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BankIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Số tài khoản:</span>
                  <span>{profile.bankNumber || "Chưa cung cấp"}</span>
                </div>
              </div>
            </div>

            {/* Phần hiển thị lịch sử hoạt động và đổi mật khẩu */}
            <div className="grid grid-cols-1 gap-4 mt-4">
              {/* Phần lịch sử hoạt động */}
              <UserActivityLog />
              
              {/* Phần đổi mật khẩu */}
              <div className="mt-4">
                <ChangePasswordForm />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

