'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Edit, XCircle, Plus } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetTablesQuery } from '@/features/table/tableApiSlice';
import { useGetUserMeQuery } from '@/features/auth/authApiSlice';
import { ITable } from '@/features/table/type';
import AddTableModal from './AddTableModal';
import EditTableModal from './EditTableModal';
import DisableTableModal from './DisableTableModal';

export default function RestaurantTables() {
  const { data, isLoading, error } = useGetTablesQuery();
  const { data: userData } = useGetUserMeQuery();
  const tables: ITable[] = data?.data || [];

  // Check if the user has the "Phục vụ" role
  const userRoles = userData?.data?.roleNames || [];
  const isWaiter = userRoles.includes('Phục vụ');

  const [filter, setFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ITable | null>(null);
  const [selectedTables, setSelectedTables] = useState<ITable[]>([]);
  const router = useRouter();

  // Filter tables by status
  const filteredTables =
    filter === 'all' ? tables : tables.filter((table) => table.status === filter);

  // Group tables by capacity
  const tablesByCapacity = {
    2: filteredTables.filter((table) => table.capacity === 2),
    4: filteredTables.filter((table) => table.capacity === 4),
    6: filteredTables.filter((table) => table.capacity === 6),
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return 'Đã đặt';
      case 'AVAILABLE':
        return 'Còn trống';
      case 'OCCUPIED':
        return 'Vô hiệu hóa';
      default:
        return status;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'RESERVED':
        return { border: 'border-red-400', bg: 'bg-red-50', badgeBg: 'bg-red-500' };
      case 'AVAILABLE':
        return { border: 'border-green-400', bg: 'bg-green-50', badgeBg: 'bg-green-500' };
      case 'OCCUPIED':
        return { border: 'border-yellow-400', bg: 'bg-yellow-50', badgeBg: 'bg-yellow-500' };
      default:
        return { border: 'border-gray-400', bg: 'bg-gray-50', badgeBg: 'bg-gray-500' };
    }
  };

  // Handle table selection
  const handleTableSelect = (table: ITable) => {
    if (table.status !== 'AVAILABLE') return; // Only allow selecting AVAILABLE tables

    const isSelected = selectedTables.some((t) => t.id === table.id);
    if (isSelected) {
      setSelectedTables(selectedTables.filter((t) => t.id !== table.id));
    } else {
      setSelectedTables([...selectedTables, table]);
    }
  };

  // Create order from selected tables
  const handleCreateOrder = () => {
    if (selectedTables.length === 0) {
      alert('Vui lòng chọn ít nhất một bàn để tạo order!');
      return;
    }
    const tableIds = selectedTables.map((table) => table.id).join(',');
    const capacities = selectedTables.map((table) => table.capacity).join(',');

    router.push(`./table/order?tableIds=${tableIds}&capacities=${capacities}`);
    setSelectedTables([]);
  };

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Đã có lỗi xảy ra.</p>;

  return (
    <div className="p-2 sm:p-6">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">Sơ Đồ Bàn</h1>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {!isWaiter && (
              <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="mr-1 h-3 w-3" /> Thêm bàn
              </Button>
            )}
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="h-9 text-sm w-[120px] sm:w-[180px]">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả bàn</SelectItem>
                <SelectItem value="AVAILABLE">Còn trống</SelectItem>
                <SelectItem value="RESERVED">Đã đặt</SelectItem>
                <SelectItem value="OCCUPIED">Vô hiệu hóa</SelectItem>
              </SelectContent>
            </Select>
            {selectedTables.length > 0 && (
              <Button size="sm" className="h-9" onClick={handleCreateOrder}>
                Tạo Order ({selectedTables.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 h-9">
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Tất cả
          </TabsTrigger>
          <TabsTrigger value="4" className="text-xs sm:text-sm">
            Bàn 4 người
          </TabsTrigger>
          <TabsTrigger value="6" className="text-xs sm:text-sm">
            Bàn 6 người
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4 sm:space-y-8">
            {Object.entries(tablesByCapacity).map(([capacity, tables]) =>
              tables.length > 0 && (
                <div key={capacity} className="space-y-2 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold border-b pb-1 sm:pb-2">
                    Khu vực bàn {capacity} người
                  </h2>
                  <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
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
                        onDisable={(table) => {
                          if (table.status === 'AVAILABLE' || table.status === 'OCCUPIED') {
                            setSelectedTable(table);
                            setShowDisableModal(true);
                          }
                        }}
                        onSelect={handleTableSelect}
                        isSelected={selectedTables.some((t) => t.id === table.id)}
                        isWaiter={isWaiter}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </TabsContent>

        <TabsContent value="4">
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold border-b pb-1 sm:pb-2">
              Khu vực bàn 4 người
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {tablesByCapacity[4].map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  translateStatus={translateStatus}
                  getStatusColors={getStatusColors}
                  onEdit={(table) => {
                    setSelectedTable(table);
                    setShowEditModal(true);
                  }}
                  onDisable={(table) => {
                    if (table.status === 'AVAILABLE' || table.status === 'OCCUPIED') {
                      setSelectedTable(table);
                      setShowDisableModal(true);
                    }
                  }}
                  onSelect={handleTableSelect}
                  isSelected={selectedTables.some((t) => t.id === table.id)}
                  isWaiter={isWaiter}
                />
              ))}
            </div>
            {tablesByCapacity[4].length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Không có bàn 4 người nào với trạng thái đã chọn
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="6">
          <div className="space-y-2 sm:space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold border-b pb-1 sm:pb-2">
              Khu vực bàn 6 người
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {tablesByCapacity[6].map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  translateStatus={translateStatus}
                  getStatusColors={getStatusColors}
                  onEdit={(table) => {
                    setSelectedTable(table);
                    setShowEditModal(true);
                  }}
                  onDisable={(table) => {
                    if (table.status === 'AVAILABLE' || table.status === 'OCCUPIED') {
                      setSelectedTable(table);
                      setShowDisableModal(true);
                    }
                  }}
                  onSelect={handleTableSelect}
                  isSelected={selectedTables.some((t) => t.id === table.id)}
                  isWaiter={isWaiter}
                />
              ))}
            </div>
            {tablesByCapacity[6].length === 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                Không có bàn 6 người nào với trạng thái đã chọn
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {!isWaiter && (
        <>
          <AddTableModal open={showAddModal} onClose={() => setShowAddModal(false)} />
          <EditTableModal
            open={showEditModal}
            onClose={() => setShowEditModal(false)}
            table={selectedTable}
          />
          <DisableTableModal
            open={showDisableModal}
            onClose={() => setShowDisableModal(false)}
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
  onDisable: (table: ITable) => void;
  onSelect: (table: ITable) => void;
  isSelected: boolean;
  isWaiter: boolean;
}

function TableCard({
  table,
  translateStatus,
  getStatusColors,
  onEdit,
  onDisable,
  onSelect,
  isSelected,
  isWaiter,
}: TableCardProps) {
  const colors = getStatusColors(table.status);
  const isActionAllowed = table.status === 'AVAILABLE' || table.status === 'OCCUPIED';
  const actionText = table.status === 'OCCUPIED' ? 'Kích hoạt' : 'Vô hiệu hóa';

  return (
    <Card
      className={`border-2 ${colors.border} ${
        isSelected ? 'bg-gray-300' : colors.bg
      } cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => onSelect(table)}
    >
      <CardContent className="p-2 sm:p-3">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-base font-bold">Bàn {table.tableNumber}</h2>
          <Badge className={`${colors.badgeBg} text-xs py-0 px-1 text-white`}>
            {translateStatus(table.status)}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-gray-600 text-xs">
          <Users size={14} />
          <span>Sức chứa: {table.capacity}</span>
        </div>
      </CardContent>
      {!isWaiter && (
        <CardFooter className="p-2 pt-0 flex flex-col gap-1">
          <div className="flex gap-1 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs px-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(table);
              }}
            >
              <Edit size={12} className="mr-1" /> Sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs px-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={(e) => {
                e.stopPropagation();
                if (isActionAllowed) {
                  onDisable(table);
                }
              }}
              disabled={!isActionAllowed}
            >
              <XCircle size={12} className="mr-1" /> {actionText}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}