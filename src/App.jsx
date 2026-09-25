import React, { useState, useEffect, useRef } from 'react';
import { Camera, Clock, LayoutGrid, Bell, Settings } from 'lucide-react';
import PasscodeGate from './components/PasscodeGate';
import CoupleHeader from './components/CoupleHeader';
import LocketWidget from './components/LocketWidget';
import HabiBar from './components/HabiBar';
import LocketCamera from './components/LocketCamera';
import LocketHistory from './components/LocketHistory';
import ScriptableModal from './components/ScriptableModal';
import SettingsDrawer from './components/SettingsDrawer';
import { getLocalState, saveLocalState } from './services/storage';
import { sound } from './services/audio';
import { publishLiveEvent, subscribeLiveEvents, getRecentPhotosFromCloud } from './services/firebase';
import { savePhotoToDB, getAllPhotosFromDB, deletePhotoFromDB } from './services/db';
import { initBatteryMonitoring } from './services/battery';

export default function App() {
  const [state, setState] = useState(getLocalState);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScriptableOpen, setIsScriptableOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [historyPhotos, setHistoryPhotos] = useState([]);
  const [toast, setToast] = useState(null);
  const [particles, setParticles] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [inAppDismissed, setInAppDismissed] = useState(false);
  const [myBattery, setMyBattery] = useState(null);
  const [partnerBattery, setPartnerBattery] = useState(null);
  const toastTimeoutRef = useRef(null);

  const isInApp = typeof window !== 'undefined' && /FBAN|FBAV|Instagram|Line|KAKAOTALK|Zalo|MicroMessenger|Snapchat/i.test(navigator.userAgent || '');

  // Lắng nghe và đồng bộ mức pin thiết bị theo thời gian thực
  useEffect(() => {
    let cleanup = () => {};
    initBatteryMonitoring((bat) => {
      setMyBattery(bat);
      publishLiveEvent({
        type: 'BATTERY',
        from: state.myRole,
        battery: bat
      });
    }).then((fn) => {
      if (fn) cleanup = fn;
    });
    return () => cleanup();
  }, [state.myRole]);

  // Save state to localStorage
  useEffect(() => {
    saveLocalState(state);
  }, [state]);

  // Load photos from IndexedDB on startup, then reconcile with Cloud Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadAndSyncPhotos() {
      try {
        const localPhotos = await getAllPhotosFromDB();
        if (isMounted && localPhotos && localPhotos.length > 0) {
          setHistoryPhotos(localPhotos);
        }

        // Đồng bộ 2 chiều từ Cloud Firestore (kể cả khi tắt máy cả tuần)
        const cloudPhotos = await getRecentPhotosFromCloud(60);
        if (isMounted && cloudPhotos && cloudPhotos.length > 0) {
          const localMap = new Map((localPhotos || []).map((p) => [String(p.id || p.timestamp), p]));
          let hasNew = false;
          for (const cp of cloudPhotos) {
            const key = String(cp.id || cp.timestamp);
            if (!localMap.has(key)) {
              await savePhotoToDB(cp).catch(() => {});
              localMap.set(key, cp);
              hasNew = true;
            }
          }
          if (hasNew && isMounted) {
            const merged = Array.from(localMap.values()).sort(
              (a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0)
            );
            setHistoryPhotos(merged);
          }
        }
      } catch (e) {
        console.warn('Sync photos error:', e);
      }
    }

    loadAndSyncPhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  // Subscribe to real-time events from partner
  useEffect(() => {
    const unsubscribe = subscribeLiveEvents((event) => {
      if (event.type === 'LOCKET') {
        const newLocket = event.payload;
        setState((prev) => ({
          ...prev,
          latestLocket: newLocket
        }));
        // Lưu vào IndexedDB
        savePhotoToDB({
          id: Date.now(),
          ...newLocket
        });
        setHistoryPhotos((prev) => [{ id: Date.now(), ...newLocket }, ...prev]);
        sound.play('kiss');
        showToast('🔔 Người yêu vừa gửi 1 ảnh Locket mới!');
        spawnKisses();
      } else if (event.type === 'HABI') {
        const { reaction } = event;
        sound.play(reaction);
        if (reaction === 'kiss') {
          spawnKisses();
          showToast('💋 Người yêu gửi cho bạn một nụ hôn nồng cháy!');
        } else if (reaction === 'heart') {
          spawnHearts();
          showToast('❤️ Người yêu thả mưa tim nhớ bạn quá chừng!');
        } else if (reaction === 'pout') {
          triggerShake();
          showToast('😤 Người yêu đang dỗi hờn nè, dỗ mau!');
        } else if (reaction === 'hug') {
          showToast('🫂 Người yêu vừa gửi cho bạn một cái ôm thật chặt!');
        }
      } else if (event.type === 'SETTINGS') {
        setState((prev) => ({
          ...prev,
          ...event.payload
        }));
        showToast('✨ Thông tin cặp đôi đã được cập nhật!');
      } else if (event.type === 'REACTION') {
        sound.play('heart');
        spawnHearts();
        showToast(`Người yêu vừa thả ${event.emoji} lên ảnh của bạn!`);
      } else if (event.type === 'DELETE_PHOTO') {
        const photoId = String(event.id);
        deletePhotoFromDB(photoId).catch(() => {});
        setHistoryPhotos((prev) => prev.filter((p) => String(p.id) !== photoId && String(p.timestamp) !== photoId));
        setState((prev) => {
          if (String(prev.latestLocket?.id) === photoId || String(prev.latestLocket?.timestamp) === photoId) {
            return { ...prev, latestLocket: null };
          }
          return prev;
        });
      } else if (event.type === 'BATTERY') {
        const partnerRole = state.myRole === 'a' ? 'b' : 'a';
        if (event.battery && event.battery[partnerRole]) {
          setPartnerBattery(event.battery[partnerRole]);
        }
      }
    });

    return () => unsubscribe();
  }, [state.myRole]);

  const showToast = (message) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3000);
  };

  const handleUnlock = (role) => {
    setState((prev) => ({
      ...prev,
      unlocked: true,
      myRole: role
    }));
    showToast('Mở khóa thành công! Chào mừng bạn 💕');
  };

  const handleLocketSubmit = async ({ photoUrl, caption, audioUrl, audioDuration }) => {
    const newLocket = {
      photoUrl,
      caption,
      audioUrl: audioUrl || null,
      audioDuration: audioDuration || null,
      senderId: state.myRole,
      timestamp: Date.now()
    };

    setState((prev) => ({
      ...prev,
      latestLocket: newLocket
    }));

    // Lưu vĩnh viễn vào IndexedDB (không lo giới hạn 5MB)
    const photoRecord = {
      id: Date.now(),
      ...newLocket
    };
    await savePhotoToDB(photoRecord).catch((e) => console.log('Save DB err', e));
    setHistoryPhotos((prev) => [photoRecord, ...prev]);

    // Broadcast live event to partner
    publishLiveEvent({
      type: 'LOCKET',
      payload: newLocket
    });

    showToast('Đã gửi ảnh Locket! Màn hình người yêu đã cập nhật tức thì ✨');
  };

  const handleSaveSettings = (updatedFields) => {
    setState((prev) => ({
      ...prev,
      ...updatedFields
    }));

    // Broadcast settings to partner
    publishLiveEvent({
      type: 'SETTINGS',
      payload: updatedFields
    });

    showToast('Đã lưu thông tin thật thành công! 💕');
  };

  const handleHabiEmotion = (reaction) => {
    sound.play(reaction);
    if (reaction === 'kiss') spawnKisses();
    else if (reaction === 'heart') spawnHearts();
    else if (reaction === 'pout') triggerShake();

    // Broadcast live event to partner
    publishLiveEvent({
      type: 'HABI',
      from: state.myRole,
      reaction
    });

    showToast(`Đã gửi cảm xúc ${reaction === 'kiss' ? 'nụ hôn 💋' : reaction === 'heart' ? 'mưa tim ❤️' : reaction === 'pout' ? 'dỗi hờn 😤' : 'ôm 🫂'}!`);
  };

  const handleQuickReaction = (emoji) => {
    spawnHearts();
    publishLiveEvent({
      type: 'REACTION',
      from: state.myRole,
      emoji
    });
    showToast(`Đã thả ${emoji} lên ảnh của người yêu!`);
  };

  const spawnKisses = () => {
    const items = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      type: 'kiss',
      left: `${20 + Math.random() * 60}%`,
      top: `${25 + Math.random() * 40}%`
    }));
    setParticles((prev) => [...prev, ...items]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !items.some((item) => item.id === p.id)));
    }, 1200);
  };

  const spawnHearts = () => {
    const emojis = ['❤️', '💖', '💕', '💗', '🥰'];
    const items = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      type: 'heart',
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: `${10 + Math.random() * 80}%`,
      bottom: '10%'
    }));
    setParticles((prev) => [...prev, ...items]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !items.some((item) => item.id === p.id)));
    }, 2500);
  };

  const handleDeleteHistoryPhoto = async (id) => {
    try {
      const photoId = String(id);
      await deletePhotoFromDB(photoId);
      setHistoryPhotos((prev) => prev.filter((p) => String(p.id) !== photoId && String(p.timestamp) !== photoId));
      if (String(state.latestLocket?.id) === photoId || String(state.latestLocket?.timestamp) === photoId) {
        setState((prev) => ({ ...prev, latestLocket: null }));
      }
      // Đồng bộ xóa sang máy đối phương & Cloud Firestore
      publishLiveEvent({
        type: 'DELETE_PHOTO',
        id: photoId
      });
      showToast('Đã xóa khoảnh khắc');
    } catch (e) {
      console.error(e);
    }
  };

  const handleReactHistoryPhoto = (id, emoji) => {
    showToast(`Đã thả ${emoji} vào kỷ niệm`);
    spawnKisses();
    publishLiveEvent({
      type: 'HABI',
      reaction: 'heart',
      emoji: emoji
    });
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 700);
  };

  if (!state.unlocked) {
    return <PasscodeGate onUnlock={handleUnlock} />;
  }

  // Tổng hợp tất cả ảnh Locket để xem cuộn phim chuẩn Locket
  const allHistoryPhotos = [
    ...(state.latestLocket ? [{ id: state.latestLocket.id || state.latestLocket.timestamp || 'latest', ...state.latestLocket }] : []),
    ...historyPhotos.filter((h) => h.photoUrl !== state.latestLocket?.photoUrl)
  ];

  return (
    <div className={`w-full max-w-md h-full flex flex-col justify-between relative px-4 py-2 overflow-hidden mx-auto ${isShaking ? 'animate-bounce' : ''}`}>
      
      {/* Cảnh báo In-App Browser (Zalo / Messenger / FB) */}
      {isInApp && !inAppDismissed && (
        <div className="w-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[11px] px-3 py-2 rounded-2xl flex items-center justify-between gap-2 mb-1 shrink-0 backdrop-blur-md">
          <span>⚠️ Đang mở trong app chat. Bấm <b>•••</b> chọn <b>"Mở bằng Trình duyệt"</b> để camera hoạt động tốt nhất!</span>
          <button onClick={() => setInAppDismissed(true)} className="p-1 text-amber-300 hover:text-white shrink-0 font-bold">✕</button>
        </div>
      )}

      {/* Top Header with Dynamic Real Anniversary Date & Battery Sync */}
      <CoupleHeader
        myRole={state.myRole}
        userA={state.userA}
        userB={state.userB}
        anniversaryDate={state.anniversaryDate}
        myBattery={myBattery}
        partnerBattery={partnerBattery}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Locket Widget */}
      <LocketWidget
        locket={state.latestLocket}
        myRole={state.myRole}
        onReaction={handleQuickReaction}
        onOpenCapture={() => setIsCameraOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Habi 1-Tap Bar */}
      <HabiBar onTriggerEmotion={handleHabiEmotion} />

      {/* Footer Controls */}
      <footer className="w-full flex items-center justify-between py-2 shrink-0 select-none">
        <button
          onClick={() => setIsHistoryOpen(true)}
          title="Cuộn phim kỷ niệm Locket"
          className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-90 transition shadow-md"
        >
          <Clock className="w-5 h-5" />
        </button>

        {/* Big Center Camera Button */}
        <button
          onClick={() => setIsCameraOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-love-600 via-rose-500 to-pink-500 text-white font-bold px-6 py-3.5 rounded-full shadow-lg shadow-love-600/40 hover:scale-105 active:scale-95 transition-all"
        >
          <Camera className="w-5 h-5" />
          <span className="text-sm tracking-wide">Chụp & Gửi Locket</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          title="Cài đặt thông tin"
          className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center active:scale-90 transition shadow-md"
        >
          <Settings className="w-5 h-5" />
        </button>
      </footer>

      {/* Real Locket Camera Viewfinder Modal */}
      <LocketCamera
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onSubmit={handleLocketSubmit}
        partnerName={state.myRole === 'a' ? (state.userB?.name || 'Người Yêu') : (state.userA?.name || 'Bạn')}
      />

      <ScriptableModal
        isOpen={isScriptableOpen}
        onClose={() => setIsScriptableOpen(false)}
      />

      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onSaveSettings={handleSaveSettings}
      />

      {/* Authentic Locket Photo Review & Moments Roll */}
      <LocketHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        photos={allHistoryPhotos}
        onDeletePhoto={handleDeleteHistoryPhoto}
        onReactPhoto={handleReactHistoryPhoto}
        onOpenCamera={() => setIsCameraOpen(true)}
      />

      {/* Particles Layer */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => {
          if (p.type === 'kiss') {
            return (
              <div key={p.id} className="kiss-burst-anim" style={{ left: p.left, top: p.top }}>
                💋
              </div>
            );
          }
          return (
            <div key={p.id} className="heart-float-anim text-2xl" style={{ left: p.left, bottom: p.bottom }}>
              {p.emoji}
            </div>
          );
        })}
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-love-500/50 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <Bell className="w-4 h-4 text-love-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
