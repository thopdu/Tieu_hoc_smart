# Hướng dẫn triển khai dự án trên Linux (Nginx + PM2)

Dự án này là một ứng dụng Full-stack (React + Express). Để chạy ổn định trên Linux, chúng ta sẽ dùng **PM2** để quản lý quy trình Node.js và **Nginx** làm máy chủ đệm (Reverse Proxy).

## Bước 1: Cài đặt môi trường
Đảm bảo máy chủ của bạn đã cài đặt:
- Node.js (v18 trở lên)
- Nginx
- Git

## Bước 2: Chuẩn bị mã nguồn
1. Clone dự án:
   ```bash
   git clone <link-github-cua-ban>
   cd <thu-muc-du-an>
   ```
2. Cài đặt thư viện:
   ```bash
   npm install
   ```

## Bước 3: Build ứng dụng
Tạo bản build cho cả Frontend và Backend:
```bash
npm run build
```
Sau bước này, mã nguồn đã sẵn sàng trong thư mục `dist/`.

## Bước 4: Chạy server bằng PM2
Cài đặt PM2 nếu chưa có:
```bash
sudo npm install -g pm2
```
Chạy ứng dụng:
```bash
NODE_ENV=production GEMINI_API_KEY=your_key_here pm2 start dist/server.cjs --name "hanh-trang-hoc-tap"
```
*Lưu ý: Thay `your_key_here` bằng mã API Gemini của bạn.*

## Bước 5: Cấu hình Nginx
Tạo file cấu hình mới:
```bash
sudo nano /etc/nginx/sites-available/hanh-trang-hoc-tap
```

Dán nội dung sau vào (thay `your_domain.com` bằng tên miền hoặc IP của bạn):
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt cấu hình và khởi động lại Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/hanh-trang-hoc-tap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Bước 6: Cấu hình Tường lửa (nếu có)
```bash
sudo ufw allow 'Nginx Full'
```

---
**Chúc mừng!** Ứng dụng của bạn hiện đã chạy tại địa chỉ IP hoặc tên miền của máy chủ.
