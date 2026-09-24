import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Image as ImageIcon, Send, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';
import { sound } from '../services/audio';
import { compressImage } from '../services/compressor';

export default function LocketCamera({ isOpen, onClose, onSubmit, partnerName = 'Người Yêu' }) {
  const [facingMode, setFacingMode] = useState('user'); // 'user' (selfie) hoặc 'environment' (sau)
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [caption, setCaption] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Khởi động Camera thật khi mở modal
  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode, capturedPhoto]);

  const startCamera = async (mode) => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập camera trực tiếp');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Lỗi mở camera WebRTC:', err);
      setCameraError('Chưa cấp quyền camera hoặc thiết bị không hỗ trợ stream trực tiếp.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Đổi camera trước / sau
  const toggleFlipCamera = () => {
    sound.play('tap');
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Bấm nút chụp ảnh (Shutter) chuẩn Locket
  const handleShutter = () => {
    if (!videoRef.current) return;
    sound.play('tap');
    
    // Hiệu ứng chớp flash màn hình
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 160);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const size = Math.min(video.videoWidth || 800, video.videoHeight || 800);
    const outSize = 1080;
    
    canvas.width = outSize;
    canvas.height = outSize;
    const ctx = canvas.getContext('2d');

    // Cắt ảnh vuông 1:1 từ tâm video
    const startX = ((video.videoWidth || size) - size) / 2;
    const startY = ((video.videoHeight || size) - size) / 2;

    // Lật ngang nếu là camera trước (selfie mirror)
    if (facingMode === 'user') {
      ctx.translate(outSize, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, outSize, outSize);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  // Chọn ảnh từ thư viện
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 1080, 1080, 0.84);
        setCapturedPhoto(compressed.dataUrl);
        stopCamera();
      } catch (err) {
        alert('Không thể tải ảnh này');
      }
    }
  };

  // Chụp lại
  const handleRetake = () => {
    sound.play('tap');
    setCapturedPhoto(null);
  };

  // Gửi Locket cho người yêu
  const handleSendLocket = () => {
    if (!capturedPhoto) return;
    sound.play('kiss');
    onSubmit({
      photoUrl: capturedPhoto,
      caption: caption.trim()
    });
    setCapturedPhoto(null);
    setCaption('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between items-center select-none overflow-hidden safe-pt safe-pb p-4 sm:p-6">
      
      {/* Flash overlay animation */}
      {isFlashActive && <div className="absolute inset-0 bg-white z-[80] pointer-events-none transition-opacity duration-150" />}

      {/* Top Bar: Close, Target Recipient Pill, Flip Camera */}
      <div className="w-full max-w-sm flex items-center justify-between z-10 pt-2">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 flex items-center justify-center active:scale-90 transition shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Locket Recipient Tag */}
        <div className="px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md flex items-center gap-1.5 text-xs font-bold text-amber-300 font-display tracking-wide shadow-md">
          <span>💛 Gửi đến {partnerName}</span>
        </div>

        <button
          onClick={toggleFlipCamera}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/15 flex items-center justify-center active:scale-90 transition shadow-md"
        >
          <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Center 1:1 Square Locket Viewfinder */}
      <div className="relative w-full max-w-sm aspect-square bg-slate-950 rounded-[40px] overflow-hidden border-2 border-white/20 shadow-2xl flex items-center justify-center my-auto">
        
        {capturedPhoto ? (
          /* Khi đã chụp: Hiển thị bức ảnh đã chụp */
          <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover select-none" />
        ) : cameraError ? (
          /* Khi không mở được WebRTC stream: Fallback mở Camera gốc điện thoại */
          <div className="p-6 text-center flex flex-col items-center gap-3">
            <AlertCircle className="w-10 h-10 text-amber-400" />
            <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
            <label className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition flex items-center gap-1.5">
              <span>Mở Camera Điện Thoại</span>
              <input
                type="file"
                accept="image/*"
                capture={facingMode === 'user' ? 'user' : 'environment'}
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          </div>
        ) : (
          /* Live Stream Camera Viewfinder thật */
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-300 ${facingMode === 'user' ? '-scale-x-100' : ''}`}
          />
        )}

        {/* Locket Caption Bar (Nằm đè trực tiếp lên khung chụp) */}
        <div className="absolute bottom-4 inset-x-4 flex justify-center z-20">
          <input
            type="text"
            maxLength={60}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Gửi một tin nhắn... 💬"
            className="w-full bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full border border-white/25 text-center placeholder-white/60 focus:outline-none focus:border-amber-400 shadow-lg tracking-wide"
          />
        </div>
      </div>

      {/* Hidden canvas for snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom Shutter & Controls (Chuẩn Locket 100%) */}
      <div className="w-full max-w-sm px-6 pb-4 flex items-center justify-between z-10">
        
        {/* Nút chọn ảnh từ Album ở góc trái */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Chọn ảnh từ album"
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center active:scale-90 transition shadow-md"
        >
          <ImageIcon className="w-5 h-5 text-amber-300" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </button>

        {/* Nút Chụp / Nút Gửi Vàng Locket Trung Tâm */}
        {capturedPhoto ? (
          <button
            onClick={handleSendLocket}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold px-8 py-4 rounded-full shadow-2xl shadow-amber-400/50 active:scale-95 transition-all text-sm animate-pulse"
          >
            <Send className="w-5 h-5 fill-slate-950" />
            <span>Gửi Locket ✨</span>
          </button>
        ) : (
          /* Nút Shutter Vòng Tròn Đôi Chuẩn Locket */
          <button
            onClick={handleShutter}
            disabled={!!cameraError}
            className="w-20 h-20 rounded-full border-4 border-white p-1 flex items-center justify-center active:scale-90 transition shadow-2xl hover:scale-105 disabled:opacity-40"
          >
            <div className="w-full h-full bg-white rounded-full transition-transform active:scale-90" />
          </button>
        )}

        {/* Nút Chụp lại hoặc Đổi Camera */}
        {capturedPhoto ? (
          <button
            onClick={handleRetake}
            title="Chụp lại"
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center active:scale-90 transition shadow-md"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={toggleFlipCamera}
            title="Đổi camera"
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center active:scale-90 transition shadow-md"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

    </div>
  );
}
