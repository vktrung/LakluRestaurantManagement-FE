# Hướng dẫn cài đặt và triển khai trên Linux

## Các bước cài đặt

### 1. Cài đặt Node.js và NPM

```bash
# Cài đặt Node.js 18.x trên Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Kiểm tra phiên bản
node -v  # Kết quả mong đợi: v18.x.x
npm -v   # Kết quả mong đợi: 8.x.x hoặc cao hơn
```

### 2. Cài đặt PM2 (Khuyến nghị)

```bash
# Cài đặt PM2 toàn cục
sudo npm install -g pm2

# Kiểm tra cài đặt
pm2 --version
```

### 3. Tải mã nguồn

```bash
# Clone từ git
git clone [đường dẫn repository] laklu-frontend
cd laklu-frontend

# Hoặc giải nén từ file zip
unzip laklu-frontend.zip
cd laklu-frontend
```

### 4. Tối ưu hóa hệ thống trước khi build

```bash
# Kiểm tra bộ nhớ
free -h

# Tạo swap nếu cần thiết (nếu RAM < 2GB)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Thêm vào fstab để duy trì sau khi khởi động lại
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Kiểm tra lại bộ nhớ với swap
free -h
```

## Triển khai ứng dụng

### 1. Triển khai tự động (Đề xuất)

```bash
# Cấp quyền thực thi
chmod +x deploy.sh minimal-build.sh

# Triển khai
./deploy.sh
```

### 2. Triển khai thủ công

```bash
# Bước 1: Build
chmod +x minimal-build.sh
./minimal-build.sh

# Bước 2: Khởi động với PM2
pm2 start ecosystem.config.js

# Đảm bảo ứng dụng tự khởi động khi hệ thống khởi động lại
pm2 startup
pm2 save
```

## Quản lý ứng dụng

### Kiểm tra trạng thái

```bash
# Xem trạng thái ứng dụng
pm2 status

# Xem logs
pm2 logs cmslaklu
```

### Khởi động lại hoặc dừng ứng dụng

```bash
# Khởi động lại
pm2 restart cmslaklu

# Dừng
pm2 stop cmslaklu

# Khởi động
pm2 start cmslaklu
```

## Xử lý sự cố

### Lỗi khi build

1. **Xác định lỗi trong logs**:
   ```bash
   # Kiểm tra logs trong terminal
   cat app.log
   ```

2. **Dọn dẹp và thử lại**:
   ```bash
   # Dọn dẹp hoàn toàn
   rm -rf node_modules .next
   npm cache clean --force
   
   # Thử lại
   ./minimal-build.sh
   ```

3. **Giải phóng bộ nhớ**:
   ```bash
   # Dừng các tiến trình không cần thiết
   pkill -f node
   
   # Giải phóng bộ nhớ cache (cần quyền sudo)
   sudo sh -c "sync; echo 3 > /proc/sys/vm/drop_caches"
   ```

### Lỗi khi chạy

1. **Kiểm tra logs**:
   ```bash
   pm2 logs cmslaklu --lines 100
   ```

2. **Khởi động lại ứng dụng**:
   ```bash
   pm2 restart cmslaklu
   ```

## Cập nhật ứng dụng

Để cập nhật:

```bash
# Pull mã nguồn mới
git pull

# Hoặc giải nén phiên bản mới

# Triển khai lại
./deploy.sh
```

## Khôi phục bản sao lưu

Nếu cần khôi phục bản sao lưu:

```bash
# Khôi phục thư mục .next từ backup
cp -r backup/.next .

# Khởi động lại ứng dụng
pm2 restart cmslaklu
``` 