# Laklu Restaurant Management - Frontend

## Yêu cầu hệ thống tối thiểu

- **OS**: Linux/Unix hoặc Windows
- **RAM**: Tối thiểu 1GB (khuyến nghị 2GB+)
- **CPU**: 1 core (khuyến nghị 2 cores+)
- **Node.js**: v18+ (khuyến nghị v20)
- **NPM**: v9+

## Triển khai trong môi trường hạn chế tài nguyên

### 1. Chuẩn bị

Trước khi triển khai, đảm bảo hệ thống đã được dọn dẹp:

```bash
# Xoá cache
npm cache clean --force
# Xoá dữ liệu tạm thời
rm -rf .next node_modules/.cache tmp
```

### 2. Triển khai với ultralight-build.sh

Script `ultralight-build.sh` được tối ưu hóa đặc biệt cho các máy chủ có ít RAM:

```bash
# Cấp quyền thực thi cho script
chmod +x ultralight-build.sh

# Chạy script build siêu nhẹ
./ultralight-build.sh
```

### 3. Triển khai với PM2

Sau khi build thành công, sử dụng PM2 để chạy ứng dụng:

```bash
# Khởi động ứng dụng
pm2 start ecosystem.config.js

# Kiểm tra trạng thái
pm2 status

# Xem logs
pm2 logs cmslaklu
```

### 4. Sử dụng script deploy.sh

Script `deploy.sh` đã được tối ưu hóa để tự động triển khai:

```bash
# Cấp quyền thực thi
chmod +x deploy.sh

# Triển khai
./deploy.sh
```

## Khắc phục sự cố

### Lỗi "Killed" khi build

Nếu quá trình build bị killed do hết bộ nhớ:

1. **Tăng swap space** (nếu có quyền root):
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

2. **Xoá các tiến trình Node.js đang chạy**:
   ```bash
   pkill -f node
   ```

3. **Sử dụng build siêu nhẹ**:
   ```bash
   ./ultralight-build.sh
   ```

4. **Nếu vẫn gặp vấn đề**: Build trên máy có nhiều tài nguyên hơn, sau đó copy thư mục `.next` sang máy chủ.

## Cấu trúc ứng dụng

- `app/`: Chứa các components và routes
- `components/`: Chứa các UI components
- `features/`: Chứa các tính năng
- `services/`: Chứa các service gọi API
- `store/`: Redux store

## Tối ưu hóa cho môi trường production

Các tệp cấu hình đã được tối ưu cho môi trường sản xuất:

- **ecosystem.config.js**: Cấu hình PM2 tối ưu
- **ultralight-build.sh**: Script build tối ưu cho môi trường ít tài nguyên
- **package.json**: Đã tách devDependencies để giảm kích thước khi cài đặt trong chế độ production

## Giấy phép

Bản quyền © SEP
