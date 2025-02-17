'use client';

import { useState } from 'react';
import clsx from 'clsx';
import styles from './MenuPage.module.scss';
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
  Pagination,
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

// Danh sách món ăn (dữ liệu mẫu với 50 món ăn)
const menuItems = Array.from({ length: 50 }, (_, index) => ({
  name: `Gà Parmesan ${index + 1}`,
  id: `#22314${index}`,
  stock: `${100 - index} phần`,
  category: 'Gà',
  price: `${(50 + index).toFixed(2)}₫`,
  availability: index % 2 === 0 ? 'Còn hàng' : 'Hết hàng',
  image: '/images/chicken-parmesan.jpg',
}));

// Cấu trúc bảng
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Tính toán các món ăn hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = menuItems.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={clsx(styles.container)}>
      {/* Danh mục món ăn */}
      <h2 className="mb-4">Danh mục món ăn</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {categories.map((cat, index) => (
            <Card key={index} className={clsx(styles.categoryCard)}>
              <p className="font-semibold">{cat.name}</p>
              <p className={clsx(styles.textMuted)}>{cat.count} món</p>
            </Card>
          ))}
        </div>
        <Button className={clsx(styles.button, styles.primary, 'ml-auto')}>
          Thêm danh mục
        </Button>
      </div>

      {/* Tabs */}
      <h2 className="mb-4">Thực đơn đặc biệt</h2>
      <div className="flex justify-between items-center mb-4">
        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={key => setSelectedTab(String(key))}
        >
          <Tab key="Thực đơn chính" title="Thực đơn chính" />
          <Tab key="Món phổ biến" title="Món phổ biến" />
          <Tab key="Tráng miệng & Đồ uống" title="Tráng miệng & Đồ uống" />
        </Tabs>
        <Button className={clsx(styles.button, styles.primary, 'ml-auto')}>
          Thêm món ăn
        </Button>
      </div>

      {/* Bảng danh sách món ăn */}
      <Table aria-label="Bảng danh sách món ăn" className={clsx(styles.table)}>
        <TableHeader className={clsx(styles.tableHeader)}>
          {columns.map(column => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          ))}
        </TableHeader>

        <TableBody>
          {currentItems.map((item, index) => (
            <TableRow key={index} className={clsx(styles.tableRow)}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <Image
                    src={item.image}
                    width={50}
                    height={50}
                    alt={item.name}
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className={clsx(styles.textMuted)}>
                      Mô tả ngắn về món ăn.
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.stock}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell
                className={
                  item.availability === 'Còn hàng'
                    ? 'text-green-500'
                    : 'text-red-500'
                }
              >
                {item.availability}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  isIconOnly
                  variant="light"
                  className={clsx(styles.button, styles.primary)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  isIconOnly
                  variant="light"
                  className={clsx(styles.button, styles.danger)}
                >
                  <Trash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Phân trang */}
      <div className="flex justify-center mt-4">
        <Pagination
          total={Math.ceil(menuItems.length / itemsPerPage)}
          initialPage={1}
          page={currentPage}
          onChange={page => setCurrentPage(page)}
          color="primary"
          showControls
          showShadow
        />
      </div>
    </div>
  );
}
