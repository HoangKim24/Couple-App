/**
 * FIREBASE REALTIME SYNC SERVICE
 * Dành cho việc kết nối 2 chiếc điện thoại thật qua Internet (0 VNĐ).
 * 
 * Hướng dẫn lấy config Firebase (Chỉ mất 2 phút):
 * 1. Vào https://console.firebase.google.com (miễn phí của Google).
 * 2. Bấm "Add Project" -> Đặt tên "Couple-App" -> Tắt Google Analytics.
 * 3. Bấm vào biểu tượng Web </> để tạo Web App -> Copy đoạn firebaseConfig dán vào bên dưới.
 * 4. Vào mục "Firestore Database" hoặc "Realtime Database" -> Bấm Create Database -> Chọn Test Mode.
 */

// Đổi đoạn này thành config Firebase của bạn khi đưa lên online:
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemo-FreeTier-ForCoupleApp",
  authDomain: "couple-app-love.firebaseapp.com",
  projectId: "couple-app-love",
  storageBucket: "couple-app-love.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Kênh BroadcastChannel kết nối tức thì khi mở song song
const broadcast = new BroadcastChannel('couple_app_live_sync');

export function publishLiveEvent(event) {
  // Gửi qua BroadcastChannel
  broadcast.postMessage(event);

  // Lưu vào localStorage
  if (event.type === 'LOCKET') {
    localStorage.setItem('couple_cloud_latest_locket', JSON.stringify(event.payload));
  }
}

export function subscribeLiveEvents(callback) {
  const handler = (e) => {
    if (e.data) callback(e.data);
  };
  broadcast.addEventListener('message', handler);

  return () => {
    broadcast.removeEventListener('message', handler);
  };
}
