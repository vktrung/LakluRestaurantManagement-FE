"use client"

import { useEffect } from "react"
import { formatPrice } from "@/lib/utils"

interface BillPageProps {
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
  }
}

export default function BillPage() {
  // Mẫu dữ liệu test
  const billData = {
    orderInfo: {
      orderId: "100131",
      tableId: "BÀN - 3",
      checkInTime: "13:30",
      checkOutTime: "13:30",
      date: "24.03.2025"
    },
    items: [
      {
        id: 1,
        name: "Đậu phụ tẩm hành",
        quantity: 1,
        price: 50000,
        total: 50000
      },
      {
        id: 2,
        name: "Ngô chiên",
        quantity: 2,
        price: 40000,
        total: 80000
      },
      {
        id: 3,
        name: "Mỳ xào bò",
        quantity: 1,
        price: 90000,
        total: 90000
      }
    ],
    payment: {
      subTotal: 220000,
      tax: 0,
      total: 220000,
      receivedAmount: 220000,
      change: 0
    }
  }

  // Tự động in khi component mount
  useEffect(() => {
    window.print()
  }, [])

  return (
    <div className="print-bill p-4 max-w-[80mm] mx-auto font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold text-[#2B5219]">LAKLU - BIA KHÔ MỰC</h1>
        <h2 className="text-lg font-semibold mt-4 mb-6">HÓA ĐƠN THANH TOÁN</h2>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div>
          <p>SỐ HÓA ĐƠN: {billData.orderInfo.orderId}</p>
          <p>BÀN: {billData.orderInfo.tableId}</p>
          <p>GIỜ VÀO: {billData.orderInfo.checkInTime}</p>
        </div>
        <div className="text-right">
          <p>NGÀY: {billData.orderInfo.date}</p>
          <p>GIỜ RA: {billData.orderInfo.checkOutTime}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-[#2B5219] my-4"></div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 mb-2 font-semibold">
        <div className="col-span-1">TT</div>
        <div className="col-span-5">Tên món</div>
        <div className="col-span-2 text-center">Số lượng</div>
        <div className="col-span-2 text-right">Đơn giá</div>
        <div className="col-span-2 text-right">Thành tiền</div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-[#2B5219] mb-2"></div>

      {/* Items */}
      {billData.items.map((item, index) => (
        <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-1">{index + 1}</div>
          <div className="col-span-5">{item.name}</div>
          <div className="col-span-2 text-center">{item.quantity}</div>
          <div className="col-span-2 text-right">{formatPrice(item.price)}</div>
          <div className="col-span-2 text-right">{formatPrice(item.total)}</div>
        </div>
      ))}

      {/* Divider */}
      <div className="border-t-2 border-[#2B5219] mt-4 mb-2"></div>

      {/* Payment Summary */}
      <div className="text-right space-y-1 mb-6">
        <p>Thành tiền: {formatPrice(billData.payment.subTotal)}</p>
        <p>Thuế ({billData.payment.tax}%): {formatPrice(0)}</p>
        <p className="font-bold">Tổng tiền thanh toán: {formatPrice(billData.payment.total)}</p>
        <p>Tiền khách đưa: {formatPrice(billData.payment.receivedAmount)}</p>
        <p>Tiền trả lại: {formatPrice(billData.payment.change)}</p>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p>Cảm ơn quý khách và hẹn gặp lại!</p>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }

          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-bill {
            width: 80mm;
            padding: 8px;
            margin: 0;
            font-size: 12px;
            background: white;
          }

          /* Ẩn các phần tử không cần thiết khi in */
          body > *:not(.print-bill) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
} 