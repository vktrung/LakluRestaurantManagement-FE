import { useGetSalaryRatesQuery } from '@/features/salary/salaryApiSlice';
import EditSalaryModal from './EditSalaryModal';
import DeleteSalaryConfirm from './DeleteSalaryConfirm';
import AddSalaryModal from './AddSalaryModal';
import { useState } from 'react';
import { EmployeeSalaryResponse } from '@/features/salary/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MdDeleteOutline } from "react-icons/md";
import { GrFormView, GrUpdate } from "react-icons/gr";
import { IoAddCircleSharp } from "react-icons/io5";

export default function SalaryList() {
  const { data, isLoading, error } = useGetSalaryRatesQuery();
  const [editSalary, setEditSalary] = useState<EmployeeSalaryResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  if (isLoading) return <div className="text-gray-700">Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi: {JSON.stringify(error)}</div>;

  const salaries = data?.data || [];

  return (
    <div className="space-y-4 p-6">
      {/* Tiêu đề ngoài Card */}
      <h1 className="text-2xl font-bold">Quản Lý Mức Lương</h1>

      <Card className="bg-white border border-gray-300 shadow-sm">
        {/* Header chỉ chứa nút Thêm */}
        <CardHeader className="flex justify-end items-center p-4 bg-gray-100 border-b border-gray-200">
          <Button
            className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            onClick={() => setIsAdding(true)}
          >
            <IoAddCircleSharp size={16} />
            <span>Thêm Mức Lương</span>
          </Button>
        </CardHeader>

        {/* Nội dung bảng */}
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-100">
                <TableHead className="text-black">ID</TableHead>
                <TableHead className="text-black">Tên Cấp Bậc</TableHead>
                <TableHead className="text-black">Lương</TableHead>
                <TableHead className="text-black">Loại</TableHead>
                <TableHead className="text-black">Phạm Vi</TableHead>
                <TableHead className="text-black text-center">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.map(salary => (
                <TableRow
                  key={salary.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <TableCell className="text-black">{salary.id}</TableCell>
                  <TableCell className="text-gray-700">{salary.levelName}</TableCell>
                  <TableCell className="text-gray-700">{salary.amount}</TableCell>
                  <TableCell className="text-gray-700">{salary.type}</TableCell>
                  <TableCell className="text-gray-700">
                    {salary.isGlobal ? 'Có' : 'Không'}
                  </TableCell>
                  <TableCell className="flex gap-2 justify-center">
                    {/* Nút Sửa: sử dụng GrUpdate */}
                    <Button
                      onClick={() => setEditSalary(salary)}
                      className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                      size="sm"
                    >
                      <GrUpdate size={16} className="text-white" />
                      <span>Sửa</span>
                    </Button>
                    {/* Nút Xóa: sử dụng MdDeleteOutline */}
                    <Button
                      onClick={() => setDeleteId(salary.id)}
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white"
                      size="sm"
                    >
                      <MdDeleteOutline size={16} className="text-white" />
                      <span>Xóa</span>
                    </Button>
                    {/*
                    // Nếu muốn thêm nút Xem, uncomment phần dưới
                    <Button
                      onClick={() => {/* handle view */ /*}}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      <GrFormView size={16} className="text-white" />
                      <span>Xem</span>
                    </Button>
                    */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* MODALS */}
      {editSalary && (
        <EditSalaryModal
          salary={editSalary}
          onClose={() => setEditSalary(null)}
        />
      )}
      {deleteId && (
        <DeleteSalaryConfirm id={deleteId} onClose={() => setDeleteId(null)} />
      )}
      {isAdding && (
        <AddSalaryModal isOpen={isAdding} onClose={() => setIsAdding(false)} />
      )}
    </div>
  );
}
