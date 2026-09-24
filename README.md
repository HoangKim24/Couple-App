# 💖 Couple App (Locket + Habi Private PWA)

> Ứng dụng tương tác khoảnh khắc dành riêng cho 2 người, kết hợp giữa phong cách **Locket** (Chụp ảnh & ghi caption tức thì) và **Habi** (Tương tác cảm xúc 1-chạm real-time). Hoàn toàn **0 VNĐ trọn đời**, chạy dưới dạng **PWA chuẩn Native** trên iOS/Android.

---

## 🌟 Điểm Nổi Bật

1. **Khóa Mã Bí Mật 2 Người (No Email / No Password):**
   - Không cần đăng ký email hay mật khẩu rườm rà.
   - 👦 **Bạn Trai (Anh):** Nhập mã `00`
   - 👧 **Bạn Gái (Em):** Nhập mã `01`
   - Nhập **1 lần duy nhất lúc cài đặt**, sau đó mở app là vào thẳng ngay lập tức trong 0.1 giây.
2. **Khoảnh Khắc Locket Trung Tâm:**
   - Chụp ảnh từ camera WebRTC hoặc chọn ảnh từ thư viện máy, gõ dòng caption đè lên ảnh.
   - Bấm gửi ➔ Màn hình đối phương đổi ảnh ngay tức thì!
   - Xem cuộn phim kỷ niệm (Moments Roll), Story toàn màn hình, tải ảnh về máy.
3. **Thanh Cảm Xúc Habi 1-Chạm:**
   - 💋 **Gửi Nụ Hôn:** Vệt son môi và nụ hôn nổ bung màn hình đối phương.
   - ❤️ **Nhớ Bạn:** Mưa bong bóng trái tim rơi ngập tràn màn hình.
   - 🫂 **Ôm Cái:** Vòng tay ôm ấm áp.
   - 😤 **Bực Bội / Dỗi Hờn:** Rung màn hình + hiệu ứng dỗi đáng yêu để người kia biết đường dỗ ngọt.
4. **Bộ Đếm Ngày Yêu Nhau (Love Counter):**
   - Đếm số ngày, giờ, phút yêu nhau sống động theo thời gian thực.
5. **Hỗ Trợ Widget 4x4 Màn Hình Chính iOS:**
   - Có sẵn file mã nguồn [`scriptable-widget.js`](./scriptable-widget.js) để tích hợp vào ứng dụng miễn phí **Scriptable** trên iPhone.

---

## 📖 Hướng Dẫn Cài Đặt & Đăng Ký Database
👉 **Xem hướng dẫn chi tiết từng bước tại:** [`HUONG_DAN_DATABASE_VA_TEST.md`](./HUONG_DAN_DATABASE_VA_TEST.md)
- Giải đáp database lưu ở đâu (IndexedDB + Firebase Cloud).
- Hướng dẫn tạo Firebase Firestore miễn phí 100% trọn đời trong 2 phút.
- Hướng dẫn test 2 máy song song cực nhanh chỉ với 1 file [`may_a.html`](./may_a.html).

---

## 📱 Cách Kiểm Thử 2 Máy Song Song Bằng `may_a.html`
1. Mở file [`may_a.html`](./may_a.html) trong trình duyệt ➔ Nhập mã `00` (Bạn Trai).
2. Bấm nút **"Mở Tab Em (01)"** ở thanh trên cùng để mở thêm 1 tab Bạn Gái.
3. Đặt 2 cửa sổ cạnh nhau và trải nghiệm gửi ảnh Locket & thả cảm xúc Habi tức thì!

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
