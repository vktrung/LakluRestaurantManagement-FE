import { Button } from '@/components/ui/button';
import { MenuItem } from '@/features/menu/types';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react'; // Import icons for buttons

const OrderPanel = ({
  orderItems,
  onRemoveItem,
  onUpdateQuantity,
  onClose,
  menusData, // Pass menusData to look up full MenuItem

}: {
  orderItems: { dishId: number; quantity: number }[];
  onRemoveItem: (dishId: number) => void;
  onUpdateQuantity: (dishId: number, quantity: number) => void;
  onClose: () => void;
  menusData: MenuItem[]; // Pass the menusData to look up MenuItem by dishId
 
}) => {
  
 console.log(orderItems,'dòng 21')
  return (
    <div className="h-full border rounded-lg shadow-md p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Order</h2>
        <Button variant="ghost" onClick={onClose} size="sm">
          Close
        </Button>
      </div>

      {/* Order Items */}
      <div className="overflow-y-auto h-[calc(100vh-250px)]">
        {orderItems.length > 0 ? (
          <div className="space-y-4">
                      {orderItems.map((item) => {
                console.log(orderItems.length);
              // Find the full MenuItem object based on dishId
              const menuItem = menusData.find((menuItem) => menuItem.dish.id === item.dishId);
                    console.log(menuItem,"dòng 39")
              if (!menuItem) return null; // Skip if no menu item found

              return (
                <div key={item.dishId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={menuItem.dish.images?.[0]?.link || '/placeholder.svg'}
                      alt={menuItem.dish.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium">{menuItem.dish.name}</h4>
                      <p className="text-sm text-muted-foreground">${menuItem.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
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
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Your order is empty</p>
        )}
      </div>

      
      

      {/* Checkout Button */}
      <div className="mt-6">
        <Button variant="outline">
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default OrderPanel;
