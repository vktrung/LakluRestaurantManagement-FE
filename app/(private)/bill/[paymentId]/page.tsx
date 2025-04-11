"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { formatPrice } from "@/lib/utils"
import { useGetBillQuery } from "@/features/payment/PaymentApiSlice"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function BillPage() {
  const { paymentId } = useParams()
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === 'true'
  const [autoPrint, setAutoPrint] = useState(searchParams.get('autoPrint') === 'true')
  
  // Fetch bill data
  const { data: billData, isLoading } = useGetBillQuery(Number(paymentId))

  // Force pre-rendering before print
  useEffect(() => {
    if (billData?.data) {
      // Give time for the bill to be fully rendered
      const timer = setTimeout(() => {
        // Force layout calculation with this read
        document.body.offsetHeight;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [billData]);

  // Chỉ tự động in khi checkbox được check hoặc có query param autoPrint=true và không phải preview mode
  useEffect(() => {
    if (billData?.data && !isLoading && autoPrint && !isPreview) {
      // Auto print with delay to ensure data is ready
      const printTimer = setTimeout(() => {
        handlePrint(); // Use the dedicated print function
      }, 1000);
      
      return () => clearTimeout(printTimer);
    }
  }, [billData, isLoading, autoPrint, isPreview]);

  const handlePrint = () => {
    // Check bill data is available
    if (!billData?.data) return;
    const bill = billData.data;

    // Create a new window with only the bill content
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      alert('Vui lòng cho phép cửa sổ pop-up để in hóa đơn');
      return;
    }

    // Format date for print window
    const date = new Date(bill.date);
    const printFormattedDate = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    // Format time for print window
    const formatTimeForPrint = (dateString: string) => {
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
          ${bill.orderItems.map((item, index) => `
          <div class="grid mb-1">
            <div>
              <div class="col-span-1 text-xs">${index + 1}</div>
              <div class="col-span-4 text-xs wrap-text">${item.dishName}</div>
              <div class="col-span-1 text-xs text-center">${item.quantity}</div>
              <div class="col-span-3 text-xs text-right font-mono">${formatPrice(item.price, { currency: false, minLength: 8 })}</div>
              <div class="col-span-3 text-xs text-right font-mono">${formatPrice(item.price * item.quantity, { currency: false, minLength: 8 })}</div>
            </div>
          </div>
          `).join('')}

          <!-- Divider -->
          <div class="border-t border-dashed mt-2 mb-2"></div>

          <!-- Payment Summary -->
          <div class="text-right space-y-1 mb-2">
            <p class="text-xs">Thành tiền: <span class="font-mono ml-2">${formatPrice(bill.totalAmount)}</span></p>
            ${bill.voucherValue > 0 ? `<p class="text-xs">Giảm giá voucher: <span class="font-mono ml-2" style="color: red">-${formatPrice(bill.voucherValue)}</span></p>` : ''}
            <p class="text-xs font-bold">Tổng tiền TT: <span class="font-mono ml-2">${formatPrice(bill.totalAmount - (bill.voucherValue || 0))}</span></p>
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
  }

  // Hàm xuất PDF
  const handleExportPDF = () => {
    // Check bill data is available
    if (!billData?.data) return;
    const bill = billData.data;
    
    // Set print-specific CSS variables
    document.documentElement.style.setProperty('--print-width', '72mm');
    document.documentElement.style.setProperty('--print-font-size', '12px');
    
    // Force a layout calculation
    document.body.offsetHeight;
    
    // Lấy nội dung bill
    const billElement = document.querySelector('.print-bill');
    if (!billElement) return;
    
    // Tạo file HTML đầy đủ với style cụ thể
    const fullHtml = `<!DOCTYPE html>
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
          <p class="text-xs">GIỜ VÀO: ${formatTime(bill.timeIn)}</p>
        </div>
        <div style="width: 50%; text-align: right;">
          <p class="text-xs">NGÀY: ${formattedDate}</p>
          <p class="text-xs">GIỜ RA: ${formatTime(bill.timeOut)}</p>
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
    ${bill.orderItems.map((item, index) => `
    <div class="grid mb-1">
      <div>
        <div class="col-span-1 text-xs">${index + 1}</div>
        <div class="col-span-4 text-xs wrap-text">${item.dishName}</div>
        <div class="col-span-1 text-xs text-center">${item.quantity}</div>
        <div class="col-span-3 text-xs text-right font-mono">${formatPrice(item.price, { currency: false, minLength: 8 })}</div>
        <div class="col-span-3 text-xs text-right font-mono">${formatPrice(item.price * item.quantity, { currency: false, minLength: 8 })}</div>
      </div>
    </div>
    `).join('')}

    <!-- Divider -->
    <div class="border-t border-dashed mt-2 mb-2"></div>

    <!-- Payment Summary -->
    <div class="text-right space-y-1 mb-2">
      <p class="text-xs">Thành tiền: <span class="font-mono ml-2">${formatPrice(bill.totalAmount)}</span></p>
      ${bill.voucherValue > 0 ? `<p class="text-xs">Giảm giá voucher: <span class="font-mono ml-2" style="color: red">-${formatPrice(bill.voucherValue)}</span></p>` : ''}
      <p class="text-xs font-bold">Tổng tiền TT: <span class="font-mono ml-2">${formatPrice(bill.totalAmount - (bill.voucherValue || 0))}</span></p>
      <p class="text-xs">Tiền khách đưa: <span class="font-mono ml-2">${formatPrice(bill.receivedAmount)}</span></p>
      <p class="text-xs">Tiền trả lại: <span class="font-mono ml-2">${formatPrice(bill.change)}</span></p>
    </div>

    <!-- Footer -->
    <div class="text-center mt-3">
      <p class="text-xs">Cảm ơn quý khách và hẹn gặp lại!</p>
    </div>
  </div>
</body>
</html>`;
    
    // Tạo Blob và link để download
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Tạo link download
    const link = document.createElement('a');
    link.href = url;
    link.download = `hoa-don-${bill.orderId}.html`;
    document.body.appendChild(link);
    link.click();
    
    // Dọn dẹp
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 100);
  }

  // Loading state
  if (isLoading) {
    return <div className="p-8"><Skeleton className="w-full h-[600px]" /></div>
  }

  // Error state
  if (!billData?.data) {
    return <div className="p-8">Không tìm thấy thông tin hóa đơn</div>
  }

  const { data: bill } = billData

  // Format date
  const date = new Date(bill.date)
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)

  // Format time
  const formatTime = (dateString: string) => {
    const time = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(time)
  }

  return (
    <div className="print-bill p-4 max-w-[72mm] mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-md font-bold text-[#2B5219]">LAKLU - BIA KHÔ MỰC</h1>
        <h2 className="text-sm font-semibold mt-2 mb-3">HÓA ĐƠN THANH TOÁN</h2>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 gap-1 mb-3">
        <div>
          <p className="text-xs">SỐ HĐ: {bill.orderId}</p>
          <p className="text-xs">BÀN: {bill.tableNumber || "—"}</p>
          <p className="text-xs">GIỜ VÀO: {formatTime(bill.timeIn)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs">NGÀY: {formattedDate}</p>
          <p className="text-xs">GIỜ RA: {formatTime(bill.timeOut)}</p>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-1 mb-1 font-semibold text-xs">
        <div className="col-span-1">TT</div>
        <div className="col-span-4">Tên món</div>
        <div className="col-span-1 text-center">SL</div>
        <div className="col-span-3 text-right">Đơn giá</div>
        <div className="col-span-3 text-right">T.Tiền</div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#2B5219] mb-1"></div>

      {/* Items */}
      {bill.orderItems.map((item, index) => (
        <div key={item.id} className="grid grid-cols-12 gap-1 mb-1 text-xs">
          <div className="col-span-1">{index + 1}</div>
          <div className="col-span-4 wrap-text">{item.dishName}</div>
          <div className="col-span-1 text-center">{item.quantity}</div>
          <div className="col-span-3 text-right font-mono text-xs">{formatPrice(item.price, { currency: false, minLength: 8 })}</div>
          <div className="col-span-3 text-right font-mono text-xs">{formatPrice(item.price * item.quantity, { currency: false, minLength: 8 })}</div>
        </div>
      ))}

      {/* Divider */}
      <div className="border-t border-dashed border-[#2B5219] mt-2 mb-2"></div>

      {/* Payment Summary */}
      <div className="text-right space-y-1 mb-2">
        <p className="text-xs">Thành tiền: <span className="font-mono ml-2">{formatPrice(bill.totalAmount)}</span></p>
        {bill.voucherValue > 0 && (
          <p className="text-xs">Giảm giá voucher: <span className="font-mono ml-2 text-red-600">-{formatPrice(bill.voucherValue)}</span></p>
        )}
        <p className="text-xs font-bold">Tổng tiền TT: <span className="font-mono ml-2">{formatPrice(bill.totalAmount - (bill.voucherValue || 0))}</span></p>
        <p className="text-xs">Tiền khách đưa: <span className="font-mono ml-2">{formatPrice(bill.receivedAmount)}</span></p>
        <p className="text-xs">Tiền trả lại: <span className="font-mono ml-2">{formatPrice(bill.change)}</span></p>
      </div>

      {/* Footer */}
      <div className="text-center mt-3 text-xs">
        <p>Cảm ơn quý khách và hẹn gặp lại!</p>
      </div>

      {/* Control Buttons - Hidden when printing */}
      <div className="print:hidden mt-8 space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Checkbox
            id="auto-print"
            checked={autoPrint}
            onCheckedChange={(checked) => setAutoPrint(checked as boolean)}
          />
          <Label htmlFor="auto-print">Tự động in hóa đơn</Label>
        </div>
        
        <div className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="min-w-[150px]"
          >
            Xem trước và in
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="min-w-[150px]"
          >
            Xuất PDF
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        /* Default styles - these apply regardless of printing */
        .print-bill {
          width: 100%;
          max-width: 72mm;
          padding: 5px;
          margin: 0 auto;
          font-size: 12px;
          background: white;
          font-family: monospace;
        }

        /* Print media styles */
        @media print {
          @page {
            size: 72mm auto;
            margin: 0;
          }

          html, body {
            width: 72mm !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-size: 12px !important;
          }

          /* Hide all elements except the bill */
          body > *:not(.print-bill) {
            display: none !important;
          }

          /* This ensures only direct bill container is shown */
          body {
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
          }

          .print-bill {
            width: 72mm !important;
            max-width: 72mm !important;
            padding: 2mm !important;
            margin: 0 !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            overflow: visible !important;
            font-size: 12px !important;
            line-height: 1.2 !important;
            display: block !important;
            position: relative !important;
          }

          /* Grid structure for print */
          .print-bill .grid {
            display: block !important;
            width: 100% !important;
            margin-bottom: 2mm !important;
          }

          .print-bill .grid-cols-12,
          .print-bill .grid-cols-2 {
            display: table !important;
            width: 100% !important;
            table-layout: fixed !important;
          }

          .print-bill .grid-cols-12 > div,
          .print-bill .grid-cols-2 > div {
            display: table-cell !important;
            vertical-align: top !important;
          }

          /* Column widths */
          .print-bill .col-span-1 { width: 8% !important; display: table-cell !important; }
          .print-bill .col-span-3 { width: 24% !important; display: table-cell !important; }
          .print-bill .col-span-4 { width: 32% !important; display: table-cell !important; }

          /* Text alignment */
          .print-bill .text-right { text-align: right !important; }
          .print-bill .text-center { text-align: center !important; }

          /* Headers */
          .print-bill h1 {
            font-size: 14px !important;
            margin: 2mm 0 !important;
            text-align: center !important;
            font-weight: bold !important;
          }

          .print-bill h2 {
            font-size: 13px !important;
            margin: 2mm 0 !important;
            text-align: center !important;
            font-weight: 600 !important;
          }

          /* Text elements */
          .print-bill p,
          .print-bill div {
            font-size: 12px !important;
            margin: 1mm 0 !important;
            display: block !important;
          }
          
          /* Make sure dish names can wrap */
          .print-bill .wrap-text {
            white-space: normal !important;
            word-break: break-word !important;
            overflow: visible !important;
            display: table-cell !important;
            max-width: 32% !important;
            padding-right: 2mm !important;
          }

          .print-bill .font-mono {
            font-family: monospace !important;
            font-size: 11px !important;
            letter-spacing: -0.5px !important;
          }

          /* Borders */
          .print-bill .border-t {
            border-top: 1px solid black !important;
            margin: 2mm 0 !important;
            display: block !important;
            width: 100% !important;
          }

          .print-bill .border-dashed {
            border-top: 1px dashed black !important;
            margin: 2mm 0 !important;
            display: block !important;
            width: 100% !important;
          }

          /* Spacing */
          .print-bill .space-y-1 > * + * { margin-top: 1mm !important; }
          .print-bill .mb-1 { margin-bottom: 1mm !important; }
          .print-bill .mb-2 { margin-bottom: 2mm !important; }
          .print-bill .mb-3 { margin-bottom: 3mm !important; }
          .print-bill .mt-2 { margin-top: 2mm !important; }
          .print-bill .mt-3 { margin-top: 3mm !important; }
          .print-bill .mt-4 { margin-top: 4mm !important; }

          /* Force colors */
          .print-bill * {
            color: black !important;
            background: white !important;
          }

          /* Hide non-print elements */
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
} 