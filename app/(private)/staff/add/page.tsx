"use client";

import React, { useState } from "react";
import { useCreateStaffMutation } from "@/features/staff/staffApiSlice";
import { useGetRolesQuery } from "@/features/role/roleApiSlice";

export default function AddStaffPage() {
  // State cho các trường input
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  // Mutation tạo mới staff
  const [createStaff, { isLoading }] = useCreateStaffMutation();
  // Query lấy danh sách roles
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRoleId(value ? Number(value) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      alert("Vui lòng chọn role cho nhân viên");
      return;
    }
    try {
      const newStaff = await createStaff({
        username,
        password,
        email,
        roleIds: [selectedRoleId], // Gửi mảng roleIds
      }).unwrap();
      console.log("Tạo mới thành công:", newStaff);
      // Xử lý sau khi tạo thành công (chuyển trang, hiển thị thông báo, ...)
    } catch (error) {
      console.error("Lỗi khi tạo nhân viên:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Thêm Nhân Viên</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block mb-1">Username</label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Nhập username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Nhập password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Nhập email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Select Role */}
        <div>
          <label className="block mb-1">Role</label>
          {rolesLoading ? (
            <p>Đang tải các role...</p>
          ) : (
            <select
              className="border border-gray-300 rounded px-3 py-2 w-full"
              onChange={handleRoleChange}
              value={selectedRoleId ?? ""}
            >
              <option value="">Chọn role</option>
              {rolesData?.data.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} - {role.description}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Nút submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isLoading ? "Đang lưu..." : "Lưu"}
        </button>
      </form>
    </div>
  );
}
