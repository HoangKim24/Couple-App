// Storage & Sync Service
export const PASSCODE_BOY = "00";
export const PASSCODE_GIRL = "01";

// Default SVG Avatars (Không dùng ảnh người mẫu mạng)
export const DEFAULT_BOY_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='%230284c7'/%3E%3Ctext x='50' y='62' font-size='42' text-anchor='middle' fill='white' font-family='sans-serif'%3E%F0%9F%91%A6%3C/text%3E%3C/svg%3E";
export const DEFAULT_GIRL_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='50' fill='%23e11d48'/%3E%3Ctext x='50' y='62' font-size='42' text-anchor='middle' fill='white' font-family='sans-serif'%3E%F0%9F%91%A7%3C/text%3E%3C/svg%3E";

export const DEFAULT_STATE = {
  unlocked: false,
  myRole: 'a', // 'a': Bạn Trai, 'b': Bạn Gái
  anniversaryDate: new Date().getTime(), // Mặc định là ngày hôm nay, người dùng tự đổi
  userA: {
    id: 'a',
    name: 'Anh',
    avatar: DEFAULT_BOY_AVATAR,
    mood: 'Đang online'
  },
  userB: {
    id: 'b',
    name: 'Em',
    avatar: DEFAULT_GIRL_AVATAR,
    mood: 'Đang online'
  },
  // Chưa có ảnh Locket cứng -> hiển thị trạng thái chờ ảnh đầu tiên
  latestLocket: null
};

export function getLocalState() {
  try {
    const raw = localStorage.getItem('couple_react_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Đảm bảo không bị ảnh hưởng bởi ảnh unplash cũ đã lưu
      if (parsed.userA?.avatar?.includes('unsplash')) {
        parsed.userA.avatar = DEFAULT_BOY_AVATAR;
      }
      if (parsed.userB?.avatar?.includes('unsplash')) {
        parsed.userB.avatar = DEFAULT_GIRL_AVATAR;
      }
      if (parsed.latestLocket?.photoUrl?.includes('unsplash')) {
        parsed.latestLocket = null;
      }
      return parsed;
    }
  } catch (e) {}
  return DEFAULT_STATE;
}

export function saveLocalState(state) {
  localStorage.setItem('couple_react_state', JSON.stringify(state));
}
