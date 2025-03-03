'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IoAddCircleSharp } from "react-icons/io5";
import { GrUpdate } from "react-icons/gr";
import { MdDeleteOutline } from "react-icons/md";
import { Category } from '@/features/category/types';

export default function DanhSachDanhMuc() {
  const [danhMuc, setDanhMuc] = useState<Category[]>([]);
  const { data: danhMucResponse, isLoading, isError } = useGetCategoriesQuery();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (danhMucResponse?.data) {
      const danhMucLoc = danhMucResponse.data.filter(
        danhMuc => danhMuc.isDeleted === false,
      );
      setDanhMuc(danhMucLoc);
    }
  }, [danhMucResponse]);

  if (isLoading)
    return <div className="container mx-auto p-6">Đang tải...</div>;
  if (isError)
    return <div className="container mx-auto p-6">Lỗi khi tải danh mục</div>;

  // Chuyển hướng đến trang sửa danh mục
  const handleEdit = (danhMuc: Category) => {
    router.push(
      `/menu/category/edit/${danhMuc.id}?name=${danhMuc.name}&description=${
        danhMuc.description || ''
      }`,
    );
  };

  // Chuyển hướng đến trang xóa danh mục
  const handleDelete = (danhMuc: Category) => {
    router.push(`/menu/category/delete/${danhMuc.id}?name=${danhMuc.name}`);
  };

  // Handle add category
  const handleAdd = () => {
    router.push('./category/add');
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search term
  const filteredCategories = danhMuc.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Title outside Card */}
      <h1 className="text-2xl font-bold">Quản Lý Danh Mục</h1>

      <Card>
        {/* Card Header */}
        <CardHeader>
          {/* Search and Add button row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            {/* Add button with green color */}
            <Button 
              onClick={handleAdd}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <IoAddCircleSharp className="text-xl" />
              <span>Thêm Danh Mục</span>
            </Button>
          </div>
        </CardHeader>

        {/* Card Content - Table */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Mô Tả</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description || 'Không có mô tả'}</TableCell>
                    <TableCell>
                      {category.createdAt
                        ? new Date(category.createdAt).toLocaleDateString()
                        : 'Không có thông tin'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Update button with yellow background */}
                        <Button
                          onClick={() => handleEdit(category)}
                          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                          size="sm"
                        >
                          <GrUpdate className="text-xl text-white" />
                        </Button>

                        {/* Delete button with destructive variant */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(category)}
                        >
                          <MdDeleteOutline />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Không có danh mục nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

