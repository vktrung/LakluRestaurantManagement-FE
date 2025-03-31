import { Suspense } from "react"
import VoucherDashboard from "./components/voucher-dashboard"
import { VoucherTableSkeleton } from "./components/voucher-table-skeleton"

export default function VouchersPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản Lý Voucher</h1>
        <p className="text-muted-foreground">Tạo, xem, chỉnh sửa và quản lý các voucher giảm giá</p>
      </div>
      <Suspense fallback={<VoucherTableSkeleton />}>
        <VoucherDashboard />
      </Suspense>
    </div>
  )
}

