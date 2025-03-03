import { useGetSalaryRatesQuery } from '@/features/salary/salaryApiSlice';
import EditSalaryModal from './EditSalaryModal';
import DeleteSalaryConfirm from './DeleteSalaryConfirm';
import AddSalaryModal from './AddSalaryModal'; 
import { useState } from 'react';
import { EmployeeSalaryResponse } from '@/features/salary/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Trash, Plus } from 'lucide-react';

export default function SalaryList() {
  const { data, isLoading, error } = useGetSalaryRatesQuery();
  const [editSalary, setEditSalary] = useState<EmployeeSalaryResponse | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false); // ✅ Manage Add Salary modal state

  if (isLoading) return <div className="text-gray-700">Đang tải...</div>;
  if (error)
    return <div className="text-red-500">Lỗi: {JSON.stringify(error)}</div>;

  const salaries = data?.data || [];

  return (
    <div className="p-6">
      <Card className="bg-white border border-gray-300 shadow-sm">
        {/* HEADER - Title on the left, Add Button on the right */}
        <div className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-black">
            Quản Lý Mức Lương
          </h2>
          <Button
            className="bg-black text-white hover:bg-gray-900 flex items-center gap-2"
            onClick={() => setIsAdding(true)} // ✅ Open Add Salary modal
          >
            <Plus size={16} /> Thêm Mức Lương
          </Button>
        </div>

        {/* TABLE */}
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-100">
                <TableHead className="text-black">ID</TableHead>
                <TableHead className="text-black">Tên Cấp Bậc</TableHead>
                <TableHead className="text-black">Lương</TableHead>
                <TableHead className="text-black">Loại</TableHead>
                <TableHead className="text-black">Phạm Vi</TableHead>
                <TableHead className="text-black text-center">
                  Hành Động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries.map(salary => (
                <TableRow
                  key={salary.id}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <TableCell className="text-black">{salary.id}</TableCell>
                  <TableCell className="text-gray-700">
                    {salary.levelName}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {salary.amount}
                  </TableCell>
                  <TableCell className="text-gray-700">{salary.type}</TableCell>
                  <TableCell className="text-gray-700">
                    {salary.isGlobal ? 'Có' : 'Không'}
                  </TableCell>
                  <TableCell className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-400 text-black hover:bg-gray-200"
                      onClick={() => setEditSalary(salary)}
                    >
                      <Pencil size={14} className="mr-1" /> Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() => setDeleteId(salary.id)}
                    >
                      <Trash size={14} className="mr-1" /> Xóa
                    </Button>
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
      )}{' '}
      {/* ✅ Use AddSalaryModal */}
    </div>
  );
}
