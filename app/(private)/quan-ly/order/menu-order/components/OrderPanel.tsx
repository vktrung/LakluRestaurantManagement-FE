'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useCreateOrderMutation } from '@/features/order/orderApiSlice';
import { CreateOrderRequest } from '@/features/order/types';
import { Menu } from '@/features/menu/types';

interface OrderItem {
  menuItemsId: number;
  dishId: number;
  quantity: number;
  name: string;
  image: string;
  price: number;
  category?: string;
}

const OrderPanel = ({
  orderItems,
  onRemoveItem,
  onUpdateQuantity,
  onClose,
  reservationId,
  menusData,
}: {
  orderItems: OrderItem[];
  onRemoveItem: (menuItemsId: number) => void;
  onUpdateQuantity: (menuItemsId: number, quantity: number) => void;
  onClose: () => void;
  reservationId: number;
  menusData?: Menu[];
}) => {
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const router = useRouter();

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Đơn hàng trống. Vui lòng thêm món trước khi tạo đơn.', {
        position: 'top-right',
      });
      return;
    }

    const orderData: CreateOrderRequest = {
      reservationId,
      orderItems: orderItems.map((item) => ({
        menuItemId: item.menuItemsId,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await createOrder(orderData).unwrap();
      toast.success('Đơn hàng đã được tạo thành công!', {
        position: 'top-right',
      });
      console.log('Order created successfully:', response);
      router.push(`/quan-ly/order/${reservationId}`);
      onClose();
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.', {
        position: 'top-right',
      });
    }
  };

  return (
    <div className="min-h-screen sm:h-full sm:border sm:rounded-lg sm:shadow-md p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white relative">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-xl font-semibold">Đơn hàng của bạn</h2>
        <Button
          variant="ghost"
          onClick={onClose}
          size="sm"
          className="h-8 sm:h-9 text-xs sm:text-sm"
        >
          Đóng
        </Button>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-250px)] sm:h-[calc(100vh-300px)]">
        {orderItems.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {orderItems.map((item) => (
              <div
                key={item.menuItemsId}
                className="flex items-center justify-between p-2 sm:p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    className="w-10 sm:w-12 h-10 sm:h-12 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-sm sm:text-base">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.price.toLocaleString('vi-VN')} VND
                    </p>
                    {item.category && (
                      <Badge variant="secondary" className="mt-1 text-xs sm:text-sm">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item.menuItemsId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-7 sm:h-8 w-7 sm:w-8 rounded-r-none border-r-0"
                      aria-label={`Giảm số lượng của ${item.name}`}
                    >
                      <MinusCircle className="h-3 sm:h-4 w-3 sm:w-4" />
                    </Button>
                    <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onUpdateQuantity(item.menuItemsId, item.quantity + 1)}
                      className="h-7 sm:h-8 w-7 sm:w-8 rounded-l-none border-l-0"
                      aria-label={`Tăng số lượng của ${item.name}`}
                    >
                      <PlusCircle className="h-3 sm:h-4 w-3 sm:w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.menuItemsId)}
                    className="h-7 sm:h-8 w-7 sm:w-8"
                    aria-label={`Xóa ${item.name} khỏi đơn hàng`}
                  >
                    <Trash2 className="h-3 sm:h-4 w-3 sm:w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm sm:text-base">
            Đơn hàng của bạn đang trống
          </p>
        )}
      </div>

      <div className="border-t pt-3 sm:pt-4 mt-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <span className="font-semibold text-sm sm:text-base">Tổng cộng:</span>
          <span className="font-bold text-base sm:text-lg">
            {total.toLocaleString('vi-VN')} VND
          </span>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <Button
            variant="default"
            className="w-full h-8 sm:h-10 text-xs sm:text-sm bg-green-600 hover:bg-green-700 z-10 relative"
            onClick={handleCreateOrder}
            disabled={isCreatingOrder || orderItems.length === 0}
          >
            {isCreatingOrder ? 'Đang tạo...' : 'Tạo Đơn'}
          </Button>
          <Button
            variant="outline"
            className="w-full h-8 sm:h-10 text-xs sm:text-sm sm:hidden"
            onClick={onClose}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm món
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;