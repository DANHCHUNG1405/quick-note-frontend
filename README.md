# QuickNote Frontend

Chào mừng bạn đến với repo mã nguồn frontend của dự án **QuickNote**. Đây là giao diện người dùng được thiết kế hiện đại, cung cấp trải nghiệm quản lý và chỉnh sửa ghi chú mượt mà, hỗ trợ soạn thảo văn bản phong phú (rich text) và đồng bộ hóa dữ liệu theo thời gian thực.

## 🚀 Giới thiệu dự án

QuickNote Frontend là một ứng dụng web (dựa trên Next.js), mang đến cho người dùng khả năng:
- Tạo, chỉnh sửa và quản lý các ghi chú một cách trực quan.
- Trải nghiệm trình soạn thảo văn bản phong phú (Rich Text Editor) mạnh mẽ.
- Nhận cập nhật dữ liệu theo thời gian thực (Real-time) ngay khi có thay đổi.
- Giao diện thân thiện, hiện đại và tối ưu hóa hiệu suất.

## 🛠 Các công nghệ sử dụng

Dự án được xây dựng với các công nghệ Frontend hiện đại nhất:

### Core Framework & Thư viện chính
- **[Next.js (v15)](https://nextjs.org/)**: React framework mạnh mẽ hỗ trợ xây dựng ứng dụng web hiệu năng cao (sử dụng tính năng Turbopack).
- **[React (v19)](https://react.dev/)**: Thư viện JavaScript cốt lõi để xây dựng giao diện người dùng.
- **[TypeScript](https://www.typescriptlang.org/)**: Đảm bảo an toàn kiểu dữ liệu (type safety), giúp code rõ ràng và dễ bảo trì.

### Trình soạn thảo (Rich Text Editor)
- **[Tiptap](https://tiptap.dev/)**: Framework mạnh mẽ giúp xây dựng trình soạn thảo văn bản phong phú (tích hợp các tính năng như Highlight, Image, Link, Character Count, Text Align, v.v.).

### Quản lý Trạng thái & Dữ liệu (State & Data Fetching)
- **[React Query (TanStack Query)](https://tanstack.com/query/latest)**: Công cụ đắc lực để quản lý server state, data fetching, caching và đồng bộ dữ liệu.

### Real-time & WebSockets
- **[Socket.io-client](https://socket.io/)**: Kết nối với backend để nhận và xử lý các sự kiện theo thời gian thực.

### Styling & UI
- **[Tailwind CSS (v4)](https://tailwindcss.com/)**: Utility-first CSS framework giúp xây dựng và tùy chỉnh giao diện nhanh chóng, linh hoạt.
- **[Lucide React](https://lucide.dev/)**: Bộ thư viện icon đẹp mắt, nhất quán và nhẹ nhàng cho ứng dụng.

---

## ⚙️ Hướng dẫn cài đặt và chạy dự án (Local)

### 1. Cài đặt các dependencies
```bash
npm install
```

### 2. Thiết lập biến môi trường
Tạo file `.env.local` ở thư mục gốc và cấu hình các thông số cần thiết (ví dụ: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL` nếu có).

### 3. Chạy dự án
```bash
# Chế độ phát triển (sử dụng Turbopack để khởi động nhanh)
npm run dev

# Xây dựng (Build) dự án cho môi trường production
npm run build
npm run start
```
