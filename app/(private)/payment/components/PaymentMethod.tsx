interface PaymentMethodProps {
    selectedMethod: 'CASH' | 'TRANSFER';
    onChange: (method: 'CASH' | 'TRANSFER') => void;
}

export function PaymentMethod({ selectedMethod, onChange }: PaymentMethodProps) {
    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">Phương thức thanh toán</h2>
            <div className="flex space-x-4">
                <label className="flex items-center">
                    <input
                        type="radio"
                        value="CASH"
                        checked={selectedMethod === 'CASH'}
                        onChange={() => onChange('CASH')}
                        className="mr-2"
                    />
                    Tiền mặt
                </label>
                <label className="flex items-center">
                    <input
                        type="radio"
                        value="TRANSFER"
                        checked={selectedMethod === 'TRANSFER'}
                        onChange={() => onChange('TRANSFER')}
                        className="mr-2"
                    />
                    Chuyển khoản
                </label>
            </div>
        </div>
    );
}