"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, Printer } from "lucide-react"
// Sửa lại import để sử dụng đúng cách
//import ReactToPrint from "react-to-print"
import { Payslip } from "@/features/payroll/types"

interface PayslipPrintProps {
  payslip: Payslip
}

export function PayslipPrint({ payslip }: PayslipPrintProps) {
  const printRef = useRef<HTMLDivElement>(null)

  // Hàm chuyển đổi tháng sang tiếng Việt
  const formatMonthInVietnamese = (dateString: string) => {
    const date = new Date(dateString + "-01")
    const month = date.getMonth() + 1
    const year = date.getFullYear()
    return `Tháng ${month}/${year}`
  }

  // Tính toán các thành phần lương
  const basicSalary = payslip.totalSalary * 0.6
  const allowance = payslip.totalSalary * 0.15
  const bonus = payslip.totalSalary * 0.1
  const overtime = payslip.totalSalary * 0.05
  const lateDeduction = payslip.lateHours * 50000
  const insurance = payslip.totalSalary * 0.105
  const incomeTax = payslip.totalSalary * 0.05
  const netSalary = payslip.totalSalary - lateDeduction - insurance - incomeTax

  // Tạo dữ liệu chấm công
  const attendanceData = {
    standardWorkDays: payslip.totalWorkingDays,
    actualWorkDays: payslip.totalWorkingDays - Math.floor(payslip.lateHours / 8),
    overtimeHours: Math.round(Math.random() * 10),
    lateCount: payslip.lateCount,
    lateHours: payslip.lateHours,
    leaveCount: Math.floor(Math.random() * 2),
    leaveHours: Math.floor(Math.random() * 8),
  }

  // Tạo dữ liệu nhân viên dựa theo staffName
  const employeeData = {
    fullName: payslip.staffName,
    position:
      payslip.staffName.includes("nguyen")
        ? "Nhân viên kinh doanh"
        : payslip.staffName.includes("tran")
          ? "Trưởng phòng marketing"
          : payslip.staffName.includes("le")
            ? "Kỹ sư phần mềm"
            : payslip.staffName.includes("pham")
              ? "Giám đốc sản phẩm"
              : "Nhân viên kế toán",
    department:
      payslip.staffName.includes("nguyen")
        ? "Phòng Kinh doanh"
        : payslip.staffName.includes("tran")
          ? "Phòng Marketing"
          : payslip.staffName.includes("le")
            ? "Phòng Kỹ thuật"
            : payslip.staffName.includes("pham")
              ? "Ban Giám đốc"
              : "Phòng Tài chính",
    bankAccount: "0123456789",
    bankName: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
    taxCode: "8" + payslip.staffId + "5678",
    joinDate: "01/01/2020",
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-2 print:hidden">
        {/* Sử dụng ReactToPrint như một component
        <ReactToPrint
          trigger={() => (
            <Button variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              In phiếu lương
            </Button>
          )}
          content={() => printRef.current}
        />
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Tải PDF
        </Button> */}
      </div>

      <Card className="p-8" ref={printRef}>
        <div className="flex flex-col gap-6">
          {/* Tiêu đề và thông tin công ty */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-md bg-primary/20 flex items-center justify-center text-primary font-bold">
                LOGO
              </div>
              <div>
                <h2 className="text-xl font-bold">CÔNG TY TNHH CÔNG NGHỆ ABC</h2>
                <p className="text-sm text-muted-foreground">Địa chỉ: 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
                <p className="text-sm text-muted-foreground">Điện thoại: (028) 3823 xxxx - Email: info@abc-tech.com</p>
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
                <p className="mb-2">
                  <span className="text-muted-foreground">Chức vụ:</span>{" "}
                  <span className="font-medium">{employeeData.position}</span>
                </p>
                <p className="mb-2">
                  <span className="text-muted-foreground">Phòng ban:</span>{" "}
                  <span className="font-medium">{employeeData.department}</span>
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <span className="text-muted-foreground">Mã số thuế:</span>{" "}
                  <span className="font-medium">{employeeData.taxCode}</span>
                </p>
                <p className="mb-2">
                  <span className="text-muted-foreground">Ngày vào làm:</span>{" "}
                  <span className="font-medium">{employeeData.joinDate}</span>
                </p>
                <p className="mb-2">
                  <span className="text-muted-foreground">Tài khoản ngân hàng:</span>{" "}
                  <span className="font-medium">{employeeData.bankAccount}</span>
                </p>
                <p className="mb-2">
                  <span className="text-muted-foreground">Ngân hàng:</span>{" "}
                  <span className="font-medium">{employeeData.bankName}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin chấm công */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold text-lg">II. THÔNG TIN CHẤM CÔNG</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="mb-2">
                  <span className="text-muted-foreground">Số ngày làm việc tiêu chuẩn:</span>{" "}
                  <span className="font-medium">{attendanceData.standardWorkDays} ngày</span>
                </p>
                <p className="mb-2">
                  <span className="text-muted-foreground">Số ngày làm việc thực tế:</span>{" "}
                  <span className="font-medium">{attendanceData.actualWorkDays} ngày</span>
                </p>
              </div>
              <div>
                <p className="mb-2">
                  <span className="text-muted-foreground">Số giờ làm thêm:</span>{" "}
                  <span className="font-medium">{attendanceData.overtimeHours} giờ</span>
                </p>
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
                <p className="mb-2">
                  <span className="text-muted-foreground">Số ngày nghỉ phép:</span>{" "}
                  <span className="font-medium">{attendanceData.leaveCount} ngày</span>
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
                    <td className="py-2">Lương cơ bản</td>
                    <td className="py-2 text-right">{basicSalary.toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Phụ cấp</td>
                    <td className="py-2 text-right">{allowance.toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Thưởng</td>
                    <td className="py-2 text-right">{bonus.toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Làm thêm giờ</td>
                    <td className="py-2 text-right">{overtime.toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td className="py-2">Tổng thu nhập</td>
                    <td className="py-2 text-right">{payslip.totalSalary.toLocaleString("vi-VN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">2. Các khoản khấu trừ</h4>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Khoản mục</th>
                    <th className="py-2 text-right">Số tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Bảo hiểm xã hội (8%)</td>
                    <td className="py-2 text-right">{(basicSalary * 0.08).toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Bảo hiểm y tế (1.5%)</td>
                    <td className="py-2 text-right">{(basicSalary * 0.015).toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Bảo hiểm thất nghiệp (1%)</td>
                    <td className="py-2 text-right">{(basicSalary * 0.01).toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Thuế thu nhập cá nhân</td>
                    <td className="py-2 text-right">{incomeTax.toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Trừ đi muộn</td>
                    <td className="py-2 text-right">{lateDeduction.toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr className="border-b font-medium">
                    <td className="py-2">Tổng khấu trừ</td>
                    <td className="py-2 text-right">
                      {(insurance + incomeTax + lateDeduction).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg">LƯƠNG THỰC NHẬN:</h4>
                <span className="font-bold text-xl">{netSalary.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <p className="mt-2 text-sm italic">Bằng chữ: {numberToWords(netSalary)} đồng.</p>
            </div>
          </div>

          {/* Chữ ký */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-medium">NGƯỜI LẬP BẢNG</p>
              <p className="text-sm text-muted-foreground">(Ký, ghi rõ họ tên)</p>
              <div className="h-20"></div>
              <p>Nguyễn Thị Kế Toán</p>
            </div>
            <div>
              <p className="font-medium">TRƯỞNG PHÒNG NHÂN SỰ</p>
              <p className="text-sm text-muted-foreground">(Ký, ghi rõ họ tên)</p>
              <div className="h-20"></div>
              <p>Trần Văn Nhân Sự</p>
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

