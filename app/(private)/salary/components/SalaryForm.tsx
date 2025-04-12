import { useState, useEffect, useRef } from 'react';
import { EmployeeSalaryRequest } from '@/features/salary/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetSalaryRatesQuery } from '@/features/salary/salaryApiSlice';

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

  // Lấy danh sách mức lương hiện có từ API
  const { data: salaryRatesData, isLoading } = useGetSalaryRatesQuery();
  const salaryRates = salaryRatesData?.data || [];

  const [showOptions, setShowOptions] = useState(false);
  const [filteredRates, setFilteredRates] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter rates based on input amount
  useEffect(() => {
    if (salaryRates.length) {
      // If there's an amount, filter rates close to that amount
      if (formData.amount > 0) {
        const filtered = salaryRates.filter(rate =>
          rate.amount.toString().includes(formData.amount.toString()),
        );
        setFilteredRates(filtered);
      } else {
        // Otherwise show all rates
        setFilteredRates(salaryRates);
      }
    }
  }, [formData.amount, salaryRates]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
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
  };

  const handleSelectRate = (rate: any) => {
    setFormData(prev => ({
      ...prev,
      amount: rate.amount,
      // Optionally pre-fill the level name if it's empty
      levelName: prev.levelName || rate.levelName,
    }));
    setShowOptions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white rounded shadow space-y-4"
    >
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Tên Cấp Bậc
        </label>
        <Input
          type="text"
          name="levelName"
          value={formData.levelName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Lương
        </label>
        <div className="relative">
          <Input
            ref={inputRef}
            type="number"
            name="amount"
            value={formData.amount === 0 ? '' : formData.amount}
            onChange={handleChange}
            onFocus={() => setShowOptions(true)}
            className="w-full p-2 border rounded"
            required
          />

          {showOptions && (
            <div ref={dropdownRef} className={customDropdownStyles.dropdown}>
              {isLoading ? (
                <div className={customDropdownStyles.empty}>Đang tải...</div>
              ) : filteredRates.length > 0 ? (
                filteredRates.map(rate => (
                  <div
                    key={rate.id}
                    className={`${customDropdownStyles.option} ${
                      formData.amount === rate.amount
                        ? customDropdownStyles.selected
                        : ''
                    }`}
                    onClick={() => handleSelectRate(rate)}
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {rate.amount.toLocaleString('vi-VN')} VND
                      </span>
                      <span className="text-gray-500">({rate.levelName})</span>
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
