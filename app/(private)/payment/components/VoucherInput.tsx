interface VoucherInputProps {
    voucherCode: string;
    onChange: (code: string) => void;
}

export function VoucherInput({ voucherCode, onChange }: VoucherInputProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Mã giảm giá</h2>
            <input
                type="text"
                value={voucherCode}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
        </div>
    );
}