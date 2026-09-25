import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  deleteDoc 
} from 'firebase/firestore';

/**
 * FIREBASE REALTIME SYNC SERVICE
 * Hỗ trợ đồng bộ 2 máy từ xa qua Firestore Realtime (0 VNĐ).
 * Tự động fallback sang BroadcastChannel khi chưa có config Firebase.
 */

const LOCAL_CHANNEL_NAME = 'couple_app_live_sync';
const broadcast = new BroadcastChannel(LOCAL_CHANNEL_NAME);

// Lấy config Firebase từ localStorage hoặc file .env
export function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem('couple_firebase_config');
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  // Đọc từ biến môi trường .env nếu có
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
  return null;
}

export function saveFirebaseConfig(config) {
  if (config) {
    localStorage.setItem('couple_firebase_config', JSON.stringify(config));
  } else {
    localStorage.removeItem('couple_firebase_config');
  }
}

let firestoreInstance = null;

export function getDb() {
  if (firestoreInstance) return firestoreInstance;
  const config = getFirebaseConfig();
  if (config && config.projectId) {
    try {
      const app = getApps().length === 0 ? initializeApp(config) : getApp();
      firestoreInstance = getFirestore(app);
      return firestoreInstance;
    } catch (err) {
      console.warn('Lỗi khởi tạo Firebase:', err);
    }
  }
  return null;
}

/**
 * Lưu 1 bức ảnh vào subcollection 'photos' trên Cloud Firestore
 * Đảm bảo dù máy kia offline cả tuần vẫn không bao giờ mất ảnh
 */
export async function savePhotoToCloud(photo) {
  const db = getDb();
  if (!db) return;
  try {
    const photoId = String(photo.id || photo.timestamp || Date.now());
    const photoRef = doc(db, 'couples', '00_01', 'photos', photoId);
    await setDoc(photoRef, {
      id: photoId,
      photoUrl: photo.photoUrl,
      caption: photo.caption || '',
      senderId: photo.senderId,
      timestamp: photo.timestamp || Date.now()
    });
  } catch (err) {
    console.error('Lỗi lưu ảnh lên Cloud photos subcollection:', err);
  }
}

/**
 * Tải danh sách ảnh kỷ niệm từ Cloud về máy
 */
export async function getRecentPhotosFromCloud(limitCount = 60) {
  const db = getDb();
  if (!db) return [];
  try {
    const photosCol = collection(db, 'couples', '00_01', 'photos');
    const q = query(photosCol, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    const photos = [];
    snapshot.forEach((doc) => {
      photos.push(doc.data());
    });
    return photos;
  } catch (err) {
    console.warn('Lỗi đọc ảnh từ Cloud:', err);
    return [];
  }
}

/**
 * Xóa ảnh khỏi Cloud Firestore
 */
export async function deletePhotoFromCloud(photoId) {
  const db = getDb();
  if (!db || !photoId) return;
  try {
    const photoRef = doc(db, 'couples', '00_01', 'photos', String(photoId));
    await deleteDoc(photoRef);
  } catch (err) {
    console.warn('Lỗi xóa ảnh Cloud:', err);
  }
}

/**
 * Gửi sự kiện Live (Ảnh Locket, Cảm xúc Habi, Cài đặt)
 */
export async function publishLiveEvent(event) {
  // 1. Luôn phát sóng qua BroadcastChannel nội bộ
  try {
    broadcast.postMessage(event);
  } catch (e) {}

  // 2. Nếu có Firebase Cloud, ghi trực tiếp lên Firestore
  const db = getDb();
  if (db) {
    try {
      const coupleRef = doc(db, 'couples', '00_01');
      if (event.type === 'LOCKET') {
        // Lưu cả latestLocket và vào subcollection photos
        await setDoc(coupleRef, { latestLocket: event.payload, updatedAt: Date.now() }, { merge: true });
        await savePhotoToCloud(event.payload);
      } else if (event.type === 'HABI') {
        await setDoc(coupleRef, {
          lastHabi: {
            from: event.from,
            reaction: event.reaction,
            timestamp: Date.now()
          }
        }, { merge: true });
      } else if (event.type === 'SETTINGS') {
        await setDoc(coupleRef, { ...event.payload, updatedAt: Date.now() }, { merge: true });
      } else if (event.type === 'REACTION') {
        await setDoc(coupleRef, {
          lastReaction: {
            from: event.from,
            emoji: event.emoji,
            timestamp: Date.now()
          }
        }, { merge: true });
      } else if (event.type === 'DELETE_PHOTO') {
        await deletePhotoFromCloud(event.id);
      }
    } catch (err) {
      console.error('Lỗi gửi dữ liệu lên Firestore:', err);
    }
  }
}

/**
 * Lắng nghe sự kiện Live từ đối phương
 */
export function subscribeLiveEvents(callback) {
  // 1. Lắng nghe qua BroadcastChannel nội bộ
  const broadcastHandler = (e) => {
    if (e.data) callback(e.data);
  };
  broadcast.addEventListener('message', broadcastHandler);

  // 2. Lắng nghe qua Firestore Realtime onSnapshot nếu có kết nối Cloud
  let unsubscribeFirestore = null;
  const db = getDb();
  if (db) {
    try {
      const coupleRef = doc(db, 'couples', '00_01');
      unsubscribeFirestore = onSnapshot(coupleRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.latestLocket) {
            callback({ type: 'LOCKET', payload: data.latestLocket });
          }
          if (data.lastHabi && Date.now() - data.lastHabi.timestamp < 10000) {
            callback({ type: 'HABI', from: data.lastHabi.from, reaction: data.lastHabi.reaction });
          }
          if (data.lastReaction && Date.now() - data.lastReaction.timestamp < 10000) {
            callback({ type: 'REACTION', from: data.lastReaction.from, emoji: data.lastReaction.emoji });
          }
          if (data.anniversaryDate || data.userA || data.userB) {
            callback({
              type: 'SETTINGS',
              payload: {
                userA: data.userA,
                userB: data.userB,
                anniversaryDate: data.anniversaryDate
              }
            });
          }
        }
      }, (error) => {
        console.warn('Lỗi lắng nghe Firestore:', error);
      });
    } catch (e) {
      console.warn('Không thể đăng ký onSnapshot:', e);
    }
  }

  return () => {
    broadcast.removeEventListener('message', broadcastHandler);
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}
