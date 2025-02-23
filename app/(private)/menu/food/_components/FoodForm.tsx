"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FoodItem } from "../_type";


interface FoodFormProps {
  onClose: () => void;
  onSave: (food: Omit<FoodItem, "id">) => void;
  initialData?: Omit<FoodItem, "id">;
}

const categories = ["Đồ ăn chính", "Đồ uống", "Tráng miệng"];

export default function FoodForm({ onClose, onSave, initialData }: FoodFormProps) {
  const [food, setFood] = useState<Omit<FoodItem, "id">>(
    initialData || { name: "", category: "", price: 0, status: "Còn hàng", count: 0, image: "", description: "" }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFood({ ...food, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    setFood((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(food);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-300">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Thêm / Sửa Món Ăn</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tên món ăn */}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-1">Tên món ăn</label>
          <Input
            name="name"
            placeholder="Nhập tên món ăn"
            value={food.name}
            onChange={handleChange}
            className="border border-gray-400 rounded-md text-lg px-4 py-3 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        {/* Danh mục */}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-1">Danh mục</label>
          <Select value={food.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="border border-gray-400 rounded-md text-lg px-4 py-3 focus:ring-gray-500 focus:border-gray-500">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="hover:bg-gray-200 text-lg px-4 py-3">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Giá & Số lượng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-1">Giá</label>
            <Input
              name="price"
              type="number"
              placeholder="Nhập giá"
              value={food.price}
              onChange={handleChange}
              className="border border-gray-400 rounded-md text-lg px-4 py-3 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-800 mb-1">Số lượng</label>
            <Input
              name="count"
              type="number"
              placeholder="Nhập số lượng"
              value={food.count}
              onChange={handleChange}
              className="border border-gray-400 rounded-md text-lg px-4 py-3 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
        </div>

        {/* Ảnh món ăn */}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-1">URL Hình ảnh</label>
          <Input
            name="image"
            placeholder="Nhập URL hình ảnh"
            value={food.image}
            onChange={handleChange}
            className="border border-gray-400 rounded-md text-lg px-4 py-3 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        {/* Mô tả */}
        <div>
          <label className="block text-lg font-medium text-gray-800 mb-1">Mô tả</label>
          <Input
            name="description"
            placeholder="Nhập mô tả món ăn"
            value={food.description}
            onChange={handleChange}
            className="border border-gray-400 rounded-md text-lg px-4 py-3 focus:ring-gray-500 focus:border-gray-500"
          />
        </div>

        {/* Nút thao tác */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button type="submit" className="bg-gray-900 text-white text-lg px-6 py-3 rounded-md hover:bg-gray-800">
            Lưu
          </Button>
          <Button variant="outline" className="border border-gray-700 text-gray-900 text-lg px-6 py-3 rounded-md hover:bg-gray-200" onClick={onClose}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
