// Storage & Sync Service
export const PASSCODE_1 = "00";
export const PASSCODE_2 = "01";
export const PASSCODE_BOY = PASSCODE_1;
export const PASSCODE_GIRL = PASSCODE_2;

export function getCustomPin(role) {
  try {
    const custom = localStorage.getItem(`couple_custom_pin_${role}`);
    if (custom) return custom;
  } catch (e) {}
  return role === 'a' ? '00' : '01';
}

export function saveCustomPin(role, pin) {
  if (pin && pin.trim().length >= 2) {
    localStorage.setItem(`couple_custom_pin_${role}`, pin.trim());
  } else {
    localStorage.removeItem(`couple_custom_pin_${role}`);
  }
}

// Default SVG Avatars
export const DEFAULT_AVATAR_A = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2338bdf8'/%3E%3Ctext x='50' y='60' font-size='38' text-anchor='middle' fill='white' font-family='sans-serif'%3E%E2%9C%A8%3C/text%3E%3C/svg%3E";
export const DEFAULT_AVATAR_B = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23f43f5e'/%3E%3Ctext x='50' y='60' font-size='38' text-anchor='middle' fill='white' font-family='sans-serif'%3E%E2%9D%A4%EF%B8%8F%3C/text%3E%3C/svg%3E";
export const DEFAULT_BOY_AVATAR = DEFAULT_AVATAR_A;
export const DEFAULT_GIRL_AVATAR = DEFAULT_AVATAR_B;

export const DEFAULT_STATE = {
  unlocked: false,
  myRole: 'a', // 'a': Người dùng 1 (Mã 00), 'b': Người dùng 2 (Mã 01)
  anniversaryDate: new Date().getTime(),
  userA: {
    id: 'a',
    name: 'Bạn',
    avatar: DEFAULT_AVATAR_A,
    mood: 'Đang online'
  },
  userB: {
    id: 'b',
    name: 'Người Yêu',
    avatar: DEFAULT_AVATAR_B,
    mood: 'Đang online'
  },
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
