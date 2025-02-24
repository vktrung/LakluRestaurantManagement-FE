'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCategoriesQuery } from '@/features/category/categoryApiSlice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Category } from '@/features/category/types';

export default function DanhSachDanhMuc() {
  console.log('Danh sách danh mục đang được render...');

  const [danhMuc, setDanhMuc] = useState<Category[]>([]);
  const { data: danhMucResponse, isLoading, isError } = useGetCategoriesQuery();
  const router = useRouter();

  useEffect(() => {
    if (danhMucResponse?.data) {
      const danhMucLoc = danhMucResponse.data.filter(
        danhMuc => danhMuc.isDeleted === false,
      );
      setDanhMuc(danhMucLoc);
      console.log('✅ Đã lấy và lọc danh mục:', danhMucLoc);
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

  return (
    <div className="container w-full p-6 bg-white">
      <div className="shadow-lg rounded-lg overflow-hidden bg-white">
        <div className="flex justify-between items-center p-6 bg-gray-100">
          <h2 className="text-2xl font-bold text-black">Quản Lý Danh Mục</h2>
          <Link href="./category/add">
            <Button variant="default" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Thêm Danh Mục
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto p-6">
          <table className="min-w-full table-auto text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Tên
                </th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Mô Tả
                </th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Ngày Tạo
                </th>
                <th className="px-4 py-2 text-sm font-medium text-gray-700">
                  Hành Động
                </th>
              </tr>
            </thead>
            <tbody>
              {danhMuc.length > 0 ? (
                danhMuc.map(danhMuc => (
                  <tr key={danhMuc.id} className="border-t hover:bg-gray-100">
                    <td className="px-4 py-2 text-sm text-gray-800">
                      {danhMuc.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {danhMuc.description || 'Không có mô tả'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {danhMuc.createdAt
                        ? new Date(danhMuc.createdAt).toLocaleDateString()
                        : 'Không có thông tin'}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleEdit(danhMuc)}
                        >
                          <Edit className="h-4 w-4" />
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleDelete(danhMuc)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-2 text-sm text-gray-500 text-center"
                  >
                    Không có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
