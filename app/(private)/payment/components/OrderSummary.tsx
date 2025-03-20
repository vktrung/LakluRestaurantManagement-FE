interface OrderSummaryProps {
    subtotal: string;
    vatAmount: string;
    total: string;
}

export function OrderSummary({ subtotal, vatAmount, total }: OrderSummaryProps) {
    return (
        <div className="bg-gray-100 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between mb-2">
                <p>Tổng trước VAT</p>
                <p>{Number(subtotal).toLocaleString('vi-VN')} VND</p>
            </div>
            <div className="flex justify-between mb-2">
                <p>VAT ({(Number(vatAmount) / Number(subtotal) * 100).toFixed(1)}%)</p>
                <p>{Number(vatAmount).toLocaleString('vi-VN')} VND</p>
            </div>
            <div className="flex justify-between font-semibold">
                <p>Tổng cộng</p>
                <p>{Number(total).toLocaleString('vi-VN')} VND</p>
            </div>
        </div>
    );
}