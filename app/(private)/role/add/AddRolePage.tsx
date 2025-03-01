'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useGetPermissionQuery } from "@/features/permission/permissionApiSlice"
import { useAddRoleMutation } from "@/features/role/roleApiSlice"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface SubmittedData {
  name: string;
  description: string;
  permissions: number[];
}

const AddRoleDialog = () => {
  // Lấy danh sách permission (theo group) từ API
  const { data, isLoading: isPermissionLoading, isError: isPermissionError } = useGetPermissionQuery();
  const groups = data?.data;

  // Mutation thêm role mới
  const [addRole, { isLoading: isAdding, error: addRoleError }] = useAddRoleMutation();

  // State lưu trữ dữ liệu form
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  // State lưu trữ danh sách permission được chọn (lưu id của permission)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  // State để lưu dữ liệu đã submit, hiển thị ra màn hình
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  const handlePermissionChange = (permissionId: number) => {
    if (selectedPermissionIds.includes(permissionId)) {
      setSelectedPermissionIds(selectedPermissionIds.filter(id => id !== permissionId));
    } else {
      setSelectedPermissionIds([...selectedPermissionIds, permissionId]);
    }
  };

  const handleSubmit = async () => {
    // Tạo payload theo định dạng API yêu cầu
    const payload = {
      name: roleName,
      description,
      permissions: selectedPermissionIds,
    };

    try {
      const result = await addRole(payload).unwrap();
      setSubmittedData(payload);
      console.log("Role added: ", result);
    } catch (error) {
      console.error("Failed to add role: ", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Thêm</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm vai trò mới</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 my-4">
          <input
            type="text"
            placeholder="Tên vai trò"
            className="border rounded p-2"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
          <textarea
            placeholder="Mô tả"
            className="border rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          {/* Hiển thị danh sách Permission */}
          <div>
            <h3 className="font-semibold mb-2">Chọn Permissions</h3>
            {isPermissionLoading && <div>Đang tải permissions...</div>}
            {isPermissionError && <div>Có lỗi khi tải permissions.</div>}
            {groups && (
              <Accordion type="single" collapsible>
                {groups.map((group) => (
                  <AccordionItem value={group.groupAlias} key={group.groupAlias}>
                    <AccordionTrigger className="text-base font-medium">
                      {group.groupName}
                    </AccordionTrigger>
                    <AccordionContent>
                      {group.groupDescription && (
                        <p className="text-sm text-gray-500 mb-4">
                          {group.groupDescription}
                        </p>
                      )}
                      <div className="space-y-2">
                        {group.permissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-center gap-2 border p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              value={permission.id}
                              checked={selectedPermissionIds.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="form-checkbox"
                            />
                            <span className="text-sm font-medium">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isAdding}>Thêm</Button>
        </DialogFooter>

        {addRoleError && (
          <div className="mt-4 p-2 border rounded text-red-500">
            Có lỗi khi thêm vai trò. Vui lòng thử lại!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddRoleDialog;
