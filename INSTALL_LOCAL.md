# Hướng dẫn cài đặt dự án Hành Trang Học Tập trên máy tính (Local)

Làm theo các bước dưới đây để chạy ứng dụng này ngay trên máy tính của bạn.

## 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.x hoặc mới hơn.
- **Trình quản lý gói**: npm (đi kèm khi cài Node.js).
- **Trình duyệt**: Chrome, Edge hoặc Firefox.

## 2. Các bước thực hiện

### Bước 1: Lấy mã nguồn
Nếu bạn đã đưa dự án lên GitHub:
```bash
git clone <link-github-cua-ban>
cd <ten-thu-muc>
```
Hoặc nếu bạn tải về từ bản Export ZIP: Hãy giải nén thư mục ra máy tính.

### Bước 2: Cài đặt thư viện (Dependencies)
Mở cửa sổ Terminal (hoặc Command Prompt/PowerShell) tại thư mục dự án và chạy:
```bash
npm install
```

### Bước 3: Cấu hình biến môi trường (Environment Variables)
Dự án này cần khóa API của Gemini để tạo câu hỏi tự động.
1. Tạo một file tên là `.env` ở thư mục gốc của dự án.
2. Mở file `.env` và dán nội dung sau vào:
   ```env
   GEMINI_API_KEY=AIzaSy... (Điền mã của bạn vào đây)
   ```
   *Lưu ý: Bạn có thể lấy mã miễn phí tại [aistudio.google.com](https://aistudio.google.com/app/apikey).*

### Bước 4: Chạy ứng dụng ở chế độ phát triển
Chạy lệnh sau:
```bash
npm run dev
```
Sau khi chạy, Terminal sẽ hiện thông báo: `Server running on http://localhost:3000`.

### Bước 5: Truy cập ứng dụng
Mở trình duyệt web và truy cập vào địa chỉ: [http://localhost:3000](http://localhost:3000)

---

## 💡 Lưu ý quan trọng về Firebase
Dự án có sử dụng Firebase để lưu trữ điểm số. Nếu bạn chạy local và muốn lưu dữ liệu thực sự:
1. Bạn cần tạo một project trên [Firebase Console](https://console.firebase.google.com/).
2. Tạo database Firestore và bật Authentication.
3. Cập nhật file `firebase-applet-config.json` với các thông số từ Project của bạn.

## 🚀 Build để chạy thực tế (Production)
Nếu bạn muốn máy chạy nhanh hơn và tối ưu hơn:
```bash
npm run build
npm start
```

Chúc bạn học tập và luyện tập vui vẻ!
