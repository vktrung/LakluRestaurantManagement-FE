import { OrderItem } from '@/features/payment/types';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderItemsProps {
    items: OrderItem[];
}

export function OrderItems({ items }: OrderItemsProps) {
    return (
        <Card className="border-0 shadow-none">
            <CardContent className="p-4 space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Danh sách món ăn
                </h2>
                <Separator className="my-2" />
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-1 rounded-md hover:bg-muted/50 transition-colors">
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">{item.dishName}</p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                                    Số lượng: {item.quantity}
                                </div>
                            </div>
                            <p className="font-semibold text-primary">{Number(item.price).toLocaleString('vi-VN')} VND</p>
                        </div>
                    ))}
                </div>
                {items.length > 0 && (
                    <>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center pt-2">
                            <p className="font-medium text-muted-foreground">Tổng số món:</p>
                            <p className="font-medium">{items.length} món</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
