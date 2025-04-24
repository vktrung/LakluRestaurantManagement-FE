"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Printer } from "lucide-react"
import { Payslip } from "@/features/payroll/types"
import { Staff } from "@/features/staff/types"
import Image from "next/image"

interface PayslipPrintProps {
  payslip: Payslip
  staffData?: Staff | null
}

export function PayslipPrint({ payslip, staffData }: PayslipPrintProps) {
  const printRef = useRef<HTMLDivElement>(null)

  // Hàm xử lý in trực tiếp
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  // Hàm chuyển đổi tháng sang tiếng Việt
  const formatMonthInVietnamese = (dateString: string) => {
    const date = new Date(dateString + "-01")
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `Tháng ${month}/${year}`
  }

  // Tính toán các thành phần lương dựa vào thông tin Staff API
  const basicSalary = Math.round(staffData?.salaryAmount || 0)
  const lateDeduction = Math.round(payslip.lateHours * 50000)
  
  // Tạo dữ liệu chấm công từ thông tin thực tế
  const attendanceData = {
    standardWorkDays: payslip.totalWorkingDays,
    actualWorkDays: payslip.totalWorkingDays - Math.floor(payslip.lateHours / 8),
    totalWorkingHours: payslip.totalWorkingHours,
    lateCount: payslip.lateCount,
    lateHours: Number(payslip.lateHours).toFixed(2)
  }

  // Hàm chuyển đổi loại lương sang tiếng Việt
  const translateSalaryType = (type: string) => {
    if (!type) return "tháng";
    switch (type.toUpperCase()) {
      case "MONTHLY": return "tháng"
      case "HOURLY": return "giờ"
      case "SHIFTLY": return "ca"
      default: return type.toLowerCase()
    }
  }

  // Tạo hoặc sử dụng dữ liệu nhân viên từ API
  const employeeData = {
    fullName: staffData?.profile?.fullName || payslip.staffName,
    position: staffData?.roles?.length ? staffData?.roles[0] : "-",
    department: staffData?.profile?.department || "-",
    bankAccount: staffData?.profile?.bankNumber || "-",
    bankName: staffData?.profile?.bankAccount || "-", 
    joinDate: staffData?.profile?.hireDate ? new Date(staffData.profile.hireDate).toLocaleDateString("vi-VN") : "-"
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Thêm CSS cho chế độ in */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-hidden {
            display: none !important;
          }
          /* Đảm bảo logo hiển thị đúng khi in */
          .print-container img {
            visibility: visible !important;
            display: block !important;
          }
        }
      `}</style>

      <div className="flex justify-end gap-2 print-hidden">
        <Button variant="outline" className="gap-2" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          In phiếu lương
        </Button>
        <Button variant="outline" className="gap-2" onClick={handlePrint}>
          <Download className="h-4 w-4" />
          Tải PDF
        </Button>
      </div>

      <Card className="p-8 print-container" ref={printRef}>
        <div className="flex flex-col gap-6">
          {/* Tiêu đề và thông tin công ty */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-md overflow-hidden relative">
                <Image 
                  src="/Logo-09.png" 
                  alt="Laklu Restaurant Logo" 
                  fill 
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">LAKLU RESTAURANT</h2>
                <p className="text-sm text-muted-foreground">Địa chỉ: 83 Nguyễn Văn Cừ, Vinh, Nghệ An</p>
                <p className="text-sm text-muted-foreground">Điện thoại: 097 606 17 48 - Email: locc12305@gmail.com</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Mã phiếu: {payslip.payslipId}</p>
              <p className="text-sm text-muted-foreground">Ngày lập: {new Date().toLocaleDateString("vi-VN")}</p>
            </div>
          </div>

          {/* Tiêu đề phiếu lương */}
          <div className="text-center">
            <h1 className="text-2xl font-bold uppercase">PHIẾU LƯƠNG</h1>
            <p className="text-lg">{formatMonthInVietnamese(payslip.salaryMonth)}</p>
          </div>

          {/* Thông tin nhân viên */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold text-lg">I. THÔNG TIN NHÂN VIÊN</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2">
                  <span className="text-muted-foreground">Mã nhân viên:</span>{" "}
                  <span className="font-medium">{payslip.staffId}</span>
                </p>
                <p className="mb-2">
                  <span className="text-muted-foreground">Họ và tên:</span>{" "}
                  <span className="font-medium">{employeeData.fullName}</span>
                </p>
                {employeeData.position !== "-" && (
                  <p className="mb-2">
                    <span className="text-muted-foreground">Chức vụ:</span>{" "}
                    <span className="font-medium">{employeeData.position}</span>
                  </p>
                )}
                {employeeData.department !== "-" && (
                  <p className="mb-2">
                    <span className="text-muted-foreground">Phòng ban:</span>{" "}
                    <span className="font-medium">{employeeData.department}</span>
                  </p>
                )}
              </div>
              <div>
                {employeeData.joinDate !== "-" && (
                  <p className="mb-2">
                    <span className="text-muted-foreground">Ngày vào làm:</span>{" "}
                    <span className="font-medium">{employeeData.joinDate}</span>
                  </p>
                )}
                {employeeData.bankAccount !== "-" && (
                  <p className="mb-2">
                    <span className="text-muted-foreground">Tài khoản ngân hàng:</span>{" "}
                    <span className="font-medium">{employeeData.bankAccount}</span>
                  </p>
                )}
                {employeeData.bankName !== "-" && (
                  <p className="mb-2">
                    <span className="text-muted-foreground">Ngân hàng:</span>{" "}
                    <span className="font-medium">{employeeData.bankName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin chấm công */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold text-lg">II. THÔNG TIN CHẤM CÔNG</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="mb-2">
                  <span className="text-muted-foreground">Số ngày làm việc:</span>{" "}
                  <span className="font-medium">{attendanceData.standardWorkDays} ngày</span>
                </p>
                <p className="mb-2">
                  <span className="text-muted-foreground">Tổng số giờ làm việc:</span>{" "}
                  <span className="font-medium">{attendanceData.totalWorkingHours} giờ</span>
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <span className="text-muted-foreground">Số lần đi muộn:</span>{" "}
                  <span className="font-medium">{attendanceData.lateCount} lần</span>
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <span className="text-muted-foreground">Số giờ đi muộn:</span>{" "}
                  <span className="font-medium">{attendanceData.lateHours} giờ</span>
                </p>
              </div>
            </div>
          </div>

          {/* Chi tiết lương */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold text-lg">III. CHI TIẾT LƯƠNG</h3>

            <div className="mb-4">
              <h4 className="font-medium mb-2">1. Thu nhập</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Khoản mục</th>
                    <th className="py-2 text-right">Số tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">
                      Lương cơ bản {staffData?.salaryType ? `(${translateSalaryType(staffData.salaryType)})` : ''}
                      {staffData?.salaryType?.toUpperCase() === "HOURLY" && payslip.totalWorkingHours > 0 && 
                        ` (${payslip.totalWorkingHours} giờ x ${Math.round((staffData?.salaryAmount || payslip.totalSalary)).toLocaleString("vi-VN")} đ)`}
                    </td>
                    <td className="py-2 text-right">{Math.round(staffData?.salaryAmount || payslip.totalSalary).toLocaleString("vi-VN")}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold">
                    <td className="py-2">Tổng thu nhập</td>
                    <td className="py-2 text-right">{Math.round(payslip.totalSalary).toLocaleString("vi-VN")}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">LƯƠNG THỰC NHẬN:</h4>
                <span className="font-bold text-xl">{Math.round(payslip.totalSalary).toLocaleString("vi-VN")} VNĐ</span>
              </div>
            </div>
          </div>

          {/* Chữ ký */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-medium">NGƯỜI LẬP BẢNG</p>
              <p className="text-sm text-muted-foreground">(Ký, ghi rõ họ tên)</p>
              <div className="h-20"></div>
            </div>
            <div>
              <p className="font-medium">TRƯỞNG PHÒNG NHÂN SỰ</p>
              <p className="text-sm text-muted-foreground">(Ký, ghi rõ họ tên)</p>
              <div className="h-20"></div>
            </div>
            <div>
              <p className="font-medium">NGƯỜI NHẬN LƯƠNG</p>
              <p className="text-sm text-muted-foreground">(Ký, ghi rõ họ tên)</p>
              <div className="h-20"></div>
              <p>{employeeData.fullName}</p>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Ghi chú:</p>
            <p>
              - Mọi thắc mắc về lương, vui lòng liên hệ phòng Nhân sự trong vòng 3 ngày làm việc kể từ ngày nhận bảng
              lương.
            </p>
            <p>- Bảng lương này được lập thành 02 bản, 01 bản lưu tại công ty và 01 bản giao cho người lao động.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Hàm chuyển số thành chữ tiếng Việt
function numberToWords(number: number): string {
  const units = ["", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
  const teens = [
    "",
    "mười một",
    "mười hai",
    "mười ba",
    "mười bốn",
    "mười lăm",
    "mười sáu",
    "mười bảy",
    "mười tám",
    "mười chín",
  ]
  const tens = [
    "",
    "mười",
    "hai mươi",
    "ba mươi",
    "bốn mươi",
    "năm mươi",
    "sáu mươi",
    "bảy mươi",
    "tám mươi",
    "chín mươi",
  ]

  function convertLessThanOneThousand(number: number): string {
    let result = ""

    if (number >= 100) {
      result += units[Math.floor(number / 100)] + " trăm "
      number %= 100
    }

    if (number >= 20) {
      result += tens[Math.floor(number / 10)] + " "
      number %= 10
      if (number > 0) {
        result += units[number]
      }
    } else if (number >= 10) {
      result += teens[number - 10]
    } else if (number > 0) {
      result += units[number]
    }

    return result.trim()
  }

  if (number === 0) return "không"

  let result = ""
  const billion = Math.floor(number / 1000000000)
  const million = Math.floor((number % 1000000000) / 1000000)
  const thousand = Math.floor((number % 1000000) / 1000)
  const remainder = number % 1000

  if (billion > 0) {
    result += convertLessThanOneThousand(billion) + " tỷ "
  }

  if (million > 0) {
    result += convertLessThanOneThousand(million) + " triệu "
  }

  if (thousand > 0) {
    result += convertLessThanOneThousand(thousand) + " nghìn "
  }

  if (remainder > 0) {
    result += convertLessThanOneThousand(remainder)
  }

  return result.trim()
}

