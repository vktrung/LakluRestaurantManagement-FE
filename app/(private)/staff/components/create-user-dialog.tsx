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
    setFormData({
      ...formData,
      [name]: value,
    })

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm người dùng mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin để tạo tài khoản mới cho người dùng trong hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Tên đăng nhập
            </Label>
            <div className="col-span-3">
              <Input
                id="username"
                name="username"
                placeholder="Nhập tên đăng nhập"
                className={formErrors.username ? "border-red-500" : ""}
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Mật khẩu (PIN)
            </Label>
            <div className="col-span-3">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mã PIN 4 số"
                maxLength={4}
                className={formErrors.password || errors.password ? "border-red-500" : ""}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <div className="col-span-3">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email"
                className={formErrors.email ? "border-red-500" : ""}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">
              Phòng ban
            </Label>
            <div className="col-span-3">
              <Select 
                value={formData.department} 
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger className={formErrors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KITCHEN">Bếp</SelectItem>
                  <SelectItem value="SERVICE">Phục vụ</SelectItem>
                  <SelectItem value="MANAGER">Quản lý</SelectItem>
                  <SelectItem value="CASHIER">Thu Ngân</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="salaryRateId" className="text-right">
              Mức lương
            </Label>
            {isLoadingSalaryRates ? (
              <Skeleton className="h-10 col-span-3" />
            ) : (
              <div className="col-span-3">
                <div className="flex w-full items-center">
                  <div className="flex-1">
                    <Select 
                      value={formData.salaryRateId ? formData.salaryRateId.toString() : ""} 
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          salaryRateId: parseInt(value)
                        })
                        
                        // Xóa lỗi khi người dùng chọn lại
                        if (formErrors.salaryRateId) {
                          setFormErrors(prev => {
                            const newErrors = { ...prev }
                            delete newErrors.salaryRateId
                            return newErrors
                          })
                        }
                      }}
                      disabled={salaryRates.length === 0}
                    >
                      <SelectTrigger className={formErrors.salaryRateId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Chọn mức lương" />
                      </SelectTrigger>
                      <SelectContent>
                        {salaryRates.length > 0 ? (
                          salaryRates.map((rate) => (
                            <SelectItem key={rate.id} value={rate.id.toString()}>
                              {rate.levelName} - {formatCurrency(rate.amount)} ({translateSalaryType(rate.type)})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            Không có dữ liệu về mức lương
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="ml-2"
                    onClick={() => setIsCreatingSalary(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Modal thêm mức lương mới */}
                {isCreatingSalary && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Thêm mức lương mới</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsCreatingSalary(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="levelName">Tên mức lương</Label>
                          <Input
                            id="levelName"
                            name="levelName"
                            placeholder="Ví dụ: Cấp 1, Senior, Junior..."
                            value={newSalaryData.levelName}
                            onChange={handleNewSalaryInputChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="amount">Số tiền</Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            placeholder="Nhập số tiền..."
                            value={newSalaryData.amount || ''}
                            onChange={handleNewSalaryInputChange}
                            min="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="type">Loại lương</Label>
                          <Select 
                            value={newSalaryData.type} 
                            onValueChange={handleNewSalaryTypeChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại lương" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONTHLY">Theo tháng</SelectItem>
                              <SelectItem value="HOURLY">Theo giờ</SelectItem>
                              <SelectItem value="SHIFTLY">Theo ca</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsCreatingSalary(false)}
                          >
                            Hủy
                          </Button>
                          <Button 
                            onClick={handleCreateSalary}
                            disabled={isCreatingSalaryRate}
                          >
                            {isCreatingSalaryRate ? "Đang lưu..." : "Lưu mức lương"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Vai trò
            </Label>
            {isLoadingRoles ? (
              <Skeleton className="h-10 col-span-3" />
            ) : (
              <div className="col-span-3">
                <Select 
                  value={formData.roleIds.length > 0 ? formData.roleIds[0].toString() : ""} 
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      roleIds: [parseInt(value)]
                    })
                    
                    // Xóa lỗi khi người dùng chọn lại
                    if (formErrors.roleIds) {
                      setFormErrors(prev => {
                        const newErrors = { ...prev }
                        delete newErrors.roleIds
                        return newErrors
                      })
                    }
                  }}
                  disabled={roles.length === 0}
                >
                  <SelectTrigger className={formErrors.roleIds ? "border-red-500" : ""}>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Không có dữ liệu về vai trò
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              isLoading || 
              isLoadingSalaryRates || 
              isLoadingRoles || 
              !isFormValid
            }
          >
            {isLoading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin">⌛</span>
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tạo người dùng
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 