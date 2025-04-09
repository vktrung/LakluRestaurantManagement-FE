'use client';

import {
  useCreateMenuMutation,
  useUpdateMenuMutation,
} from '@/features/menu/menuApiSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MenuStatus, Menu } from '@/features/menu/types';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const MenuForm = ({
  menu,
  open,
  onOpenChange,
  onClose,
}: {
  menu?: Menu;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}) => {
  const [createMenu, { isLoading: isCreating }] = useCreateMenuMutation();
  const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation();
  const [name, setName] = useState(menu?.name || '');
  const [startAt, setStartAt] = useState<Date | null>(
    menu ? new Date(menu.startAt) : null,
  );
  const [endAt, setEndAt] = useState<Date | null>(
    menu ? new Date(menu.endAt) : null,
  );
  const [status, setStatus] = useState<MenuStatus>(
    menu?.status || MenuStatus.ENABLE,
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState({
    name: '',
    date: '',
  });

  const isLoading = isCreating || isUpdating;

  const validateForm = () => {
    const errors = {
      name: '',
      date: '',
    };
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Tên thực đơn không được để trống';
      isValid = false;
    }

    if (!startAt || !endAt) {
      errors.date = 'Ngày bắt đầu và kết thúc không được để trống';
      isValid = false;
    } else if (endAt < startAt) {
      errors.date = 'Ngày kết thúc phải sau ngày bắt đầu';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    const formattedStartAt = format(startAt!, "yyyy-MM-dd'T'00:00:00");
    const formattedEndAt = format(endAt!, "yyyy-MM-dd'T'23:59:59");

    const updatedMenu = {
      id: menu?.id,
      name,
      startAt: formattedStartAt,
      endAt: formattedEndAt,
      status,
    };

    try {
      if (menu?.id) {
        await updateMenu({ id: menu.id, body: updatedMenu }).unwrap();
      } else {
        await createMenu(updatedMenu).unwrap();
      }

      onOpenChange(false); // Close dialog
      onClose?.(); // Call onClose from parent
    } catch (error: any) {
      console.error('Failed to save menu:', error);

      // Handle API error response
      if (error?.data) {
        const { message, httpStatus, error: errorCode } = error.data;

        if (httpStatus === 400) {
          if (message) {
            setApiError(message);
          } else {
            setApiError(
              'Dữ liệu không hợp lệ. Vui lòng kiểm tra thông tin thực đơn.',
            );
          }
        } else if (httpStatus === 409) {
          setApiError(
            'Thực đơn này đã tồn tại trong khoảng thời gian này. Vui lòng chọn thời gian khác.',
          );
        } else if (message) {
          setApiError(message);
        } else {
          setApiError('Đã xảy ra lỗi khi lưu thực đơn. Vui lòng thử lại sau.');
        }
      } else {
        setApiError(
          'Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.',
        );
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 bg-white shadow-lg rounded-md border border-gray-200">
        <DialogHeader>
          <h2 className="text-xl font-bold mb-4 text-gray-900">
            {menu ? 'Chỉnh sửa Thực Đơn' : 'Thêm Thực Đơn Mới'}
          </h2>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {apiError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label className="text-md font-medium text-gray-800">
              Tên Thực Đơn <span className="text-red-500">*</span>
            </Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={isLoading}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-md font-medium text-gray-800">
                Ngày Bắt Đầu <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                selected={startAt}
                onChange={date => setStartAt(date)}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                placeholderText="Chọn ngày bắt đầu"
                className="w-full p-3 border rounded-md text-center bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-md font-medium text-gray-800">
                Ngày Kết Thúc <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                selected={endAt}
                onChange={date => setEndAt(date)}
                dateFormat="dd/MM/yyyy"
                locale={vi}
                placeholderText="Chọn ngày kết thúc"
                className="w-full p-3 border rounded-md text-center bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:border-gray-600"
                disabled={isLoading}
              />
            </div>
          </div>
          {formErrors.date && (
            <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
          )}

          <div className="space-y-2">
            <Label className="text-md font-medium text-gray-800">
              Trạng Thái
            </Label>
            <Select
              value={status}
              onValueChange={value => setStatus(value as MenuStatus)}
              disabled={isLoading}
            >
              <SelectTrigger className="p-3 border rounded-md w-full bg-gray-100 text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-600">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 rounded-md shadow-lg">
                <SelectItem value={MenuStatus.ENABLE}>Hoạt động</SelectItem>
                <SelectItem value={MenuStatus.DISABLE}>Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-gray-900 text-white px-4 py-2 rounded-md"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : menu ? 'Cập Nhật' : 'Xác Nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
