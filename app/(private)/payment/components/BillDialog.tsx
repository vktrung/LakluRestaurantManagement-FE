"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { getTokenFromCookie } from "@/utils/token"
import { toast } from "sonner"
interface BillDialogProps {
    isOpen: boolean
    onClose: () => void
    billData: {
        orderInfo: {
            orderId: string
            tableId: string
            checkInTime: string
            checkOutTime: string
            date: string
        }
        items: {
            id: number
            name: string
            quantity: number
            price: number
            total: number
        }[]
        payment: {
            subTotal: number
            tax: number
            total: number
            receivedAmount: number
            change: number
            voucherDiscount: number
        }
    }
    paymentId: number
}

export function BillDialog({ isOpen, onClose, billData, paymentId }: BillDialogProps) {
    const handlePrint = async () => {
        try {
            // Fetch dữ liệu bill từ API
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/payments/bill/${paymentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getTokenFromCookie()}`,
                }
            });

            if (!response.ok) {
                throw new Error('Không thể lấy thông tin hóa đơn');
            }

            const billResponse = await response.json();
            const bill = billResponse.data;

            if (!bill) {
                throw new Error('Không thể lấy thông tin hóa đơn');
            }

            // Create a new window with only the bill content
            const printWindow = window.open('', '_blank', 'width=400,height=600');
            if (!printWindow) {
                alert('Vui lòng cho phép cửa sổ pop-up để in hóa đơn');
                return;
            }

            // Format date
            const date = new Date(bill.date);
            const printFormattedDate = new Intl.DateTimeFormat("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }).format(date);

            // Format time function
            const formatTimeForPrint = (dateString: string) => {
                if (!dateString) return "--:--";
                const time = new Date(dateString);
                return new Intl.DateTimeFormat("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }).format(time);
            };

            // Generate the HTML content for the print window
            const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hóa đơn - ${bill.orderId}</title>
          <style>
            @page {
              size: 72mm auto;
              margin: 0;
            }
            
            body {
              font-family: monospace;
              width: 72mm;
              max-width: 72mm;
              margin: 0 auto;
              padding: 0;
              background-color: white;
              color: black;
              font-size: 12px;
            }
            
            .print-bill {
              width: 72mm;
              max-width: 72mm;
              padding: 2mm;
              font-size: 12px;
              box-sizing: border-box;
              margin: 0 auto;
            }
            
            h1 { 
              font-size: 14px; 
              margin: 5px 0; 
              text-align: center;
              font-weight: bold;
            }
            
            h2 { 
              font-size: 13px; 
              margin: 4px 0; 
              text-align: center;
              font-weight: semibold;
            }
            
            p { 
              font-size: 11px; 
              margin: 2px 0; 
            }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            
            .grid {
              display: table;
              width: 100%;
              table-layout: fixed;
              border-collapse: collapse;
            }
            
            .grid > div {
              display: table-row;
            }
            
            .grid > div > div {
              display: table-cell;
              padding: 1mm 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .grid > div > div.wrap-text {
              white-space: normal;
              word-break: break-word;
              overflow: visible;
              hyphens: auto;
            }
            
            .font-mono {
              font-family: monospace;
              font-size: 11px;
              letter-spacing: -0.5px;
            }
            
            .truncate {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .wrap-text {
              white-space: normal;
              word-break: break-word;
              hyphens: auto;
            }
            
            .border-t {
              border-top: 1px solid black;
              margin: 2mm 0;
              display: block;
              width: 100%;
            }
            
            .border-dashed {
              border-top: 1px dashed black;
              margin: 2mm 0;
              display: block;
              width: 100%;
            }
            
            .col-span-1 { width: 8%; }
            .col-span-3 { width: 24%; }
            .col-span-4 { width: 32%; }
            .col-span-5 { width: 40%; }
            
            .space-y-1 > * + * {
              margin-top: 0.25rem;
            }
            
            .mb-1 { margin-bottom: 0.25rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-3 { margin-bottom: 0.75rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-3 { margin-top: 0.75rem; }
            .ml-2 { margin-left: 0.5rem; }
            
            .gap-1 { gap: 0.25rem; }
            
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            
            .text-sm { font-size: 0.875rem; }
            .text-xs { font-size: 0.75rem; }
            .text-md { font-size: 1rem; }
          </style>
        </head>
        <body>
          <div class="print-bill">
            <!-- Header -->
            <div class="text-center mb-3">
              <h1 class="text-md font-bold">LAKLU - BIA KHÔ MỰC</h1>
              <h2 class="text-sm font-semibold mt-2 mb-3">HÓA ĐƠN THANH TOÁN</h2>
            </div>

            <!-- Order Info -->
            <div class="grid gap-1 mb-3">
              <div>
                <div style="width: 50%;">
                  <p class="text-xs">SỐ HĐ: ${bill.orderId}</p>
                  <p class="text-xs">BÀN: ${bill.tableNumber || "—"}</p>
                  <p class="text-xs">GIỜ VÀO: ${formatTimeForPrint(bill.timeIn)}</p>
                </div>
                <div style="width: 50%; text-align: right;">
                  <p class="text-xs">NGÀY: ${printFormattedDate}</p>
                  <p class="text-xs">GIỜ RA: ${formatTimeForPrint(bill.timeOut)}</p>
                </div>
              </div>
            </div>

            <!-- Table Header -->
            <div class="grid mb-1">
              <div>
                <div class="col-span-1 text-xs font-semibold">TT</div>
                <div class="col-span-4 text-xs font-semibold">Tên món</div>
                <div class="col-span-1 text-xs font-semibold text-center">SL</div>
                <div class="col-span-3 text-xs font-semibold text-right">Đơn giá</div>
                <div class="col-span-3 text-xs font-semibold text-right">T.Tiền</div>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t mb-1"></div>

            <!-- Items -->
            ${bill.orderItems.map((item: { dishName: any; quantity: number; price: number | null | undefined }, index: number) => `
            <div class="grid mb-1">
                <div>
                  <div class="col-span-1 text-xs">${index + 1}</div>
                  <div class="col-span-4 text-xs wrap-text">${item.dishName}</div>
                  <div class="col-span-1 text-xs text-center">${item.quantity}</div>
                  <div class="col-span-3 text-xs text-right font-mono">${formatPrice(item.price ?? 0, { currency: false, minLength: 8 })}</div>
                  <div class="col-span-3 text-xs text-right font-mono">${formatPrice((item.price ?? 0) * item.quantity, { currency: false, minLength: 8 })}</div>
                </div>
              </div>
            `).join('')}

            <!-- Divider -->
            <div class="border-t border-dashed mt-2 mb-2"></div>

            <!-- Payment Summary -->
            <div class="text-right space-y-1 mb-2">
              <p class="text-xs">Thành tiền: <span class="font-mono ml-2">${formatPrice(bill.totalAmount + (bill.voucherValue || 0))}</span></p>
              ${bill.voucherValue > 0 ? `<p class="text-xs">Giảm giá voucher: <span class="font-mono ml-2" style="color: red">-${formatPrice(bill.voucherValue)}</span></p>` : ''}
              <p class="text-xs font-bold">Tổng tiền TT: <span class="font-mono ml-2">${formatPrice(bill.totalAmount)}</span></p>
              <p class="text-xs">Tiền khách đưa: <span class="font-mono ml-2">${formatPrice(bill.receivedAmount)}</span></p>
              <p class="text-xs">Tiền trả lại: <span class="font-mono ml-2">${formatPrice(bill.change)}</span></p>
            </div>

            <!-- Footer -->
            <div class="text-center mt-3">
              <p class="text-xs">Cảm ơn quý khách và hẹn gặp lại!</p>
            </div>
          </div>
          <script>
            // Auto print when loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Optional: Close the window after printing
                // setTimeout(function() { window.close(); }, 500);
              }, 500);
            };
          </script>
        </body>
        </html>
      `;

            // Write to the new window and print
            printWindow.document.open();
            printWindow.document.write(printContent);
            printWindow.document.close();
        } catch (error) {
            console.error('Error printing bill:', error);
            toast.error('Chỉ có thể in hóa đơn thành công!');
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[800px] p-6 max-h-[90vh] overflow-y-auto">
                <div className="print-bill font-mono">
                    {/* Header */}
                    <div className="text-center mb-6 border-b pb-4">
                        <h1 className="text-2xl font-bold mb-2">LAKLU - BIA KHÔ MỰC</h1>
                        <h2 className="text-lg font-semibold">HÓA ĐƠN THANH TOÁN</h2>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6 bg-muted/10 p-4 rounded-lg">
                        <div>
                            <p className="text-sm mb-2">
                                <span className="font-semibold">SỐ HĐ:</span> {billData.orderInfo.orderId}
                            </p>
                            <p className="text-sm mb-2">
                                <span className="font-semibold">BÀN:</span> {billData.orderInfo.tableId}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">GIỜ VÀO:</span> {billData.orderInfo.checkInTime}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm mb-2">
                                <span className="font-semibold">NGÀY:</span> {billData.orderInfo.date}
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">GIỜ RA:</span> {billData.orderInfo.checkOutTime}
                            </p>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 mb-3 bg-primary/5 p-3 rounded-t-lg font-semibold">
                        <div className="col-span-1 text-sm">TT</div>
                        <div className="col-span-4 text-sm">Tên món</div>
                        <div className="col-span-2 text-sm text-center">SL</div>
                        <div className="col-span-2 text-sm text-right">Đơn giá</div>
                        <div className="col-span-3 text-sm text-right">T.Tiền</div>
                    </div>

                    {/* Items */}
                    <div className="border rounded-b-lg mb-6">
                        {billData.items.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 p-3 border-b last:border-b-0 hover:bg-muted/5">
                                <div className="col-span-1 text-sm">{index + 1}</div>
                                <div className="col-span-4 text-sm truncate">{item.name}</div>
                                <div className="col-span-2 text-sm text-center">{item.quantity}</div>
                                <div className="col-span-2 text-sm text-right font-mono">{formatPrice(item.price)}</div>
                                <div className="col-span-3 text-sm text-right font-mono">{formatPrice(item.total)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-muted/10 rounded-lg p-4 space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                            <span>Thành tiền:</span>
                            <span className="font-mono">{formatPrice(billData.payment.subTotal)}</span>
                        </div>
                        {billData.payment.voucherDiscount > 0 && (
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Giảm giá voucher:</span>
                                <span className="font-mono">-{formatPrice(billData.payment.voucherDiscount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span>Thuế ({billData.payment.tax}%):</span>
                            <span className="font-mono">{formatPrice(0)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-2 border-t">
                            <span>Tổng tiền TT:</span>
                            <span className="font-mono">{formatPrice(billData.payment.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tiền khách đưa:</span>
                            <span className="font-mono">{formatPrice(billData.payment.receivedAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Tiền trả lại:</span>
                            <span className="font-mono">{formatPrice(billData.payment.change)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-600">Cảm ơn quý khách và hẹn gặp lại!</p>
                    </div>

                    {/* Print Button */}
                    <div className="flex justify-center">
                        <Button onClick={handlePrint} className="gap-2 w-[200px]">
                            <Printer className="h-4 w-4" />
                            In hóa đơn
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 