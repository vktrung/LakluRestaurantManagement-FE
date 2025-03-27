'use client';

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useGetOrdersQuery } from '@/features/order-cashier/orderCashierApiSlice';
import type { Order } from '@/features/order-cashier/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import OrderTable from './OrderTable';
import {
  CalendarIcon,
  FilterIcon,
  ArrowDownAZ,
  ArrowUpAZ,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Định nghĩa kiểu cho status
type Status = 'all' | 'Đang chờ' | 'Đã xác nhận' | 'Đã hoàn thành' | 'Đã hủy';

// Ánh xạ giữa statusLabel (tiếng Việt) và status (tiếng Anh) để gọi API
const statusMapping: Record<Exclude<Status, 'all'>, string> = {
  'Đang chờ': 'Đang chờ',
  'Đã xác nhận': 'Đã xác nhận',
  'Đã hoàn thành': 'Đã hoàn thành',
  'Đã hủy': 'Đã hủy',
};

// Định nghĩa các trạng thái từ enum OrderStatus
const orderStatuses: { value: Status; label: string; color: string }[] = [
  {
    value: 'all',
    label: 'Tất cả',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  {
    value: 'Đang chờ',
    label: 'Đang chờ',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  {
    value: 'Đã xác nhận',
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    value: 'Đã hoàn thành',
    label: 'Đã hoàn thành',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    value: 'Đã hủy',
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
];

// Định nghĩa các tùy chọn cho sort
const sortOptions = [
  {
    value: 'desc',
    label: 'Giảm dần (Mặc định)',
    icon: <ArrowDownAZ className="mr-2 h-4 w-4" />,
  },
  {
    value: 'asc',
    label: 'Tăng dần',
    icon: <ArrowUpAZ className="mr-2 h-4 w-4" />,
  },
];

const OrderList = () => {
  // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Ví dụ: "2025-03-20"
  };

  // State cho các tham số
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(getCurrentDate()); // Mặc định là ngày hiện tại
  const [status, setStatus] = useState<Status>('all'); // Mặc định là "Tất cả" (giá trị "all")
  const [sort, setSort] = useState('desc'); // Mặc định là desc

  // Tự động đặt lại status về "Tất cả" khi date hoặc sort thay đổi
  useEffect(() => {
    setStatus('all'); // Đặt lại status về "Tất cả"
  }, [date, sort]);

  // Hàm xử lý thay đổi trạng thái
  const handleStatusChange = (value: string) => {
    const validStatuses: Status[] = [
      'all',
      'Đang chờ',
      'Đã xác nhận',
      'Đã hoàn thành',
      'Đã hủy',
    ];
    if (validStatuses.includes(value as Status)) {
      setStatus(value as Status);
    }
  };

  // Gọi API với các tham số
  const { data, isLoading, error } = useGetOrdersQuery(
    {
      date,
      status: status === 'all' ? undefined : statusMapping[status],
      sort,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const orders = data?.data || [];

  // Lọc danh sách đơn hàng theo searchTerm và status
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order: Order) =>
        order.id.toString().includes(searchTerm.toLowerCase()) &&
        (status === 'all' || order.statusLabel === status), // So sánh với statusLabel (tiếng Việt)
    );
  }, [orders, searchTerm, status]);
  console.log('Filtered Orders in OrderList:', filteredOrders);
  // Hàm xử lý tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Kiểm tra trạng thái tải và lỗi
  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center items-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8 flex justify-center items-center min-h-[300px] text-destructive">
        <div className="flex flex-col items-center gap-2">
          <p className="font-medium">Không thể tải danh sách đơn hàng</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  // Lấy màu cho badge trạng thái
  const getStatusColor = (statusValue: string) => {
    const status = orderStatuses.find(s => s.value === statusValue);
    return status?.color || '';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Tiêu đề và thông tin tổng quan */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Quản Lý Thông Tin Đơn Hàng
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và theo dõi trạng thái đơn hàng
          </p>
        </div>

        <Badge variant="outline" className={getStatusColor(status)}>
          {orderStatuses.find(s => s.value === status)?.label ||
            'Tất cả trạng thái'}
        </Badge>
      </div>

      <Separator />

      <Card className="w-full border shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-semibold">Bộ lọc đơn hàng</h2>

            {/* Bộ lọc và tìm kiếm */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bộ lọc ngày */}
              <div className="space-y-2">
                <Label
                  htmlFor="date"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Ngày
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Bộ lọc trạng thái */}
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <FilterIcon className="h-4 w-4" />
                  Trạng thái
                </Label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map(statusOption => (
                      <SelectItem
                        key={statusOption.value}
                        value={statusOption.value}
                      >
                        <div className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-2 ${
                              statusOption.color.split(' ')[0]
                            }`}
                          ></span>
                          {statusOption.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bộ lọc sắp xếp */}
              <div className="space-y-2">
                <Label htmlFor="sort" className="text-sm font-medium">
                  Sắp xếp
                </Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger id="sort" className="w-full">
                    <SelectValue placeholder="Chọn kiểu sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(sortOption => (
                      <SelectItem
                        key={sortOption.value}
                        value={sortOption.value}
                      >
                        <div className="flex items-center">
                          {sortOption.icon}
                          {sortOption.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ô tìm kiếm */}
              <div className="space-y-2">
                <Label
                  htmlFor="search"
                  className="text-sm font-medium flex items-center gap-1"
                >
                  <Search className="h-4 w-4" />
                  Tìm kiếm
                </Label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Tìm theo mã đơn hàng"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {filteredOrders.length} đơn hàng
                </p>
                {/* Bỏ nút Làm mới */}
              </div>
              <OrderTable orders={filteredOrders} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderList;
