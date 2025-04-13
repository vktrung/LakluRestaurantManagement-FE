"use client";

import React, { useState } from "react";
import { useCreateStaffMutation } from "@/features/staff/staffApiSlice";
import { useGetRolesQuery } from "@/features/role/roleApiSlice";
import { useGetSalaryRatesQuery, useCreateSalaryRateMutation } from "@/features/salary/salaryApiSlice";
import { SalaryType } from "@/features/salary/types";

export default function AddStaffPage() {
  // State cho các trường input
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedSalaryRateId, setSelectedSalaryRateId] = useState<number | null>(null);
  
  // State cho modal tạo mức lương mới
  const [isCreatingSalary, setIsCreatingSalary] = useState(false);
  const [newSalaryName, setNewSalaryName] = useState("");
  const [newSalaryAmount, setNewSalaryAmount] = useState<number>(0);
  const [newSalaryType, setNewSalaryType] = useState<SalaryType>("MONTHLY");

  // Mutation tạo mới staff
  const [createStaff, { isLoading }] = useCreateStaffMutation();
  
  // Query lấy danh sách roles
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  
  // Query lấy danh sách mức lương và mutation tạo mức lương mới
  const { data: salaryRatesData, isLoading: salaryRatesLoading } = useGetSalaryRatesQuery();
  const [createSalaryRate, { isLoading: isCreatingSalaryRate }] = useCreateSalaryRateMutation();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRoleId(value ? Number(value) : null);
  };

  const handleSalaryRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSalaryRateId(value ? Number(value) : null);
  };

  // Hàm xử lý tạo mức lương mới
  const handleCreateSalaryRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSalaryName.trim()) {
      alert("Vui lòng nhập tên mức lương");
      return;
    }
    
    if (newSalaryAmount <= 0) {
      alert("Vui lòng nhập số tiền lương hợp lệ");
      return;
    }
    
    try {
      const result = await createSalaryRate({
        levelName: newSalaryName,
        amount: newSalaryAmount,
        type: newSalaryType,
        isGlobal: true
      }).unwrap();
      
      // Nếu tạo thành công, chọn mức lương mới tạo
      if (result.data && result.data.length > 0) {
        setSelectedSalaryRateId(result.data[0].id);
      }
      
      // Đóng modal
      setIsCreatingSalary(false);
      
      // Reset form
      setNewSalaryName("");
      setNewSalaryAmount(0);
      setNewSalaryType("MONTHLY");
      
    } catch (error) {
      console.error("Lỗi khi tạo mức lương mới:", error);
      alert("Không thể tạo mức lương mới. Vui lòng thử lại sau.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) {
      alert("Vui lòng chọn role cho nhân viên");
      return;
    }
    if (!department) {
      alert("Vui lòng nhập phòng ban");
      return;
    }
    if (!selectedSalaryRateId) {
      alert("Vui lòng chọn mức lương cho nhân viên");
      return;
    }
    try {
      const newStaff = await createStaff({
        username,
        password,
        email,
        department,
        roleIds: [selectedRoleId],
        salaryRateId: selectedSalaryRateId,
      }).unwrap();
      console.log("Tạo mới thành công:", newStaff);
      // Xử lý sau khi tạo thành công (chuyển trang, hiển thị thông báo, ...)
    } catch (error) {
      console.error("Lỗi khi tạo nhân viên:", error);
    }
  };

  // Hàm format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Hàm dịch loại lương
  const translateSalaryType = (type: string) => {
    switch (type) {
      case "MONTHLY": return "Tháng";
      case "HOURLY": return "Giờ";
      case "SHIFTLY": return "Ca";
      default: return type;
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

        {/* Department */}
        <div>
          <label className="block mb-1">Phòng ban</label>
          <input
            type="text"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Nhập phòng ban..."
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
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

        {/* Select Salary Rate */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block">Mức lương</label>
            <button 
              type="button" 
              className="text-blue-500 text-sm hover:underline"
              onClick={() => setIsCreatingSalary(true)}
            >
              + Thêm mức lương mới
            </button>
          </div>
          
          {salaryRatesLoading ? (
            <p>Đang tải mức lương...</p>
          ) : (
            <select
              className="border border-gray-300 rounded px-3 py-2 w-full"
              onChange={handleSalaryRateChange}
              value={selectedSalaryRateId ?? ""}
            >
              <option value="">Chọn mức lương</option>
              {salaryRatesData?.data.map((salary) => (
                <option key={salary.id} value={salary.id}>
                  {salary.levelName} - {formatCurrency(salary.amount)} ({translateSalaryType(salary.type)})
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

      {/* Modal tạo mức lương mới */}
      {isCreatingSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Thêm mức lương mới</h2>
            <form onSubmit={handleCreateSalaryRate} className="space-y-4">
              <div>
                <label className="block mb-1">Tên mức lương</label>
                <input
                  type="text"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Ví dụ: Cấp 1, Senior, Junior..."
                  value={newSalaryName}
                  onChange={(e) => setNewSalaryName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block mb-1">Số tiền</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  placeholder="Nhập số tiền..."
                  value={newSalaryAmount}
                  onChange={(e) => setNewSalaryAmount(Number(e.target.value))}
                  min="0"
                />
              </div>
              
              <div>
                <label className="block mb-1">Loại lương</label>
                <select
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                  value={newSalaryType}
                  onChange={(e) => setNewSalaryType(e.target.value as SalaryType)}
                >
                  <option value="MONTHLY">Theo tháng</option>
                  <option value="HOURLY">Theo giờ</option>
                  <option value="SHIFTLY">Theo ca</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  className="border border-gray-300 px-4 py-2 rounded"
                  onClick={() => setIsCreatingSalary(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSalaryRate}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {isCreatingSalaryRate ? "Đang lưu..." : "Lưu mức lương"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
