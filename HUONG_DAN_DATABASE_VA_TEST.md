# 📖 CẨM NANG TOÀN TẬP: DATABASE & HƯỚNG DẪN TEST 2 MÁY (COUPLE APP)

> **Dành riêng cho 2 bạn 💕**  
> Mật khẩu đăng nhập: **`00` (Bạn Trai / Anh)** • **`01` (Bạn Gái / Em)**

---

## 📌 PHẦN 1: DATABASE CỦA APP ĐANG LƯU Ở ĐÂU?

Hệ thống lưu trữ của ứng dụng được xây dựng theo **mô hình 3 tầng hiện đại (Multi-tier Storage)**, giải quyết triệt để vấn đề "không bị mất ảnh", "không tốn tiền" và "đồng bộ tức thì":

| Tầng lưu trữ | Công nghệ sử dụng | Lưu ở đâu? | Tác dụng |
| :--- | :--- | :--- | :--- |
| **Tầng 1: Local Storage** | **IndexedDB & LocalStorage** | Bộ nhớ an toàn trên chính điện thoại của mỗi người | **Lưu trữ vĩnh viễn:** Toàn bộ cuộn phim kỷ niệm, ảnh Locket gốc sắc nét, ngày kỷ niệm. Dù mất mạng, tắt máy hay đóng trình duyệt thì mở lại ảnh vẫn còn nguyên vẹn 100%. Không lo bị đầy bộ nhớ! |
| **Tầng 2: Local Inter-tab Sync** | **BroadcastChannel API** | Giao tiếp phần cứng trình duyệt | **Đồng bộ siêu tốc 0.001 giây (0ms latency):** Giúp 2 tab mở trên cùng 1 máy tính / điện thoại nói chuyện với nhau tức thì mà không cần Internet. |
| **Tầng 3: Cloud Database** | **Google Firebase Cloud Firestore** | Đám mây toàn cầu của Google (Singapore / US) | **Đồng bộ từ xa qua Internet (Wifi/4G):** Khi Bạn Trai ở chỗ làm và Bạn Gái ở nhà, chụp ảnh hoặc thả tim sẽ bay qua đám mây Google đến máy đối phương ngay trong 0.2 giây! **100% MIỄN PHÍ TRỌN ĐỜI** theo gói Spark của Google. |

---

## ☁️ PHẦN 2: HƯỚNG DẪN ĐĂNG KÝ FIREBASE DATABASE (MIỄN PHÍ 100% TRỌN ĐỜI)

Chỉ mất **2 - 3 phút** thao tác bằng tài khoản Gmail cá nhân. Không cần thẻ tín dụng, không mất một đồng phí nào!

