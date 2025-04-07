// OrderPanel.tsx
'use client';
import { useRouter } from "next/navigation"; // For navigation after order creation
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { useCreateOrderMutation } from "@/features/order/orderApiSlice"; // Import the mutation hook
import { CreateOrderRequest, CreateOrderTableRequest } from "@/features/order/types"; // Import the request type

const OrderPanel = ({
  orderItems,
  onRemoveItem,
  onUpdateQuantity,
  onClose,
  menusData, // Keep menusData if still needed
}: {
  orderItems: { menuItemsId: number; dishId: number; quantity: number; name: string; image: string; price: number }[];
  onRemoveItem: (dishId: number) => void;
  onUpdateQuantity: (dishId: number, quantity: number) => void;
  onClose: () => void;
  menusData?: any[]; // Optional prop, keep if used elsewhere
}) => {
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation(); // Hook for creating an order
  const router = useRouter(); // For navigation after order creation

  // Calculate total price
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle order creation
  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Đơn hàng trống. Vui lòng thêm món trước khi tạo đơn.", {
        position: "top-right",
      });
      return;
    }

    // Transform orderItems to match CreateOrderRequest format
    const orderData: CreateOrderTableRequest = {
      // reservationId removed; adjust based on your API requirements
      orderItems: orderItems.map((item) => ({
        menuItemId: item.menuItemsId,
        quantity: item.quantity,
      })),
    };

    try {
     
      toast.success("Đơn hàng đã được tạo thành công!", {
        position: "top-right",
      });
      

      // Reset order or close panel
      onClose();

      // Optionally navigate to a generic page (e.g., order confirmation)
      // router.push('/order-confirmation'); // Adjust based on your app's routing
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.", {
        position: "top-right",
      });
    }
  };

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
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateQuantity(item.dishId, item.quantity - 1)}
                    disabled={item.quantity <= 1} // Prevent quantity from going below 1
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
            {total.toLocaleString("vi-VN")} VND
          </span>
        </div>
        <Button
          variant="default"
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleCreateOrder}
          disabled={isCreatingOrder || orderItems.length === 0} // Disable while creating or if no items
        >
          {isCreatingOrder ? "Đang tạo..." : "Tạo Đơn"}
        </Button>
      </div>
    </div>
  );
};

export default OrderPanel;