import { useGetSalaryRatesQuery } from '@/features/salary/salaryApiSlice';
import EditSalaryModal from './EditSalaryModal';
import DeleteSalaryConfirm from './DeleteSalaryConfirm';
import AddSalaryModal from './AddSalaryModal'; 

import { useState } from 'react';
import { EmployeeSalaryResponse } from '@/features/salary/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
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
  // Added search functionality similar to StaffTable
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <div className="text-gray-700">Đang tải...</div>;
  if (error) return <div className="text-red-500">Lỗi: {JSON.stringify(error)}</div>;

  const salaries = data?.data || [];

  // Filter salaries based on search term
  const filteredSalaries = salaries.filter(salary => 
    salary.levelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salary.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tiêu đề ngoài Card - consistent with StaffTable */}
      <h1 className="text-2xl font-bold">Quản Lý Mức Lương</h1>

      <Card>
        {/* Header styling consistent with StaffTable */}
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Tìm kiếm mức lương..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setIsAdding(true)} 
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <IoAddCircleSharp className="text-xl" />
              <span>Thêm Mức Lương</span>
            </Button>
          </div>
        </CardHeader>

        {/* Bảng với styling thống nhất */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên Cấp Bậc</TableHead>
                <TableHead>Lương</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Phạm Vi</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSalaries.map(salary => (
                <TableRow key={salary.id}>
                  <TableCell>{salary.id}</TableCell>
                  <TableCell>{salary.levelName}</TableCell>
                  <TableCell>{salary.amount}</TableCell>
                  <TableCell>{salary.type}</TableCell>
                  <TableCell>
                    {salary.isGlobal ? 'Có' : 'Không'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* Nút Update có nền màu vàng và icon màu trắng - consistent with StaffTable */}
                      <Button
                        onClick={() => setEditSalary(salary)}
                        className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                        size="sm"
                      >
                        <GrUpdate className="text-xl text-white" />
                      </Button>

                      {/* Nút Delete giữ nguyên variant destructive - consistent with StaffTable */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(salary.id)}
                      >
                        <MdDeleteOutline />
                      </Button>
                    </div>
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