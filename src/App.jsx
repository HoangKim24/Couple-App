import React, { useState, useEffect, useRef } from 'react';
import { Camera, Clock, LayoutGrid, Bell, Settings } from 'lucide-react';
import PasscodeGate from './components/PasscodeGate';
import CoupleHeader from './components/CoupleHeader';
import LocketWidget from './components/LocketWidget';
import HabiBar from './components/HabiBar';
import CameraModal from './components/CameraModal';
import ScriptableModal from './components/ScriptableModal';
import SettingsDrawer from './components/SettingsDrawer';
import { getLocalState, saveLocalState } from './services/storage';
import { sound } from './services/audio';
import { publishLiveEvent, subscribeLiveEvents } from './services/firebase';
import { savePhotoToDB, getAllPhotosFromDB } from './services/db';

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
  const toastTimeoutRef = useRef(null);

  // Save state to localStorage
  useEffect(() => {
    saveLocalState(state);
  }, [state]);

  // Load photos from IndexedDB on startup
  useEffect(() => {
    getAllPhotosFromDB().then((photos) => {
      if (photos && photos.length > 0) {
        setHistoryPhotos(photos);
      }
    }).catch((e) => console.log('IndexedDB load error', e));
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
      }
    });

    return () => unsubscribe();
  }, []);

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
    showToast(`Mở khóa thành công! Chào mừng ${role === 'a' ? 'Bạn Trai' : 'Bạn Gái'} 💕`);
  };

  const handleLocketSubmit = async ({ photoUrl, caption }) => {
    const newLocket = {
      photoUrl,
      caption,
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

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 700);
  };

  if (!state.unlocked) {
    return <PasscodeGate onUnlock={handleUnlock} />;
  }

  return (
    <div className={`w-full max-w-md h-full flex flex-col justify-between relative px-4 py-2 overflow-hidden mx-auto ${isShaking ? 'animate-bounce' : ''}`}>
      
      {/* Top Header with Dynamic Real Anniversary Date & Settings Trigger */}
      <CoupleHeader
        myRole={state.myRole}
        userA={state.userA}
        userB={state.userB}
        anniversaryDate={state.anniversaryDate}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Locket Widget */}
      <LocketWidget
        locket={state.latestLocket}
        myRole={state.myRole}
        onReaction={handleQuickReaction}
      />

      {/* Habi 1-Tap Bar */}
      <HabiBar onTriggerEmotion={handleHabiEmotion} />

      {/* Footer Controls */}
      <footer className="w-full flex items-center justify-between py-2 shrink-0 select-none">
        <button
          onClick={() => setIsHistoryOpen(true)}
          title="Cuộn phim kỷ niệm"
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

      {/* Modals */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onSubmit={handleLocketSubmit}
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

      {/* History Roll Drawer (IndexedDB Backed) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col p-4 overflow-y-auto hide-scrollbar">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-love-500" />
              <span>Cuộn Phim Kỷ Niệm ({historyPhotos.length + 1} khoảnh khắc)</span>
            </h2>
            <button
              onClick={() => setIsHistoryOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Latest Locket */}
            <div className="bg-slate-900 border border-love-500/30 rounded-2xl p-3 flex gap-3 items-center">
              <img src={state.latestLocket.photoUrl} alt="History" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-white">"{state.latestLocket.caption}"</p>
                <span className="text-[10px] text-love-400 font-semibold block mt-0.5">Khoảnh khắc mới nhất</span>
              </div>
            </div>

            {/* Past Photos from IndexedDB */}
            {historyPhotos.map((item, idx) => (
              <div key={item.id || idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex gap-3 items-center">
                <img src={item.photoUrl} alt="History item" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-200">"{item.caption}"</p>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {new Date(item.timestamp).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
