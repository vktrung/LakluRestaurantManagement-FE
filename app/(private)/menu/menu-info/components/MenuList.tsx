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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { MenuForm } from './MenuForm';
import MenuDeleteConfirm from './MenuDeleteConfirm';
import { IoAddCircleSharp } from "react-icons/io5";
import { GrUpdate } from "react-icons/gr";
import { GrFormView } from "react-icons/gr";
import { useRouter } from 'next/navigation';

const MenuList = () => {
  const { data, isLoading, error } = useGetMenusQuery();
  const [editMenu, setEditMenu] = useState<Menu | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  if (isLoading) return <div className="w-full p-6">Đang tải...</div>;
  if (error) return <div className="w-full p-6">Không thể tải danh sách thực đơn</div>;

  const menus = data?.data || [];

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter menus based on search term
  const filteredMenus = menus.filter((menu) =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle view menu items
  const handleViewMenuItems = (menuId) => {
    router.push(`./menu-item/${menuId}`);
  };

  return (
    <div className="space-y-4 ">
      {/* Title outside Card */}
      <h1 className="text-2xl font-bold">Quản Lý Thông Tin Menu</h1>

      <Card className="w-full">
        {/* Card Header */}
        <CardHeader className="w-full">
          {/* Search and Add button row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tìm kiếm menu..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="min-w-[250px]"
              />
            </div>
            {/* Add button with green color */}
            <Button 
              onClick={() => setAddDialogOpen(true)} 
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <IoAddCircleSharp className="text-xl" />
              <span>Thêm Thực Đơn</span>
            </Button>
          </div>
        </CardHeader>

        {/* Card Content - Table */}
        <CardContent className="w-full">
          <div className="w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Bắt Đầu</TableHead>
                  <TableHead>Kết Thúc</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenus.map((menu: Menu) => (
                  <TableRow key={menu.id}>
                    <TableCell>{menu.name}</TableCell>
                    <TableCell>
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
                    <TableCell>
                      {new Date(menu.startAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(menu.endAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* View button with green background */}
                        <Button
                          onClick={() => handleViewMenuItems(menu.id)}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          <GrFormView className="text-2xl text-white" />
                        </Button>

                        {/* Update button with yellow background */}
                        <Button
                          onClick={() => {
                            setEditMenu(menu);
                            setEditDialogOpen(true);
                          }}
                          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                          size="sm"
                        >
                          <GrUpdate className="text-xl text-white" />
                        </Button>

                        {/* Delete component */}
                        <MenuDeleteConfirm menuId={menu.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
