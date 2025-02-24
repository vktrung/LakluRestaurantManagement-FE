'use client'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useGetRolesQuery } from "@/features/role/roleApiSlice"
import { Role } from "@/features/role/types"


const RoleTable = () => {
  const { data: roleResponse, isLoading, error } = useGetRolesQuery()

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div>Có lỗi xảy ra khi tải dữ liệu</div>

  // Truy cập vào mảng Role từ roleResponse.data
  const roles = roleResponse?.data

  // Các hàm xử lý cho các action
  const handleView = (id: number) => {
    console.log("Xem chi tiết vai trò", id)
  }

  const handleUpdate = (id: number) => {
    console.log("Cập nhật vai trò", id)
  }

  const handleDelete = (id: number) => {
    console.log("Xóa vai trò", id)
  }

  const handleAdd = () => {
    console.log("Thêm vai trò mới")
  }

  return (
    <Card className="shadow-lg p-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl font-bold">Danh sách vai trò</CardTitle>
        <Button  onClick={handleAdd}>
          Thêm
        </Button>
      </CardHeader>
      <CardContent>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số lượng người dùng
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles?.map((role: Role) => (
              <TableRow key={role.id}>
                <TableCell className="px-6 py-4 whitespace-nowrap">{role.id}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">{role.name}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">{role.description}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">{role.userCount}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleView(role.id)}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleUpdate(role.id)}>
                    Update
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(role.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default RoleTable
