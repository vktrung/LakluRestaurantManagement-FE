# Laklu Restaurant Management - Frontend

## Yêu cầu hệ thống

- **OS**: Linux/Unix (tối ưu hóa cho Linux)
- **RAM**: Tối thiểu 1GB (khuyến nghị 2GB+)
- **CPU**: 1 core (khuyến nghị 2 cores+)
- **Node.js**: v16+ (khuyến nghị v18+)
- **NPM**: v8+

## Triển khai trên Linux

### 1. Chuẩn bị môi trường

```bash
# Cấp quyền thực thi cho các script
chmod +x deploy.sh minimal-build.sh

# Dọn dẹp môi trường
npm cache clean --force
rm -rf .next node_modules/.cache
```

### 2. Triển khai tự động

Cách đơn giản nhất để triển khai:

```bash
# Triển khai và khởi động ứng dụng
./deploy.sh
```

Script deploy.sh sẽ tự động:
1. Dọn dẹp môi trường
2. Build ứng dụng với cấu hình tối ưu cho Linux
3. Khởi động ứng dụng (với PM2 hoặc npm start)

### 3. Build thủ công

Nếu muốn build thủ công:

```bash
# Build với cấu hình tối ưu cho Linux
./minimal-build.sh

# Hoặc qua npm
npm run build
```

### 4. Khởi động với PM2

```bash
# Khởi động với PM2
pm2 start ecosystem.config.js

# Kiểm tra trạng thái
pm2 status

# Đảm bảo PM2 tự khởi động lại sau khi máy chủ khởi động
pm2 startup
pm2 save
```

## Khắc phục sự cố trên Linux

### Lỗi "Killed" do hết bộ nhớ

1. **Tăng swap space**:
   ```bash
   # Tạo swap file 2GB
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   
   # Đảm bảo swap được tự động mount sau khi khởi động
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. **Giải phóng bộ nhớ cache**:
   ```bash
   # Yêu cầu quyền sudo
   sudo sync
   sudo echo 3 > /proc/sys/vm/drop_caches
   ```

3. **Xóa các tiến trình Node.js đang chạy**:
   ```bash
   pkill -f node
   ```

### Kiểm tra logs

```bash
# Logs PM2
pm2 logs cmslaklu

# Logs Next.js nếu sử dụng npm start
cat app.log
```

## Cấu trúc ứng dụng

- `app/`: Routes và components chính
- `components/`: UI components có thể tái sử dụng
- `services/`: API services
- `store/`: Redux store
- `features/`: Các tính năng/module ứng dụng

## Tối ưu hóa cho môi trường Linux

- **minimal-build.sh**: Tự động phát hiện và tối ưu hóa cho tài nguyên hệ thống Linux
- **deploy.sh**: Script triển khai tối ưu hóa cho Linux
- **package.json**: Tách devDependencies để giảm kích thước cài đặt trên production

## Giấy phép

Bản quyền © SEP
