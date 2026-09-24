import React, { useState, useRef } from 'react';
import { X, User, Calendar, Save, Upload, Check, Cloud, Database, ExternalLink } from 'lucide-react';
import { sound } from '../services/audio';
import { compressImage } from '../services/compressor';
import { getFirebaseConfig, saveFirebaseConfig } from '../services/firebase';

export default function SettingsDrawer({ isOpen, onClose, state, onSaveSettings }) {
  const [nameA, setNameA] = useState(state.userA?.name || 'Anh');
  const [avatarA, setAvatarA] = useState(state.userA?.avatar || '');
  const [nameB, setNameB] = useState(state.userB?.name || 'Em');
  const [avatarB, setAvatarB] = useState(state.userB?.avatar || '');
  
  // Format anniversary date to YYYY-MM-DD for date input
  const initialDateStr = state.anniversaryDate
    ? new Date(state.anniversaryDate).toISOString().split('T')[0]
    : '2024-04-20';
  const [anniversary, setAnniversary] = useState(initialDateStr);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Firebase Config State
  const [showCloudConfig, setShowCloudConfig] = useState(false);
  const currentConfig = getFirebaseConfig();
  const [rawConfigInput, setRawConfigInput] = useState(
    currentConfig ? JSON.stringify(currentConfig, null, 2) : ''
  );

  const fileInputARef = useRef(null);
  const fileInputBRef = useRef(null);

  if (!isOpen) return null;

  const handleAvatarUpload = async (file, target) => {
    if (!file) return;
    try {
      sound.play('tap');
      const result = await compressImage(file, 400, 400, 0.85);
      if (target === 'a') setAvatarA(result.dataUrl);
      else setAvatarB(result.dataUrl);
    } catch (e) {
      alert('Không thể xử lý ảnh này!');
    }
  };

  const handleSave = () => {
    sound.play('heart');

    // Lưu Firebase config nếu có nhập
    if (rawConfigInput.trim()) {
      try {
        const parsed = JSON.parse(rawConfigInput);
        saveFirebaseConfig(parsed);
      } catch (e) {
        alert('Cấu hình Firebase phải là định dạng JSON hợp lệ!');
        return;
      }
    }

    const updated = {
      userA: {
        ...state.userA,
        name: nameA.trim() || 'Anh',
        avatar: avatarA
      },
      userB: {
        ...state.userB,
        name: nameB.trim() || 'Em',
        avatar: avatarB
      },
      anniversaryDate: new Date(anniversary).getTime()
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto hide-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <User className="w-4 h-4 text-love-400" />
            Cài Đặt Không Gian Đôi
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Ngày Kỷ Niệm Thật */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-love-400" />
            Ngày Bắt Đầu Yêu Nhau (Kỷ Niệm)
          </label>
          <input
            type="date"
            value={anniversary}
            onChange={(e) => setAnniversary(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-love-500 font-mono"
          />
          <span className="text-[10px] text-slate-500">Đồng hồ sẽ đếm chính xác số ngày yêu từ mốc này.</span>
        </div>

        {/* Thông Tin Bạn Trai */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-sky-400">👦 Thông Tin Bạn Trai (Mã 00)</span>
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputARef.current?.click()}>
              <img src={avatarA} alt="Avatar Boy" className="w-12 h-12 rounded-full object-cover border-2 border-sky-400 shadow-md" />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Upload className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <input
                type="text"
                maxLength={20}
                value={nameA}
                onChange={(e) => setNameA(e.target.value)}
                placeholder="Tên / Biệt danh..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400"
              />
              <button
                type="button"
                onClick={() => fileInputARef.current?.click()}
                className="text-[10px] text-sky-400 text-left hover:underline"
              >
                Đổi ảnh đại diện thật...
              </button>
            </div>
            <input
              ref={fileInputARef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files?.[0], 'a')}
            />
          </div>
        </div>

        {/* Thông Tin Bạn Gái */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <span className="text-[11px] font-bold text-love-400">👧 Thông Tin Bạn Gái (Mã 01)</span>
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => fileInputBRef.current?.click()}>
              <img src={avatarB} alt="Avatar Girl" className="w-12 h-12 rounded-full object-cover border-2 border-love-400 shadow-md" />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Upload className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <input
                type="text"
                maxLength={20}
                value={nameB}
                onChange={(e) => setNameB(e.target.value)}
                placeholder="Tên / Biệt danh..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-love-400"
              />
              <button
                type="button"
                onClick={() => fileInputBRef.current?.click()}
                className="text-[10px] text-love-400 text-left hover:underline"
              >
                Đổi ảnh đại diện thật...
              </button>
            </div>
            <input
              ref={fileInputBRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAvatarUpload(e.target.files?.[0], 'b')}
            />
          </div>
        </div>

        {/* Cloud Firebase Realtime Sync Config */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-love-400" />
              Kết Nối Cloud Firebase (0 VNĐ)
            </span>
            <button
              type="button"
              onClick={() => setShowCloudConfig(!showCloudConfig)}
              className="text-[10px] text-love-400 font-semibold"
            >
              {showCloudConfig ? 'Thu gọn' : currentConfig ? '🟢 Đã kết nối' : '⚙️ Cấu hình'}
            </button>
          </div>

          <div className="text-[10px] text-slate-400 leading-tight">
            {currentConfig ? (
              <span className="text-emerald-400 font-medium">✓ Đang đồng bộ Real-time qua Google Cloud Firestore.</span>
            ) : (
              <span>Đang ở chế độ Local (Offline). Nhập Firebase Config để 2 máy dùng 4G từ xa!</span>
            )}
          </div>

          {showCloudConfig && (
            <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-slate-800">
              <p className="text-[9px] text-slate-400">
                Vào <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-love-400 underline">Firebase Console</a> tạo project free (2 phút) rồi dán đoạn config JSON vào đây:
              </p>
              <textarea
                rows={4}
                value={rawConfigInput}
                onChange={(e) => setRawConfigInput(e.target.value)}
                placeholder='{"apiKey": "...", "projectId": "...", ...}'
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-[10px] font-mono text-slate-200 focus:outline-none focus:border-love-500"
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-love-600 to-rose-500 hover:from-love-500 hover:to-rose-400 text-white font-bold py-3 rounded-2xl shadow-lg shadow-love-600/30 transition flex items-center justify-center gap-2 text-xs active:scale-95"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Đã Lưu Cài Đặt Thành Công!' : 'Lưu Thay Đổi Ngay 💕'}</span>
        </button>
      </div>
    </div>
  );
}
