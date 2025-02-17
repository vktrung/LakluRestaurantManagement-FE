'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Tab,
  Tabs,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableColumn,
  TableCell,
  Checkbox,
  Image,
} from '@nextui-org/react';
import { Edit, Trash } from 'lucide-react';

// Danh mục món ăn
const categories = [
  { name: 'Tất cả', count: 116 },
  { name: 'Pizza', count: 20 },
  { name: 'Burger', count: 15 },
  { name: 'Gà', count: 10 },
  { name: 'Bánh ngọt', count: 18 },
  { name: 'Đồ uống', count: 12 },
  { name: 'Hải sản', count: 16 },
];

// Danh sách món ăn (dữ liệu mẫu)
const menuItems = Array.from({ length: 50 }, (_, index) => ({
  name: `Gà Parmesan ${index + 1}`,
  id: `#22314${index}`,
  stock: `${100 - index} phần`,
  category: 'Gà',
  price: `${(50 + index).toFixed(2)}₫`,
  availability: index % 2 === 0 ? 'Còn hàng' : 'Hết hàng',
  image: '/images/chicken-parmesan.jpg',
}));

const columns = [
  { key: 'select', label: '' },
  { key: 'product', label: 'Sản phẩm' },
  { key: 'id', label: 'Mã món' },
  { key: 'stock', label: 'Số lượng' },
  { key: 'category', label: 'Danh mục' },
  { key: 'price', label: 'Giá' },
  { key: 'availability', label: 'Tình trạng' },
  { key: 'actions', label: 'Hành động' },
];

export default function MenuPage() {
  const [selectedTab, setSelectedTab] = useState('Thực đơn chính');

  return (
    <div className="bg-gray-100 text-black min-h-screen p-6">
      <h2 className="mb-4 text-2xl font-semibold">Danh mục món ăn</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {categories.map((cat, index) => (
            <Card
              key={index}
              className="p-4 bg-white border border-neutral-200 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200"
            >
              <p className="font-semibold text-black">{cat.name}</p>
              <p className="text-black/70">{cat.count} món</p>
            </Card>
          ))}
        </div>
        <Button className="ml-auto bg-white text-black border border-neutral-200 px-4 py-2 rounded-md hover:bg-gray-100">
          Thêm danh mục
        </Button>
      </div>

      <h2 className="mb-4 text-2xl font-semibold">Thực đơn đặc biệt</h2>
      <div className="flex justify-between items-center mb-4">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={key => setSelectedTab(String(key))}
        >
          <Tab key="Thực đơn chính" title="Thực đơn chính" />
          <Tab key="Món phổ biến" title="Món phổ biến" />
          <Tab key="Tráng miệng & Đồ uống" title="Tráng miệng & Đồ uống" />
        </Tabs>
        <Button className="ml-auto bg-white text-black border border-neutral-200 px-4 py-2 rounded-md hover:bg-gray-100">
          Thêm món ăn
        </Button>
      </div>

      <Table
        aria-label="Bảng danh sách món ăn"
        className="bg-gray-100 border border-gray-300 rounded-lg"
      >
        <TableHeader>
          {columns.map(column => (
            <TableColumn
              key={column.key}
              className="border-b border-gray-300 text-black bg-gray-100"
            >
              {column.label}
            </TableColumn>
          ))}
        </TableHeader>

        <TableBody>
          {menuItems.slice(0, 8).map((item, index) => (
            <TableRow
              key={index}
              className="border-b border-gray-300 bg-white hover:bg-gray-200 transition-colors"
            >
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Image
                    src={item.image || '/placeholder.svg'}
                    width={50}
                    height={50}
                    alt={item.name}
                  />
                  <div>
                    <p className="font-semibold text-black">{item.name}</p>
                    <p className="text-black/70">Mô tả ngắn về món ăn.</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-black">{item.id}</TableCell>
              <TableCell className="text-black">{item.stock}</TableCell>
              <TableCell className="text-black">{item.category}</TableCell>
              <TableCell className="text-black">{item.price}</TableCell>
              <TableCell
                className={
                  item.availability === 'Còn hàng'
                    ? 'text-green-600'
                    : 'text-red-500'
                }
              >
                {item.availability}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button className="bg-gray-100 text-black border border-gray-300 p-2 rounded-md hover:bg-gray-200">
                  <Edit size={16} />
                </Button>
                <Button className="bg-gray-100 text-black border border-gray-300 p-2 rounded-md hover:bg-gray-200">
                  <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
