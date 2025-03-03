'use client'
import React, { useState } from 'react';
import { useGetStaffQuery } from "@/features/staff/staffApiSlice";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { useRouter } from "next/navigation";
import { MdDeleteOutline } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { IoAddCircleSharp } from "react-icons/io5";
import { GrUpdate } from "react-icons/gr";

const StaffTable = () => {
  const { data } = useGetStaffQuery();
  const router = useRouter();

  // State cho ô tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // Xử lý thay đổi ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Xử lý các hành động khác
  const handleView = (id) => {
    console.log('View staff with id:', id);
  };

  const handleUpdate = (id) => {
    console.log('Update staff with id:', id);
  };

  const handleDelete = (id) => {
    console.log('Delete staff with id:', id);
  };

  const handleAdd = () => {
    router.push('/staff/add');
  };

  // Lọc dữ liệu theo từ khoá
  const filteredStaff = data?.data?.filter((staff) =>
    staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tiêu đề ngoài Card */}
      <h1 className="text-2xl font-bold">Danh Sách Nhân Viên</h1>

      <Card>
        {/* Phần Header của Card */}
        <CardHeader>
          {/* Hàng chứa ô tìm kiếm và nút Add */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search staff..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            {/* Nút Add màu xanh lá cây */}
            <Button 
              onClick={handleAdd} 
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <IoAddCircleSharp className="text-xl" />
              <span>Add Staff</span>
            </Button>
          </div>
        </CardHeader>

        {/* Nội dung chính (bảng) */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Avatar</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff?.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.id}</TableCell>
                  <TableCell>
                    {staff.avatar ? (
                      <img
                        src={staff.avatar}
                        alt={staff.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{staff.username}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>{staff.roles.join(", ")}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* Nút View có nền màu xanh lục và icon màu trắng */}
                      <Button
                        onClick={() => handleView(staff.id)}
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white"
                        size="sm"
                      >
                        <GrFormView className="text-2xl text-white" />
                      </Button>

                      {/* Nút Update có nền màu vàng và icon màu trắng */}
                      <Button
                        onClick={() => handleUpdate(staff.id)}
                        className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                        size="sm"
                      >
                        <GrUpdate className="text-xl text-white" />
                      </Button>

                      {/* Nút Delete giữ nguyên variant destructive */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(staff.id)}
                      >
                        <MdDeleteOutline />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffTable;
