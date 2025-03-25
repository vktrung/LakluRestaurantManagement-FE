'use client';
import { Input } from '@/components/ui/input';

interface OrderSearchProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const OrderSearch = ({ searchTerm, onSearchChange }: OrderSearchProps) => {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Tìm kiếm đơn hàng..."
        value={searchTerm}
        onChange={onSearchChange}
        className="min-w-[250px]"
      />
    </div>
  );
};

export default OrderSearch;