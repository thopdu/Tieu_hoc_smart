# Hành Trang Học Tập - Hệ thống ôn tập Tiểu học (AI Powered)

Website ôn tập dành cho học sinh tiểu học Việt Nam (Lớp 1-5) theo chương trình "Kết nối tri thức và cuộc sống". Tích hợp AI để sinh đề bài tự động.

## 🚀 Tính năng nổi bật
- **AI Question Generation**: Tự động tạo câu hỏi Toán & Tiếng Việt bám sát chương trình.
- **Practice Modes**: 
  - Ôn tập theo chuyên đề (Toán).
  - Ôn tập học kỳ (25 câu, phân bổ độ khó 30/40/30).
  - Luyện tập thông thường.
- **Gamification**: Bảng xếp hạng, điểm XP, huy hiệu thành tích.
- **Interactive UI**: Giao diện sống động, animation mượt mà, hỗ trợ cả câu hỏi trắc nghiệm và điền số.
- **Firebase Backend**: Quản lý người dùng và lưu trữ kết quả thực tế.

## 🛠 Công nghệ sử dụng
- **Frontend**: React 19, Vite, Tailwind CSS, Motion (Framer Motion), Lucide Icons.
- **Backend**: Node.js (Express), Gemini AI API (Google GenAI SDK).
- **Database/Auth**: Firebase Firestore & Firebase Auth.

## 💻 Hướng dẫn cài đặt (Local)

1. **Clone repository**:
   ```bash
   git clone <your-github-link>
   cd <folder-name>
   ```

2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường**:
   - Tạo file `.env` từ `.env.example`.
   - Nhập `GEMINI_API_KEY` của bạn.
   - Đảm bảo file `firebase-applet-config.json` chứa thông tin cấu hình project Firebase của bạn.

4. **Chạy ở chế độ phát triển**:
   ```bash
   npm run dev
   ```

5. **Build cho sản xuất**:
   ```bash
   npm run build
   npm start
   ```

## 📝 Giấy phép
Dự án được xây dựng trên nền tảng Google AI Studio Build.
