# SnapQuiz AI - Ứng Dụng Quét Đề Thi Trắc Nghiệm & Chấm Điểm Thông Minh

Ứng dụng web trắc nghiệm hỗ trợ chụp ảnh đề thi/phiếu bài tập bằng camera điện thoại, sử dụng AI (Gemini 3.8 Flash Vision) để nhận diện câu hỏi và phát hiện đáp án đã được đánh dấu/khoanh tròn, sau đó trộn ngẫu nhiên câu hỏi để làm bài test và chấm điểm tự động.

---

## 🌟 Tính Năng Nổi Bật

- 📸 **Quét đề thi bằng Camera:** Mở camera trực tiếp (hỗ trợ chuyển đổi camera trước/sau), tải ảnh từ thư viện hoặc kéo thả ảnh đề thi.
- 🤖 **AI Vision Gemini 3.8:** Tự động trích xuất nội dung câu hỏi, các phương án A-B-C-D, và phát hiện chính xác phương án được khoanh tròn hoặc đánh dấu tích (✓).
- ✏️ **Xem & Chỉnh sửa đề:** Cho phép sửa nội dung câu hỏi, điều chỉnh đáp án đúng, thêm câu hỏi thủ công hoặc chụp thêm trang tiếp theo.
- 🔀 **Trộn đề thông minh (Shuffle):** Xáo trộn thứ tự các câu hỏi và các phương án A, B, C, D (vị trí đáp án đúng tự động cập nhật chính xác).
- ⏱️ **Làm bài test tương tác:** Hỗ trợ tính giờ đếm ngược, đánh dấu xem lại câu hỏi, bảng điều hướng câu hỏi trực quan, phím tắt A-B-C-D.
- 📊 **Chấm điểm & Báo cáo:** Tự động chấm điểm theo thang 10 và %, xem phân tích từng câu đúng/sai kèm lời giải thích chi tiết, làm lại toàn bộ hoặc chỉ làm lại câu sai.
- 💾 **Lưu trữ & Xuất/Nhập:** Tự động lưu kho đề trên trình duyệt, hỗ trợ tải về (Export) và nhập (Import) file JSON.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Yêu cầu môi trường
- [Node.js](https://nodejs.org/) phiên bản 18 trở lên
- npm hoặc yarn

### 2. Cài đặt thư viện
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ file `.env.example`:
```bash
cp .env.example .env
```

Mở file `.env` và điền khóa API Gemini của bạn:
```env
GEMINI_API_KEY="AIzaSy..."
PORT=3000
```
> Bạn có thể lấy API key miễn phí tại [Google AI Studio](https://aistudio.google.com/).

### 4. Khởi chạy ứng dụng (Development)
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:3000`

### 5. Build cho Production
```bash
npm run build
npm start
```

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, Express, tsx
- **AI Engine:** `@google/genai` (Model `gemini-3.8-flash`)
- **Bundler:** Vite
