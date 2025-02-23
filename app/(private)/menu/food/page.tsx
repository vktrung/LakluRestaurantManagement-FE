'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import FoodForm from './_components/FoodForm';
import type { FoodItem } from './_type';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ITEMS_PER_PAGE = 6;

// Dữ liệu giả (mock data)
const mockFoods: FoodItem[] = [
  {
    id: 1,
    name: 'Phở Bò',
    category: 'Món chính',
    price: 50000,
    status: 'Còn hàng',
    count: 10,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Phở bò truyền thống Việt Nam.',
  },
  {
    id: 2,
    name: 'Trà Sữa',
    category: 'Đồ uống',
    price: 30000,
    status: 'Còn hàng',
    count: 15,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Trà sữa trân châu thơm ngon.',
  },
  {
    id: 3,
    name: 'Phở Bò',
    category: 'Món chính ',
    price: 50000,
    status: 'Còn hàng',
    count: 10,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Phở bò truyền thống Việt Nam.',
  },
  {
    id: 4,
    name: 'Trà Sữa',
    category: 'Đồ uống',
    price: 30000,
    status: 'Còn hàng',
    count: 15,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Trà sữa trân châu thơm ngon.',
  },
  {
    id: 5,
    name: 'Phở Bò',
    category: 'Món chính ',
    price: 50000,
    status: 'Còn hàng',
    count: 10,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Phở bò truyền thống Việt Nam.',
  },
  {
    id: 6,
    name: 'Trà Sữa',
    category: 'Đồ uống',
    price: 30000,
    status: 'Còn hàng',
    count: 15,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Trà sữa trân châu thơm ngon.',
  },
  {
    id: 7,
    name: 'Phở Bò',
    category: 'Món chính ',
    price: 50000,
    status: 'Còn hàng',
    count: 10,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Phở bò truyền thống Việt Nam.',
  },
  {
    id: 8,
    name: 'Trà Sữa',
    category: 'Đồ uống',
    price: 30000,
    status: 'Còn hàng',
    count: 15,
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop',
    description: 'Trà sữa trân châu thơm ngon.',
  },
];

const categories = ['Món chính ', 'Đồ uống', 'Tráng miệng'];

export default function FoodManagement() {
  const [foods, setFoods] = useState<FoodItem[]>(mockFoods);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false); // Trạng thái popup chỉnh sửa
  const router = useRouter();

  // Lọc món ăn theo tìm kiếm & danh mục
  const filteredFoods = useMemo(() => {
    return foods.filter(
      (food) =>
        (food.name.toLowerCase().includes(search.toLowerCase()) ||
          food.category.toLowerCase().includes(search.toLowerCase())) &&
        (categoryFilter === '' || food.category === categoryFilter)
    );
  }, [foods, search, categoryFilter]);

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE);
  const currentFoods = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFoods.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFoods, currentPage]);

  // Xóa món ăn
  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      setFoods((prev) => prev.filter((food) => food.id !== id));
    }
  };

  // Cập nhật món ăn
  const handleSaveFood = (updatedFood: Omit<FoodItem, 'id'>) => {
    if (!editingFood) return;
    setFoods((prev) =>
      prev.map((food) =>
        food.id === editingFood.id ? { ...editingFood, ...updatedFood } : food
      )
    );
    setIsEditOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full bg-white border border-gray-200 shadow-md">
        <CardHeader className="border-b border-gray-200 pb-4">
          <CardTitle className="text-3xl font-bold text-gray-900">
            Quản lý Thực đơn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Input
              placeholder="Tìm kiếm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-1/3 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
            <select
              className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-gray-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Button
              size="lg"
              className="bg-gray-900 text-white hover:bg-gray-800"
              onClick={() => router.push('/menu/food/add')}
            >
              <Plus className="mr-2 h-5 w-5" /> Thêm món mới
            </Button>
          </div>

          {/* Danh sách món ăn */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentFoods.map((food) => (
              <Card key={food.id} className="border border-gray-200 shadow-sm">
                <Image
                  src={food.image}
                  alt={food.name}
                  width={400}
                  height={200}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {food.name}
                  </h3>
                  <Badge
                    className={`text-gray-800 transition-colors duration-300 ${
                      food.status === 'Còn hàng'
                        ? 'bg-gray-200 hover:bg-gray-300'
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {food.status}
                  </Badge>

                  <p className="text-white-600 mb-2">{food.category}</p>
                  <p className="text-2xl font-bold text-primary">
                    {food.price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </p>

                  <p className="mb-4 text-gray-700">{food.description}</p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingFood(food);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(food.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>

        {/* Phân trang */}
        <CardFooter className="flex justify-between items-center border-t border-gray-200 pt-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Trước
          </Button>
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Sau <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Popup chỉnh sửa món ăn */}
      {editingFood && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa món ăn</DialogTitle>
            </DialogHeader>
            <FoodForm
              onClose={() => setIsEditOpen(false)}
              onSave={handleSaveFood}
              initialData={editingFood}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
