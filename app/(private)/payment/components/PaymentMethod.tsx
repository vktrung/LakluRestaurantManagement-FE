"use client"

interface PaymentMethodProps {
  selectedMethod: "CASH" | "TRANSFER"
  onChange: (method: "CASH" | "TRANSFER") => void
}

export function PaymentMethod({ selectedMethod, onChange }: PaymentMethodProps) {
  return (
    <div className="bg-white rounded-xl border shadow-md p-5">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-primary"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path
            fillRule="evenodd"
            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
            clipRule="evenodd"
          />
        </svg>
        Phương thức thanh toán
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label
          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedMethod === "CASH" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/30"
          }`}
        >
          <input
            type="radio"
            value="CASH"
            checked={selectedMethod === "CASH"}
            onChange={() => onChange("CASH")}
            className="sr-only"
          />
          <div
            className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
              selectedMethod === "CASH" ? "border-primary" : "border-muted-foreground/50"
            }`}
          >
            {selectedMethod === "CASH" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                selectedMethod === "CASH" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Tiền mặt</p>
              <p className="text-sm text-muted-foreground">Thanh toán trực tiếp bằng tiền mặt</p>
            </div>
          </div>
        </label>

        <label
          className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedMethod === "TRANSFER"
              ? "border-primary bg-primary/5"
              : "border-muted hover:border-muted-foreground/30"
          }`}
        >
          <input
            type="radio"
            value="TRANSFER"
            checked={selectedMethod === "TRANSFER"}
            onChange={() => onChange("TRANSFER")}
            className="sr-only"
          />
          <div
            className={`flex items-center justify-center w-5 h-5 rounded-full border-2 ${
              selectedMethod === "TRANSFER" ? "border-primary" : "border-muted-foreground/50"
            }`}
          >
            {selectedMethod === "TRANSFER" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${
                selectedMethod === "TRANSFER" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Chuyển khoản</p>
              <p className="text-sm text-muted-foreground">Thanh toán qua ngân hàng hoặc ví điện tử</p>
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}

