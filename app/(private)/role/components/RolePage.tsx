'use client'
import { useState, Fragment } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { MdDeleteOutline } from "react-icons/md"
import { GrFormView } from "react-icons/gr"
import { IoAddCircleSharp } from "react-icons/io5"
import { GrUpdate } from "react-icons/gr"

const RoleTable = () => {
  const { data: roleResponse, isLoading, error } = useGetRolesQuery();
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteRole, { isLoading: isDeleting, error: deleteError }] = useDeleteRoleByIdMutation();
  
  // Thêm state cho tìm kiếm như trong StaffTable
  const [searchTerm, setSearchTerm] = useState("");

  // Query lấy chi tiết role chỉ chạy khi selectedRoleId có giá trị
  const { data: roleDetail, isLoading: isLoadingRoleDetail } = useGetRoleByIdQuery(selectedRoleId, {
    skip: !selectedRoleId,
  });

  if (isLoading) return <div>Đang tải danh sách vai trò...</div>;
  if (error) return <div>Có lỗi xảy ra khi tải dữ liệu</div>;

  // Lấy mảng role từ response
  const roles = roleResponse?.data;

  // Xử lý thay đổi ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Khi nhấn "View", cập nhật state selectedRoleId để kích hoạt query lấy chi tiết role
  const handleView = (id) => {
    setSelectedRoleId(id);
  };

  const handleUpdate = (id) => {
    console.log("Cập nhật vai trò", id);
  };

  // Khi nhấn "Delete", mở dialog xác nhận
  const handleDelete = (id) => {
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

  // Lọc dữ liệu theo từ khoá
  const filteredRoles = roles?.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tiêu đề ngoài Card giống StaffTable */}
      <h1 className="text-2xl font-bold">Danh Sách Vai Trò</h1>
      
      <Card>
        {/* Phần Header của Card */}
        <CardHeader>
          {/* Hàng chứa ô tìm kiếm và nút Add */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            {/* Nút Add màu xanh lá cây */}
            <AddRoleDialog>
              <Button 
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <IoAddCircleSharp className="text-xl" />
                <span>Add Role</span>
              </Button>
            </AddRoleDialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Số lượng người dùng</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles?.map((role) => (
                <Fragment key={role.id}>
                  <TableRow>
                    <TableCell>{role.id}</TableCell>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{role.userCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Nút View có nền màu xanh lục và icon màu trắng */}
                        <Button
                          onClick={() => handleView(role.id)}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          <GrFormView className="text-2xl text-white" />
                        </Button>

                        {/* Nút Update có nền màu vàng và icon màu trắng */}
                        <Button
                          onClick={() => handleUpdate(role.id)}
                          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                          size="sm"
                        >
                          <GrUpdate className="text-xl text-white" />
                        </Button>

                        {/* Nút Delete giữ nguyên variant destructive */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(role.id)}
                        >
                          <MdDeleteOutline />
                        </Button>
                      </div>
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
      </Card>

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
            <Button variant="destructive" onClick={confirmDelete}>
              <MdDeleteOutline className="mr-2" />
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RoleTable 