'use client'
import { useGetStaffQuery } from "@/features/staff/staffApiSlice";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation"
const StaffTable = () => {
  const { data } = useGetStaffQuery();
  const router = useRouter();
  // console.log('data', data);

  const handleView = (id) => {
    console.log('View staff with id:', id);
    // Thực hiện logic xem chi tiết tại đây
  };

  const handleUpdate = (id) => {
    console.log('Update staff with id:', id);
    // Thực hiện logic cập nhật tại đây
  };

  const handleDelete = (id) => {
    console.log('Delete staff with id:', id);
    // Thực hiện logic xóa tại đây
  };

  const handleAdd = () => {
    console.log("Add new staff");
    router.push('/staff/add')
  };

  return (
    <Card className="p-4">
      <CardHeader className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh Sách Nhân Viên</h1>
        <Button onClick={handleAdd}>
          Add 
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Avatar</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>{staff.id}</TableCell>
                <TableCell>
                  {staff.avatar ? (
                    <img
                      src={staff.avatar}
                      alt={staff.username}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>{staff.username}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.phone}</TableCell>
                <TableCell>{staff.roles.join(", ")}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(staff.id)}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleUpdate(staff.id)}>
                      Update
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(staff.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StaffTable;
