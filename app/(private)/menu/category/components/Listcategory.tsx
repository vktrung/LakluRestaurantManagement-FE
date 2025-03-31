'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IoAddCircleSharp } from 'react-icons/io5';
import { GrUpdate } from 'react-icons/gr';
import { MdDeleteOutline } from 'react-icons/md';
import { Category } from '@/features/category/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CategoryForm from './CategoryForm';
import DeleteConfirmation from './DeleteConfirmation';
import { AlertCircle } from 'lucide-react';

export default function DanhSachDanhMuc() {
  const [danhMuc, setDanhMuc] = useState<Category[]>([]);
  const {
    data: danhMucResponse,
    isLoading,
    isError,
    refetch,
  } = useGetCategoriesQuery();
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    if (danhMucResponse?.data) {
      const danhMucLoc = danhMucResponse.data.filter(
        danhMuc => danhMuc.isDeleted === false,
      );
      setDanhMuc(danhMucLoc);
    }
  }, [danhMucResponse]);

  // Handle search
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Open add dialog
  const handleAdd = () => {
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Success handlers for CRUD operations
  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedCategory(null);
    refetch();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedCategory(null);
    refetch();
  };

  // Filter categories based on search term
  const filteredCategories = danhMuc.filter(
    category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (isLoading)
    return <div className="container mx-auto p-6">Đang tải...</div>;

  if (isError)
    return (
      <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Lỗi khi tải danh mục</p>
        </div>
      </div>
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
                filteredCategories.map(category => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      {category.description || 'Không có mô tả'}
                    </TableCell>
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
                    {searchTerm
                      ? 'Không tìm thấy danh mục nào.'
                      : 'Không có danh mục nào.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm Danh Mục Mới</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSuccess={handleAddSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Danh Mục</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              category={selectedCategory}
              isEdit
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedCategory(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Xóa Danh Mục</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <DeleteConfirmation
              category={selectedCategory}
              onSuccess={handleDeleteSuccess}
              onCancel={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCategory(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
