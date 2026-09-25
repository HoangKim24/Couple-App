import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Image as ImageIcon, Send, Sparkles, AlertCircle, RotateCcw, Mic, Play, Square, Trash2 } from 'lucide-react';
import { sound } from '../services/audio';
import { compressImage, compressCanvasToDataUrl } from '../services/compressor';
import { VoiceRecorder } from '../services/recorder';

export default function LocketCamera({ isOpen, onClose, onSubmit, partnerName = 'Người Yêu' }) {
  const [facingMode, setFacingMode] = useState('user'); // 'user' (selfie) hoặc 'environment' (sau)
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [caption, setCaption] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isCaptionFocused, setIsCaptionFocused] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Voice Note State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [bannerError, setBannerError] = useState(null);
  const voiceRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const showBannerError = (msg) => {
    setBannerError(msg);
    setTimeout(() => setBannerError(null), 3500);
  };
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Theo dõi sự thay đổi chiều cao màn hình khi bàn phím ảo bật lên (Mobile VisualViewport)
  useEffect(() => {
    if (!window.visualViewport) return;
    const handleResize = () => {
      setViewportHeight(window.visualViewport.height);
    };
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    return () => {
      window.visualViewport.removeEventListener('resize', handleResize);
      window.visualViewport.removeEventListener('scroll', handleResize);
    };
  }, []);

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
        videoRef.current.play().catch((err) => console.log('Video play caught:', err));
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
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }
    sound.play('tap');
    
    // Hiệu ứng chớp flash màn hình
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 160);

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

    const { dataUrl } = compressCanvasToDataUrl(canvas, 250);
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
        showBannerError('Không thể xử lý ảnh này. Vui lòng thử chọn ảnh khác!');
      }
    }
  };

  // Bắt đầu ghi âm lời nhắn 5s
  const startVoiceRecording = async () => {
    try {
      sound.play('tap');
      const recorder = new VoiceRecorder();
      await recorder.start();
      voiceRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordSeconds(0);

      const startTime = Date.now();
      recordingTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordSeconds(elapsed);
        if (elapsed >= 5) {
          stopVoiceRecording();
        }
      }, 200);
    } catch (err) {
      console.warn('Microphone error:', err);
      showBannerError('Không thể mở micro. Vui lòng cấp quyền micro trên trình duyệt!');
    }
  };

  // Dừng ghi âm lời nhắn
  const stopVoiceRecording = async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (voiceRecorderRef.current) {
      try {
        const result = await voiceRecorderRef.current.stop();
        setRecordedAudio(result);
        sound.play('heart');
      } catch (e) {
        console.warn('Stop recording err:', e);
      }
      voiceRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  // Hủy ghi âm
  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (voiceRecorderRef.current) {
      voiceRecorderRef.current.cancel();
      voiceRecorderRef.current = null;
    }
    setIsRecording(false);
    setRecordedAudio(null);
  };

  // Phát thử lời nhắn vừa thu
  const togglePlayAudio = () => {
    if (!recordedAudio) return;
    if (audioPlayerRef.current) {
      if (isPlayingAudio) {
        audioPlayerRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioPlayerRef.current.currentTime = 0;
        audioPlayerRef.current.play().catch(() => {});
        setIsPlayingAudio(true);
      }
    }
  };

  // Chụp lại
  const handleRetake = () => {
    sound.play('tap');
    cancelVoiceRecording();
    setCapturedPhoto(null);
    setRecordedAudio(null);
  };

  // Gửi Locket cho người yêu
  const handleSendLocket = () => {
    if (!capturedPhoto) return;
    sound.play('kiss');
    onSubmit({
      photoUrl: capturedPhoto,
      caption: caption.trim(),
      audioUrl: recordedAudio?.audioUrl || null,
      audioDuration: recordedAudio?.duration || null
    });
    setCapturedPhoto(null);
    setCaption('');
    setRecordedAudio(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ height: `${viewportHeight}px`, maxHeight: `${viewportHeight}px` }}
      className="fixed inset-0 bg-black z-50 flex flex-col justify-between items-center select-none overflow-hidden safe-pt safe-pb p-4 sm:p-6 transition-all duration-200"
    >
      
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

      {/* Floating Error Toast */}
      {bannerError && (
        <div className="z-20 w-full max-w-sm mt-2 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs px-3.5 py-2.5 rounded-2xl backdrop-blur-xl shadow-xl flex items-center gap-2 animate-bounce">
          <span>⚠️</span>
          <span className="font-medium">{bannerError}</span>
        </div>
      )}

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
        <div className={`absolute ${isCaptionFocused ? 'bottom-2 sm:bottom-4' : 'bottom-4'} inset-x-4 flex justify-center z-20 transition-all`}>
          <input
            type="text"
            maxLength={60}
            value={caption}
            onFocus={() => setIsCaptionFocused(true)}
            onBlur={() => setIsCaptionFocused(false)}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Gửi một tin nhắn... 💬"
            className={`w-full bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full border ${
              isCaptionFocused ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-white/25'
            } text-center placeholder-white/60 focus:outline-none shadow-xl tracking-wide transition-all`}
          />
        </div>
      </div>

      {/* Hidden canvas for snapshot */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Voice Note Recording Bar (Chỉ hiển thị khi đã chụp xong ảnh để đính kèm) */}
      {capturedPhoto && (
        <div className="w-full max-w-sm px-4 flex items-center justify-center z-20 -mt-1 mb-2">
          {isRecording ? (
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-rose-950/80 border border-rose-500/60 backdrop-blur-md shadow-lg animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-200">Đang thu âm: 0:0{recordSeconds} / 0:05</span>
              <button
                onClick={stopVoiceRecording}
                className="px-2.5 py-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] active:scale-95 transition"
              >
                Xong
              </button>
            </div>
          ) : recordedAudio ? (
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/40 backdrop-blur-md shadow-lg">
              <button
                onClick={togglePlayAudio}
                className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center active:scale-90 transition shadow"
              >
                {isPlayingAudio ? (
                  <Square className="w-3 h-3 fill-slate-950" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-slate-950 translate-x-0.5" />
                )}
              </button>
              
              {/* Soundwaves visualizer */}
              <div className="flex items-center gap-0.5 h-3.5 px-1">
                {[40, 75, 100, 60, 90, 45, 80].map((h, i) => (
                  <span
                    key={i}
                    className={`w-0.5 rounded-full bg-amber-400 transition-all ${isPlayingAudio ? 'animate-pulse' : ''}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              <span className="text-[11px] font-mono text-amber-200 font-bold">0:0{recordedAudio.duration}s</span>

              <button
                onClick={() => {
                  setRecordedAudio(null);
                  if (audioPlayerRef.current) audioPlayerRef.current.pause();
                }}
                className="p-1 text-slate-400 hover:text-rose-400 transition ml-1"
                title="Xóa để thu lại"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <audio
                ref={audioPlayerRef}
                src={recordedAudio.audioUrl}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            </div>
          ) : (
            <button
              onClick={startVoiceRecording}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-amber-300 font-semibold text-xs active:scale-95 transition shadow-lg"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Ghi âm lời nhắn (5s) 🎙️</span>
            </button>
          )}
        </div>
      )}

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
