interface VatInputProps {
    vatRate: number;
    vatAmount: string;
    onChange: (rate: number) => void;
}

export function VatInput({ vatRate, vatAmount, onChange }: VatInputProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Tỷ lệ VAT (%)</h2>
            <div className="flex justify-between items-center">
                <input
                    type="number"
                    value={vatRate}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <p>Số tiền VAT: {Number(vatAmount).toLocaleString('vi-VN')} VND</p>
            </div>
        </div>
    );
}