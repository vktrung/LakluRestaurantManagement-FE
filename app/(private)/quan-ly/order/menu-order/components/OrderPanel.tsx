import { Button } from '@/components/ui/button';
import { MenuItem, Menu } from '@/features/menu/types';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react'; // Import icons for buttons

const OrderPanel = ({
  
  orderItems,
  onRemoveItem,
  onUpdateQuantity,
  onClose,
  menusData, // Pass menusData to look up full MenuItem

}: {
    orderItems: { menuItemsId: number;  dishId: number; quantity: number; name: string; image: string; price: number }[];
  onRemoveItem: (dishId: number) => void;
  onUpdateQuantity: (dishId: number, quantity: number) => void;
  onClose: () => void;
  menusData: Menu[];
}) => {
  // Tính tổng giá
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  console.log('Order items in panel:', orderItems); // Debug log
  
    function handleClick() {
      console.log('Order items', orderItems);
      console.log(orderItems)// Debug log
    }

  return (
    <div className="h-full border rounded-lg shadow-md p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Đơn hàng của bạn</h2>
        <Button variant="ghost" onClick={onClose} size="sm">
          Đóng
        </Button>
      </div>

      {/* Order Items */}
      <div className="overflow-y-auto h-[calc(100vh-300px)]">
        {orderItems.length > 0 ? (
          <div className="space-y-4">
            {orderItems.map((item) => (
              <div key={item.dishId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString('vi-VN')} VND
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateQuantity(item.dishId, item.quantity - 1)}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateQuantity(item.dishId, item.quantity + 1)}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveItem(item.dishId)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Đơn hàng của bạn đang trống</p>
        )}
      </div>

      {/* Total and Checkout */}
      <div className="border-t pt-4 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Tổng cộng:</span>
          <span className="font-bold text-lg">
            {total.toLocaleString('vi-VN')} VND
          </span>
        </div>
        <Button variant="default" className="w-full bg-green-600 hover:bg-green-700"  onClick={() => handleClick()} >
          Tạo Đơn
        </Button>
      </div>
    </div>
  );
};

export default OrderPanel;
