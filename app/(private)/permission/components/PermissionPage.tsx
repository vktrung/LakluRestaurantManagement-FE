'use client';

import { useGetPermissionQuery } from '@/features/permission/permissionApiSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';


export default function PermissionAccordion() {
  const { data, isLoading, isError } = useGetPermissionQuery();

  if (isLoading) return <div>Đang tải...</div>;
  if (isError) return <div>Lỗi khi tải dữ liệu permissions.</div>;

  // Mảng group được trả về trong data.data
  const groups = data?.data;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">Quản lý Quyền</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 
          type="single": chỉ mở được 1 AccordionItem tại 1 thời điểm
          type="multiple": có thể mở nhiều AccordionItem cùng lúc
        */}
        <Accordion type="single" collapsible>
          {groups?.map((group) => (
            <AccordionItem value={group.groupAlias} key={group.groupAlias}>
              {/* Tiêu đề accordion hiển thị groupName */}
              <AccordionTrigger className="text-base font-medium">
                {group.groupName}
              </AccordionTrigger>

              <AccordionContent>
                {/* Mô tả ngắn cho group, nếu có */}
                <p className="text-sm text-gray-500 mb-4">
                  {group.groupDescription}
                </p>

                {/* Danh sách permissions của group */}
                <div className="space-y-2">
                  {group.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {permission.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {permission.description ?? 'Không có mô tả'}
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
