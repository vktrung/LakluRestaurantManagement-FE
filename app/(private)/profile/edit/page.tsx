"use client"

import { useEffect, useState, useRef } from "react"
import type React from "react"
import { useUpdateProfileMutation, useGetMyProfileQuery, useUploadAvatarMutation } from "@/features/profile/profileApiSlice"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Profile } from "@/features/profile/types"
import * as z from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

// Schema validation
const profileSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên").max(100, "Họ và tên không được quá 100 ký tự"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable(),
  dateOfBirth: z.string().nullable().refine((date) => {
    if (!date) return true
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 16 && age <= 100
  }, "Tuổi phải từ 16 đến 100"),
  phoneNumber: z.string().nullable().refine((phone) => {
    if (!phone) return true
    return /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone)
  }, "Số điện thoại không hợp lệ"),
  address: z.string().nullable(),
  bankAccount: z.string().nullable(),
  bankNumber: z.string().nullable().refine((number) => {
    if (!number) return true
    return /^[0-9]{8,20}$/.test(number)
  }, "Số tài khoản phải từ 8-20 số"),
})

export default function EditProfilePage() {
  const router = useRouter()
  const [banks, setBanks] = useState<Bank[]>([])
  const { data: profile, isLoading: isLoadingProfile } = useGetMyProfileQuery()
  const [formData, setFormData] = useState<Profile | null>(null)
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation()
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profile) {
      setFormData(profile)
    }
  }, [profile])

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch('https://api.vietqr.io/v2/banks')
        const data = await response.json()
        setBanks(data.data)
      } catch (error) {
        console.error('Lỗi khi tải danh sách ngân hàng:', error)
      }
    }

    fetchBanks()
  }, [])

  if (isLoadingProfile || !formData) {
    return <div>Đang tải...</div>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => {
      if (!prev) return null
      return {
        ...prev,
        [id]: value
      }
    })
    // Clear error when user types
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[id]
        return newErrors
      })
    }
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => {
      if (!prev) return null
      return {
        ...prev,
        [field]: value
      }
    })
    // Clear error when user selects
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Định dạng ngày tháng cho input
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString().split("T")[0]
  }

  // Format ngày tháng cho API
  const formatDateForApi = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toISOString()
  }

  const validateForm = () => {
    try {
      profileSchema.parse({
        fullName: formData.fullName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        bankAccount: formData.bankAccount,
        bankNumber: formData.bankNumber,
      })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin")
      return
    }

    try {
      await updateProfile({
        id: formData.id,
        body: {
          fullName: formData.fullName,
          gender: formData.gender,
          dateOfBirth: formatDateForApi(formData.dateOfBirth),
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          bankAccount: formData.bankAccount,
          bankNumber: formData.bankNumber,
        }
      }).unwrap()
      
      toast.success("Cập nhật thông tin thành công")
      router.push("/profile")
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin")
    }
  }

  // Xử lý khi nhấn nút hủy
  const handleCancel = () => {
    router.push("/profile")
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra định dạng file
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error(`Định dạng file không hợp lệ: ${file.type}. Chỉ chấp nhận JPEG, PNG, GIF.`)
      return
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Kích thước file (${(file.size / (1024 * 1024)).toFixed(2)}MB) vượt quá giới hạn 5MB`)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      await uploadAvatar(formData).unwrap()
      toast.success('Cập nhật ảnh đại diện thành công')
    } catch (error: any) {
      console.error('Upload error:', error)
      const errorMessage = error?.data?.message || 'Có lỗi xảy ra khi tải ảnh lên'
      toast.error(errorMessage)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
            <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ảnh đại diện */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative" onClick={handleAvatarClick}>
                <Avatar className="h-24 w-24 cursor-pointer border-2 border-primary/10">
                  <AvatarImage src={formData?.avatar || ""} alt={formData?.username} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {formData?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-full text-white cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <p className="text-sm text-muted-foreground">Nhấp vào ảnh để thay đổi ảnh đại diện (tối đa 5MB)</p>
            </div>

            <Separator />

            {/* Thông tin cá nhân */}
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Tên đăng nhập</Label>
                  <Input id="username" value={formData.username} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ và tên
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input 
                    id="fullName" 
                    value={formData.fullName || ""} 
                    onChange={handleInputChange}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select 
                    value={formData.gender || ""} 
                    onValueChange={(value) => handleSelectChange("gender", value)}
                  >
                    <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth ? formatDateForInput(formData.dateOfBirth) : ""}
                    onChange={handleInputChange}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Số điện thoại</Label>
                  <Input 
                    id="phoneNumber" 
                    value={formData.phoneNumber || ""} 
                    onChange={handleInputChange}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Textarea 
                    id="address" 
                    value={formData.address || ""} 
                    onChange={handleInputChange}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Thông tin ngân hàng */}
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin ngân hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Ngân hàng</Label>
                  <Select 
                    value={formData.bankAccount || ""} 
                    onValueChange={(value) => handleSelectChange("bankAccount", value)}
                  >
                    <SelectTrigger className={errors.bankAccount ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn ngân hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank.id} value={bank.code}>
                          <div className="flex items-center gap-2">
                            <img src={bank.logo} alt={bank.shortName} className="w-6 h-6" />
                            <span>{bank.shortName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bankAccount && (
                    <p className="text-sm text-red-500">{errors.bankAccount}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankNumber">Số tài khoản</Label>
                  <Input 
                    id="bankNumber" 
                    value={formData.bankNumber || ""} 
                    onChange={handleInputChange}
                    className={errors.bankNumber ? "border-red-500" : ""}
                  />
                  {errors.bankNumber && (
                    <p className="text-sm text-red-500">{errors.bankNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}