'use client';
import { useState } from 'react';
import { useGetPermissionQuery, useUpdatePermissionMutation } from '@/features/permission/permissionApiSlice';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/accordion';
import { GrUpdate } from "react-icons/gr";
import UpdatePermissionModal from './UpdatePermissionModal';

export default function PermissionAccordion() {
  const { data, isLoading, isError } = useGetPermissionQuery();
  
  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // State modal update và lưu thông tin của permission được cập nhật
  const [updateOpen, setUpdateOpen] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState<number | null>(null);
  const [selectedPermissionName, setSelectedPermissionName] = useState("");
  const [selectedDescription, setSelectedDescription] = useState<string>("");

  // Hook mutation update
  const [updatePermission] = useUpdatePermissionMutation();

  if (isLoading) return <div>Đang tải...</div>;
  if (isError) return <div>Lỗi khi tải dữ liệu permissions.</div>;

  const groups = data?.data || [];

  // Lọc group + permission theo từ khóa
  const filteredGroups = groups.filter((group) => {
    const groupNameMatch = group.groupName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    if (groupNameMatch) return true;

    return group.permissions.some((permission) => {
      const nameMatch = permission.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const descMatch = permission.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      return nameMatch || descMatch;
    });
  });

  // Mở modal update, lưu ID, tên và mô tả hiện tại của permission
  const handleOpenUpdate = (id: number, name: string, desc: string | null) => {
    setSelectedPermissionId(id);
    setSelectedPermissionName(name);
    setSelectedDescription(desc || "");
    setUpdateOpen(true);
  };

  // Gọi mutation updatePermission khi modal lưu
  const handleUpdatePermission = async (newDesc: string) => {
    if (!selectedPermissionId) return;

    try {
      await updatePermission({
        id: selectedPermissionId,
        description: newDesc,
      }).unwrap();

      console.log('Cập nhật thành công');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
    } finally {
      setUpdateOpen(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Danh Sách Quyền</h1>
      
      <Card>
       
        <CardContent>
          <Accordion type="single" collapsible>
            {filteredGroups.map((group) => (
              <AccordionItem value={group.groupAlias} key={group.groupAlias}>
                <AccordionTrigger className="text-base font-medium">
                  {group.groupName}
                </AccordionTrigger>
                
                <AccordionContent>
                  <p className="text-sm text-gray-500 mb-4">
                    {group.groupDescription}
                  </p>
                  
                  <div className="space-y-2">
                    {group.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center justify-between rounded-lg border p-3  border-blue-200 hover:bg-gray-50"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {permission.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {permission.description ?? 'Không có mô tả'}
                          </div>
                        </div>
                        
                        {/* Nút Update */}
                        <Button
                          onClick={() => handleOpenUpdate(permission.id, permission.name, permission.description)}
                          className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                          size="sm"
                        >
                          <GrUpdate className="text-xl text-white" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Modal update */}
      <UpdatePermissionModal
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        permissionName={selectedPermissionName}
        currentDescription={selectedDescription}
        onSubmit={handleUpdatePermission}
      />
    </div>
  );
}
