'use client'
import { useState, Fragment } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useGetRolesQuery, useGetRoleByIdQuery, useDeleteRoleByIdMutation } from "@/features/role/roleApiSlice"
import { Role } from "@/features/role/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import AddRoleDialog from '../add/AddRolePage'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

const RoleTable = () => {
  // Đã loại bỏ toast
  const { data: roleResponse, isLoading, error } = useGetRolesQuery();
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  // State lưu trữ role cần xóa (id)
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);
  // Mutation xóa role
  const [deleteRole, { isLoading: isDeleting, error: deleteError }] = useDeleteRoleByIdMutation();

  // Query lấy chi tiết role chỉ chạy khi selectedRoleId có giá trị
  const { data: roleDetail, isLoading: isLoadingRoleDetail } = useGetRoleByIdQuery(selectedRoleId!, {
    skip: !selectedRoleId,
  });

  if (isLoading) return <div>Đang tải danh sách vai trò...</div>;
  if (error) return <div>Có lỗi xảy ra khi tải dữ liệu</div>;

  // Lấy mảng role từ response
  const roles = roleResponse?.data;
  console.log("Danh sách role:", roleResponse);
  console.log("Chi tiết role:", roleDetail);

  // Khi nhấn "View", cập nhật state selectedRoleId để kích hoạt query lấy chi tiết role
  const handleView = (id: number) => {
    setSelectedRoleId(id);
  };

  const handleUpdate = (id: number) => {
    console.log("Cập nhật vai trò", id);
  };

  // Khi nhấn "Delete", mở dialog xác nhận
  const handleDelete = (id: number) => {
    setRoleToDelete(id);
  };

  // Hàm xác nhận xóa: gọi API xóa
  const confirmDelete = async () => {
    try {
      if (roleToDelete !== null) {
        await deleteRole(roleToDelete).unwrap();
        console.log("Xóa thành công, vai trò đã được xóa.");
        setRoleToDelete(null);
      }
    } catch (err) {
      console.error("Lỗi khi xóa: ", err);
    }
  };

  return (
    <Card className="shadow-lg p-4">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-xl font-bold">Danh sách vai trò</CardTitle>
        <AddRoleDialog />
      </CardHeader>
      <CardContent>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader>
            <TableRow>
              <TableHead className="px-6 py-3">ID</TableHead>
              <TableHead className="px-6 py-3">Tên</TableHead>
              <TableHead className="px-6 py-3">Mô tả</TableHead>
              <TableHead className="px-6 py-3">Số lượng người dùng</TableHead>
              <TableHead className="px-6 py-3">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles?.map((role: Role) => (
              <Fragment key={role.id}>
                <TableRow>
                  <TableCell className="px-6 py-4">{role.id}</TableCell>
                  <TableCell className="px-6 py-4">{role.name}</TableCell>
                  <TableCell className="px-6 py-4">{role.description}</TableCell>
                  <TableCell className="px-6 py-4">{role.userCount}</TableCell>
                  <TableCell className="px-6 py-4 space-x-2">
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
                {/* Hiển thị chi tiết role nếu được chọn */}
                {selectedRoleId === role.id && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-gray-50">
                      {isLoadingRoleDetail && <div>Đang tải chi tiết vai trò...</div>}
                      {roleDetail && (
                        <Card className="p-4">
                          <CardHeader>
                            <CardTitle>Chi tiết Vai trò</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p>
                              <strong>Tên:</strong> {roleDetail.data.name}
                            </p>
                            <p>
                              <strong>Mô tả:</strong> {roleDetail.data.description}
                            </p>
                            {/* Sử dụng Accordion để hiển thị danh sách permissions */}
                            <Accordion type="single" collapsible className="w-full mt-4">
                              <AccordionItem value="permissions">
                                <AccordionTrigger>Danh sách Permissions</AccordionTrigger>
                                <AccordionContent>
                                  <div className="flex flex-wrap gap-2">
                                    {roleDetail.data.permissions.map((permission) => (
                                      <Badge key={permission.id} className="bg-blue-500 text-white">
                                        {permission.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </CardContent>
                        </Card>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Dialog xác nhận xóa */}
      <Dialog open={!!roleToDelete} onOpenChange={(open) => { if (!open) setRoleToDelete(null) }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa vai trò này?</p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
            <Button onClick={confirmDelete}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default RoleTable
