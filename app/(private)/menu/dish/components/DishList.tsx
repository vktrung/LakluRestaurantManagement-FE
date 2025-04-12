// app/(private)/menu/dish/components/DishList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  useGetPagedDishesQuery,
  useSearchDishesQuery,
} from '@/features/dish/dishApiSlice';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import {
  CalendarIcon,
  InfoIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { MdDeleteOutline } from 'react-icons/md';
import { GrUpdate } from 'react-icons/gr';
import { IoAddCircleSharp } from 'react-icons/io5';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
export interface DishListProps {
  onEdit: (id: number, dish: any) => void;
  onDelete: (id: number) => void;
  dishes?: any[];
  searchTerm?: string;
}

const DishList: React.FC<DishListProps> = ({
  onEdit,
  onDelete,
  dishes: propDishes,
  searchTerm = '',
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(6);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Use search API when search term is provided
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
  } = useSearchDishesQuery(debouncedSearchTerm, {
    skip: !debouncedSearchTerm || !!propDishes,
  });

  // Use paged API when no search term
  const {
    data: pagedDishResponse,
    isLoading: isPagedLoading,
    error: pagedError,
  } = useGetPagedDishesQuery(
    {
      page,
      size,
      sortBy,
      sortDirection,
    },
    {
      skip: !!debouncedSearchTerm || !!propDishes,
    },
  );

  // Determine the data source
  let dishes: any[] = [];
  let totalPages = 1;
  let currentPage = 0;
  let isFirstPage = true;
  let isLastPage = true;
  let totalElements = 0;
  let isLoading = false;
  let error = null;

  if (propDishes) {
    dishes = propDishes;
  } else if (debouncedSearchTerm && searchResults) {
    dishes = searchResults.data || [];
    isLoading = isSearchLoading;
    error = searchError;
    totalElements = dishes.length;
  } else {
    // Case 3: Using paged results
    dishes = pagedDishResponse?.data?.content || [];
    totalPages = pagedDishResponse?.data?.totalPages || 1;
    currentPage = pagedDishResponse?.data?.number || 0;
    isFirstPage = pagedDishResponse?.data?.first || true;
    isLastPage = pagedDishResponse?.data?.last || true;
    totalElements = pagedDishResponse?.data?.totalElements || 0;
    isLoading = isPagedLoading;
    error = pagedError;
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
  };

  const handleSortDirectionChange = (value: 'asc' | 'desc') => {
    setSortDirection(value);
  };

  const handleSizeChange = (value: string) => {
    setSize(parseInt(value));
    setPage(0); // Reset to first page when changing page size
  };

  if (!isMounted) return null;
  if (isLoading && !propDishes)
    return (
      <div className="flex items-center justify-center h-40 w-full">
        <div className="text-gray-500 font-medium">
          Đang tải danh sách món ăn...
        </div>
      </div>
    );
  if (error && !propDishes)
    return (
      <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
        <div className="text-red-500 text-center">
          Lỗi khi tải danh sách: {JSON.stringify(error)}
        </div>
      </div>
    );

  return (
    <div className="w-full">
      {!propDishes && !debouncedSearchTerm && (
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sắp xếp theo:</span>
              <Select value={sortBy} onValueChange={handleSortByChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chọn trường" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Tên</SelectItem>
                  <SelectItem value="price">Giá</SelectItem>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Thứ tự:</span>
              <Select
                value={sortDirection}
                onValueChange={handleSortDirectionChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Chọn thứ tự" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Tăng dần</SelectItem>
                  <SelectItem value="desc">Giảm dần</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Hiển thị:</span>
            <Select value={size.toString()} onValueChange={handleSizeChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="Số lượng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dishes.map(dish => (
          <Card
            key={dish.id}
            className="overflow-hidden border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full"
          >
            <div className="relative h-52 w-full bg-gray-100 overflow-hidden group">
              {dish.images && dish.images.length > 0 ? (
                <Image
                  src={dish.images[0].link || '/images/placeholder-image.jpg'}
                  alt={dish.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                  priority={true}
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-gray-200">
                  <InfoIcon className="h-12 w-12 text-gray-400" />
                  <span className="sr-only">Không có ảnh</span>
                </div>
              )}
            </div>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-xl font-semibold text-gray-900 line-clamp-1">
                {dish.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem]">
                {dish.description || 'Không có mô tả'}
              </p>
              <div className="flex items-center">
                <span className="font-bold text-lg text-black">
                  {dish.price.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-gray-500 pt-2">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>
                    Tạo: {new Date(dish.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {dish.updatedAt && (
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>
                      Cập nhật:{' '}
                      {new Date(dish.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
                {typeof dish.requiresPreparation === 'boolean' && (
                  <Badge
                    variant={dish.requiresPreparation ? 'secondary' : 'outline'}
                    className={`mt-1 text-xs ${
                      dish.requiresPreparation
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {dish.requiresPreparation
                      ? 'Cần chuẩn bị '
                      : 'Có Sẵn'}
                  </Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-3 pb-4 border-t border-gray-200">
              <Button
                onClick={() => onEdit(dish.id, dish)}
                className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                size="sm"
              >
                <GrUpdate className="text-xl text-white" />
                Sửa
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(dish.id)}
              >
                <MdDeleteOutline className="mr-1" />
                Xóa
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {dishes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-lg border border-gray-200">
          <InfoIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium text-lg">
            {debouncedSearchTerm
              ? 'Không tìm thấy món ăn nào phù hợp'
              : 'Không có món ăn nào trong danh sách'}
          </p>
        </div>
      )}

      {!propDishes && !debouncedSearchTerm && dishes.length > 0 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    isFirstPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageToShow = i;
                if (totalPages > 5) {
                  if (currentPage > 1) {
                    pageToShow = currentPage - 2 + i;
                  }

                  // Adjust if we're near the end
                  if (currentPage > totalPages - 3) {
                    pageToShow = totalPages - 5 + i;
                  }

                  // Make sure we're not showing negative pages or pages above total
                  pageToShow = Math.max(
                    0,
                    Math.min(pageToShow, totalPages - 1),
                  );
                }

                // Only show the page if it's valid
                if (pageToShow >= 0 && pageToShow < totalPages) {
                  return (
                    <PaginationItem key={pageToShow}>
                      <PaginationLink
                        isActive={pageToShow === currentPage}
                        onClick={() => handlePageChange(pageToShow)}
                      >
                        {pageToShow + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    isLastPage
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="text-center text-sm text-gray-500 mt-2">
            Hiển thị {dishes.length} trên tổng số {totalElements} món ăn
          </div>
        </div>
      )}
    </div>
  );
};

export default DishList;
