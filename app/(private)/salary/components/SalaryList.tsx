import { useGetSalaryRatesQuery } from '@/features/salary/salaryApiSlice';
import EditSalaryModal from './EditSalaryModal';
import DeleteSalaryConfirm from './DeleteSalaryConfirm';
import AddSalaryModal from './AddSalaryModal';

import { useState } from 'react';
import { EmployeeSalaryResponse } from '@/features/salary/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MdDeleteOutline } from 'react-icons/md';
import { GrFormView, GrUpdate } from 'react-icons/gr';
import { IoAddCircleSharp } from 'react-icons/io5';
import { SalaryType } from '@/features/salary/types';

const salaryTypeMapping: { [key in SalaryType]: string } = {
  MONTHLY: 'Hàng tháng',
  HOURLY: 'Theo giờ',
  SHIFTLY: 'Theo ca',
};

export default function SalaryList() {
  const { data, isLoading, error } = useGetSalaryRatesQuery();
  const [editSalary, setEditSalary] = useState<EmployeeSalaryResponse | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) return <div className="text-gray-700">Đang tải...</div>;
  if (error)
    return <div className="text-red-500">Lỗi: {JSON.stringify(error)}</div>;

  const salaries = data?.data || [];

  const filteredSalaries = salaries.filter(
    salary =>
      salary.levelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salary.type.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý mức lương</h1>
          <p className="text-muted-foreground mt-1">Tạo và quản lý các mức lương trong hệ thống</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <IoAddCircleSharp className="mr-2 h-5 w-5" />
          Tạo mức lương mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Danh sách mức lương</CardTitle>
          <CardDescription>Quản lý các mức lương và phân loại trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Tên cấp bậc</TableHead>
                  <TableHead>Lương</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalaries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Không tìm thấy mức lương nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSalaries.map(salary => (
                    <TableRow key={salary.id}>
                      <TableCell>{salary.id}</TableCell>
                      <TableCell>{salary.levelName}</TableCell>
                      <TableCell>{salary.amount.toLocaleString('vi-VN')} VNĐ</TableCell>
                      <TableCell>{salaryTypeMapping[salary.type]}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => setEditSalary(salary)}
                            className="flex items-center gap-1"
                            size="sm"
                            variant="outline"
                          >
                            <GrUpdate className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(salary.id)}
                          >
                            <MdDeleteOutline className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
