import React, { useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon, Send, Sparkles, Loader2, FlipHorizontal } from 'lucide-react';
import { sound } from '../services/audio';
import { compressImage } from '../services/compressor';

const SAMPLES = [
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800&auto=format&fit=crop'
];

export default function CameraModal({ isOpen, onClose, onSubmit }) {
  const [photo, setPhoto] = useState(SAMPLES[0]);
  const [caption, setCaption] = useState('Nhớ bạn quá nè... 💕');
  const [compressing, setCompressing] = useState(false);
  const [fileSizeInfo, setFileSizeInfo] = useState(null);
  const cameraInputRef = useRef(null);
  const selfieInputRef = useRef(null);
  const albumInputRef = useRef(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file) => {
    if (!file) return;
    try {
      setCompressing(true);
      sound.play('tap');
      // Tự động nén ảnh iPhone xuống còn ~150KB
      const result = await compressImage(file, 1200, 1200, 0.82);
      setPhoto(result.dataUrl);
      setFileSizeInfo(`Đã nén tối ưu: ${result.sizeKB} KB (sắc nét)`);
    } catch (err) {
      console.error('Lỗi nén ảnh:', err);
      alert('Không thể xử lý ảnh này, vui lòng thử ảnh khác');
    } finally {
      setCompressing(false);
    }
  };

  const handleRandomSample = () => {
    sound.play('tap');
    const random = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setPhoto(random);
    setFileSizeInfo('Ảnh mẫu demo');
  };

  const handleSend = () => {
    sound.play('kiss');
    onSubmit({
      photoUrl: photo,
      caption: caption.trim() || 'Khoảnh khắc của chúng mình 💕'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[32px] p-4 shadow-2xl flex flex-col gap-3 max-h-[92vh] overflow-y-auto hide-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-love-400" />
            Gửi Ảnh Locket
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Photo Viewfinder Preview */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
          {compressing ? (
            <div className="flex flex-col items-center gap-2 text-love-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Đang nén ảnh siêu tốc...</span>
            </div>
          ) : (
            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
          )}

          {/* Caption Overlay */}
          <div className="absolute bottom-3 inset-x-3 flex justify-center pointer-events-none">
            <div className="bg-black/65 backdrop-blur-md text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20 max-w-[90%] text-center truncate shadow-lg">
              {caption || 'Nhớ bạn quá nè... 💕'}
            </div>
          </div>

          {/* Compression Badge */}
          {fileSizeInfo && (
            <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-[10px] text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              {fileSizeInfo}
            </div>
          )}
        </div>

        {/* iOS Native Camera & Album Triggers */}
        <div className="grid grid-cols-3 gap-2">
          {/* Chụp Camera Trước (Selfie) */}
          <button
            onClick={() => selfieInputRef.current?.click()}
            className="bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold py-2.5 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <FlipHorizontal className="w-4 h-4 text-sky-400" />
            <span className="text-[10px]">Selfie</span>
            <input
              ref={selfieInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => handleProcessFile(e.target.files?.[0])}
            />
          </button>

          {/* Chụp Camera Sau */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold py-2.5 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <Camera className="w-4 h-4 text-love-400" />
            <span className="text-[10px]">Chụp Ảnh</span>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleProcessFile(e.target.files?.[0])}
            />
          </button>

          {/* Chọn Album Ảnh */}
          <button
            onClick={() => albumInputRef.current?.click()}
            className="bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold py-2.5 rounded-xl border border-slate-700 flex flex-col items-center justify-center gap-1 transition active:scale-95"
          >
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span className="text-[10px]">Thư Viện</span>
            <input
              ref={albumInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProcessFile(e.target.files?.[0])}
            />
          </button>
        </div>

        {/* Quick Demo Sample Fallback */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Hoặc chọn ảnh mẫu:</span>
          <button
            onClick={handleRandomSample}
            className="text-love-400 hover:text-love-300 font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Đổi Mẫu Demo
          </button>
        </div>

        {/* Caption Input */}
        <input
          type="text"
          maxLength={60}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Viết một dòng caption ngắn..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-love-500 shadow-inner"
        />

        {/* Submit Button */}
        <button
          onClick={handleSend}
          disabled={compressing}
          className="w-full bg-gradient-to-r from-love-600 to-rose-500 hover:from-love-500 hover:to-rose-400 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-lg shadow-love-600/30 transition flex items-center justify-center gap-2 text-xs active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Gửi Cho Người Yêu Ngay ✨</span>
        </button>
      </div>
    </div>
  );
}
