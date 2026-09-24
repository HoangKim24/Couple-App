// Storage & Sync Service
export const PASSCODE_BOY = "00";
export const PASSCODE_GIRL = "01";
export const ANNIVERSARY_DATE = new Date("2024-04-20T00:00:00");

export const DEFAULT_STATE = {
  unlocked: false,
  myRole: 'a', // 'a': Bạn Trai, 'b': Bạn Gái
  userA: {
    id: 'a',
    name: 'Anh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    mood: 'Đang nhớ em 💕'
  },
  userB: {
    id: 'b',
    name: 'Em',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    mood: 'Đang làm việc 💻'
  },
  latestLocket: {
    photoUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
    caption: 'Em vừa tan ca nè, nhớ anh quáaa 🥺',
    senderId: 'b',
    timestamp: Date.now() - 1000 * 60 * 10
  }
};

export function getLocalState() {
  try {
    const raw = localStorage.getItem('couple_react_state');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_STATE;
}

export function saveLocalState(state) {
  localStorage.setItem('couple_react_state', JSON.stringify(state));
}
