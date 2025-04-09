import { useState } from 'react';
import { EmployeeSalaryRequest } from '@/features/salary/types';

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
        [target.name]: target.value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      <div className="mb-4">
        <label className="block mb-1">Tên Cấp Bậc</label>
        <input
          type="text"
          name="levelName"
          value={formData.levelName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Lương</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Loại</label>
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
        <button
          type="button"
          onClick={onCancel}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Lưu
        </button>
      </div>
    </form>
  );
}
