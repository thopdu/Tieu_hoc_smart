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

Mở file `ecosystem.config.cjs` và điền `GEMINI_API_KEY` của bạn vào. Sau đó chạy:
```bash
pm2 start ecosystem.config.cjs
```

Bạn cũng có thể chạy trực tiếp nếu không muốn dùng file config:
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

## Bước 7: Kiểm tra ứng dụng đã chạy chưa

### 1. Kiểm tra tiến trình Node.js (PM2)
```bash
pm2 status
```
- Nếu cột `status` báo **online** (màu xanh): Ứng dụng đang chạy tốt.
- Nếu báo **errored** hoặc **stopped**: Hãy xem lỗi bằng lệnh `pm2 logs hanh-trang-hoc-tap`.

### 2. Kiểm tra Port nội bộ
```bash
curl -I http://localhost:3000
```
Nếu kết quả hiện `HTTP/1.1 200 OK`, nghĩa là mã nguồn đã chạy thành công trên server.

### 3. Kiểm tra Nginx
```bash
sudo systemctl status nginx
```
Đảm bảo Nginx đang ở trạng thái `active (running)`.

### 4. Kiểm tra Nhật ký (Logs) khi có lỗi
- Lọc lỗi từ PM2: `pm2 logs`
- Lọc lỗi từ Nginx: `sudo tail -f /var/log/nginx/error.log`

---
## Bước 8: Cấu hình Firebase để đăng nhập trên Tên miền riêng

Nếu bạn sử dụng tên miền riêng (ví dụ: `giasuhongtrang.edu.vn`), bạn **bắt buộc** phải thực hiện các bước sau để chức năng Đăng nhập hoạt động:

### 1. Thêm tên miền vào Firebase Console
1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Chọn dự án của bạn -> **Authentication** -> Tab **Settings**.
3. Tại phần **Authorized domains**, nhấn **Add domain** và nhập tên miền của bạn (ví dụ: `giasuhongtrang.edu.vn`).

### 2. Sử dụng HTTPS (Bắt buộc cho Google Auth)
Google Auth và các tính năng bảo mật của trình duyệt yêu cầu web phải chạy trên giao thức **HTTPS**.
- Bạn nên cài đặt SSL miễn phí bằng **Certbot (Let's Encrypt)**:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d giasuhongtrang.edu.vn
  ```

### 3. Cấu hình Google Cloud Console
1. Truy cập [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Tìm OAuth 2.0 Client ID bạn đang dùng cho dự án.
3. Thêm tên miền của bạn vào phần **Authorized JavaScript origins**.

---
## Bước 9: Cập nhật mã nguồn mới (Update & Reload)

Khi bạn có thay đổi về code và muốn đưa lên server, hãy chạy chuỗi lệnh sau:

1. **Kéo code mới về**: `git pull`
2. **Cài đặt thư viện (nếu có thêm mới)**: `npm install`
3. **Xây dựng lại ứng dụng**: `npm run build`
4. **Làm mới quy trình PM2**: 
   ```bash
   pm2 reload hanh-trang-hoc-tap
   ```
   *(Dùng `reload` sẽ tốt hơn `restart` vì nó không làm mất kết nối của người dùng đang truy cập).*

---
**Chúc mừng!** Ứng dụng của bạn hiện đã chạy tại địa chỉ IP hoặc tên miền của máy chủ.
