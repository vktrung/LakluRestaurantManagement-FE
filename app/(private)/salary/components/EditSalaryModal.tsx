import {
  useUpdateSalaryRateMutation,
  useGetSalaryRatesQuery,
} from '@/features/salary/salaryApiSlice';
import {
  EmployeeSalaryResponse,
  EmployeeSalaryRequest,
} from '@/features/salary/types';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface EditSalaryModalProps {
  salary: EmployeeSalaryResponse;
  onClose: () => void;
}

// Custom dropdown styles
const customDropdownStyles = {
  dropdown: `absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto`,
  option: `px-3 py-2 cursor-pointer hover:bg-gray-100`,
  selected: `bg-gray-100`,
  empty: `px-3 py-2 text-gray-500 italic`,
};

export default function EditSalaryModal({
  salary,
  onClose,
}: EditSalaryModalProps) {
  const [updateSalaryRate] = useUpdateSalaryRateMutation();
  const { data: salaryRatesData, isLoading } = useGetSalaryRatesQuery();
  const salaryRates = salaryRatesData?.data || [];

  const [formData, setFormData] = useState<EmployeeSalaryRequest>({
    levelName: salary.levelName,
    amount: salary.amount,
    type: salary.type,
    isGlobal: salary.isGlobal,
  });

  const [levelNameInput, setLevelNameInput] = useState(salary.levelName);
  const [showOptions, setShowOptions] = useState(false);
  const [filteredRates, setFilteredRates] = useState<any[]>([]);
  const [errors, setErrors] = useState({
    levelName: '',
    amount: '',
  });

  const levelNameRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter rates based on input
  useEffect(() => {
    if (salaryRates.length) {
      let filtered = salaryRates;

      // Exclude current salary from dropdown
      filtered = filtered.filter(rate => rate.id !== salary.id);

      // If there's a levelName input, filter by it
      if (levelNameInput) {
        filtered = filtered.filter(rate =>
          rate.levelName.toLowerCase().includes(levelNameInput.toLowerCase()),
        );
      }

      // If there's an amount, also filter by it
      if (formData.amount > 0) {
        filtered = filtered.filter(rate =>
          rate.amount.toString().includes(formData.amount.toString()),
        );
      }

      setFilteredRates(filtered);
    }
  }, [levelNameInput, formData.amount, salaryRates, salary.id]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        levelNameRef.current &&
        !levelNameRef.current.contains(event.target as Node) &&
        amountRef.current &&
        !amountRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLevelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLevelNameInput(value);
    setFormData(prev => ({ ...prev, levelName: value }));
    setShowOptions(true);

    // Clear error
    if (errors.levelName) {
      setErrors({ ...errors, levelName: '' });
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, amount: Number(value) }));
    setShowOptions(true);

    // Clear error
    if (errors.amount) {
      setErrors({ ...errors, amount: '' });
    }
  };

  const handleSelectRate = (rate: any) => {
    setFormData(prev => ({
      ...prev,
      amount: rate.amount,
      levelName: rate.levelName,
      type: rate.type,
    }));
    setLevelNameInput(rate.levelName);
    setShowOptions(false);

    // Clear any errors
    setErrors({ levelName: '', amount: '' });
  };

  const validate = () => {
    const newErrors = {
      levelName: '',
      amount: '',
    };
    let isValid = true;

    if (!formData.levelName.trim()) {
      newErrors.levelName = 'Tên cấp bậc không được để trống';
      isValid = false;
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Mức lương phải lớn hơn 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await updateSalaryRate({ id: salary.id, body: formData }).unwrap();
      toast.success('Thành công');
      onClose();
    } catch (err: any) {
      let errorMessage = 'Không thể cập nhật mức lương. ';
      if (err?.data?.message) {
        errorMessage += err.data.message;
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa mức lương</DialogTitle>
          <DialogDescription>
            Điều chỉnh thông tin mức lương. Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="levelName">
                Tên cấp bậc <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  ref={levelNameRef}
                  id="levelName"
                  value={levelNameInput}
                  onChange={handleLevelNameChange}
                  onFocus={() => setShowOptions(true)}
                  className={`w-full ${
                    errors.levelName ? 'border-red-500' : ''
                  }`}
                  placeholder="Nhập hoặc chọn tên cấp bậc"
                  required
                />
                {errors.levelName && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.levelName}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">
                Mức lương <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  ref={amountRef}
                  id="amount"
                  type="number"
                  value={formData.amount === 0 ? '' : formData.amount}
                  onChange={handleAmountChange}
                  onFocus={() => setShowOptions(true)}
                  className={`w-full ${errors.amount ? 'border-red-500' : ''}`}
                  placeholder="Nhập hoặc chọn mức lương"
                  required
                />
                {errors.amount && (
                  <div className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.amount}
                  </div>
                )}

                {showOptions && (
                  <div
                    ref={dropdownRef}
                    className={customDropdownStyles.dropdown}
                  >
                    {isLoading ? (
                      <div className={customDropdownStyles.empty}>
                        Đang tải...
                      </div>
                    ) : filteredRates.length > 0 ? (
                      filteredRates.map(rate => (
                        <div
                          key={rate.id}
                          className={`${customDropdownStyles.option} ${
                            formData.amount === rate.amount &&
                            formData.levelName === rate.levelName
                              ? customDropdownStyles.selected
                              : ''
                          }`}
                          onClick={() => handleSelectRate(rate)}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {rate.levelName}
                            </span>
                            <span>
                              {rate.amount.toLocaleString('vi-VN')} VND
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Loại:{' '}
                            {rate.type === 'MONTHLY'
                              ? 'Hàng tháng'
                              : rate.type === 'HOURLY'
                              ? 'Theo giờ'
                              : 'Theo ca'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={customDropdownStyles.empty}>
                        Không có mức lương phù hợp
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Loại lương</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại lương" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Hàng tháng</SelectItem>
                  <SelectItem value="HOURLY">Theo giờ</SelectItem>
                  <SelectItem value="SHIFTLY">Theo ca</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu thay đổi</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
