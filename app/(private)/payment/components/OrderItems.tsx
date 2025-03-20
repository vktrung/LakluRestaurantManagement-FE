import { OrderItem } from '@/features/payment/types';

interface OrderItemsProps {
    items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Danh sách món ăn</h2>
            {items.map((item, index) => (
                <div key={index} className="flex justify-between mb-2">
                    <div>
                        <p>{item.dishName}</p>
                        <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                    <p>{Number(item.price).toLocaleString('vi-VN')} VND</p>
                </div>
            ))}
        </div>
    );
}