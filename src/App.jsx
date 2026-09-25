import React, { useState, useEffect, useRef } from 'react';
import { Camera, Clock, LayoutGrid, Settings } from 'lucide-react';
import PasscodeGate from './components/PasscodeGate';
import CoupleHeader from './components/CoupleHeader';
import LocketWidget from './components/LocketWidget';
import HabiBar from './components/HabiBar';
import LocketCamera from './components/LocketCamera';
import LocketHistory from './components/LocketHistory';
import ScriptableModal from './components/ScriptableModal';
import SettingsDrawer from './components/SettingsDrawer';
import NotificationBanner from './components/NotificationBanner';
import { getLocalState, saveLocalState } from './services/storage';
import { sound } from './services/audio';
import { publishLiveEvent, subscribeLiveEvents, getRecentPhotosFromCloud } from './services/firebase';
import { savePhotoToDB, getAllPhotosFromDB, deletePhotoFromDB } from './services/db';
import { initBatteryMonitoring } from './services/battery';
import { fireHeartConfetti, fireSparkleCelebration } from './services/fx';

export default function App() {
  const [state, setState] = useState(getLocalState);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScriptableOpen, setIsScriptableOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [historyPhotos, setHistoryPhotos] = useState([]);
  const [notification, setNotification] = useState(null);
  const [particles, setParticles] = useState([]);
  const [isShaking, setIsShaking] = useState(false);
  const [inAppDismissed, setInAppDismissed] = useState(false);
  const [myBattery, setMyBattery] = useState(null);
  const [partnerBattery, setPartnerBattery] = useState(null);
  const toastTimeoutRef = useRef(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
      const currentState = stateRef.current;
      const partner = currentState.myRole === 'a' ? currentState.userB : currentState.userA;
      const partnerName = partner?.name || (currentState.myRole === 'a' ? 'Người Yêu' : 'Bạn');
      const partnerAvatar = partner?.avatar;

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
        fireSparkleCelebration();
        spawnKisses();
        showNotification({
          type: 'locket',
          title: `${partnerName} vừa gửi Locket`,
          message: newLocket.caption || 'Một khoảnh khắc mới toanh vừa gửi đến bạn ✨',
          avatar: partnerAvatar,
          photoUrl: newLocket.photoUrl,
          icon: '📸',
          duration: 4500
        });
      } else if (event.type === 'HABI') {
        const { reaction } = event;
        sound.play(reaction);
        if (reaction === 'kiss') {
          spawnKisses();
          fireHeartConfetti();
          showNotification({
            type: 'kiss',
            title: `${partnerName} gửi nụ hôn`,
            message: 'Gửi bạn ngàn nụ hôn nồng cháy moah moah 💋',
            avatar: partnerAvatar,
            icon: '💋'
          });
        } else if (reaction === 'heart') {
          spawnHearts();
          fireHeartConfetti();
          showNotification({
            type: 'heart',
            title: `${partnerName} nhớ bạn quá`,
            message: 'Thả cơn mưa tim đắm say nhớ nhung ❤️',
            avatar: partnerAvatar,
            icon: '❤️'
          });
        } else if (reaction === 'pout') {
          triggerShake();
          showNotification({
            type: 'pout',
            title: `${partnerName} đang dỗi hờn`,
            message: 'Đang phụng phịu rồi kìa, mau dỗ dành đi nha! 😤',
            avatar: partnerAvatar,
            icon: '😤'
          });
        } else if (reaction === 'hug') {
          showNotification({
            type: 'hug',
            title: `${partnerName} ôm bạn thật chặt`,
            message: 'Gửi một cái ôm ấm áp và tràn ngập tình yêu 🫂',
            avatar: partnerAvatar,
            icon: '🫂'
          });
        }
      } else if (event.type === 'SETTINGS') {
        setState((prev) => ({
          ...prev,
          ...event.payload
        }));
        showNotification({
          type: 'default',
          title: 'Cập nhật thành công',
          message: 'Thông tin cặp đôi và ngày kỷ niệm đã đồng bộ tức thì ✨',
          icon: '✨'
        });
      } else if (event.type === 'REACTION') {
        sound.play('heart');
        spawnHearts();
        showNotification({
          type: 'heart',
          title: `${partnerName} thả cảm xúc`,
          message: `Đã thả ${event.emoji} vào khoảnh khắc của bạn!`,
          avatar: partnerAvatar,
          icon: event.emoji || '❤️'
        });
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
        const partnerRole = currentState.myRole === 'a' ? 'b' : 'a';
        if (event.battery && event.battery[partnerRole]) {
          const bat = event.battery[partnerRole];
          setPartnerBattery(bat);
          if (bat.level !== undefined && bat.level <= 20 && !bat.charging) {
            showNotification({
              type: 'battery',
              title: 'Pin người yêu sắp hết 🪫',
              message: `${partnerName} chỉ còn ${bat.level}% pin, nhớ nhắc sạc pin nhé!`,
              icon: '⚡',
              duration: 4500
            });
          }
        }
      }
    });

    return () => unsubscribe();
  }, [state.myRole]);

  const showNotification = (notif) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setNotification(notif);
    toastTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, notif.duration || 3800);
  };

  const handleUnlock = (role) => {
    setState((prev) => ({
      ...prev,
      unlocked: true,
      myRole: role
    }));
    showNotification({
      type: 'default',
      title: 'Mở khóa thành công',
      message: 'Chào mừng bạn trở lại không gian tình yêu 💕',
      icon: '🔓'
    });
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

    fireSparkleCelebration();
    showNotification({
      type: 'locket',
      title: 'Đã gửi Locket thành công! ✨',
      message: 'Khoảnh khắc vừa được chia sẻ tới màn hình người yêu.',
      photoUrl: photoUrl,
      icon: '📸'
    });
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

    showNotification({
      type: 'default',
      title: 'Đã lưu cài đặt',
      message: 'Thông tin và ngày kỷ niệm đã đồng bộ thành công! 💕',
      icon: '✨'
    });
  };

  const handleHabiEmotion = (reaction) => {
    sound.play(reaction);
    if (reaction === 'kiss') {
      spawnKisses();
      fireHeartConfetti();
    } else if (reaction === 'heart') {
      spawnHearts();
      fireHeartConfetti();
    } else if (reaction === 'pout') {
      triggerShake();
    }

    // Broadcast live event to partner
    publishLiveEvent({
      type: 'HABI',
      from: state.myRole,
      reaction
    });

    const emotionMap = {
      kiss: { name: 'nụ hôn nồng cháy 💋', icon: '💋' },
      heart: { name: 'mưa tim đong đầy ❤️', icon: '❤️' },
      pout: { name: 'dỗi hờn đáng yêu 😤', icon: '😤' },
      hug: { name: 'cái ôm thật chặt 🫂', icon: '🫂' }
    };

    showNotification({
      type: reaction,
      title: 'Đã gửi cảm xúc',
      message: `Đã gửi ${emotionMap[reaction]?.name || reaction} đến người yêu!`,
      icon: emotionMap[reaction]?.icon || '✨'
    });
  };

  const handleQuickReaction = (emoji) => {
    spawnHearts();
    fireHeartConfetti();
    publishLiveEvent({
      type: 'REACTION',
      from: state.myRole,
      emoji
    });
    const partner = state.myRole === 'a' ? state.userB : state.userA;
    const partnerName = partner?.name || (state.myRole === 'a' ? 'Người Yêu' : 'Bạn');
    showNotification({
      type: 'heart',
      title: 'Đã thả cảm xúc',
      message: `Đã thả ${emoji} lên ảnh của ${partnerName}!`,
      icon: emoji
    });
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
      showNotification({
        type: 'default',
        title: 'Đã xóa khoảnh khắc',
        message: 'Khoảnh khắc đã được xóa khỏi cuộn phim của 2 bạn.',
        icon: '🗑️'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleReactHistoryPhoto = (id, emoji) => {
    spawnHearts();
    fireHeartConfetti();
    publishLiveEvent({
      type: 'HABI',
      reaction: 'heart',
      emoji: emoji
    });
    showNotification({
      type: 'heart',
      title: 'Đã thả cảm xúc',
      message: `Đã thả ${emoji} vào kỷ niệm của 2 bạn!`,
      icon: emoji
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

      {/* Luxury Dynamic Island Notification Banner */}
      <NotificationBanner
        notification={notification}
        onClose={() => setNotification(null)}
        onClick={(notif) => {
          if (notif?.type === 'locket') {
            setIsHistoryOpen(true);
          }
          setNotification(null);
        }}
      />
    </div>
  );
}