### 🔹 Bước 1: Truy cập Firebase Console
1. Mở trình duyệt vào địa chỉ: 👉 **[https://console.firebase.google.com/](https://console.firebase.google.com/)**
2. Đăng nhập bằng tài khoản **Gmail** của bạn.

---

### 🔹 Bước 2: Tạo Dự Án (Project) Mới
1. Bấm vào nút **`Add project`** (hoặc **`Create a project`**).
2. Nhập tên dự án, ví dụ: `couple-app-love` ➔ Bấm **Continue**.
3. Ở bước hỏi *Google Analytics*, gạt tắt **"Enable Google Analytics for this project"** (tắt đi để tạo nhanh trong 5 giây và không bị hỏi rườm rà).
4. Bấm **`Create project`** ➔ Đợi 10 giây Google tạo xong ➔ Bấm **`Continue`** để vào bảng điều khiển.

---

### 🔹 Bước 3: Tạo Cơ Sở Dữ Liệu Cloud Firestore
1. Ở thanh menu bên trái, tìm mục **`Build`** (hoặc biểu tượng bánh răng) ➔ Bấm chọn **`Firestore Database`**.
2. Bấm nút màu cam **`Create database`**.
3. **Database location:** Chọn `asia-southeast1 (Singapore)` (gần Việt Nam nhất, tốc độ phản hồi cực nhanh). Nếu không thấy thì để mặc định `nam5 (us-central)` đều tốt. Bấm **Next**.
4. **Secure rules:** Chọn chế độ **`Start in test mode`** (Chế độ thử nghiệm cho phép 2 bạn đọc/ghi dữ liệu tự do mà không bị chặn quyền).
5. Bấm **`Enable`** (hoặc **`Create`**). Đợi vài giây là Database của bạn đã sẵn sàng hoạt động!

---

### 🔹 Bước 4: Lấy Mã Cấu Hình (Firebase Config)
1. Ở góc trên bên trái, bấm vào biểu tượng **Bánh Răng ⚙️** (cạnh chữ *Project Overview*) ➔ Chọn **`Project settings`**.
2. Cuộn xuống dưới cùng trang, ở mục **"Your apps"**, bấm vào biểu tượng Web **`</>`**.
3. Ô **App nickname:** Nhập `couple-web` ➔ Bấm **`Register app`**.
4. Màn hình sẽ hiện ra đoạn mã `firebaseConfig`. Bạn chỉ cần copy đoạn object JSON bên trong dấu ngoặc nhọn `{ ... }`:

```javascript
// Ví dụ mẫu đoạn mã bạn sẽ copy:
{
  apiKey: "AIzaSyB...",
  authDomain: "couple-app-love.firebaseapp.com",
  projectId: "couple-app-love",
  storageBucket: "couple-app-love.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
}
```

---

### 🔹 Bước 5: Kích Hoạt Firebase Trong App Của Bạn

#### 👉 Cách 1: Kích hoạt ngay trên file `may_a.html` (Đơn giản nhất)
1. Mở file `may_a.html` trong trình duyệt.
2. Trên thanh điều khiển trên cùng, bấm vào nút **`Firebase Cloud`** (icon đám mây màu vàng).
3. Dán đoạn mã `firebaseConfig` bạn vừa copy ở Bước 4 vào ô nhập.
4. Bấm **`Lưu & Kích Hoạt`**.
5. Đèn trạng thái trên thanh công cụ sẽ đổi sang màu xanh lá: **`Cloud: couple-app...`**. Hai điện thoại giờ đây đã kết nối đám mây xuyên lục địa!

#### 👉 Cách 2: Kích hoạt trong bản React Web App (`http://localhost:5173`)
1. Bấm vào icon **Cài Đặt ⚙️** ở góc dưới màn hình.
2. Dán Firebase Config vào ô cấu hình ➔ Bấm **Lưu cấu hình**.
3. Hoặc mở file `.env` trong thư mục dự án và điền các giá trị `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`,...

---

## 📱 PHẦN 3: HƯỚNG DẪN TEST 2 MÁY CHỈ VỚI 1 FILE `may_a.html`

Bạn **không cần 2 file riêng biệt** nữa! File `may_a.html` đã được nâng cấp thông minh thành **Dual-Role Engine** (tự động nhận diện Bạn Trai hoặc Bạn Gái theo mật khẩu hoặc vai trò bạn chọn).

### 🔑 Quy tắc mật khẩu:
- Nhập **`00`** ➔ Vào thẳng vai trò **👦 Bạn Trai (Anh)**
- Nhập **`01`** ➔ Vào thẳng vai trò **👧 Bạn Gái (Em)**

---

### 🧪 Các bước kiểm thử 2 máy song song trên màn hình máy tính:

1. **Mở Tab 1 (Máy Bạn Trai):**
   - Nhấp đúp mở file `may_a.html`.
   - Nhập mã **`00`** ➔ Màn hình mở khóa với giao diện **Bạn Trai (Anh)**.
2. **Mở Tab 2 (Máy Bạn Gái):**
   - Ngay trên thanh công cụ phía trên Tab 1, bấm nút **`Mở Tab Em (01)`**.
   - Trình duyệt sẽ tự động mở một Tab mới với link `may_a.html?role=b` và tự động đăng nhập vai trò **Bạn Gái (Em)**!
3. **Sắp xếp 2 cửa sổ:**
   - Kéo Tab 1 sang nửa bên trái màn hình.
   - Kéo Tab 2 sang nửa bên phải màn hình.
4. **Trải nghiệm các tính năng tương tác Real-time:**
   - **Chụp ảnh Locket:**
     - Ở Tab Bạn Trai (trái): Bấm nút **Chụp Ảnh 📸** (hoặc chọn ảnh từ máy) ➔ Gõ caption tình cảm (vd: *"Nhớ em nhiều lắm!"*) ➔ Bấm **Gửi Locket**.
     - Ở Tab Bạn Gái (phải): Lập tức nổ âm thanh nụ hôn `chuuu~` 💕, hiệu ứng vệt son môi bay tung tóe và khung ảnh Locket chính giữa tự động đổi sang ảnh Bạn Trai vừa gửi!
   - **Thanh cảm xúc Habi 1-chạm:**
     - Ở Tab Bạn Gái: Bấm icon **`😤 Bực Bội / Dỗi Hờn`** ➔ Màn hình Bạn Trai lập tức rung bần bật và hiện thông báo: *"Em đang dỗi hờn nè, dỗ mau!"*.
     - Ở Tab Bạn Trai: Bấm icon **`💋 Gửi Hôn`** ➔ Màn hình Bạn Gái nổ vệt son môi và chuông tình yêu reo vang.
   - **Cuộn phim kỷ niệm Locket (Moments Roll):**
     - Bấm vào biểu tượng **Cuộn phim 🎞️** ở góc trái dưới hoặc bấm trực tiếp vào ảnh Locket.
     - Xem lại toàn bộ ảnh đã gửi theo dạng **Lướt tường ảnh (Feed)** hoặc **Lưới vuông (Grid)**.
     - Bấm vào bất kỳ ảnh nào để xem chế độ **Story toàn màn hình** (lướt qua lại giữa các ảnh), tải ảnh về máy chất lượng cao (nút 📥) hoặc xóa khoảnh khắc.

---

## 📲 PHẦN 4: HƯỚNG DẪN CÀI ĐẶT LÊN ĐIỆN THOẠI THẬT (PWA NATIVE)

Để app chạy toàn màn hình trên điện thoại như một app tải từ App Store (không còn thanh địa chỉ của trình duyệt):

### 🍏 Trên iPhone (Safari):
1. Mở đường link app trên trình duyệt **Safari** (hoặc file lưu trên Vercel/Netlify/mạng Wifi local).
2. Bấm vào nút **Chia sẻ** (biểu tượng hình vuông có mũi tên chỉ lên ở đáy Safari).
3. Cuộn xuống chọn **"Thêm vào MH chính" (Add to Home Screen)**.
4. Bấm **Thêm (Add)** ở góc trên bên phải.
5. Biểu tượng App xuất hiện ngoài màn hình chính. Máy Bạn Trai nhập `00` (1 lần duy nhất), máy Bạn Gái nhập `01` (1 lần duy nhất) là dùng mãi mãi!

### 🤖 Trên Android (Chrome):
1. Mở app trên trình duyệt **Google Chrome**.
2. Bấm vào biểu tượng **3 chấm** ở góc trên bên phải.
3. Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào Màn hình chính"**.

---

## 🧩 PHẦN 5: CÀI WIDGET 4x4 CHO IPHONE BẰNG SCRIPTABLE

1. Tải ứng dụng miễn phí **Scriptable** từ App Store trên iPhone.
2. Mở Scriptable ➔ Bấm dấu **`[+]`** ở góc trên bên phải.
3. Mở file [`scriptable-widget.js`](./scriptable-widget.js) trong thư mục dự án ➔ Copy toàn bộ nội dung và dán vào Scriptable.
4. Ra màn hình chính iPhone ➔ Nhấn giữ vùng trống để rung icon ➔ Bấm dấu **`[+]`** ở góc trên ➔ Chọn **Scriptable** ➔ Chọn kích thước Widget lớn hoặc vừa.
5. Chạm vào widget vừa tạo ➔ Mục *Script* chọn đoạn mã bạn vừa lưu.
6. Ảnh Locket và cảm xúc của người yêu sẽ hiển thị sống động ngay ngoài màn hình chính iPhone!

---

*Chúc hai bạn có những khoảnh khắc thật hạnh phúc và gắn kết bên nhau! 💖*
