interface VatInputProps {
    vatRate: number;
    vatAmount: string;
    onChange: (rate: number) => void;
}

export function VatInput({ vatRate, vatAmount, onChange }: VatInputProps) {
    return (
        <div className="bg-white rounded-xl border shadow-md p-5">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Tỷ lệ VAT (%)
            </h2>
            <div className="space-y-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">%</span>
                    </div>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={vatRate}
                        onChange={(e) => onChange(Number(e.target.value))}
                        className="pl-8 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/20 focus:ring-opacity-50 py-2.5"
                    />
                </div>
                
                {vatAmount && Number(vatAmount) > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-muted">
                        <span className="text-sm text-muted-foreground">Số tiền VAT:</span>
                        <span className="font-medium text-primary">{Number(vatAmount).toLocaleString('vi-VN')} VND</span>
                    </div>
                )}
                
                <div className="text-xs text-muted-foreground">
                    <p>Tỷ lệ VAT sẽ được tính trên tổng giá trị đơn hàng</p>
                </div>
            </div>
        </div>
    );
}
