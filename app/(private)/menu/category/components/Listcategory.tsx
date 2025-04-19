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
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { IoAddCircleSharp } from 'react-icons/io5';
import { GrUpdate } from 'react-icons/gr';
import { MdDeleteOutline } from 'react-icons/md';
import { Category } from '@/features/category/types';
import { AlertCircle } from 'lucide-react';
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryConfirm from './DeleteCategoryConfirm';

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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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

  // Filter categories based on search term
  const filteredCategories = danhMuc.filter(
    category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (isLoading)
    return <div className="p-6">Đang tải...</div>;

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Danh Mục</h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục món ăn trong nhà hàng
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-black hover:bg-black/90"
        >
          <IoAddCircleSharp className="mr-2 h-4 w-4" />
          Tạo danh mục mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách danh mục</CardTitle>
          <CardDescription>
            Danh sách tất cả các danh mục món ăn trong nhà hàng
          </CardDescription>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="max-w-sm"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Tên danh mục</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map(category => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        {category.description || 'Không có mô tả'}
                      </TableCell>
                      <TableCell>
                        {category.createdAt
                          ? new Date(category.createdAt).toLocaleDateString('vi-VN')
                          : 'Không có thông tin'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsEditDialogOpen(true);
                            }}
                            variant="outline"
                            size="icon"
                          >
                            <GrUpdate className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedCategory(category);
                              setIsDeleteDialogOpen(true);
                            }}
                            variant="destructive"
                            size="icon"
                          >
                            <MdDeleteOutline className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      {searchTerm
                        ? 'Không tìm thấy danh mục nào.'
                        : 'Chưa có danh mục nào.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {isAddDialogOpen && (
        <AddCategoryModal
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            refetch();
          }}
        />
      )}

      {isEditDialogOpen && selectedCategory && (
        <EditCategoryModal
          category={selectedCategory}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedCategory(null);
            refetch();
          }}
        />
      )}

      {isDeleteDialogOpen && selectedCategory && (
        <DeleteCategoryConfirm
          category={selectedCategory}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedCategory(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
