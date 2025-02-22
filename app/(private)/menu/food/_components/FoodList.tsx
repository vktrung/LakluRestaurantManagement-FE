import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import type { FoodItem } from '../_type';
import FoodItemComponent from './FoodItem';

interface FoodListProps {
  foods: FoodItem[];
  onEdit: (food: FoodItem) => void;
  onDelete: (id: number) => void;
}

const ITEMS_PER_PAGE = 6;

export default function FoodList({ foods, onEdit, onDelete }: FoodListProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => food.name.toLowerCase().includes(search.toLowerCase()));
  }, [foods, search]);

  const totalPages = Math.ceil(filteredFoods.length / ITEMS_PER_PAGE);

  const currentFoods = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFoods.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFoods, currentPage]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Input placeholder="Tìm kiếm món ăn..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-1/3" />
        <Link href="/food/add">
          <Button className="bg-gray-900 text-white hover:bg-gray-800">
            <Plus className="mr-2 h-5 w-5" /> Thêm món mới
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentFoods.map((food) => (
            <FoodItemComponent key={food.id} food={food} onEdit={() => onEdit(food)} onDelete={() => onDelete(food.id)} />
        ))}
      </div>

      <div className="flex justify-between border-t border-gray-200 pt-4 mt-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" /> Trước
        </Button>
        <span>Trang {currentPage} / {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
          Sau <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
