import { useState, useEffect, useRef } from 'react';
import { EmployeeSalaryRequest } from '@/features/salary/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetSalaryRatesQuery } from '@/features/salary/salaryApiSlice';
import { AlertCircle } from 'lucide-react';

// Custom dropdown styles
const customDropdownStyles = {
  dropdown: `absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto`,
  option: `px-3 py-2 cursor-pointer hover:bg-gray-100`,
  selected: `bg-gray-100`,
  empty: `px-3 py-2 text-gray-500 italic`,
};

interface SalaryFormProps {
  initialData?: EmployeeSalaryRequest;
  onSubmit: (data: EmployeeSalaryRequest) => void;
  onCancel: () => void;
}

export default function SalaryForm({
  initialData,
  onSubmit,
  onCancel,
}: SalaryFormProps) {
  const [formData, setFormData] = useState<EmployeeSalaryRequest>(
    initialData || {
      levelName: '',
      amount: 0,
      type: 'MONTHLY',
      isGlobal: false,
    },
  );
  const [errors, setErrors] = useState({
    levelName: '',
    amount: '',
  });

  // Lấy danh sách mức lương hiện có từ API
  const { data: salaryRatesData, isLoading } = useGetSalaryRatesQuery();
  const salaryRates = salaryRatesData?.data || [];

  const [showOptions, setShowOptions] = useState(false);
  const [levelNameInput, setLevelNameInput] = useState(
    initialData?.levelName || '',
  );
  const [filteredRates, setFilteredRates] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const levelNameRef = useRef<HTMLInputElement>(null);

  // Initialize levelNameInput when initialData changes
  useEffect(() => {
    if (initialData?.levelName) {
      setLevelNameInput(initialData.levelName);
    }
  }, [initialData]);

  // Filter rates based on input
  useEffect(() => {
    if (salaryRates.length) {
      let filtered = salaryRates;

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
  }, [levelNameInput, formData.amount, salaryRates]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        levelNameRef.current &&
        !levelNameRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;

    if (target.type === 'checkbox') {
      const input = target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [input.name]: input.checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [target.name]:
          target.name === 'amount' ? Number(target.value) : target.value,
      }));
    }

    // Clear the error for this field if it exists
    if (errors[target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [target.name]: '',
      });
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded shadow space-y-4"
    >
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Tên Cấp Bậc <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            ref={levelNameRef}
            type="text"
            name="levelName"
            value={levelNameInput}
            onChange={handleLevelNameChange}
            onFocus={() => setShowOptions(true)}
            className={`w-full p-2 border rounded ${
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

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Lương <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            ref={inputRef}
            type="number"
            name="amount"
            value={formData.amount === 0 ? '' : formData.amount}
            onChange={handleAmountChange}
            onFocus={() => setShowOptions(true)}
            className={`w-full p-2 border rounded ${
              errors.amount ? 'border-red-500' : ''
            }`}
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
            <div ref={dropdownRef} className={customDropdownStyles.dropdown}>
              {isLoading ? (
                <div className={customDropdownStyles.empty}>Đang tải...</div>
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
                      <span className="font-medium">{rate.levelName}</span>
                      <span>{rate.amount.toLocaleString('vi-VN')} VND</span>
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

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Loại
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="MONTHLY">Hàng Tháng</option>
          <option value="HOURLY">Theo Giờ</option>
          <option value="SHIFTLY">Theo Ca</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Hủy
        </Button>
        <Button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {initialData ? 'Cập Nhật' : 'Thêm'}
        </Button>
      </div>
    </form>
  );
}
