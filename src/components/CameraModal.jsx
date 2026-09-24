import React, { useState } from 'react';
import { Camera, X, Upload, Send } from 'lucide-react';
import { sound } from '../services/audio';

const SAMPLES = [
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800&auto=format&fit=crop'
];

export default function CameraModal({ isOpen, onClose, onSubmit }) {
  const [photo, setPhoto] = useState(SAMPLES[0]);
  const [caption, setCaption] = useState('Nhớ bạn quá nè... 💕');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setPhoto(evt.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomSample = () => {
    sound.play('tap');
    const random = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setPhoto(random);
  };

  const handleSend = () => {
    sound.play('kiss');
    onSubmit({ photoUrl: photo, caption: caption.trim() || 'Khoảnh khắc của chúng mình 💕' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-love-400" />
            Gửi Ảnh Locket Mới
          </span>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Photo Preview */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
          <img src={photo} alt="Preview" className="w-full h-full object-cover" />
          
          <div className="absolute bottom-3 inset-x-3 flex justify-center">
            <div className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20 max-w-[90%] text-center truncate">
              {caption || 'Nhớ bạn quá nè... 💕'}
            </div>
          </div>
        </div>

        {/* Upload or Change Preset */}
        <div className="flex items-center gap-2">
          <label className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-love-400" />
            <span>Chọn Từ Máy</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <button
            onClick={handleRandomSample}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            Đổi Ảnh Mẫu
          </button>
        </div>

        {/* Caption Input */}
        <input
          type="text"
          maxLength={60}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Viết một dòng caption ngắn..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-love-500"
        />

        <button
          onClick={handleSend}
          className="w-full bg-gradient-to-r from-love-600 to-rose-500 hover:from-love-500 hover:to-rose-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-love-600/30 transition flex items-center justify-center gap-2 text-xs"
        >
          <Send className="w-4 h-4" />
          <span>Gửi Cho Người Yêu Ngay ✨</span>
        </button>
      </div>
    </div>
  );
}
