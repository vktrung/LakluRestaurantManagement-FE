'use client';

import React, { useState } from 'react';
import {
  useGetTablesQuery,
  useAddTableMutation,
  useUpdateTableMutation,
  useDeleteTableMutation,
} from '@/features/table/tableApiSlice';
import { ITable } from '@/features/table/type';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function getStatusTextColor(status: string) {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return 'text-green-500';
    case 'OCCUPIED':
      return 'text-red-500';
    case 'RESERVED':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}

export default function TableList() {
  const { data, isLoading, error } = useGetTablesQuery();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ITable | null>(null);

  const [addTable] = useAddTableMutation();
  const [updateTable] = useUpdateTableMutation();
  const [deleteTable] = useDeleteTableMutation();

  // State dùng chung cho form Thêm / Sửa
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState<number>(1);

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Đã có lỗi xảy ra.</p>;
  if (!data) return <p className="p-4">Không có dữ liệu.</p>;

  const tables = data.data;

  // Nhóm bàn theo capacity
  const groupedTables = tables.reduce<Record<number, ITable[]>>((acc, table) => {
    if (!acc[table.capacity]) {
      acc[table.capacity] = [];
    }
    acc[table.capacity].push(table);
    return acc;
  }, {});

  // Danh sách capacity sắp xếp tăng dần
  const capacities = Object.keys(groupedTables).sort(
    (a, b) => Number(a) - Number(b)
  );

  // Handler cho form Thêm bàn
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTable({ tableNumber, capacity }).unwrap();
      setOpenAddModal(false);
      setTableNumber('');
      setCapacity(1);
    } catch (err) {
      console.error('Add table error:', err);
    }
  };

  // Handler cho form Sửa bàn
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    try {
      await updateTable({ id: selectedTable.id, tableNumber, capacity }).unwrap();
      setOpenEditModal(false);
      setSelectedTable(null);
      setTableNumber('');
      setCapacity(1);
    } catch (err) {
      console.error('Update table error:', err);
    }
  };

  // Handler cho Xóa bàn
  const handleDeleteConfirm = async () => {
    if (!selectedTable) return;
    try {
      await deleteTable({ id: selectedTable.id }).unwrap();
      setOpenDeleteModal(false);
      setSelectedTable(null);
    } catch (err) {
      console.error('Delete table error:', err);
    }
  };

  // Mở modal Sửa, gán dữ liệu bàn cần sửa vào state
  const openEdit = (table: ITable) => {
    setSelectedTable(table);
    setTableNumber(table.tableNumber);
    setCapacity(table.capacity);
    setOpenEditModal(true);
  };

  // Mở modal Xóa, lưu lại bàn cần xóa
  const openDelete = (table: ITable) => {
    setSelectedTable(table);
    setOpenDeleteModal(true);
  };

  return (
    <div className="space-y-8 p-4">
      {/* Nút Thêm bàn */}
      <Button onClick={() => { setOpenAddModal(true); setTableNumber(''); setCapacity(1); }}>
        Thêm Bàn
      </Button>

      {/* Modal Thêm bàn */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Bàn</DialogTitle>
            <DialogDescription>Nhập thông tin bàn mới</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tableNumber">Số bàn</Label>
              <Input
                id="tableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="capacity">Sức chứa</Label>
              <Input
                id="capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpenAddModal(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Sửa bàn */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa Bàn</DialogTitle>
            <DialogDescription>Chỉnh sửa thông tin bàn</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="editTableNumber">Số bàn</Label>
              <Input
                id="editTableNumber"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="editCapacity">Sức chứa</Label>
              <Input
                id="editCapacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpenEditModal(false)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Xóa bàn */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa Bàn</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa bàn này không?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleDeleteConfirm}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hiển thị danh sách bàn đã nhóm theo sức chứa */}
      {capacities.map((cap) => {
        const capNumber = Number(cap);
        const tableGroup = groupedTables[capNumber];

        return (
          <div key={cap}>
            <h2 className="mb-2 text-lg font-semibold">
              {capNumber === 12 ? 'Max 12 Persons' : `${capNumber} Persons Table`}
            </h2>
            <hr className="mb-4 border-gray-300" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {tableGroup.map((table) => (
                <Card key={table.id} className="shadow-md p-4 text-center bg-white">
                  <CardHeader className="p-0">
                    <CardTitle className="text-3xl font-bold">
                      {table.tableNumber}
                    </CardTitle>
                    <CardDescription className={`text-lg ${getStatusTextColor(table.status)}`}>
                      {table.status}
                    </CardDescription>
                  </CardHeader>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button size="sm" onClick={() => openEdit(table)}>
                      Sửa
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openDelete(table)}>
                      Xóa
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="space-y-2 mt-8">
        <h3 className="font-semibold">Table Status:</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="text-sm">Served</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span className="text-sm">Reserved</span>
          </div>
        </div>
      </div>
    </div>
  );
}

