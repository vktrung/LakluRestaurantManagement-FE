'use client';

import { useState } from 'react';
import { useGetMenusQuery } from '@/features/menu/menuApiSlice';
import { Menu } from '@/features/menu/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MenuForm } from './MenuForm';
import MenuDeleteConfirm from './MenuDeleteConfirm';
import Link from 'next/link';

const MenuList = () => {
  const { data, isLoading, error } = useGetMenusQuery();
  const [editMenu, setEditMenu] = useState<Menu | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (isLoading) return <Skeleton className="w-full h-32" />;
  if (error)
    return <p className="text-red-500">Không thể tải danh sách thực đơn</p>;

  const menus = data?.data || [];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-4 bg-gray-100 px-6 py-4 rounded-md border">
        <h2 className="text-xl font-bold text-gray-900">
          Quản Lý Thông Tin Menu
        </h2>
        <Button
          variant="default"
          className="px-4 py-2 text-lg bg-gray-900 text-white hover:bg-gray-800 rounded-md"
          onClick={() => setAddDialogOpen(true)}
        >
          Thêm Thực Đơn
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-gray-200">
          <TableRow>
            <TableHead className="px-4 py-3 font-semibold">Tên</TableHead>
            <TableHead className="px-4 py-3 font-semibold">
              Trạng Thái
            </TableHead>
            <TableHead className="px-4 py-3 font-semibold">Bắt Đầu</TableHead>
            <TableHead className="px-4 py-3 font-semibold">Kết Thúc</TableHead>
            <TableHead className="px-4 py-3 font-semibold text-center">
              Hành Động
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menus.map((menu: Menu) => (
            <TableRow key={menu.id} className="border-b">
              <TableCell className="px-4 py-3 font-medium">
                {menu.name}
              </TableCell>
              <TableCell className="px-4 py-3">
                {menu.status === 'ENABLE' ? (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Hoạt động
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                    Vô hiệu hóa
                  </span>
                )}
              </TableCell>
              <TableCell className="px-4 py-3">
                {new Date(menu.startAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-4 py-3">
                {new Date(menu.endAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="px-4 py-3 flex space-x-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditMenu(menu);
                    setEditDialogOpen(true);
                  }}
                >
                  Sửa
                </Button>
                <MenuDeleteConfirm menuId={menu.id} />
                {/* Thêm liên kết để xem các MenuItem của menu này */}
                <Link href={`./menu-item/${menu.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Xem món ăn trong menu
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Form thêm thực đơn */}
      {addDialogOpen && (
        <MenuForm
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onClose={() => setAddDialogOpen(false)}
        />
      )}

      {/* Form chỉnh sửa thực đơn */}
      {editDialogOpen && editMenu && (
        <MenuForm
          menu={editMenu}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditMenu(null);
          }}
        />
      )}
    </div>
  );
};

export default MenuList;
