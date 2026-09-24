# 💖 Couple App (Locket + Habi Private PWA)

> Ứng dụng tương tác khoảnh khắc dành riêng cho 2 người, kết hợp giữa phong cách **Locket** (Chụp ảnh & ghi caption tức thì) và **Habi** (Tương tác cảm xúc 1-chạm real-time). Hoàn toàn **0 VNĐ trọn đời**, chạy dưới dạng **PWA chuẩn Native** trên iOS/Android.

---

## 🌟 Điểm Nổi Bật

1. **Khóa Mã Bí Mật 2 Người (No Email / No Password):**
   - Không cần đăng ký email hay mật khẩu rườm rà.
   - Chỉ cần nhập **Mã bí mật (Passcode)** (Mặc định: `0119111`) và chọn vai trò (*Bạn Trai* hoặc *Bạn Gái*).
   - Nhập **1 lần duy nhất lúc cài đặt**, sau đó mở app là vào thẳng ngay lập tức trong 0.1 giây.
2. **Khoảnh Khắc Locket Trung Tâm:**
   - Chụp ảnh từ camera hoặc chọn ảnh từ máy, gõ dòng caption đè lên ảnh.
   - Bấm gửi ➔ Màn hình đối phương đổi ảnh ngay tức thì!
3. **Thanh Cảm Xúc Habi 1-Chạm:**
   - 💋 **Gửi Nụ Hôn:** Vệt son môi và nụ hôn nổ bung màn hình đối phương.
   - ❤️ **Nhớ Bạn:** Mưa bong bóng trái tim rơi ngập tràn màn hình.
   - 🫂 **Ôm Cái:** Vòng tay ôm ấm áp.
   - 😤 **Bực Bội / Dỗi Hờn:** Rung màn hình + hiệu ứng dỗi đáng yêu để người kia biết đường dỗ ngọt.
4. **Bộ Đếm Ngày Yêu Nhau (Love Counter):**
   - Đếm số ngày, giờ, phút yêu nhau sống động theo thời gian thực.
5. **Hỗ Trợ Widget 4x4 Màn Hình Chính iOS:**
   - Có sẵn file mã nguồn `scriptable-widget.js` để tích hợp vào ứng dụng miễn phí **Scriptable** trên iPhone.

---

## 📱 Cách Kiểm Thử UI/UX Trực Tiếp

Dự án có sẵn file **`test_ui_preview.html`** mô phỏng hoàn hảo môi trường iOS:
- **Chế độ 2 máy song song (Dual Sync):** Đặt điện thoại của Bạn và Người yêu cạnh nhau trên cùng màn hình. Bên này bấm gửi ảnh hoặc thả icon bực bội, bên kia đổi ảnh và nổ hiệu ứng rung chuông ngay trước mắt!
- **Chế độ Widget 4x4:** Xem trước widget hiển thị trên màn hình chính iPhone.

### Mở bằng trình duyệt:
Chỉ cần nhấp đúp mở file `test_ui_preview.html` trong bất kỳ trình duyệt nào (Chrome, Safari, Edge) là có thể trải nghiệm ngay lập tức mà không cần cài đặt thêm gì.

---

## 📲 Hướng Dẫn Cài Đặt Lên iPhone (PWA Full Màn Hình)

1. Mở đường link ứng dụng trên trình duyệt **Safari** của iPhone.
2. Bấm vào nút **Chia sẻ** (biểu tượng hình vuông có mũi tên chỉ lên ở đáy màn hình).
3. Cuộn xuống và chọn **"Thêm vào MH chính" (Add to Home Screen)**.
4. Bấm **Thêm (Add)** ở góc trên bên phải.
5. Biểu tượng **Couple** sẽ xuất hiện trên màn hình chính iPhone. Bấm vào sẽ mở toàn màn hình (không có thanh địa chỉ Safari), chạy mượt mà như app tải từ App Store!

---

## 🧩 Cài Đặt Widget 4x4 Cho iPhone Bằng Scriptable

1. Tải ứng dụng **Scriptable** miễn phí từ App Store trên iPhone.
2. Mở Scriptable, bấm dấu **[+]** ở góc trên bên phải.
3. Mở file [`scriptable-widget.js`](./scriptable-widget.js), copy toàn bộ nội dung và dán vào Scriptable.
4. Ra màn hình chính của iPhone, nhấn giữ vào khoảng trống để bật chế độ sửa ➔ Bấm dấu **[+]** ở góc trái trên ➔ Chọn **Scriptable** ➔ Chọn kích thước **Lớn (4x4)** hoặc **Vừa (2x4)**.
5. Nhấn giữ vào Widget vừa tạo ➔ Chọn **Edit Widget** ➔ Mục Script chọn script bạn vừa lưu.
6. Chúc mừng bạn đã có Widget đôi hiển thị ảnh Locket và tâm trạng người yêu ngay ngoài màn hình chính iPhone!

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** HTML5, Modern Vanilla CSS / Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Audio:** Web Audio API Synthesizer (tạo hiệu ứng âm thanh nụ hôn, chuông tình yêu 0 dependency).
- **PWA:** `manifest.json`, Service Worker `sw.js` (Offline support & iOS Standalone).
- **BaaS (Khuyến nghị production):** Firebase Firestore (Real-time snapshot sync) + Firebase Cloud Storage (Lưu trữ ảnh Locket).

---

*Phát triển với tình yêu dành riêng cho hai bạn 💕*
