import { useState } from 'react';
import { EmployeeSalaryRequest } from '@/features/salary/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGetSalaryRatesQuery } from '@/features/salary/salaryApiSlice';

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
        [target.name]: target.name === 'amount' ? Number(target.value) : target.value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-4">
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
        <Input
          type="number"
          name="amount"
          value={formData.amount === 0 ? '' : formData.amount}
          onChange={handleChange}
          list="salary-amounts"
          className="w-full p-2 border rounded"
          required
        />
        <datalist id="salary-amounts">
          {isLoading ? (
            <option value="" disabled>
              Đang tải...
            </option>
          ) : (
            salaryRates.map(salary => (
              <option key={salary.id} value={salary.amount}>
                {salary.amount} ({salary.levelName})
              </option>
            ))
          )}
        </datalist>
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
          {initialData ? 'Cập Nhật' : 'Thêm'} {/* Thay đổi nhãn nút dựa trên mode */}
        </Button>
      </div>
    </form>
  );
}