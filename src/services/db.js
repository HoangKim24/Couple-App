/**
 * INDEXEDDB STORAGE SERVICE
 * Lưu trữ hàng trăm bức ảnh kỷ niệm offline an toàn
 * Không bị giới hạn 5MB như LocalStorage
 */

const DB_NAME = 'CoupleAppDB';
const DB_VERSION = 1;
const STORE_PHOTOS = 'photos';
const STORE_SETTINGS = 'settings';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhotoToDB(photoItem) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PHOTOS], 'readwrite');
    const store = tx.objectStore(STORE_PHOTOS);
    const req = store.put(photoItem);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllPhotosFromDB() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_PHOTOS], 'readonly');
    const store = tx.objectStore(STORE_PHOTOS);
    const req = store.getAll();
    req.onsuccess = () => {
      const results = req.result || [];
      // Sắp xếp ảnh mới nhất lên đầu
      results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}
