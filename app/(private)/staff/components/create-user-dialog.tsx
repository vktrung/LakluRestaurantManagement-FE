"use client"

import { useState, useEffect } from "react"
import { Save, X, AlertCircle, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateStaffMutation } from "@/features/staff/staffApiSlice"
import { toast } from "sonner"
import { useGetSalaryRatesQuery, useCreateSalaryRateMutation } from "@/features/salary/salaryApiSlice"
import { useGetRolesQuery } from "@/features/role/roleApiSlice"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SalaryType } from "@/features/salary/types"

interface CreateUserDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Hàm định dạng tiền tệ VND
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

// Hàm biên dịch loại lương
const translateSalaryType = (type: string) => {
  switch (type) {
    case "MONTHLY":
      return "Lương tháng";
    case "HOURLY":
      return "Lương giờ";
    case "SHIFTLY":
      return "Lương ca";
    default:
      return type;
  }
}

// Hàm kiểm tra mật khẩu là PIN 4 số
const isPinFormat = (value: string) => {
  return /^\d{4}$/.test(value);
}

export function CreateUserDialog({ isOpen, onClose, onSuccess }: CreateUserDialogProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    department: "KITCHEN",
    roleIds: [] as number[],
    salaryRateId: 0
  })
  
  const [errors, setErrors] = useState({
    password: ""
  })

  // Thêm state để xử lý lỗi từ API
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // State cho phần tạo mức lương mới
  const [isCreatingSalary, setIsCreatingSalary] = useState(false)
  const [newSalaryData, setNewSalaryData] = useState({
    levelName: "",
    amount: 0,
    type: "MONTHLY" as SalaryType,
    isGlobal: true
  })

  const [createStaff, { isLoading }] = useCreateStaffMutation()
  const { data: salaryRatesResponse, isLoading: isLoadingSalaryRates, refetch: refetchSalaryRates } = useGetSalaryRatesQuery()
  const [createSalaryRate, { isLoading: isCreatingSalaryRate }] = useCreateSalaryRateMutation()
  const { data: rolesResponse, isLoading: isLoadingRoles } = useGetRolesQuery()
  
  // Lấy danh sách chức vụ và vai trò từ API
  const salaryRates = salaryRatesResponse?.data || []
  const roles = rolesResponse?.data || []

  // Thiết lập salaryRateId và roleIds mặc định từ danh sách nếu có
  useEffect(() => {
    const updates: Partial<typeof formData> = {};
    
    if (salaryRates.length > 0 && formData.salaryRateId === 0) {
      updates.salaryRateId = salaryRates[0].id;
    }
    
    if (roles.length > 0 && formData.roleIds.length === 0) {
      updates.roleIds = [roles[0].id];
    }
    
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...updates
      }));
    }
  }, [salaryRates, roles, formData.salaryRateId, formData.roleIds]);

  // Hàm lấy tên hiển thị cho các trường
  const getFieldDisplayName = (field: string): string => {
    switch (field) {
      case 'username':
        return 'Tên đăng nhập';
      case 'password':
        return 'Mật khẩu';
      case 'email':
        return 'Email';
      case 'department':
        return 'Phòng ban';
      case 'salaryRateId':
        return 'Mức lương';
      case 'roleIds':
        return 'Vai trò';
      default:
        return field;
    }
  }

  // Hàm reset lỗi
  const resetErrors = () => {
    setErrors({ password: "" })
    setFormErrors({})
  }

  // Hàm reset form về giá trị mặc định
  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      email: "",
      department: "KITCHEN",
      roleIds: roles.length > 0 ? [roles[0].id] : [],
      salaryRateId: salaryRates.length > 0 ? salaryRates[0].id : 0
    })
    resetErrors()
  }

  // Xử lý khi đóng dialog
  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    
    // Xác thực mật khẩu PIN khi thay đổi
    if (name === 'password') {
      validatePassword(value);
    }

    // Xóa lỗi của trường khi người dùng nhập lại
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const validatePassword = (value: string) => {
    if (!value) {
      setErrors(prev => ({ ...prev, password: "Mật khẩu là bắt buộc" }));
      return false;
    }
    
    if (!isPinFormat(value)) {
      setErrors(prev => ({ ...prev, password: "Mật khẩu phải là 4 chữ số" }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, password: "" }));
    return true;
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === "roleIds") {
      // Xử lý đặc biệt cho roleIds vì cần lưu dưới dạng mảng số nguyên
      setFormData({
        ...formData,
        roleIds: [parseInt(value)],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Xóa lỗi của trường khi người dùng chọn lại
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Xử lý tạo mức lương mới
  const handleNewSalaryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewSalaryData({
      ...newSalaryData,
      [name]: name === 'amount' ? Number(value) : value,
    })
  }

  const handleNewSalaryTypeChange = (value: string) => {
    setNewSalaryData({
      ...newSalaryData,
      type: value as SalaryType,
    })
  }

  const handleCreateSalary = async () => {
    if (!newSalaryData.levelName.trim()) {
      toast.error("Vui lòng nhập tên mức lương", {
        description: "Tên mức lương không được để trống"
      })
      return;
    }

    if (newSalaryData.amount <= 0) {
      toast.error("Vui lòng nhập số tiền lương hợp lệ", {
        description: "Số tiền lương phải lớn hơn 0"
      })
      return;
    }

    try {
      const result = await createSalaryRate(newSalaryData).unwrap();
      toast.success("Đã tạo mức lương mới thành công", {
        description: `Đã thêm mức lương "${newSalaryData.levelName}"`
      })
      
      // Đóng modal và làm mới danh sách lương
      setIsCreatingSalary(false);
      await refetchSalaryRates();
      
      // Nếu tạo thành công và có kết quả trả về, chọn mức lương mới
      if (result.data && result.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          salaryRateId: result.data[0].id
        }));
      }
      
      // Reset form tạo lương
      setNewSalaryData({
        levelName: "",
        amount: 0,
        type: "MONTHLY",
        isGlobal: true
      })
    } catch (error) {
      toast.error("Không thể tạo mức lương mới", {
        description: "Vui lòng thử lại sau"
      })
      console.error("Lỗi khi tạo mức lương:", error)
    }
  }

  const handleSubmit = async () => {
    // Xác thực mật khẩu trước khi gửi
    if (!validatePassword(formData.password)) {
      toast.error("Lỗi xác thực", {
        description: errors.password
      })
      return;
    }
    
    try {
      console.log("Gửi dữ liệu:", formData);
      await createStaff(formData).unwrap()
      toast.success("Thêm người dùng mới thành công", {
        description: `Đã thêm người dùng "${formData.username}" vào hệ thống`
      })
      onSuccess?.()
      handleClose()
    } catch (error: any) {
      console.error("Lỗi khi tạo người dùng:", error)
      
      // Xử lý lỗi từ API
      if (error?.data) {
        const errorData = error.data
        
        // Xử lý lỗi trường cụ thể nếu có
        if (errorData?.error && typeof errorData.error === 'object') {
          // Lưu lỗi vào state để có thể tô đỏ các trường bị lỗi
          setFormErrors(errorData.error)
          
          // Hiển thị tất cả các lỗi qua toast
          const errorMessages = Object.entries(errorData.error)
            .map(([field, message]) => {
              // Tạo thông báo lỗi có định dạng rõ ràng hơn
              const fieldName = getFieldDisplayName(field);
              return `${fieldName}: ${String(message)}`;
            })
            .join('\n');
          
          toast.error("Không thể tạo người dùng", {
            description: errorMessages
          })
        } else {
          // Hiển thị thông báo lỗi chung nếu không phải lỗi theo trường
          toast.error("Lỗi hệ thống", {
            description: errorData.message || "Không thể thêm người dùng. Vui lòng thử lại."
          })
        }
      } else {
        // Hiển thị thông báo lỗi mặc định
        toast.error("Lỗi kết nối", {
          description: "Không thể thêm người dùng. Vui lòng thử lại sau."
        })
      }
    }
  }

  const isFormValid = 
    formData.username &&
    formData.password &&
    isPinFormat(formData.password) &&
    formData.email &&
    formData.roleIds.length > 0 &&
    formData.salaryRateId > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo tài khoản người dùng mới trong hệ thống.
          </DialogDescription>
        </DialogHeader>
        
        {Object.keys(formErrors).length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside">
                {Object.entries(formErrors).map(([field, error]) => (
                  <li key={field}>{getFieldDisplayName(field)}: {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleInputChange}
                className={formErrors.username ? "border-red-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu (Mã PIN 4 chữ số)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mã PIN 4 chữ số"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password || formErrors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Nhập địa chỉ email"
              value={formData.email}
              onChange={handleInputChange}
              className={formErrors.email ? "border-red-500" : ""}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Phòng ban</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger id="department" className={formErrors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASHIER">Thu ngân</SelectItem>
                  <SelectItem value="KITCHEN">Nhà bếp</SelectItem>
                  <SelectItem value="MANAGER">Quản lý</SelectItem>
                  <SelectItem value="SERVICE">Phục vụ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roles">Vai trò</Label>
              <Select
                value={formData.roleIds.length > 0 ? formData.roleIds[0].toString() : ""}
                onValueChange={(value) => handleSelectChange("roleIds", value)}
              >
                <SelectTrigger id="roles" className={formErrors.roleIds ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRoles ? (
                    <div className="p-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </div>
                  ) : roles.length === 0 ? (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      Không có vai trò nào
                    </div>
                  ) : (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="salaryRate">Mức lương</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setIsCreatingSalary(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Thêm mức lương
              </Button>
            </div>
            
            <Select
              value={formData.salaryRateId.toString()}
              onValueChange={(value) => handleSelectChange("salaryRateId", value)}
            >
              <SelectTrigger id="salaryRate" className={formErrors.salaryRateId ? "border-red-500" : ""}>
                <SelectValue placeholder="Chọn mức lương" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingSalaryRates ? (
                  <div className="p-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </div>
                ) : salaryRates.length === 0 ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    Không có mức lương nào
                  </div>
                ) : (
                  salaryRates.map((rate) => (
                    <SelectItem key={rate.id} value={rate.id.toString()}>
                      {rate.levelName} - {formatCurrency(rate.amount)} / {translateSalaryType(rate.type)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Đang tạo...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Tạo người dùng
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Dialog tạo mức lương mới */}
      {isCreatingSalary && (
        <Dialog open={isCreatingSalary} onOpenChange={setIsCreatingSalary}>
          <DialogContent className="max-w-[90vw] sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Thêm mức lương mới</DialogTitle>
              <DialogDescription>
                Tạo mức lương mới để áp dụng cho nhân viên.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="levelName">Tên mức lương</Label>
                <Input
                  id="levelName"
                  name="levelName"
                  placeholder="Ví dụ: Lương cơ bản, Lương quản lý, ..."
                  value={newSalaryData.levelName}
                  onChange={handleNewSalaryInputChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Số tiền</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Nhập số tiền lương"
                    value={newSalaryData.amount.toString()}
                    onChange={handleNewSalaryInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Loại lương</Label>
                  <Select
                    value={newSalaryData.type}
                    onValueChange={handleNewSalaryTypeChange}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Chọn loại lương" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Lương tháng</SelectItem>
                      <SelectItem value="HOURLY">Lương giờ</SelectItem>
                      <SelectItem value="SHIFTLY">Lương ca</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsCreatingSalary(false)}>
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
              <Button onClick={handleCreateSalary} disabled={isCreatingSalaryRate}>
                {isCreatingSalaryRate ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Tạo mức lương
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
} 