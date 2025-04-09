"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Edit, Trash, Plus } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTablesQuery } from "@/features/table/tableApiSlice";
import { useGetUserMeQuery } from "@/features/auth/authApiSlice";
import { ITable } from "@/features/table/type";
import AddTableModal from "./AddTableModal";
import EditTableModal from "./EditTableModal";
import DeleteTableModal from "./DeleteTableModal";

export default function RestaurantTables() {
  const { data, isLoading, error } = useGetTablesQuery();
  const { data: userData } = useGetUserMeQuery();
  const tables: ITable[] = data?.data || [];
  
  // Check if the user has the "Phục vụ" role
  const userRoles = userData?.data?.roleNames || [];
  const isWaiter = userRoles.includes("Phục vụ");

  const [filter, setFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ITable | null>(null);
  const [selectedTables, setSelectedTables] = useState<ITable[]>([]); // Trạng thái lưu các bàn được chọn
  const router = useRouter();
  
  // Lọc bàn theo trạng thái
  const filteredTables =
    filter === "all" ? tables : tables.filter((table) => table.status === filter);

  // Nhóm bàn theo sức chứa
  const tablesByCapacity = {
    2: filteredTables.filter((table) => table.capacity === 2),
    4: filteredTables.filter((table) => table.capacity === 4),
    6: filteredTables.filter((table) => table.capacity === 6),
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "RESERVED":
        return "Đã đặt";
      case "AVAILABLE":
        return "Còn trống";
      case "OCCUPIED":
        return "Đang sử dụng";
      default:
        return status;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "RESERVED":
        return { border: "border-red-400", bg: "bg-red-50", badgeBg: "bg-red-500" };
      case "AVAILABLE":
        return { border: "border-green-400", bg: "bg-green-50", badgeBg: "bg-green-500" };
      case "OCCUPIED":
        return { border: "border-blue-400", bg: "bg-blue-50", badgeBg: "bg-blue-500" };
      default:
        return { border: "border-gray-400", bg: "bg-gray-50", badgeBg: "bg-gray-500" };
    }
  };

  // Hàm chọn hoặc bỏ chọn bàn
  const handleTableSelect = (table: ITable) => {
    if (table.status !== "AVAILABLE") return; // Chỉ cho phép chọn bàn trống

    const isSelected = selectedTables.some((t) => t.id === table.id);
    if (isSelected) {
      setSelectedTables(selectedTables.filter((t) => t.id !== table.id));
    } else {
      setSelectedTables([...selectedTables, table]);
    }
  };

  // Hàm tạo order từ các bàn đã chọn
  const handleCreateOrder = () => {
    if (selectedTables.length === 0) {
      alert("Vui lòng chọn ít nhất một bàn để tạo order!");
      return;
    }
    console.log("Tạo order cho các bàn:", selectedTables);
    // Thêm logic để gửi yêu cầu tạo order lên API tại đây
    // Sau khi tạo order thành công, có thể reset selectedTables
    setSelectedTables([]);
    router.push(`table/order`);
  };

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Đã có lỗi xảy ra.</p>;

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Sơ Đồ Bàn Nhà Hàng</h1>
          <div className="flex flex-wrap gap-2">
            {/* Ẩn nút "Thêm bàn mới" nếu là Phục vụ */}
            {!isWaiter && (
              <Button variant="outline" onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" /> Thêm bàn mới
              </Button>
            )}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả bàn</SelectItem>
                <SelectItem value="AVAILABLE">Còn trống</SelectItem>
                <SelectItem value="RESERVED">Đã đặt</SelectItem>
                <SelectItem value="OCCUPIED">Đang sử dụng</SelectItem>
              </SelectContent>
            </Select>
            {selectedTables.length > 0 && (
              <Button onClick={handleCreateOrder}>
                Tạo Order ({selectedTables.length} bàn)
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tất cả bàn</TabsTrigger>
          <TabsTrigger value="4">Bàn 4 người</TabsTrigger>
          <TabsTrigger value="6">Bàn 6 người</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-8">
            {Object.entries(tablesByCapacity).map(([capacity, tables]) =>
              tables.length > 0 && (
                <div key={capacity} className="space-y-4">
                  <h2 className="text-xl font-semibold border-b pb-2">
                    Khu vực bàn {capacity} người
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {tables.map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        translateStatus={translateStatus}
                        getStatusColors={getStatusColors}
                        onEdit={(table) => {
                          setSelectedTable(table);
                          setShowEditModal(true);
                        }}
                        onDelete={(table) => {
                          setSelectedTable(table);
                          setShowDeleteModal(true);
                        }}
                        onSelect={handleTableSelect}
                        isSelected={selectedTables.some((t) => t.id === table.id)}
                        isWaiter={isWaiter} // Pass the waiter role status
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </TabsContent>

        {/* Các TabsContent khác (2, 4, 6) tương tự, chỉ cần thêm isWaiter */}
      </Tabs>

      {/* Only render modals if not waiter */}
      {!isWaiter && (
        <>
          <AddTableModal open={showAddModal} onClose={() => setShowAddModal(false)} />
          <EditTableModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            table={selectedTable}
          />
          <DeleteTableModal
            open={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            table={selectedTable}
          />
        </>
      )}
    </div>
  );
}

interface TableCardProps {
  table: ITable;
  translateStatus: (status: string) => string;
  getStatusColors: (status: string) => { border: string; bg: string; badgeBg: string };
  onEdit: (table: ITable) => void;
  onDelete: (table: ITable) => void;
  onSelect: (table: ITable) => void;
  isSelected: boolean;
  isWaiter: boolean; // Add prop to check if user is waiter
}

function TableCard({
  table,
  translateStatus,
  getStatusColors,
  onEdit,
  onDelete,
  onSelect,
  isSelected,
  isWaiter, // Receive the waiter role status
}: TableCardProps) {
  const colors = getStatusColors(table.status);

  return (
    <Card
      className={`border-2 ${colors.border} ${
        isSelected ? "bg-gray-300" : colors.bg
      }`}
      onClick={() => onSelect(table)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Bàn {table.tableNumber}</h2>
          <Badge className={colors.badgeBg}>{translateStatus(table.status)}</Badge>
        </div>
        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <Users size={16} />
          <span>Sức chứa: {table.capacity} người</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {/* Hide Edit and Delete buttons for waiters */}
        {!isWaiter && (
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn việc nhấp nút "Sửa" kích hoạt onSelect
                onEdit(table);
              }}
            >
              <Edit size={16} className="mr-1" /> Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation(); // Ngăn việc nhấp nút "Xóa" kích hoạt onSelect
                onDelete(table);
              }}
            >
              <Trash size={16} className="mr-1" /> Xóa
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}