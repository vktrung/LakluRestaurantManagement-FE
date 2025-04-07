import { Suspense } from "react"
import { UserManagement } from "./components/user-management"
import { UserManagementSkeleton } from "./components/user-management-skeleton"

export default function UsersPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Quản lý tài khoản</h2>
        </div>
        <Suspense fallback={<UserManagementSkeleton />}>
          <UserManagement />
        </Suspense>
      </div>
    </div>
  )
}
